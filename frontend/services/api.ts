import api from "@/lib/axios";
import {
  IngestResponse,
  AskResponse,
  ImpactResponse,
  ReadmeResponse,
} from "@/types/api";
import { GraphStatsData, FileSummary } from "@/types/graph";

// Ingest
export const ingestRepo = async (github_url: string): Promise<IngestResponse> => {
  const res = await api.post("/api/ingest", { github_url });
  return res.data;
};

// Ask
export const askQuestion = async (
  repo_name: string,
  question: string,
  k: number = 5
): Promise<AskResponse> => {
  const res = await api.post("/api/ask", { repo_name, question, k });
  return res.data;
};

export const resetMemory = async (repo_name: string): Promise<void> => {
  await api.delete(`/api/ask/${repo_name}/memory`);
};

// Graph
export const getGraphStats = async (repo_name: string): Promise<GraphStatsData> => {
  const res = await api.get(`/api/graph/${repo_name}/most-imported`);
  return res.data;
};

export const getFileSummary = async (
  repo_name: string,
  file_path: string
): Promise<FileSummary> => {
  const res = await api.get(`/api/graph/${repo_name}/file`, {
    params: { file_path },
  });
  return res.data;
};

// Impact
export const getImpact = async (
  repo_name: string,
  file_path: string
): Promise<ImpactResponse> => {
  const res = await api.get(`/api/impact/${repo_name}/file`, {
    params: { file_path },
  });
  return res.data;
};

// Docs
export const generateReadme = async (repo_name: string): Promise<ReadmeResponse> => {
  const res = await api.get(`/api/docs/${repo_name}/readme`);
  return res.data;
};