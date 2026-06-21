// =========================================================
// API ACADEMY — App Logic
// =========================================================

// ---- The Python "MiniAPI" framework + test bridge, runs once in Pyodide ----
const BRIDGE_PY = `
import json, secrets, inspect, io, contextlib

class HTTPException(Exception):
    def __init__(self, status_code, detail=""):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)

class MiniAPI:
    def __init__(self):
        self.routes = {}

    def get(self, path):
        return self._reg("GET", path)

    def post(self, path):
        return self._reg("POST", path)

    def _reg(self, method, path):
        def deco(fn):
            self.routes[(method, path)] = fn
            return fn
        return deco

    def handle(self, method, path, kwargs=None, headers=None):
        kwargs = kwargs or {}
        headers = {str(k).lower(): v for k, v in (headers or {}).items()}
        for (m, template), fn in self.routes.items():
            if m != method:
                continue
            params = _match_path(template, path)
            if params is None:
                continue
            sig = inspect.signature(fn)
            call_args = {}
            for name, p in sig.parameters.items():
                if name in params:
                    val = params[name]
                    if p.annotation is int:
                        try:
                            val = int(val)
                        except Exception:
                            pass
                    call_args[name] = val
                elif name in kwargs:
                    call_args[name] = kwargs[name]
                else:
                    header_key = name.replace("_", "-")
                    if header_key in headers:
                        call_args[name] = headers[header_key]
                    elif p.default is not inspect._empty:
                        call_args[name] = p.default
            try:
                result = fn(**call_args)
                if result is None:
                    return {"status": 500, "body": {"detail": "Function ne kuch return nahi kiya (None mila). Kya tum 'pass' bhool ke chhod diya?"}}
                return {"status": 200, "body": result}
            except HTTPException as e:
                return {"status": e.status_code, "body": {"detail": e.detail}}
            except TypeError as e:
                return {"status": 500, "body": {"detail": "Function call error: " + str(e)}}
            except Exception as e:
                return {"status": 500, "body": {"detail": "Server error: " + str(e)}}
        return {"status": 404, "body": {"detail": "Not Found"}}

def _match_path(template, path):
    t_parts = [s for s in template.strip("/").split("/")]
    p_parts = [s for s in path.strip("/").split("/")]
    if len(t_parts) != len(p_parts):
        return None
    out = {}
    for t, p in zip(t_parts, p_parts):
        if t.startswith("{") and t.endswith("}"):
            out[t[1:-1]] = p
        elif t != p:
            return None
    return out

_runs = {}

def _capture_stdout_run(run_id, user_code):
    buf = io.StringIO()
    ns = {"MiniAPI": MiniAPI, "HTTPException": HTTPException, "secrets": secrets}
    try:
        with contextlib.redirect_stdout(buf):
            exec(user_code, ns)
        _runs[run_id] = ns
        ok = True
        err = None
    except Exception as e:
        ok = False
        err = f"{type(e).__name__}: {e}"
    return json.dumps({"ok": ok, "stdout": buf.getvalue(), "error": err})

def _call(run_id, method, path, kwargs_json, headers_json):
    ns = _runs.get(run_id)
    if ns is None or "app" not in ns:
        return json.dumps({"status": 0, "body": {"detail": "Variable 'app' nahi mila — kya tumne app = MiniAPI() likha?"}})
    kwargs = json.loads(kwargs_json)
    headers = json.loads(headers_json)
    res = ns["app"].handle(method, path, kwargs=kwargs, headers=headers)
    return json.dumps(res)

def _get_global(run_id, name):
    ns = _runs.get(run_id)
    if ns is None or name not in ns:
        return json.dumps(None)
    val = ns.get(name)
    try:
        json.dumps(val)
        return json.dumps(val)
    except Exception:
        return json.dumps(str(val))
`;

// ---- Global state ----
let pyodide = null;
let editor = null;
let currentIndex = 0;
let progress = loadProgress();
let quizState = {}; // per-lesson quiz answer tracking

