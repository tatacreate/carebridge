import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Pill,
  Plus,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  AlertCircle,
  Building2,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Link2Off,
  Activity,
  Calendar,
  HeartPulse,
  UserX,
  FileCheck,
  Check,
  Fingerprint,
} from 'lucide-react';
import { Medication, PatientProfile, RoadmapDay, DoseLog, SymptomAssessment, Language } from '../types';
import { AiMedicalReportAnalyzer, ExtractedReportData } from './AiMedicalReportAnalyzer';
import { GoogleVerifiedBadge } from './GoogleVerifiedBadge';
import { getAllPatients, savePatientToDb } from '../utils/userDatabase';

export type DoctorTabKey = 'home' | 'linked_patients' | 'link_new_patient';

interface DoctorPortalLayoutProps {
  currentLang: Language;
  doctorName?: string;
  doctorEmail?: string;
  doctorSpecialty?: string;
  doctorRank?: string;
  hospitalName?: string;
  linkedRoster: PatientProfile[];
  activePatient: PatientProfile;
  medications: Medication[];
  days: RoadmapDay[];
  doseLogs: DoseLog[];
  symptomAssessments: SymptomAssessment[];
  onSelectPatient: (patient: PatientProfile) => void;
  onUpdatePatient: (updated: PatientProfile) => void;
  onUpdateMedications: (meds: Medication[]) => void;
  onAddPatientToRoster: (newPatient: PatientProfile) => void;
  onUnlinkPatient?: (patient: PatientProfile) => void;
  onLogout: () => void;
  telemetry?: {
    heartRate: number;
    temperature: number;
    ecgStatus: string;
    lastUpdated: string;
    isAnomalySpiked: boolean;
  };
  onToggleAnomaly?: () => void;
}

