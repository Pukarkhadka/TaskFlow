import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, KanbanSquare } from "lucide-react";
import { deleteTask, getTasks, updateTask } from "../api/tasks";
import { getErrorMessage } from "../api/client";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { STATUSES, STATUS_META } from "../utils/constants";
import type { Task, TaskStatus } from "../types";

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragTask, setDragTask] = useState<Task | null>(null);
  const [highlight, setHighlight] = useState<TaskStatus | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<TaskStatus>("todo");
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await getTasks({}));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo(
    () =>
      STATUSES.map((status) => ({
        status,
        label: STATUS_META[status].label,
        dot: STATUS_META[status].dot,
        items: tasks.filter((t) => t.status === status),
      })),
    [tasks]
  );

  const openCreate = (status: TaskStatus) => {
    setEditing(null);
    setModalStatus(status);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDragTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHighlight(status);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setHighlight(null);

    const id = e.dataTransfer.getData("text/plain") || dragTask?.id;
    if (!id) return;

    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) {
      setDragTask(null);
      return;
    }

    setMovingId(id);
    try {
      await updateTask(id, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
      );
      toast.success(`Moved to "${STATUS_META[status].label}"`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMovingId(null);
      setDragTask(null);
    }
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Kanban Board</h2>
          <p className="text-sm text-slate-500">Drag cards between columns to update status.</p>
        </div>
        <button className="btn-primary" onClick={() => openCreate("todo")}>
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={KanbanSquare}
            title="Your board is empty"
            description="Drag & drop tasks between To Do, In Progress and Done columns."
            action={
              <button className="btn-primary" onClick={() => openCreate("todo")}>
                <Plus className="h-4 w-4" />
                Create your first task
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map((col) => (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => setHighlight((h) => (h === col.status ? null : h))}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`card flex flex-col overflow-hidden transition ${highlight === col.status ? "column-highlight" : ""}`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <h3 className="text-sm font-bold text-slate-700">{col.label}</h3>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {col.items.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreate(col.status)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand/10 hover:text-brand"
                  title={`Add to ${col.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex min-h-40 flex-1 flex-col gap-3 p-3">
                {col.items.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-xs font-medium text-slate-400">
                    Drop tasks here
                  </div>
                ) : (
                  col.items.map((task) => (
                    <div key={task.id} className={movingId === task.id ? "opacity-40" : ""}>
                      <TaskCard
                        task={task}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onDragStart={handleDragStart}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        defaultStatus={modalStatus}
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

export default Kanban;