"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BrainCircuit,
  Building2,
  Clock,
  Info,
  Layers,
  Target,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  ArrowDownAZ,
  Trophy
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


interface DashboardSidebarProps {
  selectedModel: string
  onModelChange: (value: string) => void
  selectedIndex: number
  onIndexChange: (index: number) => void
  maxBuildings: number
  metrics?: any
  settings?: any
  sortMethod: "iou" | "name"
  onSortChange: (method: "iou" | "name") => void
}

export function DashboardSidebar({
  selectedModel,
  onModelChange,
  selectedIndex,
  onIndexChange,
  maxBuildings,
  metrics,
  settings,
  sortMethod,
  onSortChange
}: DashboardSidebarProps) {
  
  // Local state for the input field to allow empty strings during typing
  const [inputValue, setInputValue] = useState(selectedIndex.toString())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 

  // Keep local input in sync if the slider moves the index
  useEffect(() => {
    setInputValue(selectedIndex.toString())
  }, [selectedIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val) // Update the text buffer immediately

    const parsed = parseInt(val)
    // Only update the global state if it's a valid number within range
    if (!isNaN(parsed) && parsed >= 0 && parsed < maxBuildings) {
      onIndexChange(parsed)
    }
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">3D Evaluator</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Model Dashboard</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
        {/* 1. Model Configuration */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Model Configuration</span>
          </div>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="h-9 border-border bg-secondary/50">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">equal </SelectItem>
              <SelectItem value="baseline">baseline </SelectItem>
              <SelectItem value="baseline_t80">baseline t0.8 </SelectItem>
              <SelectItem value="20p_xyz4">20p_xyz4 </SelectItem>
              <SelectItem value="20p_xyz4_t80">20p_xyz4 0.8</SelectItem>
              <SelectItem value="20p_xyz10">20p_xyz10 </SelectItem>
              <SelectItem value="huge">huge</SelectItem>
              <SelectItem value="res30">res30</SelectItem>
            </SelectContent>
          </Select>
          {/* FOLDABLE INFO CARD */}
          {settings && (
            <div className="mt-1 rounded-md border border-border bg-secondary/20 overflow-hidden transition-all duration-200">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex w-full items-center justify-between p-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors"
              >
                <span>Model Parameters</span>
                {isSettingsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              
              {isSettingsOpen && (
                <div className="border-t border-border p-3 space-y-3 bg-card/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary mb-1 block">IPT Generation</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-muted-foreground">
                      <span>Dirs: {settings.ipt_params?.n_dirs}</span>
                      <span>Res: {settings.ipt_params?.resolution}</span>
                      <span>Rad: {settings.ipt_params?.radius}</span>
                      <span>Scl: {settings.ipt_params?.scale}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 mb-1 block">Training</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-muted-foreground">
                      <span>Epochs: {settings.training?.num_epochs}</span>
                      <span>Batch: {settings.training?.batch_size}</span>
                      <span>LR: {settings.training?.learning_rate}</span>
                      <span className="text-foreground font-bold">λ: {settings.training?.lambda_topo}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Rank Selection (Slider & Improved Input) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Selection</span>
            </div>
            
            {/* SORTING TOGGLE BUTTONS */}
            <div className="flex items-center bg-secondary/40 rounded-md p-0.5 border border-border">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 rounded-sm ${sortMethod === 'iou' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSortChange('iou')}
                title="Sort by Performance (Worst to Best)"
              >
                <Trophy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 rounded-sm ${sortMethod === 'name' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSortChange('name')}
                title="Sort by Filename (A-Z)"
              >
                <ArrowDownAZ className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {sortMethod === 'iou' ? 'Rank (Worst -> Best)' : 'Alphabetical Index'}
            </span>
            <Input 
              type="number" 
              value={inputValue} 
              onChange={handleInputChange}
              className="h-7 w-20 px-1 text-center text-xs font-bold bg-secondary/30"
              min={0}
              max={maxBuildings > 0 ? maxBuildings - 1 : 0}
            />
          </div>

          <div className="px-1">
            <Slider
              value={[selectedIndex]}
              max={maxBuildings > 0 ? maxBuildings - 1 : 0}
              step={1}
              onValueChange={(vals) => onIndexChange(vals[0])}
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>Worst (0)</span>
              <span>Best ({maxBuildings > 0 ? maxBuildings - 1 : 0})</span>
            </div>
          </div>

          {metrics && (
            <div className="rounded-md bg-secondary/20 p-2 border border-border/50">
              <p className="text-[9px] uppercase text-muted-foreground mb-1 font-bold">Current Filename</p>
              <p className="text-[10px] font-mono break-all line-clamp-1 text-primary">
                {metrics.filename}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* 3. Performance Metrics */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Performance Metrics</span>
          </div>
          
          {metrics ? (
            <div className="grid grid-cols-1 gap-2">
              <MetricCard
                icon={<Target className="h-3 w-3" />}
                label="IoU Score"
                value={metrics.iou.toFixed(4)}
                color="text-emerald-400"
              />
              <MetricCard
                icon={<TrendingDown className="h-3 w-3" />}
                label="Dice Score"
                value={metrics.dice.toFixed(4)}
                color="text-amber-400"
              />
              <MetricCard
                icon={<Clock className="h-3 w-3" />}
                label="Inference Time"
                value={`${metrics.inference_time_ms.toFixed(1)}ms`}
                color="text-primary"
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Select a rank to view info</p>
          )}
        </div>
      </div>

      <Separator />
      <div className="px-5 py-4">
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          v1.4.0 &middot; LiDAR Eval Suite
        </p>
      </div>
    </aside>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  color: string 
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}