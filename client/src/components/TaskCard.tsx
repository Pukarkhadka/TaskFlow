import { GripVertical, Pencil, Trash2, CalendarDays } from "lucide-react";
import { isOverdue, shortDate } from "../utils/date";
import { PRIORITY_META, STATUS_META } from "../utils/constants";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

const TaskCard = ({ task, onEdit, onDelete, draggable = true, onDragStart }: TaskCardProps) => {
  const overdue = isOverdue(task);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      className={`group cursor-pointer rounded-xl border-l-4 ${STATUS_META[task.status].ring} border border-l-4 border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <GripVertical className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            {task.category}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-brand/10 hover:text-brand"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={`rounded-md px-2 py-0.5 font-semibold ${PRIORITY_META[task.priority].badge}`}
        >
          {PRIORITY_META[task.priority].label}
        </span>
        <span
          className={`flex items-center gap-1 ${
            overdue ? "font-semibold text-rose-600" : "text-slate-500"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {shortDate(task.dueDate) || "—"}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;