
import { PatientInputs, ScaledFeatures, CalculationResults, RiskType, ClinicalTrial, MatchResult } from './types';

export const clamp01 = (x: number): number => {
  if (isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
};

export const logistic = (logit: number): number => {
  return 1 / (1 + Math.exp(-logit));
};

export const computeScaledFeatures = (inp: PatientInputs): ScaledFeatures => {
  return {
    ageScaled: clamp01((inp.age - 50) / 30), // ~50-80
    ipssTotalScaled: clamp01(inp.ipssTotal / 35),
    ipssVoidScaled: clamp01(inp.ipssVoiding / 20),
    ipssStorageScaled: clamp01(inp.ipssStorage / 15),
    qmaxScaled: clamp01((15 - inp.qmax) / 15), // lower Qmax -> higher risk
    pvrScaled: clamp01(inp.pvr / 300), // 0-300
    prostateScaled: clamp01((inp.prostateVolume - 10) / 110), // 10-120 -> 0-1
    psaScaled: clamp01(inp.psa / 10),
    priorAUR: inp.cPriorAUR ? 1 : 0,
    metabolic: inp.cMetabolic ? 1 : 0,
    neuro: inp.cNeuro ? 1 : 0,
    alphaOn: inp.tAlpha ? 1 : 0,
    fiveARIOn: inp.t5ARI ? 1 : 0,
    pde5iOn: inp.tPDE5i ? 1 : 0,
  };
};

interface ModelDef {
  intercept: number;
  weights: Record<string, number>;
}

const MODELS: Record<RiskType, ModelDef> = {
  progression: {
    intercept: -2.0,
    weights: {
      ageScaled: 0.20,
      ipssTotalScaled: 1.00,
      ipssVoidScaled: 0.40,
      ipssStorageScaled: 0.20,
      qmaxScaled: 0.40,
      pvrScaled: 0.60,
      prostateScaled: 0.80,
      psaScaled: 0.30,
      priorAUR: 0.50,
      metabolic: 0.10,
      neuro: 0.20,
      alphaOn: -0.30,
      fiveARIOn: -0.40,
      pde5iOn: -0.10
    }
  },
  aur: {
    intercept: -2.2,
    weights: {
      ageScaled: 0.10,
      ipssTotalScaled: 0.20,
      ipssVoidScaled: 0.20,
      ipssStorageScaled: 0.10,
      qmaxScaled: 0.70,
      pvrScaled: 0.90,
      prostateScaled: 0.80,
      psaScaled: 0.50,
      priorAUR: 0.60,
      metabolic: 0.10,
      neuro: 0.30,
      alphaOn: 0.00,
      fiveARIOn: -0.40,
      pde5iOn: 0.00
    }
  },
  surgery: {
    intercept: -2.0,
    weights: {
      ageScaled: 0.30,
      ipssTotalScaled: 0.90,
      ipssVoidScaled: 0.40,
      ipssStorageScaled: 0.20,
      qmaxScaled: 0.70,
      pvrScaled: 0.30,
      prostateScaled: 0.80,
      psaScaled: 0.30,
      priorAUR: 0.40,
      metabolic: 0.10,
      neuro: 0.20,
      alphaOn: -0.30,
      fiveARIOn: -0.20,
      pde5iOn: -0.10
    }
  }
};

export const calculateRisk = (inp: PatientInputs): CalculationResults & { features: ScaledFeatures } => {
  const features = computeScaledFeatures(inp);
  const results: any = { features };

  (['progression', 'aur', 'surgery'] as RiskType[]).forEach(key => {
    const m = MODELS[key];
    let logit = m.intercept;
    const contribs: Record<string, number> = {};

    Object.keys(m.weights).forEach(feat => {
      const beta = m.weights[feat] || 0;
      const value = features[feat] || 0;
      const delta = beta * value;
      logit += delta;
      contribs[feat] = delta;
    });

    results[key] = {
      logit,
      prob: logistic(logit),
      contribs
    };
  });

  return results;
};

export const FEATURE_LABELS: Record<string, string> = {
  ageScaled: 'Age',
  ipssTotalScaled: 'Total Symptom Score',
  ipssVoidScaled: 'Emptying Trouble',
  ipssStorageScaled: 'Urgency/Frequency',
  qmaxScaled: 'Weak Flow',
  pvrScaled: 'Leftover Urine',
  prostateScaled: 'Prostate Size',
  psaScaled: 'PSA Level',
  priorAUR: 'Prior Blockage',
  metabolic: 'Body Weight/Metabolic',
  neuro: 'Nerve Issues',
  alphaOn: 'Taking Relaxants',
  fiveARIOn: 'Taking Shrinkers',
  pde5iOn: 'Taking Flow Meds'
};

/* --- PLAIN LANGUAGE GLOSSARY --- */
export const GLOSSARY: Record<string, string> = {
  "LUTS": "Lower Urinary Tract Symptoms. This is just doctor-speak for any trouble you have with peeing, like going too often, having a weak stream, or waking up at night.",
  "BPH": "Benign Prostatic Hyperplasia. A very common condition where the prostate grows larger as men age. It is NOT cancer, but it can make it hard to pee.",
  "IPSS": "Symptom Score. A standard quiz doctors use to measure how much your urinary problems are bothering you.",
  "Qmax": "Flow Speed. A test that measures how fast you can pee. If the number is low (like under 10), it usually means the prostate is blocking the flow.",
  "PVR": "Leftover Urine (PVR). The amount of urine staying in your bladder after you think you are finished. You want this to be empty (close to 0).",
  "PSA": "PSA Blood Test. A test for prostate health. High numbers can mean an enlarged prostate, infection, or sometimes cancer.",
  "AUR": "Total Blockage (AUR). A painful emergency where you suddenly cannot pee at all. This usually requires a trip to the hospital.",
  "Progression": "Getting Worse. The chance that your symptoms will become more bothersome or that you will need stronger medication soon.",
  "Metabolic": "Metabolic Health. Conditions like high blood pressure, diabetes, or carrying extra weight around the middle can make urinary symptoms worse.",
  "Alpha-blocker": "Muscle Relaxants. Common pills (like Tamsulosin/Flomax) that relax the prostate muscles to help urine flow better.",
  "5-ARI": "Shrinking Pills. Medicines (like Finasteride) that actually make the prostate smaller over time. They take a few months to work.",
  "PDE5i": "Flow Medicines. Pills often used for erections (like Cialis) that can also help relax the bladder and prostate.",
  "Prostate": "A walnut-sized gland that sits under the bladder. When it grows, it squeezes the tube you pee through.",
  "Surgery": "Procedures to open up the channel. This can be done with lasers, steam, or cutting, usually to help you pee freely again."
};

/* --- RECOMMENDATION LOGIC --- */
export interface Recommendation {
  category: 'Urgent' | 'Action' | 'Lifestyle';
  title: string;
  text: string;
}

export const getRecommendations = (results: CalculationResults, inp: PatientInputs): Recommendation[] => {
  const recs: Recommendation[] = [];
  const pProg = results.progression.prob;
  const pAur = results.aur.prob;
  const pSurg = results.surgery.prob;

  // HIGH RISK
  if (pAur > 0.20 || pSurg > 0.25 || inp.ipssTotal >= 20) {
    recs.push({
      category: 'Urgent',
      title: 'Make an appointment soon',
      text: 'Your profile suggests a high chance of a blockage or needing surgery in the next 2 years. It is important to see a urologist to prevent an emergency.'
    });
    
    if (pAur > 0.20) {
      recs.push({
        category: 'Action',
        title: 'Ask about "Combination Therapy"',
        text: 'Since your risk of blockage is high, ask your doctor if taking two medicines together (a muscle relaxer AND a shrinker) would help protect you.'
      });
    }
  } 
  // MODERATE RISK
  else if (pProg > 0.20 || inp.ipssTotal >= 8) {
    recs.push({
      category: 'Action',
      title: 'Schedule a check-up',
      text: 'Your symptoms are moderate. You don\'t need to panic, but you should discuss if medication might improve your quality of life.'
    });
  } 
  // LOW RISK
  else {
    recs.push({
      category: 'Lifestyle',
      title: 'Watch and Wait',
      text: 'Your risks are currently low. You can likely manage this with healthy habits and yearly check-ups.'
    });
  }

  // SPECIFIC ADVICE
  if (inp.ipssStorage > inp.ipssVoiding && inp.ipssTotal > 8) {
    recs.push({
      category: 'Lifestyle',
      title: 'Calm the bladder',
      text: 'Your main issue seems to be frequency/urgency. Reducing caffeine (coffee/tea) and limiting fluids after dinner can help a lot.'
    });
  }

  if (inp.prostateVolume > 40 && !inp.t5ARI) {
    recs.push({
      category: 'Action',
      title: 'Discuss Prostate Size',
      text: 'Your prostate is larger than average. Ask your doctor if a "5-ARI" medication is right for you to stop it from growing further.'
    });
  }

  if (inp.cMetabolic && inp.ipssTotal > 8) {
     recs.push({
      category: 'Lifestyle',
      title: 'Weight and Health',
      text: 'Improving heart health and managing weight often helps reduce urinary symptoms naturally.'
    });
  }

  return recs;
};

/* --- QUESTIONNAIRE DATA --- */
export const IPSS_QUESTIONS = [
  {
    id: 1,
    question: "Incomplete Emptying",
    desc: "Over the past month, how often have you had a sensation of not emptying your bladder completely after you finished urinating?",
    type: "voiding"
  },
  {
    id: 2,
    question: "Frequency",
    desc: "Over the past month, how often have you had to urinate again less than two hours after you finished urinating?",
    type: "storage"
  },
  {
    id: 3,
    question: "Intermittency",
    desc: "Over the past month, how often have you found you stopped and started again several times when you urinated?",
    type: "voiding"
  },
  {
    id: 4,
    question: "Urgency",
    desc: "Over the past month, how often have you found it difficult to postpone urination?",
    type: "storage"
  },
  {
    id: 5,
    question: "Weak Stream",
    desc: "Over the past month, how often have you had a weak urinary stream?",
    type: "voiding"
  },
  {
    id: 6,
    question: "Straining",
    desc: "Over the past month, how often have you had to push or strain to begin urination?",
    type: "voiding"
  },
  {
    id: 7,
    question: "Nocturia",
    desc: "Over the past month, how many times did you most typically get up to urinate from the time you went to bed until the time you got up in the morning?",
    type: "storage"
  }
];

export const IPSS_OPTIONS = [
  { val: 0, label: "Not at all" },
  { val: 1, label: "Less than 1 in 5 times" },
  { val: 2, label: "Less than half the time" },
  { val: 3, label: "About half the time" },
  { val: 4, label: "More than half the time" },
  { val: 5, label: "Almost always" }
];

/* --- TEST INFO DATA --- */
export interface TestDetails {
  name: string;
  visualIcon: string; 
  whatIsIt: string;
  logistics: string;
  timeline: string;
  significance: string;
}

export const TEST_DETAILS: Record<string, TestDetails> = {
  psa: {
    name: "PSA Blood Test",
    visualIcon: "droplet",
    whatIsIt: "Prostate Specific Antigen. A protein made by the prostate. It acts like a smoke detector for prostate health.",
    logistics: "Simple blood draw from your arm. No fasting usually required.",
    timeline: "Results usually take 2-4 days to come back from the lab.",
    significance: "Higher numbers (>1.5 or >4.0 depending on age) can mean an enlarged prostate, infection, or sometimes cancer. It helps doctors decide if you need a biopsy."
  },
  qmax: {
    name: "Uroflowmetry (Flow Speed)",
    visualIcon: "chart",
    whatIsIt: "A machine that measures how fast and strong your urine stream is.",
    logistics: "You wait until your bladder is full, then pee into a special funnel connected to a computer in a private room.",
    timeline: "Immediate. The doctor sees the graph right away.",
    significance: "A healthy flow is like a garden hose on full blast (>15 ml/s). A weak flow (<10 ml/s) suggests the prostate is squeezing the urethra shut."
  },
  pvr: {
    name: "Post-Void Residual (PVR)",
    visualIcon: "scan",
    whatIsIt: "Measuring how much urine is left behind in the bladder after you pee.",
    logistics: "Immediately after you urinate, a nurse places a small ultrasound scanner on your lower belly. It is painless and takes 30 seconds.",
    timeline: "Immediate.",
    significance: "You want this number to be low (near 0). If it is high (>100ml), it means the bladder isn't emptying well, which increases infection and stone risk."
  },
  volume: {
    name: "Prostate Volume",
    visualIcon: "ruler",
    whatIsIt: "Measuring the physical size of the prostate gland.",
    logistics: "Usually done via Transrectal Ultrasound (probe in rectum) or sometimes abdominal ultrasound. It can be uncomfortable but is quick.",
    timeline: "Immediate.",
    significance: "Normal is ~25-30ml (walnut size). BPH can grow it to 50, 80, or even 100ml+ (lemon or orange size). Larger prostates often need stronger medicines."
  }
};

/* --- DRUG DETAILS --- */
export interface DrugDetails {
  name: string;
  examples: string;
  action: string;
  howToTake: string;
  benefits: string;
  sideEffects: string;
}

export const DRUG_DETAILS: Record<string, DrugDetails> = {
  alpha: {
    name: "Alpha-Blockers",
    examples: "Tamsulosin (Flomax), Alfuzosin (Uroxatral), Silodosin (Rapaflo)",
    action: "They work by relaxing the smooth muscles in the prostate and the opening of the bladder. Think of it like loosening a tight necktie so you can breathe easier.",
    howToTake: "Usually one pill a day. Often taken 30 minutes after the same meal each day (like dinner) to improve absorption.",
    benefits: "Works fast—often within days. Improves flow and reduces waking up at night.",
    sideEffects: "Dizziness upon standing (low blood pressure), stuffy nose, and 'retrograde ejaculation' (little to no fluid comes out during sex, which is harmless but surprising)."
  },
  ari: {
    name: "5-Alpha Reductase Inhibitors (5-ARIs)",
    examples: "Finasteride (Proscar), Dutasteride (Avodart)",
    action: "These block the hormone (DHT) that makes the prostate grow. Over time, they actually shrink the prostate gland.",
    howToTake: "One pill a day, with or without food. Crucial: You must take it for 6+ months to see results.",
    benefits: "The only pill that treats the root cause (size). Reduces risk of needing surgery or getting a blockage (AUR) by 50%.",
    sideEffects: "Lower sex drive, difficulty with erections, and sometimes breast tenderness. These occur in small percentage of men."
  },
  pde5: {
    name: "PDE5 Inhibitors",
    examples: "Tadalafil (Cialis) 5mg daily",
    action: "Relaxes muscles in the prostate, bladder, and blood vessels. Increases blood flow to the pelvis.",
    howToTake: "One small dose pill every day at the same time.",
    benefits: "Treats both urinary symptoms and Erectile Dysfunction (ED) at the same time.",
    sideEffects: "Headache, facial flushing, back pain, indigestion. Do NOT take if you use nitrates (nitroglycerin) for heart chest pain."
  }
};

/* ------------------------------------------------------------------
   OPTION C: CLINICAL RESEARCH & REPORTING ENGINE
------------------------------------------------------------------ */

// 1. LIVE TRIAL FETCHING
export const fetchClinicalTrials = async (location: string): Promise<ClinicalTrial[]> => {
  try {
    const encodedLoc = encodeURIComponent(location);
    // V2 API Query: Condition=BPH OR LUTS, Recruting, Location
    // FIXED: Use query.locn instead of filter.geo to support text-based location search (e.g. "New York")
    const url = `https://clinicaltrials.gov/api/v2/studies?query.term=BPH%20OR%20LUTS&query.locn=${encodedLoc}&filter.overallStatus=RECRUITING&pageSize=10`;
    
    const response = await fetch(url);
    
    // Check for HTTP errors (like 400 Bad Request if params are wrong) before attempting to parse JSON
    if (!response.ok) {
        console.warn(`ClinicalTrials API returned ${response.status}: ${response.statusText}`);
        return [];
    }

    // SAFE JSON PARSING: The API might return text errors even with 200 OK in some edge cases (proxies etc)
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch(e) {
        console.warn("API returned invalid JSON", text.substring(0, 100));
        return [];
    }

    if (!data.studies) return [];

    return data.studies.map((study: any) => {
      const proto = study.protocolSection;
      const ident = proto.identificationModule;
      const elig = proto.eligibilityModule || {};
      const cond = proto.conditionsModule || {};
      
      return {
        nctId: ident.nctId,
        briefTitle: ident.briefTitle,
        org: ident.organization?.class || "Unknown",
        status: proto.statusModule?.overallStatus || "Unknown",
        conditions: cond.conditions ? cond.conditions.join(', ') : "Prostate Conditions",
        eligibility: {
          sex: elig.sex || "ALL",
          minAge: elig.minimumAge || "0 Years",
          maxAge: elig.maximumAge || "100 Years",
          criteria: elig.eligibilityCriteria || ""
        },
        locations: proto.contactsLocationsModule?.locations?.map((l:any) => l.city).slice(0,3) || []
      };
    });
  } catch (err) {
    console.error("Failed to fetch trials", err);
    return [];
  }
};

// 2. ELIGIBILITY MATCHER (Heuristic)
export const checkTrialEligibility = (trial: ClinicalTrial, patient: PatientInputs): MatchResult => {
  const reasons: string[] = [];
  let score: MatchResult['score'] = 'Medium'; // Start neutral

  // Sex Check (Assuming LUTS tool is for male anatomy primarily, but adhering to API data)
  if (trial.eligibility.sex === "FEMALE") {
    return { nctId: trial.nctId, score: "Excluded", reasons: ["Study is for females only"] };
  }

  // Age Parse & Check
  const minAge = parseInt(trial.eligibility.minAge) || 0;
  const maxAge = parseInt(trial.eligibility.maxAge) || 120;
  
  if (patient.age < minAge) {
     return { nctId: trial.nctId, score: "Excluded", reasons: [`Too young (Min age: ${minAge})`] };
  }
  if (patient.age > maxAge) {
     return { nctId: trial.nctId, score: "Excluded", reasons: [`Too old (Max age: ${maxAge})`] };
  }

  // Criteria Keyword Matching
  const criteria = trial.eligibility.criteria.toLowerCase();
  
  if (patient.priorPCa && (criteria.includes("exclude prostate cancer") || criteria.includes("history of cancer"))) {
    score = "Excluded";
    reasons.push("History of prostate cancer");
  }

  if (patient.ipssTotal < 8 && criteria.includes("moderate to severe")) {
    score = "Low";
    reasons.push("Symptoms may be too mild");
  }

  if (patient.prostateVolume > 80 && criteria.includes("prostate volume > 30")) {
    score = "High"; // Good candidate
  }

  if (reasons.length === 0 && score === 'Medium') {
     // Boost if generic criteria met
     if (patient.ipssTotal > 12) score = "High"; 
  }

  return { nctId: trial.nctId, score, reasons };
};

// 3. EXPORT GENERATOR
export const generateCSV = (inputs: PatientInputs, risks: CalculationResults) => {
  const headers = "Metric,Value\n";
  const profile = [
    `Age,${inputs.age}`,
    `PSA,${inputs.psa}`,
    `Prostate Volume,${inputs.prostateVolume}`,
    `IPSS Total,${inputs.ipssTotal}`,
    `Qmax,${inputs.qmax}`,
    `PVR,${inputs.pvr}`,
    `BPH Diagnosis,${inputs.priorBPH ? 'Yes' : 'No'}`,
    `On Alpha Blocker,${inputs.tAlpha ? 'Yes' : 'No'}`,
    `On 5-ARI,${inputs.t5ARI ? 'Yes' : 'No'}`,
    `--- RISKS ---`,
    `Progression Risk,${(risks.progression.prob * 100).toFixed(1)}%`,
    `AUR Risk,${(risks.aur.prob * 100).toFixed(1)}%`,
    `Surgery Risk,${(risks.surgery.prob * 100).toFixed(1)}%`
  ].join("\n");

  const blob = new Blob([headers + profile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `clinical_report_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
