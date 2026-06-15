"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TreeParams, buildTree3D } from "../lib/treeGenerator";

interface ThreeCanvasProps {
  params: TreeParams;
  windEnabled: boolean;
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
}

export default function ThreeCanvas({
  params,
  windEnabled,
  showGrid,
  showAxes,
  backgroundColor,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep references to Three.js elements for updating in anim loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Mesh | null>(null);

  // Active helpers references
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  // Error boundary tracker
  const [errorText, setErrorText] = useState<string | null>(null);

  // Initialize scene once
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
      camera.position.set(6, 5, 8); // nice isometric-like angle
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

      // 4. OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // don't go below floor pedestal
      controls.minDistance = 2;
      controls.maxDistance = 25;
      controls.target.set(0, params.trunkHeight / 2, 0);
      controlsRef.current = controls;

      // 5. Lighting
      // Ambient soft glow
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
      scene.add(ambientLight);

      // Key Warm Directional Shadow Light (looks like sunny rays)
      const dirLight = new THREE.DirectionalLight(0xfffaf0, 0.95);
      dirLight.position.set(4, 9, 3);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 22;
      dirLight.shadow.camera.left = -4;
      dirLight.shadow.camera.right = 4;
      dirLight.shadow.camera.top = 6;
      dirLight.shadow.camera.bottom = -3;
      dirLight.shadow.bias = -0.001;
      scene.add(dirLight);

      // Fill Cool Secondary Light
      const fillLight = new THREE.DirectionalLight(0xe0f7fa, 0.4);
      fillLight.position.set(-5, 3, -5);
      scene.add(fillLight);

      // 6. Pedestal - visual asset frame
      const pedestalGeo = new THREE.CylinderGeometry(2.8, 2.9, 0.2, 24);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0xdfdfd5,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.05,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.1;
      pedestal.receiveShadow = true;
      scene.add(pedestal);
      pedestalRef.current = pedestal;

      // 7. Helpers
      const gridHelper = new THREE.GridHelper(10, 20, 0xa8a896, 0xd2d2c8);
      gridHelper.position.y = 0.01; // slightly above pedestal surface
      scene.add(gridHelper);
      gridHelperRef.current = gridHelper;

      const axesHelper = new THREE.AxesHelper(3);
      axesHelper.position.set(-2.5, 0.05, -2.5);
      scene.add(axesHelper);
      axesHelperRef.current = axesHelper;

      // 8. Resize Observer for flexible layout
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

      // 9. Simple Animation loop
      let animFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Animate wind sway if active and tree exists
        if (treeGroupRef.current) {
          const tRef = treeGroupRef.current;
          const foliageObj = tRef.getObjectByName("foliage_group");
          const trunkObj = tRef.getObjectByName("trunk_group");

          if (windEnabled && params.windStrength > 0) {
            // Sway overall group slightly
            tRef.rotation.z = Math.sin(elapsed * 1.3) * params.windStrength * 0.02;
            tRef.rotation.x = Math.cos(elapsed * 0.9) * params.windStrength * 0.01;

            if (foliageObj) {
              // Flutter branches/leaves with higher frequency
              foliageObj.rotation.y = Math.sin(elapsed * 2.2) * params.windStrength * 0.015;
              foliageObj.position.x = Math.sin(elapsed * 1.8) * params.windStrength * 0.025;
            }
          } else {
            // Reset rot
            tRef.rotation.set(0, 0, 0);
            if (foliageObj) {
              foliageObj.rotation.set(0, 0, 0);
              foliageObj.position.set(0, params.trunkHeight, 0); // rest position is top of trunk
            }
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
        
        // Clean up geometries and materials to avoid webgl memory crash
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update background when it changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor]);

  // Update helpers when visibility parameters change
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = showAxes;
    }
  }, [showGrid, showAxes]);

  // Update Model mesh when params change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Remove old tree from scene and dispose properties
    if (treeGroupRef.current) {
      scene.remove(treeGroupRef.current);
      treeGroupRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    // 2. Build and add new tree model
    const newTree = buildTree3D(params);
    newTree.position.y = 0; // Grounded on the pedestal
    scene.add(newTree);
    treeGroupRef.current = newTree;

    // 3. Move pedestal if needed or update camera target
    if (controlsRef.current) {
      controlsRef.current.target.set(0, params.trunkHeight / 2, 0);
    }
  }, [params]);

  return (
    <div
      ref={containerRef}
      id="3d-viewport-container"
      className="relative w-full h-full min-h-[440px] overflow-hidden bg-[#e9e9e0] rounded-3xl border border-[#e2e2d8] flex items-center justify-center transition-all duration-300 shadow-sm"
    >
      {errorText ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f0] text-[#44443a] p-6 text-center">
          <p className="text-[#5A5A40] font-semibold mb-2">3D Graphic Error</p>
          <p className="text-xs max-w-md">{errorText}</p>
          <p className="text-xs mt-4 text-[#8e8e7e]">
            Please verify WebGL supports or restart the dev server if empty.
          </p>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
      )}

      {/* Overlapping Quick Tip HUD */}
      <div className="absolute bottom-4 left-4 bg-[#2c2c24] border border-[#3a3a32] text-[10px] text-[#ecece4] font-mono py-1.5 px-3 rounded-xl flex gap-3 pointer-events-none select-none shadow-md">
        <span>🖱️ Left-Click + Drag: Rotate</span>
        <span>🖱️ Right-Click + Drag: Pan</span>
        <span>📜 Scroll: Zoom</span>
      </div>
    </div>
  );
}