function loadProgress() {
  try {
    const raw = localStorage.getItem("apiAcademyProgress");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { completed: {} };
}
function saveProgress() {
  localStorage.setItem("apiAcademyProgress", JSON.stringify(progress));
}
function isUnlocked(i) {
  if (i === 0) return true;
  return !!progress.completed[LESSONS[i - 1].id];
}
function isDone(i) {
  return !!progress.completed[LESSONS[i].id];
}

// ---- Theme toggle ----
function initTheme() {
  const btn = document.getElementById("theme-toggle");
  const apply = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? "Light theme pe switch karo" : "Dark theme pe switch karo";
  };
  apply(document.documentElement.getAttribute("data-theme") || "light");
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("apiAcademyTheme", next);
    apply(next);
  });
}

// ---- Boot ----
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderSidebar();
  selectLesson(firstUnfinishedIndex());
  initPyodide();
  document.getElementById("reset-progress-btn").addEventListener("click", () => {
    if (confirm("Pakka? Saari progress reset ho jaayegi.")) {
      localStorage.removeItem("apiAcademyProgress");
      progress = { completed: {} };
      saveProgress();
      renderSidebar();
      selectLesson(0);
    }
  });
});

function firstUnfinishedIndex() {
  for (let i = 0; i < LESSONS.length; i++) {
    if (!isDone(i)) return i;
  }
  return LESSONS.length - 1;
}

async function initPyodide() {
  const statusEl = document.getElementById("pyodide-status");
  statusEl.textContent = "Python engine load ho raha hai…";
  try {
    pyodide = await loadPyodide();
    await pyodide.runPythonAsync(BRIDGE_PY);
    statusEl.textContent = "Engine ready ✓";
    statusEl.classList.add("ready");
    document.querySelectorAll(".run-btn").forEach((b) => (b.disabled = false));
  } catch (e) {
    statusEl.textContent = "Engine load nahi ho paaya. Page refresh karke try karo.";
    console.error(e);
  }
}

// ---- Sidebar / progress bar ----
function renderSidebar() {
  const nav = document.getElementById("sidebar-routes");
  nav.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const unlocked = isUnlocked(i);
    const done = isDone(i);
    const item = document.createElement("button");
    item.className =
      "route-item" + (done ? " is-done" : "") + (!unlocked ? " is-locked" : "") + (i === currentIndex ? " is-current" : "");
    item.disabled = !unlocked;
    item.innerHTML = `
      <span class="route-num">${done ? "✓" : String(lesson.number).padStart(2, "0")}</span>
      <span class="route-label">
        <span class="route-track">${lesson.track}</span>
        <span class="route-title">${lesson.title}</span>
      </span>
      ${!unlocked ? '<span class="route-lock">🔒</span>' : ""}
    `;
    item.addEventListener("click", () => unlocked && selectLesson(i));
    nav.appendChild(item);
  });

  const doneCount = LESSONS.filter((_, i) => isDone(i)).length;
  document.getElementById("progress-fill").style.width = `${(doneCount / LESSONS.length) * 100}%`;
  document.getElementById("progress-text").textContent = `${doneCount} / ${LESSONS.length} routes complete`;
}

