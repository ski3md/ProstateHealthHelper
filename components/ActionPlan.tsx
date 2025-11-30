import React from 'react';
import { ClipboardList, Coffee, Phone, AlertCircle } from 'lucide-react';
import { Recommendation } from '../utils';

interface ActionPlanProps {
  recommendations: Recommendation[];
}

const ActionPlan: React.FC<ActionPlanProps> = ({ recommendations }) => {
  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => {
        let Icon = ClipboardList;
        let colorClass = "bg-slate-800 border-slate-700 text-slate-300";
        
        if (rec.category === 'Urgent') {
          Icon = AlertCircle;
          colorClass = "bg-red-900/20 border-red-500/30 text-red-200";
        } else if (rec.category === 'Lifestyle') {
          Icon = Coffee;
          colorClass = "bg-teal-900/20 border-teal-500/30 text-teal-200";
        } else if (rec.category === 'Action') {
          Icon = Phone;
          colorClass = "bg-blue-900/20 border-blue-500/30 text-blue-200";
        }

        return (
          <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${colorClass}`}>
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-900/40 flex items-center justify-center">
                <Icon size={20} />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">{rec.title}</h4>
              <p className="text-sm opacity-90 leading-relaxed">{rec.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActionPlan;