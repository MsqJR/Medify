'use client';

import type { Department } from '@/types/hospital';
import type { ImportRow } from '@/lib/hospital/doctorsUtils';
import { ModalPortal } from './ModalPortal';
import { Button } from '@/components/ui/Button';
import { FiX } from 'react-icons/fi';

export function ImportModal({ rows, departments, onClose, onConfirm, importing }: {
  rows: ImportRow[];
  departments: Department[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  importing: boolean;
}) {
  return (
    <ModalPortal>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <div>
            <h2 className="text-xl font-semibold text-neutral-dark">Import Preview</h2>
            <p className="text-sm text-neutral-gray mt-0.5">{rows.length} doctor(s) found. Review before importing.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-light text-neutral-gray"><FiX size={20} /></button>
        </div>
        <div className="overflow-auto flex-1 p-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-border text-left text-neutral-gray">
                {['Photo','Name','Title','Specialty','Email','Experience','Department','Bio'].map(h => (
                  <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-neutral-border/60 hover:bg-neutral-light/40">
                  <td className="px-3 py-2">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photo}
                        alt=""
                        className="h-8 w-8 rounded-full border border-neutral-border object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-neutral-gray">--</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-neutral-dark">{r.name || <span className="text-error">Missing</span>}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.title}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.specialty}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.email}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.experience}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      departments.some(d => d.name.toLowerCase() === r.department.toLowerCase())
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.department || 'General'}{' '}
                      {!departments.some(d => d.name.toLowerCase() === r.department.toLowerCase()) && '(new)'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-gray max-w-[200px] truncate">{r.bio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-border">
          <Button variant="secondary" onClick={onClose} disabled={importing}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} disabled={importing}>
            {importing ? 'Importing…' : `Import ${rows.length} Doctor(s)`}
          </Button>
        </div>
      </div>
    </ModalPortal>
  );
}
