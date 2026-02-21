import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PipelineStepper, { PipelineStep } from "@/components/PipelineStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Project, ValidationMetrics, BrdContent } from "@/types";
import { Json } from "@/integrations/supabase/types";

const PIPELINE_STEPS = ["Ingestion", "Noise Filtering", "Entity Extraction", "BRD Generation", "Validation"];

export default function BrdGenerate() {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [brdContent, setBrdContent] = useState<BrdContent>({});
  const [streaming, setStreaming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Refs to hold latest state for async operations
  const brdContentRef = useRef<BrdContent>({});
  const metricsRef = useRef<ValidationMetrics | null>(null);

  useEffect(() => {
    brdContentRef.current = brdContent;
  }, [brdContent]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (data) setProject(data);
    };

    const startGeneration = async () => {
      setStreaming(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        // Fetch documents for this project
        const { data: docs } = await supabase.from("documents").select("content, type, name").eq("project_id", projectId);
        const docContents = docs?.map(d => `[${d.type}: ${d.name}]\n${d.content}`).join("\n\n") || "";

        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brd`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ projectId, documents: docContents }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || "Generation failed");
        }

        if (!resp.body) throw new Error("No response body");

        // Stream SSE
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ") || line.trim() === "") continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { setCompleted(true); setStreaming(false); break; }

            try {
              const parsed = JSON.parse(jsonStr);

              // Handle pipeline step updates
              if (parsed.type === "step") {
                setCurrentStep(parsed.step);
                continue;
              }

              // Handle metrics
              if (parsed.type === "metrics") {
                setMetrics(parsed.data);
                metricsRef.current = parsed.data;
                // Also update ref immediately as effect might be slow? No, effects are synchronous after render, but inside this loop we are not rendering yet?
                // Actually, setState is async. So ref update in effect is safer but might lag one render cycle.
                // But since we are in a loop, we should update ref manually here too if we want to use it immediately?
                // Actually, for the *final* save after loop breaks, we rely on state updates.
                // But the loop blocks? No, it awaits reader.read().
                continue;
              }

              // Handle BRD content chunks
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                // Parse section headers
                const sectionMatch = content.match(/^## (\d+\. .+)/m);
                if (sectionMatch) {
                   const key = sectionMatch[1];
                   setBrdContent(prev => {
                     const newState = { ...prev, [key]: (prev[key] || "") + content };
                     brdContentRef.current = newState; // Update ref manually to be safe
                     return newState;
                   });
                } else {
                   setBrdContent(prev => {
                     const keys = Object.keys(prev);
                     const lastKey = keys.length > 0 ? keys[keys.length - 1] : "Overview";
                     const newState = { ...prev, [lastKey]: (prev[lastKey] || "") + content };
                     brdContentRef.current = newState;
                     return newState;
                   });
                }
                // Auto-scroll
                if (contentRef.current) {
                  contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Save BRD using refs to get latest state
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("brds").insert({
            project_id: projectId,
            user_id: user.id,
            content: brdContentRef.current as unknown as Json,
            accuracy: metricsRef.current?.accuracy,
            precision_score: metricsRef.current?.precision,
            recall: metricsRef.current?.recall,
            f1_score: metricsRef.current?.f1,
            status: "completed",
          });
          await supabase.from("projects").update({ status: "completed", accuracy: metricsRef.current?.accuracy }).eq("id", projectId);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "An error occurred");
        setStreaming(false);
      }
    };

    loadProject();
    startGeneration();
  }, [projectId]);

  const pipelineSteps: PipelineStep[] = PIPELINE_STEPS.map((label, i) => ({
    id: label,
    label,
    status: i < currentStep ? "completed" : i === currentStep ? (streaming ? "running" : "completed") : "pending",
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              BRD: {project?.name || "Loading..."}
            </h1>
            {streaming && (
              <Badge variant="default" className="bg-success text-success-foreground animate-pulse-dot">
                ● Streaming
              </Badge>
            )}
            {completed && <Badge variant="default">✓ Complete</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">Live BRD Generation</p>
        </div>
      </div>

      {/* Pipeline stepper */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Pipeline Status</h3>
        <PipelineStepper steps={pipelineSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* BRD Content */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6" ref={contentRef} style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <h2 className="text-lg font-bold text-foreground mb-4">Generated BRD</h2>
          {Object.keys(brdContent).length === 0 && streaming && (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating BRD from your data...</span>
            </div>
          )}
          {Object.entries(brdContent).map(([section, content]) => (
            <div key={section} className="mb-6 animate-slide-in">
              <h3 className="text-base font-semibold text-foreground mb-2">{section}</h3>
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-sans">
                {content}
                {streaming && <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-stream-cursor" />}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar metrics */}
        <div className="space-y-4">
          {metrics && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Validation Metrics</h3>
              {[
                { label: "Accuracy", value: metrics.accuracy },
                { label: "Precision", value: metrics.precision },
                { label: "Recall", value: metrics.recall },
                { label: "F1 Score", value: metrics.f1 },
              ].map((m) => (
                <div key={m.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-mono font-semibold text-foreground">{m.value}%</span>
                </div>
              ))}
            </div>
          )}

          {completed && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Download className="w-4 h-4" /> Export PDF
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Share2 className="w-4 h-4" /> Share Link
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Edit3 className="w-4 h-4" /> Edit BRD
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
