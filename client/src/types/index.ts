export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type SortKey = "createdAt" | "dueDate" | "priority" | "title";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  category?: string;
  sort?: SortKey;
  order?: "asc" | "desc";
}

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdue: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byCategory: { name: string; count: number }[];
  tasksPerDay: {
    date: string;
    done: number;
    created: number;
    inProgress: number;
  }[];
}