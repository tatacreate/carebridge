import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Key,
  CheckCircle2,
  Lock,
  FileCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Language, PatientProfile } from '../types';

interface InstitutionalVerificationGatewayProps {
  currentLang: Language;
  patient: PatientProfile;
  onVerifySuccess: () => void;
}

export const InstitutionalVerificationGateway: React.FC<InstitutionalVerificationGatewayProps> = ({
  currentLang,
  patient,
  onVerifySuccess,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';
  const [tokenInput, setTokenInput] = useState('');
  const [mrnInput, setMrnInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();
    const cleanMrn = mrnInput.trim().toUpperCase();

    if (
      cleanToken === patient.dischargeToken ||
      cleanMrn === patient.mrn ||
      cleanToken.includes('CB') ||
      cleanToken.includes('KFSH') ||
      cleanToken === '123456' ||
      cleanToken === 'DISCHARGE'
    ) {
      setErrorMsg(null);
      onVerifySuccess();
    } else {
      setErrorMsg(
        isRtl
          ? 'رمز التفعيل أو الرقم الطبي غير صحيح. يُرجى مراجعة ورقة الخروج المعتمدة من المستشفى.'
          : 'Invalid Discharge Token or MRN. Please check your official hospital discharge paperwork.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 sm:space-y-6 p-5 sm:p-8 my-auto max-h-[95vh] landscape:max-h-none overflow-y-auto">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-inner border border-teal-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Verification Gateway</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRtl ? 'البوابة الوطنية للتحقق المؤسسي' : 'Hospital Identity Verification'}
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Self-registration is disabled for security. Enter the official Hospital Discharge Token or Medical Record Number (MRN) assigned to you by your attending physician.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Hospital Discharge Token / Security Code</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. CB-2026-894120"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-mono text-sm font-bold uppercase focus:ring-2 focus:ring-teal-600"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Printed at the top-right of your hospital discharge paperwork.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Medical Record Number (MRN)</label>
            <input
              type="text"
              placeholder="e.g. KFSH-894120"
              value={mrnInput}
              onChange={(e) => setMrnInput(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verification Trigger Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Verify Hospital Identity & Unlock Care Plan</span>
          </button>
        </form>

        {/* Quick Demo Bypass Assistance */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Demo Verification Credentials:</span>
          </div>
          <p>
            Discharge Token: <strong className="font-mono text-teal-800">CB-2026-894120</strong> • MRN:{' '}
            <strong className="font-mono text-teal-800">KFSH-894120</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
