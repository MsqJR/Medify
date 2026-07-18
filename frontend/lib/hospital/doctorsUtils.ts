import type { Doctor } from '@/types/hospital';

export interface DoctorFormData {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  email: string;
  experience: string;
  department: string;
  newDeptName: string;
  is_active: boolean;
  age: string;
  gender: string;
  image: File | null;
  image_url: string;
  imagePreview: string;
  availabilityType: 'week' | 'month' | 'year' | '';
  weeklyDays: number[];
  monthlyMonth: string;
  monthlyDayNumbers: number[];
  availabilityStartTime: string;
  availabilityEndTime: string;
  availabilitySlotDurationMinutes: number;
  availableDates: {
    date: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
  }[];
}

export interface ImportRow {
  name: string;
  title: string;
  specialty: string;
  email: string;
  experience: string;
  department: string;
  bio: string;
  photo: string;
}

export const EMPTY_FORM: DoctorFormData = {
  name: '', title: '', specialty: '', bio: '', email: '',
  experience: '', department: '', newDeptName: '', is_active: true,
  age: '', gender: '',
  image: null, image_url: '', imagePreview: '',
  availabilityType: '',
  weeklyDays: [],
  monthlyMonth: new Date().toISOString().slice(0, 7),
  monthlyDayNumbers: [],
  availabilityStartTime: '',
  availabilityEndTime: '',
  availabilitySlotDurationMinutes: 0,
  availableDates: [],
};

export function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export const formatTime12h = (time: string) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hours = parseInt(h, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${m} ${suffix}`;
};

export const WEEKDAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function parseDoctorDetails(doc: Doctor) {
  if (doc.title || doc.experience) {
    return {
      title: doc.title || '',
      experience: doc.experience || '',
      bio: doc.bio || '',
    };
  }
  const parts = (doc.bio ?? '').split(' • ').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      title: parts[0] || '',
      experience: parts[1] || '',
      bio: parts.slice(2).join(' • ').trim(),
    };
  }
  return { title: '', experience: '', bio: doc.bio ?? '' };
}

export function buildDoctorBio(form: DoctorFormData): string {
  const extraBio = form.bio.trim();
  if (extraBio) return extraBio;
  return [form.title.trim(), form.experience.trim()].filter(Boolean).join(' • ');
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export const INPUT = 'w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none';
