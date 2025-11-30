export interface PatientInputs {
  age: number;
  race: string;
  priorBPH: boolean;
  priorPCa: boolean;
  ipssTotal: number;
  ipssVoiding: number;
  ipssStorage: number;
  ipssQoL: number;
  qmax: number;
  pvr: number;
  prostateVolume: number;
  psa: number;
  cMetabolic: boolean;
  cDiabetes: boolean;
  cNeuro: boolean;
  cPriorAUR: boolean;
  tAlpha: boolean;
  t5ARI: boolean;
  tPDE5i: boolean;
  tAntimus: boolean;
  tBeta3: boolean;
  tPriorSurgery: boolean;
}

export interface ScaledFeatures {
  [key: string]: number;
  ageScaled: number;
  ipssTotalScaled: number;
  ipssVoidScaled: number;
  ipssStorageScaled: number;
  qmaxScaled: number;
  pvrScaled: number;
  prostateScaled: number;
  psaScaled: number;
  priorAUR: number;
  metabolic: number;
  neuro: number;
  alphaOn: number;
  fiveARIOn: number;
  pde5iOn: number;
}

export interface RiskResult {
  logit: number;
  prob: number;
  contribs: Record<string, number>;
}

export interface CalculationResults {
  progression: RiskResult;
  aur: RiskResult;
  surgery: RiskResult;
}

export type RiskType = 'progression' | 'aur' | 'surgery';

/* --- CLINICAL TRIALS INTERFACES --- */
export interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  org: string;
  status: string;
  conditions: string;
  eligibility: {
    sex: string;
    minAge: string;
    maxAge: string;
    criteria: string;
  };
  locations: string[];
}

export interface MatchResult {
  nctId: string;
  score: 'High' | 'Medium' | 'Low' | 'Excluded';
  reasons: string[];
}