import json
import os
import networkx as nx
from app.graph.models import NodeType, EdgeType, GraphMeta

def resolve_import_to_file(import_str: str, repo_path: str) -> str:
    parts = import_str.split(".")
    candidates = []
    for i in range(len(parts), 0, -1):
        rel_path = os.path.join(*parts[:i]) + ".py"
        candidates.append(rel_path.replace("\\", "/"))
        init_path = os.path.join(*parts[:i], "__init__.py")
        candidates.append(init_path.replace("\\", "/"))
    for candidate in candidates:
        full = os.path.join(repo_path, candidate)
        if os.path.exists(full):
            return candidate
        full_src = os.path.join(repo_path, "src", candidate)
        if os.path.exists(full_src):
            return os.path.join("src", candidate).replace("\\", "/")
    return ""

def build_graph(parsed_files: list[dict], repo_path: str) -> nx.DiGraph:
    G = nx.DiGraph()
    file_path_set = {f["file_path"] for f in parsed_files}

    for parsed in parsed_files:
        symbols = parsed
        file_path = symbols["file_path"]

        if not any([symbols.get("functions"), symbols.get("classes"), symbols.get("imports")]):
            continue

        G.add_node(file_path, type=NodeType.FILE, language=symbols.get("language", ""))

        for func in symbols.get("functions", []):
            func_id = f"{file_path}::{func}"
            G.add_node(func_id, type=NodeType.FUNCTION, name=func, file=file_path)
            G.add_edge(file_path, func_id, relation=EdgeType.CONTAINS)

        for cls in symbols.get("classes", []):
            cls_id = f"{file_path}::{cls}"
            G.add_node(cls_id, type=NodeType.CLASS, name=cls, file=file_path)
            G.add_edge(file_path, cls_id, relation=EdgeType.CONTAINS)

        for imp in symbols.get("imports", []):
            resolved = resolve_import_to_file(imp, repo_path)
            if resolved and resolved in file_path_set:
                G.add_edge(file_path, resolved, relation=EdgeType.IMPORTS)
            else:
                module = imp.split(".")[0]
                if not G.has_node(module):
                    G.add_node(module, type=NodeType.MODULE)
                G.add_edge(file_path, module, relation=EdgeType.IMPORTS)

    G.graph[GraphMeta.REPO_PATH] = repo_path
    G.graph[GraphMeta.TOTAL_NODES] = G.number_of_nodes()
    G.graph[GraphMeta.TOTAL_EDGES] = G.number_of_edges()

    return G


def save_graph(G: nx.DiGraph, repo_name: str, user_id: str, output_dir: str = None) -> str:
    """Save graph to Supabase."""
    from supabase import create_client
    from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

    data = nx.node_link_data(G)
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    sb.table("graphs").upsert({
        "user_id": user_id,
        "repo_name": repo_name,
        "graph_data": data,
    }, on_conflict="user_id,repo_name").execute()

    print(f"Graph saved to Supabase for {repo_name}")
    return f"supabase:graphs/{user_id}/{repo_name}"


def load_graph(repo_name: str, user_id: str = None, output_dir: str = None) -> nx.DiGraph:
    """Load graph from Supabase."""
    from supabase import create_client
    from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    result = sb.table("graphs").select("graph_data").eq("user_id", user_id).eq("repo_name", repo_name).execute()

    if not result.data:
        raise FileNotFoundError(f"No graph found for repo: {repo_name}. Ingest it first.")

    data = result.data[0]["graph_data"]
    return nx.node_link_graph(data)