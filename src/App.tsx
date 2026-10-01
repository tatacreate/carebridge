import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  Activity,
  History,
  BookOpen,
  ShieldCheck,
  Heart,
  Smartphone,
  Hospital,
  ChevronRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

import {
  AlarmTriggerState,
  DoseLog,
  Language,
  Medication,
  PatientProfile,
  RoadmapDay,
  SymptomAssessment,
  PrescriptionRequest,
} from './types';

import { LANGUAGES, getTranslation } from './data/translations';
import {
  DEFAULT_MEDICATIONS,
  DEFAULT_PATIENT,
  DEFAULT_ROADMAP_DAYS,
  DEFAULT_EDUCATIONAL_ARTICLES,
  DEFAULT_VIDEO_GUIDES,
  DEFAULT_FAQS,
} from './data/defaultData';
import { Header } from './components/Header';
import { SidebarNavigation, TabKey } from './components/SidebarNavigation';
import { HomeDashboard } from './components/HomeDashboard';
import { DischargeRoadmap } from './components/DischargeRoadmap';
import { MedicationAlarms } from './components/MedicationAlarms';
import { SymptomChecker } from './components/SymptomChecker';
import { FamilySync } from './components/FamilySync';
import { DoseHistory } from './components/DoseHistory';
import { EducationalResources } from './components/EducationalResources';
import { FloatingRecoveryBadge } from './components/FloatingRecoveryBadge';
import { AlarmOverlayModal } from './components/AlarmOverlayModal';
import { SettingsModal } from './components/SettingsModal';
import { InstitutionalVerificationGateway } from './components/InstitutionalVerificationGateway';
import { InpatientDormantLockScreen } from './components/InpatientDormantLockScreen';
import { UnlinkedPatientLanding } from './components/UnlinkedPatientLanding';
import { UnifiedLandingRoleSelection } from './components/UnifiedLandingRoleSelection';
import { LinkedDoctorsPanelModal } from './components/LinkedDoctorsPanelModal';
import { DoctorPortalLayout } from './components/DoctorPortalLayout';
import { HospitalAdminPortal } from './components/HospitalAdminPortal';
import { AiCompanion } from './components/AiCompanion';
import { PrescriptionScannerView } from './components/PrescriptionScannerView';
import { TutorialModal } from './components/TutorialModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  calculateAge,
  savePatientToDb,
  saveDoctorToDb,
  getPatientByEmail,
  getDoctorByEmail,
} from './utils/userDatabase';

