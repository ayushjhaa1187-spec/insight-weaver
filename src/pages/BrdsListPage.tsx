import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  complete: "bg-success/10 text-success border-success/20",
  generating: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Brd {
  id: string;
  title: string;
  status: string;
  accuracy_score: number | null;
  latency_ms: number | null;
  created_at: string;
}

export default function BrdsListPage() {
  const [brds, setBrds] = useState<Brd[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("brds")
        .select("id, title, status, accuracy_score, latency_ms, created_at")
        .order("created_at", { ascending: false });
      if (data) setBrds(data);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BRD Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All generated Business Requirements Documents</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/upload"><Plus className="h-4 w-4" /> New BRD</Link>
        </Button>
      </div>

      {brds.length > 0 ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {brds.map(b => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("mx-3 text-[11px] px-2 py-0.5 capitalize", statusStyles[b.status])}>{b.status}</Badge>
              <span className="w-14 text-right text-sm font-medium tabular-nums">
                {b.accuracy_score ? `${b.accuracy_score}%` : "—"}
              </span>
              <Link to={`/brds/${b.id}`} className="ml-4 text-muted-foreground hover:text-primary transition-colors">
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No BRDs generated yet</p>
          <Button asChild variant="outline" className="mt-3">
            <Link to="/upload">Upload Data to Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
