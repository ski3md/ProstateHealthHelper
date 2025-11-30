import React, { useState, useEffect } from 'react';
import { Activity, RotateCcw, X, AlertTriangle, BookOpen, Stethoscope, ChevronRight, ClipboardList, Info, FileText, Download, Printer } from 'lucide-react';
import { PatientInputs, CalculationResults } from './types';
import { calculateRisk, GLOSSARY, getRecommendations, Recommendation, TEST_DETAILS, DRUG_DETAILS, generateCSV } from './utils';
import RiskCard from './components/RiskCard';
import ShapTable from './components/ShapTable';
import ActionPlan from './components/ActionPlan';
import GlossaryTerm from './components/GlossaryTerm';
import IPSSModal from './components/IPSSModal';
import DetailModal from './components/DetailModal';
import ClinicalTrials from './components/ClinicalTrials';

// Default initial state
const INITIAL_STATE: PatientInputs = {
  age: 68,
  race: 'white',
  priorBPH: false,
  priorPCa: false,
  ipssTotal: 15,
  ipssVoiding: 9,
  ipssStorage: 6,
  ipssQoL: 4,
  qmax: 11,
  pvr: 60,
  prostateVolume: 40,
  psa: 1.8,
  cMetabolic: false,
  cDiabetes: false,
  cNeuro: false,
  cPriorAUR: false,
  tAlpha: false,
  t5ARI: false,
  tPDE5i: false,
  tAntimus: false,
  tBeta3: false,
  tPriorSurgery: false,
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<PatientInputs>(INITIAL_STATE);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [scaledFeatures, setScaledFeatures] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Modal States
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isIPSSOpen, setIsIPSSOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{ type: 'test'|'drug', title: string, data: any } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Recalculate on input change
  useEffect(() => {
    const calc = calculateRisk(inputs);
    setResults(calc);
    setScaledFeatures(calc.features);
    setRecommendations(getRecommendations(calc, inputs));
  }, [inputs]);

  const handleNumChange = (field: keyof PatientInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleBoolChange = (field: keyof PatientInputs) => {
    setInputs(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange = (field: keyof PatientInputs, value: string) => {
    if (value === 'yes' || value === 'no') {
        setInputs(prev => ({ ...prev, [field]: value === 'yes' }));
    } else {
        setInputs(prev => ({ ...prev, [field]: value }));
    }
  };

  // --- Modal Handlers ---
  const openGlossary = (term: string) => {
    setActiveTerm(term);
    setIsGlossaryOpen(true);
  };

  const closeGlossary = () => {
    setIsGlossaryOpen(false);
    setActiveTerm(null);
  };

  const openTestInfo = (key: string) => {
    const data = TEST_DETAILS[key];
    if (data) {
      setDetailModal({ type: 'test', title: data.name, data });
    }
  };

  const openDrugInfo = (key: string) => {
    const data = DRUG_DETAILS[key];
    if (data) {
      setDetailModal({ type: 'drug', title: data.name, data });
    }
  };

  const handleIPSSSave = (scores: { total: number; voiding: number; storage: number }) => {
    setInputs(prev => ({
      ...prev,
      ipssTotal: scores.total,
      ipssVoiding: scores.voiding,
      ipssStorage: scores.storage
    }));
    setIsIPSSOpen(false);
  };

  const handleExportCSV = () => {
    if (results) generateCSV(inputs, results);
  };

  const handlePrint = () => {
    // Open custom modal instead of using window.print() or alert() which might be blocked by sandbox
    setShowPrintModal(true);
  };

  const loadScenario = (type: 'moderate' | 'high') => {
    if (type === 'moderate') {
      setInputs({
        ...INITIAL_STATE,
        age: 62,
        ipssTotal: 14,
        ipssVoiding: 7,
        ipssStorage: 7,
        ipssQoL: 3,
        qmax: 13,
        pvr: 70,
        prostateVolume: 35,
        psa: 1.3,
        priorBPH: true,
        cMetabolic: true,
        tAlpha: true
      });
    } else {
      setInputs({
        ...INITIAL_STATE,
        age: 75,
        ipssTotal: 26,
        ipssVoiding: 17,
        ipssStorage: 9,
        ipssQoL: 5,
        qmax: 7,
        pvr: 260,
        prostateVolume: 90,
        psa: 4.2,
        priorBPH: true,
        cMetabolic: true,
        cPriorAUR: true,
        tAlpha: true,
        t5ARI: true
      });
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-accent-teal selection:text-slate-950 pb-20 print:bg-white print:text-black">
      
      {/* GLOSSARY OVERLAY */}
      {isGlossaryOpen && activeTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:hidden" onClick={closeGlossary}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={closeGlossary} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-accent-teal mb-4 flex items-center gap-2">
              <BookOpen size={28} />
              {activeTerm}
            </h3>
            <p className="text-lg text-slate-200 leading-relaxed">
              {GLOSSARY[activeTerm] || GLOSSARY[activeTerm.split(' ')[0]] || "Definition not found."}
            </p>
            <button onClick={closeGlossary} className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors">
              Got it, thanks
            </button>
          </div>
        </div>
      )}

      {/* PRINT INSTRUCTION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md print:hidden" onClick={() => setShowPrintModal(false)}>
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md text-center relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPrintModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Printer size={32} className="text-accent-teal" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Print Report</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              To print your results or save them as a PDF, please use your browser's print shortcut:
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl py-4 px-8 inline-block mb-8 shadow-inner">
              <span className="font-mono text-2xl font-bold text-accent-teal tracking-wider">
                {navigator.userAgent.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd + P' : 'Ctrl + P'}
              </span>
            </div>
            <button 
              onClick={() => setShowPrintModal(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* IPSS MODAL */}
      {isIPSSOpen && (
        <IPSSModal 
          currentTotal={inputs.ipssTotal}
          onSave={handleIPSSSave}
          onClose={() => setIsIPSSOpen(false)}
        />
      )}

      {/* DETAIL MODAL (Tests/Drugs) */}
      {detailModal && (
        <DetailModal 
          title={detailModal.title}
          type={detailModal.type}
          data={detailModal.data}
          onClose={() => setDetailModal(null)}
        />
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 pt-6 pb-6 sticky top-0 z-40 shadow-lg print:static print:border-none print:bg-white print:shadow-none">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 print:hidden">
              <div className="h-2 w-2 rounded-full bg-accent-teal animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest uppercase text-accent-teal">Educational Tool</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight print:text-black">Prostate Health Explorer</h1>
            <p className="text-slate-400 mt-2 text-lg print:text-gray-600">
              Clinical Risk Stratification & Trial Matcher
            </p>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Printer size={16} /> Print Report
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-accent-teal hover:bg-teal-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <Download size={16} /> Export Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12 print:space-y-6">
        
        {/* Intro Message */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-lg text-slate-300 leading-relaxed print:hidden">
          <p>
            <strong>Welcome.</strong> This tool helps you understand your urinary health. Enter your numbers below to see if you might be at risk for getting worse or needing surgery. 
            <span className="block mt-2 text-sm text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <Stethoscope size={16} className="inline mr-2 align-text-bottom" />
              <strong>Tip:</strong> Click on any <span className="text-accent-teal underline decoration-dashed underline-offset-4">underlined word</span> to see what it means.
            </span>
          </p>
        </div>

        {/* --- SECTION 1: ABOUT YOU --- */}
        <section className="space-y-6 break-inside-avoid">
          <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-2 print:border-gray-300">
            <div className="bg-slate-800 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center print:bg-gray-200 print:text-black">1</div>
            <h2 className="text-2xl font-bold text-white print:text-black">About You</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm print:bg-white print:border-gray-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium print:text-black">Age</label>
                <input 
                  type="number" value={inputs.age} onChange={(e) => handleNumChange('age', e.target.value)}
                  className="w-full h-12 text-lg bg-slate-950 border border-slate-700 rounded-xl px-4 focus:border-accent-teal outline-none print:bg-white print:border-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium print:text-black">Diagnosed with <GlossaryTerm term="BPH" onExplain={openGlossary}>Enlarged Prostate</GlossaryTerm>?</label>
                <div className="flex gap-2 print:hidden">
                  <button onClick={() => handleSelectChange('priorBPH', 'yes')} className={`flex-1 py-3 rounded-xl border font-medium transition-all ${inputs.priorBPH ? 'bg-accent-teal text-slate-900 border-accent-teal' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Yes</button>
                  <button onClick={() => handleSelectChange('priorBPH', 'no')} className={`flex-1 py-3 rounded-xl border font-medium transition-all ${!inputs.priorBPH ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>No</button>
                </div>
                <div className="hidden print:block font-mono font-bold">{inputs.priorBPH ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="block text-slate-300 font-medium print:text-black"><GlossaryTerm term="Metabolic" onExplain={openGlossary}>Metabolic Issues</GlossaryTerm>?</label>
                 <p className="text-sm text-slate-500 print:hidden">Do you have high blood pressure, diabetes, or obesity?</p>
                 <div className="flex gap-2 print:hidden">
                  <button onClick={() => handleSelectChange('cMetabolic', 'yes')} className={`flex-1 py-3 rounded-xl border font-medium transition-all ${inputs.cMetabolic ? 'bg-accent-teal text-slate-900 border-accent-teal' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Yes</button>
                  <button onClick={() => handleSelectChange('cMetabolic', 'no')} className={`flex-1 py-3 rounded-xl border font-medium transition-all ${!inputs.cMetabolic ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>No</button>
                </div>
                <div className="hidden print:block font-mono font-bold">{inputs.cMetabolic ? 'Yes' : 'No'}</div>
               </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: SYMPTOMS (Updated) --- */}
        <section className="space-y-6 break-inside-avoid">
          <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-2 print:border-gray-300">
            <div className="bg-slate-800 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center print:bg-gray-200 print:text-black">2</div>
            <h2 className="text-2xl font-bold text-white print:text-black">Your Symptoms</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-sm print:bg-white print:border-gray-300">
             <div className="flex flex-col md:flex-row gap-8 items-start">
               
               {/* Score Display Card */}
               <div className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center print:bg-white print:border-gray-400">
                  <h3 className="text-slate-400 font-medium mb-2 uppercase tracking-wide text-sm print:text-black">Your Total Score</h3>
                  <div className="text-5xl font-extrabold text-white mb-2 print:text-black">{inputs.ipssTotal}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 print:border print:border-black print:text-black
                    ${inputs.ipssTotal < 8 ? 'bg-green-900/40 text-green-200' : inputs.ipssTotal < 20 ? 'bg-yellow-900/40 text-yellow-200' : 'bg-red-900/40 text-red-200'}`}>
                    {inputs.ipssTotal < 8 ? 'Mild' : inputs.ipssTotal < 20 ? 'Moderate' : 'Severe'}
                  </div>
                  
                  <button 
                    onClick={() => setIsIPSSOpen(true)}
                    className="w-full py-3 bg-accent-teal hover:bg-teal-400 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 print:hidden"
                  >
                    <ClipboardList size={20} />
                    Take Symptom Quiz
                  </button>
               </div>

               {/* Breakdown */}
               <div className="flex-1 w-full space-y-6 pt-2">
                  <p className="text-slate-300 leading-relaxed print:hidden">
                    The <strong>IPSS</strong> is the gold-standard test doctors use. You can either type your score if you know it, or take the quiz on the left.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 print:bg-white print:border-gray-400">
                        <span className="block text-slate-400 text-xs uppercase font-bold mb-1 print:text-black">Emptying</span>
                        <span className="text-xl font-bold text-white print:text-black">{inputs.ipssVoiding} <span className="text-slate-500 text-sm">/ 20</span></span>
                     </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 print:bg-white print:border-gray-400">
                        <span className="block text-slate-400 text-xs uppercase font-bold mb-1 print:text-black">Frequency</span>
                        <span className="text-xl font-bold text-white print:text-black">{inputs.ipssStorage} <span className="text-slate-500 text-sm">/ 15</span></span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-1">
                     <label className="text-sm font-medium text-slate-300 flex justify-between print:text-black">
                       <span>Quality of Life (Bother)</span>
                       <span className="text-slate-400 print:text-black">{inputs.ipssQoL} / 6</span>
                     </label>
                     <input 
                       type="range" min="0" max="6" 
                       value={inputs.ipssQoL} onChange={(e) => handleNumChange('ipssQoL', e.target.value)}
                       className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-teal print:hidden"
                     />
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* --- SECTION 3: TEST RESULTS (Updated) --- */}
        <section className="space-y-6 break-inside-avoid">
          <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-2 print:border-gray-300">
             <div className="bg-slate-800 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center print:bg-gray-200 print:text-black">3</div>
             <h2 className="text-2xl font-bold text-white print:text-black">Test Results</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             {/* PSA */}
             <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative group print:bg-white print:border-gray-300">
                <button onClick={() => openTestInfo('psa')} className="absolute top-4 right-4 text-slate-500 hover:text-accent-teal print:hidden">
                  <Info size={20} />
                </button>
                <label className="block text-base font-bold text-slate-200 mb-1 print:text-black">PSA Level</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" value={inputs.psa} onChange={(e) => handleNumChange('psa', e.target.value)}
                    className="w-24 bg-slate-950 h-12 border border-slate-700 rounded-lg px-3 focus:border-accent-teal outline-none text-xl print:bg-white print:border-gray-400"
                  />
                  <span className="text-slate-500 text-sm">ng/mL</span>
                </div>
             </div>

             {/* Qmax */}
             <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative group print:bg-white print:border-gray-300">
                <button onClick={() => openTestInfo('qmax')} className="absolute top-4 right-4 text-slate-500 hover:text-accent-teal print:hidden">
                  <Info size={20} />
                </button>
                <label className="block text-base font-bold text-slate-200 mb-1 print:text-black">Flow Speed (Qmax)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" value={inputs.qmax} onChange={(e) => handleNumChange('qmax', e.target.value)}
                    className="w-24 bg-slate-950 h-12 border border-slate-700 rounded-lg px-3 focus:border-accent-teal outline-none text-xl print:bg-white print:border-gray-400"
                  />
                  <span className="text-slate-500 text-sm">mL/s</span>
                </div>
             </div>

             {/* PVR */}
             <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative group print:bg-white print:border-gray-300">
                <button onClick={() => openTestInfo('pvr')} className="absolute top-4 right-4 text-slate-500 hover:text-accent-teal print:hidden">
                  <Info size={20} />
                </button>
                <label className="block text-base font-bold text-slate-200 mb-1 print:text-black">Leftover Urine (PVR)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" value={inputs.pvr} onChange={(e) => handleNumChange('pvr', e.target.value)}
                    className="w-24 bg-slate-950 h-12 border border-slate-700 rounded-lg px-3 focus:border-accent-teal outline-none text-xl print:bg-white print:border-gray-400"
                  />
                  <span className="text-slate-500 text-sm">mL</span>
                </div>
             </div>

             {/* Volume */}
             <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative group print:bg-white print:border-gray-300">
                <button onClick={() => openTestInfo('volume')} className="absolute top-4 right-4 text-slate-500 hover:text-accent-teal print:hidden">
                  <Info size={20} />
                </button>
                <label className="block text-base font-bold text-slate-200 mb-1 print:text-black">Prostate Size</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" value={inputs.prostateVolume} onChange={(e) => handleNumChange('prostateVolume', e.target.value)}
                    className="w-24 bg-slate-950 h-12 border border-slate-700 rounded-lg px-3 focus:border-accent-teal outline-none text-xl print:bg-white print:border-gray-400"
                  />
                  <span className="text-slate-500 text-sm">cc / mL</span>
                </div>
             </div>
          </div>
        </section>

        {/* --- SECTION 4: MEDICATIONS (Updated) --- */}
        <section className="space-y-6 break-inside-avoid">
          <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-2 print:border-gray-300">
            <div className="bg-slate-800 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center print:bg-gray-200 print:text-black">4</div>
            <h2 className="text-2xl font-bold text-white print:text-black">Current Medicines</h2>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 print:bg-white print:border-gray-300">
            <div className="grid md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 print:bg-white print:border-gray-400">
                 <div className="flex items-start justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={inputs.tAlpha} onChange={() => handleBoolChange('tAlpha')} className="w-6 h-6 rounded border-slate-600 bg-slate-900 text-accent-teal focus:ring-accent-teal print:hidden" />
                      <div>
                        <span className="block font-bold text-white text-lg print:text-black">Alpha-blocker</span>
                        <span className="text-xs text-slate-500 print:hidden">Relaxants like Flomax</span>
                      </div>
                    </label>
                 </div>
                 <div className="hidden print:block font-mono font-bold pl-2">{inputs.tAlpha ? 'Taking' : 'Not Taking'}</div>
                 <button onClick={() => openDrugInfo('alpha')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1 self-start px-2 py-1 bg-blue-900/20 rounded print:hidden">
                    Drug Facts <ChevronRight size={12} />
                 </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 print:bg-white print:border-gray-400">
                 <div className="flex items-start justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={inputs.t5ARI} onChange={() => handleBoolChange('t5ARI')} className="w-6 h-6 rounded border-slate-600 bg-slate-900 text-accent-teal focus:ring-accent-teal print:hidden" />
                      <div>
                        <span className="block font-bold text-white text-lg print:text-black">5-ARI</span>
                        <span className="text-xs text-slate-500 print:hidden">Shrinkers like Finasteride</span>
                      </div>
                    </label>
                 </div>
                 <div className="hidden print:block font-mono font-bold pl-2">{inputs.t5ARI ? 'Taking' : 'Not Taking'}</div>
                 <button onClick={() => openDrugInfo('ari')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1 self-start px-2 py-1 bg-blue-900/20 rounded print:hidden">
                    Drug Facts <ChevronRight size={12} />
                 </button>
              </div>

               <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 print:bg-white print:border-gray-400">
                 <div className="flex items-start justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={inputs.tPDE5i} onChange={() => handleBoolChange('tPDE5i')} className="w-6 h-6 rounded border-slate-600 bg-slate-900 text-accent-teal focus:ring-accent-teal print:hidden" />
                      <div>
                        <span className="block font-bold text-white text-lg print:text-black">PDE5 Inhibitor</span>
                        <span className="text-xs text-slate-500 print:hidden">Flow meds like Cialis</span>
                      </div>
                    </label>
                 </div>
                 <div className="hidden print:block font-mono font-bold pl-2">{inputs.tPDE5i ? 'Taking' : 'Not Taking'}</div>
                 <button onClick={() => openDrugInfo('pde5')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1 self-start px-2 py-1 bg-blue-900/20 rounded print:hidden">
                    Drug Facts <ChevronRight size={12} />
                 </button>
              </div>

            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 print:hidden">
           <button onClick={() => loadScenario('moderate')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-medium transition-colors">
             Load "Moderate" Example
           </button>
           <button onClick={() => loadScenario('high')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-medium transition-colors">
             Load "High Risk" Example
           </button>
           <button onClick={() => setInputs(INITIAL_STATE)} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
             <RotateCcw size={18} /> Reset
           </button>
        </div>

        {/* --- RESULTS AREA --- */}
        <div className="border-t border-slate-800 my-12 pt-12 break-before-page">
           <h2 className="text-3xl font-extrabold text-center text-white mb-2 print:text-black">Your 2-Year Outlook</h2>
           <p className="text-center text-slate-400 mb-8 max-w-xl mx-auto print:text-gray-600">Based on the numbers you entered, here is an educational estimate of what might happen in the next 2 years.</p>
           
           <div className="grid lg:grid-cols-2 gap-8 items-start">
              
              {/* Risk Cards */}
              <div className="space-y-4">
                 {results && (
                   <>
                     <RiskCard 
                       title="Symptom Worsening"
                       subtitle="Risk that you will need more meds or feel worse."
                       result={results.progression} type="progression" onClickInfo={() => openGlossary('Progression')}
                     />
                     <RiskCard 
                       title="Total Blockage (AUR)"
                       subtitle="Risk of suddenly not being able to pee."
                       result={results.aur} type="aur" onClickInfo={() => openGlossary('AUR')}
                     />
                     <RiskCard 
                       title="Need for Surgery"
                       subtitle="Risk of needing a procedure to open the flow."
                       result={results.surgery} type="surgery" onClickInfo={() => openGlossary('Surgery')}
                     />
                   </>
                 )}
                 <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 print:hidden">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Why these results?</h4>
                    {results && <ShapTable results={results} features={scaledFeatures} />}
                 </div>
              </div>

              {/* ACTION PLAN */}
              <div className="print:break-inside-avoid">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden print:bg-white print:border-gray-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-teal via-blue-500 to-purple-500"></div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 print:text-black">
                    <Activity className="text-accent-teal print:text-black" />
                    My Personalized Plan
                  </h3>
                  <ActionPlan recommendations={recommendations} />
                  
                  <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-400 leading-relaxed print:bg-gray-100 print:text-black">
                    <p className="flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-accent-gold print:text-black" />
                      <span>
                        <strong>Important:</strong> This tool is for learning only. It does not replace a doctor. Always check with a urologist before changing medications.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

           </div>
        </div>

        {/* --- SECTION 5: CLINICAL TRIALS (New) --- */}
        <section className="border-t border-slate-800 pt-12 print:hidden">
          <ClinicalTrials patientData={inputs} />
        </section>

      </main>

      <footer className="max-w-4xl mx-auto px-6 py-8 border-t border-slate-800 mt-12 text-center text-slate-500 text-sm print:hidden">
        <p className="mb-2"><strong>Not a Medical Device.</strong> Your data stays on this device.</p>
        <p>Designed for clarity and accessibility.</p>
      </footer>
    </div>
  );
};

export default App;