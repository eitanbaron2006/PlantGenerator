import * as THREE from "three";
import { TreeParams, buildTree3D } from "./treeGenerator";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";

/**
 * Triggers a browser download for a Blob, ArrayBuffer, or string content.
 */
function downloadFile(content: Blob | ArrayBuffer | string, filename: string, mimeType: string) {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { type: mimeType });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports the active flora parameters as a textured/colored 3D GLB binary file (.glb).
 */
export function exportToGLB(params: TreeParams, filename: string = "procedural-flora.glb"): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a fresh tree group in memory
      const treeGroup = buildTree3D(params);
      
      // Initialize exporter
      const exporter = new GLTFExporter();
      
      exporter.parse(
        treeGroup,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            downloadFile(gltf, filename, "model/gltf-binary");
            resolve();
          } else {
            reject(new Error("Expected ArrayBuffer from GLB binary export."));
          }
        },
        (error) => {
          reject(error);
        },
        {
          binary: true,
          animations: [],
          includeCustomExtensions: false
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Exports the active flora parameters as a standard Wavefront OBJ file (.obj).
 */
export function exportToOBJ(params: TreeParams, filename: string = "procedural-flora.obj") {
  try {
    // Create direct tree group
    const treeGroup = buildTree3D(params);
    
    // Initialize standard OBJ Exporter
    const exporter = new OBJExporter();
    const result = exporter.parse(treeGroup);
    
    downloadFile(result, filename, "text/plain");
  } catch (err) {
    console.error("OBJ Export failed:", err);
    throw err;
  }
}
