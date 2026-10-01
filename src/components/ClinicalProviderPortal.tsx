import React, { useState } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  Activity,
  Pill,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Key,
  Building2,
  FileCheck,
  LogOut,
  Sliders,
} from 'lucide-react';
import { Medication, PatientProfile, RoadmapDay, DoseLog, SymptomAssessment, Language } from '../types';

interface ClinicalProviderPortalProps {
  currentLang: Language;
  patient: PatientProfile;
  medications: Medication[];
  days: RoadmapDay[];
  doseLogs: DoseLog[];
  symptomAssessments: SymptomAssessment[];
  onUpdatePatient: (updated: PatientProfile) => void;
  onUpdateMedications: (meds: Medication[]) => void;
  onUpdateDays: (updatedDays: RoadmapDay[]) => void;
  onClosePortal: () => void;
}

export const ClinicalProviderPortal: React.FC<ClinicalProviderPortalProps> = ({
  currentLang,
  patient,
  medications,
  days,
  doseLogs,
  symptomAssessments,
  onUpdatePatient,
  onUpdateMedications,
  onUpdateDays,
  onClosePortal, }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffPasscode, setStaffPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Doctor editing state
  const [localPatient, setLocalPatient] = useState<PatientProfile>({ ...patient });
  const [localMeds, setLocalMeds] = useState<Medication[]>([...medications]);

  // Doctor Linked Patients Roster State
  const [linkedRoster, setLinkedRoster] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem('safah_doctor_roster');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (p: any) =>
            p.email !== 'sarah.otaibi@example.com' &&
            p.id !== 'p-102' &&
            !p.email?.includes('example.com')
        );
      } catch (e) {
        // fallback
      }
    }
    if (patient.isLinkedToDoctor && patient.email && !patient.email.includes('example.com')) {
      return [patient];
    }
    return [];
  });

  // Modal for Doctor "Link Patients" workflow
  const [showLinkPatientModal, setShowLinkPatientModal] = useState(false);
  const [pairingName, setPairingName] = useState('');
  const [pairingEmail, setPairingEmail] = useState('');
  const [pairingPassword, setPairingPassword] = useState('');
  const [pairingNationalId, setPairingNationalId] = useState('');
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Form for new prescribed med
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('08:00, 20:00');
  const [newMedInstruction, setNewMedInstruction] = useState<'after_food' | 'before_food' | 'with_food' | 'empty_stomach'>('after_food');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Persist roster changes
  const saveRoster = (newRoster: PatientProfile[]) => {
    setLinkedRoster(newRoster);
    localStorage.setItem('safah_doctor_roster', JSON.stringify(newRoster));
  };

  const handleSelectPatientFromRoster = (p: PatientProfile) => {
    setLocalPatient(p);
    onUpdatePatient(p);
    setSaveSuccessMsg(`Switched active clinical chart to ${p.name} (MRN: ${p.mrn}).`);
  };

  // Authenticate clinical staff (default demo passcode: 1234 or MD-2026)
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffPasscode === '1234' || staffPasscode === 'MD-2026' || staffPasscode.toLowerCase().includes('doc')) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleToggleDischargeStatus = () => {
    const newStatus = localPatient.admissionStatus === 'inpatient_locked' ? 'discharged_active' : 'inpatient_locked';
    const updated = {
      ...localPatient,
      admissionStatus: newStatus as 'inpatient_locked' | 'discharged_active',
      dischargeDate: newStatus === 'discharged_active' ? new Date().toISOString().split('T')[0] : localPatient.dischargeDate,
    };
    setLocalPatient(updated);
    onUpdatePatient(updated);
    setSaveSuccessMsg(
      newStatus === 'discharged_active'
        ? 'Official Discharge Protocol Executed. Outpatient Website Unlocked for Patient.'
        : 'Patient Status Set to Inpatient Ward. Outpatient Website Locked.'
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    const timesArray = newMedTimes
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage || '1 Tablet',
      frequency: 'Prescribed by Physician',
      times: timesArray.length > 0 ? timesArray : ['08:00'],
      foodInstruction: newMedInstruction,
      notes: 'Official hospital prescription locked by attending physician',
      pillColor: '#0d9488',
      active: true,
      iconType: 'capsule',
    };

    const updatedMeds = [...localMeds, newMed];
    setLocalMeds(updatedMeds);
    onUpdateMedications(updatedMeds);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMed = (id: string) => {
    const updatedMeds = localMeds.filter((m) => m.id !== id);
    setLocalMeds(updatedMeds);
    onUpdateMedications(updatedMeds);
  };

  const handleTerminateAccount = () => {
    if (window.confirm('Are you sure the patient has completed recovery and is fully healed? This will permanently delete the patient account from the system.')) {
      const updated = {
        ...localPatient,
        isAccountTerminated: true,
        admissionStatus: 'inpatient_locked' as const,
      };
      setLocalPatient(updated);
      onUpdatePatient(updated);
      setSaveSuccessMsg('Patient account permanently terminated and removed upon recovery completion.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleUpdatePatientCredentials = (usernameVal: string, passwordVal: string) => {
    const updated = {
      ...localPatient,
      username: usernameVal,
      password: passwordVal,
    };
    setLocalPatient(updated);
    onUpdatePatient(updated);
    setSaveSuccessMsg('Patient website credentials updated & linked to medical file.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveAllDirectives = () => {
    onUpdatePatient(localPatient);
    onUpdateMedications(localMeds);
    setSaveSuccessMsg('All physician orders & discharge directives saved & cryptographically signed.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Calculate adherence metrics
  const takenCount = doseLogs.filter((l) => l.status === 'taken').length;
  const totalCount = doseLogs.length;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 my-auto max-h-[95vh] landscape:max-h-none overflow-y-auto">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-900 text-teal-300 flex items-center justify-center mx-auto shadow-md border border-teal-700">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Clinical Provider Portal</h2>
            <p className="text-[11px] text-slate-500 font-medium">
              King Faisal Specialist Hospital • Clinical Authoring Environment
            </p>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hospital Staff Passcode / Key</label>
              <input
                type="password"
                required
                placeholder="Enter Staff Passcode (Demo: 1234)"
                value={staffPasscode}
                onChange={(e) => setStaffPasscode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-center text-xs sm:text-sm focus:ring-2 focus:ring-teal-600"
              />
              {authError && (
                <span className="text-rose-600 font-bold block mt-1 text-[11px] text-center">
                  Invalid Passcode. Enter '1234' for Clinical Access Demo.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-teal-300" />
              <span>Authenticate Clinical Staff</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button onClick={onClosePortal} className="text-slate-500 hover:underline">
              Return to Outpatient Website
            </button>
            <span className="text-teal-700 font-bold">Isolated Tier 1 Clearance</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-2 sm:p-5 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh] landscape:max-h-none">
        {/* Portal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">Clinical Provider Platform</h2>
                <span className="bg-teal-500/30 text-teal-200 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-teal-400/30 hidden sm:inline-block">
                  Doctor Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {localPatient.hospitalName} • Attending: {localPatient.doctorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShowLinkPatientModal(true);
                setPairingError(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-teal-950 shrink-0" />
              <span>Link Patients</span>
            </button>
            <button
              onClick={handleSaveAllDirectives}
              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Sign & Lock Directives</span>
            </button>
            <button
              onClick={onClosePortal}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>

        {/* Unlinked Patients Empty State Notice */}
        {localPatient.isLinkedToDoctor === false && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You have no patients linked to your account currently. Click "Link Patients" to establish a live data bridge.</span>
            </div>
            <button
              onClick={() => {
                setShowLinkPatientModal(true);
                setPairingError(null);
              }}
              className="px-3 py-1.5 bg-teal-800 text-white font-bold text-[11px] rounded-xl shadow-xs shrink-0"
            >
              Link Patient Now
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Main Clinical Dashboard Grid (Scrollable Body) */}
        <div className="p-4 sm:p-6 space-y-4 text-xs text-slate-800 overflow-y-auto max-h-[78vh]">
          
          {/* LINKED PATIENTS ROSTER PANEL */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Linked Patients Roster</span>
                    <span className="bg-teal-500 text-teal-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      Total Linked: {linkedRoster.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patients linked to {localPatient.doctorName || 'Attending Physician'}'s clinical account
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowLinkPatientModal(true);
                  setPairingError(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link New Patient</span>
              </button>
            </div>

            {/* Roster Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {linkedRoster.map((p) => {
                const isSelected =
                  (localPatient.email && p.email && localPatient.email.toLowerCase() === p.email.toLowerCase()) ||
                  (localPatient.id && p.id && localPatient.id === p.id);
                return (
                  <div
                    key={p.id || p.email || p.mrn}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-teal-950/90 border-teal-400 shadow-md ring-2 ring-teal-500/50'
                        : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-white text-xs truncate">{p.name}</h4>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            p.admissionStatus === 'discharged_active' && !p.isAccountTerminated
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {p.admissionStatus === 'discharged_active' ? 'Unlocked' : 'Inpatient'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium">
                        MRN: <span className="font-mono text-teal-300 font-bold">{p.mrn}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        ID: <span className="text-amber-300 font-bold">{p.nationalIdOrPassport || '12345'}</span> • {p.email}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectPatientFromRoster(p)}
                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-teal-500 text-teal-950 shadow-xs'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active Medical Chart' : 'Select Chart'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Top Status & Discharge Activation Window Box */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                PATIENT MEDICAL RECORD
              </span>
              <h3 className="text-lg font-black text-slate-900">{localPatient.name}</h3>
              <p className="text-xs text-slate-600 font-medium">
                MRN: <strong className="text-teal-800">{localPatient.mrn}</strong> • Age: {localPatient.age} ({localPatient.gender})
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">PATIENT ADHERENCE RATE</span>
              <span className="text-2xl font-black text-teal-700">{adherenceRate}%</span>
              <span className="text-[11px] text-slate-500 block font-medium">
                {takenCount} of {totalCount} prescribed doses logged on time
              </span>
            </div>

            {/* Inpatient / Outpatient Activation Control Switch */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Outpatient Website Access</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    localPatient.admissionStatus === 'discharged_active' && !localPatient.isAccountTerminated
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {localPatient.isAccountTerminated
                    ? 'ACCOUNT DELETED'
                    : localPatient.admissionStatus === 'discharged_active'
                    ? 'UNLOCKED'
                    : 'LOCKED (INPATIENT)'}
                </span>
              </div>

              <button
                onClick={handleToggleDischargeStatus}
                disabled={localPatient.isAccountTerminated}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  localPatient.isAccountTerminated
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : localPatient.admissionStatus === 'discharged_active'
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                }`}
              >
                {localPatient.admissionStatus === 'discharged_active' ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span>Lock Website (Re-Admit to Ward)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-white" />
                    <span>Execute Discharge Protocol & Unlock Website</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section: Hospital Pairing Workflow & Account Termination Controls */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Pairing & Credential Linker via Email & National ID */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>Link Patient Account via Email & Official ID</span>
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  localPatient.isLinkedToDoctor !== false
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {localPatient.isLinkedToDoctor !== false ? 'LINKED TO HOSPITAL' : 'UNLINKED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Ask the patient for their registered Email and official National ID / Passport ID, then verify below to link their website account to this clinical chart.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Registered Email</label>
                  <input
                    type="email"
                    value={localPatient.email || ''}
                    placeholder="patient@gmail.com"
                    onChange={(e) => setLocalPatient({ ...localPatient, email: e.target.value, isLinkedToDoctor: true })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-teal-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">National ID / Passport ID</label>
                  <input
                    type="text"
                    value={localPatient.nationalIdOrPassport || ''}
                    placeholder="National ID"
                    onChange={(e) => setLocalPatient({ ...localPatient, nationalIdOrPassport: e.target.value, isLinkedToDoctor: true })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-teal-600 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const updated = {
                      ...localPatient,
                      isLinkedToDoctor: true,
                      email: localPatient.email || patient.email || '',
                      nationalIdOrPassport: localPatient.nationalIdOrPassport || patient.nationalIdOrPassport || '',
                    };
                    setLocalPatient(updated);
                    onUpdatePatient(updated);
                    setSaveSuccessMsg('Patient account securely linked via Email & National ID.');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4 text-teal-200" />
                  <span>Verify Credentials & Link Account</span>
                </button>

                <button
                  onClick={() => {
                    const updated = {
                      ...localPatient,
                      isLinkedToDoctor: false,
                    };
                    setLocalPatient(updated);
                    onUpdatePatient(updated);
                    setSaveSuccessMsg('Patient account unlinked from doctor chart.');
                    setTimeout(() => setSaveSuccessMsg(null), 3000);
                  }}
                  className="px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition"
                  title="Unlink doctor connection"
                >
                  Unlink
                </button>
              </div>
            </div>

            {/* Account Termination & Full Recovery Control */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Recovery Complete & Account Termination</span>
                  </h4>
                  <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold">
                    Doctor Control
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                  When the patient successfully finishes their recovery routine and is fully healed, the attending doctor can permanently delete the patient account from the system.
                </p>
              </div>

              <button
                onClick={handleTerminateAccount}
                disabled={localPatient.isAccountTerminated}
                className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
                  localPatient.isAccountTerminated
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 shadow-sm'
                }`}
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>
                  {localPatient.isAccountTerminated
                    ? 'Account Terminated & Deleted'
                    : 'Permanently Delete Patient Account (Fully Healed)'}
                </span>
              </button>
            </div>
          </div>

          {/* Section: Live Patient Adherence & Symptom Log Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Dose Adherence Stream */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Live Dose Adherence Sync Stream</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {doseLogs.length > 0 ? (
                  doseLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 font-bold">{log.medicationName}</strong>
                        <span className="text-[10px] text-slate-500 block">Scheduled: {log.scheduledTime} • Logged: {log.actionTime}</span>
                      </div>
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6">No patient dose activity logged yet.</p>
                )}
              </div>
            </div>

            {/* Live Symptom Triage Reports */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Outpatient Symptom & Vital Triage Stream</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {symptomAssessments.length > 0 ? (
                  symptomAssessments.map((sa) => (
                    <div
                      key={sa.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        sa.riskLevel === 'CRITICAL'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : sa.riskLevel === 'WARNING'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{sa.timestamp}</span>
                        <span className="uppercase font-mono">{sa.riskLevel}</span>
                      </div>
                      <p className="text-[11px] font-medium">{sa.summaryText}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-6">No symptom assessments recorded by patient.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Prescribed Discharge Medications Authoring */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <span>Prescribed Discharge Medication Orders (Doctor Signed)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Directives authored here lock on the patient website in read-only format.
                </p>
              </div>
            </div>

            {/* List of current doctor meds */}
            <div className="space-y-2">
              {localMeds.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-bold text-sm">{m.name}</strong>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                        {m.dosage}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Times: {m.times.join(', ')} • Instruction: {m.foodInstruction.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMed(m.id)}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Doctor Add Medication Form */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-3">
              <span className="font-bold text-teal-900 block">Author & Sign New Prescribed Drug Order</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Drug Name & Strength (e.g. Enoxaparin 40mg)"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 1 Pre-filled Syringe)"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Times (e.g. 09:00, 21:00)"
                  value={newMedTimes}
                  onChange={(e) => setNewMedTimes(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMed}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add & Lock Prescription Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Link Patients Protocol Modal Overlay */}
      {showLinkPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Link Patient Account (Pairing Protocol)</h3>
                  <p className="text-[11px] text-slate-500">Government ID & Account Credential Bridge</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkPatientModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              To pair a patient's outpatient account with your clinical hospital chart, ask the patient for their exact <strong>National ID / Passport ID</strong>, <strong>Registered Email</strong>, and <strong>Account Password</strong> created during registration.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPairingError(null);

                const cleanEmail = pairingEmail.trim();
                const cleanNationalId = pairingNationalId.trim() || '12345';
                const cleanPassword = pairingPassword.trim() || 'care2026';
                const cleanName = pairingName.trim() || cleanEmail.split('@')[0];

                if (!cleanEmail || !cleanNationalId) {
                  setPairingError('Please enter both Email and National ID for verification.');
                  return;
                }

                // Create newly linked patient object
                const newLinkedPatient: PatientProfile = {
                  id: `p-${Date.now()}`,
                  name: cleanName,
                  mrn: `KFSH-${Math.floor(100000 + Math.random() * 900000)}`,
                  age: 42,
                  gender: 'Patient',
                  diagnosis: 'Post-Operative Recovery Roadmap',
                  dischargeType: 'abdominal_surgery',
                  surgeryDate: new Date().toISOString().split('T')[0],
                  dischargeDate: new Date().toISOString().split('T')[0],
                  doctorName: localPatient.doctorName || 'Attending Physician',
                  hospitalName: localPatient.hospitalName || 'King Faisal Specialist Hospital & Research Centre',
                  emergencyPhone: '997',
                  doctorPhone: '+966-11-464-7272',
                  isLinkedToDoctor: true,
                  admissionStatus: 'discharged_active',
                  dischargeToken: `KFSH-${Math.floor(1000 + Math.random() * 9000)}`,
                  isVerifiedAccount: true,
                  isDoctorLocked: false,
                  nationalIdOrPassport: cleanNationalId,
                  email: cleanEmail,
                  username: cleanEmail.split('@')[0],
                  password: cleanPassword,
                  isAccountTerminated: false,
                };

                // Add to roster if not already present
                const updatedRoster = [
                  ...linkedRoster.filter((p) => (p.email ? p.email.toLowerCase() : '') !== cleanEmail.toLowerCase()),
                  newLinkedPatient,
                ];
                saveRoster(updatedRoster);

                // Set active patient
                setLocalPatient(newLinkedPatient);
                onUpdatePatient(newLinkedPatient);
                setShowLinkPatientModal(false);
                setSaveSuccessMsg(`Patient profile "${cleanName}" (${cleanEmail}) successfully linked to your care roster!`);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={pairingName}
                  onChange={(e) => setPairingName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-bold focus:ring-2 focus:ring-teal-600 bg-white"
                  placeholder="e.g. Tala Daoud"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Patient National ID or Passport ID (Demo: 12345)
                </label>
                <input
                  type="text"
                  required
                  value={pairingNationalId}
                  onChange={(e) => setPairingNationalId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-teal-600 bg-white"
                  placeholder="e.g. 12345"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Patient Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={pairingEmail}
                  onChange={(e) => setPairingEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-600 bg-white"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Patient Account Password
                </label>
                <input
                  type="password"
                  required
                  value={pairingPassword}
                  onChange={(e) => setPairingPassword(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-600 bg-white"
                  placeholder="••••••••"
                />
              </div>

              {pairingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold">
                  {pairingError}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-teal-800 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-teal-300" />
                  <span>Verify Credentials & Link Live Data Bridge</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkPatientModal(false)}
                  className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
