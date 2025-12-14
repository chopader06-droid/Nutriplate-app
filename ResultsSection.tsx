import React from 'react';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface ResultsSectionProps {
  result: AnalysisResult | null;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  if (!result) return null;

  const chartData = [
    {
      name: 'Calories (Kcal)',
      Intake: result.intakePerCU.calories,
      Standard: result.standardPerCU.calories,
    },
    {
      name: 'Protein (g)',
      Intake: result.intakePerCU.protein,
      Standard: result.standardPerCU.protein,
    },
  ];

  // Helper to determine gap color
  const getGapColor = (percent: number) => {
    if (Math.abs(percent) < 10) return 'text-emerald-600';
    return percent < 0 ? 'text-red-500' : 'text-amber-500';
  };

  const GapIcon = ({ percent }: { percent: number }) => {
    if (Math.abs(percent) < 10) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    return percent < 0 ? <TrendingDown className="w-5 h-5 text-red-500" /> : <TrendingUp className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Analysis Summary
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          {result.summary}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
           <span className="bg-slate-100 px-2 py-1 rounded">Family CU: {result.consumptionUnits.toFixed(2)}</span>
           <span className="bg-slate-100 px-2 py-1 rounded">Benchmark: {result.standardPerCU.source}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calories Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <p className="text-slate-500 text-sm font-medium mb-1">Calorie Intake / CU</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{result.intakePerCU.calories.toLocaleString()}</span>
            <span className="text-xs text-slate-500">Kcal</span>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getGapColor(result.gap.caloriesPercent)}`}>
            <GapIcon percent={result.gap.caloriesPercent} />
            <span>{Math.abs(result.gap.caloriesPercent)}% {result.gap.caloriesPercent < 0 ? 'Deficit' : 'Surplus'}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Target: {result.standardPerCU.calories} Kcal</p>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <p className="text-slate-500 text-sm font-medium mb-1">Protein Intake / CU</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{result.intakePerCU.protein}</span>
            <span className="text-xs text-slate-500">g</span>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getGapColor(result.gap.proteinPercent)}`}>
            <GapIcon percent={result.gap.proteinPercent} />
            <span>{Math.abs(result.gap.proteinPercent)}% {result.gap.proteinPercent < 0 ? 'Deficit' : 'Surplus'}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Target: {result.standardPerCU.protein}g</p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Intake vs. Standard (Daily)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Intake" name="Your Intake" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="Standard" name="ICMR Standard" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2 italic">
          *Comparison is normalized to daily standards. Ensure input quantity reflects a full day or adjust expectations.
        </p>
      </div>

      {/* Food Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">Identified Items Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {result.foodItems.map((item, idx) => (
            <div key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.quantityEstimate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-700">{item.calories} Kcal</p>
                <p className="text-xs text-slate-500">{item.protein}g Protein</p>
              </div>
            </div>
          ))}
          <div className="px-6 py-3 flex justify-between items-center bg-slate-50/50">
            <span className="text-sm font-bold text-slate-700">Total (All Members)</span>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{result.totalCalories} Kcal</p>
              <p className="text-xs text-slate-600">{result.totalProtein}g Protein</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultsSection;
