import chromadb
from sentence_transformers import SentenceTransformer

# Load the embedding model ONCE when the server starts
# all-MiniLM-L6-v2 is small, fast, and free — downloads automatically on first run
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Create a persistent ChromaDB client — saves to disk so data survives restarts
client = chromadb.PersistentClient(path='./chroma_db')

def store_chunks(doc_id: str, chunks: list) -> None:
    collection = client.get_or_create_collection(name=doc_id)
    embeddings = embedder.encode(chunks).tolist()  # convert chunks to numbers
    ids = [f'{doc_id}_{i}' for i in range(len(chunks))]  # unique ID per chunk
    collection.add(documents=chunks, embeddings=embeddings, ids=ids)

def search_chunks(doc_id: str, query: str, top_k: int = 5) -> list:
    collection = client.get_or_create_collection(name=doc_id)
    query_embedding = embedder.encode([query]).tolist()  # convert question to numbers
    results = collection.query(query_embeddings=query_embedding, n_results=top_k)
    return results['documents'][0]  # returns list of top_k most relevant chunks
