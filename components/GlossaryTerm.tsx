import React from 'react';
import { HelpCircle } from 'lucide-react';

interface GlossaryTermProps {
  term: string;
  definition?: string;
  children: React.ReactNode;
  onExplain: (term: string) => void;
}

const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, children, onExplain }) => {
  return (
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onExplain(term);
      }}
      className="inline-flex items-baseline gap-1 border-b border-dashed border-accent-teal/50 hover:border-accent-teal hover:bg-accent-teal/10 rounded px-1 transition-all group cursor-help text-left"
    >
      <span className="font-semibold text-slate-200 group-hover:text-accent-teal">{children}</span>
      <HelpCircle size={12} className="text-accent-teal/70" />
    </button>
  );
};

export default GlossaryTerm;