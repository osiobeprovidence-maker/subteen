import React, { useRef, useState } from 'react';
import { Upload, Trash2, X, Check } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useBrandAssets } from '../../hooks/useBrandAssets';
import { BrandLogo } from '../common/BrandLogo';
import { cn } from '../../lib/utils';

type BrandKind = 'icon' | 'dark' | 'light';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

const SLOTS: {
  kind: BrandKind;
  name: string;
  type: string;
  dims: string;
  previewClass: string;
  placeholder: React.ReactNode;
  hint: string;
}[] = [
  {
    kind: 'icon',
    name: 'App / Icon Logo',
    type: 'PNG · JPG · WebP · SVG',
    dims: '512 × 512 (square)',
    previewClass: 'bg-[#B8FF4D] aspect-square rounded-[24px]',
    placeholder: <span className="text-5xl font-black text-black tracking-tighter">S</span>,
    hint: 'The standalone "S" monogram. Used for the favicon, app icon and compact mobile branding.',
  },
  {
    kind: 'dark',
    name: 'Dark Background Wordmark',
    type: 'PNG · SVG (transparent background)',
    dims: 'Wide — 600 × 200 recommended',
    previewClass: 'bg-[#0A0A0A] aspect-[3/1] rounded-[24px]',
    placeholder: <span className="text-2xl font-black text-white tracking-tighter">SUB<span className="text-[#B8FF4D]">TEEN</span></span>,
    hint: 'Full SUBTEEN wordmark for dark surfaces: header, footer and hero sections.',
  },
  {
    kind: 'light',
    name: 'Light Background Wordmark',
    type: 'PNG · SVG (transparent background)',
    dims: 'Wide — 600 × 200 recommended',
    previewClass: 'bg-white aspect-[3/1] rounded-[24px]',
    placeholder: <span className="text-2xl font-black text-black tracking-tighter">SUB<span className="text-[#B8FF4D]">TEEN</span></span>,
    hint: 'Full SUBTEEN wordmark for light surfaces: editorial, emails and light sections.',
  },
];

const KIND_URL: Record<BrandKind, (a: { iconUrl?: string; darkUrl?: string; lightUrl?: string }) => string | undefined> = {
  icon: (a) => a.iconUrl,
  dark: (a) => a.darkUrl,
  light: (a) => a.lightUrl,
};

