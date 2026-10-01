import React from 'react';
import {
  Lock,
  Building2,
  Stethoscope,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Language, PatientProfile } from '../types';
import { LogOut } from 'lucide-react';

interface InpatientDormantLockScreenProps {
  currentLang: Language;
  patient: PatientProfile;
  onLogout?: () => void;
}

export const InpatientDormantLockScreen: React.FC<InpatientDormantLockScreenProps> = ({
  currentLang,
  patient,
  onLogout,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-6 text-center">
        {/* Lock Graphic */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>

        {/* Title & Explanation */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Outpatient Activation Window Dormant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isRtl
              ? 'موقع المتابعة المنزلية مغلق — المريض منوم بالمستشفى'
              : 'Outpatient Care Plan Locked (Inpatient Status)'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            The outpatient website remains dormant while patient <strong className="text-slate-900">{patient.name}</strong> (MRN: <strong className="text-teal-800">{patient.mrn}</strong>) is admitted in the hospital ward at <strong>{patient.hospitalName}</strong>.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Strict Institutional Access Governance:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 font-medium">
            <li>Outpatient features unlock exclusively when the attending physician completes official discharge.</li>
            <li>No self-registration or pre-discharge patient data editing is permitted.</li>
          </ul>
        </div>

        {/* Patient Notice */}
        <div className="pt-2 text-center text-xs text-slate-500 font-medium space-y-3">
          <p>Please contact your hospital care team or attending physician at {patient.hospitalName} to activate your outpatient discharge status.</p>
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
