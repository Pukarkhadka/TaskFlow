import { api } from "./client";
import type { Stats, Task, TaskFilters, TaskInput } from "../types";

export const getTasks = (filters: TaskFilters = {}): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("order", filters.order || "desc");
  return api.get<Task[]>(`/tasks?${params.toString()}`).then((r) => r.data);
};

export const getStats = (): Promise<Stats> => api.get<Stats>("/tasks/stats").then((r) => r.data);

export const createTask = (input: TaskInput): Promise<Task> =>
  api.post<Task>("/tasks", input).then((r) => r.data);

export const updateTask = (id: string, input: Partial<TaskInput>): Promise<Task> =>
  api.patch<Task>(`/tasks/${id}`, input).then((r) => r.data);

export const deleteTask = (id: string): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined);