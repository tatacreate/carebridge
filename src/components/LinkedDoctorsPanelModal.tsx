import React from 'react';
import {
  Stethoscope,
  X,
  CheckCircle2,
  Building2,
  PhoneCall,
  Calendar,
  ShieldCheck,
  User,
  ArrowRight,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { Language, LinkedDoctor, PatientProfile } from '../types';

interface LinkedDoctorsPanelModalProps {
  currentLang: Language;
  patient: PatientProfile;
  onSelectActiveDoctor: (docId: string) => void;
  onClose: () => void;
}

export const LinkedDoctorsPanelModal: React.FC<LinkedDoctorsPanelModalProps> = ({
  currentLang,
  patient,
  onSelectActiveDoctor,
  onClose,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  const doctorsList: LinkedDoctor[] = patient.linkedDoctors && patient.linkedDoctors.length > 0
    ? patient.linkedDoctors
    : [
        {
          id: 'doc-1',
          name: patient.doctorName || 'Attending Physician',
          title: 'Senior Surgical Consultant',
          hospital: patient.hospitalName || 'King Faisal Specialist Hospital & Research Centre',
          department: 'General Surgery & Post-Op Recovery',
          phone: patient.doctorPhone || '+966 11 464 7272',
          linkedAt: patient.dischargeDate || '2026-09-18',
          isPrimary: true,
          carePlanSummary: 'Post-Cholecystectomy 14-Day Wound & Pain Management Directive',
        },
      ];

  const activeDocId = patient.activeDoctorId || doctorsList[0]?.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-3 sm:space-y-4 p-4 sm:p-6 my-auto max-h-[94vh] landscape:max-h-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {isRtl ? 'الأطباء المرتبطون بحسابك (Doctors Linked To You)' : 'Doctors Linked To You'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Hospital attending physicians managing your active care plans
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Account Link Banner */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-teal-700 block">Verified Patient Link</span>
            <div className="font-extrabold text-slate-900 font-mono">
              Email: {patient.email || 'Registered Patient'} • ID: {patient.nationalIdOrPassport || 'Official Medical ID'}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Hospital Sync</span>
          </span>
        </div>

        {/* List of Connected Doctors */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {doctorsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                className={`p-5 rounded-3xl border transition ${
                  isActive
                    ? 'bg-teal-50/70 border-teal-400/80 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base">{doc.name}</h4>
                      {doc.isPrimary && (
                        <span className="px-2 py-0.5 rounded bg-teal-800 text-white font-extrabold text-[10px]">
                          Primary Attending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-teal-800 font-bold mt-0.5">{doc.title}</p>
                  </div>

                  <button
                    onClick={() => onSelectActiveDoctor(doc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />
                        <span>Active Care Plan View</span>
                      </>
                    ) : (
                      <span>Select Care Plan</span>
                    )}
                  </button>
                </div>

                {/* Doctor Details Grid */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-800">{doc.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2 bg-white p-2.5 rounded-xl border border-slate-200/60 mt-1">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-medium text-slate-800">{doc.carePlanSummary}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
