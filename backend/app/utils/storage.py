import os

from app.config import CHROMA_DB_PATH, REPOS_DIR


def get_user_repo_path(user_id: str, repo_name: str) -> str:
    return os.path.join(REPOS_DIR, user_id, repo_name)


def get_user_chroma_path(user_id: str, repo_name: str) -> str:
    return os.path.join(CHROMA_DB_PATH, user_id, repo_name)


def get_user_graph_file(user_id: str, repo_name: str, output_dir: str = "app/data/graphs") -> str:
    return os.path.join(output_dir, user_id, f"{repo_name}.json")


def get_user_docs_file(user_id: str, repo_name: str, docs_dir: str = "app/data/docs") -> str:
    return os.path.join(docs_dir, f"{user_id}_{repo_name}_README.md")
