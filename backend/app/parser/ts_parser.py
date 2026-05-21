import ast
import re
from tree_sitter import Language, Parser
from tree_sitter_javascript import language as javascript_language
from tree_sitter_typescript import language_typescript, language_tsx

def parse_python(content: str) -> dict:
    functions = []
    classes = []
    imports = []

    try:
        tree = ast.parse(content)
    except SyntaxError:
        return {"functions": [], "classes": [], "imports": []}

    for node in ast.walk(tree):
        # Extract function names
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

        # Extract class names
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)

        # Extract imports
        elif isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)

        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                imports.append(f"{module}.{alias.name}")

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports
    }


def parse_js_ts(content: str, ext: str) -> dict:
    functions = []
    classes = []
    imports = []

    parser = Parser()
    # Select grammar based on file type
    if ext in ("ts", "tsx"):
        if ext == "tsx":
            parser.language = Language(language_tsx())
        else:
            parser.language = Language(language_typescript())
    else:
        parser.language = Language(javascript_language())

    tree = parser.parse(bytes(content, "utf8"))

    def walk(node):
        # Function declarations
        if node.type in (
            "function_declaration",
            "method_definition",
            "generator_function_declaration"
        ):
            name_node = node.child_by_field_name("name")
            if name_node:
                functions.append(
                    content[name_node.start_byte:name_node.end_byte]
                )

        # Variable declarations with arrow functions
        elif node.type == "lexical_declaration":
            text = content[node.start_byte:node.end_byte]

            if "=>" in text:
                for child in node.children:
                    if child.type == "variable_declarator":
                        name_node = child.child_by_field_name("name")
                        if name_node:
                            functions.append(
                                content[name_node.start_byte:name_node.end_byte]
                            )

        # Class declarations
        elif node.type == "class_declaration":
            name_node = node.child_by_field_name("name")
            if name_node:
                classes.append(
                    content[name_node.start_byte:name_node.end_byte]
                )

        # Import statements
        elif node.type == "import_statement":
            text = content[node.start_byte:node.end_byte]

            match = re.search(r"['\"](.+?)['\"]", text)
            if match:
                imports.append(match.group(1))

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return {
        "functions": list(set(functions)),
        "classes": list(set(classes)),
        "imports": list(set(imports)),
    }

def parse_file(file_path: str, content: str) -> dict:
    ext = file_path.rsplit(".", 1)[-1].lower()

    if ext == "py":
        symbols = parse_python(content)
    elif ext in ("js", "ts", "jsx", "tsx"):
        symbols = parse_js_ts(content, ext)
    else:
        # For .md, .json, .yaml etc — no symbols to extract
        symbols = {"functions": [], "classes": [], "imports": []}

    return {
        "file_path": file_path,
        "language": ext,
        "functions": symbols["functions"],
        "classes": symbols["classes"],
        "imports": symbols["imports"],
    }