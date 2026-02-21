import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import PipelineStepper, { PipelineStep } from "@/components/PipelineStepper";
import { FileText, Activity, Target, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BrdRow {
  id: string;
  content: any;
  accuracy: number | null;
  status: string;
  created_at: string;
  projects: { name: string } | null;
}

export default function Dashboard() {
  const [brds, setBrds] = useState<BrdRow[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [b, p, d] = await Promise.all([
        supabase.from("brds").select("id, content, accuracy, status, created_at, projects(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("projects").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("documents").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);
      setBrds((b.data as any[]) || []);
      setProjectCount(p.count || 0);
      setDocCount(d.count || 0);
    };
    load();
  }, []);

  const activePipeline: PipelineStep[] = [
    { id: "ingest", label: "Ingest", status: "completed" },
    { id: "filter", label: "Filter", status: "completed" },
    { id: "extract", label: "Extract", status: "running", progress: 67 },
    { id: "generate", label: "Generate", status: "pending" },
    { id: "validate", label: "Validate", status: "pending" },
  ];

  const avgAccuracy = brds.length
    ? (brds.reduce((s, b) => s + (b.accuracy || 0), 0) / brds.filter(b => b.accuracy).length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitor your AI requirement intelligence pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total BRDs" value={brds.length} icon={FileText} trend="+12%" trendUp />
        <StatCard label="Active Pipelines" value={projectCount} icon={Activity} />
        <StatCard label="Avg Accuracy" value={`${avgAccuracy}%`} icon={Target} trend="+2.1%" trendUp />
        <StatCard label="Docs Processed" value={docCount > 1000 ? `${(docCount / 1000).toFixed(0)}K` : docCount} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent BRDs */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Recent BRDs</h2>
            <Link to="/brds" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          {brds.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No BRDs yet. <Link to="/upload" className="text-primary hover:underline">Upload data to get started</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {brds.map((brd) => (
                <div key={brd.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <span className="text-sm font-medium text-foreground">{(brd.projects as any)?.name || "Untitled"}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(brd.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {brd.accuracy && <span className="text-sm font-mono font-medium text-foreground">{brd.accuracy}%</span>}
                    <Badge variant={brd.status === "completed" ? "default" : "secondary"}>
                      {brd.status}
                    </Badge>
                    <Link to={`/brds/${brd.id}`}>
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Pipeline */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Active Pipeline</h2>
          <div className="space-y-4">
            <PipelineStepper steps={activePipeline} />
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Entity Extraction</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="pt-3 border-t border-border space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Queue status</span><span className="text-success font-medium">Active</span></div>
              <div className="flex justify-between"><span>Worker status</span><span className="text-success font-medium">Online</span></div>
              <div className="flex justify-between"><span>Avg processing time</span><span className="font-medium text-foreground">2.4s</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
