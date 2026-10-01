import React from 'react';
import { Lock, ShieldCheck, Stethoscope, Building2 } from 'lucide-react';
import { Language, PatientProfile } from '../types';

interface ReadOnlyNoticeBannerProps {
  currentLang: Language;
  patient: PatientProfile;
}

export const ReadOnlyNoticeBanner: React.FC<ReadOnlyNoticeBannerProps> = ({ currentLang, patient }) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  return (
    <div className="p-4 rounded-2xl bg-teal-900/5 border border-teal-800/20 text-slate-800 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold border border-teal-200">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span>{isRtl ? 'تعليمات طبية معتمدة وقمة في الأمان (قراءة فقط)' : 'Provider-Signed Read-Only Directives'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200 uppercase font-mono font-extrabold">
              Doctor Locked
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Authored & Signed by <strong className="text-slate-800">{patient.doctorName}</strong> ({patient.hospitalName}). Schedule manipulation is disabled for patient safety.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        <span className="text-[11px] font-mono text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 font-bold">
          MRN: {patient.mrn}
        </span>
      </div>
    </div>
  );
};
