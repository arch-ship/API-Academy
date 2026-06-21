from fastapi import FastAPI, HTTPException, Header
import secrets

# Yeh wahi Notes API hai jo tumne capstone lesson mein banayi thi —
# bas ab ye ASLI FastAPI hai, jo apne computer pe chalegi.

app = FastAPI(title="Notes API")

API_KEY = secrets.token_hex(16)
print(f"Tumhari API key (ise kahin save kar lo): {API_KEY}")

notes = []


@app.get("/notes")
def list_notes():
    return {"notes": notes}


@app.post("/notes")
def create_note(title: str, content: str, x_api_key: str = Header(default=None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Galat ya missing API key")
    note = {"id": len(notes) + 1, "title": title, "content": content}
    notes.append(note)
    return note


@app.get("/notes/{note_id}")
def get_note(note_id: int):
    for note in notes:
        if note["id"] == note_id:
            return note
    raise HTTPException(status_code=404, detail="Note nahi mila")


# Chalane ke liye terminal mein:
#   pip install fastapi uvicorn --break-system-packages
#   uvicorn main:app --reload
#
# Fir browser mein kholo: http://127.0.0.1:8000/docs
# Wahaan FastAPI khud-ba-khud ek interactive testing page banata hai!
