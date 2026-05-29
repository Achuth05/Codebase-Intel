import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-bold text-white mb-4">
        Codebase Intel
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-xl">
        Paste a GitHub URL and ask anything about the codebase in plain English.
        Not grep. Actual understanding.
      </p>
      <div className="flex gap-4">
        <Link
          href="/ingest"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
        >
          Get Started
        </Link>
        <Link
          href="/chat"
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition"
        >
          Start Chatting
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl">
        {[
          { title: "Ingest", desc: "Clone and index any GitHub repo" },
          { title: "Chat", desc: "Ask questions in plain English" },
          { title: "Impact", desc: "See what breaks if you change a file" },
        ].map((item) => (
          <div key={item.title} className="bg-gray-800 rounded-lg p-5 text-left">
            <h3 className="text-white font-medium mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}