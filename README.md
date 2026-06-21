# API Academy 🛰️

An interactive, lesson-by-lesson web course that teaches you **how to build your own API** — right in the browser, by writing real Python code, with instant checking as you go.

## How to run it

No installation required. Just:

1. Unzip this folder.
2. Open `index.html` directly in your browser (Chrome/Edge/Firefox) by double-clicking it.

**Or**, if you have Python installed, running it through a local server is slightly more reliable (some browsers are picky about fonts/scripts over `file://`):

```bash
cd api-academy
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

The first load may take 5–10 seconds, because a full Python engine (Pyodide) is being downloaded into your browser. After that, everything runs instantly, and will keep working **even without an internet connection** (once Pyodide has loaded once).

## How it works

- **No backend, no API key, no daily limits.** All code execution happens inside the browser via [Pyodide](https://pyodide.org) (Python compiled to WebAssembly). So there's no rate limit or cost to checking your work — run it as many times as you like.
- Your FastAPI-style syntax (`@app.get`, `@app.post`, path/query parameters, `HTTPException`) runs through a small teaching framework called `MiniAPI`, written inside this project (see `BRIDGE_PY` at the top of `app.js`). The pattern mirrors real **FastAPI** closely, so the same syntax will work when you install the real thing.
- Your progress is saved in the browser's `localStorage`, so closing the tab and coming back picks up right where you left off.
- A light and dark theme are both built in (toggle with the 🌙/☀️ button in the top bar) — the dark theme leans into a classic engineering-blueprint look, with light linework on a deep navy background.

## Curriculum

| Route | Topic |
|---|---|
| 01 | What is an API (concept quiz) |
| 02 | Toolkit setup + testing your Python engine |
| 03 | Your first endpoint — `GET /hello` |
| 04 | Path parameters — `/items/{item_id}` |
| 05 | Query parameters & default values |
| 06 | Creating data with POST |
| 07 | Generating API keys and securing an endpoint |
| 08 | **Capstone:** a complete Notes API — everything combined |

Each coding lesson follows the same shape: a concept explanation → an example → an editable code editor → a "Check" button that runs your code against real tests → a hint if something fails.

## `bonus/` folder — a real FastAPI project

This web course is a teaching simulation (so you can learn without installing anything). Once you finish the capstone, `bonus/main.py` contains the exact same Notes API, but written with **actual FastAPI**, ready to run on your own machine:

```bash
cd bonus
pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload
```

Then open `http://127.0.0.1:8000/docs` in your browser — FastAPI automatically generates an interactive testing page (Swagger UI) where you can try your endpoints live. This is the moment your API runs in the real world.

## Quick reference: generating an API key

```python
import secrets

API_KEY = secrets.token_hex(16)   # a safe, random, 32-character key
```

Whoever calls your API sends this key in an `x-api-key` header, and your server verifies that header on each request (the full hands-on walkthrough is in Route 07).

## Project structure

```
api-academy/
├── index.html        ← entry point, open this one
├── style.css           ← visual design (blueprint theme, light + dark)
├── lessons.js           ← all lesson content, explanations, tests
├── app.js                ← app logic + Python bridge (Pyodide)
└── bonus/
    ├── main.py              ← real, runnable FastAPI version
    └── requirements.txt
```

## Version History

| Version | Changes |
|---|---|
| **v1** | Initial release. Light "blueprint paper" theme only. All 8 lessons (concept quiz through the Notes API capstone), in-browser Python checking via Pyodide, and the `bonus/` real FastAPI starter. README in Hinglish. |
| **v2** | Added a light/dark theme toggle (🌙/☀️ button in the top bar). Dark mode uses a classic engineering-blueprint cyanotype look — light linework on deep navy — and the choice is remembered via `localStorage`. README translated to English. Fixed the client/server diagram's arrowheads, which were misaligned (pointing the wrong way near the client, and sitting at the wrong position near the server). |

## Resetting progress

Use the "↺ Reset progress" button at the bottom of the sidebar to start over from scratch at any time.

---

Have fun building it, and even more fun learning from it. Happy shipping 🚀