export const BrandAssetsPanel = () => {
  const { settings, iconUrl, darkUrl, lightUrl } = useBrandAssets();
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const setBrandAsset = useMutation(api.settings.setBrandAsset);
  const clearBrandAsset = useMutation(api.settings.clearBrandAsset);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ kind: BrandKind; file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState<BrandKind | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: 'error' | 'success' } | null>(null);

  const flash = (text: string, kind: 'error' | 'success') => {
    setMessage({ text, kind });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const validate = (file: File): string | null => {
    const lower = file.name.toLowerCase();
    const okExt = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!okExt || !file.type.startsWith('image/')) {
      return 'Unsupported format. Use PNG, JPG, WebP or SVG.';
    }
    return null;
  };

  const handleSelect = (kind: BrandKind, file: File | undefined) => {
    if (!file) return;
    const invalid = validate(file);
    if (invalid) {
      flash(invalid, 'error');
      return;
    }
    if (pending) URL.revokeObjectURL(pending.preview);
    setPending({ kind, file, preview: URL.createObjectURL(file) });
  };

  const openPicker = (kind: BrandKind) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.setAttribute('data-kind', kind);
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!pending) return;
    setBusy(pending.kind);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: 'POST', body: pending.file });
      if (!res.ok) throw new Error('Upload failed.');
      const { storageId } = (await res.json()) as { storageId: string };
      await setBrandAsset({ kind: pending.kind, storageId });
      URL.revokeObjectURL(pending.preview);
      setPending(null);
      flash('Logo saved. Changes are live site-wide.', 'success');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (kind: BrandKind) => {
    setBusy(kind);
    try {
      await clearBrandAsset({ kind });
      flash('Reverted to the default asset.', 'success');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Remove failed.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleCancelPending = () => {
    if (pending) URL.revokeObjectURL(pending.preview);
    setPending(null);
  };

  const currentUrls = { iconUrl, darkUrl, lightUrl };
  const pendingUrl = (kind: BrandKind) => (pending?.kind === kind ? pending.preview : undefined);

  const fileInfo = (kind: BrandKind) => {
    const field = kind === 'icon' ? settings?.iconLogo : kind === 'dark' ? settings?.darkLogo : settings?.lightLogo;
    if (!field) return 'Default asset — not uploaded yet.';
    const by = settings?.brandUpdatedBy ?? 'an admin';
    const at = settings?.brandUpdatedAt ? new Date(settings.brandUpdatedAt).toLocaleString() : '';
    return at ? `Uploaded ${at} by ${by}` : `Uploaded by ${by}`;
  };

  return (
    <div className="space-y-10">
      <div className="bg-zinc-900/60 border border-white/5 rounded-[24px] p-6 space-y-2">
        <p className="text-sm font-bold text-white">Official brand assets</p>
        <p className="text-sm text-zinc-500 leading-relaxed">
          These three assets are the source of truth for Subteen branding. Upload them once and every
          part of the website — header, footer, auth pages, loading screen and favicon — uses the
          correct asset automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {SLOTS.map((slot) => {
          const current = KIND_URL[slot.kind](currentUrls);
          const preview = pendingUrl(slot.kind) ?? current;
          const isPending = pending?.kind === slot.kind;
          return (
            <div key={slot.kind} className="bg-zinc-950 border border-white/5 rounded-[32px] p-6 space-y-5 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{slot.name}</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{slot.type}</p>
                </div>
                {current && (
                  <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-[#B8FF4D]/10 border border-[#B8FF4D]/20 rounded-full text-[9px] font-black text-[#B8FF4D] uppercase tracking-widest">
                    <Check size={10} /> Active
                  </span>
                )}
              </div>

              <div className={cn('w-full flex items-center justify-center p-6 border border-white/5', slot.previewClass)}>
                {preview ? (
                  <img
                    src={preview}
                    alt={slot.name}
                    className={cn('object-contain', slot.kind === 'icon' ? 'max-h-24 max-w-[80%]' : 'max-h-20 max-w-[90%]')}
                  />
                ) : (
                  slot.placeholder
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-zinc-500 font-medium">{fileInfo(slot.kind)}</p>
                <p className="text-zinc-600">Recommended: {slot.dims}</p>
              </div>

              <p className="text-[11px] text-zinc-600 leading-relaxed">{slot.hint}</p>

              <div className="mt-auto flex items-center gap-3 pt-1">
                {isPending ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={busy !== null}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#B8FF4D] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white disabled:opacity-50"
                    >
                      <Check size={13} />
                      {busy === slot.kind ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelPending}
                      disabled={busy !== null}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-zinc-300 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/20 border border-white/10 disabled:opacity-50"
                    >
                      <X size={13} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openPicker(slot.kind)}
                      disabled={busy !== null}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#B8FF4D] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {busy === slot.kind ? 'Working...' : current ? 'Replace' : 'Upload'}
                    </button>
                    {current && (
                      <button
                        onClick={() => handleRemove(slot.kind)}
                        disabled={busy !== null}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const kind = (e.target.getAttribute('data-kind') ?? 'icon') as BrandKind;
          handleSelect(kind, e.target.files?.[0]);
        }}
      />

      {message && (
        <p className={cn('text-xs font-bold', message.kind === 'error' ? 'text-red-500' : 'text-[#B8FF4D]')}>
          {message.text}
        </p>
      )}

      <div className="space-y-4">
        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">How your logos appear</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Desktop header</span>
            </div>
            <div className="bg-[#0A0A0A] px-4 py-4 flex items-center justify-center min-h-[64px]">
              <BrandLogo variant="dark" className="h-6" />
            </div>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Mobile header</span>
            </div>
            <div className="bg-[#0A0A0A] px-4 py-4 flex items-center justify-center min-h-[64px]">
              <BrandLogo variant="icon" className="h-8" />
            </div>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Favicon / app icon</span>
            </div>
            <div className="bg-white px-4 py-4 flex items-center justify-center min-h-[64px]">
              <div className="w-10 h-10 rounded-lg bg-[#B8FF4D] flex items-center justify-center overflow-hidden">
                <BrandLogo variant="icon" className="w-full h-full" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-white border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <span className="text-[8px] font-black text-black/50 uppercase tracking-widest">Light header</span>
            </div>
            <div className="bg-white px-4 py-4 flex items-center justify-center min-h-[64px]">
              <BrandLogo variant="light" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
