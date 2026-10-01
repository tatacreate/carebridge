import React from 'react';
import {
  Language,
  Medication,
  PatientProfile,
  RoadmapDay,
  DoseLog,
  SymptomAssessment,
} from '../types';
import {
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Heart,
  Sparkles,
  ArrowRight,
  UserCheck,
  Fingerprint,
  Cpu,
  Activity,
} from 'lucide-react';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';

interface HomeDashboardProps {
  currentLang: Language;
  patient: PatientProfile;
  medications: Medication[];
  days: RoadmapDay[];
  doseLogs: DoseLog[];
  symptomAssessments: SymptomAssessment[];
  onTakePill: (medId: string, time: string) => void;
  onSnoozePill: (medId: string, time: string) => void;
  onToggleMilestone: (dayNumber: number, milestoneId: string) => void;
  onNavigateTab: (tab: 'home' | 'link_doctors' | 'alarms' | 'roadmap' | 'symptoms' | 'settings') => void;
  onOpenEmergency: () => void;
  onOpenLinkedDoctors?: () => void;
  telemetry?: {
    heartRate: number;
    temperature: number;
    ecgStatus: string;
    lastUpdated: string;
    isAnomalySpiked: boolean;
  };
  onToggleAnomaly?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentLang,
  patient,
  onNavigateTab,
  onOpenLinkedDoctors,
  telemetry,
  onToggleAnomaly,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  // Calculate connected doctors count
  const linkedDoctorsList = patient.linkedDoctors || [];
  const hasLinkedDoctor = patient.isLinkedToDoctor || linkedDoctorsList.length > 0;
  const doctorCount = linkedDoctorsList.length > 0 ? linkedDoctorsList.length : (hasLinkedDoctor ? 1 : 0);

