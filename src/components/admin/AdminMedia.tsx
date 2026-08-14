import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  UploadCloud,
  Search,
  Link2,
  Check,
  Trash2,
  File,
  Image as ImageIcon,
  Film,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/articleHelpers';

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const AdminMedia = () => {
  const assets = useQuery(api.media.listAssets, {}) ?? [];
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveAsset = useMutation(api.media.saveAsset);
  const removeAsset = useMutation(api.media.removeAsset);

  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageIds = useMemo(() => assets.map((a) => a.storageId), [assets]);
  const urls = useQuery(api.media.getUrls, { ids: storageIds });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.mimeType.toLowerCase().includes(q) ||
        a.kind.toLowerCase().includes(q),
    );
  }, [assets, query]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: 'POST', body: file });
      if (!res.ok) throw new Error('Upload failed.');
      const { storageId } = (await res.json()) as { storageId: string };

      let kind: 'image' | 'video' | 'file' = 'file';
      let width: number | undefined;
      let height: number | undefined;
      if (file.type.startsWith('image/')) {
        kind = 'image';
        try {
          const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error('invalid image'));
            img.src = URL.createObjectURL(file);
          });
          width = dims.width;
          height = dims.height;
        } catch {
          /* dimensions are optional */
        }
      } else if (file.type.startsWith('video/')) {
        kind = 'video';
      }

      await saveAsset({
        storageId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        kind,
        width,
        height,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = async (assetId: string, url: string | null | undefined) => {
    const text = url ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(assetId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this asset from the media library?')) return;
    await removeAsset({ id: id as never });
  };

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#B8FF4D] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Grid */}
      {!assets ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] py-24 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
            <ImageIcon size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500 max-w-sm">
            {query ? 'No media matches your search.' : 'No media yet. Upload your first file to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => {
            const url = urls?.[asset.storageId] ?? undefined;
            const copied = copiedId === asset._id;
            return (
              <div
                key={asset._id}
                className="group bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden hover:border-[#B8FF4D]/30 transition-all"
              >
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {asset.kind === 'image' && url ? (
                    <img src={url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : asset.kind === 'video' && url ? (
                    <video src={url} className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      {asset.kind === 'video' ? <Film size={32} /> : <File size={32} />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(asset._id, url)}
                      title="Copy URL"
                      className="p-2.5 rounded-xl bg-white text-black hover:bg-[#B8FF4D] transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Link2 size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(asset._id)}
                      title="Delete"
                      className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span
                    className={cn(
                      'absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
                      asset.kind === 'image'
                        ? 'bg-[#B8FF4D] text-black'
                        : asset.kind === 'video'
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-700 text-white',
                    )}
                  >
                    {asset.kind}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-xs font-bold text-white truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {formatBytes(asset.size)}
                    {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                  </p>
                  <p className="text-[10px] text-zinc-600">{relativeTime(asset.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
