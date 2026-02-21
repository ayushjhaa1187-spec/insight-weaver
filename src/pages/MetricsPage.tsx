import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import { Target, Crosshair, Undo2, Activity } from "lucide-react";

const accuracyData = [
  { name: "Week 1", accuracy: 88 },
  { name: "Week 2", accuracy: 90 },
  { name: "Week 3", accuracy: 91.5 },
  { name: "Week 4", accuracy: 92.4 },
  { name: "Week 5", accuracy: 93.1 },
];

const noiseData = [
  { name: "Relevant", value: 100000, color: "hsl(217, 91%, 50%)" },
  { name: "Noise Removed", value: 400000, color: "hsl(215, 20%, 90%)" },
];

const perBrdData = [
  { name: "Project Alpha", accuracy: 92.3, latency: 2.1 },
  { name: "Sprint Q4", accuracy: 93.1, latency: 1.8 },
  { name: "CRM Migration", accuracy: 89.5, latency: 3.2 },
  { name: "API Redesign", accuracy: 94.2, latency: 1.5 },
  { name: "Data Pipeline", accuracy: 91.8, latency: 2.4 },
];

const latencyDistribution = [
  { range: "0-1s", count: 5 },
  { range: "1-2s", count: 12 },
  { range: "2-3s", count: 18 },
  { range: "3-4s", count: 8 },
  { range: "4-5s", count: 3 },
];

export default function MetricsPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Validation & accuracy metrics across all BRD generations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Accuracy" value="92.4%" change="+0.6%" trend="up" />
        <StatCard icon={Crosshair} label="Precision" value="94.1%" change="+0.3%" trend="up" />
        <StatCard icon={Undo2} label="Recall" value="90.8%" change="+1.2%" trend="up" />
        <StatCard icon={Activity} label="F1 Score" value="92.4%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accuracy over time */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis domain={[85, 95]} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(217, 91%, 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(217, 91%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Noise filtering */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Noise Removal</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={noiseData} innerRadius={40} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270}>
                  {noiseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">80%</p>
                <p className="text-xs text-muted-foreground">Noise removed</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>100K relevant docs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span>400K noise removed</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Per-BRD comparison */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Per-BRD Accuracy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perBrdData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[85, 96]} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="accuracy" fill="hsl(217, 91%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Latency distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Latency Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={latencyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 20%, 90%)", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
