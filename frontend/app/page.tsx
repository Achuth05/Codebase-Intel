"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400 mb-4">Codebase Intel</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Understand your codebase faster with AI</h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-8">
          Ingest repositories, explore architecture, analyze impact, and generate documentation from one intelligent UI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-gray-700 text-gray-100 hover:border-blue-500 hover:text-white transition"
          >
            Sign in
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 text-left">
            <h2 className="text-lg font-semibold text-white mb-3">Ingest repos</h2>
            <p className="text-gray-400 text-sm leading-6">
              Analyze your repository structure, symbols, and dependencies with one click.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 text-left">
            <h2 className="text-lg font-semibold text-white mb-3">Explore architecture</h2>
            <p className="text-gray-400 text-sm leading-6">
              Visualize import graphs and drill into file relationships instantly.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 text-left">
            <h2 className="text-lg font-semibold text-white mb-3">Generate docs</h2>
            <p className="text-gray-400 text-sm leading-6">
              Auto-create README-style documentation for your codebase in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}