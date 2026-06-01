from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.parser import extract_text
from services.chunker import chunk_text
from services.vectorstore import store_chunks, search_chunks
from services.llm import answer_question
from pydantic import BaseModel
import uuid, shutil, os

app = FastAPI(title='DocuBot API')

# CORS — allows Next.js frontend to call this backend
app.add_middleware(CORSMiddleware,
    allow_origins=['*'],  # Allow all during local dev/testing
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'])

class AskRequest(BaseModel):
    doc_id: str
    question: str

# Create a local tmp folder if it doesn't exist
TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
os.makedirs(TMP_DIR, exist_ok=True)

@app.post('/upload')
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())  # unique ID for this document
    ext = file.filename.split('.')[-1].lower()
    tmp_path = os.path.join(TMP_DIR, f'{doc_id}.{ext}')

    with open(tmp_path, 'wb') as f:
        shutil.copyfileobj(file.file, f)  # save uploaded file temporarily

    try:
        text = extract_text(tmp_path, ext)  # parse text from file
        if not text.strip():
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="The uploaded document contains no readable text. (Scanned PDFs without OCR are not supported.)")
            
        chunks = chunk_text(text)            # split into chunks
        if not chunks:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="The document could not be split into readable sections.")
            
        store_chunks(doc_id, chunks)         # embed and store in ChromaDB
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)              # delete temp file

    return {'doc_id': doc_id, 'total_chunks': len(chunks), 'status': 'ready'}


@app.post('/ask')
async def ask_question(request: AskRequest):
    chunks = search_chunks(request.doc_id, request.question, top_k=5)
    result = answer_question(chunks, request.question)
    return result

# Run with: uvicorn main:app --reload --port 8000
