import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini with server-side API Key and telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Describe a 3D low-poly tree or plant matching this creative description: "${prompt}".
Generate appropriate numeric and color parameters for rendering this model parametrically in Three.js. Natures can include trees, flowers, cacti, mushrooms, palms, or mythical botanical objects.`,
      config: {
        systemInstruction: `You are a professional 3D artist and procedural designer specializing in Three.js and low-poly game assets.
Translate the user's artistic request into a cohesive set of parametric rules for generating a gorgeous, visually striking low-poly 3D plant or tree.
Match colors elegantly (e.g. complementary palettes, neon highlights, or earth tones). Keep numeric values within reasonable ranges:
- trunkHeight: [0.5 to 8.0]
- trunkRadius: [0.05 to 1.5]
- trunkColor: A hex string like "#5c4033"
- trunkSegments: [3 to 8] (low-poly feel!)
- trunkTaper: [0.0 to 0.95] (0 is straight cylinder, 0.9 is highly tapered top)
- trunkCurvature: [0.0 to 1.5] (level of bends)
- foliageType: Choose one of: "spherical", "conic", "tiered-cone", "palm-fronds", "shroom-cap", "cactus-arms", "bushy-tufts"
- foliageSize: [0.3 to 4.0] (radius/size of the crown)
- foliageHeight: [0.4 to 5.0] (important for conic or tall structures)
- foliageColor: A hex string matching the foliage color
- foliageColorAlternate: A hex string of a complementary shade or highlight color
- foliageDensity: [1 to 10] (number of foliage elements or detailing sub-nodes)
- foliageTiers: [1 to 6] (tier count for conical / tiered trees)
- windStrength: [0.0 to 1.5] (how strongly it interacts with wind)
- species: Pick closest category from: "oak", "pine", "palm", "cactus", "shrub", "fern", "bonsai", "shroom"

Provide a short creative species description or scientific classification name for the generated object in 'specimenDescription'.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: {
              type: Type.STRING,
              description: "The base plant category archetype",
              enum: ["oak", "pine", "palm", "cactus", "shrub", "fern", "bonsai", "shroom"]
            },
            trunkHeight: {
              type: Type.NUMBER,
              description: "Height of the trunk or stalk"
            },
            trunkRadius: {
              type: Type.NUMBER,
              description: "Base thickness of the trunk"
            },
            trunkColor: {
              type: Type.STRING,
              description: "Hex color for the trunk"
            },
            trunkSegments: {
              type: Type.INTEGER,
              description: "Radial segment count for low-poly geometry (4-8)"
            },
            trunkTaper: {
              type: Type.NUMBER,
              description: "Taper factor indicating trunk scaling from solid base to narrow crown"
            },
            trunkCurvature: {
              type: Type.NUMBER,
              description: "Curvature or bend amplitude of the trunk path"
            },
            foliageType: {
              type: Type.STRING,
              description: "Shape type of the foliage/cap elements",
              enum: ["spherical", "conic", "tiered-cone", "palm-fronds", "shroom-cap", "cactus-arms", "bushy-tufts"]
            },
            foliageSize: {
              type: Type.NUMBER,
              description: "Overall radius or spread of foliage group"
            },
            foliageHeight: {
              type: Type.NUMBER,
              description: "Vertical size/length of foliage shape"
            },
            foliageColor: {
              type: Type.STRING,
              description: "Primary foliage hex color"
            },
            foliageColorAlternate: {
              type: Type.STRING,
              description: "Secondary highlighting or shadow-complementary foliage hex color"
            },
            foliageDensity: {
              type: Type.INTEGER,
              description: "Density or count of sub-mesh nodes creating the low-poly cluster"
            },
            foliageTiers: {
              type: Type.INTEGER,
              description: "Number of layered foliage tiers or segment rows"
            },
            windStrength: {
              type: Type.NUMBER,
              description: "Sensory ambient sway strength in wind"
            },
            specimenDescription: {
              type: Type.STRING,
              description: "A gorgeous, immersive poetic/scientific bio of the generated plant model."
            }
          },
          required: [
            "species",
            "trunkHeight",
            "trunkRadius",
            "trunkColor",
            "trunkSegments",
            "trunkTaper",
            "trunkCurvature",
            "foliageType",
            "foliageSize",
            "foliageHeight",
            "foliageColor",
            "foliageColorAlternate",
            "foliageDensity",
            "foliageTiers",
            "windStrength",
            "specimenDescription"
          ]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Suggestion Router Error:", error);
    return NextResponse.json(
      { error: "Could not generate parameters. Details: " + error?.message },
      { status: 500 }
    );
  }
}
