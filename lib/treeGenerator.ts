import * as THREE from "three";

export interface TreeParams {
  species: "oak" | "pine" | "palm" | "cactus" | "shrub" | "fern" | "bonsai" | "shroom";
  trunkHeight: number;
  trunkRadius: number;
  trunkColor: string;
  trunkSegments: number; // 3 to 8 for low-poly
  trunkTaper: number;    // 0 to 0.95
  trunkCurvature: number; // 0 to 1.5
  foliageType: "spherical" | "conic" | "tiered-cone" | "palm-fronds" | "shroom-cap" | "cactus-arms" | "bushy-tufts";
  foliageSize: number;
  foliageHeight: number;
  foliageColor: string;
  foliageColorAlternate: string;
  foliageDensity: number; // 1 to 10 clusters
  foliageTiers: number;   // 1 to 6 layers
  windStrength: number;
}

export const SPECIES_PRESETS: Record<string, TreeParams> = {
  oak: {
    species: "oak",
    trunkHeight: 3.5,
    trunkRadius: 0.4,
    trunkColor: "#795548",
    trunkSegments: 5,
    trunkTaper: 0.3,
    trunkCurvature: 0.2,
    foliageType: "spherical",
    foliageSize: 1.8,
    foliageHeight: 1.8,
    foliageColor: "#2e7d32",
    foliageColorAlternate: "#4caf50",
    foliageDensity: 5,
    foliageTiers: 1,
    windStrength: 0.4,
  },
  pine: {
    species: "pine",
    trunkHeight: 4.5,
    trunkRadius: 0.25,
    trunkColor: "#5d4037",
    trunkSegments: 4,
    trunkTaper: 0.5,
    trunkCurvature: 0.05,
    foliageType: "tiered-cone",
    foliageSize: 1.6,
    foliageHeight: 3.5,
    foliageColor: "#1b5e20",
    foliageColorAlternate: "#2e7d32",
    foliageDensity: 4,
    foliageTiers: 4,
    windStrength: 0.3,
  },
  palm: {
    species: "palm",
    trunkHeight: 5.0,
    trunkRadius: 0.3,
    trunkColor: "#8d6e63",
    trunkSegments: 5,
    trunkTaper: 0.4,
    trunkCurvature: 0.8,
    foliageType: "palm-fronds",
    foliageSize: 2.2,
    foliageHeight: 0.6,
    foliageColor: "#4caf50",
    foliageColorAlternate: "#8bc34a",
    foliageDensity: 8,
    foliageTiers: 1,
    windStrength: 0.8,
  },
  cactus: {
    species: "cactus",
    trunkHeight: 3.0,
    trunkRadius: 0.35,
    trunkColor: "#2e7d32",
    trunkSegments: 6,
    trunkTaper: 0.1,
    trunkCurvature: 0.1,
    foliageType: "cactus-arms",
    foliageSize: 1.0,
    foliageHeight: 1.2,
    foliageColor: "#1b5e20",
    foliageColorAlternate: "#ffeb3b", // spine/graft color or flower
    foliageDensity: 3,
    foliageTiers: 1,
    windStrength: 0.1,
  },
  shrub: {
    species: "shrub",
    trunkHeight: 0.6,
    trunkRadius: 0.15,
    trunkColor: "#6d4c41",
    trunkSegments: 4,
    trunkTaper: 0.4,
    trunkCurvature: 0.3,
    foliageType: "bushy-tufts",
    foliageSize: 1.2,
    foliageHeight: 1.1,
    foliageColor: "#33691e",
    foliageColorAlternate: "#558b2f",
    foliageDensity: 6,
    foliageTiers: 1,
    windStrength: 0.5,
  },
  bonsai: {
    species: "bonsai",
    trunkHeight: 1.5,
    trunkRadius: 0.28,
    trunkColor: "#4e342e",
    trunkSegments: 6,
    trunkTaper: 0.6,
    trunkCurvature: 1.4,
    foliageType: "spherical",
    foliageSize: 0.7,
    foliageHeight: 0.7,
    foliageColor: "#004d40",
    foliageColorAlternate: "#00796b",
    foliageDensity: 4,
    foliageTiers: 2,
    windStrength: 0.25,
  },
  shroom: {
    species: "shroom",
    trunkHeight: 2.0,
    trunkRadius: 0.4,
    trunkColor: "#d7ccc8",
    trunkSegments: 6,
    trunkTaper: 0.2,
    trunkCurvature: 0.4,
    foliageType: "shroom-cap",
    foliageSize: 1.5,
    foliageHeight: 0.8,
    foliageColor: "#d32f2f",
    foliageColorAlternate: "#ffe082",
    foliageDensity: 6, // stalk gills / spots
    foliageTiers: 1,
    windStrength: 0.2,
  },
  fern: {
    species: "fern",
    trunkHeight: 0.4,
    trunkRadius: 0.1,
    trunkColor: "#5d4037",
    trunkSegments: 4,
    trunkTaper: 0.7,
    trunkCurvature: 0.5,
    foliageType: "palm-fronds", // radiates leaves from base
    foliageSize: 1.6,
    foliageHeight: 1.4,
    foliageColor: "#2e7d32",
    foliageColorAlternate: "#1b5e20",
    foliageDensity: 12,
    foliageTiers: 2,
    windStrength: 0.7,
  }
};

