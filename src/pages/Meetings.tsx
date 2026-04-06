import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CalendarDays, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getMeetings, createMeeting, deleteMeeting } from "@/lib/api";
import { SkeletonList } from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import type { Meeting } from "@/types";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [attendees, setAttendees] = useState("");
  const [transcript, setTranscript] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getMeetings();
    if (res.success) {
      setMeetings(res.data || []);
    } else {
      setError(res.error || "Failed to load meetings");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await createMeeting({
      title,
      date: date || new Date().toISOString(),
      duration: duration ? parseInt(duration) : undefined,
      attendees: attendees.split(",").map((a) => a.trim()).filter(Boolean),
      transcript: transcript || undefined,
    });
    if (res.success) {
      toast.success("Meeting created");
      setDialogOpen(false);
      setTitle("");
      setDate("");
      setDuration("");
      setAttendees("");
      setTranscript("");
      load();
    } else {
      toast.error(res.error || "Failed to create meeting");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMeeting(id);
    if (res.success) {
      toast.success("Meeting deleted");
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
          <p className="text-sm text-muted-foreground">Manage and analyze your meetings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> New Meeting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly standup" required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Duration (min)</label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Attendees (comma-separated)</label>
                <Input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Alice, Bob, Charlie" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Transcript</label>
                <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste meeting transcript here..." rows={4} className="mt-1" />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : "Create Meeting"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No meetings yet"
          description="Create your first meeting to start analyzing."
          actionLabel="Add Meeting"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Duration</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{m.title}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground hidden sm:table-cell">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-sm font-mono hidden md:table-cell">{m.duration ? `${m.duration}m` : "-"}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={m.status === "analyzed" ? "default" : "secondary"}>{m.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/meetings/${m.id}`}>
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Link>
                      <button onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
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
