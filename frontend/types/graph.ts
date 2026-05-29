export interface GraphStatsData {
  most_imported: { module: string; imported_by: number }[];
}

export interface FileSummary {
  file: string;
  functions: string[];
  classes: string[];
  imports: string[];
}