import os
import stat
import shutil
import re
import git
from app.config import REPOS_DIR

def get_repo_name(github_url: str) -> str:
    match = re.search(r"github\.com/[^/]+/([^/]+?)(?:\.git)?$", github_url)
    if not match:
        raise ValueError(f"Invalid GitHub URL: {github_url}")
    return match.group(1)

def force_remove_readonly(func, path, excinfo):
    # Windows fix: remove read-only flag then retry delete
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clone_repo(github_url: str) -> str:
    repo_name = get_repo_name(github_url)
    clone_path = os.path.join(REPOS_DIR, repo_name)

    if os.path.exists(clone_path):
        shutil.rmtree(clone_path, onerror=force_remove_readonly)

    os.makedirs(REPOS_DIR, exist_ok=True)

    print(f"Cloning {github_url} into {clone_path}...")
    git.Repo.clone_from(github_url, clone_path)
    print(f"Done. Repo saved at: {clone_path}")

    return clone_path.replace("\\", "/")