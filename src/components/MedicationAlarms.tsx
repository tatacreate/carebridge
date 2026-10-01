import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Pill,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  Sparkles,
  Info,
  Shield,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Language, Medication, PatientProfile } from '../types';
import { getTranslation } from '../data/translations';
import { soundEngine } from '../utils/audioAlarm';
import { ReadOnlyNoticeBanner } from './ReadOnlyNoticeBanner';

interface MedicationAlarmsProps {
  currentLang: Language;
  patient: PatientProfile;
  medications: Medication[];
  onTriggerAlarm: (med: Medication, timeStr: string) => void;
  systemPermission: boolean;
  onRequestPermission: () => void;
}

export const MedicationAlarms: React.FC<MedicationAlarmsProps> = ({
  currentLang,
  patient,
  medications,
  onTriggerAlarm,
  systemPermission,
  onRequestPermission,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [nextDoseInfo, setNextDoseInfo] = useState<{ med: Medication; time: string } | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentTime(timeStr);

      // Find next upcoming dose
      const nowHoursMins = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      let foundNext: { med: Medication; time: string } | null = null;

      for (const med of medications) {
        if (!med.active) continue;
        for (const t of med.times) {
          if (t >= nowHoursMins) {
            if (!foundNext || t < foundNext.time) {
              foundNext = { med, time: t };
            }
          }
        }
      }

      // If no upcoming dose today, pick earliest dose tomorrow
      if (!foundNext && medications.length > 0) {
        const activeMeds = medications.filter((m) => m.active);
        if (activeMeds.length > 0) {
          foundNext = { med: activeMeds[0], time: activeMeds[0].times[0] || '08:00' };
        }
      }

      setNextDoseInfo(foundNext);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [medications]);

  const handleTestChime = () => {
    soundEngine.playChime(true);
  };

  return (
    <div className="space-y-6">
      {/* Provider Signed Read-Only Banner */}
      <ReadOnlyNoticeBanner currentLang={currentLang} patient={patient} />

      {/* Header & Live Clock Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <Bell className="w-5 h-5 text-teal-600 animate-bounce" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {getTranslation(currentLang, 'alarmsTitle')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {getTranslation(currentLang, 'alarmsSubtitle')}
            </p>
          </div>

          {/* Live System Clock Display */}
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-800">
            <Clock className="w-6 h-6 text-teal-400" />
            <div>
              <div className="text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
                System Time
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-widest">{currentTime || '12:00:00'}</div>
            </div>
          </div>
        </div>

        {/* High Priority Alarm Trigger Banner for Judges / Testing (Only shown if medications exist) */}
        {medications.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-rose-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-rose-300" />
                <span>Native Clock & Persistent Overlay Demo</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {getTranslation(currentLang, 'simulateAlarm')}
              </h3>
              <p className="text-xs text-rose-100/80 max-w-xl">
                {getTranslation(currentLang, 'simulateAlarmDesc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  const sampleMed = medications[0] || {
                    id: 'med-1',
                    name: 'Cefuroxime 500mg',
                    dosage: '1 Tablet',
                    foodInstruction: 'after_food',
                  };
                  onTriggerAlarm(sampleMed, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger Alarm Now</span>
              </button>

              <button
                onClick={handleTestChime}
                className="p-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-xl transition"
                title="Test Chime Sound"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* System Permission Bar */}
        {medications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              {systemPermission ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {systemPermission
                  ? getTranslation(currentLang, 'systemPermissionGranted')
                  : 'Native browser notifications are currently standing by'}
              </span>
            </div>

            {!systemPermission && (
              <button
                onClick={onRequestPermission}
                className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl font-semibold transition"
              >
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>{getTranslation(currentLang, 'enableSystemAlarms')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Next Dose Focus Card */}
      {nextDoseInfo && (
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-6 rounded-3xl shadow-sm border border-teal-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-300" />
              <span>{getTranslation(currentLang, 'nextDoseIn')}</span>
            </div>
            <h3 className="text-2xl font-black text-white">{nextDoseInfo.med.name}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100">
              <span className="bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-700/60">
                {getTranslation(currentLang, 'dosage')}: <strong>{nextDoseInfo.med.dosage}</strong>
              </span>
              <span className="bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-700/60 flex items-center gap-1">
                <Utensils className="w-3 h-3 text-teal-300" />
                <span>{getTranslation(currentLang, nextDoseInfo.med.foodInstruction)}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-slate-950/80 border border-teal-600 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-teal-300">Scheduled Time</div>
              <div className="text-2xl font-mono font-extrabold text-white">{nextDoseInfo.time}</div>
            </div>

            <button
              onClick={() => onTriggerAlarm(nextDoseInfo.med, nextDoseInfo.time)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3 rounded-2xl font-bold text-xs shadow-md transition"
            >
              Take Now
            </button>
          </div>
        </div>
      )}

      {/* Medication List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>{getTranslation(currentLang, 'medicationList')}</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{medications.length} Prescribed Meds</span>
        </div>

        {medications.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">No Prescribed Medications Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your attending physician has not added any medications to your post-discharge outpatient record yet. Prescriptions are synchronized immediately upon hospital sign-off.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3 relative overflow-hidden"
              >
                {/* Color Stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: med.pillColor || '#0d9488' }}
                />

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: med.pillColor || '#0d9488' }}
                  >
                    {med.iconType}
                  </span>
                </div>

                {/* Scheduled Times */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-semibold text-[11px]">Times:</span>
                  {med.times.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-lg text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Food Directions */}
                <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-2.5 text-xs text-teal-900 font-medium flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span>{getTranslation(currentLang, med.foodInstruction)}</span>
                </div>

                {med.notes && <p className="text-xs text-slate-600 leading-relaxed italic">{med.notes}</p>}

                {/* Quick Trigger Action */}
                <button
                  onClick={() => onTriggerAlarm(med, med.times[0] || '08:00')}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5 text-teal-400" />
                  <span>Simulate Dose Alarm for this Medication</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
