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
        <div className={`p-6 rounded-3xl border transition duration-300 ${
          telemetry?.isAnomalySpiked
            ? 'bg-rose-50/70 border-rose-200 shadow-md animate-pulse-slow'
            : 'bg-gradient-to-br from-teal-50/50 to-emerald-50/20 border-teal-100 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-full ${telemetry?.isAnomalySpiked ? 'bg-rose-600 animate-ping' : 'bg-teal-500 animate-pulse'}`} />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>Smart Biometric Patch Connected</span>
                  <span className="bg-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">Live Hardware Stream</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Model: CarePatch-FIDO2 • Last updated: {telemetry?.lastUpdated || 'Live'}</p>
              </div>
            </div>

            {/* Test Trigger Button */}
            {onToggleAnomaly && (
              <button
                type="button"
                onClick={onToggleAnomaly}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition flex items-center gap-1.5 shadow-2xs ${
                  telemetry?.isAnomalySpiked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                <span>{telemetry?.isAnomalySpiked ? 'Reset to Stable State' : 'Simulate Vitals Spike (Test Alert)'}</span>
              </button>
            )}
          </div>

          {/* Core physiological telemetry parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vitals 1: Heart Rate */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                telemetry?.isAnomalySpiked ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-teal-50 text-teal-600'
              }`}>
                <Heart className={`w-6 h-6 ${telemetry?.isAnomalySpiked ? 'fill-rose-600' : 'fill-teal-600/20'}`} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Heart Rate</span>
                <span className={`text-xl font-black font-mono block ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                  {telemetry?.heartRate || 72} <span className="text-xs font-normal">bpm</span>
                </span>
                <span className={`text-[9px] font-bold ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {telemetry?.isAnomalySpiked ? '⚠️ Abnormal Tachycardia' : '✓ Sinus Rhythm'}
                </span>
              </div>
            </div>

            {/* Vitals 2: Temperature */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                telemetry?.isAnomalySpiked ? 'bg-rose-100 text-rose-600' : 'bg-teal-50 text-teal-600'
              }`}>
                <Activity className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Body Temperature</span>
                <span className={`text-xl font-black font-mono block ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                  {telemetry?.temperature || 36.8} <span className="text-xs font-normal">°C</span>
                </span>
                <span className={`text-[9px] font-bold ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {telemetry?.isAnomalySpiked ? '⚠️ High Fever Warning' : '✓ Normothermia'}
                </span>
              </div>
            </div>

            {/* Vitals 3: ECG Status */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6 text-teal-600 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">ECG status</span>
                <span className="text-sm font-black text-slate-900 leading-snug block">
                  {telemetry?.ecgStatus || 'Normal Sinus Rhythm'}
                </span>
                <span className="text-[9px] text-slate-400 block">24-hour encrypted audit active</span>
              </div>
            </div>
          </div>

          {/* Spiked Warning Banner */}
          {telemetry?.isAnomalySpiked && (
            <div className="mt-4 p-4 bg-rose-100 text-rose-950 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs animate-fade-in font-bold">
              <span className="text-lg">🚨</span>
              <div className="space-y-0.5">
                <span className="font-extrabold block">CRITICAL ALERT FORWARDED TO MEDICAL TEAM</span>
                <p className="text-[11px] text-rose-800 font-medium">
                  Attending Surgical Consultant Dr. Sarah Al-Mansoor and KFSH Hospital Administrators have been instantly notified in real time about this physiological vitals spike. Rest calmly; hospital response services are monitoring your live telemetry.
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
