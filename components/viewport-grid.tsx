"use client"

import React, { Suspense, useRef, useEffect, useMemo } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, ContactShadows, Grid } from "@react-three/drei"
import * as THREE from "three"
import { Box, Grid3X3, Layers, Sparkles } from "lucide-react"

// --- INTERFACES ---

interface ViewportData {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface ViewportGridProps {
  selectedBuilding: string;
  selectedModel: string;
  cameraSynced: boolean;
  resetTicket: number;
  compareMode: boolean;
  comparisonModels: string[];
  onComparisonModelChange: (idx: number, model: string) => void;
}

interface ViewportCellProps {
  viewport: ViewportData;
  selectedBuilding: string;
  selectedModel: string;
  cameraSynced: boolean;
  resetTicket: number;
  compareMode: boolean;
  comparisonModels: string[];
  onComparisonModelChange: (idx: number, model: string) => void;
}

// --- 3D COMPONENTS ---

function GltfModel({ url, id }: { url: string, id: string }) {
  const { scene } = useGLTF(url)

  const normalizedScene = useMemo(() => {
    const clone = scene.clone()

    // --- 1. CONDITIONAL ROTATION (The Fix) ---
    // We ONLY rotate files from the 'results_meshes' folder (comp-0, comp-1, comp-2).
    // The regular predictions (_pred.glb) are already oriented correctly.
    const isComparisonMesh = id.startsWith("comp-");
    
    if (isComparisonMesh) {
      clone.rotation.x = -Math.PI / 2
      clone.updateMatrixWorld(true) 
    }

    // --- 2. MEASURE AND SCALE ---
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim
    clone.scale.setScalar(scale)

    const scaledBox = new THREE.Box3().setFromObject(clone)
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3())

    // --- 3. CENTER AND ALIGN ---
    clone.position.x -= scaledCenter.x
    clone.position.y -= scaledBox.min.y
    clone.position.z -= scaledCenter.z

    clone.traverse((node: any) => {
      if (node.isPoints) {
        node.material = new THREE.PointsMaterial({
          size: 0.1,
          sizeAttenuation: true,
          color: new THREE.Color("#000000"),
          vertexColors: false,
          transparent: false,
          opacity: 1
        });

        if (id === "pc" || id === "source") {
          node.material.color.set("#000000");
          node.material.size = 0.2;
        }
      }
    });
    return clone
  }, [scene, id])

  return <primitive object={normalizedScene} />
}

const INITIAL_POS = new THREE.Vector3(12, 12, 12)
const INITIAL_TARGET = new THREE.Vector3(0, 4, 0)

const sharedState = {
  position: INITIAL_POS.clone(),
  target: INITIAL_TARGET.clone(),
}

