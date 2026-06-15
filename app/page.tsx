"use client";

import React, { useState } from "react";
import { TreeParams, SPECIES_PRESETS, getThreeJsCode, getReactThreeFiberCode } from "../lib/treeGenerator";
import ThreeCanvas from "../components/ThreeCanvas";
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
  HelpCircle,
  Eye,
  Info,
  Code
} from "lucide-react";

export default function Home() {
  // Main parametric state - start with "oak"
  const [params, setParams] = useState<TreeParams>(SPECIES_PRESETS.oak);
  const [activePreset, setActivePreset] = useState<string>("oak");

  // Environmental options
  const [windEnabled, setWindEnabled] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(false);
  const [viewportBg, setViewportBg] = useState<string>("#e9e9e0"); // Natural Tones Light Olive/Sand

  // AI Prompt panel state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>(
    "A majestic Quercus oak tree, representing durable core strength with balanced lush polygonal crown layers."
  );

  // Exporter code state
  const [exporterTab, setExporterTab] = useState<"vanilla" | "r3f">("vanilla");
  const [copied, setCopied] = useState<boolean>(false);

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

    const placeholders = [
      "Sowing celestial seeds...",
      "Guiding digital photosynthesis...",
      "Growing polygonal branches...",
      "Faceted cell division active...",
      "Sprouting low-poly leaves..."
    ];
    let currentMsgIndex = 0;
    
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

  return (
    <main className="min-h-screen bg-[#f5f5f0] text-[#44443a] p-4 md:p-8 selection:bg-[#5A5A40]/20 selection:text-[#5A5A40]">
      {/* Maximum width container for standard display scaling */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header - Styled to match Natural Tones design aesthetics */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-3xl border border-[#e2e2d8] shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#5A5A40]/10 text-[#5A5A40] rounded-2xl border border-[#5A5A40]/20">
              <Trees className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#2c2c24]">
                  SILVANUS <span className="font-light text-[#8e8e7e]">Low-Poly Gen</span>
                </h1>
                <span className="text-[10px] bg-[#5A5A40] text-white px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
                  3D Botanical Utility
                </span>
              </div>
              <p className="text-xs text-[#8e8e7e] mt-0.5 font-medium">
                Procedural flora custom model engine designed with flat shadow facet-shading.
              </p>
            </div>
          </div>
          
          {/* Quick Stats Panel */}
          <div className="flex gap-4 md:gap-6 border-l border-[#e2e2d8] pl-4 py-1 text-xs">
            <div>
              <span className="block text-[#a8a896] text-[10px] uppercase font-mono tracking-wider">Format support</span>
              <span className="font-semibold text-[#5A5A40]">Three.js & R3F</span>
            </div>
            <div>
              <span className="block text-[#a8a896] text-[10px] uppercase font-mono tracking-wider">Style</span>
              <span className="font-semibold text-[#2c2c24]">Faceted Flat-Shaded</span>
            </div>
          </div>
        </header>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE - Viewport display column (7 of 12 spans) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 3D Viewport itself */}
            <div className="relative group">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {/* Visual view helpers toggles */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle floor grid"
                  className={`p-2.5 rounded-xl text-xs border transition-all cursor-pointer shadow-sm ${
                    showGrid 
                      ? "bg-[#5A5A40] text-white border-[#5A5A40]" 
                      : "bg-white text-[#44443a] border-[#e2e2d8] hover:bg-[#f5f5f0]"
                  }`}
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAxes(!showAxes)}
                  title="Toggle axes helper"
                  className={`p-2.5 rounded-xl text-xs border transition-all cursor-pointer shadow-sm ${
                    showAxes 
                      ? "bg-[#5A5A40] text-white border-[#5A5A40]" 
                      : "bg-white text-[#44443a] border-[#e2e2d8] hover:bg-[#f5f5f0]"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWindEnabled(!windEnabled)}
                  title="Toggle wind sway"
                  className={`p-2.5 rounded-xl text-xs border transition-all cursor-pointer shadow-sm ${
                    windEnabled 
                      ? "bg-[#5A5A40] text-white border-[#5A5A40]" 
                      : "bg-white text-[#8e8e7e] border-[#e2e2d8] hover:bg-[#f5f5f0]"
                  }`}
                >
                  <Wind className="w-4 h-4" />
                </button>
              </div>

              {/* Mounted 3D element */}
              <ThreeCanvas 
                params={params} 
                windEnabled={windEnabled} 
                showGrid={showGrid}
                showAxes={showAxes}
                backgroundColor={viewportBg}
              />
            </div>

            {/* AI Generator Panel - Leverages server-side Gemini suggest API Route */}
            <div className="bg-white border border-[#e2e2d8] rounded-3xl p-6 flex flex-col gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-[#2c2c24]">
                <Sparkles className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-semibold text-sm md:text-base">AI Botanical Mind (Gemini Generator)</h3>
              </div>
              <p className="text-xs text-[#8e8e7e] leading-relaxed">
                Describe any creative plant, mythical shrub, or extra-terrestrial species. Our AI will automatically design and configure the parametric values, shapes, and flat shady colors ready to export.
              </p>

              <form onSubmit={handleAISuggest} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A frozen glowing cherry blossom bonsai or cyber shroom from neon swamp..."
                  disabled={aiLoading}
                  maxLength={120}
                  className="flex-1 text-sm bg-white border border-[#e2e2d8] rounded-xl px-4 py-2.5 text-[#2c2c24] placeholder-[#a8a896] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]/30 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="bg-[#5A5A40] hover:bg-[#4a4a34] disabled:bg-[#ecece4] disabled:text-[#a8a896] text-white text-sm font-medium px-4 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Sprout</span>
                    </>
                  )}
                </button>
              </form>

              {aiError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-xs">
                  {aiError}
                </div>
              )}

              {/* Creative Species bio Card */}
              <div className="bg-[#f9f9f6] rounded-xl p-4 border border-[#ecece4] flex gap-3">
                <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg h-fit">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-[#a8a896] font-mono uppercase font-semibold">Specimen description / AI bio</span>
                  <p className="text-xs text-[#44443a] mt-1 italic leading-relaxed font-serif">
                    &ldquo;{aiDescription}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Base Code Exporter Panel */}
            <div className="bg-white border border-[#e2e2d8] rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#2c2c24]">
                  <Code className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-semibold text-sm md:text-base">Asset Source Code Export</h3>
                </div>

                {/* Exporter selector */}
                <div className="flex bg-[#f5f5f0] p-1 rounded-xl border border-[#e2e2d8] shrink-0 self-start text-xs font-medium">
                  <button
                    onClick={() => setExporterTab("vanilla")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exporterTab === "vanilla" 
                        ? "bg-[#5A5A40] text-white font-semibold shadow-sm" 
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    ThreeJS Plain
                  </button>
                  <button
                    onClick={() => setExporterTab("r3f")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exporterTab === "r3f" 
                        ? "bg-[#5A5A40] text-white font-semibold shadow-sm" 
                        : "text-[#8e8e7e] hover:text-[#2c2c24]"
                    }`}
                  >
                    React Three Fiber
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* Styled copy trigger absolute button */}
                <button
                  onClick={copyCodeToClipboard}
                  className="absolute right-4 top-4 z-10 p-2.5 bg-[#3a3a32] hover:bg-[#2c2c24] border border-[#4a4a40] text-white rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 text-xs gap-1.5 font-medium shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/80" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                {/* Plain container scrolling pane */}
                <pre className="w-full h-80 overflow-auto bg-[#2c2c24] text-[#d2d2c8] p-4 pt-5 rounded-2xl border border-[#3a3a32] font-mono text-[11px] leading-relaxed shadow-inner">
                  <code>
                    {exporterTab === "vanilla" ? getThreeJsCode(params) : getReactThreeFiberCode(params)}
                  </code>
                </pre>
              </div>

              <div className="text-[10px] text-[#8e8e7e] leading-relaxed">
                💡 **Integration Tip**: The generated models require a Three.js environment with proper lighting (e.g., DirectionalLight) and shadow mapping enabled to show their distinctive polygonal, flat-shaded facets beautifully.
              </div>
            </div>

          </div>

          {/* RIGHT SIDE - Param panel & Preset controls (5 of 12 spans) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Presets Palette card */}
            <div className="bg-white border border-[#e2e2d8] rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Grid2X2 className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-semibold text-sm md:text-base text-[#2c2c24]">Species Presets</h3>
              </div>
              <p className="text-xs text-[#8e8e7e] leading-relaxed">
                Spawn structured, pre-balanced species configurations. Quickly load presets and inspect how shape counts change procedural math.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.keys(SPECIES_PRESETS).map((presetKey) => {
                  const pres = SPECIES_PRESETS[presetKey];
                  const label = presetKey.charAt(0).toUpperCase() + presetKey.slice(1);
                  const isSelected = activePreset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      onClick={() => selectPreset(presetKey)}
                      className={`py-3 px-4 rounded-2xl text-left border text-xs transition-all relative overflow-hidden flex flex-col gap-1 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? "bg-[#5A5A40]/10 border-[#5A5A40] text-[#5A5A40]"
                          : "bg-[#fafaf6] border-[#e2e2d8] hover:border-[#a8a896] text-[#44443a] hover:bg-white"
                      }`}
                    >
                      <span className={`font-semibold tracking-wide ${isSelected ? "text-[#5A5A40]" : "text-[#2c2c24]"}`}>{label}</span>
                      <span className="text-[10px] text-[#8e8e7e] font-mono capitalize">
                        {pres.foliageType.replace("-", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Parameter Sliders Panel */}
            <div className="bg-white border border-[#e2e2d8] rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e2d8]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-semibold text-sm md:text-base text-[#2c2c24]">Parametric Sculpting</h3>
                </div>
                <span className="text-[10px] font-mono bg-[#f5f5f0] border border-[#e2e2d8] text-[#8e8e7e] px-2.5 py-0.5 rounded-full select-none italic capitalize">
                  {activePreset} State
                </span>
              </div>

              {/* 1. Trunk sliders */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Trunk Geometry</span>
                </div>

                {/* Trunk Height Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Height ({params.trunkHeight.toFixed(1)}m)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">0.5 - 8.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={params.trunkHeight}
                    onChange={(e) => updateParam("trunkHeight", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Radius Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Base Thickness ({params.trunkRadius.toFixed(2)}m)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">0.05 - 1.5</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={params.trunkRadius}
                    onChange={(e) => updateParam("trunkRadius", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Taper Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Trunk Taper ({(params.trunkTaper * 100).toFixed(0)}%)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">Cylinder ➔ Cone</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.95"
                    step="0.05"
                    value={params.trunkTaper}
                    onChange={(e) => updateParam("trunkTaper", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Curvature/Bend Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Trunk Bend Offset ({params.trunkCurvature.toFixed(2)})</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">0.0 = Rigid</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={params.trunkCurvature}
                    onChange={(e) => updateParam("trunkCurvature", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Radial Segments / Low Poly Level */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Facet Sides / Polygonal Sides ({params.trunkSegments}-gon)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">3 - 8 (Extremely low-poly)</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    step="1"
                    value={params.trunkSegments}
                    onChange={(e) => updateParam("trunkSegments", parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Trunk Color Picker */}
                <div className="flex justify-between items-center text-xs mt-1 bg-[#f9f9f6] p-2.5 rounded-xl border border-[#e2e2d8]">
                  <span className="text-[#44443a] font-medium text-xs">Trunk Color ({params.trunkColor})</span>
                  <input
                    type="color"
                    value={params.trunkColor}
                    onChange={(e) => updateParam("trunkColor", e.target.value)}
                    className="w-8 h-8 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              {/* 2. Leaves/Foliage sliders */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Trees className="w-3.5 h-3.5" />
                  <span>Crown & Foliage</span>
                </div>

                {/* Foliage Type selector */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <span className="text-[#44443a] font-medium">Crown Shape Archetype</span>
                  <select
                    value={params.foliageType}
                    onChange={(e: any) => updateParam("foliageType", e.target.value)}
                    className="w-full bg-[#fafaf6] text-[#2c2c24] border border-[#e2e2d8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5A5A40]"
                  >
                    <option value="spherical">Spherical Poly-Clusters</option>
                    <option value="conic">Symmetric Faceted Cone</option>
                    <option value="tiered-cone">Concentric Layered Tiers (Pine)</option>
                    <option value="palm-fronds">Drooping Starburst (Palm)</option>
                    <option value="shroom-cap">Domed Cap with Gills (Shroom)</option>
                    <option value="cactus-arms">Upward Elbow branches (Cactus)</option>
                    <option value="bushy-tufts">Ground Bushes and Tufts</option>
                  </select>
                </div>

                {/* Foliage Size / Spread Slider */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Crown Radius ({params.foliageSize.toFixed(1)}m)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">0.3 - 4.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="4.0"
                    step="0.1"
                    value={params.foliageSize}
                    onChange={(e) => updateParam("foliageSize", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Foliage Height (For pine / shroom caps) */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Foliage Height ({params.foliageHeight.toFixed(1)}m)</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">0.4 - 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="5.0"
                    step="0.1"
                    value={params.foliageHeight}
                    onChange={(e) => updateParam("foliageHeight", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Foliage Density / Cluster detailing count */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Sub-Mesh Clusters ({params.foliageDensity})</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">Complexity Density</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={params.foliageDensity}
                    onChange={(e) => updateParam("foliageDensity", parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Foliage Tiers - Pine layers */}
                {params.foliageType === "tiered-cone" && (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center text-[#44443a]">
                      <span className="font-medium">Stacked Layers ({params.foliageTiers})</span>
                      <span className="text-[10px] font-mono text-[#a8a896]">Pine/Fir segments</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={params.foliageTiers}
                      onChange={(e) => updateParam("foliageTiers", parseInt(e.target.value))}
                      className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Leaf Dual Colors picker */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2.5 rounded-xl border border-[#e2e2d8]">
                    <span className="text-[#8e8e7e] text-[10px] uppercase font-mono">Main Leaf</span>
                    <input
                      type="color"
                      value={params.foliageColor}
                      onChange={(e) => updateParam("foliageColor", e.target.value)}
                      className="w-7 h-7 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2.5 rounded-xl border border-[#e2e2d8]">
                    <span className="text-[#8e8e7e] text-[10px] uppercase font-mono">Highlight / Alt</span>
                    <input
                      type="color"
                      value={params.foliageColorAlternate}
                      onChange={(e) => updateParam("foliageColorAlternate", e.target.value)}
                      className="w-7 h-7 rounded-lg outline-none cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Ambient wind sway strength */}
              <div className="flex flex-col gap-4 pt-2 border-t border-[#e2e2d8]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#5A5A40] tracking-wider">
                  <Wind className="w-3.5 h-3.5" />
                  <span>Ambient Wind Simulation</span>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-[#44443a]">
                    <span className="font-medium">Sway Intensity ({params.windStrength.toFixed(2)})</span>
                    <span className="text-[10px] font-mono text-[#a8a896]">Rigid ➔ Heavy Gale</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={params.windStrength}
                    disabled={!windEnabled}
                    onChange={(e) => updateParam("windStrength", parseFloat(e.target.value))}
                    className="w-full accent-[#5A5A40] bg-[#e9e9e0] h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                  />
                </div>
              </div>

              {/* 4. Display Background styling helper */}
              <div className="flex justify-between items-center text-xs bg-[#f9f9f6] p-2.5 rounded-xl border border-[#e2e2d8]">
                <span className="text-[#44443a] text-xs font-medium">Viewport environment context</span>
                <select
                  value={viewportBg}
                  onChange={(e) => setViewportBg(e.target.value)}
                  className="bg-white border border-[#e2e2d8] rounded-lg px-2 py-1 text-[11px] text-[#2c2c24] focus:outline-none"
                >
                  <option value="#e9e9e0">Silvanus Cream (#e9e9e0)</option>
                  <option value="#f5f5f0">Soft Light Ivory (#f5f5f0)</option>
                  <option value="#abcedf">Dawn Daylight (#abcedf)</option>
                  <option value="#ecece4">Highlands Mist (#ecece4)</option>
                  <option value="#171717">Studio Dark (#171717)</option>
                </select>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
