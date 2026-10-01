import { PatientProfile, DoctorProfile } from '../types';
import { DEFAULT_PATIENT } from '../data/defaultData';

const PATIENTS_DB_KEY = 'carebridge_registered_patients';
const DOCTORS_DB_KEY = 'carebridge_registered_doctors';

export function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 && age <= 130 ? age : null;
}

export function getAllPatients(): Record<string, PatientProfile> {
  try {
    const raw = localStorage.getItem(PATIENTS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getPatientByEmail(email: string): PatientProfile | null {
  if (!email) return null;
  const db = getAllPatients();
  const normalized = email.toLowerCase().trim();
  return db[normalized] || null;
}

export function savePatientToDb(profile: PatientProfile): void {
  if (!profile.email) return;
  const db = getAllPatients();
  const normalized = profile.email.toLowerCase().trim();
  db[normalized] = {
    ...profile,
    email: normalized,
  };
  localStorage.setItem(PATIENTS_DB_KEY, JSON.stringify(db));
}

export function getAllDoctors(): Record<string, DoctorProfile> {
  try {
    const raw = localStorage.getItem(DOCTORS_DB_KEY);
    if (!raw) return {};
    const db = JSON.parse(raw);
    const cleaned: Record<string, DoctorProfile> = {};
    for (const [key, doc] of Object.entries(db as Record<string, DoctorProfile>)) {
      if (doc && doc.email && !doc.email.includes('example.com') && !doc.name?.includes('Fake')) {
        cleaned[key] = doc;
      }
    }
    return cleaned;
  } catch (e) {
    return {};
  }
}

export function getDoctorByEmail(email: string): DoctorProfile | null {
  if (!email) return null;
  const db = getAllDoctors();
  const normalized = email.toLowerCase().trim();
  return db[normalized] || null;
}

export function saveDoctorToDb(profile: DoctorProfile): void {
  if (!profile.email) return;
  const db = getAllDoctors();
  const normalized = profile.email.toLowerCase().trim();
  db[normalized] = {
    ...profile,
    email: normalized,
  };
  localStorage.setItem(DOCTORS_DB_KEY, JSON.stringify(db));
}

export const COMMON_NATIONALITIES = [
  'Saudi Arabian',
  'Emirati',
  'Kuwaiti',
  'Qatari',
  'Bahraini',
  'Omani',
  'Egyptian',
  'Jordanian',
  'Lebanese',
  'Syrian',
  'Palestinian',
  'Yemeni',
  'Sudanese',
  'Iraqi',
  'Moroccan',
  'Pakistani',
  'Indian',
  'Filipino',
  'Bangladeshi',
  'British',
  'American',
  'Canadian',
  'Australian',
  'Other',
];
