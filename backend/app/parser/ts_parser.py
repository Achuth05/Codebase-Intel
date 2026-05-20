import ast
import re

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


def parse_js_ts(content: str) -> dict:
    functions = []
    classes = []
    imports = []

    # Match: function foo() / async function foo() / const foo = () => / const foo = function()
    func_patterns = [
        r"(?:async\s+)?function\s+(\w+)\s*\(",
        r"(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(",
        r"(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(\s*\)\s*=>",
    ]
    for pattern in func_patterns:
        functions.extend(re.findall(pattern, content))

    # Match: class Foo
    classes = re.findall(r"class\s+(\w+)", content)

    # Match: import ... from '...' / import('...')
    imports = re.findall(r"import\s+.*?from\s+['\"](.+?)['\"]", content)

    return {
        "functions": list(set(functions)),
        "classes": classes,
        "imports": imports
    }


def parse_file(file_path: str, content: str) -> dict:
    ext = file_path.rsplit(".", 1)[-1].lower()

    if ext == "py":
        symbols = parse_python(content)
    elif ext in ("js", "ts", "jsx", "tsx"):
        symbols = parse_js_ts(content)
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