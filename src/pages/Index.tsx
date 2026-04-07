import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { SkeletonPage } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import PipelineStepper, { PipelineStep } from "@/components/PipelineStepper";
import { FileText, Activity, Target, Clock, Eye, CalendarDays, Lightbulb, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Meeting } from "@/types";

export default function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [insightCount, setInsightCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [m, i] = await Promise.all([
        supabase.from("meetings").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(5),
        supabase.from("insights").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);
      setMeetings(m.data || []);
      setInsightCount(i.count || 0);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <SkeletonPage />;

  const totalDuration = meetings.reduce((s, m) => s + (m.duration || 0), 0);
  const totalAttendees = meetings.reduce((s, m) => {
    const att = Array.isArray(m.attendees) ? m.attendees : [];
    return s + att.length;
  }, 0);

  const activePipeline: PipelineStep[] = [
    { id: "ingest", label: "Ingest", status: "completed" },
    { id: "filter", label: "Filter", status: "completed" },
    { id: "extract", label: "Extract", status: "running", progress: 67 },
    { id: "generate", label: "Generate", status: "pending" },
    { id: "validate", label: "Validate", status: "pending" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your meeting intelligence overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Meetings" value={meetings.length} icon={CalendarDays} trend="+3 this week" trendUp />
        <StatCard label="Total Insights" value={insightCount} icon={Lightbulb} />
        <StatCard label="Hours in Meetings" value={`${(totalDuration / 60).toFixed(1)}h`} icon={Clock} />
        <StatCard label="Attendees Tracked" value={totalAttendees} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Recent Meetings</h2>
            <Link to="/meetings" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          {meetings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No meetings yet"
              description="Add your first meeting to get started with insights."
              actionLabel="Add Meeting"
              onAction={() => window.location.href = "/meetings"}
            />
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <span className="text-sm font-medium text-foreground">{meeting.title}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(meeting.date).toLocaleDateString()} {meeting.duration ? `- ${meeting.duration}min` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={meeting.status === "analyzed" ? "default" : "secondary"}>
                      {meeting.status}
                    </Badge>
                    <Link to={`/meetings/${meeting.id}`}>
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats / Pipeline */}
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
