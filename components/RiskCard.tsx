import React from 'react';
import { RiskResult } from '../types';

interface RiskCardProps {
  title: string;
  subtitle: string;
  result: RiskResult;
  type: 'progression' | 'aur' | 'surgery';
  onClickInfo?: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ title, subtitle, result, type, onClickInfo }) => {
  const pct = result.prob * 100;
  
  let colorClass = 'bg-accent-teal';
  let label = 'Low Risk';
  let desc = 'Good news. Risk is low.';
  
  if (pct >= 40) {
    colorClass = 'bg-accent-red';
    label = 'High Risk';
    desc = 'Attention needed.';
  } else if (pct >= 20) {
    colorClass = 'bg-accent-gold';
    label = 'Moderate Risk';
    desc = 'Keep an eye on this.';
  } else if (pct >= 10) {
    colorClass = 'bg-blue-400';
    label = 'Low-Moderate';
    desc = 'Slightly elevated.';
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="cursor-pointer" onClick={onClickInfo}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 hover:text-accent-teal transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 leading-snug max-w-[90%]">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-mono font-bold text-white">{pct.toFixed(0)}%</span>
        </div>
      </div>

      <div className="relative h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700 mb-3">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClass}`} 
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {/* Simple ticks */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800" style={{ left: '25%' }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800" style={{ left: '50%' }} />
        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800" style={{ left: '75%' }} />
      </div>

      <div className="flex justify-between items-center">
         <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
            label === 'High Risk' ? 'text-red-200 bg-red-900/40' : 
            label === 'Moderate Risk' ? 'text-yellow-200 bg-yellow-900/40' : 
            'text-teal-200 bg-teal-900/40'
         }`}>
           {label}
         </span>
         <span className="text-sm text-slate-300 font-medium">{desc}</span>
      </div>
    </div>
  );
};

export default RiskCard;