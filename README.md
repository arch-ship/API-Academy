# API Academy 🛰️

Ek interactive, lesson-wise web course jo tumhe sikhata hai **apna khud ka API kaise banate hain** — seedha browser mein, asli Python code likh kar, turant check ke saath.

## Chalu kaise karein

Kisi installation ki zaroorat nahi. Bas:

1. Is folder ko unzip karo.
2. `index.html` ko seedha apne browser (Chrome/Edge/Firefox) mein double-click karke kholo.

**Ya** agar tumhare paas Python installed hai, ek local server se kholna behtar rahega (kuch browsers file:// se fonts/scripts thoda strict treat karte hain):

```bash
cd api-academy
python3 -m http.server 8000
```

Fir browser mein kholo: `http://localhost:8000`

Pehli baar load hone mein 5-10 second lag sakte hain — kyunki ye ek poora Python engine (Pyodide) tumhare browser ke andar download kar raha hota hai. Uske baad sab kuch instant chalega, aur **internet ke bina bhi** (Pyodide aane ke baad) kaam karega.

## Ye kaam kaise karta hai

- **Koi backend nahi, koi API key nahi, koi daily limit nahi.** Saara code execution browser ke andar [Pyodide](https://pyodide.org) (Python compiled to WebAssembly) se hota hai. Isliye check karne ka koi rate-limit ya cost nahi — jitni baar chaaho, run karo.
- Tumhara FastAPI jaisa syntax (`@app.get`, `@app.post`, path/query params, `HTTPException`) ek chhote teaching-framework `MiniAPI` se chalta hai jo isi project ke andar (`app.js` ke top mein `BRIDGE_PY`) likha gaya hai. Pattern bilkul real **FastAPI** jaisa hai — jab tum real FastAPI install karoge, yehi syntax kaam karega.
- Progress browser ke `localStorage` mein save hoti hai, isliye tab band karke wapas aane par wahin se shuru hoga jahan chhoda tha.

## Curriculum

| Route | Topic |
|---|---|
| 01 | API hota kya hai (concept quiz) |
| 02 | Toolkit setup + apna Python engine test |
| 03 | Pehla endpoint — `GET /hello` |
| 04 | Path parameters — `/items/{item_id}` |
| 05 | Query parameters & default values |
| 06 | POST se naya data create karna |
| 07 | API keys generate karna aur endpoint secure karna |
| 08 | **Capstone:** ek poori Notes API — sab kuch ek saath |

Har code-lesson mein: concept explanation → ek example → ek editable code editor → "Check karo" button jo tumhare code ko run karke real tests ke against verify karta hai → hint agar kuch fail ho.

## `bonus/` folder — Real FastAPI project

Ye web-course ek teaching-simulation hai (taaki bina kuch install kiye seekh sako). Jab tum capstone complete kar lo, `bonus/main.py` mein bilkul wahi Notes API hai, lekin **asli FastAPI** se likhi hui, jo tum apne computer pe chala sakte ho:

```bash
cd bonus
pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload
```

Fir browser mein kholo `http://127.0.0.1:8000/docs` — FastAPI khud-ba-khud ek interactive testing page (Swagger UI) bana deta hai jahan tum apne endpoints live test kar sakte ho. Yahi woh moment hai jab tumhara API "real duniya" mein chalta hai.

## API key generate karne ka quick reference

```python
import secrets

API_KEY = secrets.token_hex(16)   # ek safe, random, 32-character key
```

Is key ko request bhejne wale ko `x-api-key` header mein bhejna hota hai, aur server us header ko verify karta hai (poora hands-on Route 07 mein hai).

## Project structure

```
api-academy/
├── index.html        ← entry point, isi ko kholna hai
├── style.css          ← visual design (blueprint theme)
├── lessons.js          ← saari lesson content, explanations, tests
├── app.js              ← app logic + Python bridge (Pyodide)
└── bonus/
    ├── main.py          ← real, runnable FastAPI version
    └── requirements.txt
```

## Reset progress

Sidebar ke neeche "↺ Reset progress" button se kabhi bhi shuru se start kar sakte ho.

---

Bana ke maza aaye, seekh ke aur zyada aaye. Happy shipping 🚀
