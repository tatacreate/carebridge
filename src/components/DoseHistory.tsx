import React from 'react';
import { History, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { DoseLog, Language } from '../types';
import { getTranslation } from '../data/translations';

interface DoseHistoryProps {
  currentLang: Language;
  logs: DoseLog[];
}

export const DoseHistory: React.FC<DoseHistoryProps> = ({ currentLang, logs }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
          <History className="w-6 h-6 text-teal-600" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {getTranslation(currentLang, 'historyTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {getTranslation(currentLang, 'historySubtitle')}
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-xs font-medium">{getTranslation(currentLang, 'noLogsYet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">{log.medicationName}</div>
                <div className="text-slate-500 font-medium flex items-center gap-2">
                  <span>Scheduled: {log.scheduledTime}</span>
                  <span>•</span>
                  <span>Logged At: {log.actionTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {log.status === 'taken' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{getTranslation(currentLang, 'statusTaken')}</span>
                  </span>
                ) : log.status === 'snoozed' ? (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-xl font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{getTranslation(currentLang, 'statusSnoozed')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-xl font-bold text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{getTranslation(currentLang, 'statusMissed')}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
