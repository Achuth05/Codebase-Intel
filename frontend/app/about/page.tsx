import AuthGuard from "@/components/AuthGuard";

export default function AboutPage() {
  const cards = [
    {
      
      title: "What is Codebase Intel?",
      content: "Codebase Intel is an AI-powered developer tool that enables deep semantic understanding of any GitHub repository. Ask questions in plain English and receive precise, cited answers drawn directly from the source code."
    },
    {
      
      title: "How does it work?",
      content: "Repositories are cloned, parsed, and chunked using language-aware splitting. Code embeddings are generated via HuggingFace and stored in Supabase pgvector. A knowledge graph maps all symbols and dependencies. At query time, relevant chunks are retrieved and passed to Groq's LLM to generate accurate, file-cited responses."
    },
    {
      
      title: "Impact Analysis",
      content: "The knowledge graph powers change impact analysis — identifying which files and modules are directly or indirectly affected when a given file changes. Essential for refactoring, code review, and understanding ripple effects across large codebases."
    },
    {
      
      title: "Tech Stack",
      content: "FastAPI · LangChain · Supabase pgvector · HuggingFace Embeddings · Groq LLM (Llama 3.3) · NetworkX · tree-sitter · Next.js 15 · TypeScript · Supabase Auth · Docker"
    },
  ];

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">About</h1>
          <p className="text-slate-500 text-sm">
            Codebase Intel — AI-powered codebase understanding for engineering teams.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <h2 className="text-slate-900 font-semibold text-sm mb-2">{card.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{card.content}</p>
            </div>
          ))}
        </div>

        {/* Capabilities strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "RAG Pipeline", desc: "Retrieval-augmented generation over source code" },
            { label: "Knowledge Graph", desc: "AST-based symbol and dependency extraction" },
            { label: "Per-user Isolation", desc: "Supabase Auth with row-level security" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-slate-900 text-xs font-semibold mb-1">{item.label}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-indigo-600 text-sm text-center font-medium">
            Built on FastAPI · LangChain · Supabase · Next.js
          </p>
        </div>

      </div>
    </AuthGuard>
  );
}