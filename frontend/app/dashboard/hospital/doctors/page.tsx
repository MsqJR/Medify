'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/dashboard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import { normalizeCsvImageUrl } from '@/lib/productImage';
import { normalizeLogoUrl } from '@/lib/storage';
import type { Department, Doctor } from '@/types/hospital';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiUpload, FiX, FiCheck, FiAlertCircle, FiUser, FiClipboard } from 'react-icons/fi';
import { DoctorFormData, ImportRow, EMPTY_FORM, initials, formatTime12h, pad2, parseDoctorDetails, buildDoctorBio, getDaysInMonth } from '@/lib/hospital/doctorsUtils';
import { DoctorModal, ImportModal, DeleteConfirmModal, ModalPortal } from '@/components/hospital/doctors';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDepts, setOpenDepts] = useState<Set<string>>(new Set());

  // Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalDeleting, setModalDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Import state
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  // Success toast for add/edit/delete
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccessToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (updatedDoctorId?: string): Promise<boolean> => {
    setLoadError(null);
    const [docRes, deptRes] = await Promise.all([
      hospitalAdminApi.listDoctors(),
      hospitalAdminApi.listDepartments(),
    ]);
    let hasError = false;
    if (docRes.error) {
      hasError = true;
      setLoadError(`Failed to load doctors: ${docRes.error}`);
    }
    if (deptRes.error && !docRes.error) {
      hasError = true;
      setLoadError(`Failed to load departments: ${deptRes.error}`);
    }

    if (docRes.data) {
      setDoctors(docRes.data);
      if (updatedDoctorId) {
        const fresh = docRes.data.find(d => d.id === updatedDoctorId);
        if (fresh) setViewDoctor(fresh);
      }
    }
    if (deptRes.data) {
      setDepartments(deptRes.data);
      setOpenDepts(new Set(deptRes.data.map(d => d.id)));
    }
    setLoading(false);
    return !hasError;
  };

  useEffect(() => { void load(); }, []);


  // ── Filtered doctors grouped by department ─────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? doctors.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.department_name.toLowerCase().includes(q),
        )
      : doctors;
  }, [doctors, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, { dept: { id: string; name: string }; docs: Doctor[] }>();
    for (const doc of filtered) {
      const key = doc.department || 'unknown';
      if (!map.has(key)) map.set(key, { dept: { id: key, name: doc.department_name || 'Unknown' }, docs: [] });
      map.get(key)!.docs.push(doc);
    }
    return [...map.values()].sort((a, b) => a.dept.name.localeCompare(b.dept.name));
  }, [filtered]);

  const toggleDept = (id: string) => {
    setOpenDepts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Resolve or create department ───────────────────────────────────────────
  const resolveDepartment = async (form: DoctorFormData): Promise<string | null> => {
    if (form.department === '__new__') {
      if (!form.newDeptName.trim()) { setModalError('Please enter a department name.'); return null; }
      const res = await hospitalAdminApi.createDepartment({ name: form.newDeptName.trim() });
      if (res.error || !res.data) { setModalError(res.error ?? 'Failed to create department.'); return null; }
      setDepartments(prev => [...prev, res.data!]);
      return res.data.id;
    }
    if (!form.department) { setModalError('Please select a department.'); return null; }
    return form.department;
  };

  const validateAvailability = (form: DoctorFormData): boolean => {
    if (!form.availabilityType) return true;

    if (form.availabilityType === 'week') {
      if (form.weeklyDays.length === 0) {
        setModalError('Please choose at least one weekday.');
        return false;
      }
      if (!form.availabilityStartTime || !form.availabilityEndTime) {
        setModalError('Please set the availability start and end times.');
        return false;
      }
      if (!form.availabilitySlotDurationMinutes) {
        setModalError('Please select a slot duration.');
        return false;
      }
      return true;
    }

    if (form.availabilityType === 'month') {
      if (form.monthlyDayNumbers.length === 0) {
        setModalError('Please choose at least one day of the month.');
        return false;
      }
      if (!form.availabilityStartTime || !form.availabilityEndTime) {
        setModalError('Please set the availability start and end times.');
        return false;
      }
      if (!form.availabilitySlotDurationMinutes) {
        setModalError('Please select a slot duration.');
        return false;
      }
      return true;
    }

    return true;
  };

  const syncDoctorAvailability = async (doctorId: string, form: DoctorFormData): Promise<boolean> => {
    // If no availability type selected, skip syncing schedules (no-op)
    if (!form.availabilityType) return true;

    if (form.availabilityType === 'week') {
      await hospitalAdminApi.syncDoctorWeeklySchedules(doctorId, form.weeklyDays.map(day => ({
        day_of_week: day,
        start_time: form.availabilityStartTime,
        end_time: form.availabilityEndTime,
        slot_duration_minutes: form.availabilitySlotDurationMinutes,
      })));
      return true;
    }

    if (form.availabilityType === 'month') {
      if (form.monthlyDayNumbers.length === 0) {
        setModalError('Please choose at least one day of the month.');
        return false;
      }
      if (!form.availabilityStartTime || !form.availabilityEndTime) {
        setModalError('Please set the availability start and end times.');
        return false;
      }
      if (!form.availabilitySlotDurationMinutes) {
        setModalError('Please select a slot duration.');
        return false;
      }
      const [year, month] = form.monthlyMonth.split('-').map(Number);
      const daysInMonth = getDaysInMonth(year, month);
      const dates = form.monthlyDayNumbers
        .filter(day => day >= 1 && day <= daysInMonth)
        .map(day => ({
          date: `${year}-${pad2(month)}-${pad2(day)}`,
          start_time: form.availabilityStartTime,
          end_time: form.availabilityEndTime,
          slot_duration_minutes: form.availabilitySlotDurationMinutes,
        }));
      await hospitalAdminApi.syncDoctorAvailableDates(doctorId, dates);
      return true;
    }

    if (form.availableDates.length > 0) {
      await hospitalAdminApi.syncDoctorAvailableDates(doctorId, form.availableDates);
    }
    return true;
  };

  const buildDoctorPayload = (
    form: DoctorFormData,
    deptId: string,
    bio: string,
    includeActive: boolean,
  ): FormData | {
    name: string;
    title?: string;
    specialty: string;
    experience?: string;
    bio: string;
    department: string;
    image_url?: string;
    image?: null;
    is_active?: boolean;
    age?: number;
    gender?: string;
    email?: string;
  } => {
    let resolvedSpecialty = '';
    if (form.department === '__new__') {
      resolvedSpecialty = form.newDeptName.trim();
    } else {
      const dept = departments.find(d => d.id === form.department);
      if (dept) {
        resolvedSpecialty = dept.name;
      }
    }

    const shared: any = {
      name: form.name.trim(),
      specialty: resolvedSpecialty || 'General',
      bio,
      department: deptId,
      title: form.title.trim(),
      experience: form.experience.trim(),
      email: form.email.trim(),
      gender: form.gender,
      ...(form.age ? { age: Number(form.age) } : {}),
      ...(includeActive ? { is_active: form.is_active } : {}),
    };

    if (form.image) {
      const payload = new FormData();
      Object.entries(shared).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, String(value));
        }
      });
      payload.append('image', form.image);
      payload.append('image_url', '');
      return payload;
    }

    if (!form.imagePreview) {
      return {
        ...shared,
        image_url: '',
        image: null,
      };
    }

    const imageUrl = form.image_url.trim();
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return {
        ...shared,
        image_url: imageUrl,
        image: null,
      };
    }

    return shared;
  };

  // ── Add doctor ─────────────────────────────────────────────────────────────
  const handleAdd = async (form: DoctorFormData) => {
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    setModalSaving(true);
    setModalError(null);
    if (!validateAvailability(form)) { setModalSaving(false); return; }
    const deptId = await resolveDepartment(form);
    if (!deptId) { setModalSaving(false); return; }
    const bio = buildDoctorBio(form);
    const payload = buildDoctorPayload(form, deptId, bio, false);

    const res = await hospitalAdminApi.createDoctor(payload);
    if (res.error || !res.data) {
      setModalError(res.error ?? 'Failed to create doctor.');
      setModalSaving(false);
      return;
    }
    const synced = await syncDoctorAvailability(res.data.id, form);
    if (!synced) { setModalSaving(false); return; }
    const refreshed = await load();
    if (!refreshed) {
      setModalError('Doctor was saved but the list could not be refreshed. Please reload the page.');
      setModalSaving(false);
      return;
    }
    setAddOpen(false);
    setModalSaving(false);
    showSuccessToast(`${/^dr\.?\s/i.test(form.name.trim()) ? '' : 'Dr. '}${form.name.trim()} has been added successfully.`);
  };

  // ── Edit doctor ────────────────────────────────────────────────────────────
  const handleEdit = async (form: DoctorFormData) => {
    const editId = editDoctor?.id;
    if (!editId) return;
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    setModalSaving(true);
    setModalError(null);
    if (!validateAvailability(form)) { setModalSaving(false); return; }
    const deptId = await resolveDepartment(form);
    if (!deptId) { setModalSaving(false); return; }
    const bio = buildDoctorBio(form);
    const payload = buildDoctorPayload(form, deptId, bio, true);

    const res = await hospitalAdminApi.updateDoctor(editId, payload);
    if (res.error) {
      setModalError(res.error);
      setModalSaving(false);
      return;
    }
    const synced = await syncDoctorAvailability(editId, form);
    if (!synced) { setModalSaving(false); return; }
    const refreshed = await load(editId);
    if (!refreshed) {
      setModalError('Doctor was updated but the list could not be refreshed. Please reload the page.');
      setModalSaving(false);
      return;
    }
    setEditDoctor(null);
    setModalSaving(false);
    showSuccessToast(`${/^dr\.?\s/i.test(form.name.trim()) ? '' : 'Dr. '}${form.name.trim()} has been updated successfully.`);
  };

  const handleDelete = async (doc: Doctor) => {
    setModalDeleting(true);
    setModalError(null);
    const res = await hospitalAdminApi.deleteDoctor(doc.id);
    if (res.error) {
      setModalError(res.error);
      setModalDeleting(false);
      return;
    }
    const refreshed = await load();
    if (!refreshed) {
      setModalError('Doctor was deleted but the list could not be refreshed. Please reload the page.');
      setModalDeleting(false);
      return;
    }
    setDeleteTarget(null);
    if (editDoctor?.id === doc.id) {
      setEditDoctor(null);
    }
    setModalDeleting(false);
    showSuccessToast(`${doc.name} has been removed from the directory.`);
  };

  // ── Excel/CSV import ───────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
    const rows: ImportRow[] = raw.map(r => ({
      name: String(r['Name'] ?? r['name'] ?? '').trim(),
      title: String(r['Title'] ?? r['title'] ?? '').trim(),
      specialty: String(r['Specialty'] ?? r['specialty'] ?? r['Specialization'] ?? '').trim(),
      email: String(r['Email'] ?? r['email'] ?? '').trim(),
      experience: String(r['Experience'] ?? r['experience'] ?? '').trim(),
      department: String(r['Department'] ?? r['department'] ?? '').trim(),
      bio: String(r['Bio'] ?? r['bio'] ?? '').trim(),
      photo: normalizeCsvImageUrl(String(
        r['Photo'] ??
        r['photo'] ??
        r['Photo URL'] ??
        r['photo_url'] ??
        r['Image'] ??
        r['image'] ??
        r['image_url'] ??
        r['Image URL'] ??
        ''
      )),
    })).filter(r => r.name);
    if (rows.length === 0) { alert('No valid rows found. Make sure your file has a "Name" column.'); return; }
    setImportRows(rows);
  };

  const handleImportConfirm = async () => {
    if (!importRows) return;
    setImporting(true);
    let created = 0;
    // Build dept name → id map (case-insensitive)
    const deptMap = new Map<string, string>(departments.map(d => [d.name.toLowerCase(), d.id]));

    for (const row of importRows) {
      try {
        const deptKey = (row.department || 'General').toLowerCase();
        let deptId = deptMap.get(deptKey);
        if (!deptId) {
          const res = await hospitalAdminApi.createDepartment({ name: row.department || 'General' });
          if (res.data) { deptId = res.data.id; deptMap.set(deptKey, deptId); setDepartments(p => [...p, res.data!]); }
        }
        if (!deptId) continue;
        const bio = row.bio || [row.title, row.experience].filter(Boolean).join(' • ');
        const docRes = await hospitalAdminApi.createDoctor({
          name: row.name,
          title: row.title || undefined,
          specialty: row.specialty || 'General',
          experience: row.experience || undefined,
          bio,
          department: deptId,
          image_url: row.photo || undefined,
          email: row.email || undefined,
        });
        if (docRes.data) { await hospitalAdminApi.createDefaultSchedules(docRes.data.id); created++; }
      } catch { /* skip bad rows */ }
    }

    await load();
    setImportRows(null);
    setImporting(false);
    setImportSuccess(`Successfully imported ${created} doctor(s).`);
    setTimeout(() => setImportSuccess(null), 5000);
  };

  // ── Build edit initial form ─────────────────────────────────────────────────
  const editInitial = (doc: Doctor): DoctorFormData => {
    const { title, experience, bio } = parseDoctorDetails(doc);
    const resolvedImage = normalizeLogoUrl(doc.image_url_resolved || doc.image_url) || '';
    
    // Convert existing schedules to available dates format
    // Note: This assumes schedules have a specific_date field from the backend
    const availableDates = (doc.schedules || []).map(s => ({
      date: (s as any).specific_date || new Date().toISOString().split('T')[0],
      start_time: s.start_time.substring(0, 5), // HH:MM
      end_time: s.end_time.substring(0, 5),
      slot_duration_minutes: s.slot_duration_minutes,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const specificDates = (doc.schedules || [])
      .filter((s: any) => s.specific_date)
      .map((s: any) => ({
        date: s.specific_date,
        start_time: s.start_time.substring(0, 5),
        end_time: s.end_time.substring(0, 5),
        slot_duration_minutes: s.slot_duration_minutes,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const weeklyDays = (doc.schedules || [])
      .filter((s: any) => !s.specific_date)
      .map((s: any) => s.day_of_week)
      .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index)
      .sort((a: number, b: number) => a - b);

    const availabilityType = weeklyDays.length > 0 ? 'week' : specificDates.length > 0 ? 'year' : 'week';
    const availabilityStartTime = specificDates[0]?.start_time || doc.schedules?.[0]?.start_time?.substring(0, 5) || '09:00';
    const availabilityEndTime = specificDates[0]?.end_time || doc.schedules?.[0]?.end_time?.substring(0, 5) || '17:00';
    const availabilitySlotDurationMinutes = specificDates[0]?.slot_duration_minutes || doc.schedules?.[0]?.slot_duration_minutes || 30;

    const monthlyMonth = new Date().toISOString().slice(0, 7);

    return {
      name: doc.name,
      title,
      specialty: doc.specialty,
      bio,
      email: doc.email || '',
      experience,
      department: String(doc.department || ''),
      newDeptName: '',
      is_active: doc.is_active ?? true,
      age: doc.age ? String(doc.age) : '',
      gender: doc.gender || '',
      image: null,
      image_url: doc.image_url ?? '',
      imagePreview: resolvedImage,
      availabilityType,
      weeklyDays: weeklyDays.length > 0 ? weeklyDays : [1, 2, 3, 4, 5],
      monthlyMonth,
      monthlyDayNumbers: specificDates.map(d => Number(d.date.split('-')[2])).filter(Boolean),
      availabilityStartTime,
      availabilityEndTime,
      availabilitySlotDurationMinutes,
      availableDates: specificDates,
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors Directory"
        description="Manage your medical staff, grouped by department."
        actions={
          <div className="flex gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <FiUpload className="mr-2" /> Import Excel / CSV
            </Button>
            <Button variant="primary" onClick={() => { setModalError(null); setAddOpen(true); }}>
              <FiPlus className="mr-2" /> Add Doctor
            </Button>
          </div>
        }
      />

      {/* Load error banner */}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
          <FiAlertCircle className="flex-shrink-0 text-red-600" /> {loadError}
          <button onClick={() => void load()} className="ml-auto underline hover:text-red-900">Retry</button>
        </div>
      )}

      {/* Success toast — add/edit/delete */}

      {successToast && (
        <div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-2xl text-sm font-semibold animate-fade-in max-w-sm">
          <FiCheck className="flex-shrink-0" size={18} />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-auto text-white/70 hover:text-white">
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Success banner — CSV import */}
      {importSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          <FiCheck className="flex-shrink-0" /> {importSuccess}
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search doctors by name, specialty, or department…"
          className="input-field w-full md:max-w-lg"
        />
      </Card>

      {/* Import tip */}
      <div className="text-xs text-neutral-gray bg-neutral-light border border-neutral-border rounded-lg px-4 py-2">
        <FiClipboard className="inline-block w-3.5 h-3.5 mr-1" /> <strong>Excel import columns:</strong> Photo (URL), Name, Title, Specialty, Email, Experience, Department, Bio
        — departments are created automatically if they don&apos;t exist yet.
      </div>

      {/* Content */}
      {loading ? (
        <Card className="p-6 text-sm text-neutral-gray">Loading doctors…</Card>
      ) : grouped.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-neutral-gray mb-4">{search ? 'No doctors match your search.' : 'No doctors yet.'}</p>
          {!search && (
            <Button variant="primary" onClick={() => { setModalError(null); setAddOpen(true); }}>
              <FiPlus className="mr-2" /> Add your first doctor
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ dept, docs }) => {
            const isOpen = openDepts.has(dept.id);
            return (
              <Card key={dept.id} className="overflow-hidden">
                {/* Department header — clickable to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-light/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <FiChevronDown className="text-primary" size={18} /> : <FiChevronRight className="text-neutral-gray" size={18} />}
                    <span className="font-semibold text-neutral-dark text-lg">{dept.name}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold">
                      {docs.length} doctor{docs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>

                {/* Doctor rows */}
                {isOpen && (
                  <div className="border-t border-neutral-border divide-y divide-neutral-border/60">
                    {docs.map(doc => {
                      const avatarUrl = normalizeLogoUrl(doc.image_url_resolved || doc.image_url) || '';
                      return (
                        <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-light/30 transition-colors">
                          {/* Avatar */}
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center">
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarUrl} alt={doc.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              initials(doc.name)
                            )}
                          </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
                          <p className="font-medium text-neutral-dark truncate">{doc.name}</p>
                          <p className="text-sm text-primary truncate">{doc.specialty}</p>
                          <div>
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              doc.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {doc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => { setViewDoctor(doc); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-gray hover:bg-primary-light hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            <FiUser size={14} /> Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => { setModalError(null); setModalDeleting(false); setEditDoctor(doc); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-gray hover:bg-primary-light hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            <FiEdit2 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => { setModalError(null); setModalDeleting(false); setDeleteTarget(doc); }}
                            disabled={modalDeleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-sm text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {addOpen && (
        <DoctorModal
          mode="add"
          initialData={EMPTY_FORM}
          departments={departments}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
          saving={modalSaving}
          error={modalError}
        />
      )}

      {/* Edit Doctor Modal */}
      {editDoctor && (
        <DoctorModal
          mode="edit"
          initialData={editInitial(editDoctor)}
          departments={departments}
          onClose={() => { setEditDoctor(null); setModalDeleting(false); }}
          onSave={handleEdit}
          saving={modalSaving}
          error={modalError}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          doctor={deleteTarget}
          onCancel={() => { setDeleteTarget(null); setModalError(null); setModalDeleting(false); }}
          onConfirm={() => handleDelete(deleteTarget)}
          deleting={modalDeleting}
          error={modalError}
        />
      )}

      {/* Import Preview Modal */}
      {importRows && (
        <ImportModal
          rows={importRows}
          departments={departments}
          onClose={() => setImportRows(null)}
          onConfirm={handleImportConfirm}
          importing={importing}
        />
      )}

      {/* View Doctor Modal */}
      {viewDoctor && (() => {
        const profile = parseDoctorDetails(viewDoctor);
        return (
        <ModalPortal>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-border bg-gradient-to-r from-primary/10 to-transparent">
              <h2 className="text-xl font-semibold text-neutral-dark flex items-center gap-2">
                <FiUser className="text-primary" /> Doctor Profile
              </h2>
              <button onClick={() => setViewDoctor(null)} className="p-2 rounded-lg hover:bg-white/50 text-neutral-gray transition-colors">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Basic Info */}
                <div className="md:col-span-1 flex flex-col items-center text-center space-y-5">
                  <div className="h-36 w-36 overflow-hidden rounded-full shadow-xl border-4 border-white ring-4 ring-primary/20 bg-primary-light flex items-center justify-center text-5xl font-bold text-primary">
                    {viewDoctor.image_url_resolved || viewDoctor.image_url ? (
                      <img src={normalizeLogoUrl(viewDoctor.image_url_resolved || viewDoctor.image_url) || ''} alt={viewDoctor.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      initials(viewDoctor.name)
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-neutral-dark tracking-tight leading-tight">{viewDoctor.name}</h3>
                    {profile.title ? (
                      <p className="text-sm text-neutral-gray font-medium mt-1">{profile.title}</p>
                    ) : null}
                    <p className="text-base text-primary font-semibold mt-1.5">{viewDoctor.specialty}</p>
                    <p className="text-sm text-neutral-gray mt-1">{viewDoctor.department_name || '—'}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold shadow-sm ${
                        viewDoctor.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${viewDoctor.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {viewDoctor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/60 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">Experience</span>
                      <span className="font-bold text-neutral-dark">{profile.experience || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">Age</span>
                      <span className="font-bold text-neutral-dark">{viewDoctor.age ? `${viewDoctor.age} y` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">Gender</span>
                      <span className="font-bold text-neutral-dark">{viewDoctor.gender || '—'}</span>
                    </div>
                    <div className="flex flex-col items-start text-sm pt-2 border-t border-neutral-200/60 mt-2">
                      <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs mb-1">Email</span>
                      <span className="font-bold text-neutral-dark truncate w-full text-left" title={viewDoctor.email || ''}>{viewDoctor.email || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Bio & Schedule */}
                <div className="md:col-span-2 flex flex-col bg-neutral-50 rounded-2xl p-6 border border-neutral-200 shadow-sm">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Biography</h4>
                    <p className="text-base text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {profile.bio || <span className="text-neutral-400 italic">No biography available.</span>}
                    </p>
                  </div>

                  <div className="border-t border-neutral-200/80 pt-5 mt-6">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Schedule Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-center">
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Type</p>
                        <p className="text-sm font-bold text-neutral-dark capitalize">
                          {viewDoctor.schedules && viewDoctor.schedules.length > 0
                            ? (viewDoctor.schedules[0].specific_date ? 'Specific Dates' : 'Weekly')
                            : 'Not Set'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-center">
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Slot Duration</p>
                        <p className="text-sm font-bold text-neutral-dark">
                          {viewDoctor.schedules && viewDoctor.schedules.length > 0 ? `${viewDoctor.schedules[0].slot_duration_minutes} Mins` : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                      <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Active Shifts</p>
                      {viewDoctor.schedules && viewDoctor.schedules.length > 0 ? (
                        <div className="max-h-[140px] overflow-y-auto pr-2">
                          <ul className="space-y-2.5">
                            {viewDoctor.schedules.filter((s, idx, arr) => 
                              idx === arr.findIndex(t => 
                                t.specific_date === s.specific_date && 
                                t.day_of_week === s.day_of_week && 
                                t.start_time === s.start_time && 
                                t.end_time === s.end_time
                              )
                            ).map((schedule, idx) => (
                              <li key={idx} className="flex justify-between items-center text-sm text-neutral-800 border-b border-neutral-100 pb-2.5 last:border-0 last:pb-0">
                                <span className="font-bold text-neutral-dark">
                                  {schedule.specific_date 
                                    ? schedule.specific_date 
                                    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.day_of_week]}
                                </span>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-extrabold text-xs tracking-wide">
                                  {formatTime12h(schedule.start_time.substring(0, 5))} - {formatTime12h(schedule.end_time.substring(0, 5))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm italic text-neutral-400">No active shifts scheduled.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-border bg-neutral-50 flex justify-end">
              <Button variant="secondary" onClick={() => setViewDoctor(null)}>Close</Button>
            </div>
          </div>
        </ModalPortal>
        );
      })()}
    </div>
  );
}
