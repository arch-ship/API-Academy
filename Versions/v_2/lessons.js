// =========================================================
// API ACADEMY — Lesson Data
// Har lesson: ek "route" hai jo seekhne ke safar mein ek station hai.
// type: 'quiz' (concept check) ya 'code' (live Pyodide check)
// =========================================================

const LESSONS = [
  // ---------------------------------------------------------
  {
    id: "what-is-api",
    number: 1,
    track: "ROUTE 01",
    title: "API Hota Kya Hai?",
    subtitle: "Client, request, response — poora safar samjho",
    type: "quiz",
    explanation: [
      "API (Application Programming Interface) ek tareeka hai jisse do alag systems aapas mein baat kar paate hain — bina ek dusre ka poora internal code dekhe.",
      "Jab tum koi weather app kholte ho, app khud temperature 'nahi janta'. Woh ek request bhejta hai kisi weather server ke API ko, aur jawab mein structured data (usually JSON) wapas milta hai.",
      "Is poore safar mein teen cheezein important hain: Client (jo request bhejta hai), Endpoint (woh specific address jahan request jaati hai, jaise /weather), aur Server (jo request samajh kar response banata hai).",
      "Tum is poore course mein khud ek chhota server banaoge — jo requests sunega aur sahi response wapas bhejega."
    ],
    diagram: true,
    quiz: [
      {
        q: "Tum ek weather app khol rahe ho jo turant aaj ka temperature dikhata hai. Ye data kahaan se aata hai?",
        options: [
          "App developer roz manually update karta hai",
          "App ek weather service ke API ko call karke live data leta hai",
          "Phone ka built-in sensor temperature measure karta hai",
          "Ek random number generate hota hai"
        ],
        correct: 1,
        why: "Bilkul sahi — app backend mein kisi weather API ko request bhejta hai aur live data leke aata hai."
      },
      {
        q: "Jab tum API ko GET /weather jaisi request bhejte ho, wapas usually kya milta hai?",
        options: [
          "Ek poori website ka HTML",
          "Structured data (jaise JSON) jo app easily use kar sake",
          "Ek PDF file",
          "Kuch nahi, sirf ek confirmation message"
        ],
        correct: 1,
        why: "Sahi — APIs mostly JSON jaisa structured data dete hain, jisse app code mein use karna easy hota hai."
      },
      {
        q: "'Endpoint' kisko kehte hain?",
        options: [
          "Jab internet connection khatam ho jaaye",
          "API ka woh specific address jahan ek particular kaam ke liye request bheji jaati hai",
          "Server ka physical location",
          "Database ka naam"
        ],
        correct: 1,
        why: "Bilkul — endpoint ek specific URL path hota hai, jaise /weather ya /users/5, jo ek particular kaam handle karta hai."
      }
    ]
  },

  // ---------------------------------------------------------
  {
    id: "setup",
    number: 2,
    track: "ROUTE 02",
    title: "Toolkit Taiyaar Karo",
    subtitle: "Python engine on karo, pehla code chalao",
    type: "code",
    explanation: [
      "Real duniya mein, apna FastAPI server chalane ke liye tumhe apne computer pe ye cheezein chahiye: Python 3.9+, aur do packages — fastapi aur uvicorn (jo server ko actually run karta hai).",
      "Terminal mein ye commands chalani hoti hain: pip install fastapi uvicorn — bas itna hi. Iske baad tumhari file ko uvicorn se start kar diya jaata hai.",
      "Is web-course mein hum Python seedha tumhare browser ke andar chalayenge (Pyodide ki madad se) — taaki bina kuch install kiye tum practice kar sako. Lekin syntax bilkul wahi hoga jo real FastAPI mein likhte ho.",
      "Niche apna engine test karo — ek simple Python statement likho taaki confirm ho jaaye sab chal raha hai."
    ],
    setupChecklist: [
      "Python 3.9 ya usse naya version computer pe install karo (python.org se)",
      "Terminal khol kar likho: pip install fastapi uvicorn",
      "Ek file banao: main.py",
      "Server chalane ke liye: uvicorn main:app --reload"
    ],
    example: {
      code: `# Ye real terminal commands hain (yahin practice nahi karni):\n# pip install fastapi uvicorn\n# uvicorn main:app --reload\n\nprint("Setup samajh aa gaya!")`,
      caption: "Real computer pe ye commands chalani hoti hain"
    },
    starter: `# TODO: ek variable 'greeting' banao jisme tumhara naam ho,\n# jaise: greeting = "Main Rohan hoon, aur main APIs seekh raha hoon!"\n# fir use print() se dikhao.\n\ngreeting = "TODO"\nprint(greeting)`,
    tests: [
      {
        description: "Engine check: kya tumne greeting print kiya?",
        kind: "stdout-not-empty",
        validate: (run) => run.stdout && run.stdout.trim().length > 5 && !run.stdout.includes("TODO"),
        hint: "greeting variable mein apna naam likho aur print(greeting) call karo."
      }
    ],
    successMessage: "Python engine ready hai! Ab asli endpoints banate hain."
  },

  // ---------------------------------------------------------
  {
    id: "first-endpoint",
    number: 3,
    track: "ROUTE 03",
    title: "Pehla Endpoint Banao",
    subtitle: "GET /hello — tumhara server jeevit ho gaya",
    type: "code",
    explanation: [
      "Har FastAPI app ek 'app' object se shuru hoti hai: app = FastAPI(). Hum yahaan MiniAPI() use kar rahe hain, jo bilkul wahi pattern follow karta hai.",
      "Ek endpoint banane ke liye, ek function ke upar @app.get(\"/path\") decorator lagate hain. Jab koi us path pe GET request bheje, ye function chalता hai aur jo bhi dictionary return karega, woh JSON ban kar wapas chala jaayega.",
      "Niche apna pehla endpoint complete karo — /hello path pe ek friendly message wapas bhejo."
    ],
    example: {
      code: `app = MiniAPI()\n\n@app.get("/status")\ndef get_status():\n    return {"status": "running", "version": 1}`,
      caption: "Ek example endpoint — /status"
    },
    starter: `app = MiniAPI()\n\n# TODO: GET /hello route banao jo ek dictionary return kare\n# jisme "message" key ho aur uski value mein "hello" word ho\n@app.get("/hello")\ndef say_hello():\n    pass  # ise fix karo`,
    tests: [
      {
        description: "GET /hello call kar rahe hain...",
        call: { method: "GET", path: "/hello", kwargs: {}, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          res.body &&
          typeof res.body.message === "string" &&
          res.body.message.toLowerCase().includes("hello"),
        hint: "Function se ek dict return karo jisme 'message' key ho, aur value mein 'hello' word zaroor ho (kisi bhi case mein)."
      }
    ],
    successMessage: "Tumhara pehla endpoint live hai! Request gayi, response aaya."
  },

  // ---------------------------------------------------------
  {
    id: "path-params",
    number: 4,
    track: "ROUTE 04",
    title: "Path Parameters",
    subtitle: "/items/{item_id} — dynamic URLs banao",
    type: "code",
    explanation: [
      "Real APIs mein zyada tar URLs fixed nahi hote. Jaise /items/5 ya /items/42 — yahaan '5' aur '42' ek path parameter hai, jo curly braces se define hota hai: /items/{item_id}.",
      "Function mein bas us naam ka parameter add karo (item_id), aur FastAPI (yahaan MiniAPI) automatically URL se value nikaal kar function ko de dega.",
      "Type hint lagana acchi practice hai — agar tum item_id: int likhoge, to value automatically number mein convert ho jaayegi."
    ],
    example: {
      code: `@app.get("/users/{user_id}")\ndef get_user(user_id: int):\n    return {"user_id": user_id, "name": f"User {user_id}"}`,
      caption: "/users/7 call karne par user_id = 7 milta hai"
    },
    starter: `app = MiniAPI()\n\n# TODO: GET /items/{item_id} route banao\n# jo {"item_id": <id>, "name": f"Item {<id>}"} return kare\n@app.get("/items/{item_id}")\ndef get_item():\n    pass  # parameter add karke fix karo`,
    tests: [
      {
        description: "GET /items/7 call kar rahe hain...",
        call: { method: "GET", path: "/items/7", kwargs: {}, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          res.body &&
          String(res.body.item_id) === "7" &&
          typeof res.body.name === "string" &&
          res.body.name.includes("7"),
        hint: "Function signature mein item_id parameter add karo, aur use response mein use karo. Type hint int laga sakte ho."
      },
      {
        description: "GET /items/42 call kar rahe hain...",
        call: { method: "GET", path: "/items/42", kwargs: {}, headers: {} },
        validate: (res) => res.status === 200 && String(res.body.item_id) === "42",
        hint: "Same route alag-alag IDs ke saath kaam karna chahiye."
      }
    ],
    successMessage: "Dynamic routing samajh aa gaya — ek route, anant possibilities."
  },

  // ---------------------------------------------------------
  {
    id: "query-params",
    number: 5,
    track: "ROUTE 05",
    title: "Query Parameters & Defaults",
    subtitle: "?limit=5 jaisi optional settings",
    type: "code",
    explanation: [
      "Query parameters URL ke end mein ? ke baad aate hain, jaise /search?limit=5. Ye optional hote hain — agar user na bheje, to default value use hoti hai.",
      "FastAPI mein bas function parameter ko ek default value de do: def search(limit: int = 10). Agar limit nahi bheja gaya, 10 use hoga.",
      "Is lesson mein hum query params ko seedhe function arguments ki tarah treat kar rahe hain — jo bilkul real FastAPI jaisa hi feel hota hai."
    ],
    example: {
      code: `@app.get("/search")\ndef search(keyword: str = "all", limit: int = 10):\n    return {"keyword": keyword, "limit": limit}`,
      caption: "Default values = optional query params"
    },
    starter: `app = MiniAPI()\n\n# TODO: GET /products route banao\n# query params: category (default "all"), limit (default 5)\n# return: {"category": ..., "limit": ...}\n@app.get("/products")\ndef list_products():\n    pass`,
    tests: [
      {
        description: "Bina kisi param ke GET /products call kar rahe hain (defaults check)...",
        call: { method: "GET", path: "/products", kwargs: {}, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          res.body &&
          String(res.body.category).toLowerCase() === "all" &&
          Number(res.body.limit) === 5,
        hint: "category ka default 'all' aur limit ka default 5 hona chahiye."
      },
      {
        description: "GET /products?category=shoes&limit=2 call kar rahe hain...",
        call: { method: "GET", path: "/products", kwargs: { category: "shoes", limit: 2 }, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          String(res.body.category) === "shoes" &&
          Number(res.body.limit) === 2,
        hint: "Jab values bheji jaayein, unhe defaults ke bajaye use karna chahiye."
      }
    ],
    successMessage: "Ab tumhara endpoint flexible hai — defaults bhi, customization bhi."
  },

  // ---------------------------------------------------------
  {
    id: "post-body",
    number: 6,
    track: "ROUTE 06",
    title: "POST se Data Bhejna",
    subtitle: "Naya data create karna seekho",
    type: "code",
    explanation: [
      "GET sirf data padhne ke liye hota hai. Jab kuch naya banana ho (jaise ek note, ek user), tab POST use karte hain — request ke saath ek 'body' bheja jaata hai jisme actual data hota hai.",
      "Real FastAPI mein body ke liye Pydantic models use hote hain. Hum yahaan simplicity ke liye function arguments hi use karenge — jo POST body ke fields ki tarah inject ho jaate hain.",
      "Niche ek route banao jo naam aur price leke ek 'created' confirmation wapas kare."
    ],
    example: {
      code: `@app.post("/users")\ndef create_user(name: str, age: int = 18):\n    return {"created": True, "name": name, "age": age}`,
      caption: "POST se naya user create karna"
    },
    starter: `app = MiniAPI()\n\n# TODO: POST /items route banao\n# input: name (str), price (float)\n# return: {"created": True, "name": ..., "price": ...}\n@app.post("/items")\ndef create_item():\n    pass`,
    tests: [
      {
        description: "POST /items {name: 'Pen', price: 10} bhej rahe hain...",
        call: { method: "POST", path: "/items", kwargs: { name: "Pen", price: 10 }, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          res.body &&
          res.body.created === true &&
          res.body.name === "Pen" &&
          Number(res.body.price) === 10,
        hint: "Response mein created: true, aur bheja gaya name/price wapas dena chahiye."
      }
    ],
    successMessage: "Tumhara server ab naya data accept kar sakta hai!"
  },

  // ---------------------------------------------------------
  {
    id: "api-keys",
    number: 7,
    track: "ROUTE 07",
    title: "API Keys: Apna Data Secure Karo",
    subtitle: "Generate karo, check karo, protect karo",
    type: "code",
    explanation: [
      "Abhi tak koi bhi tumhare endpoints call kar sakta hai. API key ek secret string hoti hai jo prove karti hai 'ye request authorized hai'.",
      "Key generate karne ka safe tareeka: Python ke secrets module se — secrets.token_hex(16). Ye ek random, guess-na-ho-sakne-waali string deta hai.",
      "Request bhejne waala ye key ek header mein bhejta hai, usually x-api-key: <key>. Server us header ko check karta hai — match nahi hua to 401 Unauthorized wapas bhejo.",
      "FastAPI mein header read karne ke liye function parameter ka naam header se match karta hai (dash → underscore). Hum yahaan bhi wahi pattern use kar rahe hain: x_api_key parameter automatically 'x-api-key' header se value uthayega."
    ],
    example: {
      code: `import secrets\n\nADMIN_KEY = secrets.token_hex(8)\n\n@app.get("/admin")\ndef admin_panel(x_api_key: str = None):\n    if x_api_key != ADMIN_KEY:\n        raise HTTPException(status_code=401, detail="Galat ya missing API key")\n    return {"panel": "welcome admin"}`,
      caption: "Header se key padh kar verify karna"
    },
    starter: `import secrets\n\n# TODO 1: Apni khud ki secret key generate karo (kam se kam 16 hex chars)\nAPI_KEY = "TODO"\n\napp = MiniAPI()\n\n@app.get("/secret-data")\ndef get_secret_data(x_api_key: str = None):\n    # TODO 2: Agar x_api_key, API_KEY se match nahi karta, to\n    #         HTTPException(status_code=401, detail="...") raise karo\n    # TODO 3: Match hone par koi bhi secret data dictionary return karo\n    pass`,
    tests: [
      {
        kind: "global-check",
        description: "Kya tumne ek asli random API_KEY generate ki?",
        globalName: "API_KEY",
        validate: (val) => typeof val === "string" && val !== "TODO" && val.length >= 8,
        hint: "secrets.token_hex(16) use karke API_KEY assign karo — placeholder 'TODO' mat rehne do."
      },
      {
        description: "Sahi API key ke saath GET /secret-data call kar rahe hain...",
        useGlobalAsHeader: { globalName: "API_KEY", headerName: "x-api-key" },
        call: { method: "GET", path: "/secret-data", kwargs: {}, headers: {} },
        validate: (res) => res.status === 200 && res.body && typeof res.body === "object" && !res.body.detail,
        hint: "Jab sahi key bheji jaaye, status 200 ke saath data milna chahiye."
      },
      {
        description: "Galat API key ke saath GET /secret-data call kar rahe hain...",
        call: { method: "GET", path: "/secret-data", kwargs: {}, headers: { "x-api-key": "wrong-key-12345" } },
        validate: (res) => res.status === 401 || res.status === 403,
        hint: "Galat key par 401 (ya 403) status wapas jaana chahiye, data nahi."
      },
      {
        description: "Bina kisi key ke GET /secret-data call kar rahe hain...",
        call: { method: "GET", path: "/secret-data", kwargs: {}, headers: {} },
        validate: (res) => res.status === 401 || res.status === 403,
        hint: "Key missing hone par bhi access deny hona chahiye."
      }
    ],
    successMessage: "Tumhara endpoint ab secure hai — sirf sahi key waale hi andar aa sakte hain."
  },

  // ---------------------------------------------------------
  {
    id: "capstone",
    number: 8,
    track: "ROUTE 08 · FINAL",
    title: "Capstone: Notes API",
    subtitle: "Sab kuch ek saath — tumhara pehla real project",
    type: "code",
    explanation: [
      "Ab tak jo bhi seekha — endpoints, path params, POST, aur API keys — sab ek chhote project mein jodne ka waqt aa gaya hai: ek Notes API, jahan log apne notes save aur dekh sakein.",
      "Requirement: GET /notes saare notes ki list de (shuru mein khaali). POST /notes (sirf sahi API key ke saath) ek naya note add kare aur usе ek id de. GET /notes/{note_id} ek specific note wapas de.",
      "Hint: notes ko ek Python list mein in-memory store karo, aur har note ko ek dictionary banao jisme id, title, content ho."
    ],
    example: {
      code: `# Pattern reminder:\nstorage = []\n\n@app.post("/things")\ndef add_thing(name: str):\n    item = {"id": len(storage) + 1, "name": name}\n    storage.append(item)\n    return item`,
      caption: "In-memory list mein data store karne ka pattern"
    },
    starter: `import secrets\n\nAPI_KEY = secrets.token_hex(16)\nnotes = []  # yahaan saare notes store honge\n\napp = MiniAPI()\n\n# TODO 1: GET /notes — return {"notes": notes}\n@app.get("/notes")\ndef list_notes():\n    pass\n\n# TODO 2: POST /notes — sirf sahi x-api-key ke saath allow karo\n#         input: title (str), content (str)\n#         naya note banao: {"id": ..., "title": ..., "content": ...}\n#         notes list mein append karo, aur naya note return karo\n@app.post("/notes")\ndef create_note(title: str = "", content: str = "", x_api_key: str = None):\n    pass\n\n# TODO 3: GET /notes/{note_id} — matching id waala note return karo\n#         agar na mile, HTTPException(404, "Note nahi mila") raise karo\n@app.get("/notes/{note_id}")\ndef get_note():\n    pass`,
    tests: [
      {
        description: "Shuru mein GET /notes — khaali list honi chahiye...",
        call: { method: "GET", path: "/notes", kwargs: {}, headers: {} },
        validate: (res) => res.status === 200 && res.body && Array.isArray(res.body.notes) && res.body.notes.length === 0,
        hint: "GET /notes ko {\"notes\": notes} return karna chahiye, jo shuru mein khaali ho."
      },
      {
        description: "Bina API key ke POST /notes — reject hona chahiye...",
        call: { method: "POST", path: "/notes", kwargs: { title: "Test", content: "x" }, headers: {} },
        validate: (res) => res.status === 401 || res.status === 403,
        hint: "Galat/missing key par note create nahi hona chahiye."
      },
      {
        description: "Sahi API key ke saath POST /notes — naya note banao...",
        useGlobalAsHeader: { globalName: "API_KEY", headerName: "x-api-key" },
        call: { method: "POST", path: "/notes", kwargs: { title: "Pehla Note", content: "Maine apna API bana liya!" }, headers: {} },
        validate: (res) =>
          res.status === 200 &&
          res.body &&
          res.body.title === "Pehla Note" &&
          res.body.id !== undefined,
        hint: "Naye note mein id, title, aur content hone chahiye, aur ye notes list mein bhi add hona chahiye."
      },
      {
        description: "GET /notes — ab ek note hona chahiye...",
        call: { method: "GET", path: "/notes", kwargs: {}, headers: {} },
        validate: (res) => res.status === 200 && res.body && res.body.notes && res.body.notes.length === 1,
        hint: "POST ke baad notes list mein woh note dikhna chahiye."
      },
      {
        description: "GET /notes/1 — specific note fetch kar rahe hain...",
        call: { method: "GET", path: "/notes/1", kwargs: {}, headers: {} },
        validate: (res) => res.status === 200 && res.body && res.body.title === "Pehla Note",
        hint: "Path parameter se note_id match karke sahi note dhoondo. ID ko int mein convert karna na bhoolo."
      },
      {
        description: "GET /notes/999 — na milne waala note...",
        call: { method: "GET", path: "/notes/999", kwargs: {}, headers: {} },
        validate: (res) => res.status === 404,
        hint: "Agar id match na ho, 404 status ke saath HTTPException raise karo."
      }
    ],
    successMessage: "🎉 Badhai ho! Tumne apna pehla, full-featured API bana liya — endpoints, params, POST, aur security, sab kuch."
  }
];
