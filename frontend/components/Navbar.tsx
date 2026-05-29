import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-xl font-bold">
          Codebase Intel
        </Link>
        <div className="flex gap-6">
          <Link href="/ingest" className="text-gray-300 hover:text-white text-sm">
            Ingest
          </Link>
          <Link href="/chat" className="text-gray-300 hover:text-white text-sm">
            Chat
          </Link>
          <Link href="/graph" className="text-gray-300 hover:text-white text-sm">
            Graph
          </Link>
          <Link href="/impact" className="text-gray-300 hover:text-white text-sm">
            Impact
          </Link>
          <Link href="/docs" className="text-gray-300 hover:text-white text-sm">
            Docs
          </Link>
        </div>
      </div>
    </nav>
  );
}