from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage
from app.embeddings.vector_store import load_vectorstore
from app.config import GROQ_API_KEY
from typing import Generator

_chain_cache: dict = {}
_history_cache: dict = {}

def format_docs(docs):
    result = ""
    for doc in docs:
        result += f"\n--- {doc.metadata.get('file_path', '')} ---\n"
        result += doc.page_content + "\n"
    return result

def get_rag_chain(repo_name: str, user_id: str):
    key = f"{user_id}:{repo_name}"
    if key in _chain_cache:
        return _chain_cache[key]

    vectorstore = load_vectorstore(repo_name, user_id=user_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=1024
    )

    prompt = PromptTemplate.from_template("""You are an expert code assistant helping developers understand a codebase.
Use the following code chunks to answer the question.
Always mention which file the answer comes from.
If you don't know, say so — never make up code.

Context:
{context}

Chat History:
{chat_history}

Question: {question}

Answer in markdown:""")

    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
            "chat_history": lambda x: _get_history_string(key)
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    _chain_cache[key] = chain
    _history_cache[key] = []
    return chain


def _get_history_string(key: str) -> str:
    history = _history_cache.get(key, [])
    if not history:
        return "No previous conversation."
    lines = []
    for msg in history[-6:]:
        role = "User" if isinstance(msg, HumanMessage) else "Assistant"
        lines.append(f"{role}: {msg.content}")
    return "\n".join(lines)


def ask_chain(repo_name: str, question: str, user_id: str) -> dict:
    chain = get_rag_chain(repo_name, user_id)
    key = f"{user_id}:{repo_name}"

    vectorstore = load_vectorstore(repo_name, user_id=user_id)
    docs = vectorstore.similarity_search(question, k=5)
    sources = list(set([doc.metadata.get("file_path", "") for doc in docs]))

    answer = chain.invoke(question)

    if key not in _history_cache:
        _history_cache[key] = []
    _history_cache[key].append(HumanMessage(content=question))
    _history_cache[key].append(AIMessage(content=answer))

    return {"answer": answer, "sources": sources}


def clear_memory(key: str):
    _chain_cache.pop(key, None)
    _history_cache.pop(key, None)


def stream_chain(repo_name: str, question: str, user_id: str) -> Generator[str, None, None]:
    print(f"stream_chain called: repo={repo_name}, question={question}")
    key = f"{user_id}:{repo_name}"
    chain = get_rag_chain(repo_name, user_id)

    vectorstore = load_vectorstore(repo_name, user_id=user_id)
    docs = vectorstore.similarity_search(question, k=5)
    sources = list(set([doc.metadata.get("file_path", "") for doc in docs]))

    for chunk in chain.stream(question):
        if isinstance(chunk, str):
            yield chunk
        elif hasattr(chunk, 'content'):
            yield chunk.content

    if key not in _history_cache:
        _history_cache[key] = []
    _history_cache[key].append(HumanMessage(content=question))

    yield f"\n\n__SOURCES__{','.join(sources)}"