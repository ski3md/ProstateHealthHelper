import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { IPSS_QUESTIONS, IPSS_OPTIONS } from '../utils';

interface IPSSModalProps {
  currentTotal: number;
  onSave: (scores: { total: number; voiding: number; storage: number }) => void;
  onClose: () => void;
}

const IPSSModal: React.FC<IPSSModalProps> = ({ currentTotal, onSave, onClose }) => {
  // Local state for answers: index 0-6 corresponds to question ID 1-7
  const [answers, setAnswers] = useState<number[]>(Array(7).fill(-1));
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswer = (val: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = val;
    setAnswers(newAnswers);
    
    // Auto advance after short delay
    if (currentStep < 6) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 250);
    }
  };

  const calculateAndSave = () => {
    // Treat unanswered as 0
    const finalAnswers = answers.map(a => a === -1 ? 0 : a);
    
    // Voiding questions: 1, 3, 5, 6 (Indices 0, 2, 4, 5)
    const voiding = finalAnswers[0] + finalAnswers[2] + finalAnswers[4] + finalAnswers[5];
    
    // Storage questions: 2, 4, 7 (Indices 1, 3, 6)
    const storage = finalAnswers[1] + finalAnswers[3] + finalAnswers[6];
    
    const total = voiding + storage;
    
    onSave({ total, voiding, storage });
  };

  const currentQ = IPSS_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / 7) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Symptom Calculator
            </h2>
            <p className="text-slate-400 text-sm">Question {currentStep + 1} of 7</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800">
          <div className="h-full bg-accent-teal transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">{currentQ.question}</h3>
            <p className="text-lg text-slate-300 leading-relaxed">{currentQ.desc}</p>
          </div>

          <div className="space-y-3">
            {IPSS_OPTIONS.map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleAnswer(opt.val)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group
                  ${answers[currentStep] === opt.val 
                    ? 'bg-accent-teal/20 border-accent-teal text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border
                     ${answers[currentStep] === opt.val ? 'bg-accent-teal text-slate-900 border-accent-teal' : 'border-slate-600 text-slate-500'}
                  `}>
                    {opt.val}
                  </div>
                  <span className="font-medium text-lg">{opt.label}</span>
                </div>
                {answers[currentStep] === opt.val && <CheckCircle2 className="text-accent-teal" />}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {currentStep < 6 ? (
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-2"
            >
              Skip / Next <ArrowRight size={18} />
            </button>
          ) : (
             <button 
              onClick={calculateAndSave}
              className="px-8 py-3 rounded-xl font-bold bg-accent-teal text-slate-900 hover:bg-teal-400 flex items-center gap-2 shadow-lg shadow-teal-900/20"
            >
              Finish & Save Score <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPSSModal;