import json
import os
import networkx as nx
from app.graph.models import NodeType, EdgeType, GraphMeta
from app.parser.symbol_extractor import extract_symbols

def resolve_import_to_file(import_str: str, repo_path: str) -> str:
    """
    Try to resolve a Python import string to an actual file path.
    e.g. 'flask.helpers' -> 'src/flask/helpers.py'
    """
    import os
    parts = import_str.split(".")
    
    # Try different path combinations
    candidates = []
    for i in range(len(parts), 0, -1):
        # e.g. flask/helpers.py, flask/helpers/__init__.py
        rel_path = os.path.join(*parts[:i]) + ".py"
        candidates.append(rel_path.replace("\\", "/"))
        init_path = os.path.join(*parts[:i], "__init__.py")
        candidates.append(init_path.replace("\\", "/"))

    for candidate in candidates:
        full = os.path.join(repo_path, candidate)
        if os.path.exists(full):
            return candidate
        # Also check inside src/ folder
        full_src = os.path.join(repo_path, "src", candidate)
        if os.path.exists(full_src):
            return os.path.join("src", candidate).replace("\\", "/")

    return ""

def build_graph(parsed_files: list[dict], repo_path: str) -> nx.DiGraph:
    G = nx.DiGraph()
    file_path_set = {f["file_path"] for f in parsed_files}
    for parsed in parsed_files:
        symbols = extract_symbols(parsed)
        file_path = symbols["file_path"]

        # Skip files with nothing useful
        if not any([symbols["functions"], symbols["classes"], symbols["imports"]]):
            continue

        # Add file node
        G.add_node(file_path, type=NodeType.FILE, language=symbols["language"])

        # Add function nodes + edge: file CONTAINS function
        for func in symbols["functions"]:
            func_id = f"{file_path}::{func}"
            G.add_node(func_id, type=NodeType.FUNCTION, name=func, file=file_path)
            G.add_edge(file_path, func_id, relation=EdgeType.CONTAINS)

        # Add class nodes + edge: file CONTAINS class
        for cls in symbols["classes"]:
            cls_id = f"{file_path}::{cls}"
            G.add_node(cls_id, type=NodeType.CLASS, name=cls, file=file_path)
            G.add_edge(file_path, cls_id, relation=EdgeType.CONTAINS)

        # Add import nodes + edge: file IMPORTS module
        # Add import nodes + edge: file IMPORTS module/file
        for imp in symbols["imports"]:
            # Try to resolve import to actual file in repo
            resolved = resolve_import_to_file(imp, repo_path)
            if resolved and resolved in file_path_set:
                # Internal import — link to actual file
                G.add_edge(file_path, resolved, relation=EdgeType.IMPORTS)
            else:
                # External import — use top-level module name
                module = imp.split(".")[0]
                if not G.has_node(module):
                    G.add_node(module, type=NodeType.MODULE)
                G.add_edge(file_path, module, relation=EdgeType.IMPORTS)
    # Store graph-level metadata
    G.graph[GraphMeta.REPO_PATH] = repo_path
    G.graph[GraphMeta.TOTAL_NODES] = G.number_of_nodes()
    G.graph[GraphMeta.TOTAL_EDGES] = G.number_of_edges()

    return G


def save_graph(G: nx.DiGraph, repo_name: str, output_dir: str = "app/data/graphs") -> str:
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{repo_name}.json")

    # Convert to JSON-serializable format
    data = nx.node_link_data(G)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Graph saved to {output_path}")
    return output_path


def load_graph(repo_name: str, output_dir: str = "app/data/graphs") -> nx.DiGraph:
    path = os.path.join(output_dir, f"{repo_name}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"No graph found for repo: {repo_name}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return nx.node_link_graph(data)