# DocuBot — RAG Document Q&A SaaS

Upload any PDF or Word Document and get instant, factual answers cited directly from the document content using advanced Retrieval-Augmented Generation (RAG) and LLaMA 3.

---

## 🚀 Live Demo & Presentation
- **Frontend Vercel Demo:** *(Coming Soon)*
- **Backend Railway Server:** *(Coming Soon)*

---

## 🛠️ How It Works (RAG Architecture)

DocuBot employs a state-of-the-art **Retrieval-Augmented Generation (RAG)** pipeline to answer queries securely and accurately without exceeding context limits.

```
[User Document] ──> [PyMuPDF Parser] ──> [Text Chunks] ──> [MiniLM Embeddings] ──> [ChromaDB Vector Store]
                                                                                      │
[User Question] ──> [MiniLM Embeddings] ──> [Semantic Similarity Query] ──────────────┘
                                                       │
                                            (Top 5 Context Chunks)
                                                       │
                                                       ▼
[Formatted Context + Query Prompt] ──> [Groq Cloud (LLaMA 3.3 70B)] ──> [Cited Factual Answer]
```

1. **Ingest Phase:** The uploaded document is parsed, split into manageable overlapping text chunks, converted into high-dimensional vector embeddings locally using the fast `all-MiniLM-L6-v2` model, and stored in a local, disk-persistent ChromaDB instance.
2. **Retrieval Phase:** When you ask a question, the question is vectorized, and ChromaDB retrieves the top 5 most semantically relevant context chunks.
3. **Generation Phase:** The retrieved chunks and the question are compiled into a strict factual prompt, which is processed by LLaMA 3.3 70B on Groq to deliver highly accurate answers with precise citations.

---

## 💻 Tech Stack & Infrastructure

| Layer | Technology | Why | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | SSR, React Hook form, premium dark mode Tailwind CSS | Free |
| **Backend** | FastAPI (Python) | High-performance, asynchronous REST API, auto Swagger UI docs | Free |
| **LLM** | Groq (LLaMA 3.3 70B) | Extreme throughput speed, smart reasoning models | Free |
| **Embeddings** | all-MiniLM-L6-v2 | Processed locally on CPU/GPU, zero API cost | Free |
| **Vector DB** | ChromaDB | Lightweight, serverless vector store with disk persistence | Free |
| **PDF Parser** | PyMuPDF | Fast, reliable extraction of structured PDF text | Free |
| **Backend Deploy** | Railway.app | Seamless Docker/Git deployment with free tier credits | Free |
| **Frontend Deploy** | Vercel | Seamless edge caching and automatic CI/CD rebuilds | Free |

---

## ⚡ Key Features
- 📂 **Multi-format Support:** Seamlessly parses PDF (`.pdf`) and Microsoft Word (`.docx`) documents.
- 🎯 **Factual Citations:** Every answer references and highlights the exact source sections from the document.
- ⚡ **Lightning Fast:** Employs LLaMA 3.3 70B via Groq Cloud APIs for sub-second text completions.
- 🔒 **Privacy-First Embedding:** Converts text to vectors completely locally inside the backend server (never shares document text with embedding APIs).
- 🎨 **Sleek UX:** Implemented with premium Tailwind glassmorphic components, micro-animations, file upload dropzones, and status animations.

---

## 📦 Local Setup Instructions

Follow these exact steps to run both the FastAPI server and the Next.js application on your machine.

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
cd docubot-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `docubot-backend` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
*Verify: Swagger documentation is now available at [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd docubot-frontend

# Install node dependencies
npm install

# Start Next.js development server
npm run dev
```
*Verify: Open [http://localhost:3000](http://localhost:3000) to upload documents and query DocuBot!*
