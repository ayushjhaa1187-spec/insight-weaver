import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SettingsPage() {
  const [model, setModel] = useState("gemini-3-flash");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState("4096");
  const [noiseThreshold, setNoiseThreshold] = useState([0.2]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your BRD generation pipeline</p>
      </div>

      <Tabs defaultValue="model">
        <TabsList>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-4 mt-4">
          <Card className="p-5 space-y-5">
            <div>
              <Label className="text-sm font-medium">AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3-flash">Gemini 3 Flash (Fast)</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Accurate)</SelectItem>
                  <SelectItem value="gpt-5">GPT-5 (Premium)</SelectItem>
                  <SelectItem value="gpt-5-mini">GPT-5 Mini (Balanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} className="mt-2" />
            </div>

            <div>
              <Label className="text-sm font-medium">Max Tokens</Label>
              <Input value={maxTokens} onChange={e => setMaxTokens(e.target.value)} className="mt-1.5" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4 mt-4">
          <Card className="p-5 space-y-5">
            <div>
              <div className="flex justify-between">
                <Label className="text-sm font-medium">Noise Threshold</Label>
                <span className="text-sm text-muted-foreground">{noiseThreshold[0]} (0-1 relevance)</span>
              </div>
              <Slider value={noiseThreshold} onValueChange={setNoiseThreshold} min={0} max={1} step={0.05} className="mt-2" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-validate</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically run validation after BRD generation</p>
              </div>
              <Switch checked={autoValidate} onCheckedChange={setAutoValidate} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4 mt-4">
          <Card className="p-5 space-y-5">
            <div>
              <Label className="text-sm font-medium">Default Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex gap-4 mt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="pdf" id="pdf" /><Label htmlFor="pdf">PDF</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="docx" id="docx" /><Label htmlFor="docx">DOCX</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="md" id="md" /><Label htmlFor="md">Markdown</Label></div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Metadata</Label>
              <Switch checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Include Sources</Label>
              <Switch checked={includeSources} onCheckedChange={setIncludeSources} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button onClick={handleSave}>Save Settings</Button>
        <Button variant="outline" onClick={() => toast.info("Defaults restored")}>Reset Defaults</Button>
      </div>
    </div>
  );
}
