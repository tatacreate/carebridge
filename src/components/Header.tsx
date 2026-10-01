import React, { useState } from 'react';
import { Stethoscope, PhoneCall, Volume2, VolumeX, Languages, ShieldAlert, FileText, Settings, Download, Activity, CheckCircle2, LogOut } from 'lucide-react';
import { Language, PatientProfile } from '../types';
import { LANGUAGES, getTranslation } from '../data/translations';
import { soundEngine } from '../utils/audioAlarm';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';

interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  patient: PatientProfile;
  authRole?: 'patient' | 'doctor' | 'none';
  onOpenCustomizer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pwaInstallable: boolean;
  onInstallPwa: () => void;
  isPwaInstalled: boolean;
  isPatientAuthed?: boolean;
  onPatientLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  patient,
  authRole,
  onOpenCustomizer,
  soundEnabled,
  onToggleSound,
  pwaInstallable,
  onInstallPwa,
  isPwaInstalled,
  isPatientAuthed,
  onPatientLogout,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSoundClick = () => {
    onToggleSound();
    if (!soundEnabled) {
      soundEngine.playChime(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl sticky top-0 z-30 border-b border-teal-700/50">
      {/* Top Emergency Hotline Strip */}
      <div className="bg-rose-950/80 border-b border-rose-800/40 px-3 py-1 landscape:py-0.5 text-[11px] landscape:text-[10px] text-rose-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{getTranslation(currentLang, 'emergencyHotline')}:</span>
          <a
            href={`tel:${patient.emergencyPhone}`}
            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold shadow-xs transition"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{getTranslation(currentLang, 'callEmergency')}</span>
          </a>
        </div>

        <div className="flex items-center gap-2.5 text-slate-300">
          <GoogleVerifiedBadge size="xs" compact={false} />
          <span className="hidden sm:inline">
            {getTranslation(currentLang, 'patientMRN')}: <strong className="text-teal-200">{patient.mrn}</strong>
          </span>
          <a
            href={`tel:${patient.doctorPhone}`}
            className="inline-flex items-center gap-1 text-teal-200 hover:text-white underline text-[11px] landscape:text-[10px]"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{getTranslation(currentLang, 'callHospital')}</span>
          </a>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 landscape:py-1 flex items-center justify-between gap-3">
        {/* Brand & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner shrink-0">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                {getTranslation(currentLang, 'appTitle')}
              </h1>
              <span className="text-[9px] uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/30 px-1.5 py-0.5 rounded font-semibold hidden sm:inline-block">
                Post-Op Roadmap
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 font-medium hidden sm:block">
              {getTranslation(currentLang, 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundClick}
            title={soundEnabled ? getTranslation(currentLang, 'soundEnabled') : getTranslation(currentLang, 'soundMuted')}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
              soundEnabled
                ? 'bg-teal-800/60 border-teal-600 text-teal-200 hover:bg-teal-700/80'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-300" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Patient Sign Out Button */}
          {isPatientAuthed && onPatientLogout && (
            <button
              onClick={onPatientLogout}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Sign Out to Unlinked State"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          {/* Edit Plan Settings Button (Doctors Only) */}
          {authRole === 'doctor' && (
            <button
              onClick={onOpenCustomizer}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-200 border border-slate-700/80 transition shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-teal-400" />
              <span>{getTranslation(currentLang, 'editPlan')}</span>
            </button>
          )}

          {/* PWA Install Button */}
          {pwaInstallable && !isPwaInstalled && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{getTranslation(currentLang, 'installApp')}</span>
            </button>
          )}

          {/* Multi-Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-xs font-bold text-teal-100 transition shadow-sm"
            >
              <span className="text-base">{currentLangObj.flag}</span>
              <span className="hidden xs:inline">{currentLangObj.nativeName}</span>
              <Languages className="w-3.5 h-3.5 text-teal-300 ml-0.5" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-teal-700/60 shadow-2xl py-2 z-50 divide-y divide-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                  Select Language / اللغة
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition hover:bg-teal-800/50 ${
                      currentLang === lang.code ? 'text-teal-300 font-bold bg-teal-950/60' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div>{lang.nativeName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                      </div>
                    </div>
                    {currentLang === lang.code && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Profile Quick Summary Sub-bar */}
      {isPatientAuthed && (
        <div className="bg-slate-900/90 border-t border-teal-800/40 px-4 py-2 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-teal-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{patient.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{patient.diagnosis}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>
                {getTranslation(currentLang, 'hospitalName')}:{' '}
                <strong className="text-slate-200">{patient.hospitalName}</strong>
              </span>
              <span className="hidden md:inline">
                {getTranslation(currentLang, 'doctorInCharge')}:{' '}
                <strong className="text-slate-200">{patient.doctorName}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
