import React from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const { score, verdict, analysis, sources } = result;

  // Determine color and icon based on score
  let color = '#22c55e'; // Green
  let Icon = CheckCircle;
  let scoreText = 'Likely True';

  if (score < 40) {
    color = '#ef4444'; // Red
    Icon = XCircle;
    scoreText = 'Likely Fake';
  } else if (score < 70) {
    color = '#f59e0b'; // Amber
    Icon = AlertTriangle;
    scoreText = 'Mixed / Unverified';
  }

  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Card: Score and Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-gray-500 font-medium text-sm absolute top-6 left-6">Truthfulness Score</h3>
          <div className="w-48 h-48 relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell key="score" fill={color} />
                  <Cell key="bg" fill="#f3f4f6" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
              <span className="text-4xl font-bold" style={{ color }}>{score}%</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Trust Score</span>
            </div>
          </div>
        </div>

        {/* Verdict and Summary */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Icon size={28} color={color} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{verdict}</h2>
              <p className="text-sm text-gray-500">Based on analysis of available web sources</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {analysis}
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe size={18} className="text-brand-600" />
            Reliable Sources Found ({sources.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {sources.length > 0 ? (
            sources.map((source, index) => (
              <a
                key={index}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-brand-700 group-hover:text-brand-900 group-hover:underline decoration-brand-300 underline-offset-2">
                      {source.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{source.uri}</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-300 group-hover:text-brand-500" />
                </div>
              </a>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No specific grounding links were returned by the search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};