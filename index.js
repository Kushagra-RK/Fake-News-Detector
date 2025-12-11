import { GoogleGenAI } from "https://esm.sh/@google/genai";

// DOM Elements
const newsInput = document.getElementById('newsInput');
const verifyBtn = document.getElementById('verifyBtn');
const btnIconSearch = document.getElementById('btnIconSearch');
const btnIconLoader = document.getElementById('btnIconLoader');
const btnText = document.getElementById('btnText');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const resultSection = document.getElementById('resultSection');
const scoreChart = document.getElementById('scoreChart');
const scoreValue = document.getElementById('scoreValue');
const verdictTitle = document.getElementById('verdictTitle');
const verdictIconContainer = document.getElementById('verdictIconContainer');
const analysisText = document.getElementById('analysisText');
const sourcesList = document.getElementById('sourcesList');
const sourceCount = document.getElementById('sourceCount');

// Initialize API
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// State
let isLoading = false;

// Icons (SVG Strings)
const icons = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9.01" y1="9" y2="15"/><line x1="9.01" x2="15" y1="9" y2="15"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>`
};

// Event Listeners
newsInput.addEventListener('input', () => {
  verifyBtn.disabled = !newsInput.value.trim() || isLoading;
});

verifyBtn.addEventListener('click', handleVerify);

async function handleVerify() {
  const text = newsInput.value.trim();
  if (!text) return;

  setLoading(true);
  setError(null);
  resultSection.classList.add('hidden');

  try {
    const data = await analyzeNewsClaim(text);
    renderResult(data);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong while analyzing the news. Please try again.");
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  isLoading = loading;
  newsInput.disabled = loading;
  verifyBtn.disabled = loading;
  
  if (loading) {
    btnIconSearch.classList.add('hidden');
    btnIconLoader.classList.remove('hidden');
    btnText.textContent = "Verifying...";
  } else {
    btnIconSearch.classList.remove('hidden');
    btnIconLoader.classList.add('hidden');
    btnText.textContent = "Verify";
  }
}

function setError(msg) {
  if (msg) {
    errorSection.classList.remove('hidden');
    errorMessage.textContent = msg;
  } else {
    errorSection.classList.add('hidden');
  }
}

function renderResult(data) {
  const { score, verdict, analysis, sources } = data;

  // Determine colors and icon
  let color = '#22c55e'; // Green
  let iconHtml = icons.check;

  if (score < 40) {
    color = '#ef4444'; // Red
    iconHtml = icons.x;
  } else if (score < 70) {
    color = '#f59e0b'; // Amber
    iconHtml = icons.alert;
  }

  // Update Score Chart
  scoreChart.style.setProperty('--chart-percent', score);
  scoreChart.style.setProperty('--chart-color', color);
  scoreValue.textContent = `${score}%`;
  scoreValue.style.color = color;

  // Update Verdict
  verdictTitle.textContent = verdict;
  verdictIconContainer.innerHTML = iconHtml;
  verdictIconContainer.style.color = color;

  // Update Analysis
  analysisText.textContent = analysis;

  // Update Sources
  sourceCount.textContent = sources.length;
  sourcesList.innerHTML = '';
  
  if (sources.length === 0) {
    sourcesList.innerHTML = `
      <div class="p-8 text-center text-gray-500">
        <p>No specific grounding links were returned by the search.</p>
      </div>
    `;
  } else {
    sources.forEach(source => {
      const a = document.createElement('a');
      a.href = source.uri;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "block p-4 hover:bg-gray-50 transition-colors group";
      a.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-medium text-brand-700 group-hover:text-brand-900 group-hover:underline decoration-brand-300 underline-offset-2">
              ${source.title}
            </h4>
            <p class="text-xs text-gray-400 mt-1 truncate max-w-md">${source.uri}</p>
          </div>
          <div class="text-gray-300 group-hover:text-brand-500">
            ${icons.externalLink}
          </div>
        </div>
      `;
      sourcesList.appendChild(a);
    });
  }

  // Show Results
  resultSection.classList.remove('hidden');
  // Scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Logic from previous geminiService.ts
async function analyzeNewsClaim(claim) {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const modelId = "gemini-2.5-flash";
  
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

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  const text = response.text || "";
  
  // Extract Sources from Grounding Metadata
  const sources = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

  if (groundingChunks) {
    groundingChunks.forEach((chunk) => {
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

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50; 
  const verdict = verdictMatch ? verdictMatch[1].trim() : "Unverified";
  const analysis = analysisMatch ? analysisMatch[1].trim() : text; 

  const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

  return {
    score,
    verdict,
    analysis,
    sources: uniqueSources,
  };
}