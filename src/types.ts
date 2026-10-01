export type Language = 'ar' | 'en' | 'ur' | 'tl';

export type TextDirection = 'rtl' | 'ltr';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: TextDirection;
  flag: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "Every 8 hours"
  times: string[]; // e.g. ["08:00", "16:00", "24:00"]
  foodInstruction: 'before_food' | 'with_food' | 'after_food' | 'empty_stomach';
  notes: string;
  pillColor: string;
  active: boolean;
  iconType: 'pill' | 'capsule' | 'injection' | 'liquid' | 'drops';
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  actionTime: string;
  status: 'taken' | 'snoozed' | 'missed';
  notes?: string;
}

export interface RoadmapDay {
  dayNumber: number;
  title: string;
  description: string;
  milestones: {
    id: string;
    text: string;
    completed: boolean;
    category: 'activity' | 'diet' | 'wound' | 'medication';
  }[];
  allowedActivities: string[];
  restrictedActivities: string[];
  dietaryRestrictions: string[];
  redFlagsToWatch: string[];
}

export interface LinkedDoctor {
  id: string;
  name: string;
  title: string;
  hospital: string;
  department: string;
  phone: string;
  linkedAt: string;
  isPrimary: boolean;
  carePlanSummary: string;
}

export interface PatientProfile {
  id?: string;
  name: string;
  mrn: string; // Medical Record Number
  age: number;
  gender: string;
  hospitalName: string;
  doctorName: string;
  doctorPhone: string;
  emergencyPhone: string; // e.g. 997 or hospital line
  dischargeDate: string;
  surgeryDate?: string;
  diagnosis: string;
  admissionReason?: string;
  medicalReportSummary?: string;
  dischargeType: 'abdominal_surgery' | 'cardiac_recovery' | 'orthopedic' | 'maternity' | 'general';
  admissionStatus: 'inpatient_locked' | 'discharged_active';
  dischargeToken: string;
  isVerifiedAccount: boolean;
  isDoctorLocked: boolean;
  username?: string;
  email?: string;
  password?: string;
  nationalIdOrPassport?: string;
  dateOfBirth?: string;
  nationality?: string;
  occupationStatus?: 'employed' | 'student' | 'self_employed' | 'homemaker' | 'retired' | 'other';
  occupationOrStudy?: string;
  generalInfo?: string;
  isLinkedToDoctor?: boolean;
  biometricVerified?: boolean;
  biometricToken?: string;
  linkedDoctors?: LinkedDoctor[];
  activeDoctorId?: string;
  isAccountTerminated?: boolean;
  physicianSignature?: string;
  physicianLicenseNo?: string;
}

export interface DoctorProfile {
  id?: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  age?: number;
  nationality?: string;
  medicalLicenseId?: string;
  hospitalName?: string;
  specialty?: string;
  clinicalRank?: string;
  generalInfo?: string;
  isVerified?: boolean;
}

export interface SymptomAssessment {
  id: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  heartRateBPM: number;
  temperatureC: number;
  painLevel: number; // 1-10
  woundCondition: 'clean' | 'mild_redness' | 'swollen' | 'pus_discharge' | 'bleeding' | 'not_applicable';
  dizziness: boolean;
  shortnessOfBreath: boolean;
  nauseaVomiting: boolean;
  inabilityToEat: boolean;
  dvtCalfScreening: boolean; // One-sided calf pain or swelling
  riskLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
  recommendation: string;
  summaryText: string;
}

export interface AlarmTriggerState {
  isOpen: boolean;
  medication: Medication | null;
  scheduledTime: string;
  alarmSounding: boolean;
}

export interface EducationalArticle {
  id: string;
  category: 'wound_care' | 'dvt_prevention' | 'nutrition' | 'medication_safety' | 'warning_signs';
  readTimeMinutes: number;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  content: Record<Language, string[]>;
  keyTakeaways: Record<Language, string[]>;
  icon: string;
}

export interface VideoGuide {
  id: string;
  category: 'wound_care' | 'dvt_prevention' | 'nutrition' | 'medication_safety' | 'warning_signs';
  duration: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  thumbnailBg: string;
  videoUrlPlaceholder: string;
  chapters: Record<Language, { time: string; title: string }[]>;
}

export interface FAQItem {
  id: string;
  category: string;
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export interface PrescriptionRequest {
  id: string;
  medicineName: string;
  dosage: string;
  times: string[];
  instructions: string;
  notes: string;
  status: 'pending' | 'approved' | 'disapproved';
  prescriptionImageUrl?: string;
  requestedAt: string;
}


