import React from 'react';
import { CalculationResults, ScaledFeatures } from '../types';
import { FEATURE_LABELS } from '../utils';

interface ShapTableProps {
  results: CalculationResults;
  features: ScaledFeatures;
}

const ShapTable: React.FC<ShapTableProps> = ({ results }) => {
  const featureKeys = Object.keys(results.progression.contribs);
  
  // Calculate max magnitude for scaling bars
  let maxVal = 0;
  featureKeys.forEach(key => {
    const sum = Math.abs(results.progression.contribs[key]) +
                Math.abs(results.aur.contribs[key]) +
                Math.abs(results.surgery.contribs[key]);
    if (sum > maxVal) maxVal = sum;
  });

  // Filter out features with 0 contribution to clean up the UI
  const activeFeatures = featureKeys.filter(key => {
      const sum = Math.abs(results.progression.contribs[key]) +
                  Math.abs(results.aur.contribs[key]) +
                  Math.abs(results.surgery.contribs[key]);
      return sum > 0.05; // Threshold
  }).sort((a, b) => {
       // Sort by magnitude
       const sumA = Math.abs(results.progression.contribs[a]) + Math.abs(results.aur.contribs[a]) + Math.abs(results.surgery.contribs[a]);
       const sumB = Math.abs(results.progression.contribs[b]) + Math.abs(results.aur.contribs[b]) + Math.abs(results.surgery.contribs[b]);
       return sumB - sumA;
  });

  return (
    <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
      {activeFeatures.map(key => {
        const pVal = results.progression.contribs[key];
        const aVal = results.aur.contribs[key];
        const sVal = results.surgery.contribs[key];
        const total = pVal + aVal + sVal;
        const totalAbs = Math.abs(pVal) + Math.abs(aVal) + Math.abs(sVal);
        const widthPct = (totalAbs / maxVal) * 100;
        
        const isNegative = total < 0;

        return (
          <div key={key} className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center text-xs">
            <div className="text-slate-400 text-right truncate">
              {FEATURE_LABELS[key] || key}
            </div>
            
            <div className="text-center font-mono text-slate-500 text-[10px]">
              {total > 0 ? '+' : ''}{total.toFixed(2)}
            </div>

            <div className="h-full flex items-center">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                 <div 
                   className={`h-full absolute left-0 top-0 transition-all duration-500 ${isNegative ? 'bg-blue-500' : 'bg-green-500'}`}
                   style={{ width: `${Math.min(100, widthPct)}%` }}
                 />
              </div>
            </div>
          </div>
        );
      })}
      {activeFeatures.length === 0 && (
        <div className="text-center text-slate-500 text-xs py-4">
          Adjust inputs to see risk factors.
        </div>
      )}
    </div>
  );
};

export default ShapTable;