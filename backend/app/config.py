import os
from dotenv import load_dotenv

load_dotenv()

REPOS_DIR = os.getenv("REPOS_DIR", "app/repos")