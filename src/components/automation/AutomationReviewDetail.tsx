import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import {
  ChevronLeft,
  Save,
  Check,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { StatusBadge } from './StatusBadge';
import { relativeTime } from '../../lib/articleHelpers';
import { cn } from '../../lib/utils';

export const AutomationReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const data = useQuery(api.newsAutomation.getDraft, id ? { draftId: id as any } : 'skip');
  const saveDraftEdits = useMutation(api.newsAutomation.saveDraftEdits);
  const reviewDraft = useMutation(api.newsAutomation.reviewDraft);
  const generateImage = useMutation(api.newsAutomation.generateImage);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Gaming News');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const draft: any = data?.draft;
  const imported: any = data?.imported;
  const source: any = data?.source;
  const article: any = data?.article;

  React.useEffect(() => {
    if (!draft) return;
    setTitle(draft.title ?? '');
    setSubtitle(draft.subtitle ?? '');
    setSummary(draft.summary ?? '');
    setBody(draft.body ?? '');
    setCategory(draft.category ?? 'Gaming News');
    setTags((draft.tags ?? []).join(', '));
    setSeoTitle(draft.seoTitle ?? '');
    setSeoDescription(draft.seoDescription ?? '');
    setFeaturedImage(draft.featuredImage ?? '');
  }, [data]);

  if (!draft) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto mb-4">
          <FileText size={24} />
        </div>
        <p className="text-sm font-bold text-zinc-500">Draft not found.</p>
      </div>
    );
  }

  const inputClass =
    'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors';
  const labelClass = 'text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block';

  const handleSave = async () => {
    setBusy('save');
    setNotice(null);
    try {
      await saveDraftEdits({
        draftId: draft._id,
        title,
        subtitle,
        summary,
        body,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        seoTitle,
        seoDescription,
        featuredImage,
      });
      setNotice({ type: 'success', text: 'Draft saved. Continue editing or review.' });
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.message ?? 'Failed to save draft.' });
    } finally {
      setBusy(null);
    }
  };

  const handleAction = async (action: 'reject' | 'approve' | 'publish') => {
    setBusy(action);
    setNotice(null);
    try {
      await reviewDraft({ draftId: draft._id, action });
      if (action === 'publish') {
        navigate('/admin/automation/reviews?filter=PUBLISHED');
      } else {
        setNotice({
          type: 'success',
          text: action === 'reject' ? 'Draft rejected.' : 'Draft approved — ready for publishing.',
        });
        if (action === 'reject') navigate('/admin/automation/reviews');
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.message ?? 'Action failed.' });
    } finally {
      setBusy(null);
    }
  };

  const handleGenerateImage = async () => {
    setBusy('image');
    setNotice(null);
    try {
      await generateImage({
        draftId: draft._id,
        prompt: `Editorial hero image for gaming news article titled "${title || draft.title}". Wide 16:9, modern, dark, cinematic.`,
      });
      setNotice({ type: 'success', text: 'Image generation queued. It may take a minute to appear.' });
    } catch (err: any) {
      setNotice({ type: 'error', text: err?.message ?? 'Image generation failed.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/admin/automation/reviews')}
        className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> Back to Review Queue
      </button>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
            {source?.logoUrl ? (
              <img src={source.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <FileText size={16} className="text-zinc-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{source?.name ?? 'Unknown source'}</span>
              <StatusBadge status={draft.status} />
            </div>
            <p className="text-xs text-zinc-500 truncate">{imported?.originalTitle ?? draft.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {article && (
            <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Published
            </span>
          )}
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{relativeTime(draft.createdAt)}</span>
        </div>
      </div>

      {notice && (
        <div
          className={cn(
            'flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-bold',
            notice.type === 'success'
              ? 'bg-[#B8FF4D]/10 border-[#B8FF4D]/20 text-[#B8FF4D]'
              : 'bg-red-500/10 border-red-500/20 text-red-400',
          )}
        >
          {notice.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-6">
            <div>
              <label className={labelClass}>Headline</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subheadline</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Summary</label>
              <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} className={cn(inputClass, 'resize-none')} />
            </div>
            <div>
              <label className={labelClass}>Article Body (Markdown)</label>
              <textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} className={cn(inputClass, 'font-mono text-xs leading-relaxed')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>SEO Title</label>
                <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-5">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Featured Image</h3>
            {featuredImage ? (
              <img src={featuredImage} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl" />
            ) : (
              <div className="w-full aspect-[16/9] bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700">
                <FileText size={24} />
              </div>
            )}
            <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="Image URL" className={inputClass} />
            <button
              onClick={handleGenerateImage}
              disabled={busy === 'image'}
              className="w-full py-3 bg-zinc-900 border border-white/10 text-[#B8FF4D] rounded-xl text-xs font-black uppercase tracking-widest hover:border-[#B8FF4D]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy === 'image' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate Subteen Image
            </button>
          </div>

          {imported?.originalUrl && (
            <a
              href={imported.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-6 py-5 bg-zinc-950 border border-white/5 rounded-[32px] text-sm text-zinc-300 hover:border-[#B8FF4D]/30 transition-all"
            >
              <ExternalLink size={16} className="text-[#B8FF4D] shrink-0" />
              <span className="truncate">View original story</span>
            </a>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleAction('publish')}
              disabled={busy !== null}
              className="flex items-center justify-center gap-2 py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              {busy === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Approve & Publish
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('approve')}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                {busy === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {busy === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                Reject
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={busy !== null}
              className="flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-white/10 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-all disabled:opacity-50"
            >
              {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
