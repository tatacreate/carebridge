import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Utensils,
  Activity,
  HeartPulse,
  Pill,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Language, PatientProfile, RoadmapDay } from '../types';
import { getTranslation } from '../data/translations';
import { speakText, stopSpeech } from '../utils/audioAlarm';
import { ReadOnlyNoticeBanner } from './ReadOnlyNoticeBanner';

interface DischargeRoadmapProps {
  currentLang: Language;
  patient: PatientProfile;
  days: RoadmapDay[];
  onToggleMilestone: (dayNumber: number, milestoneId: string) => void;
}

export const DischargeRoadmap: React.FC<DischargeRoadmapProps> = ({
  currentLang,
  patient,
  days,
  onToggleMilestone,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'activity' | 'diet' | 'wound' | 'medication'>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentDay = days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  const handleMilestoneCheck = (dayNum: number, milestoneId: string, currentStatus: boolean) => {
    onToggleMilestone(dayNum, milestoneId);
    if (!currentStatus) {
      // Celebrate milestone completion with confetti burst!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#2563eb', '#10b981'],
      });
    }
  };

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = `${currentDay.title}. ${currentDay.description}. ${getTranslation(currentLang, 'milestones')}: ${currentDay.milestones
        .map((m) => m.text)
        .join('. ')}. ${getTranslation(currentLang, 'allowedActivities')}: ${currentDay.allowedActivities.join('. ')}. ${getTranslation(currentLang, 'restrictedActivities')}: ${currentDay.restrictedActivities.join('. ')}`;

      speakText(textToRead, currentLang);

      // Auto reset state after estimate
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 15000);
    }
  };

  // Calculate overall progress across all days
  const totalMilestones = days.reduce((acc, d) => acc + d.milestones.length, 0);
  const completedMilestones = days.reduce(
    (acc, d) => acc + d.milestones.filter((m) => m.completed).length,
    0
  );
  const progressPercent = Math.round((completedMilestones / (totalMilestones || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Provider Signed Read-Only Banner */}
      <ReadOnlyNoticeBanner currentLang={currentLang} patient={patient} />

      {/* Title & Recovery Progress Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {getTranslation(currentLang, 'roadmapTitle')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {getTranslation(currentLang, 'roadmapSubtitle')}
            </p>
          </div>

          {/* Voiceover Reader & Overall Progress */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReadAloud}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-xs transition shadow-sm border ${
                isPlayingAudio
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" />
                  <span>{getTranslation(currentLang, 'stopAudio')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  <span>{getTranslation(currentLang, 'readAloud')}</span>
                </>
              )}
            </button>

            <div className="bg-teal-950 text-white px-4 py-2 rounded-2xl flex items-center gap-3 border border-teal-800 shadow-sm">
              <Award className="w-5 h-5 text-teal-300" />
              <div>
                <div className="text-[10px] text-teal-300 font-medium uppercase tracking-wider">
                  Overall Recovery
                </div>
                <div className="text-sm font-bold text-white">
                  {completedMilestones} / {totalMilestones} Steps ({progressPercent}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Day Selection Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((day) => {
            const dayCompleted = day.milestones.every((m) => m.completed);
            const isSelected = day.dayNumber === selectedDayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition border font-bold text-xs ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-300/40 scale-[1.02]'
                    : dayCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-xl flex items-center justify-center text-[11px] ${
                    isSelected
                      ? 'bg-white/20 text-white font-extrabold'
                      : dayCompleted
                      ? 'bg-emerald-200 text-emerald-900 font-bold'
                      : 'bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span>
                  {getTranslation(currentLang, 'dayLabel')} {day.dayNumber}
                </span>
                {dayCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">Filter View:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl font-medium transition ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {getTranslation(currentLang, 'filterAll')}
          </button>
          <button
            onClick={() => setCategoryFilter('activity')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              categoryFilter === 'activity'
                ? 'bg-teal-700 text-white font-semibold'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'filterActivity')}</span>
          </button>
          <button
            onClick={() => setCategoryFilter('diet')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              categoryFilter === 'diet'
                ? 'bg-amber-700 text-white font-semibold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'filterDiet')}</span>
          </button>
          <button
            onClick={() => setCategoryFilter('wound')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              categoryFilter === 'wound'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'filterWound')}</span>
          </button>
          <button
            onClick={() => setCategoryFilter('medication')}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              categoryFilter === 'medication'
                ? 'bg-indigo-700 text-white font-semibold'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'filterMeds')}</span>
          </button>
        </div>
      </div>

      {/* Selected Day Main Content Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        {/* Day Banner */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>
                {getTranslation(currentLang, 'dayLabel')} {currentDay.dayNumber} Roadmap
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{currentDay.title}</h3>
            <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">{currentDay.description}</p>
          </div>

          <div className="bg-teal-800/60 border border-teal-600 px-4 py-2.5 rounded-xl text-center flex-shrink-0">
            <div className="text-[10px] text-teal-200 uppercase font-semibold">Day Milestones</div>
            <div className="text-lg font-extrabold text-white">
              {currentDay.milestones.filter((m) => m.completed).length} / {currentDay.milestones.length}
            </div>
          </div>
        </div>

        {/* Milestones Checklist */}
        {(categoryFilter === 'all' || categoryFilter === 'activity') && (
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{getTranslation(currentLang, 'milestones')}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentDay.milestones
                .filter((m) => categoryFilter === 'all' || m.category === categoryFilter)
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleMilestoneCheck(currentDay.dayNumber, m.id, m.completed)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 select-none ${
                      m.completed
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                        m.completed ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {m.completed && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${m.completed ? 'line-through opacity-80' : ''}`}>
                        {m.text}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 inline-block">
                        Category: {m.category}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Allowed & Restricted Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed Activities */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
              <span>{getTranslation(currentLang, 'allowedActivities')}</span>
            </h4>
            <ul className="space-y-2.5">
              {currentDay.allowedActivities.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restricted Activities */}
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100">
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-3">
              <XCircle className="w-4.5 h-4.5 text-rose-600" />
              <span>{getTranslation(currentLang, 'restrictedActivities')}</span>
            </h4>
            <ul className="space-y-2.5">
              {currentDay.restrictedActivities.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-950 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dietary Guidance & Red Flags Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Dietary Restrictions */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
              <Utensils className="w-4.5 h-4.5 text-amber-600" />
              <span>{getTranslation(currentLang, 'dietaryRestrictions')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-amber-950 font-medium">
              {currentDay.dietaryRestrictions.map((diet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{diet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red Flags Warning Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
              <span>{getTranslation(currentLang, 'redFlags')}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {currentDay.redFlagsToWatch.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
