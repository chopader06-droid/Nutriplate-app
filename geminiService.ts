import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, FamilyComposition } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    foodItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantityEstimate: { type: Type.STRING, description: "e.g., 250g or 1 cup" },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "quantityEstimate"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalProtein: { type: Type.NUMBER },
    consumptionUnits: { type: Type.NUMBER, description: "Calculated total CU based on family members" },
    intakePerCU: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER }
      },
      required: ["calories", "protein"]
    },
    standardPerCU: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER, description: "Standard requirement per CU" },
        protein: { type: Type.NUMBER, description: "Standard requirement per CU" },
        source: { type: Type.STRING, description: "Source of standard, e.g., ICMR 2020" }
      },
      required: ["calories", "protein", "source"]
    },
    gap: {
      type: Type.OBJECT,
      properties: {
        caloriesPercent: { type: Type.NUMBER, description: "Positive for surplus, negative for deficit" },
        proteinPercent: { type: Type.NUMBER },
        status: { type: Type.STRING, enum: ["Surplus", "Deficit", "Adequate"] }
      },
      required: ["caloriesPercent", "proteinPercent", "status"]
    },
    summary: { type: Type.STRING, description: "A friendly, concise summary of the analysis for the user." }
  },
  required: ["foodItems", "totalCalories", "totalProtein", "consumptionUnits", "intakePerCU", "standardPerCU", "gap", "summary"]
};

export const analyzeMeal = async (
  family: FamilyComposition,
  textDescription: string,
  imageBase64: string | null
): Promise<AnalysisResult> => {
  
  const cuLogic = `
  Calculate Consumption Units (CU) using these approximate coefficients based on Indian ICMR standards:
  - Adult Male (Moderate Work): 1.0 CU
  - Adult Female (Moderate Work): 0.8 CU
  - Child (Average): 0.6 CU
  
  Family Composition provided:
  - Adult Males: ${family.adultMales}
  - Adult Females: ${family.adultFemales}
  - Children: ${family.children}
  `;

  const systemInstruction = `
  You are an expert nutritionist specializing in Indian diets, familiar with Gopalan's "Nutritive Value of Indian Foods" and ICMR (Indian Council of Medical Research) standards.
  
  Your task:
  1. Identify the food items from the image or text description.
  2. Estimate the cooked quantities. If text provides raw quantities (e.g., "250g raw rice"), convert them to cooked values or calculate nutrition directly from raw values if more accurate.
  3. Calculate Total Calories (Kcal) and Protein (g) for the entire meal described/shown.
  4. ${cuLogic}
  5. Calculate the Intake per CU (Total / Total CU).
  6. Compare Intake per CU against the ICMR Reference Man (Moderate Activity): Approx 2730 Kcal/day and 54g Protein/day (or use the most recent ICMR 2020 data you have access to). Note: If the input is just ONE meal (e.g., lunch), assume it should cover approx 35-40% of daily needs, or normalize your comparison logic explicitly in the summary. However, for the numbers 'standardPerCU', return the DAILY standard for reference.
  7. Return the result strictly in JSON format.
  `;

  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  if (textDescription) {
    parts.push({ text: textDescription });
  } else if (!imageBase64) {
    throw new Error("Please provide an image or a text description.");
  }

  // Fallback prompt if only image is provided
  if (!textDescription && imageBase64) {
    parts.push({ text: "Analyze this meal plate." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
