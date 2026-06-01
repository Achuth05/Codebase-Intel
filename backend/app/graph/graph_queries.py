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

def get_file_details(G, file_path):
    if file_path not in G:
        return {'file': file_path, 'language': '', 'functions': [], 'classes': [], 'imports': [], 'dependents': [], 'dependent_count': 0, 'total_symbols': 0}
    functions = []
    classes = []
    imports = []
    dependents = []
    for _, target, data in G.out_edges(file_path, data=True):
        relation = data.get('relation')
        node_data = G.nodes[target]
        if relation == 'contains':
            if node_data.get('type') == 'function':
                functions.append(node_data.get('name'))
            elif node_data.get('type') == 'class':
                classes.append(node_data.get('name'))
        elif relation == 'imports':
            co_importers = [s for s, t, d in G.edges(data=True) if t == target and d.get('relation') == 'imports' and s != file_path]
            imports.append({'module': target, 'co_importers': len(co_importers), 'co_importer_files': co_importers[:5]})
    for source, target, data in G.edges(data=True):
        if target == file_path and data.get('relation') == 'imports':
            dependents.append(source)
    return {'file': file_path, 'language': G.nodes[file_path].get('language', ''), 'functions': functions, 'classes': classes, 'imports': imports, 'dependents': dependents, 'dependent_count': len(dependents), 'total_symbols': len(functions) + len(classes)}

def get_function_impact(G, file_path, function_names):
    direct_impact = [s for s, t, d in G.edges(data=True) if t == file_path and d.get('relation') == 'imports']
    indirect_impact = list(set([s for dep in direct_impact for s, t, d in G.edges(data=True) if t == dep and d.get('relation') == 'imports' and s not in direct_impact and s != file_path]))
    chain = [{'file': f, 'level': 'direct', 'reason': 'imports ' + file_path.split('/')[-1]} for f in direct_impact[:10]]
    chain += [{'file': f, 'level': 'indirect', 'reason': 'imports a file that imports the changed file'} for f in indirect_impact[:10]]
    return {'changed_file': file_path, 'changed_functions': function_names, 'direct_impact': direct_impact, 'indirect_impact': indirect_impact, 'impact_chain': chain, 'total_affected': len(direct_impact) + len(indirect_impact)}
