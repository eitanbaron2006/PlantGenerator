"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TreeParams, buildTree3D, SPECIES_PRESETS } from "../lib/treeGenerator";

export interface UploadedModel {
  id: string;
  name: string;
  object: THREE.Object3D;
  type: "glb" | "obj";
  fileSize: string;
  verticesCount: number;
}

interface ThreeCanvasProps {
  params: TreeParams;
  windEnabled: boolean;
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
  viewMode: "single" | "forest";
  uploadedModels: UploadedModel[];
  activeUploadedId: string | null;
  ambientLightIntensity?: number;
  sunLightRotation?: number;
}

// Fixed scatter slots for deterministic forest layout to avoid jumping trees on slider drag
const FOREST_SLOTS = [
  // Active user-sculpted species (updating sliders dynamically update these in real time!)
  { x: 0, z: 0, scale: 1.1, rotY: 0.1, type: "active", swayOffset: 0 },
  { x: -4.0, z: 3.0, scale: 0.8, rotY: 1.5, type: "active", swayOffset: 12 },
  { x: 4.5, z: -3.5, scale: 0.95, rotY: 2.8, type: "active", swayOffset: 24 },
  { x: -3.0, z: -5.0, scale: 0.75, rotY: 4.2, type: "active", swayOffset: 36 },
  { x: 5.5, z: 2.0, scale: 1.0, rotY: 0.8, type: "active", swayOffset: 48 },
  { x: 1.8, z: 6.0, scale: 0.65, rotY: 5.4, type: "active", swayOffset: 60 },

  // Companion forest preset species to paint a beautiful mixed grove
  { x: -6.0, z: -1.5, scale: 1.15, rotY: 2.1, type: "pine", swayOffset: 5 },
  { x: 3.5, z: 5.0, scale: 0.65, rotY: 3.7, type: "shrub", swayOffset: 15 },
  { x: -1.5, z: -6.5, scale: 1.3, rotY: 0.5, type: "oak", swayOffset: 25 },
  { x: -6.5, z: 4.5, scale: 0.7, rotY: 4.9, type: "shrub", swayOffset: 35 },
  { x: 6.0, z: -6.0, scale: 0.85, rotY: 1.2, type: "cactus", swayOffset: 45 },
  { x: 5.0, z: -2.0, scale: 0.9, rotY: 2.9, type: "bonsai", swayOffset: 55 },
  { x: -2.0, z: -2.5, scale: 0.75, rotY: 3.3, type: "shroom", swayOffset: 65 },

  // Uploaded custom model placeholders (if present, we clone and plant them here)
  { x: -2.2, z: 2.2, scale: 1.0, rotY: 1.1, type: "upload_0", swayOffset: 10 },
  { x: 2.5, z: -1.2, scale: 1.15, rotY: 2.6, type: "upload_1", swayOffset: 20 },
  { x: -4.8, z: -3.2, scale: 0.8, rotY: 4.1, type: "upload_2", swayOffset: 30 },
];

