import React from 'react';
import { X, Activity, Droplet, Ruler, Scan, Info, AlertTriangle, Pill, Clock, ThumbsUp } from 'lucide-react';
import { DrugDetails, TestDetails } from '../utils';

interface DetailModalProps {
  title: string;
  type: 'test' | 'drug';
  data: any; // TestDetails | DrugDetails
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ title, type, data, onClose }) => {
  
  if (!data) return null;

  // Render Logic for "Test" type
  const renderTestContent = (test: TestDetails) => (
    <div className="space-y-8">
      {/* Visual Schematic */}
      <div className="bg-slate-950 rounded-xl p-8 flex flex-col items-center justify-center border border-slate-800 text-center">
         <div className="mb-4 text-accent-teal">
            {test.visualIcon === 'droplet' && <Droplet size={64} />}
            {test.visualIcon === 'chart' && <Activity size={64} />}
            {test.visualIcon === 'scan' && <Scan size={64} />}
            {test.visualIcon === 'ruler' && <Ruler size={64} />}
         </div>
         <h4 className="text-xl font-bold text-white mb-2">{test.whatIsIt}</h4>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h5 className="text-slate-400 uppercase tracking-wide text-xs font-bold flex items-center gap-2">
            <Clock size={14} /> Logistics & Time
          </h5>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-200 text-sm leading-relaxed">
            <p className="mb-2"><strong>How:</strong> {test.logistics}</p>
            <p><strong>When:</strong> {test.timeline}</p>
          </div>
        </div>
        <div className="space-y-2">
           <h5 className="text-slate-400 uppercase tracking-wide text-xs font-bold flex items-center gap-2">
            <Info size={14} /> What it Means
          </h5>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-200 text-sm leading-relaxed">
            {test.significance}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Logic for "Drug" type
  const renderDrugContent = (drug: DrugDetails) => (
    <div className="space-y-6">
      
      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-4 items-start">
        <Pill className="shrink-0 text-blue-400 mt-1" />
        <div>
          <h4 className="font-bold text-blue-200 mb-1">Common Names</h4>
          <p className="text-blue-100/80 text-sm">{drug.examples}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
           <h5 className="text-white font-bold mb-2 flex items-center gap-2">
             <Activity size={16} className="text-accent-teal" /> How it works
           </h5>
           <p className="text-slate-300 leading-relaxed text-sm">{drug.action}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
           <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <h5 className="text-white font-bold mb-2 flex items-center gap-2">
                <ThumbsUp size={16} className="text-green-400" /> Benefits
              </h5>
              <p className="text-slate-300 leading-relaxed text-sm">{drug.benefits}</p>
           </div>
           
           <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <h5 className="text-white font-bold mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" /> Side Effects
              </h5>
              <p className="text-slate-300 leading-relaxed text-sm">{drug.sideEffects}</p>
           </div>
        </div>
        
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
           <h5 className="text-white font-bold mb-2 flex items-center gap-2">
             <Clock size={16} className="text-accent-gold" /> How to take
           </h5>
           <p className="text-slate-300 leading-relaxed text-sm">{drug.howToTake}</p>
        </div>
      </div>

    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={onClose}>
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className={`text-xs font-bold uppercase tracking-widest py-1 px-2 rounded ${type === 'drug' ? 'bg-blue-900/50 text-blue-200' : 'bg-purple-900/50 text-purple-200'}`}>
                 {type === 'drug' ? 'Medication Guide' : 'Test Info'}
               </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
           {type === 'test' ? renderTestContent(data as TestDetails) : renderDrugContent(data as DrugDetails)}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;