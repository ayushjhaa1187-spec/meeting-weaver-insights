import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { Target, Crosshair, RotateCcw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function MetricsPage() {
  const [brds, setBrds] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("brds").select("accuracy, precision_score, recall, f1_score, created_at, projects(name)").eq("user_id", user.id).order("created_at");
      setBrds(data || []);
    };
    load();
  }, []);

  const avg = (field: string) => {
    const vals = brds.filter(b => b[field] != null).map(b => b[field]);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  const chartData = brds.map((b, i) => ({
    name: (b.projects as any)?.name || `BRD ${i + 1}`,
    accuracy: b.accuracy || 0,
    precision: b.precision_score || 0,
    recall: b.recall || 0,
    f1: b.f1_score || 0,
  }));

  const trendData = brds.map((b, i) => ({
    name: new Date(b.created_at).toLocaleDateString(),
    accuracy: b.accuracy || 0,
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Performance</h1>
        <p className="text-sm text-muted-foreground">Validation & accuracy metrics across all BRDs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Accuracy" value={`${avg("accuracy")}%`} icon={Target} />
        <StatCard label="Precision" value={`${avg("precision_score")}%`} icon={Crosshair} />
        <StatCard label="Recall" value={`${avg("recall")}%`} icon={RotateCcw} />
        <StatCard label="F1 Score" value={`${avg("f1_score")}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Accuracy Over Time</h3>
          {trendData.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Per-BRD comparison */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Per-BRD Comparison</h3>
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Noise filtering stats */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Noise Filtering Statistics</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-xs text-muted-foreground">Input Documents</div>
            <div className="text-xl font-bold text-foreground mt-1">500,000</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Relevant Output</div>
            <div className="text-xl font-bold text-success mt-1">100,000</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Noise Removed</div>
            <div className="text-xl font-bold text-destructive mt-1">80%</div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "20%" }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>Relevant (20%)</span>
          <span>Filtered (80%)</span>
        </div>
      </div>
    </div>
  );
}
