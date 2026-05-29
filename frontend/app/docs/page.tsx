"use client";
import { useState } from "react";
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
      setError(e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-gray-400">Auto-generate a README for any ingested repo.</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="repo name (e.g. fastapi)"
          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={generate}
          disabled={loading || !repoName}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          Generate README
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-400 text-sm mt-2">Analyzing architecture...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {readme && <ArchitecturePanel readme={readme} />}
    </div>
  );
}