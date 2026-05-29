"use client";
import { useState } from "react";
import ImpactCard from "@/components/ImpactCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getImpact } from "@/services/api";
import { ImpactResponse } from "@/types/api";

export default function ImpactPage() {
  const [repoName, setRepoName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [result, setResult] = useState<ImpactResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!repoName || !filePath) return;
    setLoading(true);
    setError("");
    try {
      const data = await getImpact(repoName, filePath);
      setResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Impact Analysis</h1>
        <p className="text-gray-400">Find out what breaks if you change a file.</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="repo name (e.g. fastapi)"
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-3">
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="file path (e.g. fastapi/applications.py)"
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={analyze}
            disabled={loading || !repoName || !filePath}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Analyze
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {result && <ImpactCard data={result} />}
    </div>
  );
}