import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  TrendingUp,
  Plus,
  Layers,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getStats } from "../api/tasks";
import { getErrorMessage } from "../api/client";
import StatCard from "../components/StatCard";
import { lastNDays } from "../utils/date";
import { PRIORITIES, PRIORITY_META, STATUS_META } from "../utils/constants";
import type { Stats } from "../types";

const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  in_progress: "#f59e0b",
  done: "#10b981",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f43f5e",
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  const perDay = lastNDays(7).map((date) => {
    const found = stats.tasksPerDay.find((d) => d.date === date);
    return {
      day: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" }),
      Created: found?.created ?? 0,
      Completed: found?.done ?? 0,
    };
  });

  const statusData = [
    { name: STATUS_META.todo.label, value: stats.byStatus.todo, color: STATUS_COLORS.todo },
    { name: STATUS_META.in_progress.label, value: stats.byStatus.in_progress, color: STATUS_COLORS.in_progress },
    { name: STATUS_META.done.label, value: stats.byStatus.done, color: STATUS_COLORS.done },
  ];

  const priorityData = PRIORITIES.map((p) => ({
    name: PRIORITY_META[p].label,
    count: stats.byPriority[p],
    color: PRIORITY_COLORS[p],
  }));

  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Dashboard</h2>
          <p className="text-sm text-slate-500">Your productivity at a glance.</p>
        </div>
        <Link to="/tasks" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add task
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          icon={ListTodo}
          accent="text-slate-900"
          iconBg="bg-slate-100 text-slate-600"
          sublabel="All time"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          accent="text-emerald-600"
          iconBg="bg-emerald-100 text-emerald-600"
          sublabel={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
          accent="text-amber-600"
          iconBg="bg-amber-100 text-amber-600"
          sublabel="To do + in progress"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          accent={stats.overdue > 0 ? "text-rose-600" : "text-slate-900"}
          iconBg={stats.overdue > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}
          sublabel="Not done past due date"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card col-span-2 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-slate-800">Task activity — last 7 days</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="doneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="Created" stroke="#6366f1" strokeWidth={2.5} fill="url(#createdGrad)" />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2.5} fill="url(#doneGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-slate-800">Tasks by status</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {statusData.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-semibold text-slate-800">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800">Tasks by priority</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={38}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card col-span-2 p-5">
          <h3 className="mb-4 font-semibold text-slate-800">Tasks by category</h3>
          {stats.byCategory.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No tasks yet — categories will appear here.
            </p>
          ) : (
            <ul className="space-y-4">
              {stats.byCategory.map((c) => (
                <li key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{c.name}</span>
                    <span className="font-semibold text-slate-800">{c.count}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-violet-400 transition-all"
                      style={{ width: `${(c.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;