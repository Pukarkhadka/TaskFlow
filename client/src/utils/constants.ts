import type { TaskPriority, TaskStatus } from "../types";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; badge: string; ring: string }
> = {
  todo: {
    label: "To Do",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600",
    ring: "border-t-slate-400",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    ring: "border-t-amber-500",
  },
  done: {
    label: "Done",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    ring: "border-t-emerald-500",
  },
};

export const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; rank: number }
> = {
  low: { label: "Low", badge: "bg-emerald-100 text-emerald-700", rank: 0 },
  medium: { label: "Medium", badge: "bg-amber-100 text-amber-700", rank: 1 },
  high: { label: "High", badge: "bg-rose-100 text-rose-700", rank: 2 },
};

export const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export const DEFAULT_CATEGORIES = ["General", "Work", "Personal", "Study", "Health"];

export const SORT_OPTIONS = [
  { value: "createdAt", label: "Created date" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
] as const;