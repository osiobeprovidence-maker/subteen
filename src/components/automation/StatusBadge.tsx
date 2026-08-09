import React from 'react';
import { cn } from '../../lib/utils';

export type AutomationStatus =
  | 'IMPORTED'
  | 'PROCESSING'
  | 'AI_DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'FAILED';

const STYLES: Record<AutomationStatus, string> = {
  IMPORTED: 'bg-sky-400/10 text-sky-400',
  PROCESSING: 'bg-amber-400/10 text-amber-400',
  AI_DRAFT: 'bg-violet-400/10 text-violet-400',
  PENDING_REVIEW: 'bg-[#B8FF4D]/10 text-[#B8FF4D]',
  APPROVED: 'bg-emerald-400/10 text-emerald-400',
  PUBLISHED: 'bg-[#B8FF4D]/15 text-[#B8FF4D]',
  REJECTED: 'bg-red-500/10 text-red-400',
  FAILED: 'bg-red-500/15 text-red-500',
};

const LABELS: Record<AutomationStatus, string> = {
  IMPORTED: 'Imported',
  PROCESSING: 'Processing',
  AI_DRAFT: 'AI Draft',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

export const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status.toUpperCase() as AutomationStatus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
        STYLES[normalized] ?? 'bg-zinc-800 text-zinc-500',
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {LABELS[normalized] ?? status}
    </span>
  );
};

export const ActivityStatusDot = ({ status }: { status: string }) => {
  const color =
    status === 'error'
      ? 'bg-red-500'
      : status === 'warning'
        ? 'bg-amber-400'
        : status === 'success'
          ? 'bg-[#B8FF4D]'
          : 'bg-zinc-600';
  return <span className={cn('w-2 h-2 rounded-full shrink-0', color)} />;
};