export function createSweepGeometry(
  points: THREE.Vector3[],
  startRadius: number,
  endRadius: number,
  radialSegments: number
): THREE.BufferGeometry {
  const numPoints = points.length;
  if (numPoints < 2) return new THREE.BufferGeometry();

  const verticalSegments = numPoints - 1;

  // Generate Reference Frames (Parallel Transport) for each section
  const tangents: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = [];
  const binormals: THREE.Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const T_i = new THREE.Vector3();
    if (i === 0) {
      T_i.subVectors(points[1], points[0]).normalize();
    } else if (i === numPoints - 1) {
      T_i.subVectors(points[numPoints - 1], points[numPoints - 2]).normalize();
    } else {
      T_i.subVectors(points[i + 1], points[i - 1]).normalize();
    }
    tangents.push(T_i);
  }

  for (let i = 0; i < numPoints; i++) {
    const T_i = tangents[i];
    if (i === 0) {
      const temp = Math.abs(T_i.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const N_0 = new THREE.Vector3().crossVectors(temp, T_i).normalize();
      const B_0 = new THREE.Vector3().crossVectors(T_i, N_0).normalize();
      normals.push(N_0);
      binormals.push(B_0);
    } else {
      const T_prev = tangents[i - 1];
      const N_prev = normals[i - 1];
      
      const N_i = new THREE.Vector3().copy(N_prev);
      const axis = new THREE.Vector3().crossVectors(T_prev, T_i);
      if (axis.lengthSq() > 1e-8) {
        axis.normalize();
        const dot = T_prev.dot(T_i);
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        N_i.applyAxisAngle(axis, theta);
      }
      N_i.normalize();
      const B_i = new THREE.Vector3().crossVectors(T_i, N_i).normalize();
      normals.push(N_i);
      binormals.push(B_i);
    }
  }

  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const ringSize = radialSegments + 1;

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const r_i = startRadius + progress * (endRadius - startRadius);
    const N_i = normals[i];
    const B_i = binormals[i];
    const center = points[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const vx = center.x + r_i * (N_i.x * cosTheta + B_i.x * sinTheta);
      const vy = center.y + r_i * (N_i.y * cosTheta + B_i.y * sinTheta);
      const vz = center.z + r_i * (N_i.z * cosTheta + B_i.z * sinTheta);

      vertices.push(vx, vy, vz);
      uvs.push(j / radialSegments, progress);
    }
  }

  for (let i = 0; i < verticalSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const v1 = i * ringSize + j;
      const v2 = i * ringSize + (j + 1);
      const v3 = (i + 1) * ringSize + j;
      const v4 = (i + 1) * ringSize + (j + 1);

      indices.push(v1, v2, v3);
      indices.push(v2, v4, v3);
    }
  }

  // Bottom Cap
  const bottomCenterIndex = vertices.length / 3;
  vertices.push(points[0].x, points[0].y, points[0].z);
  uvs.push(0.5, 0);
  for (let j = 0; j < radialSegments; j++) {
    const v1 = j;
    const v2 = j + 1;
    indices.push(v2, v1, bottomCenterIndex);
  }

  // Top Cap
  const topCenterIndex = vertices.length / 3;
  vertices.push(points[numPoints - 1].x, points[numPoints - 1].y, points[numPoints - 1].z);
  uvs.push(0.5, 1);
  const topRingOffset = (numPoints - 1) * ringSize;
  for (let j = 0; j < radialSegments; j++) {
    const v1 = topRingOffset + j;
    const v2 = topRingOffset + j + 1;
    indices.push(v1, v2, topCenterIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function createSeamlessTrunkGeometry(
  trunkHeight: number,
  trunkRadius: number,
  trunkTaper: number,
  trunkCurvature: number,
  radialSegments: number,
  verticalSegments: number = 8
): THREE.BufferGeometry {
  const curvePoints: THREE.Vector3[] = [];
  let dx = 0;
  let dz = 0;

  for (let i = 0; i <= verticalSegments; i++) {
    const progress = i / verticalSegments;
    const angle = progress * Math.PI;
    dx = Math.sin(angle) * trunkCurvature * 0.4;
    dz = (1 - Math.cos(angle)) * trunkCurvature * 0.2;
    curvePoints.push(new THREE.Vector3(dx, progress * trunkHeight, dz));
  }

  return createSweepGeometry(
    curvePoints,
    trunkRadius,
    trunkRadius * (1 - trunkTaper),
    radialSegments
  );
}

export function serializeFloat32Array(arr: Float32Array | number[], fractionDigits: number = 4): string {
  const array = Array.from(arr);
  let result = "";
  const batchSize = 12;
  for (let i = 0; i < array.length; i += batchSize) {
    const slice = array.slice(i, i + batchSize);
    const chunkStr = slice.map(n => n.toFixed(fractionDigits).replace(/\.?0+$/, "")).join(", ");
    result += "    " + chunkStr + (i + batchSize < array.length ? ",\n" : "\n");
  }
  return result;
}

export function serializeIntArray(arr: number[]): string {
  let result = "";
  const batchSize = 12;
  for (let i = 0; i < arr.length; i += batchSize) {
    const slice = arr.slice(i, i + batchSize);
    result += "    " + slice.join(", ") + (i + batchSize < arr.length ? ",\n" : "\n");
  }
  return result;
}

/**
 * Builds a 3D model (THREE.Group) based on given parameters
 */
export function buildTree3D(params: TreeParams): THREE.Group {
  const treeGroup = new THREE.Group();
  treeGroup.name = "procedural_tree";

  // Shared low-poly material helper (Flat Shading is critical!)
  const createMaterial = (color: string) => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      flatShading: true,
      roughness: 0.85,
      metalness: 0.1,
    });
  };

  const trunkMat = createMaterial(params.trunkColor);
  const foliageMat = createMaterial(params.foliageColor);
  const alternateMat = createMaterial(params.foliageColorAlternate);

  // 1. Generate curved, tapered trunk
  const trunkGroup = new THREE.Group();
  trunkGroup.name = "trunk_group";
  treeGroup.add(trunkGroup);

  // Generate watertight continuous geometry
  const verticalSegmentsCount = 8;
  const trunkGeo = createSeamlessTrunkGeometry(
    params.trunkHeight,
    params.trunkRadius,
    params.trunkTaper,
    params.trunkCurvature,
    params.trunkSegments,
    verticalSegmentsCount
  );

  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  trunkGroup.add(trunkMesh);

  // Pre-calculate curvePoints to find placing coordinates for foliage tip
  const curvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= verticalSegmentsCount; i++) {
    const progress = i / verticalSegmentsCount;
    const angle = progress * Math.PI;
    const dx = Math.sin(angle) * params.trunkCurvature * 0.4;
    const dz = (1 - Math.cos(angle)) * params.trunkCurvature * 0.2;
    curvePoints.push(new THREE.Vector3(dx, progress * params.trunkHeight, dz));
  }

  // The tip or top location of the trunk
  const trunkTip = curvePoints[curvePoints.length - 1];

  // Helper to evaluate any point on the trunk curve
  const getTrunkPointAt = (t: number): THREE.Vector3 => {
    const seg = t * verticalSegmentsCount;
    const index = Math.min(verticalSegmentsCount - 1, Math.floor(seg));
    const rem = seg - index;
    return new THREE.Vector3().lerpVectors(curvePoints[index], curvePoints[index + 1], rem);
  };

  // Generate randomized seeds using custom deterministic math is ideal for keeping is clean
  const lcg = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  };
  const random = lcg(1001);

  // Secondary dynamic branches extending from the trunk
  const hasBranches = ["oak", "pine", "bonsai", "shrub"].includes(params.species);
  if (hasBranches) {
    // Number of branches based on density & species
    const branchCount = params.species === "oak" ? 3 : params.species === "bonsai" ? 2 : params.species === "shrub" ? 3 : params.species === "pine" ? 4 : 0;
    
    for (let b = 0; b < branchCount; b++) {
      // attachment points distributed along the middle of the trunk
      const t = 0.35 + (b / branchCount) * 0.45 + (random() * 0.08);
      const parentPos = getTrunkPointAt(t);
      const r_at_t = params.trunkRadius * (1 - t * params.trunkTaper);
      const bRad = r_at_t * 0.45; // branch thickness proportional to trunk at height t
      
      const angle = (b / branchCount) * Math.PI * 2 + (random() - 0.5) * 0.5;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);
      
      const maxBranchLen = params.trunkHeight * 0.35 * (1 - t * 0.4);
      const branchLen = maxBranchLen * (0.8 + random() * 0.5);
      
      // Generate a smooth curved 3D path for the branch
      const branchPoints: THREE.Vector3[] = [];
      const steps = 5;
      for (let k = 0; k <= steps; k++) {
        const bp = k / steps;
        const hDist = bp * branchLen;
        const vDist = Math.sin(bp * Math.PI * 0.45) * branchLen * 0.45 + Math.pow(bp, 2) * branchLen * 0.15;
        
        branchPoints.push(new THREE.Vector3(
          parentPos.x + hDist * dirX,
          parentPos.y + vDist,
          parentPos.z + hDist * dirZ
        ));
      }
      
      // Sweep a beautiful seamless continuous tube branch
      const branchGeo = createSweepGeometry(branchPoints, bRad, bRad * 0.15, params.trunkSegments);
      const branchMesh = new THREE.Mesh(branchGeo, trunkMat);
      branchMesh.castShadow = true;
      branchMesh.receiveShadow = true;
      trunkGroup.add(branchMesh);
      
      // Randomized foliage cluster at the end of the branch
      const branchTip = branchPoints[branchPoints.length - 1];
      const bFoliageSize = params.foliageSize * (0.4 + random() * 0.4);
      const bFoliageHeight = params.foliageHeight * (0.4 + random() * 0.4);
      
      const branchFoliageGroup = new THREE.Group();
      branchFoliageGroup.position.copy(branchTip);
      treeGroup.add(branchFoliageGroup);
      
      if (params.foliageType === "spherical") {
        const leafGeo1 = new THREE.IcosahedronGeometry(bFoliageSize, 1);
        const mesh1 = new THREE.Mesh(leafGeo1, foliageMat);
        mesh1.castShadow = true;
        branchFoliageGroup.add(mesh1);
        
        const leafGeo2 = new THREE.IcosahedronGeometry(bFoliageSize * 0.8, 1);
        const mesh2 = new THREE.Mesh(leafGeo2, alternateMat);
        mesh2.castShadow = true;
        mesh2.position.set(
          (random() - 0.5) * bFoliageSize * 0.5,
          (random() - 0.2) * bFoliageSize * 0.3,
          (random() - 0.5) * bFoliageSize * 0.5
        );
        branchFoliageGroup.add(mesh2);
      } else if (params.foliageType === "conic" || params.foliageType === "tiered-cone") {
        const leafGeo = new THREE.ConeGeometry(bFoliageSize, bFoliageHeight, Math.max(4, params.trunkSegments), 1);
        const mesh = new THREE.Mesh(leafGeo, foliageMat);
        mesh.castShadow = true;
        mesh.rotation.x = 0.1;
        branchFoliageGroup.add(mesh);
      } else if (params.foliageType === "bushy-tufts") {
        const tuftsCount = 2;
        for (let j = 0; j < tuftsCount; j++) {
          const leafGeo = new THREE.DodecahedronGeometry(bFoliageSize * (0.7 + j * 0.3), 0);
          const mesh = new THREE.Mesh(leafGeo, j % 2 === 0 ? alternateMat : foliageMat);
          mesh.castShadow = true;
          mesh.position.set(
            (random() - 0.5) * bFoliageSize * 0.4,
            (random() - 0.5) * bFoliageSize * 0.2,
            (random() - 0.5) * bFoliageSize * 0.4
          );
          branchFoliageGroup.add(mesh);
        }
      }
    }
  }

  // 2. Generate Foliage Group
  const foliageGroup = new THREE.Group();
  foliageGroup.name = "foliage_group";
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  switch (params.foliageType) {
    case "spherical": {
      // Multiple stacked low poly dodecahedrons / spheres for a bushy green clump
      const sphereSegments = 4; // chunky low poly sides
      const maxSpheres = params.foliageDensity;
      for (let j = 0; j < maxSpheres; j++) {
        const rad = params.foliageSize * (0.6 + random() * 0.4);
        
        // Use an Icosahedron (detail: 0 or 1) for distinct polygonal facets
        const foliageGeo = new THREE.IcosahedronGeometry(rad, 1);
        const useAltMaterial = random() > 0.55;
        const leafMesh = new THREE.Mesh(foliageGeo, useAltMaterial ? alternateMat : foliageMat);
        
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;

        // Position cluster spheres slightly offset from center
        if (j > 0) {
          leafMesh.position.set(
            (random() - 0.5) * params.foliageSize * 1.1,
            (random() - 0.2) * params.foliageSize * 0.8,
            (random() - 0.5) * params.foliageSize * 1.1
          );
        } else {
          // Centered main cluster
          leafMesh.position.set(0, 0, 0);
        }
        foliageGroup.add(leafMesh);
      }
      break;
    }

    case "conic": {
      // Classic multi-faceted tree cone
      const coneHeight = params.foliageHeight;
      const coneGeo = new THREE.ConeGeometry(params.foliageSize, coneHeight, Math.max(4, params.trunkSegments), 1);
      const leafMesh = new THREE.Mesh(coneGeo, foliageMat);
      leafMesh.castShadow = true;
      leafMesh.receiveShadow = true;
      leafMesh.position.y = coneHeight / 2 - 0.2; // raise above trunk
      foliageGroup.add(leafMesh);
      break;
    }

    case "tiered-cone": {
      // E.g. Pine trees. Multiple tiered overlapping cones stacked vertically
      const totalTiers = params.foliageTiers;
      const tierHeight = params.foliageHeight / totalTiers;
      
      for (let t = 0; t < totalTiers; t++) {
        const tierFactor = (totalTiers - t) / totalTiers; // Tapering
        const tierRadius = params.foliageSize * (0.35 + tierFactor * 0.65);
        const coneHeight = tierHeight * 1.4; // overlapping factor
        
        const coneGeo = new THREE.ConeGeometry(
          tierRadius,
          coneHeight,
          Math.max(4, params.trunkSegments),
          1
        );
        
        const isOdd = t % 2 === 0;
        const mesh = new THREE.Mesh(coneGeo, isOdd ? foliageMat : alternateMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Position on stacked Y levels
        mesh.position.y = (t * (tierHeight * 0.85)) + (coneHeight / 2) - 0.3;
        
        // Slightly rotate each tier for low-poly variety
        mesh.rotation.y = t * 0.45;
        foliageGroup.add(mesh);
      }
      break;
    }

    case "palm-fronds": {
      // Starburst fronds. Draw boxes extending outwards and curving downwards
      const frondCount = params.foliageDensity + 4; // 8 to 14 fronds
      const size = params.foliageSize;
      
      for (let f = 0; f < frondCount; f++) {
        const baseAngle = (f / frondCount) * Math.PI * 2;
        const frondPivot = new THREE.Group();
        frondPivot.rotation.y = baseAngle;
        
        // Create leaves branching outwards. Slender boxes represent palm fronds
        const length = size * (0.8 + random() * 0.3);
        const thickness = 0.03 + random() * 0.03;
        const width = 0.2 + random() * 0.15;
        
        // Segmented low-poly folding downwards
        const leafSegCount = 3;
        let cumulativeParent = frondPivot;
        
        for (let s = 0; s < leafSegCount; s++) {
          const segGeo = new THREE.BoxGeometry(width * (1.2 - s*0.35), thickness, length / leafSegCount);
          const leafMat = s % 2 === 0 ? foliageMat : alternateMat;
          const frondMesh = new THREE.Mesh(segGeo, leafMat);
          frondMesh.castShadow = true;
          frondMesh.receiveShadow = true;
          
          // Offset pivot to tip of the previous segment
          const posZValue = s === 0 ? (length / leafSegCount) / 2 : (length / leafSegCount);
          frondMesh.position.set(0, 0, posZValue);
          
          // Curve downwards
          frondMesh.rotation.x = -0.15 - (s * 0.12);
          
          const segGroup = new THREE.Group();
          segGroup.add(frondMesh);
          if (s > 0) {
            segGroup.position.set(0, 0, (length / leafSegCount) / 2);
          }
          
          cumulativeParent.add(segGroup);
          cumulativeParent = segGroup;
        }

        // Rotate frond group slightly around Z or X for organic droop
        frondPivot.rotation.x = 0.25; // Angled up first, then curves
        foliageGroup.add(frondPivot);
      }
      break;
    }

    case "shroom-cap": {
      // Mushroom cap: Flattened hemisphere or squashed cylinders
      const capRadius = params.foliageSize;
      const capHeight = params.foliageHeight;
      const numSegments = params.trunkSegments * 2; // custom detail

      // Cap mesh: squashed cylinder with a closed dome or a flat cylinder/cone
      const capGeo = new THREE.CylinderGeometry(
        capRadius * 0.1, // Pointy top
        capRadius,       // Outer edge
        capHeight,
        numSegments,
        1,
        false
      );
      const capMesh = new THREE.Mesh(capGeo, foliageMat);
      capMesh.castShadow = true;
      capMesh.receiveShadow = true;
      capMesh.position.y = capHeight / 2;
      foliageGroup.add(capMesh);

      // Add a smaller white/yellow rim under-cap layer (gills) & spots
      const gillGeo = new THREE.CylinderGeometry(
        capRadius * 1.01,
        capRadius * 0.6,
        0.1,
        numSegments,
        1
      );
      const gillMesh = new THREE.Mesh(gillGeo, alternateMat);
      gillMesh.position.y = 0.05;
      foliageGroup.add(gillMesh);

      // Spots (low poly boxes / tetrahedrons sitting on top of cap)
      const numSpots = Math.min(10, params.foliageDensity);
      for (let s = 0; s < numSpots; s++) {
        const spotGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
        const spotMesh = new THREE.Mesh(spotGeo, alternateMat);
        
        // Random spherical top distribution
        const theta = random() * Math.PI * 2;
        const phi = random() * Math.PI * 0.35; // keep on upper part
        
        const spotRad = capRadius * 0.85;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sz = Math.sin(phi) * Math.sin(theta);
        const sy = Math.cos(phi) * capHeight * 0.75 + 0.1;
        
        spotMesh.position.set(sx * spotRad, sy, sz * spotRad);
        
        // Rotate spot to align with normal
        spotMesh.rotation.set(phi * Math.sin(theta), theta, phi * Math.cos(theta));
        foliageGroup.add(spotMesh);
      }
      break;
    }

    case "cactus-arms": {
      // Create seamless curved low-poly tube arms
      const armCount = Math.min(4, params.foliageDensity);
      
      for (let a = 0; a < armCount; a++) {
        const t = 0.3 + a * 0.18; // Distribute arms vertically along the trunk
        const trunkPosAtT = getTrunkPointAt(t);
        
        const armHeight = params.foliageHeight * (0.55 + random() * 0.3);
        const armRadius = params.trunkRadius * 0.72 * (1 - t * params.trunkTaper);
        const numSides = params.trunkSegments;

        // Position & rotation angle on trunk
        const angle = (a / armCount) * Math.PI * 1.8 + (random() - 0.5) * 0.25;
        const dirX = Math.cos(angle);
        const dirZ = Math.sin(angle);

        const elbowLen = params.foliageSize * 0.38;

        // Construct 6 beautiful control points for a smooth curved tube arm
        const armPoints: THREE.Vector3[] = [];
        // Pt 0: deep inside the trunk
        armPoints.push(new THREE.Vector3(trunkPosAtT.x, trunkPosAtT.y, trunkPosAtT.z));
        // Pt 1: trunk surface
        armPoints.push(new THREE.Vector3(trunkPosAtT.x + dirX * armRadius, trunkPosAtT.y, trunkPosAtT.z + dirZ * armRadius));
        // Pt 2: shoulder extending horizontally
        const shoulderX = trunkPosAtT.x + dirX * (armRadius + elbowLen * 0.85);
        const shoulderZ = trunkPosAtT.z + dirZ * (armRadius + elbowLen * 0.85);
        armPoints.push(new THREE.Vector3(shoulderX, trunkPosAtT.y, shoulderZ));
        // Pt 3: bending upward
        const elbowX = trunkPosAtT.x + dirX * (armRadius + elbowLen);
        const elbowZ = trunkPosAtT.z + dirZ * (armRadius + elbowLen);
        const elbowY = trunkPosAtT.y + armHeight * 0.15;
        armPoints.push(new THREE.Vector3(elbowX, elbowY, elbowZ));
        // Pt 4: climbing vertically
        const tipY = trunkPosAtT.y + armHeight;
        armPoints.push(new THREE.Vector3(elbowX, (elbowY + tipY) * 0.5, elbowZ));
        // Pt 5: Tip
        armPoints.push(new THREE.Vector3(elbowX, tipY, elbowZ));

        // Create the gorgeous swept single tube arm geometry
        const armGeo = createSweepGeometry(armPoints, armRadius, armRadius * 0.82, numSides);
        const armMesh = new THREE.Mesh(armGeo, foliageMat);
        armMesh.castShadow = true;
        armMesh.receiveShadow = true;
        
        // Add to treeGroup directly so we retain absolute coordinates perfectly
        treeGroup.add(armMesh);

        // Small blossom flowers/buds on tips (spherical/icosahedron)
        if (random() > 0.4) {
          const flowerGeo = new THREE.IcosahedronGeometry(armRadius * 0.65, 0);
          const flowerMesh = new THREE.Mesh(flowerGeo, alternateMat);
          flowerMesh.position.set(elbowX, tipY + 0.05, elbowZ);
          treeGroup.add(flowerMesh);
        }
      }

      // Add a flower on the top center of cactus (at trunkTip)
      const topFlowerGeo = new THREE.IcosahedronGeometry(params.trunkRadius * 0.75, 1);
      const topFlowerMesh = new THREE.Mesh(topFlowerGeo, alternateMat);
      topFlowerMesh.position.copy(trunkTip);
      treeGroup.add(topFlowerMesh);
      break;
    }

    case "bushy-tufts": {
      // Cloud of low poly clusters. Perfect for dense bushes, shrubs or foliage
      const maxTufts = params.foliageDensity + 3;
      for (let t = 0; t < maxTufts; t++) {
        const radius = params.foliageSize * (0.5 + random() * 0.55);
        const bushyGeo = new THREE.DodecahedronGeometry(radius, 0); // sharp low poly
        
        const isOdd = t % 2 === 0;
        const tuftMesh = new THREE.Mesh(bushyGeo, isOdd ? foliageMat : alternateMat);
        tuftMesh.castShadow = true;
        tuftMesh.receiveShadow = true;

        // Spread them out, including closer to ground
        tuftMesh.position.set(
          (random() - 0.5) * params.foliageSize * 1.6,
          (random() - 0.5) * params.foliageSize * 0.6,
          (random() - 0.5) * params.foliageSize * 1.6
        );
        foliageGroup.add(tuftMesh);
      }
      break;
    }
  }

  // Adjust global group height and offsets
  // Add a simple bounding helper box or parameters for pivot centering
  return treeGroup;
}

