import React from 'react';
import {
  ShieldAlert,
  Building2,
  Stethoscope,
  Link,
  LogOut,
  Sparkles,
  Mail,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Language, PatientProfile } from '../types';

interface UnlinkedPatientLandingProps {
  currentLang: Language;
  patient: PatientProfile;
  onLinkHospitalDemo: () => void;
  onLogout: () => void;
}

export const UnlinkedPatientLanding: React.FC<UnlinkedPatientLandingProps> = ({
  currentLang,
  patient,
  onLinkHospitalDemo,
  onLogout,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  // Multi-language Unlinked Notice Messages
  const getUnlinkedTitle = () => {
    switch (currentLang) {
      case 'ar':
        return 'لا يوجد طبيب أو مستشفى مرتبط بحسابك حالياً';
      case 'ur':
        return 'فی الحال آپ کے اکاؤنٹ سے کوئی ڈاکٹر یا ہسپتال منسلک نہیں ہے';
      case 'tl':
        return 'Walang Nakakonektang Doktor o Ospital sa Iyong Account sa Kasalukuyan';
      case 'en':
      default:
        return 'No Doctors or Hospitals Currently Linked to Your Account';
    }
  };

  const getUnlinkedDesc = () => {
    switch (currentLang) {
      case 'ar':
        return 'لكي تظهر أدويتك وخطة التعافي الخاصة بك، يرجى تزويد الطبيب المعالج في المستشفى ببريدك الإلكتروني المسجل ورقم الهوية الوطنية أو جواز السفر لربط ملفك الطبي بنجاح.';
      case 'ur':
        return 'اپنی ادویات اور بحالی کا پلان دیکھنے کے لیے، براہ کرم ہسپتال میں اپنے علاج کرنے والے ڈاکٹر کو اپنا رجسٹرڈ ای میل اور قومی شناختی کارڈ يا پاسپورٹ نمبر فراہم کریں۔';
      case 'tl':
        return 'Upang lumabas ang iyong mga gamot at plano sa paggaling, pakibigay sa iyong doktor sa ospital ang iyong nakarehistrong email at National ID o Passport ID upang mai-link ang iyong medikal na rekord.';
      case 'en':
      default:
        return 'To populate your prescriptions and recovery roadmap, provide your registered email address and official National ID or Passport ID to your attending doctor at the hospital during discharge.';
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-5 my-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Unlinked Notice Header Graphic */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              <span>Unlinked Account Status</span>
            </span>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {getUnlinkedTitle()}
            </h2>

            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
              {getUnlinkedDesc()}
            </p>
          </div>
        </div>

        {/* Account Linking Instructions Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-1.5">
            <Link className="w-3.5 h-3.5 text-teal-600" />
            <span>How Account Linking Works</span>
          </div>

          <ul className="space-y-2 text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>
                Give your registered email (<strong className="font-mono text-teal-900">{patient.email || 'patient email'}</strong>) and National ID / Passport ID to your doctor.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>
                Your doctor enters these credentials in the hospital system to pair your medical file with your account.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>
                Your medication timeline, browser alarms, and discharge roadmap will activate automatically.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Demo Button to Pair Care Plan */}
          <button
            onClick={onLinkHospitalDemo}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Simulate Hospital Doctor Account Pairing (Demo Link)</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
