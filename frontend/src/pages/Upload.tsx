import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, FileText, MessageSquare, Database, Upload as UploadIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const uploadTypes = [
  { id: "email", icon: Mail, label: "Email Upload", desc: "CSV/JSON from Enron, Gmail, Outlook", accept: ".csv,.json" },
  { id: "transcript", icon: FileText, label: "Transcript Upload", desc: "TXT/JSON from AMI, Zoom, Teams", accept: ".txt,.json" },
  { id: "chat", icon: MessageSquare, label: "Chat Logs", desc: "Slack, Teams chat exports", accept: ".txt,.json,.csv" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<{ file: File; type: string }[]>([]);
  const [projectName, setProjectName] = useState("");
  const [useDemo, setUseDemo] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFiles = useCallback((newFiles: FileList, type: string) => {
    const items = Array.from(newFiles).map((file) => ({ file, type }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const startProcessing = async () => {
    if (!projectName.trim()) { toast.error("Enter a project name"); return; }
    if (!useDemo && files.length === 0) { toast.error("Upload files or select demo dataset"); return; }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create project
      const { data: project, error: pErr } = await supabase.from("projects").insert({
        name: projectName,
        user_id: user.id,
        status: "processing",
      }).select().single();
      if (pErr) throw pErr;

      // Upload documents
      if (useDemo) {
        await supabase.from("documents").insert({
          project_id: project.id,
          user_id: user.id,
          name: "Enron + AMI Demo Dataset",
          type: "demo",
          status: "ready",
          content: "DEMO_DATASET",
        });
      } else {
        for (const { file, type } of files) {
          const content = await file.text();
          await supabase.from("documents").insert({
            project_id: project.id,
            user_id: user.id,
            name: file.name,
            type,
            size_bytes: file.size,
            status: "uploaded",
            content: content.substring(0, 50000), // Truncate for DB
          });
        }
      }

      toast.success("Processing started!");
      navigate(`/dashboard/brds/generate/${project.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Data Sources</h1>
        <p className="text-sm text-muted-foreground">Upload emails, transcripts, or chat logs to generate BRDs</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <label className="text-sm font-medium text-foreground">Project Name</label>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Project Alpha"
          className="mt-1.5 max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uploadTypes.map((ut) => (
          <label
            key={ut.id}
            className="stat-card cursor-pointer hover:border-primary/40 transition-colors group"
          >
            <input
              type="file"
              accept={ut.accept}
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files, ut.id)}
            />
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ut.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{ut.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{ut.desc}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Demo dataset toggle */}
      <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
        <Database className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">Use Demo Dataset</div>
          <div className="text-xs text-muted-foreground">Enron Email (500K) + AMI Meeting Corpus (279 transcripts)</div>
        </div>
        <button
          onClick={() => setUseDemo(!useDemo)}
          className={`w-11 h-6 rounded-full transition-colors ${useDemo ? "bg-primary" : "bg-muted"} relative`}
        >
          <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-all ${useDemo ? "left-5.5" : "left-0.5"}`} />
        </button>
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Upload Queue</h3>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <UploadIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{f.file.name}</div>
                    <div className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(0)} KB · {f.type}</div>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={startProcessing} disabled={processing} size="lg" className="w-full sm:w-auto">
        {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Start Processing Pipeline →"}
      </Button>
    </div>
  );
}
