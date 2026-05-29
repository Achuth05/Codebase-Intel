export interface IngestResponse {
  status: string;
  repo_name: string;
  repo_path: string;
  total_files: number;
  total_chunks: number;
  graph_nodes: number;
  graph_edges: number;
  errors: string[];
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: string[];
  follow_up_questions: string[];
}

export interface ImpactResponse {
  file: string;
  symbols_defined: { name: string; type: string }[];
  direct_dependents: string[];
  indirect_dependents: string[];
  total_impact: number;
}

export interface ReadmeResponse {
  repo_name: string;
  readme: string;
  saved_to: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  follow_up_questions?: string[];
}