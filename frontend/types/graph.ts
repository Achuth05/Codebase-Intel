export interface GraphStatsData {
  most_imported: { module: string; imported_by: number }[];
}

export interface FileSummary {
  file: string;
  functions: string[];
  classes: string[];
  imports: string[];
}

export interface GraphNode {
  id: string;
  type: "file" | "module";
  label: string;
  functions?: string[];
  classes?: string[];
  imports?: string[];
  language?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}