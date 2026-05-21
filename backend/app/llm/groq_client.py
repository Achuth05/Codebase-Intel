from groq import Groq
from app.config import GROQ_API_KEY
from app.llm.prompts import SYSTEM_PROMPT, build_prompt

client = Groq(api_key=GROQ_API_KEY)

def ask_groq(question: str, chunks: list[dict]) -> str:
    prompt = build_prompt(question, chunks)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=1024
    )

    return response.choices[0].message.content