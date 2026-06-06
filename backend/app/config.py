import os
from dotenv import load_dotenv

load_dotenv()

REPOS_DIR = os.getenv("REPOS_DIR", "app/repos")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "app/data/chroma_db")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def get_user_repos_path(user_id: str) -> str:
    return os.path.join(REPOS_DIR, user_id).replace("\\", "/")
    
def get_user_chroma_path(user_id: str) -> str:
    return os.path.join(CHROMA_DB_PATH, user_id)

def get_user_graphs_path(user_id: str) -> str:
    return os.path.join("app/data/graphs", user_id)