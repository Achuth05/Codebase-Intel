"use client";
import { useState } from "react";
import RepoInput from "@/components/RepoInput";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { IngestResponse } from "@/types/api";
import api from "@/lib/axios";

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
      // Get user_id from Supabase
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Not authenticated");
      
      const res = await api.post("/api/ingest", { github_url: url, force, user_id: userId });
      setResult(res.data);
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || "Something went wrong";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Ingest Repository</h1>
          <p className="text-slate-500 text-sm">
            Paste a public GitHub URL to clone, parse, and index the codebase.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
          <RepoInput onSubmit={handleIngest} loading={loading} buttonText="Ingest" />

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="force"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="force" className="text-slate-500 text-sm cursor-pointer select-none">
              Force re-index <span className="text-slate-400">(use if repo has changed)</span>
            </label>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <LoadingSpinner />
            <p className="text-indigo-600 text-sm font-medium mt-3">
              Cloning, parsing, and embedding...
            </p>
            <p className="text-slate-400 text-xs mt-1">
              This takes 2–5 minutes depending on repo size.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">✓</span>
              </div>
              <div>
                <h2 className="text-slate-900 font-semibold">{result.repo_name}</h2>
                <p className="text-slate-400 text-xs">
                  {result.status === "already_ingested" ? "Already indexed — returned from cache" : "Successfully ingested"}
                </p>
              </div>
              {result.status === "already_ingested" && (
                <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                  Cached
                </span>
              )}
            </div>

            {result.status !== "already_ingested" && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Files parsed", value: result.total_files },
                  { label: "Chunks stored", value: result.total_chunks },
                  { label: "Graph nodes", value: result.graph_nodes },
                  { label: "Graph edges", value: result.graph_edges },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                    <p className="text-slate-900 text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <p className="text-amber-600 text-xs mt-4 flex items-center gap-1">
                <span>⚠</span> {result.errors.length} files had parsing errors
              </p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}