export const DoctorPortalLayout: React.FC<DoctorPortalLayoutProps> = ({
  currentLang,
  doctorName = 'Attending Physician',
  doctorEmail = '',
  doctorSpecialty = 'Clinical Management & Post-Op Recovery',
  doctorRank = 'Consultant',
  hospitalName = 'Hospital & Medical Centre',
  linkedRoster,
  activePatient,
  medications,
  days,
  doseLogs,
  symptomAssessments,
  onSelectPatient,
  onUpdatePatient,
  onUpdateMedications,
  onAddPatientToRoster,
  onUnlinkPatient,
  onLogout,
  telemetry,
  onToggleAnomaly,
}) => {
  const isRtl = currentLang === 'ar' || currentLang === 'ur';
  const [activeTab, setActiveTab] = useState<DoctorTabKey>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Link New Patient Form States
  const [intakeEmail, setIntakeEmail] = useState('');
  const [intakeNationalId, setIntakeNationalId] = useState('');
  const [intakeName, setIntakeName] = useState('');
  const [intakeAdmissionReason, setIntakeAdmissionReason] = useState('');
  const [intakeDiagnosis, setIntakeDiagnosis] = useState('Post-Operative Recovery Care');
  const [intakeDischargeType, setIntakeDischargeType] = useState<
    'abdominal_surgery' | 'cardiac_recovery' | 'orthopedic' | 'maternity' | 'general'
  >('abdominal_surgery');
  const [intakeError, setIntakeError] = useState<string | null>(null);

  // Medication prescribing states
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('08:00, 20:00');
  const [newMedInstruction, setNewMedInstruction] = useState<
    'after_food' | 'before_food' | 'with_food' | 'empty_stomach'
  >('after_food');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Helper for Doctor Last Name
  const getDoctorLastName = () => {
    const parts = doctorName.trim().split(' ');
    return parts[parts.length - 1] || 'Clinician';
  };

  // Callback when AI Medical Report Image Analyzer finishes extraction
  const handleAiExtractionComplete = (data: ExtractedReportData) => {
    setIntakeAdmissionReason(data.admissionReason);
    if (data.diagnosis) {
      setIntakeDiagnosis(data.diagnosis);
    }
    if (data.patientName && !intakeName) {
      setIntakeName(data.patientName);
    }
    showNotification('AI Report Analyzer: Admission reason successfully populated from medical report scan.');
  };

  // Handle Link New Patient Submit
  const handleLinkPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeError(null);

    const cleanEmail = intakeEmail.trim();
    const cleanNationalId = intakeNationalId.trim();
    const cleanName = intakeName.trim() || cleanEmail.split('@')[0];
    const cleanReason = intakeAdmissionReason.trim();

    if (!cleanEmail) {
      setIntakeError('Please enter the patient\'s verified Google email address.');
      return;
    }
    if (!cleanNationalId) {
      setIntakeError('Please enter the patient\'s official National ID / Passport ID.');
      return;
    }
    if (!cleanReason) {
      setIntakeError('Please provide an admission reason (type directly or use the AI Report Analyzer).');
      return;
    }

    const registeredPatients = getAllPatients();
    const normalizedEmail = cleanEmail.toLowerCase();
    const existingPatient = registeredPatients[normalizedEmail];

    if (!existingPatient) {
      setIntakeError(`Error: Patient account with email "${cleanEmail}" does not exist on the patient platform. The patient must sign up first before a doctor can link their account.`);
      return;
    }

    if (existingPatient.nationalIdOrPassport && existingPatient.nationalIdOrPassport.trim() !== cleanNationalId) {
      setIntakeError('Error: The National ID / Passport ID entered does not match the patient\'s registered ID on the patient portal.');
      return;
    }

    const updatedLinkedPatient: PatientProfile = {
      ...existingPatient,
      name: cleanName || existingPatient.name,
      diagnosis: intakeDiagnosis || existingPatient.diagnosis,
      admissionReason: cleanReason || existingPatient.admissionReason,
      dischargeType: intakeDischargeType || existingPatient.dischargeType,
      doctorName: doctorName || existingPatient.doctorName,
      hospitalName: hospitalName || existingPatient.hospitalName,
      isLinkedToDoctor: true,
      admissionStatus: 'discharged_active',
      isDoctorLocked: false,
    };

    savePatientToDb(updatedLinkedPatient);
    onAddPatientToRoster(updatedLinkedPatient);
    onSelectPatient(updatedLinkedPatient);
    showNotification(`Patient "${updatedLinkedPatient.name}" (${cleanEmail}) successfully linked and care roadmap unlocked!`);

    // Reset intake form
    setIntakeEmail('');
    setIntakeNationalId('');
    setIntakeName('');
    setIntakeAdmissionReason('');

    // Switch view to active patient chart
    setActiveTab('linked_patients');
  };

  // Add medication handler
  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const timesArray = newMedTimes
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage || '1 Tablet',
      frequency: 'Prescribed by Physician',
      times: timesArray.length > 0 ? timesArray : ['08:00'],
      foodInstruction: newMedInstruction,
      notes: 'Official hospital prescription locked by attending physician',
      pillColor: '#0d9488',
      active: true,
      iconType: 'capsule',
    };

    const updated = [...medications, newMed];
    onUpdateMedications(updated);
    setNewMedName('');
    setNewMedDosage('');
    showNotification(`Added prescription "${newMed.name}" to ${activePatient.name}'s chart.`);
  };

  // Remove medication handler
  const handleRemoveMed = (medId: string) => {
    const updated = medications.filter((m) => m.id !== medId);
    onUpdateMedications(updated);
    showNotification('Prescription removed from patient chart.');
  };

  // Toggle Inpatient Lock vs Outpatient Active
  const handleToggleDischargeStatus = () => {
    const newStatus =
      activePatient.admissionStatus === 'inpatient_locked' ? 'discharged_active' : 'inpatient_locked';
    const updated = {
      ...activePatient,
      admissionStatus: newStatus as 'inpatient_locked' | 'discharged_active',
      dischargeDate:
        newStatus === 'discharged_active'
          ? new Date().toISOString().split('T')[0]
          : activePatient.dischargeDate,
    };
    onUpdatePatient(updated);
    showNotification(
      newStatus === 'discharged_active'
        ? `Outpatient website unlocked for ${activePatient.name}.`
        : `Outpatient website locked for ${activePatient.name}.`
    );
  };

  // Unlink Patient (Preserves account, reverts patient portal to unlinked state)
  const handleConfirmUnlink = () => {
    if (onUnlinkPatient) {
      onUnlinkPatient(activePatient);
    } else {
      // Fallback in-place unlink
      const updated = {
        ...activePatient,
        isLinkedToDoctor: false,
        doctorName: '',
      };
      onUpdatePatient(updated);
    }
    setShowUnlinkConfirm(false);
    showNotification(
      `Patient "${activePatient.name}" has been unlinked from your care roster. Their account remains active in an unlinked state.`
    );
    setActiveTab('home');
  };

  // Explicit Sidebar Navigation Items
  const navItems = [
    {
      key: 'home' as DoctorTabKey,
      label: 'Dashboard / Home',
      icon: LayoutDashboard,
      helperText: 'Return to portal overview & status',
    },
    {
      key: 'linked_patients' as DoctorTabKey,
      label: 'Linked Patients List',
      icon: Users,
      helperText: 'Active outpatient cases & clinical charts',
    },
    {
      key: 'link_new_patient' as DoctorTabKey,
      label: 'Link New Patient Tool',
      icon: UserPlus,
      helperText: 'Onboard patient via ID or AI report analyzer',
    },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 my-4 animate-fade-in">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-white rounded-2xl border border-teal-100 shadow-xs p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-xs block">Doctor Portal</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[120px]">{doctorName}</span>
              <GoogleVerifiedBadge size="xs" compact={true} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl text-left transition flex items-center gap-3 ${
                  isActive
                    ? 'bg-teal-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
                <div>
                  <div className="text-xs">{item.label}</div>
                  <div className={`text-[10px] font-normal ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                    {item.helperText}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Secure Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP EXPLICIT SIDEBAR PANEL NAVIGATION */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col justify-between bg-white rounded-3xl border border-slate-200 p-5 shadow-xs h-[calc(100vh-140px)] sticky top-6">
        <div className="space-y-6">
          {/* Clinical Badge */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900 text-sm truncate">{doctorName}</h2>
              <p className="text-[11px] text-teal-700 font-bold truncate">{doctorRank}</p>
              <p className="text-[10px] text-slate-400 truncate">{hospitalName}</p>
              <div className="pt-1.5">
                <GoogleVerifiedBadge size="xs" email={doctorEmail} showSubtext={false} />
              </div>
            </div>
          </div>

          {/* Navigation Items with Descriptive Helper Text */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider px-2 block">
              Doctor Navigation
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full p-3.5 rounded-2xl text-left transition flex flex-col gap-0.5 group ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-50/70 hover:bg-teal-50/50 text-slate-800 border border-slate-100 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-teal-600 group-hover:text-teal-700'
                        }`}
                      />
                      <span className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-teal-200 translate-x-0.5' : 'text-slate-300 group-hover:text-teal-600'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] pl-6 leading-tight ${
                      isActive ? 'text-teal-100 font-medium' : 'text-slate-500 font-normal'
                    }`}
                  >
                    {item.helperText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECURE LOGOUT (BOTTOM OF SIDEBAR) */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button
            onClick={onLogout}
            className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-extrabold text-xs transition flex items-center justify-center gap-2 group border border-slate-200/80 hover:border-rose-200"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition" />
            <span>Secure Logout</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Terminates active clinical session
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* Notification Toast */}
        {notificationMsg && (
          <div className="p-3.5 rounded-2xl bg-teal-900 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-teal-200 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. DOCTOR HOMEPAGE LAYOUT (MUST CONTAIN ONLY THIS ON FIRST LOAD) */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Clean 4-Point Card as Specified */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {/* Point 1: Warm Greeting & Point 2: Subtext */}
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-extrabold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Verified Clinical Session • {hospitalName}</span>
                  </div>
                  <GoogleVerifiedBadge size="sm" email={doctorEmail} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome back, Dr. {getDoctorLastName()}
                </h1>
                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
                  This is your secure Clinical Management Portal, designed for real-time outpatient oversight.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Clinician OAuth Authenticated: <strong className="text-slate-700 font-semibold">{doctorEmail}</strong>
                  </span>
                </div>
              </div>

              {/* Point 3: Status Badge */}
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    {linkedRoster.length}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">
                      Active Care Roster
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {linkedRoster.length > 0
                        ? `You have ${linkedRoster.length} patient${
                            linkedRoster.length > 1 ? 's' : ''
                          } linked to your account`
                        : "You haven't linked any patients yet"}
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Engine Active</span>
                </span>
              </div>

              {/* Point 4: Quick Guidance */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Portal Quick Guidance:</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Use the sidebar panel to manage patient care, view active cases, or link new patients.
                </p>
              </div>

              {/* Explicit Quick Action Navigation Cards with Descriptive Subtext */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('linked_patients')}
                  className="p-5 rounded-2xl bg-white hover:bg-teal-50/40 border-2 border-slate-200 hover:border-teal-500 text-left transition shadow-xs flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-teal-950">
                        Linked Patients List
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Review active recovery charts, dosage schedules, and health status for linked outpatients.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                    <span>Open Patient Roster</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('link_new_patient')}
                  className="p-5 rounded-2xl bg-teal-50/50 hover:bg-teal-100/60 border-2 border-teal-300 hover:border-teal-600 text-left transition shadow-xs flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-teal-950">
                        Link New Patient Tool
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        Initiate verified patient intake with Google email, National ID, and AI report analyzer.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teal-200 flex items-center justify-between text-xs font-bold text-teal-800">
                    <span>Onboard New Patient</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. LINKED PATIENTS LIST (ROSTER & MEDICAL CHARTS) */}
        {activeTab === 'linked_patients' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Linked Patients List</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a patient to review real-time recovery vitals, adjust prescriptions, or unlink
                </p>
              </div>

              <button
                onClick={() => setActiveTab('link_new_patient')}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Link Another Patient</span>
              </button>
            </div>

            {/* Roster Cards Grid */}
            {linkedRoster.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-800 text-sm">No Patients Currently Linked</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your roster is clean. Click "Link Another Patient" or use the onboarding tool to link a patient via their registered email.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {linkedRoster.map((patientItem) => {
                  const isSelected = activePatient.mrn === patientItem.mrn;
                  const isDischarged = patientItem.admissionStatus === 'discharged_active';

                  return (
                    <div
                      key={patientItem.mrn}
                      onClick={() => onSelectPatient(patientItem)}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-500 shadow-sm ring-1 ring-teal-500'
                          : 'bg-white border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center">
                            {patientItem.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                              {patientItem.name}
                            </h3>
                            <span className="font-mono text-[11px] text-teal-800 font-bold block">
                              {patientItem.mrn}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                            isDischarged
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isDischarged ? 'Discharged' : 'Inpatient Lock'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                        <div className="truncate">
                          <strong className="text-slate-700">Diagnosis:</strong> {patientItem.diagnosis}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          {patientItem.email || 'No email recorded'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-400 font-medium">Click to open chart</span>
                        {isSelected && (
                          <span className="text-teal-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Chart</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACTIVE PATIENT CHART & MANAGEMENT PANEL */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
              {/* Patient Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                        {activePatient.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold">
                        MRN: {activePatient.mrn}
                      </span>
                      <GoogleVerifiedBadge size="xs" email={activePatient.email} />
                      {activePatient.biometricVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-extrabold">
                          <Fingerprint className="w-3 h-3 text-teal-600" />
                          <span>WebAuthn Biometric</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {activePatient.diagnosis} • National ID: {activePatient.nationalIdOrPassport || '12345'}
                    </p>
                  </div>
                </div>

                {/* Doctor's Live Telemetry Monitor Widget */}
                <div className={`p-4 rounded-2xl border text-xs sm:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full md:w-auto ${
                  telemetry?.isAnomalySpiked
                    ? 'bg-rose-50 border-rose-300 animate-pulse-slow'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${telemetry?.isAnomalySpiked ? 'bg-rose-600 animate-ping' : 'bg-teal-500'}`} />
                      <span>Outpatient Live Biosensor Stream</span>
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {telemetry?.isAnomalySpiked
                        ? '⚠️ Warning: Vitals spike exceeded medical thresholds!'
                        : '✓ Patient vitals actively streaming & within safe range.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 min-w-[65px]">
                      <span className="text-[8px] text-slate-400 block uppercase font-extrabold leading-none">Heart Rate</span>
                      <span className={`font-mono font-black text-xs ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                        {telemetry?.heartRate || 72} <span className="text-[8px] font-normal text-slate-400">bpm</span>
                      </span>
                    </div>

                    <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 min-w-[65px]">
                      <span className="text-[8px] text-slate-400 block uppercase font-extrabold leading-none">Body Temp</span>
                      <span className={`font-mono font-black text-xs ${telemetry?.isAnomalySpiked ? 'text-rose-600' : 'text-slate-900'}`}>
                        {telemetry?.temperature || 36.8} <span className="text-[8px] font-normal text-slate-400">°C</span>
                      </span>
                    </div>

                    <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 min-w-[80px]">
                      <span className="text-[8px] text-slate-400 block uppercase font-extrabold leading-none">ECG Rhythm</span>
                      <span className="font-mono font-black text-[10px] text-slate-700 block leading-tight truncate">
                        {telemetry?.isAnomalySpiked ? 'Tachycardia' : 'Sinus Rhythm'}
                      </span>
                    </div>

                    {onToggleAnomaly && (
                      <button
                        type="button"
                        onClick={onToggleAnomaly}
                        className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition shrink-0 ${
                          telemetry?.isAnomalySpiked
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-rose-600 text-white hover:bg-rose-500'
                        }`}
                      >
                        <span>{telemetry?.isAnomalySpiked ? 'Reset' : 'Spike Vitals'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient Control Actions: Lock/Unlock & Unlink */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleToggleDischargeStatus}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      activePatient.admissionStatus === 'discharged_active'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {activePatient.admissionStatus === 'discharged_active' ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Inpatient Access</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Outpatient Website</span>
                      </>
                    )}
                  </button>

                  {/* UNLINK PATIENT BUTTON (SPECIFICATION 3: NO PERMANENT DELETION) */}
                  <button
                    onClick={() => setShowUnlinkConfirm(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition"
                  >
                    <Link2Off className="w-3.5 h-3.5 text-rose-600" />
                    <span>Unlink Patient from Care Roster</span>
                  </button>
                </div>
              </div>

              {/* Admission Reason Summary (if provided or extracted by AI) */}
              {activePatient.admissionReason && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">
                    Recorded Admission Rationale & Findings:
                  </span>
                  <p className="font-semibold text-slate-800 leading-snug">
                    "{activePatient.admissionReason}"
                  </p>
                </div>
              )}

              {/* PRESCRIPTION MANAGEMENT SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Active Prescriptions ({medications.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Locked for patient (Read-Only on patient portal)
                  </span>
                </div>

                {/* Add New Prescription Form */}
                <form
                  onSubmit={handleAddMed}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs"
                >
                  <span className="font-bold text-slate-700 block text-[11px]">
                    Prescribe New Medication for {activePatient.name}:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Medication Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ciprofloxacin 500mg"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Dosage / Quantity</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Tablet"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Schedule Times (HH:MM)</label>
                      <input
                        type="text"
                        placeholder="e.g. 08:00, 20:00"
                        value={newMedTimes}
                        onChange={(e) => setNewMedTimes(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Meal Directive</label>
                      <select
                        value={newMedInstruction}
                        onChange={(e) =>
                          setNewMedInstruction(
                            e.target.value as 'after_food' | 'before_food' | 'with_food' | 'empty_stomach'
                          )
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="after_food">After Food</option>
                        <option value="with_food">With Food</option>
                        <option value="before_food">Before Food</option>
                        <option value="empty_stomach">Empty Stomach</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Prescription</span>
                    </button>
                  </div>
                </form>

                {/* Prescriptions List */}
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4 text-teal-700" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{med.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {med.dosage} • {med.frequency} • Directive: {med.foodInstruction.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-teal-800 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>{med.times.join(', ')}</span>
                        </div>

                        <button
                          onClick={() => handleRemoveMed(med.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Remove prescription"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. LINK NEW PATIENT TOOL (SPECIFICATION 5: AI MEDICAL REPORT ANALYZER WORKFLOW) */}
        {activeTab === 'link_new_patient' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Link New Patient & Intake Tool
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bridge a discharged patient to your clinical care roster. Supports manual entry and AI medical report image analysis.
              </p>
            </div>

            <form onSubmit={handleLinkPatientSubmit} className="space-y-6">
              {/* STEP 1: PATIENT IDENTIFIERS */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Patient Identifier Fields (Mandatory)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Patient Verified Google Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="patient@gmail.com"
                      value={intakeEmail}
                      onChange={(e) => setIntakeEmail(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Must match the patient's Google account
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official National ID or Passport ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1092810928"
                      value={intakeNationalId}
                      onChange={(e) => setIntakeNationalId(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Civil Registry or Passport Number
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Patient Full Legal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full Legal Name"
                      value={intakeName}
                      onChange={(e) => setIntakeName(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Autofills from AI analyzer or manual entry
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 2: ADMISSION REASON / AI MEDICAL REPORT ANALYZER */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Admission Reason & Clinical Discharge Report
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Option B: Embedded AI Medical Report Image Analyzer */}
                  <AiMedicalReportAnalyzer onExtractionComplete={handleAiExtractionComplete} />

                  {/* Option A: Direct Text Input */}
                  <div className="space-y-2 pt-2">
                    <label className="block font-extrabold text-slate-900 text-xs">
                      Admission Reason / Clinical Diagnosis Text Box (Autofilled by AI or Direct Typing):
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={intakeAdmissionReason}
                      onChange={(e) => setIntakeAdmissionReason(e.target.value)}
                      placeholder="Type the admission rationale or let the AI Report Analyzer above extract it automatically..."
                      className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Primary Clinical Diagnosis
                      </label>
                      <input
                        type="text"
                        value={intakeDiagnosis}
                        onChange={(e) => setIntakeDiagnosis(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Recovery Pathway Category
                      </label>
                      <select
                        value={intakeDischargeType}
                        onChange={(e) =>
                          setIntakeDischargeType(
                            e.target.value as
                              | 'abdominal_surgery'
                              | 'cardiac_recovery'
                              | 'orthopedic'
                              | 'maternity'
                              | 'general'
                          )
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        <option value="abdominal_surgery">Abdominal Surgery & Wound Healing</option>
                        <option value="cardiac_recovery">Cardiac Recovery & Catheterization</option>
                        <option value="orthopedic">Orthopedic & Joint Mobilization</option>
                        <option value="maternity">Maternity & Postpartum Care</option>
                        <option value="general">General Outpatient Management</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: SUBMIT / INSTANT SECURE BRIDGE */}
              {intakeError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{intakeError}</span>
                </div>
              )}

              <div className="p-6 bg-teal-900 text-white rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                    <span>Instant Secure Bridge</span>
                  </h4>
                  <p className="text-xs text-teal-200 font-medium">
                    Links patient to your portal and unlocks full treatment roadmap authoring tools
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm shrink-0"
                >
                  <span>Establish Secure Bridge & Unlock Care Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* UNLINK CONFIRMATION MODAL (RULE 3: UNLINKING ONLY, NO PERMANENT DELETION) */}
        {showUnlinkConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Link2Off className="w-6 h-6 text-rose-600" />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg">
                  Unlink {activePatient.name}?
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Unlinking will remove this patient from your active doctor care roster. It does <strong>NOT delete</strong> their patient account. Once unlinked, the patient's portal reverts cleanly back to the unlinked state (<em>"You're not linked to any doctor"</em>).
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                The patient's clinical history and profile remain safely stored in the database and can be relinked anytime.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlinkConfirm(false)}
                  className="w-1/2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnlink}
                  className="w-1/2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                  <span>Confirm Unlink</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
