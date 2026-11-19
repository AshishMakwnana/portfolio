import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#263244] bg-[#111827] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[#EF4444]">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <h2
              id="confirm-dialog-title"
              className="text-lg font-semibold text-[#F8FAFC]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#161F2E] hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex min-h-[38px] items-center justify-center rounded-lg bg-[#EF4444] px-4 py-2 text-xs font-semibold text-white hover:bg-[#DC2626] transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
