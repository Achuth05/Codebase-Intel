"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import GraphStats from "@/components/GraphStats";
import RepoGraph from "@/components/RepoGraph";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getGraphStats } from "@/services/api";
import { GraphStatsData } from "@/types/graph";
import api from "@/lib/axios";

export default function GraphPage() {
  const [repoName, setRepoName] = useState("");
  const [stats, setStats] = useState<GraphStatsData | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"stats" | "graph">("stats");

  const loadGraph = async () => {
    if (!repoName) return;
    setLoading(true);
    setError("");
    try {
      const statsData = await getGraphStats(repoName);
      setStats(statsData);

      const functionsData = await api.get(`/api/graph/${repoName}/functions`);
      const classesData = await api.get(`/api/graph/${repoName}/classes`);

      const fileSet = new Set<string>();
      functionsData.data.functions.forEach((f: any) => { if (f.file) fileSet.add(f.file); });
      classesData.data.classes.forEach((c: any) => { if (c.file) fileSet.add(c.file); });

      const nodes = [...fileSet].map((f) => ({ id: f, label: f }));
      const edges: { source: string; target: string }[] = [];

      for (const imp of statsData.most_imported.slice(0, 5)) {
        const res = await api.get(`/api/graph/${repoName}/imports`, {
          params: { module_name: imp.module }
        });
        res.data.imported_by.slice(0, 20).forEach((file: string) => {
          edges.push({ source: file, target: imp.module });
          if (!fileSet.has(imp.module)) {
            nodes.push({ id: imp.module, label: imp.module });
            fileSet.add(imp.module);
          }
        });
      }

      setGraphData({ nodes, edges });
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Failed to load graph");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "stats", label: "Stats View" },
    { key: "graph", label: "Interactive Graph" },
  ] as const;

  return (
    <AuthGuard>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Graph Explorer</h1>
          <p className="text-slate-500 text-sm">Visualize the dependency graph of any ingested repo.</p>
        </div>

        {/* Input */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadGraph()}
            placeholder="repo name (e.g. micrograd)"
            className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400"
          />
          <button
            onClick={loadGraph}
            disabled={loading || !repoName}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
          >
            {loading ? "Loading..." : "Load Graph"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {graphData && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setView(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    view === t.key
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {view === "stats" && stats && <GraphStats data={stats} />}
            {view === "graph" && <RepoGraph repoName={repoName} graphData={graphData} />}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}