/**
 * Returns raw copy-pasteable JavaScript code for creating the model in active Three.js scenes
 * Customized specifically for the selected species: ${params.species} (foliage: ${params.foliageType})
 */
export function getThreeJsCode(params: TreeParams): string {
  const hasBranches = ["oak", "pine", "bonsai", "shrub"].includes(params.species);
  const isCactus = params.foliageType === "cactus-arms";

  // Build the foliage-specific drawing snippet
  let foliageCode = "";
  if (params.foliageType === "spherical") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (${params.species.toUpperCase()} spherical clusters)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const foliageSize = ${params.foliageSize};
  const foliageDensity = ${params.foliageDensity};

  for (let j = 0; j < foliageDensity; j++) {
    const radius = foliageSize * (0.6 + random() * 0.4);
    const geo = new THREE.IcosahedronGeometry(radius, 1);
    const useAlt = random() > 0.55;
    const mesh = new THREE.Mesh(geo, useAlt ? alternateMaterial : foliageMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (j > 0) {
      mesh.position.set(
        (random() - 0.5) * foliageSize * 1.1,
        (random() - 0.2) * foliageSize * 0.8,
        (random() - 0.5) * foliageSize * 1.1
      );
    } else {
      mesh.position.set(0, 0, 0);
    }
    foliageGroup.add(mesh);
  }`;
  } else if (params.foliageType === "conic") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Cone)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const foliageSize = ${params.foliageSize};
  const foliageHeight = ${params.foliageHeight};

  const coneGeo = new THREE.ConeGeometry(foliageSize, foliageHeight, Math.max(4, ${params.trunkSegments}), 1);
  const leafMesh = new THREE.Mesh(coneGeo, foliageMaterial);
  leafMesh.castShadow = true;
  leafMesh.receiveShadow = true;
  leafMesh.position.y = foliageHeight / 2 - 0.2;
  foliageGroup.add(leafMesh);`;
  } else if (params.foliageType === "tiered-cone") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Stacked Pine Tiers)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const totalTiers = ${params.foliageTiers};
  const foliageSize = ${params.foliageSize};
  const foliageHeight = ${params.foliageHeight};
  const tierHeight = foliageHeight / totalTiers;
  
  for (let t = 0; t < totalTiers; t++) {
    const tierFactor = (totalTiers - t) / totalTiers;
    const tierRadius = foliageSize * (0.35 + tierFactor * 0.65);
    const coneHeight = tierHeight * 1.4;
    
    const coneGeo = new THREE.ConeGeometry(
      tierRadius,
      coneHeight,
      Math.max(4, ${params.trunkSegments}),
      1
    );
    
    const isOdd = t % 2 === 0;
    const mesh = new THREE.Mesh(coneGeo, isOdd ? foliageMaterial : alternateMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = (t * (tierHeight * 0.85)) + (coneHeight / 2) - 0.3;
    mesh.rotation.y = t * 0.45;
    foliageGroup.add(mesh);
  }`;
  } else if (params.foliageType === "palm-fronds") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Palm Fronds)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const frondCount = ${params.foliageDensity} + 4;
  const size = ${params.foliageSize};
  
  for (let f = 0; f < frondCount; f++) {
    const baseAngle = (f / frondCount) * Math.PI * 2;
    const frondPivot = new THREE.Group();
    frondPivot.rotation.y = baseAngle;
    
    const length = size * (0.8 + random() * 0.3);
    const thickness = 0.03 + random() * 0.03;
    const width = 0.2 + random() * 0.15;
    
    // Segmented palm curve
    let cumulativeParent = frondPivot;
    for (let s = 0; s < 3; s++) {
      const segGeo = new THREE.BoxGeometry(width * (1.2 - s * 0.35), thickness, length / 3);
      const leafMat = s % 2 === 0 ? foliageMaterial : alternateMaterial;
      const frondMesh = new THREE.Mesh(segGeo, leafMat);
      frondMesh.castShadow = true;
      frondMesh.receiveShadow = true;
      frondMesh.position.set(0, 0, s === 0 ? (length / 3) / 2 : (length / 3));
      frondMesh.rotation.x = -0.15 - (s * 0.12);
      
      const segGroup = new THREE.Group();
      segGroup.add(frondMesh);
      if (s > 0) {
        segGroup.position.set(0, 0, (length / 3) / 2);
      }
      cumulativeParent.add(segGroup);
      cumulativeParent = segGroup;
    }
    frondPivot.rotation.x = 0.25;
    foliageGroup.add(frondPivot);
  }`;
  } else if (params.foliageType === "shroom-cap") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Mushroom Cap & Spots)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const capRadius = ${params.foliageSize};
  const capHeight = ${params.foliageHeight};
  const numSegments = ${params.trunkSegments} * 2;

  const capGeo = new THREE.CylinderGeometry(capRadius * 0.1, capRadius, capHeight, numSegments, 1, false);
  const capMesh = new THREE.Mesh(capGeo, foliageMaterial);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  capMesh.position.y = capHeight / 2;
  foliageGroup.add(capMesh);

  const gillGeo = new THREE.CylinderGeometry(capRadius * 1.01, capRadius * 0.6, 0.1, numSegments, 1);
  const gillMesh = new THREE.Mesh(gillGeo, alternateMaterial);
  gillMesh.position.y = 0.05;
  foliageGroup.add(gillMesh);

  const numSpots = Math.min(10, ${params.foliageDensity});
  for (let s = 0; s < numSpots; s++) {
    const spotGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
    const spotMesh = new THREE.Mesh(spotGeo, alternateMaterial);
    const theta = random() * Math.PI * 2;
    const phi = random() * Math.PI * 0.35;
    
    const spotRad = capRadius * 0.85;
    const sx = Math.sin(phi) * Math.cos(theta);
    const sz = Math.sin(phi) * Math.sin(theta);
    const sy = Math.cos(phi) * capHeight * 0.75 + 0.1;
    
    spotMesh.position.set(sx * spotRad, sy, sz * spotRad);
    spotMesh.rotation.set(phi * Math.sin(theta), theta, phi * Math.cos(theta));
    foliageGroup.add(spotMesh);
  }`;
  } else if (params.foliageType === "cactus-arms") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Cactus Arms & Blossom Flowers)
  const armCount = Math.min(4, ${params.foliageDensity});
  const armHeight = ${params.foliageHeight};
  const armRadius = ${params.trunkRadius} * 0.72;
  const elbowLen = ${params.foliageSize} * 0.38;

  for (let a = 0; a < armCount; a++) {
    const t = 0.3 + a * 0.18;
    const trunkPosAtT = getTrunkPointAt(t);
    const specificArmHeight = armHeight * (0.55 + random() * 0.3);
    const specificArmRadius = armRadius * (1 - t * ${params.trunkTaper});
    
    const angle = (a / armCount) * Math.PI * 1.8 + (random() - 0.5) * 0.25;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);

    const armPoints = [];
    armPoints.push(new THREE.Vector3(trunkPosAtT.x, trunkPosAtT.y, trunkPosAtT.z));
    armPoints.push(new THREE.Vector3(trunkPosAtT.x + dirX * specificArmRadius, trunkPosAtT.y, trunkPosAtT.z + dirZ * specificArmRadius));
    
    const shoulderX = trunkPosAtT.x + dirX * (specificArmRadius + elbowLen * 0.85);
    const shoulderZ = trunkPosAtT.z + dirZ * (specificArmRadius + elbowLen * 0.85);
    armPoints.push(new THREE.Vector3(shoulderX, trunkPosAtT.y, shoulderZ));

    const elbowX = trunkPosAtT.x + dirX * (specificArmRadius + elbowLen);
    const elbowZ = trunkPosAtT.z + dirZ * (specificArmRadius + elbowLen);
    const elbowY = trunkPosAtT.y + specificArmHeight * 0.15;
    armPoints.push(new THREE.Vector3(elbowX, elbowY, elbowZ));

    const tipY = trunkPosAtT.y + specificArmHeight;
    armPoints.push(new THREE.Vector3(elbowX, (elbowY + tipY) * 0.5, elbowZ));
    armPoints.push(new THREE.Vector3(elbowX, tipY, elbowZ));

    const armGeo = createSweepGeometry(armPoints, specificArmRadius, specificArmRadius * 0.82, ${params.trunkSegments});
    const armMesh = new THREE.Mesh(armGeo, foliageMaterial);
    armMesh.castShadow = true;
    armMesh.receiveShadow = true;
    treeGroup.add(armMesh);

    if (random() > 0.4) {
      const flowerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(specificArmRadius * 0.65, 0), alternateMaterial);
      flowerMesh.position.set(elbowX, tipY + 0.05, elbowZ);
      treeGroup.add(flowerMesh);
    }
  }

  // Top center flower
  const topFlower = new THREE.Mesh(new THREE.IcosahedronGeometry(${params.trunkRadius} * 0.75, 1), alternateMaterial);
  topFlower.position.copy(trunkTip);
  treeGroup.add(topFlower);`;
  } else if (params.foliageType === "bushy-tufts") {
    foliageCode = `  // 2. GENERATE MAIN FOLIAGE (Bushy Tufts)
  const foliageGroup = new THREE.Group();
  foliageGroup.position.copy(trunkTip);
  treeGroup.add(foliageGroup);

  const foliageSize = ${params.foliageSize};
  const foliageDensity = ${params.foliageDensity};
  const maxTufts = foliageDensity + 3;

  for (let t = 0; t < maxTufts; t++) {
    const radius = foliageSize * (0.5 + random() * 0.55);
    const bushyGeo = new THREE.DodecahedronGeometry(radius, 0);
    const isOdd = t % 2 === 0;
    const tuftMesh = new THREE.Mesh(bushyGeo, isOdd ? alternateMaterial : foliageMaterial);
    tuftMesh.castShadow = true;
    tuftMesh.receiveShadow = true;

    tuftMesh.position.set(
      (random() - 0.5) * foliageSize * 1.6,
      (random() - 0.5) * foliageSize * 0.6,
      (random() - 0.5) * foliageSize * 1.6
    );
    foliageGroup.add(tuftMesh);
  }`;
  }

  // Segment branches code
  let branchCode = "";
  if (hasBranches) {
    branchCode = `
  // Secondary dynamic branches (proportional to trunk height & thickness)
  const branchCount = "${params.species}" === "oak" ? 3 : "${params.species}" === "bonsai" ? 2 : "${params.species}" === "shrub" ? 3 : "${params.species}" === "pine" ? 4 : 0;
  for (let b = 0; b < branchCount; b++) {
    const t = 0.35 + (b / branchCount) * 0.45 + (random() * 0.08);
    const parentPos = getTrunkPointAt(t);
    const r_at_t = trunkRadius * (1 - t * trunkTaper);
    const bRad = r_at_t * 0.45;

    const angle = (b / branchCount) * Math.PI * 2 + (random() - 0.5) * 0.5;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);

    const maxBranchLen = trunkHeight * 0.35 * (1 - t * 0.4);
    const branchLen = maxBranchLen * (0.8 + random() * 0.5);

    const branchPoints = [];
    const steps = 5;
    for (let k = 0; k <= steps; k++) {
      const bp = k / steps;
      const hDist = bp * branchLen;
      const vDist = Math.sin(bp * Math.PI * 0.45) * branchLen * 0.45 + Math.pow(bp, 2) * branchLen * 0.15;
      branchPoints.push(new THREE.Vector3(
        parentPos.x + hDist * dirX,
        parentPos.y + vDist,
        parentPos.z + hDist * dirZ
      ));
    }

    const branchGeo = createSweepGeometry(branchPoints, bRad, bRad * 0.15, trunkSegments);
    const branchMesh = new THREE.Mesh(branchGeo, trunkMaterial);
    branchMesh.castShadow = true;
    branchMesh.receiveShadow = true;
    trunkGroup.add(branchMesh);

    // Branch tip foliage cluster
    const branchTip = branchPoints[branchPoints.length - 1];
    const bFoliageSize = ${params.foliageSize} * (0.4 + random() * 0.4);
    const bFoliageHeight = ${params.foliageHeight} * (0.4 + random() * 0.4);

    const branchFoliageGroup = new THREE.Group();
    branchFoliageGroup.position.copy(branchTip);
    treeGroup.add(branchFoliageGroup);

    if ("${params.foliageType}" === "spherical") {
      const mesh1 = new THREE.Mesh(new THREE.IcosahedronGeometry(bFoliageSize, 1), foliageMaterial);
      mesh1.castShadow = true;
      branchFoliageGroup.add(mesh1);

      const mesh2 = new THREE.Mesh(new THREE.IcosahedronGeometry(bFoliageSize * 0.8, 1), alternateMaterial);
      mesh2.castShadow = true;
      mesh2.position.set(
        (random() - 0.5) * bFoliageSize * 0.5,
        (random() - 0.2) * bFoliageSize * 0.3,
        (random() - 0.5) * bFoliageSize * 0.5
      );
      branchFoliageGroup.add(mesh2);
    } else if ("${params.foliageType}" === "conic" || "${params.foliageType}" === "tiered-cone") {
      const mesh = new THREE.Mesh(new THREE.ConeGeometry(bFoliageSize, bFoliageHeight, Math.max(4, trunkSegments)), foliageMaterial);
      mesh.castShadow = true;
      branchFoliageGroup.add(mesh);
    } else if ("${params.foliageType}" === "bushy-tufts") {
      const tuftsCount = 2;
      for (let j = 0; j < tuftsCount; j++) {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(bFoliageSize * (0.7 + j * 0.3), 0), j % 2 === 0 ? alternateMaterial : foliageMaterial);
        mesh.castShadow = true;
        mesh.position.set(
          (random() - 0.5) * bFoliageSize * 0.4,
          (random() - 0.5) * bFoliageSize * 0.2,
          (random() - 0.5) * bFoliageSize * 0.4
        );
        branchFoliageGroup.add(mesh);
      }
    }
  }`;
  }

  return `/**
 * Procedural Low-Poly Tree - Species SPECIFIC Template
 * Generated for: ${params.species.toUpperCase()}
 * Foliage geometry model: ${params.foliageType}
 */
import * as THREE from 'three';

// 3D Point Transport Sweeping Pipeline (Trunks and Arms)
export function createSweepGeometry(points, startRadius, endRadius, radialSegments) {
  const numPoints = points.length;
  if (numPoints < 2) return new THREE.BufferGeometry();

  const verticalSegments = numPoints - 1;
  const tangents = [];
  const normals = [];
  const binormals = [];

  for (let i = 0; i < numPoints; i++) {
    const T_i = new THREE.Vector3();
    if (i === 0) {
      T_i.subVectors(points[1], points[0]).normalize();
    } else if (i === numPoints - 1) {
      T_i.subVectors(points[numPoints - 1], points[numPoints - 2]).normalize();
    } else {
      T_i.subVectors(points[i + 1], points[i - 1]).normalize();
    }
    tangents.push(T_i);
  }

  for (let i = 0; i < numPoints; i++) {
    const T_i = tangents[i];
    if (i === 0) {
      const temp = Math.abs(T_i.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const N_0 = new THREE.Vector3().crossVectors(temp, T_i).normalize();
      const B_0 = new THREE.Vector3().crossVectors(T_i, N_0).normalize();
      normals.push(N_0);
      binormals.push(B_0);
    } else {
      const T_prev = tangents[i - 1];
      const N_prev = normals[i - 1];
      const N_i = N_prev.clone();
      const axis = new THREE.Vector3().crossVectors(T_prev, T_i);
      if (axis.lengthSq() > 1e-8) {
        axis.normalize();
        const dot = T_prev.dot(T_i);
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        N_i.applyAxisAngle(axis, theta);
      }
      N_i.normalize();
      const B_i = new THREE.Vector3().crossVectors(T_i, N_i).normalize();
      normals.push(N_i);
      binormals.push(B_i);
    }
  }

  const vertices = [];
  const indices = [];
  const uvs = [];
  const ringSize = radialSegments + 1;

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const r_i = startRadius + progress * (endRadius - startRadius);
    const N_i = normals[i];
    const B_i = binormals[i];
    const center = points[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const vx = center.x + r_i * (N_i.x * cosTheta + B_i.x * sinTheta);
      const vy = center.y + r_i * (N_i.y * cosTheta + B_i.y * sinTheta);
      const vz = center.z + r_i * (N_i.z * cosTheta + B_i.z * sinTheta);

      vertices.push(vx, vy, vz);
      uvs.push(j / radialSegments, progress);
    }
  }

  for (let i = 0; i < verticalSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const v1 = i * ringSize + j;
      const v2 = i * ringSize + (j + 1);
      const v3 = (i + 1) * ringSize + j;
      const v4 = (i + 1) * ringSize + (j + 1);

      indices.push(v1, v2, v3);
      indices.push(v2, v4, v3);
    }
  }

  // Bottom Cap
  const bottomCenterIndex = vertices.length / 3;
  vertices.push(points[0].x, points[0].y, points[0].z);
  uvs.push(0.5, 0);
  for (let j = 0; j < radialSegments; j++) {
    const v1 = j;
    const v2 = j + 1;
    indices.push(v2, v1, bottomCenterIndex);
  }

  // Top Cap
  const topCenterIndex = vertices.length / 3;
  vertices.push(points[numPoints - 1].x, points[numPoints - 1].y, points[numPoints - 1].z);
  uvs.push(0.5, 1);
  const topRingOffset = (numPoints - 1) * ringSize;
  for (let j = 0; j < radialSegments; j++) {
    const v1 = topRingOffset + j;
    const v2 = topRingOffset + j + 1;
    indices.push(v1, v2, topCenterIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function createLowPolyTree() {
  const treeGroup = new THREE.Group();
  treeGroup.name = "low_poly_tree";

  // Flat shaded materials optimized for species colors
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: "${params.trunkColor}",
    flatShading: true,
    roughness: 0.9,
    metalness: 0.1
  });

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: "${params.foliageColor}",
    flatShading: true,
    roughness: 0.85,
    metalness: 0.1
  });

  const alternateMaterial = new THREE.MeshStandardMaterial({
    color: "${params.foliageColorAlternate}",
    flatShading: true,
    roughness: 0.85,
    metalness: 0.1
  });

  // 1. GENERATE MAIN TRUNK
  const trunkGroup = new THREE.Group();
  treeGroup.add(trunkGroup);

  const trunkHeight = ${params.trunkHeight};
  const trunkRadius = ${params.trunkRadius};
  const trunkSegments = ${params.trunkSegments};
  const trunkTaper = ${params.trunkTaper};
  const trunkCurvature = ${params.trunkCurvature};
  const verticalSegmentsCount = 8;

  const curvePoints = [];
  for (let i = 0; i <= verticalSegmentsCount; i++) {
    const progress = i / verticalSegmentsCount;
    const angle = progress * Math.PI;
    const dx = Math.sin(angle) * trunkCurvature * 0.4;
    const dz = (1 - Math.cos(angle)) * trunkCurvature * 0.2;
    curvePoints.push(new THREE.Vector3(dx, progress * trunkHeight, dz));
  }

  const trunkGeo = createSweepGeometry(curvePoints, trunkRadius, trunkRadius * (1 - trunkTaper), trunkSegments);
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  trunkGroup.add(trunkMesh);

  const trunkTip = curvePoints[curvePoints.length - 1];

  const getTrunkPointAt = (t) => {
    const seg = t * verticalSegmentsCount;
    const index = Math.min(verticalSegmentsCount - 1, Math.floor(seg));
    const rem = seg - index;
    return new THREE.Vector3().lerpVectors(curvePoints[index], curvePoints[index + 1], rem);
  };

  // Deterministic seed helper
  let seed = 1001;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

${branchCode}

${foliageCode}

  return treeGroup;
}
`;
}