export default function App() {
  // Primary App State
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('safah_current_lang');
    return (saved as Language) || 'ar';
  });
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const saved = localStorage.getItem('safah_active_tab');
    return (saved as TabKey) || 'home';
  });
  const [showLinkedDoctorsModal, setShowLinkedDoctorsModal] = useState(false);
  const [authRole, setAuthRole] = useState<'none' | 'patient' | 'doctor' | 'admin'>(() => {
    const saved = localStorage.getItem('safah_auth_role');
    return (saved as 'none' | 'patient' | 'doctor' | 'admin') || 'patient';
  });

  // Pill notification badge setting (Patient only, when medicine is active)
  const [showPillNotification, setShowPillNotification] = useState<boolean>(() => {
    const saved = localStorage.getItem('safah_show_pill_notif');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Onboarding Tutorial Modal state
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(() => {
    const saved = localStorage.getItem('safah_seen_tutorial');
    return !saved;
  });

  // Live Telemetry Stream state (Smart Biometric Patch)
  const [telemetry, setTelemetry] = useState({
    heartRate: 72,
    temperature: 36.8,
    ecgStatus: 'Normal Sinus Rhythm' as 'Normal Sinus Rhythm' | 'Tachycardia' | 'Arrhythmia Detected' | 'Fever Warning',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isAnomalySpiked: false,
  });

  // Automatically update telemetry subtly over time (simulating a real-time biosensor feed)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.isAnomalySpiked) {
          // Spiked vital signs (fever + tachycardia)
          const hrDelta = Math.floor(Math.random() * 5) - 2;
          const tempDelta = (Math.random() * 0.2) - 0.1;
          const newHR = Math.max(128, Math.min(142, prev.heartRate + hrDelta));
          const newTemp = Math.max(38.9, Math.min(39.5, prev.temperature + tempDelta));
          return {
            ...prev,
            heartRate: parseFloat(newHR.toFixed(0)),
            temperature: parseFloat(newTemp.toFixed(1)),
            ecgStatus: 'Tachycardia' as const,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        } else {
          // Normal slight variance
          const hrDelta = Math.floor(Math.random() * 3) - 1;
          const tempDelta = (Math.random() * 0.1) - 0.05;
          const newHR = Math.max(68, Math.min(82, prev.heartRate + hrDelta));
          const newTemp = Math.max(36.6, Math.min(37.1, prev.temperature + tempDelta));
          return {
            ...prev,
            heartRate: parseFloat(newHR.toFixed(0)),
            temperature: parseFloat(newTemp.toFixed(1)),
            ecgStatus: 'Normal Sinus Rhythm' as const,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        }
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleAnomalySpike = () => {
    setTelemetry((prev) => {
      const nextSpiked = !prev.isAnomalySpiked;
      return {
        ...prev,
        isAnomalySpiked: nextSpiked,
        heartRate: nextSpiked ? 134 : 72,
        temperature: nextSpiked ? 39.2 : 36.8,
        ecgStatus: nextSpiked ? 'Tachycardia' : 'Normal Sinus Rhythm',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    });
  };

  const [currentDoctor, setCurrentDoctor] = useState<{
    name: string;
    email: string;
    nationalId: string;
    specialty: string;
    clinicalRank: string;
  }>(() => {
    const saved = localStorage.getItem('safah_current_doctor');
    return saved ? JSON.parse(saved) : {
      name: 'Attending Physician',
      email: 'physician@hospital.edu.sa',
      nationalId: '12345',
      specialty: 'Post-Op Surgical Care & Clinical Management',
      clinicalRank: 'Consultant',
    };
  });

  // Load persisted data or defaults
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('safah_patient');
    return saved ? JSON.parse(saved) : DEFAULT_PATIENT;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('safah_meds');
    return saved ? JSON.parse(saved) : DEFAULT_MEDICATIONS;
  });

  const [days, setDays] = useState<RoadmapDay[]>(() => {
    const saved = localStorage.getItem('safah_days');
    return saved ? JSON.parse(saved) : DEFAULT_ROADMAP_DAYS;
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('safah_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [symptomAssessments, setSymptomAssessments] = useState<SymptomAssessment[]>(() => {
    const saved = localStorage.getItem('safah_assessments');
    return saved ? JSON.parse(saved) : [];
  });

  const [prescriptionRequests, setPrescriptionRequests] = useState<PrescriptionRequest[]>(() => {
    const saved = localStorage.getItem('safah_approval_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [doctorRoster, setDoctorRoster] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem('safah_doctor_roster');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (p: PatientProfile) =>
            p.email !== 'sarah.otaibi@example.com' &&
            p.id !== 'p-102' &&
            !p.email?.includes('example.com')
        );
      } catch (e) {}
    }
    // Only include authentic patient if linked to doctor
    if (patient.isLinkedToDoctor && patient.email && !patient.email.includes('example.com')) {
      return [patient];
    }
    return [];
  });

  const handleLogout = () => {
    setAuthRole('none');
    localStorage.setItem('safah_authed', 'false');
    localStorage.removeItem('safah_auth_role');
    localStorage.removeItem('safah_current_lang');
    localStorage.removeItem('safah_active_tab');
    localStorage.removeItem('safah_patient');
    localStorage.removeItem('safah_current_doctor');
    localStorage.removeItem('safah_meds');
    localStorage.removeItem('safah_days');
    localStorage.removeItem('safah_logs');
    localStorage.removeItem('safah_assessments');
    localStorage.removeItem('safah_caregivers');
    localStorage.removeItem('safah_approval_requests');
    setPatient(DEFAULT_PATIENT);
    setMedications(DEFAULT_MEDICATIONS);
    setDays(DEFAULT_ROADMAP_DAYS);
    setDoseLogs([]);
    setSymptomAssessments([]);
    setActiveTab('home');
  };

  // Clean up any previously stored fake accounts from localStorage on app boot
  useEffect(() => {
    try {
      const savedRoster = localStorage.getItem('safah_doctor_roster');
      if (savedRoster) {
        const parsed = JSON.parse(savedRoster);
        const cleaned = parsed.filter(
          (p: any) =>
            p.email !== 'sarah.otaibi@example.com' &&
            p.id !== 'p-102' &&
            !p.email?.includes('example.com')
        );
        localStorage.setItem('safah_doctor_roster', JSON.stringify(cleaned));
        setDoctorRoster(cleaned);
      }

      const savedCaregivers = localStorage.getItem('safah_caregivers');
      if (savedCaregivers) {
        const parsedCg = JSON.parse(savedCaregivers);
        const cleanedCg = parsedCg.filter(
          (c: any) => !c.email?.includes('example.com') && !c.name?.includes('Al-Mansoor')
        );
        localStorage.setItem('safah_caregivers', JSON.stringify(cleanedCg));
      }

      const savedPatient = localStorage.getItem('safah_patient');
      if (savedPatient) {
        const p = JSON.parse(savedPatient);
        if (p.email === 'sarah.otaibi@example.com' || p.email?.includes('example.com')) {
          localStorage.removeItem('safah_patient');
        }
      }
    } catch (e) {}
  }, []);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [systemPermission, setSystemPermission] = useState<boolean>(false);

  // Persistent Alarm Overlay State
  const [alarmTriggerState, setAlarmTriggerState] = useState<AlarmTriggerState>({
    isOpen: false,
    medication: null,
    scheduledTime: '',
    alarmSounding: false,
  });

  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('safah_patient', JSON.stringify(patient));
  }, [patient]);

  useEffect(() => {
    localStorage.setItem('safah_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('safah_days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('safah_logs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  useEffect(() => {
    localStorage.setItem('safah_assessments', JSON.stringify(symptomAssessments));
  }, [symptomAssessments]);

  useEffect(() => {
    localStorage.setItem('safah_approval_requests', JSON.stringify(prescriptionRequests));
  }, [prescriptionRequests]);

  useEffect(() => {
    localStorage.setItem('safah_auth_role', authRole);
  }, [authRole]);

  useEffect(() => {
    localStorage.setItem('safah_current_lang', currentLang);
  }, [currentLang]);

  useEffect(() => {
    localStorage.setItem('safah_active_tab', activeTab);
  }, [activeTab]);

  // Update HTML text direction (RTL for Arabic/Urdu, LTR for English/Tagalog)
  useEffect(() => {
    const langObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
    document.documentElement.dir = langObj.dir;
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Clock Listener for Native Alarm Triggering
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHoursMins = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentSeconds = now.getSeconds();

      // Trigger at top of minute if matching medication time
      if (currentSeconds === 0) {
        for (const med of medications) {
          if (!med.active) continue;
          if (med.times.includes(currentHoursMins)) {
            // Trigger alarm overlay
            setAlarmTriggerState({
              isOpen: true,
              medication: med,
              scheduledTime: currentHoursMins,
              alarmSounding: true,
            });

            // Native Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Medication Due: ${med.name}`, {
                body: `${med.dosage} - ${med.notes}`,
                icon: '/icon.svg',
              });
            }
            break;
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [medications]);

  // Request Native System Alarm Notifications
  const handleRequestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setSystemPermission(permission === 'granted');
      });
    }
  };

  // Milestone check handler
  const handleToggleMilestone = (dayNumber: number, milestoneId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber === dayNumber) {
          return {
            ...d,
            milestones: d.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            ),
          };
        }
        return d;
      })
    );
  };

  // Manual Trigger Alarm for Demo / Simulation
  const handleTriggerAlarm = (med: Medication, timeStr: string) => {
    setAlarmTriggerState({
      isOpen: true,
      medication: med,
      scheduledTime: timeStr,
      alarmSounding: true,
    });
  };

  // Alarm Overlay Actions
  const handleConfirmTaken = (medicationId: string, medicationName: string, scheduledTime: string) => {
    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      medicationId,
      medicationName,
      scheduledTime,
      actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'taken',
    };

    setDoseLogs([newLog, ...doseLogs]);
    setAlarmTriggerState({ isOpen: false, medication: null, scheduledTime: '', alarmSounding: false });
  };

  const handleSnooze = (medicationId: string, medicationName: string, scheduledTime: string) => {
    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      medicationId,
      medicationName,
      scheduledTime,
      actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'snoozed',
      notes: 'Snoozed 10 minutes',
    };

    setDoseLogs([newLog, ...doseLogs]);
    setAlarmTriggerState({ isOpen: false, medication: null, scheduledTime: '', alarmSounding: false });

    // Schedule re-trigger in 10 minutes (or 10 seconds simulation for demo)
    setTimeout(() => {
      const med = medications.find((m) => m.id === medicationId);
      if (med) {
        setAlarmTriggerState({
          isOpen: true,
          medication: med,
          scheduledTime: 'Snooze Alert',
          alarmSounding: true,
        });
      }
    }, 10000); // 10 seconds demo snooze re-trigger
  };

  const handleSaveAssessment = (assessment: SymptomAssessment) => {
    setSymptomAssessments([assessment, ...symptomAssessments]);
  };

  const handleApprovePrescriptionRequest = (req: PrescriptionRequest) => {
    // 1. Mark request as approved
    const updatedRequests = prescriptionRequests.map((r) =>
      r.id === req.id ? { ...r, status: 'approved' as const } : r
    );
    setPrescriptionRequests(updatedRequests);

    // 2. Create the new medication
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: req.medicineName,
      dosage: req.dosage || '1 unit',
      frequency: 'Approved via AI Scan',
      times: req.times && req.times.length > 0 ? req.times : ['09:00'],
      foodInstruction: 'after_food',
      notes: req.notes || req.instructions || 'Approved via AI scanned prescription',
      pillColor: '#0f766e',
      active: true,
      iconType: 'pill',
    };

    // 3. Add to medications list
    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    localStorage.setItem('safah_meds', JSON.stringify(updatedMeds));
  };

  const handleDisapprovePrescriptionRequest = (requestId: string) => {
    const updatedRequests = prescriptionRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'disapproved' as const } : r
    );
    setPrescriptionRequests(updatedRequests);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Top Application Header (Only active for Patient/Landing/Admin; Doctor Portal operates completely isolated) */}
      {authRole !== 'doctor' && authRole !== 'admin' && (
        <Header
          currentLang={currentLang}
          onSelectLang={(lang) => setCurrentLang(lang)}
          patient={patient}
          authRole={authRole}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          pwaInstallable={isInstallable}
          onInstallPwa={install}
          isPwaInstalled={isInstalled}
          isPatientAuthed={authRole === 'patient'}
          onPatientLogout={handleLogout}
        />
      )}

      {/* Main Content Routing */}
      {authRole === 'none' ? (
        <UnifiedLandingRoleSelection
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onSelectRole={(role, credentials) => {
            if (role === 'patient') {
              setAuthRole('patient');
              localStorage.setItem('safah_authed', 'true');
              
              const isMockKhaled = credentials?.email === 'khaled.mock@carebridge.org';
              if (!isMockKhaled) {
                // Clear medications so a brand new patient starts with an empty medication list (No popups / notifications!)
                setMedications([]);
                localStorage.setItem('safah_meds', JSON.stringify([]));
              } else {
                setMedications(DEFAULT_MEDICATIONS);
                localStorage.setItem('safah_meds', JSON.stringify(DEFAULT_MEDICATIONS));
              }

              const pInfo = credentials?.patientInfo;
              const resolvedName = pInfo?.name || credentials?.name || patient.name || 'Patient';
              const resolvedDob = pInfo?.dateOfBirth || patient.dateOfBirth;
              const resolvedAge =
                pInfo?.age ||
                (resolvedDob ? calculateAge(resolvedDob) : null) ||
                patient.age ||
                24;
              const resolvedNationality = pInfo?.nationality || patient.nationality || 'Saudi Arabian';
              const resolvedOccupationStatus = pInfo?.occupationStatus || patient.occupationStatus;
              const resolvedOccupationOrStudy = pInfo?.occupationOrStudy || patient.occupationOrStudy;
              const resolvedGeneralInfo = pInfo?.generalInfo || patient.generalInfo;

              const updated: PatientProfile = {
                ...patient,
                name: resolvedName,
                email: credentials?.email || patient.email || 'taladaoud5b@gmail.com',
                dateOfBirth: resolvedDob,
                age: resolvedAge,
                nationality: resolvedNationality,
                occupationStatus: resolvedOccupationStatus,
                occupationOrStudy: resolvedOccupationOrStudy,
                generalInfo: resolvedGeneralInfo,
                nationalIdOrPassport:
                  pInfo?.nationalId ||
                  credentials?.nationalId ||
                  patient.nationalIdOrPassport ||
                  '12345',
                biometricVerified: credentials?.biometricVerified || false,
                biometricToken: credentials?.biometricToken || '',
                mrn:
                  patient.mrn && !patient.mrn.includes('KFSH-894120')
                    ? patient.mrn
                    : `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
                isAccountTerminated: false,
              };

              setPatient(updated);
              savePatientToDb(updated);
              localStorage.setItem('safah_patient', JSON.stringify(updated));
            } else if (role === 'doctor') {
              setAuthRole('doctor');
              localStorage.setItem('safah_authed', 'true');
              const dInfo = credentials?.doctorInfo;
              const resolvedDocName =
                dInfo?.fullName ||
                (credentials?.name
                  ? credentials.name.startsWith('Dr.')
                    ? credentials.name
                    : `Dr. ${credentials.name}`
                  : currentDoctor.name);
              const resolvedDob = dInfo?.dateOfBirth;
              const resolvedAge =
                dInfo?.age ||
                (resolvedDob ? calculateAge(resolvedDob) : null) ||
                38;
              const resolvedDocNationality = dInfo?.nationality || 'Saudi Arabian';

              const newDoc = {
                name: resolvedDocName,
                email: dInfo?.email || credentials?.email || currentDoctor.email,
                dateOfBirth: resolvedDob,
                age: resolvedAge,
                nationality: resolvedDocNationality,
                nationalId: dInfo?.licenseId || credentials?.nationalId || currentDoctor.nationalId,
                specialty: dInfo?.specialty || currentDoctor.specialty,
                clinicalRank: dInfo?.clinicalRank || currentDoctor.clinicalRank,
                hospitalName: dInfo?.hospitalName || 'King Faisal Specialist Hospital & Research Centre',
                generalInfo: dInfo?.generalInfo,
              };

              setCurrentDoctor(newDoc);
              saveDoctorToDb(newDoc);
              localStorage.setItem('safah_current_doctor', JSON.stringify(newDoc));
            } else if (role === 'admin') {
              setAuthRole('admin');
              localStorage.setItem('safah_authed', 'true');
            }
          }}
        />
      ) : authRole === 'doctor' ? (
        <DoctorPortalLayout
          currentLang={currentLang}
          doctorName={currentDoctor.name}
          doctorEmail={currentDoctor.email}
          doctorRank={currentDoctor.clinicalRank}
          doctorSpecialty={currentDoctor.specialty}
          hospitalName={patient.hospitalName || 'King Faisal Specialist Hospital & Research Centre'}
          linkedRoster={doctorRoster}
          activePatient={patient}
          medications={medications}
          days={days}
          doseLogs={doseLogs}
          symptomAssessments={symptomAssessments}
          prescriptionRequests={prescriptionRequests}
          onApprovePrescriptionRequest={handleApprovePrescriptionRequest}
          onDisapprovePrescriptionRequest={handleDisapprovePrescriptionRequest}
          onSelectPatient={(selectedP) => {
            setPatient(selectedP);
            localStorage.setItem('safah_patient', JSON.stringify(selectedP));
          }}
          onUpdatePatient={(updatedP) => {
            setPatient(updatedP);
            localStorage.setItem('safah_patient', JSON.stringify(updatedP));
            const updatedRoster = doctorRoster.map((p) =>
              p.mrn === updatedP.mrn || p.email === updatedP.email ? updatedP : p
            );
            setDoctorRoster(updatedRoster);
            localStorage.setItem('safah_doctor_roster', JSON.stringify(updatedRoster));
          }}
          onUpdateMedications={(updatedMeds) => {
            setMedications(updatedMeds);
            localStorage.setItem('safah_meds', JSON.stringify(updatedMeds));
          }}
          onAddPatientToRoster={(newP) => {
            const updatedRoster = [newP, ...doctorRoster];
            setDoctorRoster(updatedRoster);
            localStorage.setItem('safah_doctor_roster', JSON.stringify(updatedRoster));
          }}
          onUnlinkPatient={(patientToUnlink) => {
            const updatedRoster = doctorRoster.filter(
              (p) => p.mrn !== patientToUnlink.mrn && p.email !== patientToUnlink.email
            );
            setDoctorRoster(updatedRoster);
            localStorage.setItem('safah_doctor_roster', JSON.stringify(updatedRoster));

            // If active patient was unlinked, reset them to unlinked state
            if (patient.mrn === patientToUnlink.mrn || patient.email === patientToUnlink.email) {
              const unlinkedP: PatientProfile = {
                ...patient,
                isLinkedToDoctor: false,
                doctorName: '',
                activeDoctorId: '',
              };
              setPatient(unlinkedP);
              localStorage.setItem('safah_patient', JSON.stringify(unlinkedP));
            }
          }}
          onLogout={handleLogout}
          telemetry={telemetry}
          onToggleAnomaly={handleToggleAnomalySpike}
        />
      ) : authRole === 'admin' ? (
        <HospitalAdminPortal
          telemetry={telemetry}
          onToggleAnomaly={handleToggleAnomalySpike}
          activePatient={patient}
          currentLang={currentLang}
          onLogout={handleLogout}
        />
      ) : authRole === 'patient' && (patient.isLinkedToDoctor === false || patient.isAccountTerminated) ? (
        <UnlinkedPatientLanding
          currentLang={currentLang}
          patient={patient}
          onLinkHospitalDemo={() => {
            const updated = {
              ...patient,
              isLinkedToDoctor: true,
              isAccountTerminated: false,
            };
            setPatient(updated);
            localStorage.setItem('safah_patient', JSON.stringify(updated));
          }}
          onLogout={handleLogout}
        />
      ) : authRole === 'patient' && patient.admissionStatus === 'inpatient_locked' ? (
        <InpatientDormantLockScreen
          currentLang={currentLang}
          patient={patient}
          onLogout={handleLogout}
        />
      ) : (
        /* Main Flex Layout: Sidebar + Active Panel View */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start gap-6">
          {/* Sidebar Panel Navigation */}
          <SidebarNavigation
            currentLang={currentLang}
            activeTab={activeTab}
            patient={patient}
            onSelectTab={(tab) => {
              if (tab === 'link_doctors') {
                setShowLinkedDoctorsModal(true);
              } else if (tab === 'settings') {
                setIsCustomizerOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            onOpenSettings={() => setIsCustomizerOpen(true)}
            onOpenEmergency={() => {
              const firstMed = medications[0];
              if (firstMed) {
                handleTriggerAlarm(firstMed, 'Emergency Call');
              }
            }}
            onOpenLinkedDoctors={() => setShowLinkedDoctorsModal(true)}
            onLogout={handleLogout}
          />

          {/* Primary View Panel Area */}
          <main className="flex-1 w-full py-4 sm:py-6 space-y-4 sm:space-y-6">
            {activeTab === 'home' && (
              <HomeDashboard
                currentLang={currentLang}
                patient={patient}
                medications={medications}
                days={days}
                doseLogs={doseLogs}
                symptomAssessments={symptomAssessments}
                telemetry={telemetry}
                onToggleAnomaly={handleToggleAnomalySpike}
                onTakePill={(medId, time) => {
                  const med = medications.find((m) => m.id === medId);
                  if (med) {
                    handleConfirmTaken(med.id, med.name, time);
                  }
                }}
                onSnoozePill={(medId, time) => {
                  const med = medications.find((m) => m.id === medId);
                  if (med) {
                    handleSnooze(med.id, med.name, time);
                  }
                }}
                onToggleMilestone={handleToggleMilestone}
                onNavigateTab={(tab) => {
                  if (tab === 'settings') setIsCustomizerOpen(true);
                  else if (tab === 'link_doctors') setShowLinkedDoctorsModal(true);
                  else setActiveTab(tab);
                }}
                onOpenEmergency={() => {
                  const firstMed = medications[0];
                  if (firstMed) {
                    handleTriggerAlarm(firstMed, 'Emergency Call');
                  }
                }}
                onOpenLinkedDoctors={() => setShowLinkedDoctorsModal(true)}
              />
            )}

            {activeTab === 'roadmap' && (
              <DischargeRoadmap
                currentLang={currentLang}
                patient={patient}
                days={days}
                onToggleMilestone={handleToggleMilestone}
              />
            )}

            {activeTab === 'alarms' && (
              <MedicationAlarms
                currentLang={currentLang}
                patient={patient}
                medications={medications}
                onTriggerAlarm={handleTriggerAlarm}
                systemPermission={systemPermission}
                onRequestPermission={handleRequestPermission}
              />
            )}

            {activeTab === 'symptoms' && (
              <SymptomChecker
                currentLang={currentLang}
                patient={patient}
                onSaveAssessment={handleSaveAssessment}
              />
            )}

            {activeTab === 'ai_companion' && (
              <AiCompanion
                currentLang={currentLang}
                patient={patient}
                medications={medications}
                symptomHistory={symptomAssessments}
              />
            )}

            {activeTab === 'prescription_scanner' && (
              <PrescriptionScannerView
                currentLang={currentLang}
                patient={patient}
                prescriptionRequests={prescriptionRequests}
                onAddPrescriptionRequest={(req) => {
                  setPrescriptionRequests([req, ...prescriptionRequests]);
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating Recovery Badge Component (Patient Platform only, when pill notification is enabled and active medicine exists) */}
      {authRole === 'patient' && showPillNotification && medications.some((m) => m.active) && (
        <FloatingRecoveryBadge
          currentLanguage={currentLang}
          medications={medications}
          onTakePill={(medId) => {
            const med = medications.find((m) => m.id === medId);
            if (med) {
              handleConfirmTaken(med.id, med.name, med.times[0] || '10:00');
            }
          }}
          onSnooze={(medId) => {
            const med = medications.find((m) => m.id === medId);
            if (med) {
              handleSnooze(med.id, med.name, med.times[0] || '10:00');
            }
          }}
          symptomSeverity={
            symptomAssessments.length > 0
              ? symptomAssessments[0].riskLevel === 'CRITICAL'
                ? 'critical'
                : symptomAssessments[0].riskLevel === 'WARNING'
                ? 'warning'
                : 'normal'
              : 'normal'
          }
          onOpenEmergencyModal={() => {
            const firstMed = medications[0];
            if (firstMed) {
              handleTriggerAlarm(firstMed, 'Emergency Call');
            }
          }}
          onOpenSymptomChecker={() => setActiveTab('symptoms')}
        />
      )}

      {/* Persistent Fullscreen Alarm Overlay Modal */}
      <AlarmOverlayModal
        currentLang={currentLang}
        triggerState={alarmTriggerState}
        onConfirmTaken={handleConfirmTaken}
        onSnooze={handleSnooze}
      />

      {/* Settings & Hospital Customizer Modal */}
      {isCustomizerOpen && (
        <SettingsModal
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          patient={patient}
          authRole={authRole}
          medications={medications}
          onSave={(updatedPatient, updatedMeds) => {
            setPatient(updatedPatient);
            if (authRole === 'doctor') {
              setMedications(updatedMeds);
              localStorage.setItem('safah_meds', JSON.stringify(updatedMeds));
            }
          }}
          onClose={() => setIsCustomizerOpen(false)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          systemPermission={systemPermission}
          onRequestPermission={handleRequestPermission}
          showPillNotification={showPillNotification}
          onToggleShowPillNotification={() => {
            const nextVal = !showPillNotification;
            setShowPillNotification(nextVal);
            localStorage.setItem('safah_show_pill_notif', JSON.stringify(nextVal));
          }}
          onOpenTutorial={() => setShowTutorialModal(true)}
        />
      )}

      {/* Onboarding Tutorial Walkthrough Modal */}
      {showTutorialModal && (
        <TutorialModal
          currentLang={currentLang}
          onClose={() => {
            setShowTutorialModal(false);
            localStorage.setItem('safah_seen_tutorial', 'true');
          }}
        />
      )}

      {/* Institutional Verification Gateway Modal (if not verified) */}
      {!patient.isVerifiedAccount && (
        <InstitutionalVerificationGateway
          currentLang={currentLang}
          patient={patient}
          onVerifySuccess={() => {
            const updated = { ...patient, isVerifiedAccount: true };
            setPatient(updated);
            localStorage.setItem('safah_patient', JSON.stringify(updated));
          }}
        />
      )}

      {/* Linked Doctors Side Panel Modal */}
      {showLinkedDoctorsModal && (
        <LinkedDoctorsPanelModal
          currentLang={currentLang}
          patient={patient}
          onSelectActiveDoctor={(docId) => {
            const updated = { ...patient, activeDoctorId: docId };
            setPatient(updated);
            localStorage.setItem('safah_patient', JSON.stringify(updated));
          }}
          onClose={() => setShowLinkedDoctorsModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-sm">
              +
            </div>
            <div>
              <span className="font-bold text-slate-200">+CareBridge Post-Hospital Recovery Care</span>
              <p className="text-[11px] text-slate-500">
                Solving post-hospital readmission crises across Arab multicultural healthcare settings.
              </p>
            </div>
          </div>

          <div className="text-slate-500 text-[11px] text-center sm:text-right">
            <span>Clinical Guidance • Multi-Language Support (Arabic, English, Urdu, Tagalog)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
