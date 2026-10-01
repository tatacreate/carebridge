import React, { useState, useEffect } from 'react';
import { Language, Medication, DoseLog } from '../types';
import { getTranslation } from '../data/translations';
import {
  ShieldAlert,
  Clock,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  Pill,
} from 'lucide-react';

interface FloatingRecoveryBadgeProps {
  currentLanguage: Language;
  medications: Medication[];
  onTakePill: (medId: string) => void;
  onSnooze: (medId: string) => void;
  symptomSeverity: 'normal' | 'warning' | 'critical' | null;
  onOpenEmergencyModal: () => void;
  onOpenSymptomChecker: () => void;
}

export const FloatingRecoveryBadge: React.FC<FloatingRecoveryBadgeProps> = ({
  currentLanguage,
  medications,
  onTakePill,
  onSnooze,
  symptomSeverity,
  onOpenEmergencyModal,
  onOpenSymptomChecker,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [nextMed, setNextMed] = useState<Medication | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const isRtl = currentLanguage === 'ar' || currentLanguage === 'ur';

  // Find next upcoming active medication dose
  useEffect(() => {
    const activeMeds = medications.filter((m) => m.active);
    if (activeMeds.length > 0) {
      setNextMed(activeMeds[0]);
    } else {
      setNextMed(null);
    }
  }, [medications]);

  // Update time remaining countdown ticker
  useEffect(() => {
    if (!nextMed || nextMed.times.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Parse scheduled times into minutes from midnight
      const scheduledMinutesList = nextMed.times.map((t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      }).sort((a: number, b: number) => a - b);

      let targetMin = scheduledMinutesList.find((m: number) => m > currentMinutes);
      let diff = 0;

      if (targetMin !== undefined) {
        diff = targetMin - currentMinutes;
      } else {
        // Next dose is tomorrow morning
        diff = (24 * 60 - currentMinutes) + scheduledMinutesList[0];
      }

      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;

      if (hrs > 0) {
        setTimeRemaining(`${hrs}h ${mins}m`);
      } else {
        setTimeRemaining(`${mins}m`);
      }
    }, 10000);

    // Initial calculation
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const scheduledMinutesList = nextMed.times.map((t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }).sort((a: number, b: number) => a - b);
    let targetMin = scheduledMinutesList.find((m: number) => m > currentMinutes);
    let diff = 0;
    if (targetMin !== undefined) {
      diff = targetMin - currentMinutes;
    } else {
      diff = (24 * 60 - currentMinutes) + (scheduledMinutesList[0] || 0);
    }
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    setTimeRemaining(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);

    return () => clearInterval(timer);
  }, [nextMed]);

  // Status Styling
  const getBadgeStyle = () => {
    if (symptomSeverity === 'critical') {
      return {
        bg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-rose-900/30',
        icon: <AlertOctagon className="w-4 h-4 text-white animate-pulse" />,
        statusText: getTranslation(currentLanguage, 'floatingStatusCritical'),
      };
    }
    if (symptomSeverity === 'warning') {
      return {
        bg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500 shadow-amber-900/30',
        icon: <ShieldAlert className="w-4 h-4 text-white" />,
        statusText: getTranslation(currentLanguage, 'floatingStatusWarning'),
      };
    }
    return {
      bg: 'bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white border-teal-500/40 shadow-teal-950/40',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      statusText: getTranslation(currentLanguage, 'floatingStatusNormal'),
    };
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div
      id="floating-recovery-badge"
      className={`fixed z-40 transition-all duration-300 max-w-sm w-full p-2 ${
        isRtl ? 'left-4 md:left-6 bottom-4' : 'right-4 md:right-6 bottom-4'
      }`}
    >
      <div
        className={`rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden transition-all ${badgeStyle.bg}`}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${symptomSeverity === 'critical' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${symptomSeverity === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              {badgeStyle.icon}
              <span>{getTranslation(currentLanguage, 'floatingBadgeTitle')}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white">
              {badgeStyle.statusText}
            </span>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {!isMinimized && (
          <div className="p-3.5 space-y-3 bg-black/20 text-xs">
            {/* Next Scheduled Medication */}
            {nextMed ? (
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-3">
                <div className="space-y-0.5 truncate">
                  <span className="text-[10px] text-teal-200 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Pill className="w-3 h-3 text-emerald-300" />
                    <span>{getTranslation(currentLanguage, 'floatingNextDose')}:</span>
                  </span>
                  <div className="font-bold text-white text-sm truncate">{nextMed.name}</div>
                  <div className="text-[11px] text-slate-300">
                    {nextMed.dosage} • {nextMed.times[0] || '10:00 AM'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono font-bold text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining || 'In 1h'}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 justify-end">
                    <button
                      onClick={() => onTakePill(nextMed.id)}
                      className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-2xs transition"
                    >
                      {getTranslation(currentLanguage, 'takePill')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-300 text-center py-1">
                No active medication alarms pending.
              </div>
            )}

            {/* Emergency & Assessment Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onOpenEmergencyModal}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>Call 997</span>
              </button>

              <button
                onClick={onOpenSymptomChecker}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Assess Vitals</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