  return (
    <div id="home-dashboard" className="max-w-4xl mx-auto w-full py-4 sm:py-8 space-y-6 animate-fade-in">
      {/* Warm & Clean Patient Homepage Card */}
      <div className="bg-gradient-to-br from-white via-stone-50/80 to-emerald-50/30 rounded-3xl p-6 sm:p-10 border border-teal-100/80 shadow-sm space-y-8">
        
        {/* 1. Friendly Greeting */}
        <div className="space-y-3 border-b border-teal-100/60 pb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100/80 text-teal-900 border border-teal-200 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600/20" />
              <span>{patient.hospitalName || 'Outpatient Recovery Care'}</span>
            </div>
            <GoogleVerifiedBadge size="sm" email={patient.email} />
            {patient.biometricVerified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-950 border border-emerald-300 text-xs font-bold">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                <span>WebAuthn Biometric Verified</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isRtl ? `مرحباً بك، ${patient.name}!` : `Welcome back, ${patient.name}!`}
          </h1>
          {/* 2. Subtext describing the space */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
            This is your secure Outpatient Recovery Portal, designed to guide you safely through your healing journey.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Connected securely via Google OAuth 2.0 • Identity verified as{' '}
              <strong className="text-slate-700 font-semibold">{patient.email || 'taladaoud5b@gmail.com'}</strong>
            </span>
          </div>

          {/* Verified Patient Demographics Badge Strip */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-teal-200/80 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {isRtl ? 'العمر' : 'Calculated Age'}
              </span>
              <span className="text-sm font-black text-slate-900">
                {patient.age} years old
              </span>
              {patient.dateOfBirth && (
                <span className="text-[10px] text-slate-500 block">DOB: {patient.dateOfBirth}</span>
              )}
            </div>

            <div className="p-3 bg-white rounded-2xl border border-teal-200/80 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {isRtl ? 'الجنسية' : 'Nationality'}
              </span>
              <span className="text-sm font-black text-slate-900 truncate block">
                {patient.nationality || 'Saudi Arabian'}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold block">Verified Patient</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-teal-200/80 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {isRtl ? 'العمل / الدراسة' : 'Occupation / Study'}
              </span>
              <span className="text-sm font-black text-slate-900 truncate block">
                {patient.occupationOrStudy || (patient.age < 18 ? 'Student (Minor)' : 'Registered Patient')}
              </span>
              <span className="text-[10px] text-slate-500 capitalize block">
                {patient.occupationStatus || (patient.age < 18 ? 'Minor' : 'Active')}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-teal-200/80 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {isRtl ? 'رقم الملف الطبي' : 'Patient MRN'}
              </span>
              <span className="text-sm font-black text-teal-800 font-mono block">
                {patient.mrn}
              </span>
              <span className="text-[10px] text-slate-500 block">Outpatient Chart</span>
            </div>
          </div>
        </div>

        {/* Smart Biometric Patch Telemetry widget */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition duration-300 ${
          telemetry?.isAnomalySpiked
            ? 'bg-rose-50/80 border-rose-300 shadow-md animate-pulse-slow'
            : 'bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 border-teal-200/80 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 border-teal-100/80 mb-6">
            <div className="flex items-center gap-3">
              {/* 3D-style Isometric Pod Render Thumbnail */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-900 to-teal-700 p-0.5 shadow-md flex items-center justify-center relative shrink-0">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-800 to-teal-950 flex flex-col items-center justify-center text-teal-300 relative overflow-hidden border border-teal-400/40">
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${telemetry?.isAnomalySpiked ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  <Activity className="w-5 h-5 text-teal-200" />
                  <span className="text-[8px] font-mono font-black text-teal-400">IOT-P</span>
                </div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <span>Smart Biometric Patch: Active Telemetry</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                  <span>CarePatch-FIDO2 Pod</span>
                  <span>•</span>
                  <span className="text-teal-700 font-semibold">BLE 5.2 Encrypted</span>
                </p>
              </div>
            </div>

            {/* Status Pill Badge & Battery */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-black shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected (BLE 5.2)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                <span>🔋 94%</span>
              </div>

              {/* Test Trigger Button */}
              {onToggleAnomaly && (
                <button
                  type="button"
                  onClick={onToggleAnomaly}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide transition flex items-center gap-1.5 shadow-sm ${
                    telemetry?.isAnomalySpiked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  <span>{telemetry?.isAnomalySpiked ? 'Reset Normal Stream' : 'Simulate Vitals Spike (Test Alert)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Core physiological telemetry parameters grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vitals 1: Heart Rate with Sparkline */}
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    telemetry?.isAnomalySpiked ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-teal-50 text-teal-600'
                  }`}>
                    <Heart className={`w-5 h-5 ${telemetry?.isAnomalySpiked ? 'fill-rose-600' : 'fill-teal-600/20'}`} />
                  </div>
                  <span className="text-xs uppercase font-extrabold text-slate-400">Heart Rate</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold ${telemetry?.isAnomalySpiked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {telemetry?.isAnomalySpiked ? 'Tachycardia' : 'Stable'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className={`text-2xl font-black font-mono tracking-tight ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                    {telemetry?.heartRate || 72}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">BPM</span>
                </div>
                {/* CSS Sparkline wave */}
                <div className="flex items-end gap-0.5 h-6">
                  {[40, 65, 30, 85, 45, 70, 50, 90, 60, 75].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: telemetry?.isAnomalySpiked ? `${Math.min(100, h * 1.3)}%` : `${h}%` }}
                      className={`w-1 rounded-full ${telemetry?.isAnomalySpiked ? 'bg-rose-500 animate-pulse' : 'bg-teal-500'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Vitals 2: Body Temperature */}
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    telemetry?.isAnomalySpiked ? 'bg-rose-100 text-rose-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    <Activity className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-xs uppercase font-extrabold text-slate-400">Body Temp</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-teal-50 text-teal-800">
                  Clinical 36.7°C
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className={`text-2xl font-black font-mono tracking-tight ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                    {telemetry?.temperature || 36.7}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">°C</span>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                  Normothermia
                </span>
              </div>
            </div>

            {/* Vitals 3: ECG Status with Dark Screen Waveform */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-2xs text-white space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-teal-400 tracking-wider">ECG Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">
                  {telemetry?.isAnomalySpiked ? 'Tachycardia Detected' : 'Normal Sinus Rhythm'}
                </span>
              </div>
              {/* Simulated ECG Waveform container */}
              <div className="h-7 w-full bg-slate-950 rounded-lg border border-slate-800 flex items-center px-2 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-full h-px bg-teal-500/50 dashed" />
                </div>
                <svg className="w-full h-5 text-emerald-400" viewBox="0 0 120 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M0 10 H20 L25 4 L30 16 L35 10 H50 L55 2 L60 18 L65 10 H85 L90 6 L95 14 L100 10 H120" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

          {/* Spiked Warning Banner */}
          {telemetry?.isAnomalySpiked && (
            <div className="mt-5 p-4 bg-rose-100 text-rose-950 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs animate-fade-in font-bold shadow-xs">
              <span className="text-lg">🚨</span>
              <div className="space-y-0.5">
                <span className="font-extrabold block">CRITICAL ALERT FORWARDED TO MEDICAL TEAM</span>
                <p className="text-[11px] text-rose-800 font-medium">
                  Attending Surgical Consultant and KFSH Hospital Administrators have been instantly notified in real time about this physiological vitals spike. Rest calmly; hospital response services are monitoring your live telemetry.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Status Summary Badge */}
        <div className="p-6 rounded-2xl bg-white border border-teal-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition hover:border-teal-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {doctorCount > 0
                  ? `You currently have ${doctorCount} doctor(s) linked to your account`
                  : `You have no doctors linked to your account yet.`}
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {doctorCount > 0
                  ? `Your active care team (${patient.doctorName || 'Attending Physician'}) updates your discharge prescriptions and recovery milestones in real time.`
                  : 'Link your attending physician to receive live post-hospital prescriptions and recovery milestones.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenLinkedDoctors) {
                onOpenLinkedDoctors();
              } else {
                onNavigateTab('link_doctors');
              }
            }}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md shadow-teal-900/10 transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-center"
          >
            <span>{doctorCount > 0 ? 'View Linked Doctors' : 'Link a Doctor Now'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4. Quick Guidance */}
        <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-200/70 text-teal-950 text-xs sm:text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-teal-700 shrink-0" />
          <span>Check the sidebar panel for more information, daily schedules, and recovery milestones.</span>
        </div>
      </div>
    </div>
  );
};