// ---- Lesson rendering ----
function selectLesson(i) {
  currentIndex = i;
  renderSidebar();
  const lesson = LESSONS[i];

  document.getElementById("lesson-track").textContent = lesson.track;
  document.getElementById("lesson-title").textContent = lesson.title;
  document.getElementById("lesson-subtitle").textContent = lesson.subtitle;

  const expEl = document.getElementById("explanation-content");
  expEl.innerHTML = lesson.explanation.map((p) => `<p>${inlineCode(p)}</p>`).join("");

  const diagramEl = document.getElementById("diagram-container");
  diagramEl.innerHTML = lesson.diagram ? clientServerDiagram() : "";
  diagramEl.style.display = lesson.diagram ? "block" : "none";

  const setupEl = document.getElementById("setup-checklist");
  if (lesson.setupChecklist) {
    setupEl.style.display = "block";
    setupEl.innerHTML =
      '<div class="checklist-title">TERMINAL CHECKLIST</div>' +
      lesson.setupChecklist.map((s) => `<div class="checklist-item"><span class="chk">▸</span>${inlineCode(s)}</div>`).join("");
  } else {
    setupEl.style.display = "none";
    setupEl.innerHTML = "";
  }

  const quizContainer = document.getElementById("quiz-container");
  const codeContainer = document.getElementById("code-section");

  if (lesson.type === "quiz") {
    quizContainer.style.display = "block";
    codeContainer.style.display = "none";
    renderQuiz(lesson);
  } else {
    quizContainer.style.display = "none";
    codeContainer.style.display = "block";
    renderCodeLesson(lesson);
  }

  document.getElementById("continue-btn").style.display = isDone(i) && i < LESSONS.length - 1 ? "inline-flex" : "none";
  document.getElementById("completion-banner").style.display = "none";
  if (isDone(i)) {
    showSuccess(lesson, true);
  }
}

function inlineCode(text) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
}

function clientServerDiagram() {
  return `
  <svg viewBox="0 0 560 120" class="flow-diagram" role="img" aria-label="Client request server response diagram">
    <rect x="10" y="35" width="110" height="50" rx="6" class="diag-box diag-client"/>
    <text x="65" y="65" class="diag-label">CLIENT</text>
    <rect x="225" y="20" width="110" height="80" rx="6" class="diag-box diag-endpoint"/>
    <text x="280" y="55" class="diag-label">/endpoint</text>
    <text x="280" y="75" class="diag-sublabel">API</text>
    <rect x="440" y="35" width="110" height="50" rx="6" class="diag-box diag-server"/>
    <text x="495" y="65" class="diag-label">SERVER</text>
    <line x1="120" y1="50" x2="223" y2="50" class="diag-arrow"/>
    <text x="170" y="40" class="diag-arrow-label">request</text>
    <line x1="335" y1="70" x2="438" y2="70" class="diag-arrow"/>
    <line x1="438" y1="85" x2="335" y2="85" class="diag-arrow diag-arrow-back"/>
    <line x1="223" y1="65" x2="120" y2="65" class="diag-arrow diag-arrow-back"/>
    <text x="170" y="100" class="diag-arrow-label">response (JSON)</text>
    <polygon points="223,46 213,50 223,54" class="diag-arrowhead"/>
    <polygon points="120,61 130,65 120,69" class="diag-arrowhead"/>
    <polygon points="335,66 345,70 335,74" class="diag-arrowhead"/>
    <polygon points="438,81 428,85 438,89" class="diag-arrowhead"/>
  </svg>`;
}

// ---- Quiz lessons ----
function renderQuiz(lesson) {
  if (!quizState[lesson.id]) {
    quizState[lesson.id] = lesson.quiz.map(() => ({ solved: false }));
  }
  const state = quizState[lesson.id];
  const container = document.getElementById("quiz-container");
  container.innerHTML = lesson.quiz
    .map(
      (q, qi) => `
    <div class="quiz-card" data-qi="${qi}">
      <div class="quiz-q">${qi + 1}. ${inlineCode(q.q)}</div>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${inlineCode(opt)}</button>`
          )
          .join("")}
      </div>
      <div class="quiz-feedback" data-qi="${qi}"></div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".quiz-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qi = Number(btn.dataset.qi);
      const oi = Number(btn.dataset.oi);
      const q = lesson.quiz[qi];
      const card = container.querySelector(`.quiz-card[data-qi="${qi}"]`);
      const feedback = container.querySelector(`.quiz-feedback[data-qi="${qi}"]`);
      if (state[qi].solved) return;
      if (oi === q.correct) {
        state[qi].solved = true;
        card.classList.add("quiz-solved");
        card.querySelectorAll(".quiz-opt")[oi].classList.add("quiz-correct");
        feedback.innerHTML = `<span class="feedback-ok">✓ Sahi!</span> ${inlineCode(q.why)}`;
        checkQuizComplete(lesson);
      } else {
        card.querySelectorAll(".quiz-opt")[oi].classList.add("quiz-wrong");
        feedback.innerHTML = `<span class="feedback-bad">Thoda aur socho…</span>`;
        setTimeout(() => card.querySelectorAll(".quiz-opt")[oi].classList.remove("quiz-wrong"), 700);
      }
    });
  });
}

