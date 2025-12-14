import React, { useState, useRef } from 'react';
import { FamilyComposition } from '../types';
import { Camera, Upload,  X, FileText, Utensils } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (family: FamilyComposition, text: string, image: string | null) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [family, setFamily] = useState<FamilyComposition>({
    adultMales: 1,
    adultFemales: 1,
    children: 1
  });
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data url prefix for API if needed, but Gemini SDK usually handles raw or cleaned.
        // The SDK helper used in service expects base64 data part, we usually strip the header manually 
        // or let the user handle it. Here we will strip it in the service call or before setting state.
        // Actually, for display we need the header. For API we strip it.
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare image for API (strip header)
    const apiImage = image ? image.split(',')[1] : null;
    onAnalyze(family, text, apiImage);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-emerald-600" />
        Meal Details
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Family Composition */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Family Composition (for CU calculation)</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Adult Males</label>
              <input
                type="number"
                min="0"
                value={family.adultMales}
                onChange={(e) => setFamily({ ...family, adultMales: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Adult Females</label>
              <input
                type="number"
                min="0"
                value={family.adultFemales}
                onChange={(e) => setFamily({ ...family, adultFemales: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Children</label>
              <input
                type="number"
                min="0"
                value={family.children}
                onChange={(e) => setFamily({ ...family, children: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Input Methods Tab-ish */}
        <div className="space-y-4">
          
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g., "Cooked 250g raw rice and 100g Moong Dal..."'
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-24 resize-none text-sm"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Food Photo</label>
            
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div className="bg-emerald-100 p-3 rounded-full mb-3 group-hover:bg-emerald-200 transition-colors">
                  <Camera className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Click to upload or take photo</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!text && !image)}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${
            isLoading || (!text && !image)
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              Analyze Meal <FileText className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;
