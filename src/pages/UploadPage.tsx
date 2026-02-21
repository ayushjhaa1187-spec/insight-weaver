import { useState, useCallback } from "react";
import { Upload, Mail, FileText, MessageSquare, Database, X, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  name: string;
  size: string;
  progress: number;
  type: "email" | "transcript" | "chat";
  content?: string;
}

const sourceCards = [
  { type: "email" as const, icon: Mail, title: "Email Upload", desc: "Drop CSV/JSON email exports", accepts: ".csv,.json,.txt" },
  { type: "transcript" as const, icon: FileText, title: "Transcript Upload", desc: "Drop meeting transcripts", accepts: ".txt,.json,.csv" },
  { type: "chat" as const, icon: MessageSquare, title: "Chat Upload", desc: "Drop chat logs or Slack exports", accepts: ".txt,.json,.csv" },
];

export default function UploadPage() {
  const [dataSource, setDataSource] = useState<"upload" | "demo">("upload");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFiles = useCallback(async (files: FileList, type: QueueItem["type"]) => {
    const newItems: QueueItem[] = [];
    for (const file of Array.from(files)) {
      const text = await file.text();
      newItems.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)}KB`,
        progress: 100,
        type,
        content: text.slice(0, 50000), // first 50K chars
      });
    }
    setQueue(prev => [...prev, ...newItems]);
    toast.success(`${newItems.length} file(s) added to queue`);
  }, []);

  const removeItem = (id: string) => setQueue(prev => prev.filter(q => q.id !== id));

  const startProcessing = async () => {
    if (dataSource === "upload" && queue.length === 0) {
      toast.error("Please upload at least one file first");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to start processing");
        navigate("/auth");
        return;
      }

      // Create project
      const { data: project, error: projErr } = await supabase
        .from("projects")
        .insert({ name: dataSource === "demo" ? "Enron + AMI Demo" : `Project ${new Date().toLocaleDateString()}`, owner_id: user.id })
        .select()
        .single();

      if (projErr) throw projErr;

      // Create BRD
      const { data: brd, error: brdErr } = await supabase
        .from("brds")
        .insert({ project_id: project.id, title: project.name, status: "generating" })
        .select()
        .single();

      if (brdErr) throw brdErr;

      // Save documents
      if (dataSource === "upload") {
        const docs = queue.map(q => ({
          project_id: project.id,
          type: q.type,
          file_name: q.name,
          raw_content: q.content || "",
        }));
        await supabase.from("documents").insert(docs);
      }

      // Create pipeline job
      const { data: job } = await supabase
        .from("pipeline_jobs")
        .insert({ project_id: project.id, brd_id: brd.id, status: "running", started_at: new Date().toISOString() })
        .select()
        .single();

      // Navigate to BRD generation view
      navigate(`/brds/${brd.id}?job=${job?.id}&project=${project.id}&source=${dataSource}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to start pipeline");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data Sources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload emails, transcripts, or chat logs to generate a BRD</p>
      </div>

      {/* Source cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {sourceCards.map(({ type, icon: Icon, title, desc, accepts }) => (
          <label
            key={type}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50",
              dragTarget === type ? "border-primary bg-accent" : "border-border"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragTarget(type); }}
            onDragLeave={() => setDragTarget(null)}
            onDrop={(e) => { e.preventDefault(); setDragTarget(null); handleFiles(e.dataTransfer.files, type); }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              multiple
              accept={accepts}
              onChange={(e) => e.target.files && handleFiles(e.target.files, type)}
            />
          </label>
        ))}
      </div>

      {/* Dataset selector */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Dataset Source</h3>
        <RadioGroup value={dataSource} onValueChange={(v) => setDataSource(v as "upload" | "demo")} className="space-y-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload" className="text-sm">Use uploaded data</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="demo" id="demo" />
            <Label htmlFor="demo" className="text-sm flex items-center gap-2">
              <Database className="h-3.5 w-3.5" /> Use Enron + AMI demo dataset
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Upload queue */}
      {queue.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3">Upload Queue</h3>
          <div className="space-y-2.5">
            {queue.map(q => (
              <div key={q.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.size} · {q.type}</p>
                </div>
                <Progress value={q.progress} className="w-24 h-1.5" />
                <button onClick={() => removeItem(q.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Start button */}
      <Button
        size="lg"
        className="w-full gap-2 h-12 text-base"
        onClick={startProcessing}
        disabled={processing}
      >
        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
        Start Processing Pipeline
      </Button>
    </div>
  );
}
