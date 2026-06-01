'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Loader2, 
  RefreshCw,
  Quote,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [docId, setDocId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2)); // Size in MB

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await axios.post(`${API}/upload`, form);
      setDocId(res.data.doc_id);
      setMessages([
        { 
          role: 'system', 
          text: `Success! Indexed **${res.data.total_chunks}** sections from **${file.name}**. You can now ask questions about this document.` 
        }
      ]);
    } catch (err) {
      console.error(err);
      setError('Failed to upload and index document. Is the backend server running?');
      setFileName('');
      setFileSize(null);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (!docId || !question.trim() || loading) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', text: currentQuestion }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/ask`, {
        doc_id: docId,
        question: currentQuestion
      });

      setMessages((prev) => [
        ...prev, 
        { 
          role: 'bot', 
          text: res.data.answer, 
          sources: res.data.sources 
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'bot', 
          text: 'Sorry, I encountered an error while processing your request. Please check the backend connection.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setDocId(null);
    setFileName('');
    setFileSize(null);
    setQuestion('');
    setMessages([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                DocuBot
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                RAG Document Q&A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {docId && (
              <button 
                onClick={resetSession}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Document
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Intro Hero Section (Visible only when no doc uploaded) */}
        {!docId && !uploading && (
          <div className="text-center py-8 md:py-12 max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Instant Answers from Any Document.
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Upload any PDF or DOCX file. DocuBot will instantly extract, analyze, and index the text to answer your questions using LLaMA 3.
            </p>
          </div>
        )}

        {/* Dynamic Panel Zone */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* UPLOAD PANEL */}
          {!docId && (
            <div className="w-full">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-950/10 shadow-indigo-500/5' 
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  {uploading ? (
                    <>
                      <div className="relative flex items-center justify-center">
                        <Loader2 className="h-14 w-14 text-indigo-500 animate-spin" />
                        <FileText className="h-6 w-6 text-indigo-400 absolute" />
                      </div>
                      <div className="space-y-1 animate-pulse">
                        <p className="text-indigo-400 font-semibold text-lg">Analyzing & Indexing...</p>
                        <p className="text-slate-500 text-sm">
                          Reading text, generating local embeddings, and creating ChromaDB vector store
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:scale-105 transition-transform duration-300">
                        <Upload className="h-8 w-8 text-indigo-400" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-semibold text-slate-200">
                          {isDragActive ? 'Drop your document here' : 'Upload your PDF or Word Document'}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          Drag and drop your file here, or click to browse. Supports PDF or DOCX up to 10MB.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-500">
                        <span>PyMuPDF Parser</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>ChromaDB Vector Store</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE CHAT INTERFACE */}
          {docId && (
            <div className="flex flex-col border border-slate-800/80 bg-slate-900/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Document Banner */}
              <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">
                      {fileName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Indexed Document • {fileSize} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </div>
              </div>

              {/* Chat Window */}
              <div className="h-[450px] overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[85%] ${
                      m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {/* Speaker Header */}
                    <span className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">
                      {m.role === 'user' ? 'You' : m.role === 'system' ? 'DocuBot Indexer' : 'DocuBot'}
                    </span>

                    {/* Chat Bubble */}
                    <div 
                      className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg shadow-indigo-600/15'
                          : m.role === 'system'
                          ? 'bg-slate-900/60 text-slate-300 border border-slate-800/80 rounded-tl-none italic'
                          : 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-none shadow-md'
                      }`}
                    >
                      {m.role === 'bot' || m.role === 'system' ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-400">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}

                      {/* Source Citation Display */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                            <Quote className="h-3 w-3 text-indigo-400" />
                            Cited Context Chunks
                          </div>
                          <div className="grid gap-2 grid-cols-1">
                            {m.sources.map((s, idx) => (
                              <div 
                                key={idx} 
                                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50 text-[11px] text-slate-400 hover:text-slate-300 transition-colors"
                              >
                                {s.substring(0, 200)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking / Typing Animation */}
                {loading && (
                  <div className="self-start flex flex-col items-start max-w-[80%]">
                    <span className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">
                      DocuBot
                    </span>
                    <div className="px-4 py-3 rounded-2xl text-sm bg-slate-900/90 border border-slate-800/80 rounded-tl-none flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-slate-500 italic">Consulting vector database & LLaMA 3...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Area */}
              <form 
                onSubmit={handleAsk}
                className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2"
              >
                <input 
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about your document..."
                  disabled={loading}
                  className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="p-3 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 hover:scale-102 active:scale-98 transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>

            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 mt-auto border-t border-slate-900/80 bg-slate-950/20 text-center text-xs text-slate-600">
        <p className="flex items-center justify-center gap-1.5">
          <span>DocuBot RAG-Powered SaaS</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>Next.js + FastAPI + ChromaDB + Groq LLaMA 3</span>
        </p>
      </footer>

    </div>
  );
}
