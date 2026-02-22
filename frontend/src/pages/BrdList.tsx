import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, FileText } from "lucide-react";
import { BRD, Project } from "@/types";

export default function BrdList() {
  const [brds, setBrds] = useState<(BRD & { projects: Pick<Project, "name"> | null })[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("brds")
        .select("id, accuracy, precision_score, recall, f1_score, status, version, created_at, projects(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // We need to cast the result because Supabase types might not perfectly infer the join structure deeply
      setBrds((data as unknown as (BRD & { projects: Pick<Project, "name"> | null })[]) || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">BRDs</h1>
          <p className="text-sm text-muted-foreground">All generated Business Requirements Documents</p>
        </div>
        <Link to="/dashboard/upload">
          <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> New BRD</Button>
        </Link>
      </div>

      {brds.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No BRDs generated yet</p>
          <Link to="/dashboard/upload"><Button size="sm" className="mt-3">Upload Data</Button></Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Project</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Accuracy</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Precision</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Recall</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {brds.map((brd) => (
                <tr key={brd.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{brd.projects?.name || "—"}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={brd.status === "completed" ? "default" : "secondary"}>{brd.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono">{brd.accuracy?.toString() ?? "—"}%</td>
                  <td className="px-5 py-3.5 text-sm font-mono">{brd.precision_score?.toString() ?? "—"}%</td>
                  <td className="px-5 py-3.5 text-sm font-mono">{brd.recall?.toString() ?? "—"}%</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(brd.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/dashboard/brds/${brd.id}`}><Eye className="w-4 h-4 text-muted-foreground hover:text-foreground inline" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
