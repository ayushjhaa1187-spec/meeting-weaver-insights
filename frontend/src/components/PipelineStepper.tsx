import { Check, Loader2, Clock } from "lucide-react";

export interface PipelineStep {
  id: string;
  label: string;
  status: "completed" | "running" | "pending";
  progress?: number;
}

export default function PipelineStepper({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={`pipeline-step ${
              step.status === "completed"
                ? "bg-success/10 text-success"
                : step.status === "running"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.status === "completed" ? (
              <Check className="w-3.5 h-3.5" />
            ) : step.status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-0.5 ${step.status === "completed" ? "bg-success/40" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
