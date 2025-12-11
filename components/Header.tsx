import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-serif tracking-tight">Veritas AI</h1>
            <p className="text-xs text-gray-500 font-sans">Real-time News Verification</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
            Powered by Gemini Grounding
          </span>
        </div>
      </div>
    </header>
  );
};