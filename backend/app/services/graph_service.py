from app.graph.graph_builder import load_graph
from app.graph.graph_queries import (
    get_files_importing,
    get_all_functions,
    get_all_classes,
    get_file_summary,
    get_most_imported,
    get_file_details,
    get_function_impact
)

def _load(repo_name: str, user_id: str):
    return load_graph(repo_name, user_id=user_id)

def get_imports(repo_name: str, module_name: str, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return {"module": module_name, "imported_by": get_files_importing(G, module_name)}

def get_functions(repo_name: str, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return {"functions": get_all_functions(G)}

def get_classes(repo_name: str, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return {"classes": get_all_classes(G)}

def get_file(repo_name: str, file_path: str, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return get_file_summary(G, file_path)

def get_top_imports(repo_name: str, user_id: str, top_n: int = 10) -> dict:
    G = _load(repo_name, user_id)
    return {"most_imported": get_most_imported(G, top_n)}

def get_file_details_service(repo_name: str, file_path: str, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return get_file_details(G, file_path)

def get_function_impact_service(repo_name: str, file_path: str, functions: list, user_id: str) -> dict:
    G = _load(repo_name, user_id)
    return get_function_impact(G, file_path, functions)

def get_file_description(repo_name: str, file_path: str, user_id: str) -> dict:
    from groq import Groq
    import os
    from app.config import GROQ_API_KEY, get_user_repos_path

    details = get_file_details_service(repo_name, file_path, user_id)
    full_path = os.path.join(get_user_repos_path(user_id), repo_name, file_path)
    content = ""
    try:
        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()[:2000]
    except Exception:
        pass

    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"File: {file_path}\nFunctions: {', '.join(details.get('functions', []))}\nClasses: {', '.join(details.get('classes', []))}\nCode preview:\n{content}"
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a code analyst. Write a 2-3 sentence plain English description of what this file does. Be concise."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=150
    )
    return {**details, "description": response.choices[0].message.content.strip()}

def get_function_description(repo_name: str, file_path: str, function_name: str, user_id: str) -> dict:
    from groq import Groq
    import os
    from app.config import GROQ_API_KEY, get_user_repos_path

    full_path = os.path.join(get_user_repos_path(user_id), repo_name, file_path)
    content = ""
    try:
        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        pass

    snippet = ""
    lines = content.split("\n")
    in_function = False
    indent = 0
    for line in lines:
        if f"def {function_name}" in line or f"function {function_name}" in line:
            in_function = True
            indent = len(line) - len(line.lstrip())
            snippet = line + "\n"
        elif in_function:
            current_indent = len(line) - len(line.lstrip())
            if line.strip() == "" or current_indent > indent:
                snippet += line + "\n"
                if len(snippet) > 1000:
                    break
            else:
                break

    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "Write a 1-2 sentence plain English description of what this function does. Be very concise."},
            {"role": "user", "content": f"Function: {function_name}\nFile: {file_path}\nCode:\n{snippet}"}
        ],
        temperature=0.2,
        max_tokens=100
    )
    return {
        "function": function_name,
        "file": file_path,
        "description": response.choices[0].message.content.strip()
    }