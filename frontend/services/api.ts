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

export const askQuestionStream = async (
  repo_name: string,
  question: string,
  onChunk: (text: string) => void,
  onSources: (sources: string[]) => void,
  onDone: () => void
): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ask/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_name, question }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Check if sources marker arrived
    if (buffer.includes("__SOURCES__")) {
      const [text, sourcesPart] = buffer.split("__SOURCES__");
      onChunk(text);
      const sources = sourcesPart.split(",").filter(Boolean);
      onSources(sources);
      buffer = "";
    } else {
      onChunk(buffer);
      buffer = "";
    }
  }

  onDone();
};

export const getAllFunctions = async (repo_name: string) => {
  const res = await api.get(`/api/graph/${repo_name}/functions`);
  return res.data;
};

export const getAllClasses = async (repo_name: string) => {
  const res = await api.get(`/api/graph/${repo_name}/classes`);
  return res.data;
};

export const getFilesImporting = async (repo_name: string, module: string) => {
  const res = await api.get(`/api/graph/${repo_name}/imports`, {
    params: { module_name: module }
  });
  return res.data;
};

export const getFileDescription = async (repo_name: string, file_path: string) => {
  const res = await api.get(`/api/graph/${repo_name}/file-description`, {
    params: { file_path }
  });
  return res.data;
};