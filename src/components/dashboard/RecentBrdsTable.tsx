import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrdRow {
  id: string;
  name: string;
  status: "complete" | "generating" | "draft" | "failed";
  accuracy: number | null;
  latency: string;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  complete: "bg-success/10 text-success border-success/20",
  generating: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function RecentBrdsTable({ brds }: { brds: BrdRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold">Recent BRDs</h3>
        <Link to="/brds" className="text-xs font-medium text-primary hover:underline">View all</Link>
      </div>
      <div className="divide-y divide-border">
        {brds.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{b.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{b.updatedAt}</p>
            </div>
            <Badge variant="outline" className={cn("mx-3 text-[11px] px-2 py-0.5 capitalize", statusStyles[b.status])}>
              {b.status === "generating" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {b.status}
            </Badge>
            <span className="w-14 text-right text-sm font-medium tabular-nums">
              {b.accuracy != null ? `${b.accuracy}%` : "—"}
            </span>
            <span className="w-16 text-right text-xs text-muted-foreground">{b.latency}</span>
            <Link to={`/brds/${b.id}`} className="ml-3 text-muted-foreground hover:text-primary transition-colors">
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        ))}
        {brds.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No BRDs yet. Upload data to get started.</p>
        )}
      </div>
    </div>
  );
}
