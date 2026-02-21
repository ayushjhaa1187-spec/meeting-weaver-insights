import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export default function SettingsPage() {
  const [model, setModel] = useState("gemini-flash");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState("4096");
  const [noiseThreshold, setNoiseThreshold] = useState([0.2]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);

  const handleSave = () => {
    localStorage.setItem("brd-settings", JSON.stringify({
      model, temperature: temperature[0], maxTokens, noiseThreshold: noiseThreshold[0],
      exportFormat, includeMetadata, includeSources, autoValidate,
    }));
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure AI model and export preferences</p>
      </div>

      {/* AI Model */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-5">
        <h2 className="text-base font-semibold text-foreground">AI Model Settings</h2>

        <div>
          <label className="text-sm font-medium text-foreground">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="gemini-flash">Gemini 3 Flash (Fast)</option>
            <option value="gemini-pro">Gemini 2.5 Pro (Accurate)</option>
            <option value="gpt-5-mini">GPT-5 Mini (Balanced)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground">Temperature</label>
            <span className="text-muted-foreground font-mono">{temperature[0]}</span>
          </div>
          <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Max Tokens</label>
          <Input value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} type="number" className="mt-1.5" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-foreground">Noise Threshold</label>
            <span className="text-muted-foreground font-mono">{noiseThreshold[0]}</span>
          </div>
          <Slider value={noiseThreshold} onValueChange={setNoiseThreshold} min={0} max={1} step={0.05} />
        </div>
      </div>

      {/* Export */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Export Preferences</h2>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Default Format</label>
          <div className="flex gap-4">
            {["pdf", "docx", "markdown"].map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={exportFormat === fmt}
                  onChange={() => setExportFormat(fmt)}
                  className="accent-[hsl(var(--primary))]"
                />
                {fmt.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {[
          { label: "Include Metadata", value: includeMetadata, set: setIncludeMetadata },
          { label: "Include Sources", value: includeSources, set: setIncludeSources },
          { label: "Auto-validate", value: autoValidate, set: setAutoValidate },
        ].map((opt) => (
          <div key={opt.label} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{opt.label}</span>
            <button
              onClick={() => opt.set(!opt.value)}
              className={`w-11 h-6 rounded-full transition-colors relative ${opt.value ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm absolute top-0.5 transition-all ${opt.value ? "left-5.5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave}>Save Settings</Button>
        <Button variant="outline" onClick={() => toast.info("Defaults restored")}>Reset Defaults</Button>
      </div>
    </div>
  );
}