export default function ThreeCanvas({
  params,
  windEnabled,
  showGrid,
  showAxes,
  backgroundColor,
  viewMode = "single",
  uploadedModels = [],
  activeUploadedId = null,
  ambientLightIntensity = 0.58,
  sunLightRotation = 0,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to active ThreeJS scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  
  // Track dynamically spawned foliage objects and active trees for wind animation
  const forestGroupRef = useRef<THREE.Group | null>(null);
  const singleTreeGroupRef = useRef<THREE.Group | null>(null);
  const uploadedGroupRef = useRef<THREE.Group | null>(null);

  // Pedestals / grounds
  const singlePedestalRef = useRef<THREE.Mesh | null>(null);
  const forestIslandRef = useRef<THREE.Mesh | null>(null);
  const comparisonPedestalRef = useRef<THREE.Mesh | null>(null);

  // Helpers
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  const [errorText, setErrorText] = useState<string | null>(null);

  // Initialize Scene, Camera, Lights & Renderer
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    try {
      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      sceneRef.current = scene;

      // 2. Camera
      const width = containerRef.current.clientWidth || 600;
      const height = containerRef.current.clientHeight || 500;
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(7, 6, 10);
      cameraRef.current = camera;

      // 3. Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // 4. Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.01; // don't clip through floor
      controls.minDistance = 1.5;
      controls.maxDistance = 35;
      controls.target.set(0, params.trunkHeight / 2, 0);
      controlsRef.current = controls;

      // 5. Bright sunny lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
      scene.add(ambientLight);
      ambientLightRef.current = ambientLight;

      const sunLight = new THREE.DirectionalLight(0xfffdf5, 1.0);
      const angleRad = (sunLightRotation * Math.PI) / 180;
      const baseSunX = 6;
      const baseSunZ = 4;
      const sX = baseSunX * Math.cos(angleRad) - baseSunZ * Math.sin(angleRad);
      const sZ = baseSunX * Math.sin(angleRad) + baseSunZ * Math.cos(angleRad);
      sunLight.position.set(sX, 12, sZ);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 30;
      sunLight.shadow.camera.left = -10;
      sunLight.shadow.camera.right = 10;
      sunLight.shadow.camera.top = 10;
      sunLight.shadow.camera.bottom = -10;
      sunLight.shadow.bias = -0.001;
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      const fillLight = new THREE.DirectionalLight(0xdcf8ff, 0.35);
      fillLight.position.set(-6, 4, -6);
      scene.add(fillLight);

      // 6. SINGLE VIEW Pedestal
      const singlePedestalGeo = new THREE.CylinderGeometry(2.8, 2.9, 0.2, 32);
      const singlePedestalMat = new THREE.MeshStandardMaterial({
        color: 0xdfdfd5,
        flatShading: true,
        roughness: 0.9,
      });
      const singlePedestal = new THREE.Mesh(singlePedestalGeo, singlePedestalMat);
      singlePedestal.position.y = -0.1;
      singlePedestal.receiveShadow = true;
      scene.add(singlePedestal);
      singlePedestalRef.current = singlePedestal;

      // COMPARISON Pedestal for Uploaded model side-by-side in single mode
      const comparisonPedestalGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.15, 24);
      const comparisonPedestal = new THREE.Mesh(comparisonPedestalGeo, singlePedestalMat);
      comparisonPedestal.position.set(3.5, -0.075, 0); // slightly offset to the side
      comparisonPedestal.receiveShadow = true;
      scene.add(comparisonPedestal);
      comparisonPedestalRef.current = comparisonPedestal;

      // 7. FOREST MODE low-poly landscape grass island
      const forestIslandGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 32);
      const forestIslandMat = new THREE.MeshStandardMaterial({
        color: 0x7cb342, // bright grassy moss
        flatShading: true,
        roughness: 0.9,
      });
      const forestIsland = new THREE.Mesh(forestIslandGeo, forestIslandMat);
      forestIsland.position.y = -0.2;
      forestIsland.receiveShadow = true;
      scene.add(forestIsland);
      forestIslandRef.current = forestIsland;

      // Add a clean soil aesthetic rim (brown cylinder slightly lower)
      const soilGeo = new THREE.CylinderGeometry(8.9, 9.1, 0.3, 32);
      const soilMat = new THREE.MeshStandardMaterial({
        color: 0x5d4037, // rich brown soil
        flatShading: true,
      });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = -0.35;
      forestIsland.add(soil);

      // Add some tiny stones to the forest island to make it look gorgeous
      const stoneGeo = new THREE.DodecahedronGeometry(0.24, 0);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.8 });
      for (let i = 0; i < 6; i++) {
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        const angle = i * (Math.PI / 3) + 0.3;
        const rad = 5.0 + Math.random() * 2.5;
        stone.position.set(Math.cos(angle) * rad, 0.05, Math.sin(angle) * rad);
        stone.scale.set(0.6 + Math.random() * 0.8, 0.4 + Math.random() * 0.5, 0.6 + Math.random() * 0.8);
        stone.castShadow = true;
        stone.receiveShadow = true;
        forestIsland.add(stone);
      }

      // 8. Visual Helpers
      const gridHelper = new THREE.GridHelper(10, 20, 0xa8a896, 0xd2d2c8);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);
      gridHelperRef.current = gridHelper;

      const axesHelper = new THREE.AxesHelper(2.5);
      axesHelper.position.set(-2.5, 0.05, -2.5);
      scene.add(axesHelper);
      axesHelperRef.current = axesHelper;

      // 9. Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height);
        
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      });
      resizeObserver.observe(containerRef.current);

      // 10. Animation render loop
      let animFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        if (windEnabled && params.windStrength > 0) {
          const strength = params.windStrength;

          // Animated swaying in Single view mode
          if (viewMode === "single" && singleTreeGroupRef.current) {
            const tree = singleTreeGroupRef.current;
            tree.rotation.z = Math.sin(elapsed * 1.5) * strength * 0.018;
            tree.rotation.x = Math.cos(elapsed * 1.0) * strength * 0.009;

            const foliage = tree.getObjectByName("foliage_group");
            if (foliage) {
              foliage.rotation.y = Math.sin(elapsed * 2.3) * strength * 0.012;
              foliage.position.x = Math.sin(elapsed * 1.8) * strength * 0.02;
            }
          }

          // Animated swaying inside Forest View (all individual trees sway on slightly different offsets!)
          if (viewMode === "forest" && forestGroupRef.current) {
            forestGroupRef.current.children.forEach((groupChild) => {
              // Retrieve specific static swayOffset assigned or fall back to child id
              const swayOffset = (groupChild as any).swayOffset || (groupChild.id % 20);
              const customScale = groupChild.scale.x || 1.0;
              
              // Sway trunk slightly
              groupChild.rotation.z = Math.sin(elapsed * 1.3 + swayOffset) * strength * 0.018 * customScale;
              groupChild.rotation.x = Math.cos(elapsed * 0.95 + swayOffset) * strength * 0.01 * customScale;

              // Ripple secondary foliage clusters if found
              const fol = groupChild.getObjectByName("foliage_group");
              if (fol) {
                fol.rotation.y = Math.sin(elapsed * 2.2 + swayOffset) * strength * 0.015;
                fol.position.x = Math.sin(elapsed * 1.7 + swayOffset) * strength * 0.02 * customScale;
              }
            });
          }
        } else {
          // Reset wind sway
          if (singleTreeGroupRef.current) {
            singleTreeGroupRef.current.rotation.set(0, 0, 0);
          }
          if (forestGroupRef.current) {
            forestGroupRef.current.children.forEach((child) => {
              child.rotation.set(0, child.rotation.y, 0); // Preserve static Y rot
            });
          }
        }

        if (controlsRef.current) {
          controlsRef.current.update();
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animFrameId);
        resizeObserver.disconnect();
        
        // Clean up memory
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        controls.dispose();
      };
    } catch (err: any) {
      console.error("ThreeJS Setup Error:", err);
      setTimeout(() => {
        setErrorText(err.message || "Renderer initialization failed.");
      }, 0);
    }
  }, []);

  // Update background when configured color is changed
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor]);

  // Dynamically update light settings when changed by environment sliders
  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = ambientLightIntensity;
    }
  }, [ambientLightIntensity]);

  useEffect(() => {
    if (sunLightRef.current) {
      const angleRad = (sunLightRotation * Math.PI) / 180;
      const baseSunX = 6;
      const baseSunZ = 4;
      const sX = baseSunX * Math.cos(angleRad) - baseSunZ * Math.sin(angleRad);
      const sZ = baseSunX * Math.sin(angleRad) + baseSunZ * Math.cos(angleRad);
      sunLightRef.current.position.set(sX, 12, sZ);
    }
  }, [sunLightRotation]);

  // Handle helpers states visibility
  useEffect(() => {
    const isSingle = viewMode === "single";
    if (gridHelperRef.current) {
      // Toggle grid completely off in Forest mode for cinematic experience
      gridHelperRef.current.visible = showGrid && isSingle;
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = showAxes && isSingle;
    }
  }, [showGrid, showAxes, viewMode]);

  // Update Model mesh when params / viewMode / uploadedModels changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Helper functions to safely purge elements from scene and free memory
    const disposeSubtree = (obj: THREE.Object3D) => {
      obj.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };

    // Remove single mode models
    if (singleTreeGroupRef.current) {
      scene.remove(singleTreeGroupRef.current);
      disposeSubtree(singleTreeGroupRef.current);
      singleTreeGroupRef.current = null;
    }
    if (uploadedGroupRef.current) {
      scene.remove(uploadedGroupRef.current);
      // NOTE: We don't dispose the actual original mesh geometries because they are managed in the parent state!
      uploadedGroupRef.current = null;
    }
    // Remove forest group
    if (forestGroupRef.current) {
      scene.remove(forestGroupRef.current);
      disposeSubtree(forestGroupRef.current);
      forestGroupRef.current = null;
    }

    // Toggle ground elements based on mode
    const isForest = viewMode === "forest";
    if (singlePedestalRef.current) {
      singlePedestalRef.current.visible = !isForest;
    }
    if (forestIslandRef.current) {
      forestIslandRef.current.visible = isForest;
    }

    // Has custom files?
    const hasUploaded = uploadedModels.length > 0;
    const activeUpload = uploadedModels.find(m => m.id === activeUploadedId) || uploadedModels[0] || null;

    if (comparisonPedestalRef.current) {
      // Pedestal only shows in single view mode when an active uploaded model is available
      comparisonPedestalRef.current.visible = !isForest && hasUploaded && activeUpload !== null;
    }

    // ------------------ SCENE MODE 1: SINGLE SPECIMEN SCULPTOR ------------------
    if (!isForest) {
      // Re-position OrbitControls camera target
      if (controlsRef.current) {
        controlsRef.current.target.set(0, params.trunkHeight / 2, 0);
      }

      // Spawn user design tree
      const newTree = buildTree3D(params);
      
      if (hasUploaded && activeUpload) {
        // Offset the custom tree slightly to the left to place side-by-side with uploaded model
        newTree.position.set(-1.5, 0, 0);
        scene.add(newTree);
        singleTreeGroupRef.current = newTree;

        // Render the uploaded GLB/OBJ model on the secondary comparison pedestal!
        try {
          const loadedClone = activeUpload.object.clone();
          
          // Re-enable/inject shadow casting in case the parser omitted it
          loadedClone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Normalize materials standard flat shading feel if desired, or keep original
              if (child.material) {
                child.material.side = THREE.DoubleSide;
              }
            }
          });

          // Position the uploaded file accurately on the companion pedestal (x = 3.5)
          loadedClone.position.set(3.5, 0, 0);
          
          // Compute bounding box to automatically normalize and scale uploaded item to look natural standing next to our tree
          const box = new THREE.Box3().setFromObject(loadedClone);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          
          if (maxDim > 0) {
            // Target scale bounding box around 3.5 meters high
            const scaleFactor = 3.5 / maxDim;
            loadedClone.scale.multiplyScalar(scaleFactor);
            
            // Reposition to ground base on the pedestal surface (y = 0)
            const newBox = new THREE.Box3().setFromObject(loadedClone);
            const minY = newBox.min.y;
            loadedClone.position.y = -minY;
          }

          // Render uploaded clone
          const cloneGroup = new THREE.Group();
          cloneGroup.add(loadedClone);
          scene.add(cloneGroup);
          uploadedGroupRef.current = cloneGroup;
          
          if (controlsRef.current) {
            controlsRef.current.target.set(1.0, params.trunkHeight / 2, 0); // center target between the two models
          }

        } catch (e) {
          console.error("Failed to render uploaded model clone in single mode:", e);
        }

      } else {
        // Standard centering
        newTree.position.set(0, 0, 0);
        scene.add(newTree);
        singleTreeGroupRef.current = newTree;
      }
    } 
    // ------------------ SCENE MODE 2: PROCEDURAL FOREST GROVE ------------------
    else {
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 2.0, 0);
      }

      const forestGroup = new THREE.Group();
      scene.add(forestGroup);
      forestGroupRef.current = forestGroup;

      // Populate slots deterministic
      FOREST_SLOTS.forEach((slot, idx) => {
        let treeMesh: THREE.Object3D | null = null;

        if (slot.type === "active") {
          // Clone the active user plant
          treeMesh = buildTree3D(params);
        } else if (slot.type.startsWith("upload")) {
          // If the user uploaded custom files, we plant them! Let's find index
          const uploadIdx = parseInt(slot.type.split("_")[1]);
          if (hasUploaded) {
            // Cycle through available models if less than 3
            const modelToPlant = uploadedModels[uploadIdx % uploadedModels.length];
            if (modelToPlant && modelToPlant.object) {
              try {
                // Clone physical meshes
                const clonedObj = modelToPlant.object.clone();
                clonedObj.traverse((c) => {
                  if (c instanceof THREE.Mesh) {
                    c.castShadow = true;
                    c.receiveShadow = true;
                    if (c.material) c.material.side = THREE.DoubleSide;
                  }
                });

                // Auto normalize bounding size to look proportionate to other trees (approx 3m)
                const box = new THREE.Box3().setFromObject(clonedObj);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                
                if (maxDim > 0) {
                  const scaleFactor = 3.0 / maxDim;
                  clonedObj.scale.multiplyScalar(scaleFactor);
                  
                  // Ground loaded model offset
                  const newBox = new THREE.Box3().setFromObject(clonedObj);
                  const minY = newBox.min.y;
                  clonedObj.position.y = -minY;
                }

                treeMesh = clonedObj;
              } catch (err) {
                console.error("Forest clone of model failed:", err);
              }
            }
          }
        } else {
          // Mixed helper forest preset species
          const presetTreeParams = SPECIES_PRESETS[slot.type];
          if (presetTreeParams) {
            treeMesh = buildTree3D(presetTreeParams);
          }
        }

        // If a mesh was successfully constructed/retrieved, place it in the forest
        if (treeMesh) {
          const wrapper = new THREE.Group();
          wrapper.position.set(slot.x, 0, slot.z);
          wrapper.rotation.y = slot.rotY;
          wrapper.scale.setScalar(slot.scale);
          
          // Save custom details directly on the group for frame anim rendering to use
          (wrapper as any).swayOffset = slot.swayOffset;

          wrapper.add(treeMesh);
          forestGroup.add(wrapper);
        }
      });
    }

  }, [params, viewMode, uploadedModels, activeUploadedId]);

  return (
    <div
      ref={containerRef}
      id="3d-viewport-container"
      className="relative w-full h-full min-h-[460px] overflow-hidden bg-[#e9e9e0] rounded-3xl border border-[#e2e2d8] flex items-center justify-center transition-all duration-300 shadow-sm"
    >
      {errorText ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f0] text-[#44443a] p-6 text-center">
          <p className="text-[#5A5A40] font-semibold mb-2">שגיאה באתחול תצוגת תלת-מימד</p>
          <p className="text-xs max-w-md">{errorText}</p>
          <p className="text-xs mt-4 text-[#8e8e7e]">
            אנא בדוק את תמיכת מאיץ הגרפיקה בדפדפן או רענן את האפליקציה.
          </p>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
      )}

      {/* Overlapping Quick Tip HUD */}
      <div className="absolute bottom-4 left-4 bg-[#2c2c24] border border-[#3a3a32] text-[10px] text-[#ecece4] font-mono py-1.5 px-3 rounded-xl flex flex-wrap gap-2.5 pointer-events-none select-none shadow-md max-w-[calc(100%-2rem)]">
        <span>🖱️ קליק שמאלי + תזוזה: סובב מצלמה</span>
        <span>🖱️ קליק ימני + תזוזה: הזז מצלמה (Pan)</span>
        <span>📜 גלגלת: זום</span>
      </div>
    </div>
  );
}
