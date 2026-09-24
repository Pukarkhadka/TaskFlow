import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createTask, updateTask } from "../api/tasks";
import { getErrorMessage } from "../api/client";
import { ButtonSpinner } from "./spinners";
import {
  DEFAULT_CATEGORIES,
  PRIORITIES,
  PRIORITY_META,
  STATUSES,
  STATUS_META,
} from "../utils/constants";
import { toInputDate } from "../utils/date";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "../types";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Task | null;
  defaultStatus?: TaskStatus;
}

const TaskModal = ({ open, onClose, initial, defaultStatus = "todo" }: TaskModalProps) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || "medium");
  const [category, setCategory] = useState(initial?.category || "General");
  const [dueDate, setDueDate] = useState(toInputDate(initial?.dueDate ?? null));
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: category.trim() || "General",
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : null,
    };

    setSaving(true);
    try {
      if (isEdit && initial) {
        await updateTask(initial.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish dashboard charts"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="input min-h-24 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="task-category">
                Category
              </label>
              <input
                id="task-category"
                className="input"
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work"
              />
              <datalist id="category-options">
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label" htmlFor="task-due">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary min-w-28" disabled={saving}>
              {saving && <ButtonSpinner />}
              {isEdit ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;