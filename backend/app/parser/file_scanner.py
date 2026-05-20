import os

# File extensions we care about
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx",
    ".java", ".go", ".cpp", ".c", ".cs",
    ".rb", ".rs", ".php", ".swift", ".kt",
    ".md", ".txt", ".json", ".yaml", ".yml"
}

# Folders to skip entirely
IGNORED_DIRS = {
    ".git", "node_modules", "__pycache__", ".next",
    "venv", "env", "dist", "build", ".idea", ".vscode",
    "coverage", ".pytest_cache", "eggs", ".eggs"
}

def scan_files(repo_path: str) -> list[dict]:
    files = []

    for root, dirs, filenames in os.walk(repo_path):
        # Remove ignored dirs in-place so os.walk skips them
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()

            if ext not in SUPPORTED_EXTENSIONS:
                continue

            full_path = os.path.join(root, filename)

            # Skip empty files
            if os.path.getsize(full_path) == 0:
                continue

            # Get path relative to repo root (cleaner for display)
            relative_path = os.path.relpath(full_path, repo_path).replace("\\", "/")

            files.append({
                "file_path": relative_path,
                "full_path": full_path.replace("\\", "/"),
                "extension": ext,
                "size_bytes": os.path.getsize(full_path)
            })

    return files