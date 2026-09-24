import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { deleteTask, getTasks } from "../api/tasks";
import { getErrorMessage } from "../api/client";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { formatDate, isOverdue } from "../utils/date";
import {
  PRIORITIES,
  PRIORITY_META,
  SORT_OPTIONS,
  STATUSES,
  STATUS_META,
} from "../utils/constants";
import type { SortKey, Task, TaskFilters, TaskPriority, TaskStatus } from "../types";

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      const filters: TaskFilters = {
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        category: category || undefined,
        sort,
        order,
      };
      const data = await getTasks(filters);
      setTasks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, priority, category, sort, order]);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category))).sort(),
    [tasks]
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      toast.success("Task deleted");
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const toggleOrder = () => setOrder((o) => (o === "asc" ? "desc" : "asc"));

  const hasFilters = Boolean(search || status || priority || category);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Tasks</h2>
          <p className="text-sm text-slate-500">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} found
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>

          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <button
              className="btn-ghost shrink-0 px-3"
              onClick={toggleOrder}
              title={order === "asc" ? "Ascending" : "Descending"}
            >
              {order === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {hasFilters && (
          <button
            className="mt-3 text-sm font-medium text-brand hover:underline"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setStatus("");
              setPriority("");
              setCategory("");
              setSort("createdAt");
              setOrder("desc");
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks found"
            description={
              hasFilters
                ? "Try adjusting or clearing your search filters."
                : "Create your first task to get started."
            }
            action={
              <button className="btn-primary" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New task
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Task</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Priority</th>
                  <th className="px-5 py-3.5 font-semibold">Due date</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <tr key={task.id} className="transition hover:bg-slate-50/70">
                      <td className="max-w-80 px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        {task.description && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">{task.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {task.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${STATUS_META[task.status].badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[task.status].dot}`} />
                          {STATUS_META[task.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${PRIORITY_META[task.priority].badge}`}
                        >
                          {PRIORITY_META[task.priority].label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 text-xs ${
                            overdue ? "font-semibold text-rose-600" : "text-slate-500"
                          }`}
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(task.dueDate)}
                          {overdue && " • Overdue"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(task)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand/10 hover:text-brand"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(task)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        defaultStatus={status || "todo"}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        message={`"${deleteTarget?.title}" will be permanently removed.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Tasks;