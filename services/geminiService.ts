import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Source } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeNewsClaim = async (claim: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const modelId = "gemini-2.5-flash";
  
  // Prompt engineering to force a structured text output since we cannot use JSON mode with Search Grounding.
  const prompt = `
    You are an expert fact-checker and news verifier. 
    Your task is to analyze the truthfulness of the user's input. 
    The input can be a specific news claim, a short text snippet, OR a URL/link to a news article.

    User Input to Verify: "${claim}"

    Instructions:
    1. If the input is a text claim, analyze its truthfulness.
    2. If the input is a URL/Link, use Google Search to verify the credibility of the content likely associated with that specific link or the main story it reports.
    3. Use Google Search to find corroborating or debunking evidence from reliable sources.

    Strictly follow this output format in your text response:
    SCORE: [Insert a number from 0 to 100, where 0 is completely false/fake and 100 is completely true/verified]
    VERDICT: [Insert a short verdict label, e.g., True, Mostly True, Mixed, Misleading, False, Satire]
    ANALYSIS: [Insert a comprehensive paragraph explaining your reasoning, citing the specific facts found in the search results.]

    Do not include markdown formatting like **bold** in the headers (SCORE, VERDICT, ANALYSIS). Keep it plain text for parsing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is NOT allowed with googleSearch
        temperature: 0.1, // Low temperature for factual consistency
      },
    });

    const text = response.text || "";
    
    // Extract Sources from Grounding Metadata
    const sources: Source[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Parse the text response
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const verdictMatch = text.match(/VERDICT:\s*(.+?)(?:\n|$)/i);
    const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*)/i);

    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50; // Default to 50 if parsing fails
    const verdict = verdictMatch ? verdictMatch[1].trim() : "Unverified";
    const analysis = analysisMatch ? analysisMatch[1].trim() : text; // Fallback to full text if parsing fails

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      score,
      verdict,
      analysis,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};