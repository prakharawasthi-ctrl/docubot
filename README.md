<div align="center">

# DocuBot

### RAG-Powered Document Q&A — Ask anything about your PDF or Word doc

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq_LLaMA_3.3-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-orange?style=for-the-badge)](https://trychroma.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)

**Upload any PDF or Word document → Ask questions → Get cited, factual answers in seconds**

[Live Demo](#) · [Backend API Docs](#) · [Report Bug](../../issues)

---

<!-- Replace with your actual demo GIF -->
![DocuBot Demo](https://via.placeholder.com/800x450/0f172a/3b82f6?text=Demo+GIF+Coming+Soon)

</div>

---

## What is DocuBot?

DocuBot uses **Retrieval-Augmented Generation (RAG)** to answer questions about documents you upload. Unlike asking ChatGPT about a file, DocuBot actually reads your document, indexes it semantically, and gives you answers cited directly from the source — no hallucinations, no guessing.

Upload a research paper, a contract, a report, or any PDF — and have a conversation with it.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INGEST PHASE (once)                         │
│                                                                     │
│  PDF/DOCX ──► PyMuPDF Parser ──► Text Chunks ──► MiniLM Embeddings │
│                                                         │           │
│                                                   ChromaDB Store    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       QUERY PHASE (per question)                    │
│                                                                     │
│  Question ──► MiniLM Embeddings ──► ChromaDB Similarity Search      │
│                                           │                         │
│                                    Top 5 Chunks                     │
│                                           │                         │
│                              Prompt + Context + Question            │
│                                           │                         │
│                           Groq (LLaMA 3.3 70B) ──► Cited Answer    │
└─────────────────────────────────────────────────────────────────────┘
```

**1. Ingest** — Document is parsed, split into overlapping chunks, converted into vector embeddings locally using `all-MiniLM-L6-v2`, and stored in ChromaDB on disk.

**2. Retrieve** — Your question is vectorized and ChromaDB finds the 5 most semantically relevant chunks from your document.

**3. Generate** — Chunks + question are sent to LLaMA 3.3 70B on Groq with a strict factual prompt — answer comes back with source citations.

---

## Tech Stack

| Layer | Technology | Why |
|:---|:---|:---|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS | SSR, fast, deploys free on Vercel |
| **Backend** | FastAPI (Python) | Async, high-performance, auto Swagger docs |
| **LLM** | Groq — LLaMA 3.3 70B | Faster than GPT-3.5, completely free |
| **Embeddings** | `all-MiniLM-L6-v2` | Runs locally — document text never leaves your server |
| **Vector DB** | ChromaDB | Lightweight, persistent, no cloud needed |
| **PDF Parser** | PyMuPDF | Best-in-class free text extraction |
| **Backend Deploy** | Railway.app | Free tier, auto-deploy from GitHub |
| **Frontend Deploy** | Vercel | 1-click deploy, free, edge CDN |

> **100% free to run.** No OpenAI credits, no paid APIs, no surprises.

---

## Features

- 📂 **Multi-format** — PDF and Word (`.docx`) documents supported
- 🎯 **Source citations** — Every answer highlights the exact sections it came from
- ⚡ **Fast** — LLaMA 3.3 70B on Groq delivers sub-second completions
- 🔒 **Privacy-first** — Document text is embedded locally, never sent to embedding APIs
- 💬 **Chat history** — Full conversation thread per document session
- 🎨 **Clean UI** — Glassmorphic Tailwind components, drag-and-drop upload, loading states

---

## Project Structure

```
docubot/
├── docubot-backend/
│   ├── main.py                  # FastAPI app — /upload and /ask routes
│   ├── services/
│   │   ├── parser.py            # PDF + DOCX text extraction (PyMuPDF)
│   │   ├── chunker.py           # Overlapping text chunking
│   │   ├── vectorstore.py       # ChromaDB store + semantic search
│   │   └── llm.py               # Groq LLaMA 3.3 prompt + response
│   ├── requirements.txt
│   ├── Procfile                 # Railway deployment config
│   └── .env                     # GROQ_API_KEY (never commit)
│
└── docubot-frontend/
    ├── app/
    │   └── page.jsx             # Main UI — upload + chat interface
    ├── .env.local               # NEXT_PUBLIC_API_URL
    └── package.json
```

---

## Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- Free [Groq API key](https://console.groq.com) — takes 30 seconds, no card needed

### 1. Clone the repo

```bash
git clone https://github.com/prakhar-awasthi/docubot.git
cd docubot
```

### 2. Backend setup

```bash
cd docubot-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

> Swagger UI available at [http://localhost:8000/docs](http://localhost:8000/docs) — test your endpoints here before touching the frontend.

### 3. Frontend setup

Open a new terminal:

```bash
cd docubot-frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) — upload a PDF and start asking questions.

---

## API Reference

### `POST /upload`

Upload a document for indexing.

| Field | Type | Description |
|:---|:---|:---|
| `file` | `multipart/form-data` | PDF or DOCX file |

**Response:**
```json
{
  "doc_id": "uuid-string",
  "total_chunks": 47,
  "status": "ready"
}
```

### `POST /ask`

Ask a question about an uploaded document.

**Request body:**
```json
{
  "doc_id": "uuid-string",
  "question": "What are the key findings in section 3?"
}
```

**Response:**
```json
{
  "answer": "According to the document, the key findings in section 3 are...",
  "sources": ["chunk text 1...", "chunk text 2...", "chunk text 3..."]
}
```

---

## Deployment

### Backend → Railway

1. Push code to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add environment variable: `GROQ_API_KEY`
4. Railway auto-detects Python and uses the `Procfile` — deploy completes in ~3 mins
5. Copy the generated Railway URL

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `docubot-frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL = https://your-railway-url.up.railway.app`
4. Deploy — live in ~2 minutes

---

## Environment Variables

| Variable | Where | Description |
|:---|:---|:---|
| `GROQ_API_KEY` | Backend `.env` | Your Groq API key from console.groq.com |
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` | Full URL of your FastAPI backend |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Author

**Prakhar Awasthi**
[prakharspace.netlify.app](https://prakharspace.netlify.app) · [LinkedIn](https://linkedin.com/in/prakhar-awasthi) · [GitHub](https://github.com/prakhar-awasthi)

---

<div align="center">

If this helped you, consider giving it a ⭐

</div>
