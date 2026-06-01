import AuthGuard from "@/components/AuthGuard";

export default function AboutPage() {
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">About</h1>
          <p className="text-gray-400">What is Codebase Intel and how it works.</p>
        </div>

        <div className="space-y-6">
          {[
            {
              title: "What is Codebase Intel?",
              content: "Codebase Intel is an AI-powered tool that helps developers understand any GitHub codebase in plain English. Paste a repo URL and ask anything — it gives accurate answers with file citations."
            },
            {
              title: "How does it work?",
              content: "When you ingest a repo, it clones it, parses every file, chunks the code, generates embeddings using HuggingFace, and stores them in ChromaDB. It also builds a knowledge graph of all functions, classes, and imports. When you ask a question, it retrieves the most relevant chunks and passes them to Groq's LLM to generate an answer."
            },
            {
              title: "What is Impact Analysis?",
              content: "Impact analysis uses the knowledge graph to find which files depend on a given file. If you change auth.py, it tells you which other files might break — directly and indirectly."
            },
            {
              title: "Tech Stack",
              content: "FastAPI · LangChain · ChromaDB · HuggingFace Embeddings · Groq LLM · NetworkX · Next.js · TypeScript · Supabase · Docker"
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-white font-medium mb-3">{item.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}