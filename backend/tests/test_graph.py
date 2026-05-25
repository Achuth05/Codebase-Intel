import networkx as nx
from app.graph.graph_builder import build_graph

def test_build_graph_empty():
    G = build_graph([], "test_repo")
    assert G.number_of_nodes() == 0

def test_build_graph_with_file():
    parsed = [{
        "file_path": "main.py",
        "language": "py",
        "functions": ["hello"],
        "classes": [],
        "imports": ["os"]
    }]
    G = build_graph(parsed, "test_repo")
    assert "main.py" in G.nodes