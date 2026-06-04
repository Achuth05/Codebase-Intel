import AuthGuard from "@/components/AuthGuard";

export default function AboutPage() {
  const cards = [
    {
      icon: "🤖",
      title: "What is Codebase Intel?",
      content: "Codebase Intel is an AI-powered tool that helps developers understand any GitHub codebase in plain English. Paste a repo URL and ask anything — it gives accurate answers with file citations."
    },
    {
      icon: "⚙️",
      title: "How does it work?",
      content: "When you ingest a repo, it clones it, parses every file, chunks the code, generates embeddings using HuggingFace, and stores them in ChromaDB. It also builds a knowledge graph of all functions, classes, and imports. When you ask a question, it retrieves the most relevant chunks and passes them to Groq's LLM to generate an answer."
    },
    {
      icon: "💥",
      title: "What is Impact Analysis?",
      content: "Impact analysis uses the knowledge graph to find which files depend on a given file. If you change auth.py, it tells you which other files might break — directly and indirectly."
    },
    {
      icon: "🛠️",
      title: "Tech Stack",
      content: "FastAPI · LangChain · ChromaDB · HuggingFace Embeddings · Groq LLM · NetworkX · Next.js · TypeScript · Supabase · Docker"
    },
  ];

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">About</h1>
          <p className="text-slate-500 text-sm">What is Codebase Intel and how it works.</p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h2 className="text-slate-900 font-semibold text-sm mb-2">{card.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{card.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-indigo-600 text-sm text-center">
            Built with ❤️ using FastAPI, LangChain, and Next.js
          </p>
        </div>

      </div>
    </AuthGuard>
  );
}