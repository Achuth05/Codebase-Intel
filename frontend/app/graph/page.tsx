"use client";
import { useState } from "react";
import GraphStats from "@/components/GraphStats";
import RepoGraph from "@/components/RepoGraph";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getGraphStats, getFileSummary } from "@/services/api";
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
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Not authenticated");

      // Load stats
      const statsData = await getGraphStats(repoName);
      setStats(statsData);

      // Load all functions to build node list
      const functionsData = await api.get(`/api/graph/${repoName}/functions`, { params: { user_id: userId } });
      const classesData = await api.get(`/api/graph/${repoName}/classes`, { params: { user_id: userId } });

      // Build unique file nodes from functions and classes
      const fileSet = new Set<string>();
      functionsData.data.functions.forEach((f: any) => {
        if (f.file) fileSet.add(f.file);
      });
      classesData.data.classes.forEach((c: any) => {
        if (c.file) fileSet.add(c.file);
      });

      const nodes = [...fileSet].map((f) => ({ id: f, label: f }));

      // Build edges from most imported modules
      const edges: { source: string; target: string }[] = [];
      for (const imp of statsData.most_imported.slice(0, 5)) {
        const res = await api.get(
          `/api/graph/${repoName}/imports`,
          { params: { module_name: imp.module, user_id: userId } }
        );
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
      const errorMsg = e.response?.data?.detail || e.message || "Failed to load graph";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Graph Explorer</h1>
        <p className="text-gray-400">
          Visualize the dependency graph of any ingested repo.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="repo name (e.g. micrograd)"
          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={loadGraph}
          disabled={loading || !repoName}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Loading..." : "Load Graph"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {graphData && (
        <>
          <div className="flex gap-3">
            <button
              onClick={() => setView("graph")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "graph"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setView("stats")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "stats"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Stats View
            </button>
          </div>

          {view === "graph" && (
            <RepoGraph repoName={repoName} graphData={graphData} />
          )}
          {view === "stats" && stats && <GraphStats data={stats} />}
        </>
      )}
    </div>
  );
}