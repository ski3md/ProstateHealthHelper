import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2 z-20">
      <button
        type="button"
        className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        <HelpCircle size={14} />
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-64 p-3 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl border border-slate-700 leading-relaxed z-50 pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;