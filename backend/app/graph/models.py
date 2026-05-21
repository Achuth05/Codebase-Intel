# Node types — what kind of thing is this?
class NodeType:
    FILE = "file"
    FUNCTION = "function"
    CLASS = "class"
    MODULE = "module"  # external import (e.g. "jwt", "fastapi")

# Edge types — what is the relationship?
class EdgeType:
    CONTAINS = "contains"       # file contains function/class
    IMPORTS = "imports"         # file imports a module
    CALLS = "calls"             # function calls another function (future)
    INHERITS = "inherits"       # class inherits from another class (future)

# Graph metadata keys
class GraphMeta:
    REPO_PATH = "repo_path"
    TOTAL_NODES = "total_nodes"
    TOTAL_EDGES = "total_edges"