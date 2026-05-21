import os
from dotenv import load_dotenv

load_dotenv()

REPOS_DIR = os.getenv("REPOS_DIR", "app/repos")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "app/data/chroma_db")