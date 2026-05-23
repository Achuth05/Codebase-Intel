import re

def format_response(answer: str, sources: list[str]) -> dict:
    # Clean up any excessive newlines
    answer = re.sub(r'\n{3,}', '\n\n', answer).strip()

    # Generate follow-up question suggestions based on answer
    follow_ups = generate_follow_ups(answer)

    return {
        "answer": answer,
        "sources": sources,
        "follow_up_questions": follow_ups
    }


def generate_follow_ups(answer: str) -> list[str]:
    """Generate 3 relevant follow-up questions based on the answer"""
    follow_ups = []

    if "class" in answer.lower():
        follow_ups.append("What methods does this class have?")
    if "import" in answer.lower():
        follow_ups.append("Which other files use this import?")
    if "function" in answer.lower() or "def " in answer.lower():
        follow_ups.append("Where is this function called?")
    if "authentication" in answer.lower() or "auth" in answer.lower():
        follow_ups.append("How are the routes protected?")
    if "database" in answer.lower() or "db" in answer.lower():
        follow_ups.append("What database models are defined?")

    return follow_ups[:3]