from app.parser.repo_cloner import clone_repo
from app.parser.file_scanner import scan_files
from app.parser.ts_parser import parse_file

def run_pipeline(github_url: str) -> dict:
    repo_path = clone_repo(github_url)
    files = scan_files(repo_path)

    parsed_files = []
    errors = []

    for f in files:
        try:
            with open(f["full_path"], "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
            parsed = parse_file(f["file_path"], content)
            parsed["size_bytes"] = f["size_bytes"]
            parsed_files.append(parsed)
        except Exception as e:
            errors.append({"file_path": f["file_path"], "error": str(e)})

    return {
        "repo_path": repo_path,
        "total_files": len(files),
        "parsed_files": parsed_files,
        "errors": errors
    }