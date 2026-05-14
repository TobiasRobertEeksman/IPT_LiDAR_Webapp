"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ViewportGrid } from "@/components/viewport-grid"

export default function DashboardPage() {
  const [selectedModel, setSelectedModel] = useState("equal")
  const [compareMode, setCompareMode] = useState(false)
  const [comparisonModels, setComparisonModels] = useState(["gt_upper_bound","baseline", "equal"]) // Default models for Slots 2, 3, 4
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [rankingData, setRankingData] = useState<any[]>([])
  const [cameraSynced, setCameraSynced] = useState(true)
  const [resetTicket, setResetTicket] = useState(0) 
  const [settingsData, setSettingsData] = useState<any>(null)
  const [sortMethod, setSortMethod] = useState<"iou" | "name">("iou")
  
  const handleReset = () => setResetTicket(prev => prev + 1)

  // --- ADDED: The Master Export Trigger ---
  const handleExportAll = () => {
    // This dispatches the custom event that all 4 ViewportCells are listening for
    window.dispatchEvent(new CustomEvent('trigger-export-all'));
  }

  useEffect(() => {
    fetch(`/data/models/${selectedModel}/ranking.json`)
      .then((res) => res.json())
      .then((data) => setRankingData(data))
      .catch((err) => console.error("Error loading ranking data:", err))

    fetch(`/data/models/${selectedModel}/settings.json`)
      .then((res) => res.json())
      .then((data) => setSettingsData(data))
      .catch((err) => console.error("Error loading settings data:", err))
  }, [selectedModel])

  const sortedRankingData = useMemo(() => {
    if (!rankingData.length) return [];
    const copy = [...rankingData]; 
    if (sortMethod === "name") {
      return copy.sort((a, b) => a.filename.localeCompare(b.filename));
    } else {
      return copy.sort((a, b) => a.iou - b.iou);
    }
  }, [rankingData, sortMethod])

  const handleSortChange = (newSortMethod: "iou" | "name") => {
    if (!sortedRankingData.length) return;
    const currentFilename = sortedRankingData[selectedIndex].filename;
    
    setSortMethod(newSortMethod);
    
    setTimeout(() => {
      setSelectedIndex((prev) => {
        const tempCopy = [...rankingData];
        if (newSortMethod === "name") {
          tempCopy.sort((a, b) => a.filename.localeCompare(b.filename));
        } else {
          tempCopy.sort((a, b) => a.iou - b.iou);
        }
        const newIndex = tempCopy.findIndex(item => item.filename === currentFilename);
        return newIndex !== -1 ? newIndex : 0;
      });
    }, 0);
  }

  const currentMetrics = sortedRankingData[selectedIndex]
  const selectedBuilding = currentMetrics 
    ? currentMetrics.filename.replace(".npy", "") 
    : ""

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
        maxBuildings={sortedRankingData.length}
        metrics={currentMetrics}
        settings={settingsData}
        sortMethod={sortMethod}
        onSortChange={handleSortChange}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          cameraSynced={cameraSynced}
          onCameraSyncChange={setCameraSynced}
          onReset={handleReset} 
          onExport={handleExportAll}
          compareMode={compareMode}            // Add this
          onCompareModeChange={setCompareMode} // Add this
        />
        <ViewportGrid 
          selectedBuilding={selectedBuilding}
          selectedModel={selectedModel}
          cameraSynced={cameraSynced}
          resetTicket={resetTicket}
          compareMode={compareMode}              // Add this
          comparisonModels={comparisonModels}    // Add this
          onComparisonModelChange={(idx, model) => { // Add this function
            const newModels = [...comparisonModels];
            newModels[idx] = model;
            setComparisonModels(newModels);
          }}
        />
      </main>
    </div>
  )
}