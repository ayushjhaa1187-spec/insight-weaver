import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const phases = [
  { key: "ingestion", label: "Ingest" },
  { key: "noise_filtering", label: "Filter" },
  { key: "entity_extraction", label: "Extract" },
  { key: "brd_generation", label: "Generate" },
  { key: "validation", label: "Validate" },
];

const phaseOrder = phases.map(p => p.key);

interface PipelineCardProps {
  projectName?: string;
  currentPhase: string;
  progressPct: number;
  status: string;
}

export default function PipelineCard({ projectName, currentPhase, progressPct, status }: PipelineCardProps) {
  const currentIdx = phaseOrder.indexOf(currentPhase);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Active Pipeline</h3>
        {projectName && <span className="text-xs text-muted-foreground">{projectName}</span>}
      </div>

      {status === "running" ? (
        <>
          <div className="flex items-center gap-1.5 mb-4">
            {phases.map((phase, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={phase.key} className="flex items-center gap-1.5">
                  {i > 0 && <div className={cn("h-px w-4", done ? "bg-success" : "bg-border")} />}
                  <div className="flex flex-col items-center gap-1">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : active ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                    <span className={cn(
                      "text-[10px] font-medium",
                      done ? "text-success" : active ? "text-primary" : "text-muted-foreground/60"
                    )}>
                      {phase.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Progress value={progressPct} className="h-1.5" />
          <p className="mt-2 text-xs text-muted-foreground">{progressPct}% complete</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No active pipeline. Upload data to start processing.</p>
      )}
    </div>
  );
}
