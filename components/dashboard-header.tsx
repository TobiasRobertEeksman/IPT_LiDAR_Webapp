"use client"

import { Lock, Unlock, Camera, RotateCcw, Download } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  cameraSynced: boolean
  onCameraSyncChange: (value: boolean) => void
  onReset: () => void
  onExport: () => void // 1. Added to interface
  compareMode: boolean              // Add this
  onCompareModeChange: (v: boolean) => void // Add this
}

export function DashboardHeader({
  cameraSynced,
  onCameraSyncChange,
  onReset,
  onExport, // 2. Destructured here
  compareMode,
  onCompareModeChange
}: DashboardHeaderProps) {
  
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <Camera className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Viewport Controls
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* --- ADDED: Primary Thesis Export Button --- */}
        <Button
          variant="default"
          size="sm"
          onClick={onExport}
          className="h-8 gap-2 text-xs font-semibold shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Export Figures
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Views
        </Button>

        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${compareMode ? "text-red-500" : "text-muted-foreground"}`}>
            Compare Mode
          </span>
          <Switch
            checked={compareMode}
            onCheckedChange={onCompareModeChange}
            className="data-[state=checked]:bg-red-500" // This makes it red when on
          />
        </div>

        <div className="h-5 w-px bg-border" /> {/* Vertical divider */}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {cameraSynced ? (
              <Lock className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">Sync Cameras</span>
          </div>
          <Switch
            checked={cameraSynced}
            onCheckedChange={onCameraSyncChange}
          />
          <Badge
            variant={cameraSynced ? "default" : "secondary"}
            className={
              cameraSynced
                ? "bg-primary/15 text-primary hover:bg-primary/15"
                : "bg-secondary text-muted-foreground hover:bg-secondary"
            }
          >
            {cameraSynced ? "Locked" : "Unlocked"}
          </Badge>
        </div>
      </div>
    </header>
  )
}