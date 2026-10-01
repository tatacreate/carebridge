import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  FileText,
  Printer,
  Share2,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { Language, PatientProfile, SymptomAssessment } from '../types';
import { getTranslation } from '../data/translations';

interface SymptomCheckerProps {
  currentLang: Language;
  patient: PatientProfile;
  onSaveAssessment: (assessment: SymptomAssessment) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  currentLang,
  patient,
  onSaveAssessment,
}) => {
  const [temperatureC, setTemperatureC] = useState<number>(36.8);
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [heartRateBPM, setHeartRateBPM] = useState<number>(75);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [woundCondition, setWoundCondition] = useState<
    'clean' | 'mild_redness' | 'swollen' | 'pus_discharge' | 'bleeding' | 'not_applicable'
  >('clean');

  const [flagShortnessOfBreath, setFlagShortnessOfBreath] = useState<boolean>(false);
  const [flagDizziness, setFlagDizziness] = useState<boolean>(false);
  const [flagNauseaVomiting, setFlagNauseaVomiting] = useState<boolean>(false);
  const [flagInabilityToEat, setFlagInabilityToEat] = useState<boolean>(false);
  const [flagDvtCalf, setFlagDvtCalf] = useState<boolean>(false);

  const [assessmentResult, setAssessmentResult] = useState<SymptomAssessment | null>(null);

  const handleEvaluate = () => {
    // Clinical Threshold Rules Engine
    let riskLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let recommendation = '';
    let summaryText = '';

    const isFeverCritical = temperatureC >= 38.3;
    const isFeverWarning = temperatureC >= 37.6 && temperatureC < 38.3;
    const isBpCritical = systolicBP >= 180 || systolicBP <= 85 || diastolicBP >= 110;
    const isBpWarning = systolicBP >= 140 || diastolicBP >= 90;
    const isHrCritical = heartRateBPM >= 120 || heartRateBPM <= 45;
    const isHrWarning = heartRateBPM >= 100 || heartRateBPM <= 55;
    const isPainCritical = painLevel >= 8;
    const isPainWarning = painLevel >= 5 && painLevel < 8;
    const isWoundCritical = woundCondition === 'pus_discharge' || woundCondition === 'bleeding';
    const isWoundWarning = woundCondition === 'swollen' || woundCondition === 'mild_redness';
    const isRedFlagCritical = flagShortnessOfBreath || flagDizziness || flagNauseaVomiting || flagInabilityToEat || flagDvtCalf;

    if (isFeverCritical || isBpCritical || isHrCritical || isPainCritical || isWoundCritical || isRedFlagCritical) {
      riskLevel = 'CRITICAL';
      recommendation = getTranslation(currentLang, 'resultCriticalDesc');
      summaryText = `CRITICAL MEDICAL ALERT: Temp ${temperatureC}°C, BP ${systolicBP}/${diastolicBP}, HR ${heartRateBPM}bpm, Pain ${painLevel}/10, Wound: ${woundCondition}. Direct ER return advised.`;
    } else if (isFeverWarning || isBpWarning || isHrWarning || isPainWarning || isWoundWarning) {
      riskLevel = 'WARNING';
      recommendation = getTranslation(currentLang, 'resultWarningDesc');
      summaryText = `WARNING: Elevated vitals/symptoms recorded (Temp ${temperatureC}°C, BP ${systolicBP}/${diastolicBP}, Pain ${painLevel}/10). Contact hospital care line.`;
    } else {
      riskLevel = 'NORMAL';
      recommendation = getTranslation(currentLang, 'resultNormalDesc');
      summaryText = `NORMAL RECOVERY: All metrics within safe parameters (Temp ${temperatureC}°C, BP ${systolicBP}/${diastolicBP}, Pain ${painLevel}/10). Continue standard roadmap.`;
    }

    const assessment: SymptomAssessment = {
      id: `eval-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      systolicBP,
      diastolicBP,
      heartRateBPM,
      temperatureC,
      painLevel,
      woundCondition,
      dizziness: flagDizziness,
      shortnessOfBreath: flagShortnessOfBreath,
      nauseaVomiting: flagNauseaVomiting,
      inabilityToEat: flagInabilityToEat,
      dvtCalfScreening: flagDvtCalf,
      riskLevel,
      recommendation,
      summaryText,
    };

    setAssessmentResult(assessment);
    onSaveAssessment(assessment);
  };

  const handleReset = () => {
    setTemperatureC(36.8);
    setPainLevel(3);
    setWoundCondition('clean');
    setFlagShortnessOfBreath(false);
    setFlagDizziness(false);
    setFlagNauseaVomiting(false);
    setFlagInabilityToEat(false);
    setAssessmentResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!assessmentResult) return;
    const text = encodeURIComponent(
      `*SAFAH RECOVERY SUMMARY CARD*\nPatient: ${patient.name}\nMRN: ${patient.mrn}\nDate: ${assessmentResult.timestamp}\nStatus: ${assessmentResult.riskLevel}\nTemp: ${assessmentResult.temperatureC}°C\nPain: ${assessmentResult.painLevel}/10\nWound: ${assessmentResult.woundCondition}\n\nDoctor Contact: ${patient.doctorPhone}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
            <Activity className="w-6 h-6 text-teal-600" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {getTranslation(currentLang, 'symptomTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {getTranslation(currentLang, 'symptomSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Guided Questions Form */}
      {!assessmentResult ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-8">
          {/* Question 1: Body Temperature */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Thermometer className="w-4.5 h-4.5 text-teal-600" />
                <span>{getTranslation(currentLang, 'tempQuestion')}</span>
              </span>
              <span
                className={`text-base font-extrabold px-3 py-1 rounded-xl border ${
                  temperatureC >= 38.3
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : temperatureC >= 37.6
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {temperatureC.toFixed(1)} °C
              </span>
            </label>

            <input
              type="range"
              min="35.5"
              max="40.5"
              step="0.1"
              value={temperatureC}
              onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>35.5°C (Hypothermia)</span>
              <span>37.0°C (Normal)</span>
              <span className="text-amber-600">37.8°C (Fever)</span>
              <span className="text-rose-600">39.0°C+ (High Fever)</span>
            </div>
          </div>

          {/* Question 2: Pain Score 1-10 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="w-4.5 h-4.5 text-teal-600" />
                <span>{getTranslation(currentLang, 'painQuestion')}</span>
              </span>
              <span
                className={`text-base font-extrabold px-3 py-1 rounded-xl border ${
                  painLevel >= 8
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : painLevel >= 5
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {painLevel} / 10
              </span>
            </label>

            {/* Pain Visual Faces Scale */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setPainLevel(score)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    painLevel === score
                      ? score >= 8
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                        : score >= 5
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-300'
                        : 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>1: {getTranslation(currentLang, 'pain0')}</span>
              <span>5: {getTranslation(currentLang, 'pain5')}</span>
              <span className="text-rose-600 font-bold">10: {getTranslation(currentLang, 'pain10')}</span>
            </div>
          </div>

          {/* Question 3: Surgical Wound Site Assessment */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-teal-600" />
              <span>{getTranslation(currentLang, 'woundQuestion')}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'clean', label: getTranslation(currentLang, 'woundClean'), alert: false },
                { key: 'mild_redness', label: getTranslation(currentLang, 'woundMildRedness'), alert: false },
                { key: 'swollen', label: getTranslation(currentLang, 'woundSwollen'), alert: true },
                { key: 'pus_discharge', label: getTranslation(currentLang, 'woundPus'), alert: true },
                { key: 'bleeding', label: getTranslation(currentLang, 'woundBleeding'), alert: true },
                { key: 'not_applicable', label: getTranslation(currentLang, 'woundNA'), alert: false },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setWoundCondition(item.key as typeof woundCondition)}
                  className={`p-3.5 rounded-2xl text-xs font-semibold text-left transition border flex items-center justify-between ${
                    woundCondition === item.key
                      ? item.alert
                        ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200'
                        : 'bg-teal-50 border-teal-400 text-teal-950 ring-2 ring-teal-200'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {woundCondition === item.key && (
                    <CheckCircle2 className={`w-4 h-4 ${item.alert ? 'text-rose-600' : 'text-teal-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Systemic Red Flags */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              <span>{getTranslation(currentLang, 'redFlagsQuestion')}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'sob',
                  label: getTranslation(currentLang, 'flagShortnessOfBreath'),
                  state: flagShortnessOfBreath,
                  setter: setFlagShortnessOfBreath,
                },
                {
                  id: 'dizzy',
                  label: getTranslation(currentLang, 'flagDizziness'),
                  state: flagDizziness,
                  setter: setFlagDizziness,
                },
                {
                  id: 'vomit',
                  label: getTranslation(currentLang, 'flagNauseaVomiting'),
                  state: flagNauseaVomiting,
                  setter: setFlagNauseaVomiting,
                },
                {
                  id: 'eat',
                  label: getTranslation(currentLang, 'flagInabilityToEat'),
                  state: flagInabilityToEat,
                  setter: setFlagInabilityToEat,
                },
              ].map((flag) => (
                <label
                  key={flag.id}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 select-none ${
                    flag.state
                      ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={flag.state}
                    onChange={(e) => flag.setter(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span className="text-xs">{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Evaluate Action */}
          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={handleEvaluate}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition transform hover:scale-[1.02] flex items-center gap-2"
            >
              <span>{getTranslation(currentLang, 'evaluateSymptoms')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Results Card */
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              assessmentResult.riskLevel === 'CRITICAL'
                ? 'bg-gradient-to-r from-rose-900 to-rose-700 border-2 border-rose-500'
                : assessmentResult.riskLevel === 'WARNING'
                ? 'bg-gradient-to-r from-amber-700 to-amber-600 border-2 border-amber-400'
                : 'bg-gradient-to-r from-emerald-800 to-teal-800 border-2 border-emerald-500'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md flex-shrink-0 mt-1">
                {assessmentResult.riskLevel === 'CRITICAL' ? (
                  <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
                ) : assessmentResult.riskLevel === 'WARNING' ? (
                  <AlertTriangle className="w-8 h-8 text-white" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-md inline-block mb-1">
                  Clinical Assessment: {assessmentResult.riskLevel}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {assessmentResult.riskLevel === 'CRITICAL'
                    ? getTranslation(currentLang, 'resultCriticalTitle')
                    : assessmentResult.riskLevel === 'WARNING'
                    ? getTranslation(currentLang, 'resultWarningTitle')
                    : getTranslation(currentLang, 'resultNormalTitle')}
                </h3>
                <p className="text-xs text-white/90 mt-1 leading-relaxed max-w-2xl">
                  {assessmentResult.recommendation}
                </p>
              </div>
            </div>

            {/* Direct Call Hospital / ER Button */}
            <a
              href={`tel:${patient.emergencyPhone}`}
              className="flex-shrink-0 bg-white text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg transition hover:bg-slate-100 flex items-center gap-2 text-xs"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>{getTranslation(currentLang, 'callEmergency')}</span>
            </a>
          </div>

          {/* Printable Emergency Clinical Summary Card */}
          <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 space-y-4 print:p-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h4 className="text-base font-bold text-slate-900">
                  {getTranslation(currentLang, 'generatedSummaryCard')}
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{assessmentResult.timestamp}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Patient Name</span>
                <strong className="text-slate-900 font-bold">{patient.name}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">MRN Number</span>
                <strong className="text-slate-900 font-bold">{patient.mrn}</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Temperature</span>
                <strong className="text-slate-900 font-bold">{assessmentResult.temperatureC} °C</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pain Score</span>
                <strong className="text-slate-900 font-bold">{assessmentResult.painLevel} / 10</strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 font-semibold text-[10px] uppercase block">Recorded Summary</span>
              <p className="text-slate-800 font-mono text-xs leading-relaxed">{assessmentResult.summaryText}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{getTranslation(currentLang, 'resetForm')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{getTranslation(currentLang, 'shareWithFamily')}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{getTranslation(currentLang, 'printSummary')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
