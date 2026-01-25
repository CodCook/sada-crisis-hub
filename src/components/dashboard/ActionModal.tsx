import { X, Zap, Droplets, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusterData: {
    location: string;
    block: string;
    severity: string;
    reports: number;
    lastReport: string;
  } | null;
  onDispatchElectrical: () => void;
  onDispatchWater: () => void;
}

export function ActionModal({ 
  isOpen, 
  onClose, 
  clusterData,
  onDispatchElectrical,
  onDispatchWater 
}: ActionModalProps) {
  if (!clusterData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-glass border-crisis-critical/50 max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-crisis-critical/20 border border-crisis-critical/40">
                <AlertTriangle className="w-6 h-6 text-crisis-critical animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Critical Failure Detected
                </DialogTitle>
                <p className="text-sm text-crisis-critical font-semibold mt-0.5">
                  {clusterData.location} - {clusterData.block}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Status Info */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Severity</span>
            </div>
            <span className="text-sm font-bold text-crisis-critical">{clusterData.severity}</span>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Reports</span>
            </div>
            <span className="text-sm font-bold text-foreground">{clusterData.reports}</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Last Report</span>
            </div>
            <span className="text-sm font-bold text-foreground">{clusterData.lastReport}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">
            Select Response Action
          </p>
          
          <Button 
            onClick={() => {
              onDispatchElectrical();
              onClose();
            }}
            className="w-full h-14 bg-crisis-warning/20 hover:bg-crisis-warning/30 border-2 border-crisis-warning text-crisis-warning font-bold text-base group transition-all"
            variant="outline"
          >
            <Zap className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            <span>Dispatch Electrical Repair Team</span>
          </Button>
          <p className="text-[10px] text-muted-foreground text-center -mt-1">
            Fuse/Cable repair • ETA: 45 min
          </p>
          
          <Button 
            onClick={() => {
              onDispatchWater();
              onClose();
            }}
            className="w-full h-14 bg-crisis-info/20 hover:bg-crisis-info/30 border-2 border-crisis-info text-crisis-info font-bold text-base group transition-all"
            variant="outline"
          >
            <Droplets className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            <span>Dispatch Water Tanker</span>
          </Button>
          <p className="text-[10px] text-muted-foreground text-center -mt-1">
            Clean Water Aid • ETA: 30 min
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            INCIDENT ID: KRT-2024-{Math.floor(Math.random() * 9000) + 1000}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
