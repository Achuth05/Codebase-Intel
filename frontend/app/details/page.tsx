"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import GraphStats from "@/components/GraphStats";
import RepoGraph from "@/components/RepoGraph";
import ImpactCard from "@/components/ImpactCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExportPDF from "@/components/ExportPDF";
import { getGraphStats, getFileSummary, getImpact } from "@/services/api";
import { GraphStatsData, FileSummary } from "@/types/graph";
import { ImpactResponse } from "@/types/api";
import api from "@/lib/axios";
import { getFunctionDescription } from "@/services/api";

export default function DetailsPage() {
  const [repoName, setRepoName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [stats, setStats] = useState<GraphStatsData | null>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [fileSummary, setFileSummary] = useState<FileSummary | null>(null);
  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"stats" | "graph">("stats");
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionDesc, setFunctionDesc] = useState<{ function: string; description: string } | null>(null);
  const [loadingFuncDesc, setLoadingFuncDesc] = useState(false);

  const loadRepo = async () => {
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
      setError("Repo not found. Please ingest it first.");
    } finally {
      setLoading(false);
    }
  };

  const loadFileDetails = async () => {
    if (!repoName || !filePath) return;
    setLoading(true);
    setError("");
    setSelectedFunction(null);
    setFunctionDesc(null);
    try {
      const [summary, impactData] = await Promise.all([
        getFileSummary(repoName, filePath),
        getImpact(repoName, filePath),
      ]);
      setFileSummary(summary);
      setImpact(impactData);
    } catch (e: any) {
      setError("File not found in graph.");
      setFileSummary(null);
      setImpact(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFunctionClick = async (funcName: string) => {
    if (!filePath) return;
    setSelectedFunction(funcName);
    setFunctionDesc(null);
    setLoadingFuncDesc(true);
    try {
      const data = await getFunctionDescription(repoName, filePath, funcName);
      setFunctionDesc(data);
    } catch {
      setFunctionDesc({ function: funcName, description: "Could not load description." });
    } finally {
      setLoadingFuncDesc(false);
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Details</h1>
            <p className="text-gray-400">Graph, impact analysis and file insights.</p>
          </div>
          {(stats || impact) && (
            <ExportPDF
              repoName={repoName}
              graphStats={stats}
              impactData={impact}
              fileSummary={fileSummary}
            />
          )}
        </div>

        {/* Repo loader */}
        <div className="flex gap-3">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="repo name (e.g. micrograd)"
            className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={loadRepo}
            disabled={loading || !repoName}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Load
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {/* Graph section */}
        {graphData && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setView("stats")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === "stats" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Stats View
              </button>
              <button
                onClick={() => setView("graph")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === "graph" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                Interactive Graph
              </button>
            </div>
            {view === "stats" && stats && <GraphStats data={stats} />}
            {view === "graph" && <RepoGraph repoName={repoName} graphData={graphData} />}
          </div>
        )}

        {/* File details section */}
        {repoName && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">File Analysis</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="file path (e.g. micrograd/engine.py)"
                className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={loadFileDetails}
                disabled={loading || !filePath}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
              >
                Analyze File
              </button>
            </div>

            {fileSummary && (
              <div className="bg-gray-800 rounded-lg p-5 space-y-4">
                <h3 className="text-white font-mono text-sm">{fileSummary.file}</h3>
                {/* Functions */}
                <div>
                  <p className="text-gray-400 text-xs mb-2">
                    Functions ({fileSummary.functions.length}) — click to see description
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {fileSummary.functions.map((f: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleFunctionClick(f)}
                        className={`text-xs font-mono px-2 py-1 rounded transition ${
                          selectedFunction === f
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-gray-700 hover:bg-gray-600 text-yellow-300"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {loadingFuncDesc && (
                    <div className="mt-3 bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-xs">
                          Loading description...
                        </p>
                      </div>
                    </div>
                  )}

                  {functionDesc && !loadingFuncDesc && (
                    <div className="mt-3 bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                      <p className="text-yellow-400 text-xs font-medium mb-1">
                        ⚡ {functionDesc.function}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {functionDesc.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Classes */}
                <div>
                  <p className="text-gray-400 text-xs mb-2">
                    Classes ({fileSummary.classes.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {fileSummary.classes.map((cls, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-purple-300"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Imports */}
                <div>
                  <p className="text-gray-400 text-xs mb-2">
                    Imports ({fileSummary.imports.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {fileSummary.imports.map((imp, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-blue-300"
                      >
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {impact && <ImpactCard data={impact} />}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}