import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMeeting, getInsights, updateMeeting } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Users, FileText, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SkeletonPage } from "@/components/SkeletonCard";
import ErrorState from "@/components/ErrorState";
import type { Meeting, Insight } from "@/types";

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [mRes, iRes] = await Promise.all([getMeeting(id), getInsights(id)]);
      if (mRes.success && mRes.data) {
        setMeeting(mRes.data);
        setTranscript(mRes.data.transcript || "");
      } else {
        setError(mRes.error || "Meeting not found");
      }
      if (iRes.success) setInsights(iRes.data || []);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSaveTranscript = async () => {
    if (!id) return;
    setSaving(true);
    const res = await updateMeeting(id, { transcript });
    if (res.success) {
      toast.success("Transcript saved");
      setEditingTranscript(false);
      if (res.data) setMeeting(res.data);
    } else {
      toast.error(res.error || "Save failed");
    }
    setSaving(false);
  };

  if (loading) return <SkeletonPage />;
  if (error || !meeting) return <ErrorState message={error || "Meeting not found"} onRetry={() => navigate("/meetings")} />;

  const attendees = Array.isArray(meeting.attendees) ? meeting.attendees as string[] : [];
  const actionItems = Array.isArray(meeting.action_items) ? meeting.action_items as { text: string; assignee?: string; done?: boolean }[] : [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/meetings")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{meeting.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span>{new Date(meeting.date).toLocaleString()}</span>
            {meeting.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.duration}min</span>}
            <Badge variant={meeting.status === "analyzed" ? "default" : "secondary"}>{meeting.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Transcript */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Transcript
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingTranscript ? handleSaveTranscript() : setEditingTranscript(true)}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                {editingTranscript ? "Save" : "Edit"}
              </Button>
            </div>
            {editingTranscript ? (
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={12}
                placeholder="Paste meeting transcript..."
              />
            ) : (
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {meeting.transcript || <span className="text-muted-foreground italic">No transcript available. Click Edit to add one.</span>}
              </div>
            )}
          </div>

          {/* Summary */}
          {meeting.summary && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Summary</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{meeting.summary}</p>
            </div>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Action Items</h2>
              <div className="space-y-2">
                {actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${item.done ? "bg-success text-success-foreground border-success" : "border-border"}`}>
                      {item.done && <span className="text-xs">&#10003;</span>}
                    </div>
                    <div>
                      <span className="text-sm text-foreground">{item.text}</span>
                      {item.assignee && <span className="text-xs text-muted-foreground ml-2">@{item.assignee}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Attendees */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" /> Attendees ({attendees.length})
            </h2>
            {attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendees recorded</p>
            ) : (
              <div className="space-y-2">
                {attendees.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {String(a).charAt(0).toUpperCase()}
                    </div>
                    {String(a)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" /> Insights ({insights.length})
            </h2>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No insights generated yet</p>
            ) : (
              <div className="space-y-2">
                {insights.map((ins) => (
                  <div key={ins.id} className="p-2 rounded-lg bg-muted/50">
                    <Badge variant="secondary" className="text-[10px] mb-1">{ins.type}</Badge>
                    <p className="text-sm text-foreground">{ins.content}</p>
                    {ins.sentiment_score !== null && (
                      <span className="text-xs text-muted-foreground">Sentiment: {ins.sentiment_score.toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
