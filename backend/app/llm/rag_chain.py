from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage
from app.embeddings.vector_store import load_vectorstore
from app.config import GROQ_API_KEY

# Store chain + history per repo
_chain_cache: dict = {}
_history_cache: dict = {}

def format_docs(docs):
    result = ""
    for doc in docs:
        result += f"\n--- {doc.metadata.get('file_path', '')} ---\n"
        result += doc.page_content + "\n"
    return result

def get_rag_chain(repo_name: str):
    if repo_name in _chain_cache:
        return _chain_cache[repo_name]

    vectorstore = load_vectorstore(repo_name)
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
            "chat_history": lambda x: _get_history_string(repo_name)
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    _chain_cache[repo_name] = chain
    _history_cache[repo_name] = []
    return chain


def _get_history_string(repo_name: str) -> str:
    history = _history_cache.get(repo_name, [])
    if not history:
        return "No previous conversation."
    lines = []
    for msg in history[-6:]:  # last 3 exchanges
        role = "User" if isinstance(msg, HumanMessage) else "Assistant"
        lines.append(f"{role}: {msg.content}")
    return "\n".join(lines)


def ask_chain(repo_name: str, question: str) -> dict:
    chain = get_rag_chain(repo_name)

    # Get source documents separately for citations
    vectorstore = load_vectorstore(repo_name)
    docs = vectorstore.similarity_search(question, k=5)
    sources = list(set([doc.metadata.get("file_path", "") for doc in docs]))

    answer = chain.invoke(question)

    # Save to history
    if repo_name not in _history_cache:
        _history_cache[repo_name] = []
    _history_cache[repo_name].append(HumanMessage(content=question))
    _history_cache[repo_name].append(AIMessage(content=answer))

    return {
        "answer": answer,
        "sources": sources
    }


def clear_memory(repo_name: str):
    _chain_cache.pop(repo_name, None)
    _history_cache.pop(repo_name, None)