import { useEffect, useState } from "react";
import { getInsights } from "@/lib/api";
import { SkeletonList } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import type { Insight } from "@/types";

const typeColors: Record<string, string> = {
  action_item: "bg-success/10 text-success",
  decision: "bg-primary/10 text-primary",
  sentiment: "bg-warning/10 text-warning",
  topic: "bg-info/10 text-info",
  general: "bg-muted text-muted-foreground",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await getInsights();
    if (res.success) {
      setInsights(res.data || []);
    } else {
      setError(res.error || "Failed to load");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">AI-generated insights from your meetings</p>
      </div>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : insights.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="Insights will appear here as you add meeting transcripts and run AI analysis."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div key={ins.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[ins.type] || typeColors.general}`}>
                  {ins.type.replace("_", " ")}
                </span>
                {ins.sentiment_score !== null && (
                  <Badge variant="outline" className="text-[10px]">
                    Sentiment: {ins.sentiment_score.toFixed(2)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{ins.content}</p>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(ins.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
