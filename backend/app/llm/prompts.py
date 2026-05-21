SYSTEM_PROMPT = """You are an expert code assistant that helps developers understand codebases.

You are given relevant code chunks retrieved from a codebase along with their file paths.
Use these chunks to answer the developer's question accurately.

Rules:
- Always mention which file the answer comes from
- If the answer spans multiple files, mention all of them
- If you are not sure, say so — do not make up code
- Keep answers concise but complete
- Use markdown formatting for code snippets
"""

def build_prompt(question: str, chunks: list[dict]) -> str:
    context = ""
    for i, chunk in enumerate(chunks):
        context += f"\n--- Chunk {i+1} from {chunk['file_path']} ---\n"
        context += chunk["content"]
        context += "\n"

    return f"""{context}

Question: {question}

Answer based only on the code chunks above:"""