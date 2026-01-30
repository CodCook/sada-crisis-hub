import { Layers, Satellite, MessageSquare, Droplets } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LayerControlProps {
  layers: {
    satellite: boolean;
    smsReports: boolean;
    waterPipelines: boolean;
    electricity: boolean;
    powerPlants: boolean;
    telecoms: boolean;
    petroleum: boolean;
  };
  onToggle: (layer: keyof LayerControlProps["layers"]) => void;
}

export function LayerControl({ layers, onToggle }: LayerControlProps) {
  return (
    <div className="glass-panel rounded-lg p-4 w-64 widget-fade-in">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Layers className="w-4 h-4 text-crisis-safe" />
        <h3 className="text-sm font-semibold text-foreground">Layer Control</h3>
      </div>

      <div className="space-y-3">
        {/* Existing Layers */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="satellite"
            checked={layers.satellite}
            onCheckedChange={() => onToggle("satellite")}
            className="border-muted-foreground data-[state=checked]:bg-crisis-info data-[state=checked]:border-crisis-info"
          />
          <Label htmlFor="satellite" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Satellite className="w-4 h-4 text-muted-foreground" />
            Satellite Night Lights
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="smsReports"
            checked={layers.smsReports}
            onCheckedChange={() => onToggle("smsReports")}
            className="border-muted-foreground data-[state=checked]:bg-crisis-warning data-[state=checked]:border-crisis-warning"
          />
          <Label htmlFor="smsReports" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            SMS Reports
          </Label>
        </div>

        {/* Infrastructure Layers */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="electricity"
            checked={layers.electricity}
            onCheckedChange={() => onToggle("electricity")}
            className="border-muted-foreground data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
          />
          <Label htmlFor="electricity" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span className="text-yellow-500 font-bold">⚡</span> Grid Lines
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="powerPlants"
            checked={layers.powerPlants}
            onCheckedChange={() => onToggle("powerPlants")}
            className="border-muted-foreground data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
          />
          <Label htmlFor="powerPlants" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span className="text-red-500 font-bold">🏭</span> Power Generation
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="waterPipelines"
            checked={layers.waterPipelines}
            onCheckedChange={() => onToggle("waterPipelines")}
            className="border-muted-foreground data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <Label htmlFor="waterPipelines" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Droplets className="w-4 h-4 text-blue-500" />
            Water Network
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="telecoms"
            checked={layers.telecoms}
            onCheckedChange={() => onToggle("telecoms")}
            className="border-muted-foreground data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
          />
          <Label htmlFor="telecoms" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span className="text-purple-500 font-bold">📡</span> Telecoms
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="petroleum"
            checked={layers.petroleum}
            onCheckedChange={() => onToggle("petroleum")}
            className="border-muted-foreground data-[state=checked]:bg-zinc-500 data-[state=checked]:border-zinc-500"
          />
          <Label htmlFor="petroleum" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span className="text-zinc-500 font-bold">🛢️</span> Petroleum
          </Label>
        </div>

      </div>
    </div>
  );
}
