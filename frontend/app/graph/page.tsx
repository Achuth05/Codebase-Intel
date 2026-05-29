"use client";
import { useState } from "react";
import GraphStats from "@/components/GraphStats";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getGraphStats, getFileSummary } from "@/services/api";
import { GraphStatsData, FileSummary } from "@/types/graph";

export default function GraphPage() {
  const [repoName, setRepoName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [stats, setStats] = useState<GraphStatsData | null>(null);
  const [fileSummary, setFileSummary] = useState<FileSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    if (!repoName) return;
    setLoading(true);
    try {
      const data = await getGraphStats(repoName);
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const loadFileSummary = async () => {
    if (!repoName || !filePath) return;
    setLoading(true);
    try {
      const data = await getFileSummary(repoName, filePath);
      setFileSummary(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Graph Explorer</h1>
        <p className="text-gray-400">Explore the dependency graph of any ingested repo.</p>
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
          onClick={loadStats}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          Load Stats
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {stats && <GraphStats data={stats} />}

      <div className="flex gap-3">
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="file path (e.g. fastapi/applications.py)"
          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={loadFileSummary}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          Inspect File
        </button>
      </div>

      {fileSummary && (
        <div className="bg-gray-800 rounded-lg p-5 space-y-4">
          <h3 className="text-white font-mono text-sm">{fileSummary.file}</h3>
          {[
            { label: "Functions", items: fileSummary.functions, color: "text-yellow-300" },
            { label: "Classes", items: fileSummary.classes, color: "text-purple-300" },
            { label: "Imports", items: fileSummary.imports, color: "text-blue-300" },
          ].map(({ label, items, color }) => (
            <div key={label}>
              <p className="text-gray-400 text-xs mb-2">{label} ({items.length})</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <span key={i} className={`text-xs font-mono bg-gray-700 px-2 py-1 rounded ${color}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}