import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Check, Loader2, AlertCircle, Clapperboard } from 'lucide-react';
import * as tus from 'tus-js-client';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';

interface VideoUploadModalProps {
  open: boolean;
  articleId?: string | null;
  onCancel: () => void;
  onUploaded: (playbackId: string) => void;
}

type Phase = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

export const VideoUploadModal = ({ open, articleId, onCancel, onUploaded }: VideoUploadModalProps) => {
  const createUpload = useMutation(api.mux.createUpload);
  const refreshUpload = useMutation(api.mux.refreshUpload);
  const getPlaybackId = useMutation(api.mux.getPlaybackId);
  const saveVideo = useMutation(api.mux.saveVideo);

  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setProgress(0);
      setError(null);
      setFileName(null);
      setEmbedUrl('');
      if (pollRef.current) clearTimeout(pollRef.current);
      uploadRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const pollAsset = useCallback(
    async (uploadId: string) => {
      const poll = async (attempt: number) => {
        try {
          const status = await refreshUpload({ uploadId });
          if (status.status === 'created' && status.asset_id) {
            const playbackId = await getPlaybackId({ assetId: status.asset_id });
            if (!playbackId) throw new Error('No playback ID was returned.');
            if (articleId) {
              await saveVideo({
                title: fileName ?? 'Untitled video',
                uploadId,
                assetId: status.asset_id,
                playbackId,
                articleId: articleId as any,
              }).catch(() => {});
            }
            setPhase('ready');
            onUploaded(playbackId);
            return;
          }
          if (status.status === 'error') {
            setPhase('error');
            setError('Mux failed to process this video.');
            return;
          }
          if (attempt >= 30) {
            setPhase('error');
            setError('Timed out waiting for video processing.');
            return;
          }
          pollRef.current = setTimeout(() => poll(attempt + 1), 4000);
        } catch (e) {
          setPhase('error');
          setError(e instanceof Error ? e.message : 'Failed to check upload status.');
        }
      };
      poll(0);
    },
    [refreshUpload, getPlaybackId, saveVideo, articleId, fileName, onUploaded],
  );

  const startUpload = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setPhase('uploading');
    setProgress(0);
    try {
      const upload = await createUpload();
      const tusUpload = new tus.Upload(file, {
        endpoint: upload.url,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        storeFingerprintForResuming: false,
        removeFingerprintOnSuccess: true,
        chunkSize: 5 * 1024 * 1024,
        onProgress: (bytesSent, bytesTotal) => {
          setProgress(bytesTotal > 0 ? Math.round((bytesSent / bytesTotal) * 100) : 0);
        },
        onError: (err) => {
          setPhase('error');
          setError(err?.message ?? 'Upload failed.');
        },
        onSuccess: () => {
          setPhase('processing');
          pollAsset(upload.id);
        },
      });
      uploadRef.current = tusUpload;
      tusUpload.start();
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Failed to create upload.');
    }
  };

  const handleEmbed = async () => {
    const value = embedUrl.trim();
    if (!value) return;
    setPhase('processing');
    try {
      const playbackId = value.includes('stream.mux.com')
        ? value.match(/([a-zA-Z0-9_-]{16,})/)?.[1] ?? ''
        : value;
      if (!playbackId) throw new Error('Invalid Mux playback ID or URL.');
      if (articleId) {
        await saveVideo({
          title: fileName ?? 'Embedded video',
          uploadId: 'embed',
          playbackId,
          articleId: articleId as any,
        }).catch(() => {});
      }
      setPhase('ready');
      onUploaded(playbackId);
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Failed to embed video.');
    }
  };

  if (!open) return null;

  const canUpload = phase === 'idle' || phase === 'error';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Attach Video</h3>
          <button
            onClick={() => {
              if (phase === 'uploading' && uploadRef.current) uploadRef.current.abort();
              onCancel();
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {phase === 'ready' ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-[#B8FF4D]/10 flex items-center justify-center text-[#B8FF4D]">
                <Check size={28} />
              </div>
              <p className="text-sm font-bold text-white">Video attached successfully</p>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
              >
                Done
              </button>
            </div>
          ) : phase === 'uploading' || phase === 'processing' ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <Clapperboard size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{fileName ?? 'Uploading video'}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    {phase === 'uploading' ? `Uploading ${progress}%` : 'Processing with Mux...'}
                  </p>
                </div>
                <Loader2 size={20} className="text-[#B8FF4D] animate-spin shrink-0" />
              </div>
              {phase === 'uploading' && (
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B8FF4D] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'w-full aspect-video rounded-2xl border border-dashed border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center gap-4 group transition-all',
                  canUpload ? 'cursor-pointer hover:border-[#B8FF4D]/40' : 'opacity-40 cursor-not-allowed',
                )}
                disabled={!canUpload}
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-[#B8FF4D] transition-colors">
                  <Upload size={24} />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-bold text-white">Choose a video file</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">MP4, MOV, WebM • up to a few GB</p>
                </div>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) startUpload(file);
                }}
              />
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">or paste a Mux link</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://stream.mux.com/{playbackId}"
                  className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-[#B8FF4D] transition-all placeholder:text-zinc-700"
                />
                <button
                  onClick={handleEmbed}
                  disabled={!embedUrl.trim()}
                  className="px-5 py-3.5 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Attach
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-300 leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
