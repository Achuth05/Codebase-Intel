"use client";
import { useState } from "react";
import RepoInput from "@/components/RepoInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { IngestResponse } from "@/types/api";
import api from "@/lib/axios";
import AuthGuard from "@/components/AuthGuard";

export default function IngestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState("");
  const [force, setForce] = useState(false);

  const handleIngest = async (url: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/api/ingest", { github_url: url, force });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Ingest Repository</h1>
      <p className="text-gray-400 mb-8">
        Paste a public GitHub URL to clone, parse, and index the codebase.
      </p>

      <RepoInput onSubmit={handleIngest} loading={loading} buttonText="Ingest" />

      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id="force"
          checked={force}
          onChange={(e) => setForce(e.target.checked)}
          className="w-4 h-4 accent-blue-500"
        />
        <label htmlFor="force" className="text-gray-400 text-sm">
          Force re-index (use if repo has changed)
        </label>
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <LoadingSpinner />
          <p className="text-gray-400 text-sm mt-2">
            Cloning, parsing, and embedding... this takes 2-5 minutes.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <h2 className="text-white font-medium">{result.repo_name}</h2>
            {result.status === "already_ingested" && (
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                Already indexed
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { label: "Files", value: result.total_files },
              { label: "Chunks", value: result.total_chunks },
              { label: "Graph nodes", value: result.graph_nodes },
              { label: "Graph edges", value: result.graph_edges },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="text-white text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <p className="text-yellow-400 text-xs">{result.errors.length} files had errors</p>
          )}
        </div>
      )}
    </div>
    </AuthGuard>
  );
}