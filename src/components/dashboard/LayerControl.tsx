import { Layers, Satellite, MessageSquare, Droplets } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LayerControlProps {
  layers: {
    satellite: boolean;
    smsReports: boolean;
    waterPipelines: boolean;
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
        <div className="flex items-center gap-3">
          <Checkbox 
            id="satellite"
            checked={layers.satellite}
            onCheckedChange={() => onToggle("satellite")}
            className="border-muted-foreground data-[state=checked]:bg-crisis-info data-[state=checked]:border-crisis-info"
          />
          <Label 
            htmlFor="satellite" 
            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
          >
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
          <Label 
            htmlFor="smsReports" 
            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            SMS Reports
          </Label>
        </div>
        
        <div className="flex items-center gap-3">
          <Checkbox 
            id="waterPipelines"
            checked={layers.waterPipelines}
            onCheckedChange={() => onToggle("waterPipelines")}
            className="border-muted-foreground data-[state=checked]:bg-crisis-info data-[state=checked]:border-crisis-info"
          />
          <Label 
            htmlFor="waterPipelines" 
            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
          >
            <Droplets className="w-4 h-4 text-muted-foreground" />
            Water Pipelines
          </Label>
        </div>
      </div>
    </div>
  );
}
