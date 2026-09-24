import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  sublabel?: string;
}

const StatCard = ({ label, value, icon: Icon, accent, iconBg, sublabel }: StatCardProps) => (
  <div className="card p-5 transition hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${accent}`}>{value}</p>
        {sublabel && <p className="mt-1 text-xs font-medium text-slate-400">{sublabel}</p>}
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default StatCard;