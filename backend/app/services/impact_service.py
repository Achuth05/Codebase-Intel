from app.graph.graph_builder import load_graph
from app.graph.impact_analysis import get_impact, get_most_impactful_files

def analyze_impact(repo_name: str, file_path: str, user_id: str) -> dict:
    G = load_graph(repo_name, user_id=user_id)
    return get_impact(G, file_path)

def most_impactful(repo_name: str, top_n: int = 10, user_id: str = None) -> dict:
    G = load_graph(repo_name, user_id=user_id)
    return {"files": get_most_impactful_files(G, top_n)}