/**
 * Returns raw copy-pasteable React Three Fiber code for standard react-three-fiber projects
 * Cleaned up to ONLY output the selected specimen components and hooks
 */
export function getReactThreeFiberCode(params: TreeParams): string {
  const radSegs = params.trunkSegments;
  const hasBranches = ["oak", "pine", "bonsai", "shrub"].includes(params.species);
  const isCactus = params.foliageType === "cactus-arms";

  const verticalSegmentsCount = 8;
  const curvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= verticalSegmentsCount; i++) {
    const progress = i / verticalSegmentsCount;
    const angle = progress * Math.PI;
    const dx = Math.sin(angle) * params.trunkCurvature * 0.4;
    const dz = (1 - Math.cos(angle)) * params.trunkCurvature * 0.2;
    curvePoints.push(new THREE.Vector3(dx, progress * params.trunkHeight, dz));
  }
  const trunkTip = curvePoints[curvePoints.length - 1];

  // Specific lists of code parts
  let subMeshMemoCalc = "";
  let jsxMeshRender = "";

  if (params.foliageType === "spherical") {
    subMeshMemoCalc = `    // Core spherical foliage clusters
    const foliageClusterList = [];
    for (let j = 0; j < ${params.foliageDensity}; j++) {
      const rad = ${params.foliageSize} * (0.6 + random() * 0.4);
      const off = j === 0 ? [0,0,0] : [
        (random() - 0.5) * ${params.foliageSize} * 1.1,
        (random() - 0.2) * ${params.foliageSize} * 0.8,
        (random() - 0.5) * ${params.foliageSize} * 1.1
      ];
      foliageClusterList.push({ radius: rad, position: off, alt: random() > 0.55 });
    }`;

    jsxMeshRender = `        {data.foliage.map((f, idx) => (
          <mesh key={idx} position={f.position} castShadow receiveShadow>
            <icosahedronGeometry args={[f.radius, 1]} />
            <meshStandardMaterial color={f.alt ? "${params.foliageColorAlternate}" : "${params.foliageColor}"} flatShading roughness={0.85} />
          </mesh>
        ))}`;
  } else if (params.foliageType === "conic") {
    jsxMeshRender = `        <mesh position={[0, ${params.foliageHeight / 2 - 0.2}, 0]} castShadow receiveShadow>
          <coneGeometry args={[${params.foliageSize}, ${params.foliageHeight}, ${Math.max(4, radSegs)}]} />
          <meshStandardMaterial color="${params.foliageColor}" flatShading roughness={0.85} />
        </mesh>`;
  } else if (params.foliageType === "tiered-cone") {
    subMeshMemoCalc = `    // stacked pine cone tiers calculation
    const foliageClusterList = [];
    const tierHeight = ${params.foliageHeight / params.foliageTiers};
    for (let t = 0; t < ${params.foliageTiers}; t++) {
      const factor = (${params.foliageTiers} - t) / ${params.foliageTiers};
      const tierRadius = ${params.foliageSize} * (0.35 + factor * 0.65);
      const cHeight = tierHeight * 1.4;
      foliageClusterList.push({
        radius: tierRadius,
        height: cHeight,
        y: (t * (tierHeight * 0.85)) + (cHeight / 2) - 0.3,
        rotY: t * 0.45,
        alt: t % 2 !== 0
      });
    }`;

    jsxMeshRender = `        {data.foliage.map((f, idx) => (
          <mesh key={idx} position={[0, f.y, 0]} rotation={[0, f.rotY, 0]} castShadow receiveShadow>
            <coneGeometry args={[f.radius, f.height, ${Math.max(4, radSegs)}]} />
            <meshStandardMaterial color={f.alt ? "${params.foliageColorAlternate}" : "${params.foliageColor}"} flatShading roughness={0.85} />
          </mesh>
        ))}`;
  } else if (params.foliageType === "palm-fronds") {
    subMeshMemoCalc = `    // palm fronds length calculation
    const foliageClusterList = [];
    const count = ${params.foliageDensity} + 4;
    for (let f = 0; f < count; f++) {
      const length = ${params.foliageSize} * (0.8 + random() * 0.3);
      foliageClusterList.push({
        rotY: (f / count) * Math.PI * 2,
        length,
        alt: f % 2 !== 0
      });
    }`;

    jsxMeshRender = `        {data.foliage.map((f, idx) => (
          <group key={idx} rotation={[0.25, f.rotY, 0]}>
            <mesh position={[0, 0.1, f.length * 0.5]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.03, f.length]} />
              <meshStandardMaterial color={f.alt ? "${params.foliageColorAlternate}" : "${params.foliageColor}"} flatShading roughness={0.85} />
            </mesh>
          </group>
        ))}`;
  } else if (params.foliageType === "shroom-cap") {
    subMeshMemoCalc = `    // Mushroom cap spot offsets
    const spots = [];
    for (let s = 0; s < ${params.foliageDensity}; s++) {
      const theta = random() * Math.PI * 2;
      const phi = random() * Math.PI * 0.35;
      const rad = ${params.foliageSize} * 0.85;
      const sx = Math.sin(phi) * Math.cos(theta) * rad;
      const sz = Math.sin(phi) * Math.sin(theta) * rad;
      const sy = Math.cos(phi) * ${params.foliageHeight} * 0.75 + 0.1;
      spots.push({
        pos: [sx, sy, sz],
        rot: [phi * Math.sin(theta), theta, phi * Math.cos(theta)]
      });
    }
    const foliageClusterList = [{ spots }];`;

    jsxMeshRender = `        <>
          <mesh position={[0, ${params.foliageHeight / 2}, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[${params.foliageSize * 0.1}, ${params.foliageSize}, ${params.foliageHeight}, ${radSegs * 2}]} />
            <meshStandardMaterial color="${params.foliageColor}" flatShading roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[${params.foliageSize * 1.01}, ${params.foliageSize * 0.6}, 0.1, ${radSegs * 2}]} />
            <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
          </mesh>
          {data.foliage[0]?.spots?.map((s, idx) => (
            <mesh key={idx} position={s.pos} rotation={s.rot}>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
            </mesh>
          ))}
        </>`;
  } else if (params.foliageType === "bushy-tufts") {
    subMeshMemoCalc = `    // dynamic bushy tufts calculation
    const foliageClusterList = [];
    for (let t = 0; t < ${params.foliageDensity} + 3; t++) {
      const rad = ${params.foliageSize} * (0.5 + random() * 0.55);
      const off = [
        (random() - 0.5) * ${params.foliageSize} * 1.6,
        (random() - 0.5) * ${params.foliageSize} * 0.6,
        (random() - 0.5) * ${params.foliageSize} * 1.6
      ];
      foliageClusterList.push({ radius: rad, position: off });
    }`;

    jsxMeshRender = `        {data.foliage.map((f, idx) => (
          <mesh key={idx} position={f.position} castShadow receiveShadow>
            <dodecahedronGeometry args={[f.radius, 0]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "${params.foliageColor}" : "${params.foliageColorAlternate}"} flatShading roughness={0.85} />
          </mesh>
        ))}`;
  }

  // Branches memo builder
  let memoBranchBuilders = "";
  if (hasBranches) {
    memoBranchBuilders = `
    const branchesList = [];
    const branchCount = "${params.species}" === "oak" ? 3 : "${params.species}" === "bonsai" ? 2 : "${params.species}" === "shrub" ? 3 : "${params.species}" === "pine" ? 4 : 0;
    for (let b = 0; b < branchCount; b++) {
      const t = 0.35 + (b / branchCount) * 0.45 + (random() * 0.08);
      const parentPos = getTrunkPointAt(t);
      const r_at_t = trunkRadius * (1 - t * trunkTaper);
      const bRad = r_at_t * 0.45;

      const angle = (b / branchCount) * Math.PI * 2 + (random() - 0.5) * 0.5;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);

      const maxBranchLen = trunkHeight * 0.35 * (1 - t * 0.4);
      const branchLen = maxBranchLen * (0.8 + random() * 0.5);

      const branchPoints = [];
      const steps = 5;
      for (let k = 0; k <= steps; k++) {
        const bp = k / steps;
        const hDist = bp * branchLen;
        const vDist = Math.sin(bp * Math.PI * 0.45) * branchLen * 0.45 + Math.pow(bp, 2) * branchLen * 0.15;
        branchPoints.push(new THREE.Vector3(
          parentPos.x + hDist * dirX,
          parentPos.y + vDist,
          parentPos.z + hDist * dirZ
        ));
      }

      const bGeo = createSweepGeometry(branchPoints, bRad, bRad * 0.15, trunkSegments);
      const branchTip = branchPoints[branchPoints.length - 1];
      const bFoliageSize = ${params.foliageSize} * (0.4 + random() * 0.4);
      const bFoliageHeight = ${params.foliageHeight} * (0.4 + random() * 0.4);

      branchesList.push({
        geometry: bGeo,
        tip: [branchTip.x, branchTip.y, branchTip.z],
        foliageSize: bFoliageSize,
        foliageHeight: bFoliageHeight,
        seed: random()
      });
    }`;
  } else {
    memoBranchBuilders = `    const branchesList = [];`;
  }

  // Cactus arms memo builder
  let memoCactusBuilders = "";
  if (isCactus) {
    memoCactusBuilders = `
    const armsList = [];
    const armCount = Math.min(4, ${params.foliageDensity});
    for (let a = 0; a < armCount; a++) {
      const t = 0.3 + a * 0.18;
      const trunkPosAtT = getTrunkPointAt(t);
      const subArmHeight = ${params.foliageHeight} * (0.55 + random() * 0.3);
      const subArmRadius = trunkRadius * 0.72 * (1 - t * trunkTaper);

      const angle = (a / armCount) * Math.PI * 1.8 + (random() - 0.5) * 0.25;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);
      const elbowLen = ${params.foliageSize} * 0.38;

      const armPoints = [];
      armPoints.push(new THREE.Vector3(trunkPosAtT.x, trunkPosAtT.y, trunkPosAtT.z));
      armPoints.push(new THREE.Vector3(trunkPosAtT.x + dirX * subArmRadius, trunkPosAtT.y, trunkPosAtT.z + dirZ * subArmRadius));
      
      const shoulderX = trunkPosAtT.x + dirX * (subArmRadius + elbowLen * 0.85);
      const shoulderZ = trunkPosAtT.z + dirZ * (subArmRadius + elbowLen * 0.85);
      armPoints.push(new THREE.Vector3(shoulderX, trunkPosAtT.y, shoulderZ));

      const elbowX = trunkPosAtT.x + dirX * (subArmRadius + elbowLen);
      const elbowZ = trunkPosAtT.z + dirZ * (subArmRadius + elbowLen);
      const elbowY = trunkPosAtT.y + subArmHeight * 0.15;
      armPoints.push(new THREE.Vector3(elbowX, elbowY, elbowZ));

      const tipY = trunkPosAtT.y + subArmHeight;
      armPoints.push(new THREE.Vector3(elbowX, (elbowY + tipY) * 0.5, elbowZ));
      armPoints.push(new THREE.Vector3(elbowX, tipY, elbowZ));

      const aGeo = createSweepGeometry(armPoints, subArmRadius, subArmRadius * 0.82, trunkSegments);
      armsList.push({
        geometry: aGeo,
        tip: [elbowX, tipY + 0.05, elbowZ],
        radius: subArmRadius,
        hasFlower: random() > 0.4
      });
    }`;
  } else {
    memoCactusBuilders = `    const armsList = [];`;
  }

  // Branch mapping JSX segment
  let branchesJsx = "";
  if (hasBranches) {
    branchesJsx = `      {/* Procedurally generated branches */}
      {data.branches.map((b, idx) => (
        <group key={idx}>
          <mesh geometry={b.geometry} castShadow receiveShadow>
            <meshStandardMaterial color="${params.trunkColor}" flatShading roughness={0.9} />
          </mesh>
          <group position={b.tip}>
            {"${params.foliageType}" === "spherical" && (
              <>
                <mesh castShadow receiveShadow>
                  <icosahedronGeometry args={[b.foliageSize, 1]} />
                  <meshStandardMaterial color="${params.foliageColor}" flatShading roughness={0.85} />
                </mesh>
                <mesh position={[b.foliageSize * 0.15, b.foliageSize * 0.12, -b.foliageSize * 0.1]} castShadow receiveShadow>
                  <icosahedronGeometry args={[b.foliageSize * 0.8, 1]} />
                  <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
                </mesh>
              </>
            )}
            {"${params.foliageType}" === "conic" && (
              <mesh castShadow>
                <coneGeometry args={[b.foliageSize, b.foliageHeight, ${Math.max(4, radSegs)}]} />
                <meshStandardMaterial color="${params.foliageColor}" flatShading roughness={0.85} />
              </mesh>
            )}
            {"${params.foliageType}" === "bushy-tufts" && (
              <mesh castShadow>
                <dodecahedronGeometry args={[b.foliageSize, 0]} />
                <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
              </mesh>
            )}
          </group>
        </group>
      ))}`;
  }

  // Cactus mapping JSX segment
  let cactusJsx = "";
  if (isCactus) {
    cactusJsx = `      {/* Procedurally generated cactus arms */}
      {data.cactusArms.map((arm, idx) => (
        <group key={idx}>
          <mesh geometry={arm.geometry} castShadow receiveShadow>
            <meshStandardMaterial color="${params.foliageColor}" flatShading roughness={0.85} />
          </mesh>
          {arm.hasFlower && (
            <mesh position={arm.tip} castShadow>
              <icosahedronGeometry args={[arm.radius * 0.65, 0]} />
              <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={data.trunkTip} castShadow>
        <icosahedronGeometry args={[${params.trunkRadius * 0.75}, 1]} />
        <meshStandardMaterial color="${params.foliageColorAlternate}" flatShading roughness={0.85} />
      </mesh>`;
  }

  return `/**
 * Procedural Low-Poly Tree (React Three Fiber) - Species SPECIFIC Template
 * Generated for: ${params.species.toUpperCase()}
 * Foliage geometry model: ${params.foliageType}
 */
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 3D Point Transport Sweeping Pipeline (Trunks and Arms)
export function createSweepGeometry(points, startRadius, endRadius, radialSegments) {
  const numPoints = points.length;
  if (numPoints < 2) return new THREE.BufferGeometry();

  const verticalSegments = numPoints - 1;
  const tangents = [];
  const normals = [];
  const binormals = [];

  for (let i = 0; i < numPoints; i++) {
    const T_i = new THREE.Vector3();
    if (i === 0) {
      T_i.subVectors(points[1], points[0]).normalize();
    } else if (i === numPoints - 1) {
      T_i.subVectors(points[numPoints - 1], points[numPoints - 2]).normalize();
    } else {
      T_i.subVectors(points[i + 1], points[i - 1]).normalize();
    }
    tangents.push(T_i);
  }

  for (let i = 0; i < numPoints; i++) {
    const T_i = tangents[i];
    if (i === 0) {
      const temp = Math.abs(T_i.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const N_0 = new THREE.Vector3().crossVectors(temp, T_i).normalize();
      const B_0 = new THREE.Vector3().crossVectors(T_i, N_0).normalize();
      normals.push(N_0);
      binormals.push(B_0);
    } else {
      const T_prev = tangents[i - 1];
      const N_prev = normals[i - 1];
      const N_i = N_prev.clone();
      const axis = new THREE.Vector3().crossVectors(T_prev, T_i);
      if (axis.lengthSq() > 1e-8) {
        axis.normalize();
        const dot = T_prev.dot(T_i);
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        N_i.applyAxisAngle(axis, theta);
      }
      N_i.normalize();
      const B_i = new THREE.Vector3().crossVectors(T_i, N_i).normalize();
      normals.push(N_i);
      binormals.push(B_i);
    }
  }

  const vertices = [];
  const indices = [];
  const uvs = [];
  const ringSize = radialSegments + 1;

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const r_i = startRadius + progress * (endRadius - startRadius);
    const N_i = normals[i];
    const B_i = binormals[i];
    const center = points[i];

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const vx = center.x + r_i * (N_i.x * cosTheta + B_i.x * sinTheta);
      const vy = center.y + r_i * (N_i.y * cosTheta + B_i.y * sinTheta);
      const vz = center.z + r_i * (N_i.z * cosTheta + B_i.z * sinTheta);

      vertices.push(vx, vy, vz);
      uvs.push(j / radialSegments, progress);
    }
  }

  for (let i = 0; i < verticalSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const v1 = i * ringSize + j;
      const v2 = i * ringSize + (j + 1);
      const v3 = (i + 1) * ringSize + j;
      const v4 = (i + 1) * ringSize + (j + 1);

      indices.push(v1, v2, v3);
      indices.push(v2, v4, v3);
    }
  }

  // Bottom Cap
  const bottomCenterIndex = vertices.length / 3;
  vertices.push(points[0].x, points[0].y, points[0].z);
  uvs.push(0.5, 0);
  for (let j = 0; j < radialSegments; j++) {
    const v1 = j;
    const v2 = j + 1;
    indices.push(v2, v1, bottomCenterIndex);
  }

  // Top Cap
  const topCenterIndex = vertices.length / 3;
  vertices.push(points[numPoints - 1].x, points[numPoints - 1].y, points[numPoints - 1].z);
  uvs.push(0.5, 1);
  const topRingOffset = (numPoints - 1) * ringSize;
  for (let j = 0; j < radialSegments; j++) {
    const v1 = topRingOffset + j;
    const v2 = topRingOffset + j + 1;
    indices.push(v1, v2, topCenterIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export function ProceduralTree() {
  const treeRef = useRef(null);
  const foliageRef = useRef(null);

  // Dynamic wind sway logic
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const windStrength = ${params.windStrength};
    if (treeRef.current && windStrength > 0) {
      treeRef.current.rotation.z = Math.sin(t * 1.2) * windStrength * 0.025;
      treeRef.current.rotation.x = Math.cos(t * 1.0) * windStrength * 0.012;
    }
    if (foliageRef.current && windStrength > 0) {
      foliageRef.current.rotation.y = Math.sin(t * 2.0) * windStrength * 0.015;
      foliageRef.current.position.x = Math.sin(t * 1.5) * windStrength * 0.03;
    }
  });

  const data = useMemo(() => {
    const trunkHeight = ${params.trunkHeight};
    const trunkRadius = ${params.trunkRadius};
    const trunkSegments = ${params.trunkSegments};
    const trunkTaper = ${params.trunkTaper};
    const trunkCurvature = ${params.trunkCurvature};
    const verticalSegmentsCount = 8;

    const curvePoints = [];
    for (let i = 0; i <= verticalSegmentsCount; i++) {
      const progress = i / verticalSegmentsCount;
      const angle = progress * Math.PI;
      const dx = Math.sin(angle) * trunkCurvature * 0.4;
      const dz = (1 - Math.cos(angle)) * trunkCurvature * 0.2;
      curvePoints.push(new THREE.Vector3(dx, progress * trunkHeight, dz));
    }

    const trunkGeo = createSweepGeometry(curvePoints, trunkRadius, trunkRadius * (1 - trunkTaper), trunkSegments);
    const trunkTip = curvePoints[curvePoints.length - 1];

    const getTrunkPointAt = (t) => {
      const seg = t * verticalSegmentsCount;
      const index = Math.min(verticalSegmentsCount - 1, Math.floor(seg));
      const rem = seg - index;
      return new THREE.Vector3().lerpVectors(curvePoints[index], curvePoints[index + 1], rem);
    };

    let seed = 1001;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

${memoBranchBuilders}

${memoCactusBuilders}

${subMeshMemoCalc}

    return {
      trunkGeo,
      trunkTip: [trunkTip.x, trunkTip.y, trunkTip.z],
      branches: branchesList,
      cactusArms: armsList,
      foliage: foliageClusterList
    };
  }, []);

  return (
    <group ref={treeRef}>
      {/* Curved low-poly trunk */}
      <mesh geometry={data.trunkGeo} castShadow receiveShadow>
        <meshStandardMaterial color="${params.trunkColor}" flatShading roughness={0.9} metalness={0.1} />
      </mesh>

${branchesJsx}

${cactusJsx}

      {/* Main leaf crown */}
      <group ref={foliageRef} position={data.trunkTip}>
${jsxMeshRender}
      </group>
    </group>
  );
}
`;
}
