import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  Lock,
  Mail,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
  Key,
  RotateCcw,
  UserCheck,
  UserPlus,
  LogIn,
  HelpCircle,
  Globe,
  Check,
  Award,
  Briefcase,
  FileBadge,
  Fingerprint,
  Scan,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { Language, LanguageInfo, PatientProfile, DoctorProfile } from '../types';
import { GoogleOAuthModal, GoogleOAuthResult } from './GoogleOAuthModal';
import { BiometricVerificationModal } from './BiometricVerificationModal';
import { BiometricVerificationResult } from '../utils/webauthn';
import {
  calculateAge,
  COMMON_NATIONALITIES,
  getPatientByEmail,
  getDoctorByEmail,
  savePatientToDb,
  saveDoctorToDb,
} from '../utils/userDatabase';

export interface PatientRegistrationData {
  name: string;
  email: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  nationalId: string;
  occupationStatus?: 'employed' | 'student' | 'self_employed' | 'homemaker' | 'retired' | 'other';
  occupationOrStudy?: string;
  generalInfo?: string;
  biometricVerified?: boolean;
  biometricToken?: string;
}

export interface DoctorRegistrationData {
  fullName: string;
  email: string;
  dateOfBirth?: string;
  age?: number;
  nationality?: string;
  licenseId: string;
  hospitalName?: string;
  specialty: string;
  clinicalRank: 'Consultant' | 'Specialist' | 'Resident' | 'Fellow' | 'Attending Physician' | 'Trainee';
  occupationOrStudy?: string;
  generalInfo?: string;
}

interface UnifiedLandingRoleSelectionProps {
  currentLang: Language;
  onLanguageChange?: (lang: Language) => void;
  onSelectRole: (
    role: 'patient' | 'doctor' | 'admin',
    credentials?: {
      email?: string;
      name?: string;
      nationalId?: string;
      biometricVerified?: boolean;
      biometricToken?: string;
      patientInfo?: PatientRegistrationData;
      doctorInfo?: DoctorRegistrationData;
    }
  ) => void;
}

const LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ur', name: 'اردو', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', dir: 'ltr', flag: '🇵🇭' },
];

const SPECIALTIES = [
  'General Surgery',
  'Cardiology',
  'Orthopedics',
  'Emergency Medicine',
  'Clinical Engineering',
  'Internal Medicine',
  'Neurology',
  'Pediatrics',
];

const CLINICAL_RANKS = [
  'Consultant',
  'Specialist',
  'Resident',
  'Fellow',
  'Attending Physician',
  'Trainee',
] as const;

export const MOCK_PATIENT_PROFILE: PatientProfile = {
  name: 'Khaled Al-Faisal (Mock Patient)',
  mrn: 'KFSH-MOCK-992',
  age: 31,
  gender: 'Male',
  nationality: 'Saudi Arabian',
  dateOfBirth: '1995-04-12',
  occupationStatus: 'employed' as const,
  occupationOrStudy: 'IT Specialist / Consultant',
  hospitalName: 'King Faisal Specialist Hospital & Research Centre',
  doctorName: 'Dr. Sarah Al-Mansoor (Mock Doctor)',
  doctorPhone: '+966 55 123 4567',
  emergencyPhone: '997',
  dischargeDate: '2026-09-18',
  diagnosis: 'Post-Op Laparoscopic recovery plan',
  dischargeType: 'abdominal_surgery' as const,
  admissionStatus: 'discharged_active' as const,
  dischargeToken: 'CB-2026-MOCK',
  isVerifiedAccount: true,
  isDoctorLocked: false,
  email: 'khaled.mock@carebridge.org',
  nationalIdOrPassport: '1092819280',
  isLinkedToDoctor: true,
  activeDoctorId: 'doc-mock',
  linkedDoctors: [
    {
      id: 'doc-mock',
      name: 'Dr. Sarah Al-Mansoor (Mock Doctor)',
      title: 'Senior Surgical Consultant',
      hospital: 'King Faisal Specialist Hospital & Research Centre',
      department: 'General Surgery & Recovery',
      phone: '+966 55 123 4567',
      linkedAt: '2026-09-18',
      isPrimary: true,
      carePlanSummary: 'Post-Op Laparoscopic recovery plan',
    }
  ],
  isAccountTerminated: false,
};

export const MOCK_DOCTOR_PROFILE: DoctorProfile = {
  name: 'Dr. Sarah Al-Mansoor (Mock Doctor)',
  email: 'sarah.mock@carebridge.org',
  dateOfBirth: '1982-11-20',
  age: 43,
  nationality: 'Saudi Arabian',
  medicalLicenseId: 'SCFHS-MOCK-55201',
  hospitalName: 'King Faisal Specialist Hospital & Research Centre',
  specialty: 'General Surgery',
  clinicalRank: 'Consultant',
  generalInfo: 'Inpatient Surgery & Post-Op Unit',
  isVerified: true,
};

export const MOCK_ADMIN_PROFILE = {
  name: 'Admin Fahad Al-Harbi (Mock Admin)',
  email: 'fahad.admin@carebridge.org',
  hospitalName: 'King Faisal Specialist Hospital & Research Centre',
};

