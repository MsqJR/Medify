'use client';

import type { Doctor } from '@/types/hospital';
import { ModalPortal } from './ModalPortal';
import { Button } from '@/components/ui/Button';
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';

export function DeleteConfirmModal({ doctor, onCancel, onConfirm, deleting, error }: {
  doctor: Doctor;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
  error: string | null;
}) {
  return (
    <ModalPortal>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-start gap-4 p-6 border-b border-neutral-border">
          <div className="h-11 w-11 rounded-full bg-red-50 text-error flex items-center justify-center">
            <FiTrash2 size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-neutral-dark">Delete doctor</h2>
            <p className="text-sm text-neutral-gray mt-1">
              Are you sure you want to delete <span className="font-semibold text-neutral-dark">{doctor.name}</span>? This cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <FiAlertCircle className="flex-shrink-0" /> {error}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 p-6">
          <Button variant="secondary" onClick={onCancel} disabled={deleting}>Cancel</Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Doctor'}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
