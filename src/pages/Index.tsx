import StatCard from "@/components/dashboard/StatCard";
import RecentBrdsTable, { BrdRow } from "@/components/dashboard/RecentBrdsTable";
import PipelineCard from "@/components/dashboard/PipelineCard";
import { FileText, Activity, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const demoBrds: BrdRow[] = [
  { id: "demo-1", name: "Project Alpha — Enron Analysis", status: "complete", accuracy: 92, latency: "2.1s", updatedAt: "2 days ago" },
  { id: "demo-2", name: "Sprint Q4 Requirements", status: "complete", accuracy: 89, latency: "3.0s", updatedAt: "5 days ago" },
  { id: "demo-3", name: "Migration Plan v2", status: "generating", accuracy: null, latency: "—", updatedAt: "Just now" },
];

export default function Dashboard() {
  const [brds, setBrds] = useState<BrdRow[]>(demoBrds);
  const [stats, setStats] = useState({ total: 24, active: 3, accuracy: 92.4, docs: "150K" });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: brdData } = await supabase
        .from("brds")
        .select("id, title, status, accuracy_score, latency_ms, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (brdData && brdData.length > 0) {
        setBrds(brdData.map(b => ({
          id: b.id,
          name: b.title,
          status: b.status as BrdRow["status"],
          accuracy: b.accuracy_score ? Math.round(b.accuracy_score * 10) / 10 : null,
          latency: b.latency_ms ? `${(b.latency_ms / 1000).toFixed(1)}s` : "—",
          updatedAt: new Date(b.updated_at).toLocaleDateString(),
        })));
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor your AI requirement intelligence pipeline</p>
        </div>
        <Button onClick={() => navigate("/upload")} className="gap-2">
          <FileText className="h-4 w-4" />
          New BRD
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total BRDs" value={stats.total} change="+12%" trend="up" />
        <StatCard icon={Activity} label="Active Pipelines" value={stats.active} />
        <StatCard icon={Target} label="Avg Accuracy" value={`${stats.accuracy}%`} change="+0.6%" trend="up" />
        <StatCard icon={Timer} label="Documents Processed" value={stats.docs} change="+15K" trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentBrdsTable brds={brds} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <PipelineCard
            projectName="Migration Plan v2"
            currentPhase="entity_extraction"
            progressPct={67}
            status="running"
          />
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">System Health</h3>
            <div className="space-y-2.5">
              {[
                { label: "Noise Filtering", value: 80, color: "bg-success" },
                { label: "Entity Extraction", value: 95, color: "bg-primary" },
                { label: "BRD Generation", value: 92, color: "bg-chart-purple" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
