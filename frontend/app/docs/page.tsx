"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import ArchitecturePanel from "@/components/ArchitecturePanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateReadme } from "@/services/api";

export default function DocsPage() {
  const [repoName, setRepoName] = useState("");
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!repoName) return;
    setLoading(true);
    setError("");
    try {
      const data = await generateReadme(repoName);
      setReadme(data.readme);
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || "Something went wrong";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Documentation</h1>
          <p className="text-slate-500 text-sm">Auto-generate a README for any ingested repo.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="repo name (e.g. fastapi)"
            className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400"
          />
          <button
            onClick={generate}
            disabled={loading || !repoName}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all duration-200"
          >
            Generate README
          </button>
        </div>

        {loading && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <LoadingSpinner />
            <p className="text-emerald-600 text-sm font-medium mt-3">Analyzing architecture...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {readme && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <ArchitecturePanel readme={readme} />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}