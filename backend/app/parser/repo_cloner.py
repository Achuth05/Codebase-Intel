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
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clone_repo(github_url: str, clone_dir: str = None) -> str:
    repo_name = get_repo_name(github_url)
    base_dir = clone_dir if clone_dir else REPOS_DIR
    clone_path = os.path.join(base_dir, repo_name)

    if os.path.exists(clone_path):
        shutil.rmtree(clone_path, onerror=force_remove_readonly)

    os.makedirs(base_dir, exist_ok=True)

    print(f"Cloning {github_url} into {clone_path}...")
    git.Repo.clone_from(github_url, clone_path)
    print(f"Done. Repo saved at: {clone_path}")

    return clone_path.replace("\\", "/")