export const UnifiedLandingRoleSelection: React.FC<UnifiedLandingRoleSelectionProps> = ({
  currentLang,
  onLanguageChange,
  onSelectRole,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLang);
  const isRtl = selectedLang === 'ar' || selectedLang === 'ur';

  // Wizard state machine:
  // step 1: Role Question ("Are you a patient or doctor?")
  // step 2: Account Status Question ("Are you new or do you have an account?")
  // step 3: Patient Form OR Doctor Form
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'admin' | null>(null);
  const [accountMode, setAccountMode] = useState<'signin' | 'signup'>('signin');
  const [isNewDoctorFlow, setIsNewDoctorFlow] = useState(false);

  // Google OAuth Verified Session State
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
  const [googleToken, setGoogleToken] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [existingAccountFound, setExistingAccountFound] = useState(false);

  // WebAuthn Biometric Verification State
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [biometricResult, setBiometricResult] = useState<BiometricVerificationResult | null>(null);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  // Patient Registration inputs
  const [patientName, setPatientName] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientCalculatedAge, setPatientCalculatedAge] = useState<number | null>(null);
  const [patientNationality, setPatientNationality] = useState('Saudi Arabian');
  const [patientCustomNationality, setPatientCustomNationality] = useState('');
  const [patientOccupationStatus, setPatientOccupationStatus] = useState<
    'employed' | 'student' | 'self_employed' | 'homemaker' | 'retired' | 'other'
  >('employed');
  const [patientOccupationOrStudy, setPatientOccupationOrStudy] = useState('');
  const [patientGeneralInfo, setPatientGeneralInfo] = useState('');
  const [patientNationalId, setPatientNationalId] = useState('');

  // Doctor Registration Form State
  const [docFullName, setDocFullName] = useState('');
  const [docDob, setDocDob] = useState('');
  const [docCalculatedAge, setDocCalculatedAge] = useState<number | null>(null);
  const [docNationality, setDocNationality] = useState('Saudi Arabian');
  const [docCustomNationality, setDocCustomNationality] = useState('');
  const [docLicenseId, setDocLicenseId] = useState('');
  const [docHospitalName, setDocHospitalName] = useState('King Faisal Specialist Hospital & Research Centre');
  const [docSpecialty, setDocSpecialty] = useState('General Surgery');
  const [docRank, setDocRank] = useState<
    'Consultant' | 'Specialist' | 'Resident' | 'Fellow' | 'Attending Physician' | 'Trainee'
  >('Consultant');
  const [docGeneralInfo, setDocGeneralInfo] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically seed official Mock accounts on mount for sandbox walkthrough
  React.useEffect(() => {
    try {
      // Seed Mock Patient Database if not exists
      const existingPatient = getPatientByEmail('khaled.mock@carebridge.org');
      if (!existingPatient) {
        savePatientToDb(MOCK_PATIENT_PROFILE);
      }
      // Seed Mock Doctor Database if not exists
      const existingDoctor = getDoctorByEmail('sarah.mock@carebridge.org');
      if (!existingDoctor) {
        saveDoctorToDb(MOCK_DOCTOR_PROFILE);
      }

      // Pre-seed doctor roster for Dr. Sarah's session so Khaled is immediately visible
      const savedRoster = localStorage.getItem('safah_doctor_roster');
      let rosterList = savedRoster ? JSON.parse(savedRoster) : [];
      if (!Array.isArray(rosterList)) rosterList = [];
      const hasKhaled = rosterList.some((p: any) => p.email === 'khaled.mock@carebridge.org');
      if (!hasKhaled) {
        rosterList.unshift(MOCK_PATIENT_PROFILE);
        localStorage.setItem('safah_doctor_roster', JSON.stringify(rosterList));
      }
    } catch (e) {
      console.warn('Sandbox seeding warning:', e);
    }
  }, []);

  const handleQuickLoginPatient = () => {
    // Ensure seeded
    savePatientToDb(MOCK_PATIENT_PROFILE);
    
    // Quick role selection with no Google email verification required
    onSelectRole('patient', {
      email: 'khaled.mock@carebridge.org',
      name: 'Khaled Al-Faisal (Mock Patient)',
      nationalId: '1092819280',
      biometricVerified: true,
      biometricToken: 'mock-bio-token-khaled-112',
      patientInfo: {
        name: 'Khaled Al-Faisal (Mock Patient)',
        email: 'khaled.mock@carebridge.org',
        dateOfBirth: '1995-04-12',
        age: 31,
        nationality: 'Saudi Arabian',
        nationalId: '1092819280',
        occupationStatus: 'employed',
        occupationOrStudy: 'IT Specialist / Consultant',
        generalInfo: 'Recovering well, prefers evening medication alarm.',
        biometricVerified: true,
        biometricToken: 'mock-bio-token-khaled-112',
      }
    });
  };

  const handleQuickLoginDoctor = () => {
    // Ensure seeded
    saveDoctorToDb(MOCK_DOCTOR_PROFILE);
    
    // Quick role selection with no Google email verification required
    onSelectRole('doctor', {
      email: 'sarah.mock@carebridge.org',
      name: 'Dr. Sarah Al-Mansoor (Mock Doctor)',
      nationalId: 'SCFHS-MOCK-55201',
      doctorInfo: {
        fullName: 'Dr. Sarah Al-Mansoor (Mock Doctor)',
        email: 'sarah.mock@carebridge.org',
        dateOfBirth: '1982-11-20',
        age: 43,
        nationality: 'Saudi Arabian',
        licenseId: 'SCFHS-MOCK-55201',
        hospitalName: 'King Faisal Specialist Hospital & Research Centre',
        specialty: 'General Surgery',
        clinicalRank: 'Consultant',
        generalInfo: 'Inpatient Surgery & Post-Op Unit',
      }
    });
  };

  const handleQuickLoginAdmin = () => {
    onSelectRole('admin', {
      email: 'fahad.admin@carebridge.org',
      name: 'Admin Fahad Al-Harbi (Mock Admin)',
    });
  };

  // Switch Language
  const handleSwitchLanguage = (langCode: Language) => {
    setSelectedLang(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  // Real Google OAuth 2.0 Trigger
  const handleTriggerGoogleOAuth = () => {
    setErrorMsg(null);
    setIsOAuthModalOpen(true);
  };

  const handleOAuthSuccess = (res: GoogleOAuthResult) => {
    setIsGoogleVerified(true);
    setVerifiedEmail(res.email);
    setVerifiedName(res.name);
    setGoogleToken(res.token);

    if (selectedRole === 'patient') {
      const existing = getPatientByEmail(res.email);
      if (existing) {
        setExistingAccountFound(true);
        setPatientName(existing.name || res.name);
        if (existing.dateOfBirth) {
          setPatientDob(existing.dateOfBirth);
          setPatientCalculatedAge(calculateAge(existing.dateOfBirth));
        } else if (existing.age) {
          setPatientCalculatedAge(existing.age);
        }
        if (existing.nationality) setPatientNationality(existing.nationality);
        if (existing.occupationStatus) setPatientOccupationStatus(existing.occupationStatus);
        if (existing.occupationOrStudy) setPatientOccupationOrStudy(existing.occupationOrStudy);
        if (existing.generalInfo) setPatientGeneralInfo(existing.generalInfo);
        if (existing.nationalIdOrPassport) setPatientNationalId(existing.nationalIdOrPassport);
      } else {
        setExistingAccountFound(false);
        setPatientName(res.name || res.email.split('@')[0]);
      }
    } else if (selectedRole === 'doctor') {
      const existingDoc = getDoctorByEmail(res.email);
      if (existingDoc) {
        setExistingAccountFound(true);
        setDocFullName(existingDoc.name || (res.name ? `Dr. ${res.name}` : 'Dr. Clinician'));
        if (existingDoc.dateOfBirth) {
          setDocDob(existingDoc.dateOfBirth);
          setDocCalculatedAge(calculateAge(existingDoc.dateOfBirth));
        }
        if (existingDoc.nationality) setDocNationality(existingDoc.nationality);
        if (existingDoc.medicalLicenseId) setDocLicenseId(existingDoc.medicalLicenseId);
        if (existingDoc.specialty) setDocSpecialty(existingDoc.specialty);
        if (existingDoc.clinicalRank) setDocRank(existingDoc.clinicalRank as any);
        if (existingDoc.hospitalName) setDocHospitalName(existingDoc.hospitalName);
        if (existingDoc.generalInfo) setDocGeneralInfo(existingDoc.generalInfo);
      } else {
        setExistingAccountFound(false);
        const rawName = res.name || res.email.split('@')[0];
        setDocFullName(rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`);
      }
    }
  };

  // Start Over Reset
  const handleStartAgain = () => {
    setWizardStep(1);
    setSelectedRole(null);
    setAccountMode('signin');
    setIsNewDoctorFlow(false);
    setErrorMsg(null);
    setIsGoogleVerified(false);
    setVerifiedEmail('');
    setVerifiedName('');
    setExistingAccountFound(false);
    setBiometricEnabled(false);
    setIsBiometricVerified(false);
    setBiometricResult(null);
    setPatientName('');
    setPatientDob('');
    setPatientCalculatedAge(null);
    setPatientOccupationOrStudy('');
    setPatientGeneralInfo('');
    setPatientNationalId('');
    setDocFullName('');
    setDocDob('');
    setDocCalculatedAge(null);
    setDocLicenseId('');
  };

  // Submit Patient Form
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isGoogleVerified || !verifiedEmail) {
      setErrorMsg(
        selectedLang === 'ar'
          ? 'المصادقة عبر Google مطلوبة. يرجى الضغط على "المتابعة باستخدام Google" للتحقق من بريدك أولاً.'
          : 'Google OAuth verification is mandatory. Please click "Continue with Google" to verify your email first.'
      );
      return;
    }

    if (accountMode === 'signin') {
      const existing = getPatientByEmail(verifiedEmail);
      if (!existing) {
        setErrorMsg(
          selectedLang === 'ar'
            ? 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى اختيار "تسجيل مريض جديد" (Sign Up) لإنشاء حساب أولاً.'
            : 'No existing account found for this email address. You must sign up first before signing in.'
        );
        return;
      }
    }

    if (!patientName.trim()) {
      setErrorMsg(selectedLang === 'ar' ? 'يرجى إدخال الاسم الكامل.' : 'Please enter your full name.');
      return;
    }

    if (!patientDob) {
      setErrorMsg(selectedLang === 'ar' ? 'يرجى تحديد تاريخ الميلاد.' : 'Please enter your date of birth.');
      return;
    }

    const calculatedAge = calculateAge(patientDob);
    if (calculatedAge === null) {
      setErrorMsg('Please select a valid date of birth.');
      return;
    }

    const resolvedNationality =
      patientNationality === 'Other'
        ? patientCustomNationality.trim() || 'Other'
        : patientNationality;

    if (!resolvedNationality) {
      setErrorMsg('Please select or enter your nationality.');
      return;
    }

    // If age >= 18, check occupation/study information
    if (calculatedAge >= 18 && !patientOccupationOrStudy.trim()) {
      setErrorMsg(
        selectedLang === 'ar'
          ? 'يرجى توضيح العمل أو ما تقوم بدراسته للمتابعة.'
          : 'Please specify if you have a job or what you are studying.'
      );
      return;
    }

    if (biometricEnabled && !isBiometricVerified) {
      setIsBiometricModalOpen(true);
      return;
    }

    const patientInfo: PatientRegistrationData = {
      name: patientName.trim(),
      email: verifiedEmail,
      dateOfBirth: patientDob,
      age: calculatedAge,
      nationality: resolvedNationality,
      nationalId: patientNationalId.trim() || '12345',
      occupationStatus: calculatedAge >= 18 ? patientOccupationStatus : undefined,
      occupationOrStudy: calculatedAge >= 18 ? patientOccupationOrStudy.trim() : undefined,
      generalInfo: patientGeneralInfo.trim(),
      biometricVerified: isBiometricVerified,
      biometricToken: biometricResult?.token,
    };

    onSelectRole('patient', {
      email: verifiedEmail,
      name: patientName.trim(),
      nationalId: patientNationalId.trim() || '12345',
      biometricVerified: isBiometricVerified,
      biometricToken: biometricResult?.token,
      patientInfo,
    });
  };

  // Submit Doctor Form (New Doctor or Routine Sign In)
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isGoogleVerified || !verifiedEmail) {
      setErrorMsg('Google OAuth verification is required to confirm active hospital credentials.');
      return;
    }

    if (accountMode === 'signin') {
      const existingDoc = getDoctorByEmail(verifiedEmail);
      if (!existingDoc) {
        setErrorMsg(
          selectedLang === 'ar'
            ? 'لا يوجد حساب طبيب مسجل بهذا البريد الإلكتروني. يرجى اختيار "تسجيل طبيب جديد" (Sign Up) أولاً.'
            : 'No existing doctor account found for this email address. You must sign up first before signing in.'
        );
        return;
      }
    }

    if (!docFullName.trim()) {
      setErrorMsg('Please enter your full professional doctor name.');
      return;
    }

    if (!docDob) {
      setErrorMsg('Please enter your date of birth.');
      return;
    }

    const calculatedAge = calculateAge(docDob) || 38;
    const resolvedDocNationality =
      docNationality === 'Other'
        ? docCustomNationality.trim() || 'Other'
        : docNationality;

    if (!docLicenseId.trim()) {
      setErrorMsg('Please enter your National ID / Medical License ID.');
      return;
    }

    const doctorInfo: DoctorRegistrationData = {
      fullName: docFullName.startsWith('Dr.') ? docFullName.trim() : `Dr. ${docFullName.trim()}`,
      email: verifiedEmail,
      dateOfBirth: docDob,
      age: calculatedAge,
      nationality: resolvedDocNationality,
      licenseId: docLicenseId.trim(),
      hospitalName: docHospitalName.trim() || 'King Faisal Specialist Hospital & Research Centre',
      specialty: docSpecialty,
      clinicalRank: docRank,
      generalInfo: docGeneralInfo.trim(),
    };

    onSelectRole('doctor', {
      email: verifiedEmail,
      name: doctorInfo.fullName,
      nationalId: doctorInfo.licenseId,
      doctorInfo,
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isGoogleVerified || !verifiedEmail) {
      setErrorMsg('Google OAuth verification is required to confirm active hospital admin credentials.');
      return;
    }

    onSelectRole('admin', {
      email: verifiedEmail,
      name: verifiedName || 'Hospital Admin',
    });
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-slate-100 flex flex-col justify-center items-center p-3 sm:p-6"
    >
      <div className="max-w-xl w-full mx-auto space-y-4">
        {/* Top Header Card: Brand & Language Selector */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              +
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                +Care Bridge
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {selectedLang === 'ar'
                  ? 'منصة الرعاية الانتقالية والمتابعة الطبية بعد الخروج'
                  : 'Hospital Post-Discharge & Outpatient Clinical Portal'}
              </p>
            </div>
          </div>

          {/* Language Picker */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSwitchLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  selectedLang === lang.code
                    ? 'bg-white text-teal-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sandbox Mock Accounts Bypass Panel */}
        <div className="bg-gradient-to-br from-violet-50/90 to-indigo-50/60 rounded-3xl p-5 sm:p-6 border border-violet-200 shadow-md space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              🔬
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>
                  {selectedLang === 'ar' ? 'بيئة التقييم السريع والتجريب' : 'Developer Sandbox Evaluation Mode'}
                </span>
                <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                  {selectedLang === 'ar' ? 'تجريبي مسبق' : 'Pre-seeded Mock'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {selectedLang === 'ar'
                  ? 'هذه الحسابات مجهزة مسبقاً لتسريع تجربة المنصة والتقييم السريع. عند استخدام أي حساب تجريبي، لا تحتاج للتحقق من البريد الإلكتروني أو ملء استمارات تسجيل أو مصادقة Google.'
                  : 'Pre-seeded profiles designed for rapid walkthroughs. Selecting a mock profile completely bypasses the need for email registration, Google OAuth, or typing credentials.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Mock Patient Card */}
            <div className="bg-white rounded-2xl p-4 border border-violet-100 hover:border-violet-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-black text-slate-800 text-[11px] uppercase tracking-wide">
                    {selectedLang === 'ar' ? 'مريض تجريبي' : 'Patient Profile'}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs">
                  {selectedLang === 'ar' ? 'خالد الفيصل (ملف جراحي)' : 'Khaled Al-Faisal (Surgical)'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  {selectedLang === 'ar'
                    ? 'خطة رعاية كاملة (استئصال المرارة)، منبهات أدوية مبرمجة، وقياس مؤشرات التعافي.'
                    : 'Active laparoscopic cholecystectomy care plan, medication alerts, and recovery tracker.'}
                </p>
                <div className="bg-slate-50 p-1.5 rounded-lg text-[9px] font-mono text-slate-600 space-y-0.5">
                  <div><strong>Email:</strong> khaled.mock@carebridge.org</div>
                  <div><strong>ID/Passport:</strong> 1092819280</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickLoginPatient}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 text-[11px] shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <span>🚀 {selectedLang === 'ar' ? 'دخول مريض' : 'Instant Patient'}</span>
              </button>
            </div>

            {/* Mock Doctor Card */}
            <div className="bg-white rounded-2xl p-4 border border-violet-100 hover:border-violet-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="font-black text-slate-800 text-[11px] uppercase tracking-wide">
                    {selectedLang === 'ar' ? 'طبيبة تجريبية' : 'Doctor Profile'}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs">
                  {selectedLang === 'ar' ? 'د. سارة المنصور (استشاري)' : 'Dr. Sarah Al-Mansoor (Consultant)'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  {selectedLang === 'ar'
                    ? 'طبيبة مشرفة. حساب المريض خالد الفيصل مرتبط مسبقاً بجدول مرضاها وتنبيهاتها النشطة.'
                    : 'Attending consultant. Patient Khaled is pre-linked to her clinical roster for review.'}
                </p>
                <div className="bg-slate-50 p-1.5 rounded-lg text-[9px] font-mono text-slate-600 space-y-0.5">
                  <div><strong>Email:</strong> sarah.mock@carebridge.org</div>
                  <div><strong>License ID:</strong> SCFHS-MOCK-55201</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickLoginDoctor}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 text-[11px] shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <span>🩺 {selectedLang === 'ar' ? 'دخول طبيب' : 'Instant Doctor'}</span>
              </button>
            </div>

            {/* Mock Admin Card */}
            <div className="bg-white rounded-2xl p-4 border border-violet-100 hover:border-violet-300 transition flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                  <span className="font-black text-slate-800 text-[11px] uppercase tracking-wide">
                    {selectedLang === 'ar' ? 'مدير تجريبي' : 'Admin Profile'}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs">
                  {selectedLang === 'ar' ? 'الأستاذ فهد الحربي (مدير)' : 'Admin Fahad Al-Harbi (Enterprise)'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  {selectedLang === 'ar'
                    ? 'إدارة النظام والامتثال. يراقب سجلات الأمان ومصادقة FIDO2 والأعطال السريرية.'
                    : 'Transitional care system administrator. Monitors clinical telemetry, WebAuthn & logs.'}
                </p>
                <div className="bg-slate-50 p-1.5 rounded-lg text-[9px] font-mono text-slate-600 space-y-0.5">
                  <div><strong>Email:</strong> fahad.admin@carebridge.org</div>
                  <div><strong>Access Role:</strong> Enterprise Admin</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickLoginAdmin}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 text-[11px] shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <span>💼 {selectedLang === 'ar' ? 'دخول مدير' : 'Instant Admin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Wizard Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-5">
          {/* STEP 1: Are you a patient, doctor, or admin? */}
          {wizardStep === 1 && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-black tracking-wide uppercase">
                  {selectedLang === 'ar' ? 'الخطوة 1: تحديد الهوية' : 'Step 1: Role Selection'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                  {selectedLang === 'ar' ? 'ما هي بوابتك الطبية؟' : 'Select your clinical portal'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  {selectedLang === 'ar'
                    ? 'اختر بوابتك المخصصة لتسجيل الدخول باستخدام مصادقة Google السحابية الموثقة.'
                    : 'Select your dedicated portal to authenticate via verified Google Cloud OAuth.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Option A: Patient Portal */}
                <button
                  onClick={() => {
                    setSelectedRole('patient');
                    setWizardStep(2);
                  }}
                  className="group bg-gradient-to-b from-white to-teal-50/40 hover:to-teal-100/60 border-2 border-slate-200 hover:border-teal-600 rounded-3xl p-6 text-left transition duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-teal-950">
                        {selectedLang === 'ar' ? 'أنا مريض / عائلة مريض' : 'I am a Patient'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {selectedLang === 'ar'
                          ? 'متابعة خطة التعافي بعد الخروج، المنبهات الدوائية، ومؤشرات الأعراض.'
                          : 'Post-discharge medication alarms, daily recovery roadmap, and doctor messaging.'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-teal-700 group-hover:text-teal-900">
                    <span>{selectedLang === 'ar' ? 'دخول بوابة المريض' : 'Open Patient Portal'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                {/* Option B: Doctor Portal */}
                <button
                  onClick={() => {
                    setSelectedRole('doctor');
                    setWizardStep(2);
                  }}
                  className="group bg-gradient-to-b from-white to-slate-50/70 hover:to-slate-100/90 border-2 border-slate-200 hover:border-slate-800 rounded-3xl p-6 text-left transition duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-slate-950">
                        {selectedLang === 'ar' ? 'أنا طبيب / كادر صحي' : 'I am a Doctor'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {selectedLang === 'ar'
                          ? 'إدارة المرضى الخارجيين، ضبط الجرعات، ومراجعة التنبيهات السريرية.'
                          : 'Clinical outpatient oversight, real-time alert triage, and regimen adjustment.'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-800 group-hover:text-slate-950">
                    <span>{selectedLang === 'ar' ? 'دخول بوابة الطبيب' : 'Open Clinical Portal'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                {/* Option C: Hospital Admin Portal */}
                <button
                  onClick={() => {
                    setSelectedRole('admin');
                    setWizardStep(3); // Admin bypasses Step 2 and goes directly to Step 3 Form/Quick Auth
                  }}
                  className="group bg-gradient-to-b from-white to-violet-50/40 hover:to-violet-100/60 border-2 border-slate-200 hover:border-violet-600 rounded-3xl p-6 text-left transition duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-violet-950">
                        {selectedLang === 'ar' ? 'أنا مدير مستشفى' : 'I am an Admin'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {selectedLang === 'ar'
                          ? 'مراقبة البنية التحتية، مراجعة سجلات الأمان المشفرة، والامتثال للأنظمة.'
                          : 'System administrator oversight. Monitors clinical telemetry, WebAuthn compliance, and audit logs.'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-violet-700 group-hover:text-violet-900">
                    <span>{selectedLang === 'ar' ? 'دخول بوابة الإدارة' : 'Open Admin Portal'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Account Mode or Doctor Onboarding Selection */}
          {wizardStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={handleStartAgain}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedLang === 'ar' ? 'تغيير الدور' : 'Change Role'}</span>
                </button>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedRole === 'patient'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  {selectedRole === 'patient' ? 'Patient Flow' : 'Doctor Flow'}
                </span>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedRole === 'patient'
                    ? selectedLang === 'ar'
                      ? 'تسجيل المريض'
                      : 'Patient Sign In & Registration'
                    : selectedLang === 'ar'
                    ? 'تسجيل الطبيب'
                    : 'Doctor Authentication & Registration'}
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  {selectedRole === 'patient'
                    ? 'Sign up with your personal information and verified Google Identity.'
                    : 'Sign in with your hospital Google credentials or register your clinical profile.'}
                </p>
              </div>

              {selectedRole === 'patient' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setAccountMode('signin');
                      setWizardStep(3);
                    }}
                    className="group bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-teal-600 rounded-2xl p-5 text-left transition shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {selectedLang === 'ar' ? 'تسجيل دخول (حساب موجود)' : 'Sign In to Account'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedLang === 'ar'
                          ? 'تسجيل الدخول الفوري بحسابك المسجل مسبقاً.'
                          : 'Sign in with previously registered Google account.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                      <span>{selectedLang === 'ar' ? 'دخول' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAccountMode('signup');
                      setWizardStep(3);
                    }}
                    className="group bg-teal-50/50 hover:bg-teal-100/80 border-2 border-teal-300 hover:border-teal-600 rounded-2xl p-5 text-left transition shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {selectedLang === 'ar' ? 'تسجيل مريض جديد (Sign Up)' : 'Register as New Patient'}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {selectedLang === 'ar'
                          ? 'إدخال الاسم، تاريخ الميلاد، الجنسية، ومعلومات العمل أو الدراسة.'
                          : 'Enter your name, date of birth (calculates age), nationality, and study/job info.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-teal-200 flex items-center justify-between text-xs font-bold text-teal-800">
                      <span>{selectedLang === 'ar' ? 'إنشاء حساب جديد' : 'New Sign Up'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              ) : (
                /* Doctor Options */
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      setIsNewDoctorFlow(false);
                      setAccountMode('signin');
                      setWizardStep(3);
                    }}
                    className="w-full p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-600 text-left transition shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center shrink-0">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {selectedLang === 'ar' ? 'تسجيل دخول طبيب مسجل' : 'Sign In as Existing Doctor'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {selectedLang === 'ar'
                            ? 'الدخول المباشر إلى لوحة المرضى المسجلين.'
                            : 'Access your clinical dashboard via Google Auth.'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setIsNewDoctorFlow(true);
                      setAccountMode('signup');
                      setWizardStep(3);
                    }}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-400 hover:border-teal-600 text-left transition shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-teal-950 text-sm flex items-center gap-2">
                          <span>{selectedLang === 'ar' ? 'تسجيل طبيب جديد' : 'I am a new doctor'}</span>
                          <span className="bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                            Registration
                          </span>
                        </h3>
                        <p className="text-xs text-teal-800 font-medium">
                          {selectedLang === 'ar'
                            ? 'تسجيل الاسم، التخصص الطبي، الرتبة السريرية ورقم الرخصة.'
                            : 'Register your name, date of birth, license, specialty, and clinical rank.'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FORM SUBMISSION & QUESTIONNAIRE */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setWizardStep(2)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  ← {selectedLang === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handleStartAgain}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedLang === 'ar' ? 'البدء من جديد' : 'Start Over'}</span>
                </button>
              </div>

              {/* Sandbox Mock Warning/Notice */}
              <div className="p-3.5 bg-violet-50 rounded-2xl border border-violet-200 text-xs text-violet-950">
                <span className="font-extrabold block mb-1">
                  💡 {selectedLang === 'ar' ? 'تنبيه لتسهيل التقييم وال walkthrough' : 'Evaluation Quick-Pass Notice'}
                </span>
                <p className="text-[11px] text-violet-800 leading-relaxed font-medium">
                  {selectedLang === 'ar'
                    ? 'هذه الحسابات تجريبية حالياً (Mock for now). لتجنب مصادقة Google أو كتابة البيانات، يرجى الضغط على أحد أزرار الدخول السريع (Instant Sign In) في الصندوق البنفسجي في أعلى الصفحة لتسجيل الدخول بلمسة واحدة.'
                    : 'These accounts are mock for now. If a mock is added, there is no need for email sign-in or up. Simply click one of the purple Sandbox Instant Sign-In buttons at the top of the page to login with a single click.'}
                </p>
              </div>

              {/* MANDATORY REAL GOOGLE CLOUD OAUTH BLOCK */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-teal-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Google Cloud OAuth 2.0 Identity</span>
                  </span>
                  {isGoogleVerified && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedLang === 'ar'
                    ? 'المصادقة المشفرة عبر Google تضمن التحقق من هويتك وتمنع الحسابات العشوائية.'
                    : 'Real Google Cloud authentication confirms your identity and prevents unverified accounts.'}
                </p>

                <button
                  type="button"
                  onClick={handleTriggerGoogleOAuth}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-black transition flex items-center justify-center gap-3 ${
                    isGoogleVerified
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-md hover:border-slate-400'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isGoogleVerified
                      ? `✓ Verified: ${verifiedEmail} (${verifiedName || 'User'})`
                      : 'Continue with Google / Sign in with Google'}
                  </span>
                </button>

                {isGoogleVerified && (
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Google Token Cryptographically Verified</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOAuthModalOpen(true)}
                      className="text-teal-700 hover:text-teal-900 font-bold underline"
                    >
                      {selectedLang === 'ar' ? 'تبديل الحساب' : 'Switch Google Account'}
                    </button>
                  </div>
                )}
              </div>

              {/* PATIENT REGISTRATION FORM */}
              {selectedRole === 'patient' && (
                <form onSubmit={handlePatientSubmit} className="space-y-4 text-xs">
                  {/* Verified Email (Read-Only) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'البريد الإلكتروني الموثق عبر Google' : 'Verified Google Email Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={verifiedEmail || 'Click "Continue with Google" above'}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-slate-100 text-slate-800 cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* 1. Full Patient Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'الاسم الكامل للمريض (Full Name)' : 'Patient Full Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tala Daoud"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedLang === 'ar'
                        ? 'هذا الاسم سيظهر في ملفك الطبي الرسمي والمراسلات مع المستشفى.'
                        : 'Your official name displayed on your medical chart and hospital roadmap.'}
                    </p>
                  </div>

                  {/* 2. Date of Birth & 3. Dynamic Age Calculation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        {selectedLang === 'ar' ? 'تاريخ الميلاد (Date of Birth)' : 'Date of Birth'}
                      </label>
                      {patientCalculatedAge !== null && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                            patientCalculatedAge >= 18
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-sky-100 text-sky-900 border border-sky-300'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>
                            Age: <strong>{patientCalculatedAge}</strong> years old{' '}
                            {patientCalculatedAge >= 18 ? '(Adult 18+)' : '(Minor)'}
                          </span>
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      required
                      value={patientDob}
                      onChange={(e) => {
                        setPatientDob(e.target.value);
                        setPatientCalculatedAge(calculateAge(e.target.value));
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                    />
                  </div>

                  {/* 4. Nationality */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'الجنسية (Nationality)' : 'Nationality'}
                    </label>
                    <div className="relative">
                      <select
                        value={patientNationality}
                        onChange={(e) => setPatientNationality(e.target.value)}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                      >
                        {COMMON_NATIONALITIES.map((nat) => (
                          <option key={nat} value={nat}>
                            {nat}
                          </option>
                        ))}
                      </select>
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>

                    {patientNationality === 'Other' && (
                      <input
                        type="text"
                        placeholder="Please specify your nationality..."
                        value={patientCustomNationality}
                        onChange={(e) => setPatientCustomNationality(e.target.value)}
                        className="mt-2 w-full p-3 rounded-2xl border border-teal-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                      />
                    )}
                  </div>

                  {/* 5. CONDITIONAL SECTION: IF AGE >= 18 */}
                  {patientCalculatedAge !== null && patientCalculatedAge >= 18 && (
                    <div className="p-4 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 rounded-2xl border border-teal-200/90 space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-teal-200 pb-2">
                        <Briefcase className="w-4 h-4 text-teal-700 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-teal-950 text-xs">
                            {selectedLang === 'ar'
                              ? 'معلومات العمل والدراسة (للبالغين 18 سنة فما فوق)'
                              : 'General Information & Occupation (Age 18+)'}
                          </h4>
                          <p className="text-[11px] text-teal-800 font-medium">
                            {selectedLang === 'ar'
                              ? 'هل تعمل أو تدرس؟ معلومات لمساعدتنا في تخصيص خطة نشاطك وتعافيك.'
                              : 'Do you have a job or what are you studying? General information to tailor your daily outpatient recovery.'}
                          </p>
                        </div>
                      </div>

                      {/* Employment or Study Status */}
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1.5">
                          {selectedLang === 'ar' ? 'الحالة الحالية (Current Status)' : 'Current Occupation / Study Status'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'employed', label: 'Employed / Working', labelAr: 'موظف / أعمل', icon: Briefcase },
                            { id: 'student', label: 'Student / Studying', labelAr: 'طالب / أدرس', icon: GraduationCap },
                            { id: 'self_employed', label: 'Self-Employed', labelAr: 'عمل حر / أعمال', icon: Building2 },
                            { id: 'homemaker', label: 'Homemaker', labelAr: 'رب / ربة منزل', icon: User },
                            { id: 'retired', label: 'Retired', labelAr: 'متقاعد', icon: CheckCircle2 },
                            { id: 'other', label: 'Other', labelAr: 'أخرى', icon: HelpCircle },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPatientOccupationStatus(opt.id as any)}
                              className={`p-2 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 ${
                                patientOccupationStatus === opt.id
                                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                              }`}
                            >
                              <opt.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{selectedLang === 'ar' ? opt.labelAr : opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Job Title or Field of Study */}
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          {selectedLang === 'ar'
                            ? 'المسمى الوظيفي أو التخصص الدراسي (Job Title or Field of Study)'
                            : 'Job Title or Field of Study'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            patientOccupationStatus === 'student'
                              ? 'e.g. Software Engineering Student, King Saud University'
                              : 'e.g. Project Manager, Civil Engineer, Graphic Designer...'
                          }
                          value={patientOccupationOrStudy}
                          onChange={(e) => setPatientOccupationOrStudy(e.target.value)}
                          className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                        />
                      </div>

                      {/* General Info / Lifestyle */}
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          {selectedLang === 'ar'
                            ? 'معلومات عامة إضافية عن نمط حياتك (اختياري)'
                            : 'General Information & Lifestyle (Optional)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sedentary desk work, active on feet, regular walker..."
                          value={patientGeneralInfo}
                          onChange={(e) => setPatientGeneralInfo(e.target.value)}
                          className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notice for Minor Under 18 */}
                  {patientCalculatedAge !== null && patientCalculatedAge < 18 && (
                    <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Pediatric Outpatient Care Account</span>
                        <p className="text-[11px] text-sky-800 leading-relaxed">
                          Patient is calculated as {patientCalculatedAge} years old. Medical recovery roadmap will include pediatric safeguards.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 6. Civil National ID / Passport */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar'
                        ? 'رقم الهوية الوطنية أو الإقامة أو الجواز (National ID / Passport)'
                        : 'Civil National ID, Iqama, or Passport ID'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 109281928"
                        value={patientNationalId}
                        onChange={(e) => setPatientNationalId(e.target.value)}
                        className="w-full p-3 pl-10 rounded-2xl border border-teal-300 font-mono font-bold focus:ring-2 focus:ring-teal-600 bg-teal-50/20 text-slate-900"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* 7. BIOMETRIC VERIFICATION TOGGLE (WEBAUTHN API) */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Fingerprint className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">
                            Biometric Verification (WebAuthn API)
                          </span>
                          <span className="text-[10px] text-teal-800 font-semibold">
                            Fingerprint (Touch ID) or Face ID Recognition
                          </span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = !biometricEnabled;
                          setBiometricEnabled(next);
                          if (!next) {
                            setIsBiometricVerified(false);
                            setBiometricResult(null);
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          biometricEnabled ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      Optionally enroll your local biometric sensor to quickly access your verified medical roadmap.
                    </p>

                    {biometricEnabled && (
                      <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
                        {isBiometricVerified ? (
                          <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Biometrics Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Biometric scan pending</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (!isGoogleVerified) {
                              setErrorMsg('Please click "Continue with Google" first to verify your email.');
                              return;
                            }
                            setIsBiometricModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-[11px] transition flex items-center gap-1 shadow-xs"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>{isBiometricVerified ? 'Re-verify Biometrics' : 'Scan Biometrics Now'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>
                      {selectedLang === 'ar'
                        ? 'تأكيد ودخول الملف الطبي للمريض'
                        : 'Confirm & Open Patient Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* DOCTOR REGISTRATION FORM */}
              {selectedRole === 'doctor' && (
                <form onSubmit={handleDoctorSubmit} className="space-y-4 text-xs">
                  {/* Verified Doctor Email */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'البريد الإلكتروني الموثق للطبيب' : 'Verified Clinical Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={verifiedEmail || 'Click "Continue with Google" above'}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-slate-100 text-slate-800 cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* 1. Doctor Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'الاسم المهني للطبيب' : 'Professional Doctor Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Dr. Full Name"
                        value={docFullName}
                        onChange={(e) => setDocFullName(e.target.value)}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      />
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* 2. Doctor Date of Birth & Age Calculation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        {selectedLang === 'ar' ? 'تاريخ ميلاد الطبيب' : 'Doctor Date of Birth'}
                      </label>
                      {docCalculatedAge !== null && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Age: {docCalculatedAge} years old</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      required
                      value={docDob}
                      onChange={(e) => {
                        setDocDob(e.target.value);
                        setDocCalculatedAge(calculateAge(e.target.value));
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {/* 3. Doctor Nationality */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'الجنسية (Nationality)' : 'Nationality'}
                    </label>
                    <select
                      value={docNationality}
                      onChange={(e) => setDocNationality(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    >
                      {COMMON_NATIONALITIES.map((nat) => (
                        <option key={nat} value={nat}>
                          {nat}
                        </option>
                      ))}
                    </select>
                    {docNationality === 'Other' && (
                      <input
                        type="text"
                        placeholder="Specify doctor nationality..."
                        value={docCustomNationality}
                        onChange={(e) => setDocCustomNationality(e.target.value)}
                        className="mt-2 w-full p-3 rounded-2xl border border-teal-300 font-bold bg-white text-slate-900"
                      />
                    )}
                  </div>

                  {/* 4. Medical License ID */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'رقم الرخصة الطبية / ترخيص الهيئة' : 'Medical License ID / SCFHS Reg.'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SCFHS-REG-981023"
                      value={docLicenseId}
                      onChange={(e) => setDocLicenseId(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {/* 5. Hospital Facility */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'المستشفى أو المركز الطبي' : 'Hospital / Medical Facility'}
                    </label>
                    <input
                      type="text"
                      required
                      value={docHospitalName}
                      onChange={(e) => setDocHospitalName(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {/* 6. Specialty & Clinical Rank */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {selectedLang === 'ar' ? 'التخصص الطبي' : 'Medical Specialty'}
                      </label>
                      <select
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      >
                        {SPECIALTIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {selectedLang === 'ar' ? 'الرتبة السريرية' : 'Clinical Rank'}
                      </label>
                      <select
                        value={docRank}
                        onChange={(e) => setDocRank(e.target.value as any)}
                        className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                      >
                        {CLINICAL_RANKS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* General Clinical Info */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'معلومات عامة عن القسم / العيادة (اختياري)' : 'Clinical Notes / Department (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inpatient Ward 4, Outpatient Surgery Clinic C..."
                      value={docGeneralInfo}
                      onChange={(e) => setDocGeneralInfo(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>
                      {selectedLang === 'ar'
                        ? 'تأكيد والدخول إلى لوحة الطبيب'
                        : 'Confirm & Enter Doctor Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* HOSPITAL ADMIN REGISTRATION/SIGN IN FORM */}
              {selectedRole === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
                  {/* Verified Email */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'البريد الإلكتروني الموثق للمشرف' : 'Verified Administrative Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={verifiedEmail || 'Click "Continue with Google" above'}
                        className="w-full p-3 pl-10 rounded-2xl border border-slate-300 font-bold bg-slate-100 text-slate-800 cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {selectedLang === 'ar' ? 'الاسم الثنائي / اللقب' : 'Administrator Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fahad Al-Harbi"
                      value={verifiedName || 'Admin Fahad Al-Harbi'}
                      readOnly={isGoogleVerified}
                      className="w-full p-3 rounded-2xl border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-violet-900 hover:bg-violet-850 text-white font-black rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>
                      {selectedLang === 'ar'
                        ? 'تأكيد ودخول لوحة المشرف'
                        : 'Confirm & Enter Hospital Admin Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Cloud OAuth Modal */}
      <GoogleOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        onSuccess={handleOAuthSuccess}
        roleHint={selectedRole === 'admin' ? 'patient' : selectedRole || 'patient'}
      />

      {/* WebAuthn Biometric Modal */}
      <BiometricVerificationModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        userEmail={verifiedEmail || 'user@example.com'}
        userName={selectedRole === 'doctor' ? docFullName : patientName}
        onSuccess={(result) => {
          setIsBiometricVerified(true);
          setBiometricResult(result);
        }}
      />
    </div>
  );
};
