import React, { useEffect } from 'react';
import { BellRing, Check, Clock, ShieldAlert, Utensils, AlertTriangle } from 'lucide-react';
import { AlarmTriggerState, Language } from '../types';
import { getTranslation } from '../data/translations';
import { soundEngine } from '../utils/audioAlarm';

interface AlarmOverlayModalProps {
  currentLang: Language;
  triggerState: AlarmTriggerState;
  onConfirmTaken: (medicationId: string, medicationName: string, scheduledTime: string) => void;
  onSnooze: (medicationId: string, medicationName: string, scheduledTime: string) => void;
}

export const AlarmOverlayModal: React.FC<AlarmOverlayModalProps> = ({
  currentLang,
  triggerState,
  onConfirmTaken,
  onSnooze,
}) => {
  useEffect(() => {
    if (triggerState.isOpen) {
      soundEngine.startRepeatingAlarm();
    } else {
      soundEngine.stopRepeatingAlarm();
    }

    return () => {
      soundEngine.stopRepeatingAlarm();
    };
  }, [triggerState.isOpen]);

  if (!triggerState.isOpen || !triggerState.medication) {
    return null;
  }

  const med = triggerState.medication;

  const handleTakenClick = () => {
    soundEngine.stopRepeatingAlarm();
    onConfirmTaken(med.id, med.name, triggerState.scheduledTime);
  };

  const handleSnoozeClick = () => {
    soundEngine.stopRepeatingAlarm();
    onSnooze(med.id, med.name, triggerState.scheduledTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* High-Contrast Alert Box */}
      <div className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-2 border-rose-500 shadow-2xl overflow-hidden p-5 sm:p-6 text-white space-y-4 sm:space-y-6 relative my-auto max-h-[95vh] landscape:max-h-none overflow-y-auto">
        {/* Pulsing Alarm Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />

        {/* Header Icon */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 rounded-2xl shadow-lg animate-bounce">
              <BellRing className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300 bg-rose-900/60 border border-rose-700/60 px-2.5 py-0.5 rounded-md">
                System Overlay Reminder
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                {getTranslation(currentLang, 'alarmModalTitle')}
              </h2>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-amber-300">
            {triggerState.scheduledTime}
          </div>
        </div>

        {/* Medication Spotlight Box */}
        <div className="bg-slate-900/90 border border-rose-800/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">{med.name}</h3>
            <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-sm">
              {med.dosage}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold bg-amber-950/60 border border-amber-800/60 p-3 rounded-xl">
            <Utensils className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{getTranslation(currentLang, med.foodInstruction)}</span>
          </div>

          {med.notes && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {med.notes}
            </p>
          )}
        </div>

        {/* Clinical Safety Notice */}
        <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p>{getTranslation(currentLang, 'warningNotIgnored')}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleTakenClick}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>{getTranslation(currentLang, 'confirmTaken')}</span>
          </button>

          <button
            onClick={handleSnoozeClick}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5 text-slate-950" />
            <span>{getTranslation(currentLang, 'snoozeTenMin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
