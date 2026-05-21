def extract_symbols(parsed_file: dict) -> dict:
    """
    Takes the output of parse_file() and returns
    clean structured metadata for graph building.
    """
    return {
        "file_path": parsed_file.get("file_path", ""),
        "language": parsed_file.get("language", ""),
        "functions": list(set(parsed_file.get("functions", []))),
        "classes": list(set(parsed_file.get("classes", []))),
        "imports": list(set(parsed_file.get("imports", []))),
    }