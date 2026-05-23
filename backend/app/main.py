from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.ingest import router as ingest_router
from app.api.routes.ask import router as ask_router
from app.api.routes.graph import router as graph_router
app = FastAPI(
    title="Codebase Intel API",
    description="Understand any codebase using AI",
    version="1.0.0"
)

# CORS — needed when Next.js frontend calls this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ingest_router, prefix="/api", tags=["Ingestion"])
app.include_router(ask_router, prefix="/api", tags=["Query"])
app.include_router(graph_router, prefix="/api", tags=["Graph"])

@app.get("/")
def root():
    return {"message": "Codebase Intel API is running"}