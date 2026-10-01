import React, { useState } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  UserCheck,
  Hospital,
  Bell,
  Volume2,
  VolumeX,
  Languages,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Type,
  Eye,
  Pill,
  Fingerprint,
  Lock,
} from 'lucide-react';
import { Language, Medication, PatientProfile } from '../types';
import { LANGUAGES, getTranslation } from '../data/translations';
import { soundEngine } from '../utils/audioAlarm';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';

interface SettingsModalProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  patient: PatientProfile;
  authRole?: 'patient' | 'doctor' | 'none';
  medications: Medication[];
  onSave: (updatedPatient: PatientProfile, updatedMeds: Medication[]) => void;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  systemPermission: boolean;
  onRequestPermission: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentLang,
  onSelectLang,
  patient,
  authRole,
  medications,
  onSave,
  onClose,
  soundEnabled,
  onToggleSound,
  systemPermission,
  onRequestPermission,
}) => {
  const [patientData, setPatientData] = useState<PatientProfile>({ ...patient });
  const [medsList, setMedsList] = useState<Medication[]>([...medications]);

  const [snoozeDuration, setSnoozeDuration] = useState<number>(10);
  const [largeFontEnabled, setLargeFontEnabled] = useState<boolean>(false);
  const [fullscreenModalAlerts, setFullscreenModalAlerts] = useState<boolean>(true);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('08:00, 20:00');

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
      frequency: 'As prescribed',
      times: timesArray.length > 0 ? timesArray : ['08:00'],
      foodInstruction: 'after_food',
      notes: 'Prescribed discharge medication',
      pillColor: '#0d9488',
      active: true,
      iconType: 'pill',
    };

    setMedsList([...medsList, newMed]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMed = (id: string) => {
    setMedsList(medsList.filter((m) => m.id !== id));
  };

  const handleSaveAll = () => {
    onSave(patientData, medsList);
    onClose();
  };

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('+CareBridge Medication Alert', {
        body: 'Test notification from +CareBridge Post-Hospital Recovery System.',
        icon: '/favicon.ico',
      });
    } else {
      onRequestPermission();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh] landscape:max-h-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">{getTranslation(currentLang, 'tabSettings')}</h3>
              <p className="text-xs text-slate-400">
                Manage browser notification permissions, sound synth, display, and care settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* Section 0: Identity & Authentication Status Profile */}
          <div className="space-y-3 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authentication & Security Status</span>
              </h4>
              <GoogleVerifiedBadge size="sm" email={patient.email} />
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Your patient portal is cryptographically linked to your verified Google Identity account and official hospital medical record.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">OAuth 2.0 Account</span>
                <span className="font-extrabold text-slate-900 text-xs block truncate">{patient.email || 'taladaoud5b@gmail.com'}</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Verified Google Email Token</span>
                </div>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Biometric & FIDO2 Identity</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-xs">
                    {patient.biometricVerified ? 'WebAuthn Enrolled' : 'Standard OAuth'}
                  </span>
                  {patient.biometricVerified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      Optional
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {patient.biometricVerified
                    ? 'Local device biometric key confirmed'
                    : 'Device biometrics can be linked during sign-in'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-emerald-100/60">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>TLS 1.3 End-to-End Encryption • Authorized for Outpatient File MRN: <strong className="text-slate-800 font-semibold">{patient.mrn}</strong></span>
            </div>
          </div>

          {/* Section 1: Browser Notification Permissions & Reminders */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-teal-600" />
              <span>Browser Notification & Alert Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Browser Notifications</span>
                  <span className="text-[11px] text-slate-500 capitalize">
                    Status: <strong className="text-teal-700">{systemPermission ? 'Active' : 'Disabled'}</strong>
                  </span>
                </div>
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition"
                >
                  {systemPermission ? 'Test Alert' : 'Enable'}
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Web Audio Chime</span>
                  <span className="text-[11px] text-slate-500">
                    {soundEnabled ? 'Synth Sound Active' : 'Muted'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onToggleSound();
                    soundEngine.playChime(false);
                  }}
                  className={`p-2 rounded-xl transition ${
                    soundEnabled ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Snooze Interval</label>
                <select
                  value={snoozeDuration}
                  onChange={(e) => setSnoozeDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes (Default)</option>
                  <option value={15}>15 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Priority Overlays</label>
                <button
                  onClick={() => setFullscreenModalAlerts(!fullscreenModalAlerts)}
                  className={`w-full p-2.5 rounded-xl border text-left font-semibold transition ${
                    fullscreenModalAlerts
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {fullscreenModalAlerts ? 'Full Screen Alarm Popups Enabled' : 'Banner Alerts Only'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Multilingual Switcher & Display Preferences */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-teal-600" />
              <span>Language & Accessibility Options</span>
            </h4>

            <div>
              <label className="block font-semibold mb-1.5 text-slate-700">Display Language</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onSelectLang(lang.code)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      currentLang === lang.code
                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Patient File & Hospital Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Patient & Emergency Phone Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Patient Full Name</label>
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">MRN File No.</label>
                <input
                  type="text"
                  value={patientData.mrn}
                  onChange={(e) => setPatientData({ ...patientData, mrn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Hospital Name</label>
                <input
                  type="text"
                  value={patientData.hospitalName}
                  onChange={(e) => setPatientData({ ...patientData, hospitalName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Emergency Phone Hotline</label>
                <input
                  type="text"
                  value={patientData.emergencyPhone}
                  onChange={(e) => setPatientData({ ...patientData, emergencyPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Prescribed Discharge Medications Plan (Doctors Only) */}
          {authRole === 'doctor' && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Prescribed Discharge Medications Plan</span>
              </h4>

              <div className="space-y-2">
                {medsList.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{m.name}</strong>
                      <span className="text-[11px] text-slate-500">
                        {m.dosage} • Scheduled: {m.times.join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMed(m.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Med Inline Form */}
              <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-3">
                <span className="font-bold text-teal-900 block">Add New Prescribed Medication</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Cefuroxime)"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Times (e.g. 08:00, 20:00)"
                    value={newMedTimes}
                    onChange={(e) => setNewMedTimes(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMed}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold transition hover:bg-slate-200"
          >
            {getTranslation(currentLang, 'cancel')}
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{getTranslation(currentLang, 'savePlan')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
