import os
import json
from typing import Optional
from app.config import REPOS_DIR, CHROMA_DB_PATH

REPO_STORE_PATH = os.path.join("app", "data", "repos.json")


def _ensure_store():
    os.makedirs(os.path.dirname(REPO_STORE_PATH), exist_ok=True)
    if not os.path.exists(REPO_STORE_PATH):
        with open(REPO_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump({"repos": {}}, f)


def load_store() -> dict:
    _ensure_store()
    with open(REPO_STORE_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return {"repos": {}}


def save_store(store: dict):
    _ensure_store()
    with open(REPO_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2)


def get_repo(repo_name: str) -> Optional[dict]:
    store = load_store()
    return store.get("repos", {}).get(repo_name)


def find_by_url(repo_url: str) -> Optional[str]:
    store = load_store()
    for name, meta in store.get("repos", {}).items():
        if meta.get("repo_url") == repo_url:
            return name
    return None


def add_repo(repo_name: str, repo_url: str, repo_path: str, chroma_path: str, owner: str):
    store = load_store()
    repos = store.setdefault("repos", {})
    if repo_name not in repos:
        repos[repo_name] = {
            "repo_name": repo_name,
            "repo_url": repo_url,
            "repo_path": repo_path,
            "chroma_path": chroma_path,
            "owners": [owner]
        }
    else:
        owners = repos[repo_name].setdefault("owners", [])
        if owner not in owners:
            owners.append(owner)
    save_store(store)


def add_owner(repo_name: str, owner: str):
    store = load_store()
    repos = store.setdefault("repos", {})
    if repo_name in repos:
        owners = repos[repo_name].setdefault("owners", [])
        if owner not in owners:
            owners.append(owner)
            save_store(store)


def user_has_access(repo_name: str, user_id: str) -> bool:
    meta = get_repo(repo_name)
    if not meta:
        return False
    return user_id in meta.get("owners", [])
