from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer

# Init app
app = FastAPI()

# Allow all origins (for Node.js frontend/backend to call)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embedding model (free)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Init Chroma client (persistent storage)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="documents"
)

@app.post("/add-doc/")
async def add_document(doc_text: str = Form(...), doc_id: str = Form(...)):
    """Receive a document and store in Chroma"""
    embedding = model.encode([doc_text]).tolist()

    collection.add(
        documents=[doc_text],
        embeddings=embedding,
        ids=[doc_id]
    )

    return {"status": "success", "id": doc_id}

@app.get("/search/")
async def search(query: str, n_results: int = 3):
    """Search similar docs"""
    embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=embedding,
        n_results=n_results
    )
    return results
