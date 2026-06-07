
from app.config import GROQ_API_KEY
from app.graph.graph_queries import get_most_imported, get_all_classes



def summarize_architecture(repo_name: str, G, parsed_files: list[dict]) -> str:
    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)
    total_files = len(parsed_files)
    languages = {}
    for f in parsed_files:
        lang = f.get("language", "unknown")
        languages[lang] = languages.get(lang, 0) + 1

    top_imports = get_most_imported(G, top_n=5)
    all_classes = get_all_classes(G)
    total_classes = len(all_classes)

    context = f"""
Repository: {repo_name}
Total files: {total_files}
Languages: {languages}
Total classes: {total_classes}
Top dependencies: {[i['module'] for i in top_imports]}
Sample classes: {[c['class'] for c in all_classes[:10]]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a senior software architect. Given codebase metadata, write a concise technical architecture summary."
            },
            {
                "role": "user",
                "content": f"Write a technical architecture summary for this codebase:\n{context}"
            }
        ],
        temperature=0.3,
        max_tokens=1024
    )

    return response.choices[0].message.content