"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
          Codebase Intel
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6 max-w-3xl">
          Understand any codebase
          <span className="text-indigo-600"> instantly</span>
        </h1>

        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Ingest repositories, explore architecture, analyze impact, and chat with your code — all from one intelligent interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-200"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
          >
            Sign in
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-3 w-full max-w-4xl">
          {[
            {
              icon: "⚡",
              title: "Ingest repos",
              desc: "Clone, parse, and index any public GitHub repository in minutes.",
            },
            {
              icon: "🗺️",
              title: "Explore architecture",
              desc: "Visualize import graphs and drill into file relationships instantly.",
            },
            {
              icon: "📄",
              title: "Generate docs",
              desc: "Auto-create README-style documentation for your codebase in seconds.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white border border-slate-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h2 className="text-sm font-semibold text-slate-900 mb-2">{card.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-slate-400 text-xs">
        © {new Date().getFullYear()} Codebase Intel. Built with FastAPI, LangChain & Next.js.
      </footer>
    </div>
  );
}