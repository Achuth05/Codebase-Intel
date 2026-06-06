import api from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import {
  IngestResponse,
  AskResponse,
  ImpactResponse,
  ReadmeResponse,
} from "@/types/api";
import { GraphStatsData, FileSummary } from "@/types/graph";

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

// Ingest
export const ingestRepo = async (github_url: string): Promise<IngestResponse> => {
  const user_id = await getUserId();
  const res = await api.post("/api/ingest", { github_url, user_id });
  return res.data;
};

// Ask
export const askQuestion = async (
  repo_name: string,
  question: string,
  k: number = 5
): Promise<AskResponse> => {
  const user_id = await getUserId();
  const res = await api.post("/api/ask", { repo_name, question, k, user_id });
  return res.data;
};

export const resetMemory = async (repo_name: string): Promise<void> => {
  await api.delete(`/api/ask/${repo_name}/memory`);
};

// Graph
export const getGraphStats = async (repo_name: string): Promise<GraphStatsData> => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/most-imported`, {
    params: { user_id }
  });
  return res.data;
};

export const getFileSummary = async (
  repo_name: string,
  file_path: string
): Promise<FileSummary> => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/file`, {
    params: { file_path, user_id },
  });
  return res.data;
};

// Impact
export const getImpact = async (
  repo_name: string,
  file_path: string
): Promise<ImpactResponse> => {
  const user_id = await getUserId();
  const res = await api.get(`/api/impact/${repo_name}/file`, {
    params: { file_path, user_id },
  });
  return res.data;
};

export const generateReadme = async (repo_name: string): Promise<ReadmeResponse> => {
  const user_id = await getUserId();
  const res = await api.get(`/api/docs/${repo_name}/readme`, { params: { user_id } });
  return res.data;
};

export const askQuestionStream = async (
  repo_name: string,
  question: string,
  onChunk: (text: string) => void,
  onSources: (sources: string[]) => void,
  onDone: () => void
): Promise<void> => {
  // Get token from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ask/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
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
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/functions`, { params: { user_id } });
  return res.data;
};

export const getAllClasses = async (repo_name: string) => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/classes`, { params: { user_id } });
  return res.data;
};

export const getFilesImporting = async (repo_name: string, module: string) => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/imports`, {
    params: { module_name: module, user_id }
  });
  return res.data;
};

export const getFileDescription = async (repo_name: string, file_path: string) => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/file-description`, {
    params: { file_path, user_id }
  });
  return res.data;
};

export const getIngestProgress = async (repo_name: string) => {
  const user_id = await getUserId();
  const res = await api.get(`/api/ingest/progress/${repo_name}`, { params: { user_id } });
  return res.data;
};

export const getFunctionDescription = async (
  repo_name: string,
  file_path: string,
  function_name: string
) => {
  const user_id = await getUserId();
  const res = await api.get(`/api/graph/${repo_name}/function-description`, {
    params: { file_path, function_name, user_id }
  });
  return res.data;
};