import React, { useState } from 'react';
import { Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { AnalysisStatus } from '../types';

interface NewsInputProps {
  onAnalyze: (text: string) => void;
  status: AnalysisStatus;
}

export const NewsInput: React.FC<NewsInputProps> = ({ onAnalyze, status }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const isLoading = status === AnalysisStatus.LOADING;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <label htmlFor="news-input" className="block text-sm font-medium text-gray-700 mb-2">
          Paste a headline, article snippet, or news link to verify
        </label>
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            id="news-input"
            rows={4}
            className="w-full p-4 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none outline-none"
            placeholder="e.g. 'NASA discovers a new planet...' or paste a link like 'https://news-site.com/article...'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <LinkIcon size={12} />
              Supports text claims and direct URLs
            </p>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all
                ${isLoading || !text.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg active:transform active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};