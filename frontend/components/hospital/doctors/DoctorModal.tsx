'use client';

import { useRef, useState } from 'react';
import type { Department } from '@/types/hospital';
import type { DoctorFormData } from '@/lib/hospital/doctorsUtils';
import { INPUT, WEEKDAYS, getDaysInMonth } from '@/lib/hospital/doctorsUtils';
import { Field } from './Field';
import { ModalPortal } from './ModalPortal';
import { Button } from '@/components/ui/Button';
import { FiX, FiAlertCircle, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

interface DoctorModalProps {
  mode: 'add' | 'edit';
  initialData: DoctorFormData;
  departments: Department[];
  onClose: () => void;
  onSave: (data: DoctorFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
}

export function DoctorModal({ mode, initialData, departments, onClose, onSave, saving, error }: DoctorModalProps) {
  const [form, setForm] = useState<DoctorFormData>(initialData);
  const set = (k: keyof DoctorFormData, v: string | number | boolean | File | null) => setForm(f => ({ ...f, [k]: v }));
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = form.imagePreview || form.image_url;

  const toggleWeeklyDay = (day: number) => {
    setForm(prev => {
      const days = prev.weeklyDays.includes(day)
        ? prev.weeklyDays.filter(d => d !== day)
        : [...prev.weeklyDays, day].sort((a, b) => a - b);
      return { ...prev, weeklyDays: days };
    });
  };

  const toggleMonthlyDay = (day: number) => {
    setForm(prev => {
      const days = prev.monthlyDayNumbers.includes(day)
        ? prev.monthlyDayNumbers.filter(d => d !== day)
        : [...prev.monthlyDayNumbers, day].sort((a, b) => a - b);
      return { ...prev, monthlyDayNumbers: days };
    });
  };

  const renderAvailabilityInputs = () => {
    if (!form.availabilityType) {
      return (
        <p className="text-sm text-neutral-400 italic">Select an availability type above to continue.</p>
      );
    }
    if (form.availabilityType === 'week') {
      return (
        <>
          <p className="text-sm text-neutral-gray mb-3">
            Select which weekdays the doctor is available, then choose a daily time window.
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {WEEKDAYS.map(day => (
              <button
                key={day.day}
                type="button"
                onClick={() => toggleWeeklyDay(day.day)}
                className={`rounded-xl border px-2 py-2 text-sm font-medium transition ${form.weeklyDays.includes(day.day)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-dark border-neutral-border hover:border-neutral-border/80'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (form.availabilityType === 'month') {
      const [year, month] = form.monthlyMonth.split('-').map(Number);
      const daysInMonth = getDaysInMonth(year, month);
      const dayButtons = Array.from({ length: Math.min(daysInMonth, 31) }, (_, idx) => idx + 1);
      return (
        <>
          <p className="text-sm text-neutral-gray mb-3">
            Choose the days of the month when the doctor is available, then set the time range.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Month</label>
              <input
                type="month"
                value={form.monthlyMonth}
                onChange={e => set('monthlyMonth', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Selected days</label>
              <div className="text-sm text-neutral-gray">
                {form.monthlyDayNumbers.length > 0 ? form.monthlyDayNumbers.join(', ') : 'None selected'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4 max-h-44 overflow-y-auto border border-neutral-border rounded-lg p-3 bg-white">
            {dayButtons.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleMonthlyDay(day)}
                className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${form.monthlyDayNumbers.includes(day)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-neutral-light text-neutral-dark border-neutral-border hover:border-neutral-border/80'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-neutral-gray mb-3">
          Add specific dates for availability. Each selected date will be saved as a date-specific schedule.
        </p>
        <div className="bg-neutral-light/50 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">Date</label>
              <input
                type="date"
                id="new-date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-2 py-1.5 border border-neutral-border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">Slot Duration</label>
              <select
                id="new-slot-duration"
                defaultValue="30"
                className="w-full px-2 py-1.5 border border-neutral-border rounded text-sm"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">Start Time</label>
              <input
                type="time"
                id="new-start-time"
                defaultValue="09:00"
                className="w-full px-2 py-1.5 border border-neutral-border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-gray mb-1">End Time</label>
              <input
                type="time"
                id="new-end-time"
                defaultValue="17:00"
                className="w-full px-2 py-1.5 border border-neutral-border rounded text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const dateInput = document.getElementById('new-date') as HTMLInputElement;
              const startInput = document.getElementById('new-start-time') as HTMLInputElement;
              const endInput = document.getElementById('new-end-time') as HTMLInputElement;
              const slotInput = document.getElementById('new-slot-duration') as HTMLSelectElement;

              if (!dateInput.value) {
                alert('Please select a date');
                return;
              }

              const newDate = {
                date: dateInput.value,
                start_time: startInput.value,
                end_time: endInput.value,
                slot_duration_minutes: Number(slotInput.value),
              };

              if (form.availableDates.some(d => d.date === newDate.date)) {
                alert('This date is already added');
                return;
              }

              setForm({
                ...form,
                availableDates: [...form.availableDates, newDate].sort((a, b) => a.date.localeCompare(b.date)),
              });

              dateInput.value = '';
              startInput.value = '09:00';
              endInput.value = '17:00';
              slotInput.value = '30';
            }}
          >
            <FiPlus className="mr-1" /> Add Date
          </Button>
        </div>

        {form.availableDates.length === 0 ? (
          <p className="text-sm text-neutral-gray italic py-3 text-center border border-dashed border-neutral-border rounded-lg">
            No available dates added yet. Add dates above.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {form.availableDates.map((dateSlot, idx) => {
              const dateObj = new Date(dateSlot.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return (
                <div key={idx} className="flex items-center justify-between bg-white border border-neutral-border rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-dark text-sm">{formattedDate}</p>
                    <p className="text-xs text-neutral-gray mt-0.5">
                      {dateSlot.start_time} - {dateSlot.end_time} • {dateSlot.slot_duration_minutes} min slots
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      availableDates: form.availableDates.filter((_, i) => i !== idx),
                    })}
                    className="text-error hover:text-error/80 p-2"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <ModalPortal>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <h2 className="text-xl font-semibold text-neutral-dark">
            {mode === 'add' ? 'Add New Doctor' : 'Edit Doctor'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-light text-neutral-gray">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <FiAlertCircle className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <div className="space-y-4 rounded-3xl border border-neutral-border bg-neutral-light/60 p-4">
              <h3 className="text-base font-semibold text-neutral-dark">Department & Availability</h3>

              <Field label="Department" required>
                <select className={INPUT} value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">-- Select department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                  <option value="__new__">+ Create new department…</option>
                </select>
              </Field>

              {form.department === '__new__' && (
                <Field label="New Department Name" required>
                  <input className={INPUT} value={form.newDeptName} placeholder="e.g. Neurology"
                    onChange={e => set('newDeptName', e.target.value)} />
                </Field>
              )}

              <Field label="Availability type" required>
                <div className="grid grid-cols-3 gap-2">
                  {(['week', 'month', 'year'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('availabilityType', type)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${form.availabilityType === type
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-dark border-neutral-border hover:border-neutral-border/80'
                      }`}
                    >
                      {type === 'week' ? 'Week' : type === 'month' ? 'Month' : 'Year'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Availability window" required>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">Start time</label>
                    <input
                      type="time"
                      value={form.availabilityStartTime}
                      onChange={e => set('availabilityStartTime', e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">End time</label>
                    <input
                      type="time"
                      value={form.availabilityEndTime}
                      onChange={e => set('availabilityEndTime', e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>
              </Field>

              <Field label="Slot duration" required>
                <select
                  value={String(form.availabilitySlotDurationMinutes || '')}
                  onChange={e => set('availabilitySlotDurationMinutes', Number(e.target.value))}
                  className={INPUT}
                >
                  <option value="">-- Select slot duration --</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </Field>

              <div className="rounded-2xl border border-neutral-border bg-white p-4">
                {renderAvailabilityInputs()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" required>
                  <input className={INPUT} value={form.name} placeholder="Dr. Ahmed Ali"
                    onChange={e => set('name', e.target.value)} />
                </Field>
                <Field label="Title">
                  <input className={INPUT} value={form.title} placeholder="Consultant Cardiologist"
                    onChange={e => set('title', e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Experience">
                  <input
                    className={INPUT}
                    type="number"
                    min="0"
                    value={form.experience}
                    placeholder="e.g. 10"
                    onChange={e => set('experience', e.target.value)}
                  />
                </Field>
                <Field label="Age">
                  <input className={INPUT} type="number" value={form.age} placeholder="e.g. 45"
                    onChange={e => set('age', e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender">
                  <select className={INPUT} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">-- Select gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </Field>
                <Field label="Email">
                  <input className={INPUT} type="email" value={form.email} placeholder="doctor@hospital.com"
                    onChange={e => set('email', e.target.value)} />
                </Field>
              </div>

              <Field label="Bio">
                <textarea className={INPUT + ' resize-none'} rows={3} value={form.bio}
                  placeholder="Brief biography..."
                  onChange={e => set('bio', e.target.value)} />
              </Field>

              <Field label="Photo">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-neutral-border bg-neutral-light flex items-center justify-center">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Doctor" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-neutral-gray">No photo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setForm((prev) => ({
                          ...prev,
                          image: file,
                          imagePreview: file ? URL.createObjectURL(file) : '',
                          image_url: file ? '' : prev.image_url,
                        }));
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={() => imageInputRef.current?.click()}>
                      <FiUpload className="mr-2" /> Import Photo
                    </Button>
                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image: null, imagePreview: '', image_url: '' }))}
                        className="text-xs text-error hover:underline text-left"
                      >
                        Remove photo
                      </button>
                    ) : null}
                  </div>
                </div>
              </Field>

              {mode === 'edit' && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => set('is_active', e.target.checked)}
                    className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm font-medium text-neutral-dark">Active (visible on website)</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-6 border-t border-neutral-border sm:flex-row sm:items-center sm:justify-end">
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={() => onSave(form)} disabled={saving}>
              {saving ? 'Saving…' : mode === 'add' ? 'Add Doctor' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