function checkQuizComplete(lesson) {
  const state = quizState[lesson.id];
  if (state.every((s) => s.solved)) {
    completeLesson(lesson);
  }
}

// ---- Code lessons ----
function renderCodeLesson(lesson) {
  document.getElementById("example-block").innerHTML = highlightPy(lesson.example.code);
  document.getElementById("example-caption").textContent = lesson.example.caption || "";

  const editorHost = document.getElementById("editor-host");
  editorHost.innerHTML = "";
  editor = CodeMirror(editorHost, {
    value: lesson.starter,
    mode: "python",
    theme: "apiacademy",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    viewportMargin: Infinity
  });

  document.getElementById("console-log").innerHTML = '<div class="console-hint">Code likho, fir "Check karo" dabao →</div>';
  document.getElementById("hint-box").style.display = "none";
  document.getElementById("hint-box").textContent = "";
  resetPacket();

  const runBtn = document.getElementById("run-btn");
  runBtn.disabled = !pyodide;
  runBtn.onclick = () => runCheck(lesson);
}

function highlightPy(code) {
  const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const kw = /\b(def|return|if|else|elif|import|from|class|raise|pass|for|in|while|try|except|None|True|False|and|or|not)\b/g;
  return escaped
    .split("\n")
    .map((line) => {
      let l = line.replace(/(#.*$)/, '<span class="tok-com">$1</span>');
      l = l.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="tok-str">$1</span>');
      l = l.replace(kw, '<span class="tok-kw">$1</span>');
      return l;
    })
    .join("\n");
}

function resetPacket() {
  const p = document.getElementById("packet");
  if (p) p.classList.remove("traveling", "traveling-fail");
}

function logLine(text, cls) {
  const log = document.getElementById("console-log");
  const line = document.createElement("div");
  line.className = "console-line" + (cls ? " " + cls : "");
  line.innerHTML = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

async function runCheck(lesson) {
  if (!pyodide) return;
  const runBtn = document.getElementById("run-btn");
  runBtn.disabled = true;
  document.getElementById("console-log").innerHTML = "";
  document.getElementById("hint-box").style.display = "none";
  const packet = document.getElementById("packet");
  packet.classList.add("traveling");

  const code = editor.getValue();
  const runId = "run_" + Date.now() + "_" + Math.floor(Math.random() * 9999);

  logLine("▸ Code bhej rahe hain Python engine ko…", "console-dim");

  pyodide.globals.set("_user_code", code);
  pyodide.globals.set("_run_id", runId);
  let execOut;
  try {
    execOut = await pyodide.runPythonAsync("_capture_stdout_run(_run_id, _user_code)");
  } catch (e) {
    execOut = JSON.stringify({ ok: false, stdout: "", error: String(e) });
  }
  const exec = JSON.parse(execOut);

  if (exec.stdout && exec.stdout.trim()) {
    logLine(escapeHtml(exec.stdout.trim()), "console-stdout");
  }

  if (!exec.ok) {
    packet.classList.remove("traveling");
    packet.classList.add("traveling-fail");
    logLine("✗ Code chalne mein error aaya:", "console-fail");
    logLine(escapeHtml(exec.error || "Unknown error"), "console-fail-detail");
    showHint(lesson, "Pehle error fix karo, fir tests chalenge.");
    runBtn.disabled = false;
    return;
  }

  let allPass = true;
  let firstFailHint = null;

  for (const test of lesson.tests || []) {
    if (test.kind === "stdout-not-empty") {
      const pass = test.validate(exec);
      logLine((pass ? "✓ " : "✗ ") + escapeHtml(test.description), pass ? "console-pass" : "console-fail");
      if (!pass) {
        allPass = false;
        firstFailHint = firstFailHint || test.hint;
      }
      continue;
    }

    if (test.kind === "global-check") {
      pyodide.globals.set("_g_run_id", runId);
      pyodide.globals.set("_g_name", test.globalName);
      const gOut = await pyodide.runPythonAsync("_get_global(_g_run_id, _g_name)");
      const gVal = JSON.parse(gOut);
      const pass = test.validate(gVal);
      logLine((pass ? "✓ " : "✗ ") + escapeHtml(test.description), pass ? "console-pass" : "console-fail");
      if (!pass) {
        allPass = false;
        firstFailHint = firstFailHint || test.hint;
      }
      continue;
    }

    // normal call test, possibly needs a header pulled from a global (e.g. the learner's own API key)
    let headers = Object.assign({}, test.call.headers || {});
    if (test.useGlobalAsHeader) {
      pyodide.globals.set("_g_run_id", runId);
      pyodide.globals.set("_g_name", test.useGlobalAsHeader.globalName);
      const gOut = await pyodide.runPythonAsync("_get_global(_g_run_id, _g_name)");
      const gVal = JSON.parse(gOut);
      headers[test.useGlobalAsHeader.headerName] = gVal;
    }

    pyodide.globals.set("_c_run_id", runId);
    pyodide.globals.set("_c_method", test.call.method);
    pyodide.globals.set("_c_path", test.call.path);
    pyodide.globals.set("_c_kwargs_json", JSON.stringify(test.call.kwargs || {}));
    pyodide.globals.set("_c_headers_json", JSON.stringify(headers));
    let resultJson;
    try {
      resultJson = await pyodide.runPythonAsync("_call(_c_run_id, _c_method, _c_path, _c_kwargs_json, _c_headers_json)");
    } catch (e) {
      resultJson = JSON.stringify({ status: 0, body: { detail: String(e) } });
    }
    const result = JSON.parse(resultJson);
    const pass = test.validate(result);
    logLine((pass ? "✓ " : "✗ ") + escapeHtml(test.description), pass ? "console-pass" : "console-fail");
    if (!pass) {
      logLine(`&nbsp;&nbsp;↳ mila: status ${result.status}, body ${escapeHtml(JSON.stringify(result.body))}`, "console-dim");
      allPass = false;
      firstFailHint = firstFailHint || test.hint;
    }
  }

  packet.classList.remove("traveling");
  runBtn.disabled = false;

  if (allPass) {
    packet.classList.remove("traveling-fail");
    completeLesson(lesson);
  } else {
    packet.classList.add("traveling-fail");
    showHint(lesson, firstFailHint);
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showHint(lesson, text) {
  const box = document.getElementById("hint-box");
  box.style.display = "block";
  box.innerHTML = `<span class="hint-label">HINT</span> ${inlineCode(text || "Code dobara dekho.")}`;
}

function completeLesson(lesson) {
  progress.completed[lesson.id] = true;
  saveProgress();
  renderSidebar();
  showSuccess(lesson, false);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  document.getElementById("continue-btn").style.display = idx < LESSONS.length - 1 ? "inline-flex" : "none";
}

function showSuccess(lesson, silent) {
  const banner = document.getElementById("completion-banner");
  banner.style.display = "flex";
  const isCapstone = lesson.id === "capstone";
  banner.innerHTML = `
    <div class="completion-icon">${isCapstone ? "🏁" : "✓"}</div>
    <div class="completion-text">${inlineCode(lesson.successMessage || "Lesson complete!")}</div>
  `;
  if (isCapstone && !silent) {
    banner.innerHTML += `<div class="completion-next">Agla kadam: ye exact code real FastAPI mein chalao — README.md ke "bonus" folder mein starter project hai. <code>pip install fastapi uvicorn</code> aur <code>uvicorn main:app --reload</code>.</div>`;
  }
  if (!silent) {
    logLine("");
    logLine("★ Lesson complete!", "console-pass-big");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("continue-btn").addEventListener("click", () => {
    if (currentIndex < LESSONS.length - 1) selectLesson(currentIndex + 1);
  });
});
