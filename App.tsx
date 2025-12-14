import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import { AnalysisResult, FamilyComposition } from './types';
import { analyzeMeal } from './services/geminiService';
import { ChefHat, Leaf } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (family: FamilyComposition, text: string, image: string | null) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await analyzeMeal(family, text, image);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">NutriPlate AI</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Family Nutrition Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium">
             <Leaf className="w-3 h-3" />
             <span>ICMR Powered</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Text */}
        {!result && !loading && (
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Analyze your family's meal.</h2>
            <p className="text-slate-600">
              Upload a photo of the cooking pot or plate, or describe the ingredients. 
              We'll calculate the Consumption Units (CU) and see if you're meeting nutritional goals.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className={`lg:col-span-5 ${result ? '' : 'lg:col-start-4 lg:col-span-6'}`}>
            <InputSection onAnalyze={handleAnalyze} isLoading={loading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          {result && (
            <div className="lg:col-span-7">
              <ResultsSection result={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Helper for error icon used above
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

export default App;
