import React, { useState } from 'react';
import { Search, MapPin, ExternalLink, Beaker, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ClinicalTrial, PatientInputs } from '../types';
import { fetchClinicalTrials, checkTrialEligibility } from '../utils';

interface ClinicalTrialsProps {
  patientData: PatientInputs;
}

const ClinicalTrials: React.FC<ClinicalTrialsProps> = ({ patientData }) => {
  const [location, setLocation] = useState('');
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const results = await fetchClinicalTrials(location);
      setTrials(results);
    } catch (e) {
      setError('Could not connect to ClinicalTrials.gov registry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Header Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Beaker className="text-accent-teal" /> Live Research Match
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Search the <strong>ClinicalTrials.gov</strong> registry in real-time to find BPH/LUTS studies recruiting near you.
            Our engine automatically checks if you might qualify based on your Age and Condition.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto flex flex-col gap-2">
           <div className="flex gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="City or Zip Code" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:border-accent-teal outline-none text-white w-full md:w-64"
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading || !location}
                className="bg-accent-teal hover:bg-teal-400 text-slate-900 font-bold px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                Find
              </button>
           </div>
           <p className="text-[10px] text-slate-500 pl-1">Ex: "New York", "90210", "London"</p>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800 pt-6">
         {loading && (
           <div className="flex flex-col items-center justify-center py-12 text-slate-500">
             <Loader2 size={32} className="animate-spin mb-3 text-accent-teal" />
             <p>Scanning registry for recruiting studies...</p>
           </div>
         )}

         {!loading && hasSearched && trials.length === 0 && !error && (
            <div className="text-center py-8 text-slate-400">
              <p>No recruiting BPH/LUTS studies found in "{location}".</p>
              <p className="text-xs mt-2">Try a larger nearby city.</p>
            </div>
         )}

         {error && (
           <div className="p-4 bg-red-900/20 text-red-300 rounded-xl text-center border border-red-900/50">
             {error}
           </div>
         )}

         <div className="space-y-4">
           {trials.map((trial) => {
             const match = checkTrialEligibility(trial, patientData);
             
             let matchColor = "bg-slate-800 border-slate-700";
             let BadgeIcon = AlertCircle;
             
             if (match.score === 'High') {
               matchColor = "bg-green-900/10 border-green-500/30";
               BadgeIcon = CheckCircle;
             } else if (match.score === 'Excluded') {
               matchColor = "opacity-60 bg-slate-900 border-slate-800";
               BadgeIcon = XCircle;
             }

             return (
               <div key={trial.nctId} className={`p-5 rounded-xl border ${matchColor} transition-all`}>
                 <div className="flex justify-between items-start gap-4">
                   <div>
                     <div className="flex gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1
                          ${match.score === 'High' ? 'bg-green-500/20 text-green-300' : match.score === 'Excluded' ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'}
                        `}>
                           {BadgeIcon && <BadgeIcon size={10} />} {match.score} Match
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          {trial.status}
                        </span>
                     </div>
                     <h3 className="font-bold text-white text-lg leading-tight mb-1">{trial.briefTitle}</h3>
                     <p className="text-xs text-slate-400 mb-3">{trial.org} • ID: {trial.nctId}</p>
                     
                     <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                        {match.reasons.length > 0 && (
                          <div className="mb-2 w-full text-xs text-orange-200/80">
                            Note: {match.reasons.join(', ')}
                          </div>
                        )}
                     </div>
                   </div>
                   
                   <a 
                     href={`https://clinicaltrials.gov/study/${trial.nctId}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="shrink-0 p-2 bg-slate-800 hover:bg-slate-700 text-accent-teal rounded-lg transition-colors"
                     title="View on ClinicalTrials.gov"
                   >
                     <ExternalLink size={20} />
                   </a>
                 </div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
};

export default ClinicalTrials;
