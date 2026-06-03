"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import ArchitecturePanel from "@/components/ArchitecturePanel";
import GraphStats from "@/components/GraphStats";
import RepoGraph from "@/components/RepoGraph";
import ImpactCard from "@/components/ImpactCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExportPDF from "@/components/ExportPDF";
import { getGraphStats, getFileSummary, getImpact, generateReadme } from "@/services/api";
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
  const [view, setView] = useState<"stats" | "graph" | "docs">("stats");
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionDesc, setFunctionDesc] = useState<{ function: string; description: string } | null>(null);
  const [loadingFuncDesc, setLoadingFuncDesc] = useState(false);
  const [docsReadme, setDocsReadme] = useState<string | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState("");

  const loadRepo = async () => {
    if (!repoName) return;
    setLoading(true);
    setError("");
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error("Not authenticated");

      const statsData = await getGraphStats(repoName);
      setStats(statsData);

      const functionsData = await api.get(`/api/graph/${repoName}/functions`, { params: { user_id: userId } });
      const classesData = await api.get(`/api/graph/${repoName}/classes`, { params: { user_id: userId } });

      const fileSet = new Set<string>();
      functionsData.data.functions.forEach((f: any) => { if (f.file) fileSet.add(f.file); });
      classesData.data.classes.forEach((c: any) => { if (c.file) fileSet.add(c.file); });

      const nodes = [...fileSet].map((f) => ({ id: f, label: f }));
      const edges: { source: string; target: string }[] = [];

      for (const imp of statsData.most_imported.slice(0, 5)) {
        const res = await api.get(`/api/graph/${repoName}/imports`, { params: { module_name: imp.module, user_id: userId } });
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
      const errorMsg = e.response?.data?.detail || e.message || "Repo not found. Please ingest it first.";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
      setDocsReadme(null);
      setDocsError("");
      setView("stats");
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
      const errorMsg = e.response?.data?.detail || e.message || "File not found in graph.";
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
      setFileSummary(null);
      setImpact(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDocs = async () => {
    if (!repoName || docsReadme) return;
    setDocsLoading(true);
    setDocsError("");
    try {
      const data = await generateReadme(repoName);
      setDocsReadme(data.readme);
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || "Could not load documentation.";
      setDocsError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setDocsLoading(false);
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
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || e.message || "Could not load description.";
      setFunctionDesc({ function: funcName, description: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg) });
    } finally {
      setLoadingFuncDesc(false);
    }
  };

  const tabs = [
    { key: "stats", label: "Stats" },
    { key: "graph", label: "Interactive Graph" },
    { key: "docs", label: "Documentation" },
  ] as const;

  return (
    <AuthGuard>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Details</h1>
            <p className="text-slate-500 text-sm">Graph, impact analysis and file insights.</p>
          </div>
          {(stats || impact) && (
            <ExportPDF repoName={repoName} graphStats={stats} impactData={impact} fileSummary={fileSummary} />
          )}
        </div>

        {/* Repo loader */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRepo()}
            placeholder="repo name (e.g. micrograd)"
            className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400"
          />
          <button
            onClick={loadRepo}
            disabled={loading || !repoName}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
          >
            Load
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {/* Graph section */}
        {graphData && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={async () => {
                    setView(t.key);
                    if (t.key === "docs") await loadDocs();
                  }}
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
            {view === "docs" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-slate-900 font-semibold mb-1">Documentation</h2>
                <p className="text-slate-400 text-sm mb-4">Auto-generated architecture overview.</p>
                {docsLoading && <LoadingSpinner />}
                {docsError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{docsError}</p>
                  </div>
                )}
                {docsReadme && !docsLoading && <ArchitecturePanel readme={docsReadme} />}
                {!docsReadme && !docsLoading && !docsError && (
                  <p className="text-slate-400 text-sm">Generating documentation...</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* File Analysis */}
        {repoName && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">File Analysis</h2>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex gap-3">
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadFileDetails()}
                placeholder="file path (e.g. micrograd/engine.py)"
                className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400"
              />
              <button
                onClick={loadFileDetails}
                disabled={loading || !filePath}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-violet-100 hover:shadow-violet-200 transition-all duration-200"
              >
                Analyze
              </button>
            </div>

            {fileSummary && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-1 rounded-lg">
                    {fileSummary.file}
                  </span>
                </div>

                {/* Functions */}
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-2">
                    Functions ({fileSummary.functions.length}) — click to see description
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fileSummary.functions.map((f: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleFunctionClick(f)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all duration-150 ${
                          selectedFunction === f
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {loadingFuncDesc && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 text-xs">Loading description...</p>
                    </div>
                  )}

                  {functionDesc && !loadingFuncDesc && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-amber-700 text-xs font-semibold mb-1">⚡ {functionDesc.function}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{functionDesc.description}</p>
                    </div>
                  )}
                </div>

                {/* Classes */}
                {fileSummary.classes.length > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-2">
                      Classes ({fileSummary.classes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fileSummary.classes.map((cls, i) => (
                        <span key={i} className="text-xs font-mono bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-lg">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imports */}
                {fileSummary.imports.length > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-2">
                      Imports ({fileSummary.imports.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fileSummary.imports.map((imp, i) => (
                        <span key={i} className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          {imp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {impact && <ImpactCard data={impact} />}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}