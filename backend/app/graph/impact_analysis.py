import networkx as nx
from app.graph.models import EdgeType, NodeType

def get_impact(G: nx.DiGraph, file_path: str) -> dict:
    """
    Given a file, find everything that depends on it.
    Useful for: 'if I change auth.py, what else might break?'
    """
    if file_path not in G:
        return {"file": file_path, "error": "File not found in graph"}

    # Direct dependents — files that import this file's modules
    direct_dependents = []
    for source, target, data in G.edges(data=True):
        if target == file_path and data.get("relation") == EdgeType.IMPORTS:
            direct_dependents.append(source)

    # All functions and classes defined in this file
    symbols = []
    for _, target, data in G.out_edges(file_path, data=True):
        if data.get("relation") == EdgeType.CONTAINS:
            node_data = G.nodes[target]
            symbols.append({
                "name": node_data.get("name"),
                "type": node_data.get("type")
            })

    # Indirect impact — files that import files that import this file
    indirect_dependents = []
    for dep in direct_dependents:
        for source, target, data in G.edges(data=True):
            if target == dep and data.get("relation") == EdgeType.IMPORTS:
                if source not in direct_dependents and source != file_path:
                    indirect_dependents.append(source)

    return {
        "file": file_path,
        "symbols_defined": symbols,
        "direct_dependents": direct_dependents,
        "indirect_dependents": list(set(indirect_dependents)),
        "total_impact": len(direct_dependents) + len(set(indirect_dependents))
    }


def get_most_impactful_files(G: nx.DiGraph, top_n: int = 10) -> list[dict]:
    """Which files, if changed, would affect the most other files?"""
    impact_scores = []

    file_nodes = [
        n for n, d in G.nodes(data=True)
        if d.get("type") == NodeType.FILE
    ]

    for file_path in file_nodes:
        result = get_impact(G, file_path)
        impact_scores.append({
            "file": file_path,
            "total_impact": result["total_impact"],
            "direct_dependents": len(result["direct_dependents"])
        })

    return sorted(impact_scores, key=lambda x: x["total_impact"], reverse=True)[:top_n]