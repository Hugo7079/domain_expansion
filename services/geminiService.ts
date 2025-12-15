import { GoogleGenAI, Type } from "@google/genai";
import { Character, AnalysisResult } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeGenAI = (apiKey?: string) => {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } else {
    console.warn("API Key not found, waiting for user input.");
  }
};

export const analyzeGesture = async (base64Image: string): Promise<AnalysisResult> => {
  if (!ai) initializeGenAI();
  if (!ai) throw new Error("AI not initialized");

  const prompt = `
    ACT AS A JUJUTSU KAISEN HAND SIGN EXPERT.
    
    **TASK**: Classify the user's hand gesture (or face) into the "Closest Match" from the list below.
    
    **CLASS DEFINITIONS**:
    
    1. [gojo]: **SINGLE HAND**. Index finger crosses over middle finger (R-shape). *Exclusive feature: Only one hand visible.*

    2. [sukuna]: **TWO HANDS, INTERLACED**. Fingers interlaced/clasping. **CRITICAL: MUST HAVE A CENTRAL GAP/HOLE** (Diamond shape) between palms. If no hole, it's NOT Sukuna.

    3. [megumi]: **TWO HANDS, INTERLACED**. 
       - **POSITION**: CORRECTLY HELD LOW (STOMACH/ABDOMEN LEVEL). 
       - **THUMB DIRECTION**: Thumbs point **FORWARD** (towards the camera) or **OUTWARD**.
       - **TEXTURE**: The fingers are **INTERWOVEN** (alternating/crossing like a basket weave). It looks COMPLEX.
       - **VS JOGO**: If it is at the abdomen and looks like a "knot" with thumbs pointing at you, it is MEGUMI.

    4. [jogo]: **TWO HANDS, COMPRESSED**.
       - **SHAPE**: A **SMOOTH, ROUND ROCK**.
       - **THUMB DIRECTION**: Thumbs are HIDDEN, TUCKED IN, or pointing UP. They do NOT point at the camera.
       - **VISUAL**: It looks like a single heavy object. No complex weaving texture visible from the front.
       - **VS MEGUMI**: If it looks like a simple fist bump or a rock, it is Jogo.

    5. [mahito]: **FACE GESTURE / OPEN MOUTH**.
       - **PRIMARY TRIGGER**: The user's **MOUTH IS WIDE OPEN** (Screaming/Laughing/Mimicking hands coming out of mouth).
       - Hands might be near the face, but the **OPEN MOUTH** is the deciding factor.
       - If the mouth is closed, it is NOT Mahito.

    6. [hakari]: **TWO HANDS, SEPARATED**. Thumb and Index finger form a **CIRCLE (OK Sign)** on both hands. Hands are held apart.

    7. [yuta]: **TWO HANDS, SEPARATED**. 
       - **CRITICAL**: Hands do NOT touch skin-to-skin.
       - **DEPTH**: One hand is clearly closer to the camera (Foreground) and the other is further back (Background). They overlap visually but are separate.
       - Palms face the chest.
       - If hands are touching/clasping, it is IMPOSSIBLE to be Yuta.

    8. [mahoraga]: **TWO HANDS, FISTS COLLIDING**.
       - **SECRET TECHNIQUE**: Two fists pressed against each other, Knuckle-to-Knuckle (or top of fist to bottom of fist).
       - Simulates turning a wheel or handle.
       - Distinct from Jogo because hands are not interlaced, they are fists bumping.

    **EVALUATION LOGIC**:
    1. Compare the image against ALL 8 definitions.
    2. Pick the **Single Best Match**.
    3. Assign a **Similarity Score (0-100)**.
       - 90-100: Perfect or near-perfect match.
       - 75-89: Good match, minor flaws (angle/lighting).
       - 0-74: Poor match.

    **OUTPUT RULES**:
    - If the Highest Score is **< 75**: Set 'detectedCharacterId' to **null** (Failure).
    - If the Highest Score is **>= 75**: Set 'detectedCharacterId' to the matched ID.

    **OUTPUT JSON FORMAT**:
    {
      "detectedCharacterId": "gojo" | "sukuna" | "megumi" | "jogo" | "mahito" | "hakari" | "yuta" | "mahoraga" | null,
      "score": number,
      "isCorrect": boolean (True if score >= 75),
      "feedback": "Traditional Chinese comment. E.g., '檢測到手勢位於腹部且拇指朝前，判定為伏黑惠' or '手勢模糊，無法識別'."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedCharacterId: { type: Type.STRING, nullable: true },
            score: { type: Type.NUMBER },
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
          },
          required: ['score', 'isCorrect', 'feedback']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    const parsed = JSON.parse(resultText);
    
    // Safety check for ID normalization
    if (parsed.detectedCharacterId) {
        parsed.detectedCharacterId = parsed.detectedCharacterId.toLowerCase();
    }

    return parsed as AnalysisResult;

  } catch (error) {
    console.error("Gesture analysis failed:", error);
    return {
      detectedCharacterId: null,
      score: 0,
      isCorrect: false,
      feedback: "咒力流動混亂，無法解析。"
    };
  }
};