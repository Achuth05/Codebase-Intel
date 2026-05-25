from app.graph.graph_builder import load_graph
from app.graph.graph_queries import (
    get_files_importing,
    get_all_functions,
    get_all_classes,
    get_file_summary,
    get_most_imported
)

def get_imports(repo_name: str, module_name: str) -> dict:
    G = load_graph(repo_name)
    return {"module": module_name, "imported_by": get_files_importing(G, module_name)}

def get_functions(repo_name: str) -> dict:
    G = load_graph(repo_name)
    return {"functions": get_all_functions(G)}

def get_classes(repo_name: str) -> dict:
    G = load_graph(repo_name)
    return {"classes": get_all_classes(G)}

def get_file(repo_name: str, file_path: str) -> dict:
    G = load_graph(repo_name)
    return get_file_summary(G, file_path)

def get_top_imports(repo_name: str, top_n: int = 10) -> dict:
    G = load_graph(repo_name)
    return {"most_imported": get_most_imported(G, top_n)}