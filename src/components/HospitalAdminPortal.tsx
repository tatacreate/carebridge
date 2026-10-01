import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Heart,
  Users,
  Bell,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Terminal,
  Database,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { PatientProfile } from '../types';

interface HospitalAdminPortalProps {
  telemetry: {
    heartRate: number;
    temperature: number;
    ecgStatus: string;
    lastUpdated: string;
    isAnomalySpiked: boolean;
  };
  onToggleAnomaly: () => void;
  activePatient: PatientProfile;
  currentLang: 'ar' | 'en' | 'ur' | 'tl';
  onLogout: () => void;
}

export const HospitalAdminPortal: React.FC<HospitalAdminPortalProps> = ({
  telemetry,
  onToggleAnomaly,
  activePatient,
  currentLang,
  onLogout,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';
  const [selectedLogTab, setSelectedLogTab] = useState<'security' | 'system'>('security');

  // Hardcoded secondary mock patients for list to make it look full and functional
  const mockSystemPatients = [
    {
      name: activePatient.name || 'Khaled Al-Faisal',
      mrn: activePatient.mrn || 'KFSH-MOCK-992',
      heartRate: telemetry.heartRate,
      temperature: telemetry.temperature,
      status: telemetry.isAnomalySpiked ? 'critical' : 'stable',
      patchBattery: '94%',
      signalStrength: 'Excellent',
    },
    {
      name: 'Yousef Al-Otaibi',
      mrn: 'KFSH-812034',
      heartRate: 74,
      temperature: 36.7,
      status: 'stable',
      patchBattery: '88%',
      signalStrength: 'Good',
    },
    {
      name: 'Sarah Al-Qahtani',
      mrn: 'KFSH-981245',
      heartRate: 81,
      temperature: 36.9,
      status: 'stable',
      patchBattery: '12%',
      signalStrength: 'Weak',
    },
    {
      name: 'Fatima Al-Sudairy',
      mrn: 'KFSH-304918',
      heartRate: 68,
      temperature: 36.6,
      status: 'stable',
      patchBattery: '99%',
      signalStrength: 'Excellent',
    },
  ];

  // Dynamic logs
  const securityAuditLogs = [
    {
      time: '06:01:22',
      event: 'WebAuthn cryptographic credential registered',
      user: activePatient.email || 'khaled.mock@carebridge.org',
      ip: '192.168.1.14',
      severity: 'info',
    },
    {
      time: '05:58:10',
      event: 'Google Cloud OAuth 2.0 Token Handshake Succeeded',
      user: activePatient.email || 'khaled.mock@carebridge.org',
      ip: '192.168.1.14',
      severity: 'info',
    },
    {
      time: '05:44:30',
      event: 'Physician Medication Prescription Lock (Sign-off)',
      user: 'sarah.mock@carebridge.org (Attending Consultant)',
      ip: '10.231.102.8',
      severity: 'warning',
    },
    {
      time: '05:40:12',
      event: 'AI Medical Report Intake Parsing Ingestion',
      user: 'sarah.mock@carebridge.org',
      ip: '10.231.102.8',
      severity: 'info',
    },
    ...(telemetry.isAnomalySpiked
      ? [
          {
            time: telemetry.lastUpdated,
            event: 'ALARM TRIGGER: Outpatient Patch physiological threshold violation',
            user: activePatient.name || 'Khaled Al-Faisal',
            ip: 'Patch-ID #CB-PTCH-11',
            severity: 'critical',
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-6xl mx-auto w-full py-6 px-4 space-y-6 animate-fade-in">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white border border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>KFSH Hospital Enterprise Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hospital Admin Security & Telemetry Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            Real-time monitoring of PWA cryptographic biometrics, active biosensors, clinical staff audit trails, and device state anomalies.
          </p>
        </div>

        {/* Actions & Live Clock / Heartbeat */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Clock / Heartbeat */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
            <div className={`w-3 h-3 rounded-full ${telemetry.isAnomalySpiked ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Sys-Time Status</span>
              <span className="text-xs font-mono font-bold text-slate-200">Live Connected</span>
            </div>
          </div>

          {/* Sign Out Action Button */}
          <button
            onClick={onLogout}
            className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition duration-200 flex items-center justify-center gap-2"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Enterprise Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Active Outpatients</span>
            <span className="text-2xl font-black text-slate-900">142</span>
            <span className="text-[10px] text-emerald-600 font-bold block">↑ 14% this month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Connected Biosensors</span>
            <span className="text-2xl font-black text-slate-900">4 Active</span>
            <span className="text-[10px] text-slate-500 block">Telemetry stream live</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Clinical Alarms</span>
            <span className={`text-2xl font-black ${telemetry.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
              {telemetry.isAnomalySpiked ? '1 CRITICAL' : '0 Active'}
            </span>
            <span className="text-[10px] text-slate-500 block">Threshold: HR &gt; 120 or Temp &gt; 38.5</span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${telemetry.isAnomalySpiked ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cryptographic Compliance</span>
            <span className="text-2xl font-black text-slate-900">100%</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">OAuth 2.0 + WebAuthn FIDO2</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Live patches list */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>Live Biosensor Patch Stream (Simulated Hardware)</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Live physiological telemetry transmitting from outpatients FIDO2-verified mobile devices.
              </p>
            </div>

            {/* Quick Trigger Button inside table */}
            <button
              onClick={onToggleAnomaly}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1.5 shadow-2xs ${
                telemetry.isAnomalySpiked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${telemetry.isAnomalySpiked ? 'animate-spin' : ''}`} />
              <span>
                {telemetry.isAnomalySpiked ? 'Reset Anomaly (Stable)' : 'Simulate Vitals Spike'}
              </span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
                  <th className="py-2.5">Outpatient Name / MRN</th>
                  <th className="py-2.5">Heart Rate</th>
                  <th className="py-2.5">Temperature</th>
                  <th className="py-2.5">Battery / Signal</th>
                  <th className="py-2.5 text-right">Alarm Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockSystemPatients.map((p, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/50 transition ${p.status === 'critical' ? 'bg-rose-50/40' : ''}`}>
                    <td className="py-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.mrn}</div>
                    </td>
                    <td className="py-3 font-mono font-extrabold">
                      <span className={p.status === 'critical' ? 'text-rose-600 text-sm' : 'text-slate-800'}>
                        {p.heartRate} bpm
                      </span>
                    </td>
                    <td className="py-3 font-mono font-extrabold">
                      <span className={p.status === 'critical' ? 'text-rose-600 text-sm' : 'text-slate-800'}>
                        {p.temperature} °C
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${p.patchBattery === '12%' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100'}`}>
                          🔋 {p.patchBattery}
                        </span>
                        <span className="text-[10px]">📡 {p.signalStrength}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      {p.status === 'critical' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-[10px] tracking-wide inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>CRITICAL ALERT</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Normal Stable</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column - Admin Control & Cryptographic Logs */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Audit Logging Terminal</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Cryptographic authentication logging & system events.
              </p>
            </div>

            {/* Toggle Log Category */}
            <div className="grid grid-cols-2 gap-2 bg-slate-850 p-1 rounded-xl">
              <button
                onClick={() => setSelectedLogTab('security')}
                className={`py-1 rounded-lg text-[10px] font-black transition ${
                  selectedLogTab === 'security'
                    ? 'bg-slate-800 text-teal-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔐 Cryptographic Audit
              </button>
              <button
                onClick={() => setSelectedLogTab('system')}
                className={`py-1 rounded-lg text-[10px] font-black transition ${
                  selectedLogTab === 'system'
                    ? 'bg-slate-800 text-indigo-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙️ Host Telemetry
              </button>
            </div>

            {/* Terminal logs list */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-3 font-mono text-[10px] leading-relaxed select-text">
              {selectedLogTab === 'security' ? (
                securityAuditLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900 pb-2 last:border-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{log.time}</span>
                      </span>
                      <span className={`uppercase font-black text-[8px] px-1 rounded ${
                        log.severity === 'critical' ? 'bg-rose-950 text-rose-400 animate-pulse' :
                        log.severity === 'warning' ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                    <div className={log.severity === 'critical' ? 'text-rose-400 font-black' : 'text-slate-300'}>
                      {log.event}
                    </div>
                    <div className="text-[9px] text-indigo-400 truncate">
                      user: {log.user} • {log.ip}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-1.5 text-slate-400">
                  <p className="text-teal-400 font-extrabold">[SYSTEM OK] Outpatient Cloud Gateway online.</p>
                  <p>Initializing polling cycle for active biosensor patches...</p>
                  <p className="text-[9px]">GET /api/v1/telemetry/KFSH-MOCK-992 API response: 200 OK</p>
                  <p className="text-[9px]">Heart Rate: {telemetry.heartRate} bpm • Temp: {telemetry.temperature} °C</p>
                  {telemetry.isAnomalySpiked ? (
                    <p className="text-rose-500 font-black animate-pulse">[THRESHOLD EXCEEDED] HR 134 exceeds limit (120 bpm). Launching crisis notification protocol.</p>
                  ) : (
                    <p className="text-slate-500">Physiological values within medical tolerance.</p>
                  )}
                  <p className="text-[9px]">GET /api/v1/audit/compliance API response: 200 OK (FIDO2 active)</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick info footer */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Encrypted local DB connected safely • Compliant with SCFHS and HIPAA privacy guidelines.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
