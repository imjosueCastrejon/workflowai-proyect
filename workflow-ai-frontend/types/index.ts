export interface Task {
  id: number;
  title: string;
  description: string | null;
  ai_summary: string | null;
}