function CameraSync({ enabled, resetTicket, id }: { enabled: boolean; resetTicket: number, id: string }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const isDragging = useRef(false)
  const isAnimating = useRef(false)
  const targetPos = useRef(INITIAL_POS.clone())
  const targetLook = useRef(INITIAL_TARGET.clone())

  useEffect(() => {
    if (controlsRef.current) {
      camera.position.copy(INITIAL_POS)
      controlsRef.current.target.copy(INITIAL_TARGET)
      controlsRef.current.update()
    }
  }, [camera])

  useEffect(() => {
    if (resetTicket > 0 && controlsRef.current) {
      targetPos.current.copy(INITIAL_POS)
      targetLook.current.copy(INITIAL_TARGET)
      isAnimating.current = true
      sharedState.position.copy(INITIAL_POS)
      sharedState.target.copy(INITIAL_TARGET)
    }
  }, [resetTicket])

  const handleChange = () => {
    if (!enabled || !controlsRef.current) return
    if (isDragging.current) {
      sharedState.position.copy(camera.position)
      sharedState.target.copy(controlsRef.current.target)
      window.dispatchEvent(new CustomEvent('sync-camera', { detail: id }))
    }
  }

  useEffect(() => {
    const handleSync = (e: any) => {
      if (!enabled || e.detail === id || !controlsRef.current) return
      camera.position.copy(sharedState.position)
      controlsRef.current.target.copy(sharedState.target)
      controlsRef.current.update()
      isAnimating.current = false
    }
    window.addEventListener('sync-camera', handleSync)
    return () => window.removeEventListener('sync-camera', handleSync)
  }, [enabled, id, camera])

  useFrame((state, delta) => {
    if (isAnimating.current && !isDragging.current && controlsRef.current) {
      const speed = 8 * delta;
      const currentRadius = state.camera.position.distanceTo(controlsRef.current.target);
      const targetRadius = targetPos.current.distanceTo(targetLook.current);
      const newRadius = THREE.MathUtils.lerp(currentRadius, targetRadius, speed);

      state.camera.position.lerp(targetPos.current, speed);
      controlsRef.current.target.lerp(targetLook.current, speed);

      const direction = state.camera.position.clone().sub(controlsRef.current.target).normalize();
      state.camera.position.copy(controlsRef.current.target).add(direction.multiplyScalar(newRadius));

      controlsRef.current.update();

      if (state.camera.position.distanceTo(targetPos.current) < 0.05) {
        state.camera.position.copy(targetPos.current);
        controlsRef.current.target.copy(targetLook.current);
        controlsRef.current.update();
        isAnimating.current = false;
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={false}
      onChange={handleChange}
      onStart={() => {
        isDragging.current = true;
        isAnimating.current = false;
      }}
      onEnd={() => { isDragging.current = false }}
    />
  )
}

// --- MAIN GRID ---

export function ViewportGrid({
  selectedBuilding,
  selectedModel,
  cameraSynced,
  resetTicket,
  compareMode,
  comparisonModels,
  onComparisonModelChange
}: ViewportGridProps) {

  const viewports = compareMode ? [
    { id: "mesh", label: "Ground Truth", icon: <Box className="h-4 w-4" />, accentColor: "bg-emerald-500" },
    { id: "comp-0", label: "Model A", icon: <Sparkles className="h-4 w-4" />, accentColor: "bg-blue-500" },
    { id: "comp-1", label: "Model B", icon: <Sparkles className="h-4 w-4" />, accentColor: "bg-blue-500" },
    { id: "comp-2", label: "Model C", icon: <Sparkles className="h-4 w-4" />, accentColor: "bg-blue-500" },
  ] : [
    { id: "pc", label: "Input Points", icon: <Sparkles className="h-4 w-4" />, accentColor: "bg-blue-500" },
    { id: "mesh", label: "True Mesh", icon: <Box className="h-4 w-4" />, accentColor: "bg-emerald-500" },
    { id: "vox", label: "True Voxel", icon: <Grid3X3 className="h-4 w-4" />, accentColor: "bg-amber-500" },
    { id: "pred", label: "Predicted", icon: <Layers className="h-4 w-4" />, accentColor: "bg-rose-500" },
  ];

  return (
    <div className="grid flex-1 h-full grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 p-3 overflow-hidden">
      {viewports.map((viewport) => (
        <ViewportCell
          key={viewport.id}
          viewport={viewport}
          selectedBuilding={selectedBuilding}
          selectedModel={selectedModel}
          cameraSynced={cameraSynced}
          resetTicket={resetTicket}
          compareMode={compareMode}
          comparisonModels={comparisonModels}
          onComparisonModelChange={onComparisonModelChange}
        />
      ))}
    </div>
  )
}

function ViewportCell({
  viewport,
  selectedBuilding,
  selectedModel,
  cameraSynced,
  resetTicket,
  compareMode,
  comparisonModels,
  onComparisonModelChange
}: ViewportCellProps) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleExport = () => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedBuilding) return;

      // 1. Extract the ID index (e.g., "00142" from "00142_z41a...")
      const idx = selectedBuilding.split('_')[0];

      // 2. Determine the Model Name and Type Suffix
      let modelName = "";
      let typeSuffix = "";

      if (compareMode && viewport.id.startsWith("comp-")) {
        // Comparison Mode: Grab name from the specific slot array
        const slotIdx = parseInt(viewport.id.split("-")[1]);
        modelName = comparisonModels[slotIdx];
        typeSuffix = "pred";
      } else if (viewport.id === "pred") {
        // Normal Prediction Mode
        modelName = selectedModel;
        typeSuffix = "pred";
      } else {
        // Ground Truth Mode (pc, mesh, vox)
        modelName = "GT";
        typeSuffix = viewport.id;
      }

      // 3. Final Filename: {idx}_{modelName}_{typeSuffix}.png
      const fileName = `${idx}_${modelName}_${typeSuffix}.png`;

      // 4. Square Center-Crop Logic
      const size = Math.min(canvas.width, canvas.height);
      const offsetX = (canvas.width - size) / 2;
      const offsetY = (canvas.height - size) / 2;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const ctx = tempCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          canvas, 
          offsetX, offsetY, size, size, // Source (center crop)
          0, 0, size, size              // Destination
        );

        const link = document.createElement('a');
        link.download = fileName;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
      }
    };

    window.addEventListener('trigger-export-all', handleExport);
    return () => window.removeEventListener('trigger-export-all', handleExport);
  }, [viewport.id, selectedBuilding, selectedModel, compareMode, comparisonModels]);

  if (!selectedBuilding) {
    return (
      <div className="flex-1 bg-card rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs italic">
        Select a Rank to view 3D data
      </div>
    );
  }

  const getUrl = () => {
    // 1. Comparison Mode - Models are in results_meshes/{model}/{name}.glb
    if (compareMode && viewport.id.startsWith("comp-")) {
      const slotIdx = parseInt(viewport.id.split("-")[1]);
      const modelName = comparisonModels[slotIdx];
      return `/data/models_meshes/${modelName}/${selectedBuilding}.glb`;
    }

    // 2. Normal Mode - Prediction is in models/{model}/{name}_pred.glb
    if (viewport.id === "pred") {
      return `/data/models/${selectedModel}/${selectedBuilding}_pred.glb`;
    }

    // 3. Ground Truth - Data is in buildings/{name}/{type}.glb
    const gtBase = `/data/buildings/${selectedBuilding}`;
    switch (viewport.id) {
      case "pc": return `${gtBase}/pc.glb`;
      case "mesh": return `${gtBase}/mesh.glb`;
      case "vox": return `${gtBase}/gt_voxels.glb`;
      default: return "";
    }
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm min-h-0">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-2.5 bg-secondary/10">
        <div className={`h-2 w-2 rounded-full ${viewport.accentColor}`} />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {viewport.id.startsWith("comp-") ? comparisonModels[parseInt(viewport.id.split("-")[1])] : viewport.label}
        </span>
        
        {viewport.id.startsWith("comp-") && (
          <select 
            className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-1 outline-none font-medium"
            value={comparisonModels[parseInt(viewport.id.split("-")[1])]}
            onChange={(e) => onComparisonModelChange(parseInt(viewport.id.split("-")[1]), e.target.value)}
          >
            <option value="gt_upper_bound">gt_upper_bound</option>
            <option value="baseline">Baseline</option>
            <option value="baseline_t80">Baseline t0.8</option>
            <option value="equal">equal</option>
            <option value="20p_xyz4">20p_xyz4</option>
            <option value="20p_xyz4_t80">20p_xyz4_t80</option>
            <option value="20p_xyz10">20p_xyz10</option>
            <option value="huge">huge</option>
            <option value="res30">Res30</option>
          </select>
        )}
      </div>
      
      <div className="relative flex-1 bg-white min-h-0">
        <Canvas 
          ref={canvasRef}
          shadows 
          camera={{ fov: 45 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        > 
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          <Grid position={[0, 0, 0]} args={[40, 40]} cellSize={1} cellThickness={0.5} cellColor="#e2e8f0" sectionSize={5} sectionThickness={1} sectionColor="#cbd5e1" fadeDistance={25} infiniteGrid />
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={5} resolution={512} color="#000000" />
          <Suspense fallback={null}>
            <GltfModel url={getUrl()} id={viewport.id} />
          </Suspense>
          <CameraSync enabled={cameraSynced} resetTicket={resetTicket} id={viewport.id} />
        </Canvas>
      </div>
    </div>
  )
}