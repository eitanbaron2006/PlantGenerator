"use client";

import React, { useState } from "react";
import { TreeParams, SPECIES_PRESETS, getThreeJsCode, getReactThreeFiberCode } from "../lib/treeGenerator";
import { exportToGLB, exportToOBJ } from "../lib/modelExporter";
import ThreeCanvas, { UploadedModel } from "../components/ThreeCanvas";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { 
  Trees, 
  Sparkles, 
  Settings, 
  Sliders, 
  Copy, 
  Check, 
  RefreshCw, 
  Grid2X2, 
  Wind, 
  Sun,
  HelpCircle,
  Eye,
  Info,
  Code,
  Shuffle,
  FileCode,
  FileJson,
  X,
  Box,
  Download,
  Layers,
  Printer,
  Upload,
  Trash2,
  TreePine,
  CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Predefined set of highly diverse, creative plant configurations for the cycle-randomizer
const DIVERSE_RANDOM_PRESETS: { name: string; params: TreeParams; description: string }[] = [
  {
    name: "Redwood Giant",
    description: "A colossal ancient conifer featuring thick reddish trunks and rich, tiered evergreen pine layers.",
    params: {
      species: "pine",
      trunkHeight: 6.8,
      trunkRadius: 0.65,
      trunkColor: "#8d4f30",
      trunkSegments: 6,
      trunkTaper: 0.45,
      trunkCurvature: 0.05,
      foliageType: "tiered-cone",
      foliageSize: 2.2,
      foliageHeight: 4.8,
      foliageColor: "#14451c",
      foliageColorAlternate: "#1b5e20",
      foliageDensity: 5,
      foliageTiers: 5,
      windStrength: 0.25
    }
  },
  {
    name: "Autumn Oak",
    description: "A mature old-growth Quercus covered in warm, rustling copper-amber and gold leaf canopies.",
    params: {
      species: "oak",
      trunkHeight: 3.8,
      trunkRadius: 0.45,
      trunkColor: "#5c3a21",
      trunkSegments: 5,
      trunkTaper: 0.35,
      trunkCurvature: 0.15,
      foliageType: "spherical",
      foliageSize: 2.0,
      foliageHeight: 1.8,
      foliageColor: "#d84315",
      foliageColorAlternate: "#ff8f00",
      foliageDensity: 6,
      foliageTiers: 1,
      windStrength: 0.35
    }
  },
  {
    name: "Neon Bonsai",
    description: "A hybrid cyberpunk cyber-tree with deep charcoal wood and bio-luminescent neon cyan & violet foliage.",
    params: {
      species: "bonsai",
      trunkHeight: 1.6,
      trunkRadius: 0.32,
      trunkColor: "#222222",
      trunkSegments: 7,
      trunkTaper: 0.65,
      trunkCurvature: 1.3,
      foliageType: "spherical",
      foliageSize: 0.85,
      foliageHeight: 0.85,
      foliageColor: "#00e5ff",
      foliageColorAlternate: "#d500f9",
      foliageDensity: 4,
      foliageTiers: 2,
      windStrength: 0.3
    }
  },
  {
    name: "Golden Toadstool",
    description: "A beautiful, gigantic woodland mushroom cap radiating dynamic gold tones with delicate gills.",
    params: {
      species: "shroom",
      trunkHeight: 2.3,
      trunkRadius: 0.45,
      trunkColor: "#eae3d2",
      trunkSegments: 6,
      trunkTaper: 0.25,
      trunkCurvature: 0.35,
      foliageType: "shroom-cap",
      foliageSize: 1.8,
      foliageHeight: 0.9,
      foliageColor: "#fbc02d",
      foliageColorAlternate: "#fff59d",
      foliageDensity: 8,
      foliageTiers: 1,
      windStrength: 0.15
    }
  },
  {
    name: "Glacier Fern",
    description: "Arctic geometric ice-flora spreading frosted light blue fan fronds out of frozen rock ground.",
    params: {
      species: "fern",
      trunkHeight: 0.35,
      trunkRadius: 0.12,
      trunkColor: "#3e2723",
      trunkSegments: 4,
      trunkTaper: 0.7,
      trunkCurvature: 0.4,
      foliageType: "palm-fronds",
      foliageSize: 1.7,
      foliageHeight: 1.3,
      foliageColor: "#4fc3f7",
      foliageColorAlternate: "#0288d1",
      foliageDensity: 11,
      foliageTiers: 2,
      windStrength: 0.45
    }
  },
  {
    name: "Sakura Blossom",
    description: "A highly-stylized ornamental garden tree in magnificent pink cherry blossom bloom.",
    params: {
      species: "oak",
      trunkHeight: 3.2,
      trunkRadius: 0.38,
      trunkColor: "#3e2723",
      trunkSegments: 6,
      trunkTaper: 0.4,
      trunkCurvature: 0.4,
      foliageType: "spherical",
      foliageSize: 1.7,
      foliageHeight: 1.7,
      foliageColor: "#f48fb1",
      foliageColorAlternate: "#f8bbd0",
      foliageDensity: 6,
      foliageTiers: 1,
      windStrength: 0.4
    }
  },
  {
    name: "Flowering Cactus",
    description: "A thriving arid desert succulent loaded with multiple branching arms and bright yellow crown blooms.",
    params: {
      species: "cactus",
      trunkHeight: 2.8,
      trunkRadius: 0.38,
      trunkColor: "#33691e",
      trunkSegments: 5,
      trunkTaper: 0.1,
      trunkCurvature: 0.05,
      foliageType: "cactus-arms",
      foliageSize: 1.1,
      foliageHeight: 1.3,
      foliageColor: "#689f38",
      foliageColorAlternate: "#ffd54f",
      foliageDensity: 4,
      foliageTiers: 1,
      windStrength: 0.05
    }
  },
  {
    name: "Bramble Berry Shrub",
    description: "A wild highland hedge covered in dense low-poly bramble points with deep indigo berry accents.",
    params: {
      species: "shrub",
      trunkHeight: 0.8,
      trunkRadius: 0.18,
      trunkColor: "#455a64",
      trunkSegments: 5,
      trunkTaper: 0.3,
      trunkCurvature: 0.5,
      foliageType: "bushy-tufts",
      foliageSize: 1.5,
      foliageHeight: 1.2,
      foliageColor: "#4a148c",
      foliageColorAlternate: "#8e24aa",
      foliageDensity: 7,
      foliageTiers: 1,
      windStrength: 0.6
    }
  }
];

export default function Home() {
  // Main parametric state - start with "oak"
  const [params, setParams] = useState<TreeParams>(SPECIES_PRESETS.oak);
  const [activePreset, setActivePreset] = useState<string>("oak");

  // Custom Uploads and Forest states
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [activeUploadedId, setActiveUploadedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "forest">("single");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Cycler track state for RANDOM presets
  const [randomTrackIndex, setRandomTrackIndex] = useState<number>(0);

  // Environmental options
  const [windEnabled, setWindEnabled] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(false);
  const [viewportBg, setViewportBg] = useState<string>("#e9e9e0"); // Natural Tones Light Olive/Sand
  const [ambientLightIntensity, setAmbientLightIntensity] = useState<number>(0.58);
  const [sunLightRotation, setSunLightRotation] = useState<number>(0);

  // AI Prompt panel state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>(
    "A majestic Quercus oak tree, representing durable core strength with balanced lush polygonal crown layers."
  );

  // File Uploader parsing handler
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonText = e.target?.result as string;
          const parsed = JSON.parse(jsonText);
          
          if (parsed && typeof parsed === "object" && "species" in parsed && "trunkHeight" in parsed) {
            setParams(parsed as TreeParams);
            setActivePreset(`📥 ${file.name}`);
            setUploadSuccess(`הפרמטרים נטענו בהצלחה מקובץ: ${file.name}`);
            setAiDescription(`סדרת פרמטרים שנטענה מקובץ ה-JSON הפרוצדורלי: ${file.name}`);
          } else {
            setUploadError("מבנה קובץ ה-JSON אינו תואם לפרמטרי צמח תקינים.");
          }
        } catch (err) {
          console.error(err);
          setUploadError("שגיאה בפענוח קובץ ה-JSON.");
        }
      };
      reader.readAsText(file);
    } 
    else if (extension === "glb") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const loader = new GLTFLoader();
          
          loader.parse(
            arrayBuffer, 
            "", 
            (gltf) => {
              let vertices = 0;
              gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.geometry) {
                  const position = child.geometry.attributes.position;
                  if (position) vertices += position.count;
                }
              });

              const id = `upload-${Date.now()}`;
              const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
              
              const newModel: UploadedModel = {
                id,
                name: file.name,
                object: gltf.scene,
                type: "glb",
                fileSize: `${sizeMB} MB`,
                verticesCount: vertices,
              };

              setUploadedModels(prev => [...prev, newModel]);
              setActiveUploadedId(id);
              setUploadSuccess(`מודל GLB נטען בהצלחה! המודל נוסף לעמוד ובנוסף הופץ ביער המדגם.`);
            },
            (error) => {
              console.error(error);
              setUploadError("שגיאה בפענוח קובץ ה-GLB התלת-מימדי.");
            }
          );
        } catch (err) {
          console.error(err);
          setUploadError("שגיאה בלחיצת נתוני ה-GLB.");
        }
      };
      reader.readAsArrayBuffer(file);
    } 
    else if (extension === "obj") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const objText = e.target?.result as string;
          const loader = new OBJLoader();
          const objNode = loader.parse(objText);
          
          let vertices = 0;
          objNode.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry) {
              const position = child.geometry.attributes.position;
              if (position) vertices += position.count;
            }
          });

          const id = `upload-${Date.now()}`;
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          
          const newModel: UploadedModel = {
            id,
            name: file.name,
            object: objNode,
            type: "obj",
            fileSize: `${sizeMB} MB`,
            verticesCount: vertices,
          };

          setUploadedModels(prev => [...prev, newModel]);
          setActiveUploadedId(id);
          setUploadSuccess(`מודל OBJ נטען בהצלחה! המודל נוסף לעמוד ובנוסף הופץ ביער המדגם.`);
        } catch (err) {
          console.error(err);
          setUploadError("שגיאה בפענוח קובץ ה-OBJ הטקסטואלי.");
        }
      };
      reader.readAsText(file);
    } 
    else {
      setUploadError("פורמט קובץ לא נתמך. אנא העלה קובץ סיומת .json, .glb, או .obj.");
    }
  };

  const deleteUploadedModel = (id: string) => {
    setUploadedModels(prev => prev.filter(m => m.id !== id));
    if (activeUploadedId === id) {
      setActiveUploadedId(null);
    }
  };

  // Exporter code state & Code Dialog visibility
  const [exporterTab, setExporterTab] = useState<"vanilla" | "r3f" | "3d">("vanilla");
  const [copied, setCopied] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [glbExporting, setGlbExporting] = useState<boolean>(false);

  const handleExportGLB = async () => {
    setGlbExporting(true);
    try {
      const fileName = `${params.species}-plant-model.glb`;
      await exportToGLB(params, fileName);
    } catch (err) {
      console.error(err);
      alert("שגיאה במהלך ייצוא קובץ ה-3D GLB. אנא נסה שוב.");
    } finally {
      setGlbExporting(false);
    }
  };

  const handleExportOBJ = () => {
    try {
      const fileName = `${params.species}-plant-model.obj`;
      exportToOBJ(params, fileName);
    } catch (err) {
      console.error(err);
      alert("שגיאה במהלך ייצוא קובץ ה-OBJ. אנא נסה שוב.");
    }
  };

  // Handling presets selection
  const selectPreset = (key: string) => {
    setActivePreset(key);
    const presetPara = SPECIES_PRESETS[key];
    if (presetPara) {
      setParams(presetPara);
      setAiPrompt("");
      setAiError(null);
      // Set description matching species
      const descriptions: Record<string, string> = {
        oak: "Standard flat-shaded Quercus Oak with thick sturdy trunk and lush green spherical leaf clusters.",
        pine: "Classic low-poly evergreen spruce pine tree featuring vertical concentric cone layers.",
        palm: "Tropical palm fronds radiating outwards from high segmented curved trunks.",
        cactus: "Desert succulent cactus with horizontal upward elbow-arms and small pink blossoms.",
        shrub: "Layered ground bush clump ideal for environmental detailing or garden undergrowth.",
        bonsai: "Subdued miniature artistic tree featuring twisted trunks and intricate mini foliage.",
        shroom: "Foliage is representable by domed toadstool cap, holding under-cap detailed gills.",
        fern: "Intricate multiple ground leaves originating in circular fan spreads."
      };
      setAiDescription(descriptions[key] || "Custom procedurally formed vegetative specimen.");
    }
  };

  // Cyling Randomizer function
  const handleRandomizeCycle = () => {
    const nextIndex = (randomTrackIndex + 1) % DIVERSE_RANDOM_PRESETS.length;
    setRandomTrackIndex(nextIndex);
    const selected = DIVERSE_RANDOM_PRESETS[nextIndex];
    
    setParams(selected.params);
    setActivePreset(`✨ ${selected.name}`);
    setAiPrompt("");
    setAiError(null);
    setAiDescription(selected.description);
  };

  // Slower sliders update
  const updateParam = (key: keyof TreeParams, value: any) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
    setActivePreset("custom");
  };

  // Trigger server-side AI model parameter generator
  const handleAISuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to call generator.");
      }

      const generatedParams = await response.json();
      
      // Load generated parameters in state
      setParams({
        species: generatedParams.species || "bonsai",
        trunkHeight: Number(generatedParams.trunkHeight ?? 2),
        trunkRadius: Number(generatedParams.trunkRadius ?? 0.3),
        trunkColor: generatedParams.trunkColor || "#513529",
        trunkSegments: Number(generatedParams.trunkSegments ?? 5),
        trunkTaper: Number(generatedParams.trunkTaper ?? 0.4),
        trunkCurvature: Number(generatedParams.trunkCurvature ?? 0.5),
        foliageType: generatedParams.foliageType || "spherical",
        foliageSize: Number(generatedParams.foliageSize ?? 1.2),
        foliageHeight: Number(generatedParams.foliageHeight ?? 1.2),
        foliageColor: generatedParams.foliageColor || "#2bc24c",
        foliageColorAlternate: generatedParams.foliageColorAlternate || "#50d16c",
        foliageDensity: Number(generatedParams.foliageDensity ?? 4),
        foliageTiers: Number(generatedParams.foliageTiers ?? 2),
        windStrength: Number(generatedParams.windStrength ?? 0.5),
      });

      setAiDescription(generatedParams.specimenDescription || "A legendary procedural species.");
      setActivePreset("ai");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong. Let's try again!");
    } finally {
      setAiLoading(false);
    }
  };

  // Copy code utility
  const copyCodeToClipboard = () => {
    const code = exporterTab === "vanilla" ? getThreeJsCode(params) : getReactThreeFiberCode(params);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download active source code files
  const downloadSourceCode = () => {
    const code = exporterTab === "vanilla" ? getThreeJsCode(params) : getReactThreeFiberCode(params);
    const filename = exporterTab === "vanilla" ? "procedural-tree-threejs.js" : "ProceduralTree.tsx";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download plant parameters configuration as JSON
  const downloadJsonParams = () => {
    const jsonString = JSON.stringify(params, null, 2);
    const filename = `${params.species}-plant-params.json`;
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="h-screen w-screen bg-[#f5f5f0] text-[#44443a] p-3 md:p-4 selection:bg-[#5A5A40]/20 selection:text-[#5A5A40] flex flex-col justify-start overflow-hidden">
      
      {/* Upper standard layout spacing - widened for Blender asset workbench atmosphere */}
      <div className="max-w-[1700px] w-full h-full mx-auto flex flex-col gap-3 min-h-0 overflow-hidden">
        
        {/* TOP BAR / HEADER - Styled in Natural Tones theme */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-2xl border border-[#e2e2d8] shadow-sm gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl border border-[#5A5A40]/20">
              <Trees className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#2c2c24] flex items-center gap-1.5">
                  SILVANUS <span className="font-light text-[#8e8e7e]">Workspace Studio</span>
                </h1>
                <span className="text-[9px] bg-[#5A5A40] text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                  Procedural Flora
                </span>
                <span className="text-[9px] bg-amber-500/10 text-amber-800 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  Center Pivot v1.2
                </span>
              </div>
              <p className="text-[11px] text-[#8e8e7e] mt-0.5 font-medium">
                Flat-shaded facet parametric vegetation modeler and asset code exporter.
              </p>
            </div>
          </div>
          
          {/* Middle Active Preset Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-[#f9f9f6] border border-[#e2e2d8] py-1.5 px-3.5 rounded-full shadow-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#a8a896]">Sculpting Specimen:</span>
            <span className="text-xs font-bold text-[#5A5A40] capitalize">{activePreset}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium self-start md:self-auto">
            {/* Quick HUD Viewport Toggles in Header */}
            <div className="flex items-center gap-1 bg-[#f5f5f0] p-1.5 rounded-xl border border-[#e2e2d8] shadow-sm">
              <button
                onClick={() => setShowGrid(!showGrid)}
                title="Toggle floor grid"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  showGrid 
                    ? "bg-[#5A5A40] text-white font-semibold shadow-xs" 
                    : "text-[#44443a] hover:bg-white/80 border-0"
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden lg:inline">Floor Grid</span>
              </button>
              <button
                onClick={() => setShowAxes(!showAxes)}
                title="Toggle axes helper"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  showAxes 
                    ? "bg-[#5A5A40] text-white font-semibold shadow-xs" 
                    : "text-[#44443a] hover:bg-white/80 border-0"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden lg:inline">Axes</span>
              </button>
              <button
                onClick={() => setWindEnabled(!windEnabled)}
                title="Toggle wind animation"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  windEnabled 
                    ? "bg-[#5A5A40] text-white font-semibold shadow-xs" 
                    : "text-[#44443a] hover:bg-white/80 border-0"
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden lg:inline">Wind Sway</span>
              </button>
            </div>

            {/* Quick BG Selector in Header */}
            <div className="flex items-center gap-1 bg-[#f5f5f0] p-1.5 rounded-xl border border-[#e2e2d8] shadow-sm">
              <span className="text-[9px] text-[#8e8e7e] font-mono select-none px-1">BG:</span>
              <select
                value={viewportBg}
                onChange={(e) => setViewportBg(e.target.value)}
                className="bg-white border border-[#e2e2d8] rounded-lg px-2 py-0.5 text-[10px] text-[#2c2c24] focus:outline-none cursor-pointer font-semibold"
              >
                <option value="#e9e9e0">Silvanus Olive</option>
                <option value="#f5f5f0">Soft Light Ivory</option>
                <option value="#abcedf">Dawn Daylight</option>
                <option value="#ecece4">Highlands Mist</option>
                <option value="#171717">Studio Dark</option>
              </select>
            </div>

            {/* THE CODE EXPORTER DIALOG TRIGGER BUTTON */}
            <button
              onClick={() => setShowCodeModal(true)}
              className="bg-[#5A5A40] hover:bg-[#4a4a34] text-white px-3.5 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Code className="w-3.5 h-3.5 text-white" />
              <span>Export Source Code</span>
            </button>

            {/* NEW UPLOAD & FOREST SANDBOX DIALOG TRIGGER BUTTON */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white hover:bg-[#fafaf6] text-[#5A5A40] border border-[#e2e2d8] hover:border-[#5A5A40]/40 px-3.5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>יער והעלאת קבצים</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE LAYOUT: 3 DISTINCT COLUMNS (Left Panel, Center Viewport Stage, Right Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT SIDEBAR (Span 3 of 12) - Creators Hub (Presets & Gemini Sprouter) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-1">
            
            {/* Presets Palace Panel */}
            <div className="bg-white border border-[#e2e2d8] rounded-2xl p-4 flex flex-col gap-3 shadow-xs shrink-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e2d8]">
                <div className="flex items-center gap-2">
                  <Grid2X2 className="w-4 h-4 text-[#5A5A40]" />
                  <h3 className="font-semibold text-xs text-[#2c2c24]">Species Presets</h3>
                </div>
                <span className="text-[9px] font-mono text-[#a8a896] bg-[#f5f5f0] px-1.5 py-0.5 rounded">8 Core</span>
              </div>
              <p className="text-[10px] text-[#8e8e7e] leading-normal font-medium">
                Choose a balanced starter archetype to begin rendering custom geometric shapes.
              </p>

              {/* Standard Species grid */}
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {Object.keys(SPECIES_PRESETS).map((presetKey) => {
                  const pres = SPECIES_PRESETS[presetKey];
                  const label = presetKey.charAt(0).toUpperCase() + presetKey.slice(1);
                  const isSelected = activePreset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      onClick={() => selectPreset(presetKey)}
                      className={`py-1.5 px-2 rounded-xl text-left border text-[11px] transition-all relative overflow-hidden flex flex-col gap-0.5 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-[#5A5A40]/10 border-[#5A5A40] text-[#5A5A40]"
                          : "bg-[#fafaf6] border-[#e2e2d8] hover:border-[#a8a896] text-[#44443a] hover:bg-white"
                      }`}
                    >
                      <span className={`font-semibold tracking-wide ${isSelected ? "text-[#5A5A40]" : "text-[#2c2c24]"}`}>{label}</span>
                      <span className="text-[8.5px] text-[#8e8e7e] font-mono capitalize truncate">
                        {pres.foliageType.replace("-", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Randomize button cycling through handcrafted configs */}
              <div className="pt-2 border-t border-[#ecece4]">
                <button
                  onClick={handleRandomizeCycle}
                  className="w-full py-2.5 px-3 bg-[#5A5A40] hover:bg-[#4a4a34] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 group"
                >
                  <Shuffle className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300 text-white" />
                  <span>Cycle Random Specimen</span>
                </button>
              </div>
            </div>

            {/* AI Generator Panel - Gemini suggest API backend */}
            <div className="bg-white border border-[#e2e2d8] rounded-2xl p-4 flex flex-col gap-3 shadow-xs shrink-0">
              <div className="flex items-center gap-2 text-[#2c2c24] pb-1.5 border-b border-[#e2e2d8]">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-semibold text-xs">AI Botanical Mind</h3>
              </div>
              <p className="text-[10px] text-[#8e8e7e] leading-relaxed">
                Describe a custom environment breed (e.g. <i>&ldquo;Sakura bonsai with blue bark&rdquo;</i>). Gemini will spawn parametric formulas and colors immediately.
              </p>

              <form onSubmit={handleAISuggest} className="flex flex-col gap-1.5 mt-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Glowing cyber shroom from neon swamp..."
                  disabled={aiLoading}
                  maxLength={120}
                  className="w-full text-xs bg-[#fafaf6] border border-[#e2e2d8] rounded-lg px-2.5 py-2 text-[#2c2c24] placeholder-[#a8a896] focus:outline-none focus:border-[#5A5A40] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full bg-[#5A5A40] hover:bg-[#4a4a34] disabled:bg-[#ecece4] disabled:text-[#a8a896] text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Species...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sprout botanical formula</span>
                    </>
                  )}
                </button>
              </form>

              {aiError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-2.5 text-[10.5px] leading-relaxed">
                  {aiError}
                </div>
              )}

              {/* Biome classification info */}
              <div className="bg-[#f9f9f6] rounded-xl p-3 border border-[#ecece4] flex gap-2 w-full mt-0.5">
                <div className="p-1 px-1.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg h-fit">
                  <Info className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[8px] text-[#a8a896] font-mono uppercase font-bold">SPECIMEN FIELD TAXONOMY</span>
                  <p className="text-[10px] text-[#44443a] mt-0.5 italic leading-relaxed font-serif break-words">
                    &ldquo;{aiDescription}&rdquo;
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* CENTER DISPLAY STAGE: Dynamic 3D Viewport & Interactive Model Nursery */}
          <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
            
            {/* 3D Viewport Section with Integrated Environment Toggle */}
            <div className="bg-white border border-[#e2e2d8] rounded-2xl p-3 shadow-xs relative flex flex-col h-full min-h-0 flex-1">
              {/* Header bar within the Viewport Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#e2e2d8]">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#2c2c24]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  <span className="font-mono">OPENGL CORE VIEWPORT</span>
                  <span className="text-[10px] bg-[#5A5A40]/10 border border-[#5A5A40]/15 text-[#5A5A40] rounded-lg px-2 py-0.5 font-bold">
                    {viewMode === "single" 
                      ? "🔬 דגם בבודד (Specimen)" 
                      : "🌲 יער פרוצדורלי (16 עצים)"
                    }
                  </span>
                  {uploadedModels.length > 0 && (
                    <span className="text-[10px] bg-emerald-600/10 border border-emerald-500/15 text-emerald-800 rounded-lg px-2 py-0.5 font-bold">
                      📤 נטענו {uploadedModels.length} מוגדרים
                    </span>
                  )}
                </div>

                {/* Hebrew Mode Switcher Tab Group */}
                <div className="flex bg-[#fafaf6] border border-[#e2e2d8] rounded-xl p-0.5 self-start sm:self-auto text-[11px] font-semibold">
                  <button
                    onClick={() => setViewMode("single")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === "single"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>דגם בבודד (Specimen)</span>
                  </button>
                  <button
                    onClick={() => setViewMode("forest")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === "forest"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    <Trees className="w-3.5 h-3.5" />
                    <span>יער פרוצדורלי (Forest)</span>
                  </button>
                </div>
              </div>

              {/* Custom canvas element wrapper - Expanded to occupy all remaining vertical space */}
              <div className="w-full flex-1 min-h-[360px] md:min-h-[440px] relative rounded-xl overflow-hidden bg-[#e9e9e0]">
                <ThreeCanvas 
                  params={params} 
                  windEnabled={windEnabled} 
                  showGrid={showGrid}
                  showAxes={showAxes}
                  backgroundColor={viewportBg}
                  viewMode={viewMode}
                  uploadedModels={uploadedModels}
                  activeUploadedId={activeUploadedId}
                  ambientLightIntensity={ambientLightIntensity}
                  sunLightRotation={sunLightRotation}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Span 3 of 12) - Parametric Attribute Sculpting Panels */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0 overflow-y-auto pr-1">
            
            {/* Properties Sculptor panel */}
            <div className="bg-white border border-[#e2e2d8] rounded-2xl p-4 flex flex-col gap-4 shadow-xs shrink-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#e2e2d8]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#5A5A40]" />
                  <h3 className="font-semibold text-xs text-[#2c2c24]">Parametric Sculptor</h3>
                </div>
                <span className="text-[8px] font-mono bg-[#f5f5f0] border border-[#e2e2d8] text-[#8e8e7e] px-1.5 py-0.5 rounded-md select-none tracking-wide">
                  Active Sliders
                </span>
              </div>

              {/* 1. Trunk sliders */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Trunk Geometry</span>
                </div>

                {/* Trunk Height Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Trunk Height ({params.trunkHeight.toFixed(1)}m)</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">0.5 - 8.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={params.trunkHeight}
                    onChange={(e) => updateParam("trunkHeight", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Radius Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Base Thickness ({params.trunkRadius.toFixed(2)}m)</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">0.05 - 1.5</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={params.trunkRadius}
                    onChange={(e) => updateParam("trunkRadius", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Taper Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Trunk Taper ({(params.trunkTaper * 100).toFixed(0)}%)</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">Taper Coefficient</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.95"
                    step="0.05"
                    value={params.trunkTaper}
                    onChange={(e) => updateParam("trunkTaper", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Curvature/Bend Slider (SPECIES-SPECIFIC: HIDE for Straight rigid vegetation like Cactus/Shrooms) */}
                {!["cactus", "shroom"].includes(params.species) && (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center text-[#44443a]">
                      <span className="font-semibold text-[10.5px]">Stem Curvature ({params.trunkCurvature.toFixed(2)})</span>
                      <span className="text-[8px] font-mono text-[#a8a896]">0 to 1.5</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.05"
                      value={params.trunkCurvature}
                      onChange={(e) => updateParam("trunkCurvature", parseFloat(e.target.value))}
                      className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Trunk Radial Segments / Low Poly Level */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Facet Sides / Polygon ({params.trunkSegments}-gon)</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">3 to 8 (Faceted)</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    step="1"
                    value={params.trunkSegments}
                    onChange={(e) => updateParam("trunkSegments", parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Color Picker */}
                <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2 rounded-xl border border-[#e2e2d8]">
                  <span className="text-[#44443a] font-semibold text-[10.5px]">Trunk Hue ({params.trunkColor})</span>
                  <input
                    type="color"
                    value={params.trunkColor}
                    onChange={(e) => updateParam("trunkColor", e.target.value)}
                    className="w-7 h-7 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              {/* 2. Leaves/Foliage sliders */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[#ecece4]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Trees className="w-3.5 h-3.5" />
                  <span>Crown & Foliage</span>
                </div>

                {/* Foliage Type selector */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[#44443a] font-bold text-[10.5px]">Foliage Mesh Form</span>
                  <select
                    value={params.foliageType}
                    onChange={(e: any) => updateParam("foliageType", e.target.value)}
                    className="w-full bg-[#fafaf6] text-[#2c2c24] border border-[#e2e2d8] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5A5A40] cursor-pointer font-medium"
                  >
                    <option value="spherical">Spherical Clusters</option>
                    <option value="conic">Symmetric Cone</option>
                    <option value="tiered-cone">Layered Pine Tiers</option>
                    <option value="palm-fronds">Drooping Fronds</option>
                    <option value="shroom-cap">Gilled Mushroom Cap</option>
                    <option value="cactus-arms">Upward Cactus Arms</option>
                    <option value="bushy-tufts">Dense Low-poly Bush</option>
                  </select>
                </div>

                {/* Foliage Size / Spread Slider with dynamic label tailored to active selected plant */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">
                      {params.foliageType === "palm-fronds" ? "Fronds Scale" :
                       params.foliageType === "shroom-cap" ? "Cap Radius" :
                       params.foliageType === "cactus-arms" ? "Elbow Arm Size" :
                       "Crown Diameter"} ({params.foliageSize.toFixed(1)}m)
                    </span>
                    <span className="text-[8px] font-mono text-[#a8a896]">0.3 - 4.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="4.0"
                    step="0.1"
                    value={params.foliageSize}
                    onChange={(e) => updateParam("foliageSize", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Foliage Height (SPECIES-SPECIFIC: Hide for Spherical leaf balls or bushy hedges where height is circular) */}
                {["conic", "tiered-cone", "shroom-cap", "cactus-arms", "palm-fronds"].includes(params.foliageType) && (
                  <div className="flex flex-col gap-1 text-xs animate-fade-in">
                    <div className="flex justify-between items-center text-[#44443a]">
                      <span className="font-semibold text-[10.5px]">
                        {params.foliageType === "shroom-cap" ? "Cap Height" : "Crown Height"} ({params.foliageHeight.toFixed(1)}m)
                      </span>
                      <span className="text-[8px] font-mono text-[#a8a896]">0.4 - 5.0</span>
                    </div>
                    <input
                      type="range"
                      min="0.4"
                      max="5.0"
                      step="0.1"
                      value={params.foliageHeight}
                      onChange={(e) => updateParam("foliageHeight", parseFloat(e.target.value))}
                      className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Foliage Density / Cluster detailing count (SPECIES-SPECIFIC: Hide for Symmetric Cones as they are single geometries, and rename dynamically) */}
                {params.foliageType !== "conic" && (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center text-[#44443a]">
                      <span className="font-semibold text-[10.5px]">
                        {params.foliageType === "cactus-arms" ? "Upward Arm Count" :
                         params.foliageType === "shroom-cap" ? "Spore Spot Density" :
                         params.foliageType === "palm-fronds" ? "Palm Frond Density" :
                         "Leaf Cluster Density"} ({params.foliageDensity})
                      </span>
                      <span className="text-[8px] font-mono text-[#a8a896]">1 to 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={params.foliageDensity}
                      onChange={(e) => updateParam("foliageDensity", parseInt(e.target.value))}
                      className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Foliage Tiers - Stacked Pine layers (SPECIES-SPECIFIC: Show only for Pine tiered conifer types) */}
                {params.foliageType === "tiered-cone" && (
                  <div className="flex flex-col gap-1 text-xs animate-fade-in">
                    <div className="flex justify-between items-center text-[#44443a]">
                      <span className="font-semibold text-[10.5px]">Stacked Cone Tiers ({params.foliageTiers})</span>
                      <span className="text-[8px] font-mono text-[#a8a896]">1 to 6 layers</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={params.foliageTiers}
                      onChange={(e) => updateParam("foliageTiers", parseInt(e.target.value))}
                      className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Leaf Dual Colors picker */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2 rounded-xl border border-[#e2e2d8]">
                    <span className="text-[#8e8e7e] text-[8px] font-mono uppercase font-bold">Base</span>
                    <input
                      type="color"
                      value={params.foliageColor}
                      onChange={(e) => updateParam("foliageColor", e.target.value)}
                      className="w-6 h-6 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2 rounded-xl border border-[#e2e2d8]">
                    <span className="text-[#8e8e7e] text-[8px] font-mono uppercase font-bold">Alt</span>
                    <input
                      type="color"
                      value={params.foliageColorAlternate}
                      onChange={(e) => updateParam("foliageColorAlternate", e.target.value)}
                      className="w-6 h-6 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Ambient wind sway strength slider */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[#ecece4]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Wind className="w-3.5 h-3.5" />
                  <span>Wind Sway Strength</span>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Sway Intensity ({params.windStrength.toFixed(2)})</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">Sway Force</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={params.windStrength}
                    disabled={!windEnabled}
                    onChange={(e) => updateParam("windStrength", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                  />
                </div>
              </div>

              {/* 4. Environment Light Controls */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[#ecece4]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Environment Lighting</span>
                </div>

                {/* Ambient Light Intensity */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Ambient Intensity ({ambientLightIntensity.toFixed(2)})</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">0.1 - 2.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={ambientLightIntensity}
                    onChange={(e) => setAmbientLightIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Directional Sun Light Rotation */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-semibold text-[10.5px]">Sun Light Rotation ({sunLightRotation}°)</span>
                    <span className="text-[8px] font-mono text-[#a8a896]">0° - 360°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={sunLightRotation}
                    onChange={(e) => setSunLightRotation(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 4. HIGHLY STYLIZED BENCHMARK EXPORT DIALOG MODAL (POPUP ON TOP NAVBAR TRIGGER) */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodeModal(false)}
              className="absolute inset-0 bg-[#2c2c24]/75 backdrop-blur-md"
            />

            {/* Modal Glass panel container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-white border border-[#e2e2d8] rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-[#e2e2d8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fafaf6] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl border border-[#5A5A40]/15">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#2c2c24] flex items-center gap-2">
                      Asset Boilerplate Workbench: <span className="capitalize text-[#5A5A40]">{params.species}</span>
                    </h3>
                    <p className="text-[11px] text-[#8e8e7e] mt-0.5">
                      Retrieve 3D graphics boilerplate. The generated mathematics is specific to the active plant style.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Close button icon */}
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="p-1 px-1.5 text-[#8e8e7e] hover:text-[#2c2c24] hover:bg-[#ecece4] rounded-lg transition-all cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selection Tabs & Actions row */}
              <div className="px-5 py-3 border-b border-[#e2e2d8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#fafaf6] shrink-0">
                
                {/* Exporter selector tabs */}
                <div className="flex bg-[#f5f5f0] p-1 rounded-xl border border-[#e2e2d8] text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setExporterTab("vanilla")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exporterTab === "vanilla"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    ThreeJS Vanilla Code
                  </button>
                  <button
                    onClick={() => setExporterTab("r3f")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exporterTab === "r3f"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    React Three Fiber Code
                  </button>
                  <button
                    onClick={() => setExporterTab("3d")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exporterTab === "3d"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    📦 Export 3D Model (GLB/OBJ)
                  </button>
                </div>

                {/* Exporter actions bar within the modal - visible only for code tabs */}
                {exporterTab !== "3d" ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Copy Code */}
                    <button
                      onClick={copyCodeToClipboard}
                      className="flex-1 sm:flex-initial py-2 px-3.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold text-xs active:scale-[0.98] shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white/90" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    {/* Download Code File */}
                    <button
                      onClick={downloadSourceCode}
                      className="flex-1 sm:flex-initial py-2 px-3.5 bg-[#44443a] hover:bg-[#2c2c24] text-white rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold text-xs active:scale-[0.98] shadow-xs"
                    >
                      <FileCode className="w-3.5 h-3.5 text-white/90" />
                      <span>Download File</span>
                    </button>

                    {/* Download JSON Parameters */}
                    <button
                      onClick={downloadJsonParams}
                      className="flex-1 sm:flex-initial py-2 px-3.5 bg-white hover:bg-neutral-50 text-[#44443a] border border-[#e2e2d8] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold text-xs active:scale-[0.98] shadow-xs"
                    >
                      <FileJson className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>JSON Params</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8e8e7e] font-medium hidden sm:block">
                    ⚡ 3D Engine Ready
                  </div>
                )}
              </div>

              {/* Modal Body: Active file code viewer OR standard 3D Model cards */}
              {exporterTab === "3d" ? (
                <div className="flex-1 overflow-y-auto p-5 bg-[#fafaf6] text-[#44443a] flex flex-col gap-5 min-h-0">
                  {/* Top explanation banner */}
                  <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 rounded-2xl p-4 flex gap-3.5 items-start shrink-0">
                    <div className="p-2.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl shrink-0">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2c2c24] flex items-center gap-1">
                        <span>יצוא המודל התלת-מימדי שלך</span>
                        <span className="font-mono text-[10px] text-[#8e8e7e] capitalize">({params.species} assets)</span>
                      </h4>
                      <p className="text-[11px] text-[#8e8e7e] leading-relaxed mt-1">
                        יצא את הצמח הנוכחי כקובץ מודל תלת-מימדי אמיתי על בסיס כל הפרמטרים, הצורות והצבעים הפעילים שבחרת. הדגמים מפותחים ונוצרים בזמן אמת בפורמטים פופולריים שתוכל לגרור ישירות למנועי משחקים או תוכנות מידול!
                      </p>
                    </div>
                  </div>

                  {/* Two Main Download Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                    
                    {/* card 1: GLB */}
                    <div className="bg-white border border-[#e2e2d8] hover:border-[#5A5A40]/40 p-5 rounded-2xl flex flex-col justify-between transition-all group hover:shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] px-2.5 py-0.5 rounded-full font-bold tracking-wider font-mono">
                            GLB Binary (.glb)
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-500/10 px-2 py-0.5 rounded font-semibold shrink-0">
                            מומלץ ביותר (Color & Mesh)
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#2c2c24] mt-1">יצוא פורמט GLB צבעוני</h4>
                        <p className="text-[11px] text-[#8e8e7e] leading-relaxed mt-1.5 min-h-[50px]">
                          מייצא קובץ GLTF בינארי (.glb) מאוחד המכיל את כל הגיאומטריות ואת צבעי הצמח (Mesh Colors/Flat Materials). נפתח ישירות בבלנדר, יוניטי, גודו או אנריל עם צבעים מובנים בלי צורך בטקסטורות חיצוניות.
                        </p>

                        {/* Tech details stack */}
                        <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-mono text-[#8e8e7e] bg-[#f5f5f0] p-2 rounded-lg border border-[#e2e2d8]">
                          <span className="flex items-center gap-1">📊 Model: {params.species}</span>
                          <span>•</span>
                          <span>🌈 Materials: MeshStandard</span>
                        </div>
                      </div>

                      <button
                        onClick={handleExportGLB}
                        disabled={glbExporting}
                        className="w-full mt-4 py-2 px-4 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.98]"
                      >
                        {glbExporting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>מייצא קובץ GLB...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-white" />
                            <span>הורדת קובץ GLB</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* card 2: OBJ */}
                    <div className="bg-white border border-[#e2e2d8] hover:border-[#5A5A40]/40 p-5 rounded-2xl flex flex-col justify-between transition-all group hover:shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] bg-[#44443a]/10 text-[#44443a] px-2.5 py-0.5 rounded-full font-bold tracking-wider font-mono">
                            Wavefront OBJ (.obj)
                          </span>
                          <span className="text-[10px] text-[#8e8e7e] font-medium font-mono shrink-0">
                            Standard Polygon Mesh
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#2c2c24] mt-1">יצוא פורמט OBJ קלאסי</h4>
                        <p className="text-[11px] text-[#8e8e7e] leading-relaxed mt-1.5 min-h-[50px]">
                          מייצא את פריסת הפוליגונים נקייה כפורמט גיאומטרי קלאסי. מעולה לייבוא לכל תוכנת תלת-מימד ישנה או חדשה, ומתאים במיוחד להרצה מהירה בתוכנות פריסה לקראת <b>הדפסה בתלת-מימד (3D Printing)</b>.
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-mono text-[#8e8e7e] bg-[#f5f5f0] p-2 rounded-lg border border-[#e2e2d8]">
                          <span className="flex items-center gap-1">🛠️ Mesh: Polygonal</span>
                          <span>•</span>
                          <span>🖨️ Great for 3D Print</span>
                        </div>
                      </div>

                      <button
                        onClick={handleExportOBJ}
                        className="w-full mt-4 py-2 px-4 bg-[#44443a] hover:bg-[#2c2c24] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>הורדת קובץ OBJ</span>
                      </button>
                    </div>

                  </div>

                  {/* Tips list */}
                  <div className="bg-[#fcfcf9] border border-[#e2e2d8] rounded-2xl p-4 shrink-0">
                    <h5 className="font-bold text-xs text-[#2c2c24] flex items-center gap-1.5 mb-2">
                      <span className="text-emerald-600 text-xs shrink-0">💡</span> טיפים לעבודה מהירה:
                    </h5>
                    <ul className="text-[10.5px] text-[#8e8e7e] leading-relaxed space-y-1.5 list-disc pl-4 pr-1">
                      <li>
                        <b>תאימות חומרים:</b> קובץ ה-<b>GLB</b> נושא את ערכי הצבעים הפרוצדוריים (Vertex Colors/Materials). בבלנדר וביוניטי מומלץ לוודא שתצוגת החומרים מאופשרת כדי לראות את הצבעים על גבי הפוליגונים.
                      </li>
                      <li>
                        <b>שינוי קנה מידה:</b> הדגם מיוצא ביחידות מטרים (למשל, גזע של 4.5 מטרים מתוצר כ-4.5 יחידות). ניתן לעשות לו Scale קל בתוכנת היעד בהתאם לצורכי המשחק או הפרויקט שלך.
                      </li>
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="flex-1 overflow-hidden p-5 flex flex-col min-h-0 bg-[#2c2c24]">
                  <pre className="w-full flex-1 overflow-auto text-[#d2d2c8] font-mono text-[10.5px] leading-relaxed p-4 bg-[#23231c] rounded-2xl border border-[#3a3a32] shadow-inner select-text">
                    <code>
                      {exporterTab === "vanilla" ? getThreeJsCode(params) : getReactThreeFiberCode(params)}
                    </code>
                  </pre>
                </div>
              )}

              {/* Modal Footer helper */}
              <div className="p-4 bg-[#fafaf6] border-t border-[#e2e2d8] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 text-[10.5px] text-[#8e8e7e] font-medium leading-relaxed">
                <span className="flex items-center gap-1">
                  💡 <b>Real-time Engine</b>: הדגמים מפותחים ונוצרים ישירות מהפרמטרים הפעילים בזמן לחיצה על כפתורי הייצוא.
                </span>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 bg-[#ecece4] hover:bg-[#e2e2d8] text-[#44443a] font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 text-xs"
                >
                  Close Workbench
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CUSTOM UPLOAD & SANDBOX NURSERY MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-2xl rounded-3xl border border-[#e2e2d8] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-[#ecece4] bg-[#fafaf6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2c2c24] text-right">מרכז העלאת קבצים ובדיקת יער</h3>
                    <p className="text-[10px] text-[#8e8e7e] mt-0.5 text-right">סריקה והרצה של מודלים תלת-מימדיים ופרמטרים מותאמים אישית</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-xl text-[#8e8e7e] hover:text-[#2c2c24] hover:bg-[#ecece4] transition-all cursor-pointer mr-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-h-0 text-right" dir="rtl">
                
                {/* Visual Description */}
                <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 rounded-2xl p-4 flex gap-3.5 items-start">
                  <div className="p-2.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl shrink-0 flex items-center justify-center">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2c2c24] flex items-center gap-1">
                      <span>מיזוג תוכן חיצוני בסימולטור</span>
                    </h4>
                    <p className="text-[11px] text-[#8e8e7e] leading-relaxed mt-1">
                      המערכת מאפשרת להעלות קובצי צמח שיצרת, או מודלים חיצוניים בפורמטים נפוצים. המודלים נשמרים בזיכרון המקומי של הדפדפן ומשתלבים באופן פרוצדורלי כצמחייה אורגנית בתוך <b>היער התלת-מימדי</b> לצד שאר הצמחים.
                    </p>
                  </div>
                </div>

                {/* Upload Trigger area */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-[#2c2c24] pr-1">העלאת קובץ חדש:</span>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#fafaf6] border border-[#e2e2d8] p-4 rounded-2xl">
                    <input
                      id="dialog-file-input"
                      type="file"
                      accept=".json,.glb,.obj"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const fileInput = document.getElementById("dialog-file-input");
                        if (fileInput) fileInput.click();
                      }}
                      className="w-full sm:w-auto py-2.5 px-5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
                    >
                      <Upload className="w-4 h-4 text-white" />
                      <span>בחר קובץ (.glb, .obj, .json)</span>
                    </button>
                    <p className="text-[11px] text-[#8e8e7e] leading-relaxed flex-1 text-right">
                      תומך בקובצי <b className="font-mono text-[#5A5A40]" dir="ltr">.glb</b>, <b className="font-mono text-[#5A5A40]" dir="ltr">.obj</b> או קובצי <b className="font-mono text-[#5A5A40]" dir="ltr">.json</b> של הגדרות.
                    </p>
                  </div>
                </div>

                {/* Status response alerts */}
                {(uploadError || uploadSuccess) && (
                  <div className="space-y-2 mt-1">
                    {uploadError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-3 text-[10.5px] leading-relaxed">
                        ⚠️ <b>שגיאת טעינה:</b> {uploadError}
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/17 text-emerald-700 rounded-xl p-3 text-[10.5px] leading-relaxed">
                        🌱 <b>הצלחה:</b> {uploadSuccess}
                      </div>
                    )}
                  </div>
                )}

                {/* Models Catalog section */}
                <div className="space-y-3 mt-2">
                  <h4 className="text-[11px] uppercase font-bold text-[#8e8e7e] tracking-wider flex items-center gap-1.5 justify-start">
                    <span>קטלוג המודלים הטעונים שלך</span>
                    <span className="font-mono bg-[#fafaf6] px-1.5 py-0.5 rounded text-[9.5px]">({uploadedModels.length})</span>
                  </h4>

                  {uploadedModels.length === 0 ? (
                    <div className="text-center py-6 px-4 bg-[#fafaf6] border border-[#e2e2d8] rounded-2xl text-[10.5px] text-[#8e8e7e] italic">
                      אין מודלים טעונים כרגע במרכז ההעלאות.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pl-1">
                      {uploadedModels.map((model) => {
                        const isActive = model.id === activeUploadedId;
                        return (
                          <div
                            key={model.id}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                              isActive
                                ? "bg-[#5A5A40]/10 border-[#5A5A40]/40 shadow-xs"
                                : "bg-white border-[#e2e2d8] hover:border-[#a8a896]"
                            }`}
                          >
                            <button
                              onClick={() => {
                                setActiveUploadedId(model.id);
                                setUploadSuccess(`מציג כעת במרכז הבדיקה את המודל: ${model.name}`);
                              }}
                              className="flex-1 text-right flex items-center gap-2 min-w-0"
                            >
                              <span className={`w-2 h-2 rounded-full ${model.type === "glb" ? "bg-amber-400" : "bg-sky-400"} shrink-0`} />
                              <div className="text-right min-w-0 flex-1">
                                <p className="text-[11.5px] font-bold text-[#2c2c24] truncate leading-tight">
                                  {model.name}
                                </p>
                                <p className="text-[9.5px] text-[#8e8e7e] font-mono leading-none mt-1 flex items-center gap-1" dir="ltr">
                                  <span className="bg-neutral-100 px-1 py-0.2 rounded font-semibold text-neutral-600 uppercase text-[8px]">{model.type}</span>
                                  <span>•</span>
                                  <span>{model.fileSize}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold">{model.verticesCount.toLocaleString()} Poly</span>
                                </p>
                              </div>
                            </button>
                            
                            <div className="flex items-center gap-1.5 shrink-0 mr-2">
                              <span 
                                className={`text-[10px] px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${
                                  isActive 
                                    ? "bg-[#5A5A40] text-white" 
                                    : "bg-neutral-100 text-[#8e8e7e] hover:bg-neutral-200"
                                }`}
                                onClick={() => {
                                  setActiveUploadedId(model.id);
                                  setUploadSuccess(`מציג כעת במרכז הבדיקה את המודל: ${model.name}`);
                                }}
                              >
                                {isActive ? "בבדיקה" : "בחן דגם"}
                              </span>
                              <button
                                onClick={() => deleteUploadedModel(model.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                title="מחק מודל"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {uploadedModels.length > 0 && (
                    <div className="p-3 bg-[#7cb342]/10 border border-[#7cb342]/15 text-[#558b2f] rounded-2xl text-[10.5px] leading-relaxed font-semibold">
                      💡 <b>חיבור יער תלת-מימדי:</b> המודלים שהעלית נשמרו בהצלחה במרכז המחקר ונשתלו ברחבי ה-<b>יער הפרוצדורלי (Forest)</b>! העבר את מסך התצוגה הראשי למצב יער כדי לראות את הדגמים שלך משולבים בטבע התלת-מימדי.
                    </div>
                  )}
                </div>

              </div>

              {/* Modal footer */}
              <div className="p-4 bg-[#fafaf6] border-t border-[#e2e2d8] flex justify-between items-center gap-3">
                <span className="text-[10px] text-[#8e8e7e] font-semibold leading-relaxed">
                  העלאת קבצים תקינה למרכז הבדיקות
                </span>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#4a4a34] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  סיים ועבור לתצוגה
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
