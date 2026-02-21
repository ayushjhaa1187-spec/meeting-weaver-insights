import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card animate-slide-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-accent-foreground" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {trend && (
        <span className={`text-xs font-medium mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
          {trend}
        </span>
      )}
    </div>
  );
}
