import React, { useState } from 'react';
import { Header } from './components/Header';
import { NewsInput } from './components/NewsInput';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeNewsClaim } from './services/geminiService';
import { AnalysisResult as AnalysisResultType, AnalysisStatus } from './types';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeNewsClaim(text);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while analyzing the news. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Text */}
        <div className="text-center max-w-2xl mx-auto py-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-4">
            Verify news with the power of AI
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Unsure if a headline or link is real or fake? Paste it below. Veritas AI scans the web in real-time to fact-check claims against reliable sources.
          </p>
        </div>

        {/* Input Section */}
        <NewsInput onAnalyze={handleAnalyze} status={status} />

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Analysis Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {status === AnalysisStatus.SUCCESS && result && (
          <AnalysisResult result={result} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Veritas AI. Powered by Google Gemini.</p>
          <p className="mt-1">
            Disclaimer: AI can make mistakes. Always verify important information from multiple official sources.
          </p>
        </div>
      </footer>
    </div>
  );
}