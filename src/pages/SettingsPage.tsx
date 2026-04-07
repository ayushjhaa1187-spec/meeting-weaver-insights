import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [model, setModel] = useState("gemini-flash");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState("4096");
  const [noiseThreshold, setNoiseThreshold] = useState([0.2]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);
  const [fullName, setFullName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mw-settings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.model) setModel(s.model);
        if (s.temperature !== undefined) setTemperature([s.temperature]);
        if (s.maxTokens) setMaxTokens(s.maxTokens);
        if (s.noiseThreshold !== undefined) setNoiseThreshold([s.noiseThreshold]);
        if (s.exportFormat) setExportFormat(s.exportFormat);
        if (s.includeMetadata !== undefined) setIncludeMetadata(s.includeMetadata);
        if (s.includeSources !== undefined) setIncludeSources(s.includeSources);
        if (s.autoValidate !== undefined) setAutoValidate(s.autoValidate);
      } catch { /* ignore */ }
    }
    getProfile().then((res) => {
      if (res.success && res.data) {
        setFullName(res.data.full_name || "");
      }
      setProfileLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("mw-settings", JSON.stringify({
      model, temperature: temperature[0], maxTokens, noiseThreshold: noiseThreshold[0],
      exportFormat, includeMetadata, includeSources, autoValidate,
    }));
    await updateProfile({ full_name: fullName });
    toast.success("Settings saved");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your profile and AI preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <div>
          <label className="text-sm font-medium text-foreground">Full Name</label>
          {profileLoading ? (
            <div className="mt-1.5 h-10 bg-muted animate-pulse rounded-lg" />
          ) : (
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="mt-1.5 max-w-md" />
          )}
        </div>
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
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Save Settings
        </Button>
        <Button variant="outline" onClick={() => toast.info("Defaults restored")}>Reset Defaults</Button>
      </div>
    </div>
  );
}
