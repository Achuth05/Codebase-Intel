import networkx as nx
from app.graph.models import NodeType, EdgeType


def get_files_importing(G: nx.DiGraph, module_name: str) -> list[str]:
    """Which files import a given module? e.g. 'jwt', 'fastapi'"""
    results = []
    for source, target, data in G.edges(data=True):
        if data.get("relation") == EdgeType.IMPORTS and target == module_name:
            results.append(source)
    return results


def get_all_functions(G: nx.DiGraph) -> list[dict]:
    """List every function across the entire codebase."""
    return [
        {"function": data.get("name"), "file": data.get("file")}
        for _, data in G.nodes(data=True)
        if data.get("type") == NodeType.FUNCTION
    ]


def get_all_classes(G: nx.DiGraph) -> list[dict]:
    """List every class across the entire codebase."""
    return [
        {"class": data.get("name"), "file": data.get("file")}
        for _, data in G.nodes(data=True)
        if data.get("type") == NodeType.CLASS
    ]


def get_file_summary(G: nx.DiGraph, file_path: str) -> dict:
    """What functions, classes and imports does a specific file have?"""
    functions = []
    classes = []
    imports = []

    for _, target, data in G.out_edges(file_path, data=True):
        relation = data.get("relation")
        node_data = G.nodes[target]

        if relation == EdgeType.CONTAINS:
            if node_data.get("type") == NodeType.FUNCTION:
                functions.append(node_data.get("name"))
            elif node_data.get("type") == NodeType.CLASS:
                classes.append(node_data.get("name"))
        elif relation == EdgeType.IMPORTS:
            imports.append(target)

    return {
        "file": file_path,
        "functions": functions,
        "classes": classes,
        "imports": imports
    }


def get_most_imported(G: nx.DiGraph, top_n: int = 10) -> list[dict]:
    """Which modules are imported the most across the codebase?"""
    import_counts = {}
    for source, target, data in G.edges(data=True):
        if data.get("relation") == EdgeType.IMPORTS:
            import_counts[target] = import_counts.get(target, 0) + 1

    sorted_imports = sorted(import_counts.items(), key=lambda x: x[1], reverse=True)
    return [{"module": m, "imported_by": c} for m, c in sorted_imports[:top_n]]