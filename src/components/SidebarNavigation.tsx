import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Activity,
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  History,
  Menu,
  X,
  PhoneCall,
  ShieldAlert,
  Stethoscope,
  LogOut,
  Fingerprint,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Language, PatientProfile } from '../types';
import { getTranslation } from '../data/translations';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';

export type TabKey =
  | 'home'
  | 'link_doctors'
  | 'alarms'
  | 'roadmap'
  | 'symptoms'
  | 'settings'
  | 'ai_companion'
  | 'prescription_scanner';

interface SidebarNavigationProps {
  currentLang: Language;
  activeTab: TabKey;
  patient?: PatientProfile;
  onSelectTab: (tab: TabKey) => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  onOpenLinkedDoctors?: () => void;
  onLogout?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentLang,
  activeTab,
  patient,
  onSelectTab,
  onOpenSettings,
  onOpenEmergency,
  onOpenLinkedDoctors,
  onLogout,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    {
      key: 'home' as TabKey,
      label: getTranslation(currentLang, 'tabHome') || 'Dashboard / Home',
      icon: LayoutDashboard,
      desc: 'Outpatient portal summary',
    },
    {
      key: 'link_doctors' as TabKey,
      label: 'Link Doctors',
      icon: Stethoscope,
      desc: 'Connected physicians & care team',
    },
    {
      key: 'alarms' as TabKey,
      label: getTranslation(currentLang, 'tabAlarms') || 'Medications & Schedule',
      icon: Bell,
      desc: 'Prescribed drugs (Read-Only)',
    },
    {
      key: 'roadmap' as TabKey,
      label: getTranslation(currentLang, 'tabRoadmap') || 'Discharge Roadmap',
      icon: Calendar,
      desc: 'Day-by-day milestone guide',
    },
    {
      key: 'symptoms' as TabKey,
      label: getTranslation(currentLang, 'tabSymptomChecker') || 'Symptom Tracker',
      icon: Activity,
      desc: 'Objective recovery check-ins',
    },
    {
      key: 'ai_companion' as TabKey,
      label: 'AI Health Companion',
      icon: Sparkles,
      desc: 'Compassionate medical AI helper',
    },
    {
      key: 'prescription_scanner' as TabKey,
      label: 'AI Prescription Scan',
      icon: Camera,
      desc: 'Scan prescription to request rx',
    },
  ];

  const handleNavClick = (key: TabKey) => {
    if (key === 'settings') {
      onOpenSettings();
    } else {
      onSelectTab(key);
    }
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Bar Drawer Trigger (visible on sm/md screens) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 p-3 px-4 flex items-center justify-between gap-2 shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm text-slate-900">
            {navItems.find((i) => i.key === activeTab)?.label || 'Navigation'}
          </span>
        </div>

        <button
          onClick={onOpenEmergency}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>997 Emergency</span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Drawer Menu */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className={`absolute top-0 bottom-0 ${
              isRtl ? 'right-0' : 'left-0'
            } w-72 max-w-[85vw] bg-white shadow-2xl p-3 sm:p-4 flex flex-col justify-between space-y-3 overflow-y-auto max-h-screen`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                    +
                  </div>
                  <span className="font-bold text-slate-900 text-sm">+CareBridge</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Patient Profile & Security Status */}
              {patient && (
                <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-900 text-xs block truncate">{patient.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">MRN: {patient.mrn}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <GoogleVerifiedBadge size="xs" email={patient.email} />
                    {patient.biometricVerified && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-800 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full">
                        <Fingerprint className="w-2.5 h-2.5 text-teal-700" />
                        <span>Biometrics Active</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {/* Special Linked Doctors Button */}
                {onOpenLinkedDoctors && (
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenLinkedDoctors();
                    }}
                    className="w-full p-3 rounded-2xl text-xs font-extrabold bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Doctors Linked To You</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </button>
                )}

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavClick(item.key)}
                      className={`w-full p-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="text-left font-semibold">
                        <div>{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenSettings();
                }}
                className="w-full p-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition flex items-center gap-3"
              >
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Settings & Language</span>
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full p-3 rounded-2xl text-xs font-bold bg-slate-800 text-rose-300 hover:bg-slate-700 transition flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar Panel */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-slate-200/80 shadow-xs transition-all duration-300 shrink-0 ${
          collapsed ? 'w-20' : 'w-72'
        } p-4 space-y-6 min-h-[calc(100vh-120px)] sticky top-20 rounded-3xl my-6`}
      >
        <div className="space-y-4">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                  +
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block leading-none">
                    +CareBridge
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Post-Op Care System
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition mx-auto"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                isRtl ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : isRtl ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1.5">
            {/* Special Doctors Linked To You Button */}
            {onOpenLinkedDoctors && (
              <button
                onClick={onOpenLinkedDoctors}
                className={`w-full p-3 rounded-2xl text-xs font-black transition flex items-center gap-3.5 bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={collapsed ? 'Doctors Linked To You' : undefined}
              >
                <Stethoscope className="w-5 h-5 text-teal-700 shrink-0" />
                {!collapsed && (
                  <div className="text-left font-bold truncate flex items-center justify-between w-full">
                    <span>Doctors Linked To You</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                )}
              </button>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold transition flex items-center gap-3.5 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <div className="text-left font-semibold truncate">
                      <div className="truncate">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal truncate ${
                          isActive ? 'text-teal-100' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Patient Security Profile & Settings & Emergency & Logout */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          {/* Desktop Patient Profile Authentication Status Card */}
          {patient && (
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200/70 transition-all ${
                collapsed ? 'flex justify-center p-2' : 'space-y-2'
              }`}
            >
              {!collapsed ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 text-xs block truncate">{patient.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">MRN: {patient.mrn}</span>
                    </div>
                  </div>
                  <div className="pt-1 flex flex-col gap-1">
                    <GoogleVerifiedBadge size="xs" email={patient.email} />
                    {patient.biometricVerified && (
                      <div className="inline-flex items-center gap-1 text-[9px] font-bold text-teal-900 bg-teal-100/80 border border-teal-200 px-2 py-0.5 rounded-full w-fit">
                        <Fingerprint className="w-2.5 h-2.5 text-teal-700 shrink-0" />
                        <span>WebAuthn Biometric</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="relative group cursor-pointer" title={`${patient.name} • Verified by Google`}>
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {patient.name.charAt(0)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className={`w-full p-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              collapsed ? 'justify-center' : ''
            } bg-slate-100 text-slate-800 hover:bg-slate-200`}
            title={collapsed ? 'Settings & Alerts' : undefined}
          >
            <Sliders className="w-5 h-5 text-teal-600 shrink-0" />
            {!collapsed && <span>Settings & Alerts</span>}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full p-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
                collapsed ? 'justify-center' : ''
              } bg-slate-800 hover:bg-slate-700 text-rose-300`}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 text-rose-400 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}

          <button
            onClick={onOpenEmergency}
            className={`w-full p-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
              collapsed ? 'justify-center' : ''
            } bg-rose-600 hover:bg-rose-500 text-white shadow-md`}
            title={collapsed ? '997 Emergency Hotline' : undefined}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 animate-pulse" />
            {!collapsed && <span>Emergency (997)</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
