import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Bell,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Send,
  Share2,
  MessageSquare,
  AlertTriangle,
  Heart,
  Smartphone,
} from 'lucide-react';
import { Language, PatientProfile } from '../types';
import { getTranslation } from '../data/translations';

interface CaregiverContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notifyOnMissedDose: boolean;
  notifyOnCriticalSymptoms: boolean;
  isPrimary: boolean;
  verified: boolean;
}

interface FamilySyncProps {
  currentLang: Language;
  patient: PatientProfile;
}

export const FamilySync: React.FC<FamilySyncProps> = ({ currentLang, patient }) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';

  const [caregivers, setCaregivers] = useState<CaregiverContact[]>(() => {
    const saved = localStorage.getItem('safah_caregivers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (c: any) => !c.email?.includes('example.com') && !c.name?.includes('Al-Mansoor')
        );
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('safah_caregivers', JSON.stringify(caregivers));
    } catch (e) {}
  }, [caregivers]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRel, setNewRel] = useState('Spouse');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotifyMissed, setNewNotifyMissed] = useState(true);
  const [newNotifyCritical, setNewNotifyCritical] = useState(true);
  const [alertSentMessage, setAlertSentMessage] = useState<string | null>(null);

  const handleAddCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newCg: CaregiverContact = {
      id: `cg-${Date.now()}`,
      name: newName,
      relationship: newRel,
      phone: newPhone,
      email: newEmail,
      notifyOnMissedDose: newNotifyMissed,
      notifyOnCriticalSymptoms: newNotifyCritical,
      isPrimary: caregivers.length === 0,
      verified: true,
    };

    setCaregivers([...caregivers, newCg]);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    setCaregivers(caregivers.filter((c) => c.id !== id));
  };

  const handleToggleNotifyMissed = (id: string) => {
    setCaregivers(
      caregivers.map((c) => (c.id === id ? { ...c, notifyOnMissedDose: !c.notifyOnMissedDose } : c))
    );
  };

  const handleSendTestSyncAlert = (caregiverName: string, phone: string) => {
    const text = encodeURIComponent(
      `[+CareBridge Family Alert] Hello ${caregiverName}, you are synced as a caregiver for ${patient.name} (MRN: ${patient.mrn}). You will receive instant notifications for missed doses and recovery milestone updates.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone.replace(/\s+/g, '')}&text=${text}`, '_blank');
    setAlertSentMessage(`Test WhatsApp sync message opened for ${caregiverName}`);
    setTimeout(() => setAlertSentMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-teal-300" />
              <span>Caregiver & Family Sync Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isRtl ? 'ربط المرافقين والعائلة' : 'Family & Caregiver Sync Network'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl font-medium leading-relaxed">
              Link family members and caregivers to receive automated WhatsApp/SMS alerts for missed medication doses or critical post-op symptom warnings.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Link New Caregiver</span>
          </button>
        </div>
      </div>

      {/* Alert Banner Notification */}
      {alertSentMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertSentMessage}</span>
        </div>
      )}

      {/* Grid of Linked Family Caregivers */}
      {caregivers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">
              {isRtl ? 'لم تتم إضافة أفراد عائلة بعد' : 'No Family Caregivers Linked Yet'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isRtl
                ? 'أضف أفراد عائلتك أو مقدمي الرعاية لتلقي تنبيهات بالجرعات الفائتة وتحديثات التعافي مباشرة.'
                : 'Add trusted family members or caregivers to receive instant missed dose alerts and recovery updates.'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة فرد من العائلة' : 'Add Family Caregiver'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-lg shadow-inner">
                      {cg.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{cg.name}</h3>
                        {cg.isPrimary && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{cg.relationship}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(cg.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono font-medium">{cg.phone}</span>
                  </div>
                  {cg.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono font-medium text-slate-600">{cg.email}</span>
                    </div>
                  )}
                </div>

                {/* Alert Preferences Switches */}
                <div className="pt-2 space-y-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-600" />
                      <span>Missed Dose Alerts</span>
                    </span>
                    <button
                      onClick={() => handleToggleNotifyMissed(cg.id)}
                      className={`px-3 py-1 rounded-full font-bold text-[11px] transition ${
                        cg.notifyOnMissedDose
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cg.notifyOnMissedDose ? 'Active' : 'Off'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Critical Symptom Warnings</span>
                    </span>
                    <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
                      Always On
                    </span>
                  </div>
                </div>
              </div>

              {/* Test WhatsApp Sync Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleSendTestSyncAlert(cg.name, cg.phone)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Test WhatsApp Caregiver Sync</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Caregiver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <span>Link Caregiver or Family Member</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCaregiver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maryam (Family Member)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newRel}
                    onChange={(e) => setNewRel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Home Nurse">Home Nurse</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+966 50 000 0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="caregiver@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotifyMissed}
                    onChange={(e) => setNewNotifyMissed(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Send WhatsApp alert if a dose is missed by 30 mins</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotifyCritical}
                    onChange={(e) => setNewNotifyCritical(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Send alert if critical symptoms or high fever are logged</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
                >
                  Link Caregiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
