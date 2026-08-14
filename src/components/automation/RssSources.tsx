import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Radio,
  Loader2,
  ExternalLink,
  Power,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/articleHelpers';
import { PILLARS, subcategoriesOf, displayCategory, pillarOf } from '../../../convex/lib/taxonomy';

interface FormState {
  name: string;
  feedUrl: string;
  websiteUrl: string;
  logoUrl: string;
  description: string;
  defaultCategory: string;
  defaultSubcategory: string;
  pidgin: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  feedUrl: '',
  websiteUrl: '',
  logoUrl: '',
  description: '',
  defaultCategory: 'Gaming',
  defaultSubcategory: '',
  pidgin: false,
};

export const RssSources = () => {
  const sources = useQuery(api.rssSources.list) ?? [];
  const createSource = useMutation(api.rssSources.create);
  const updateSource = useMutation(api.rssSources.update);
  const setActive = useMutation(api.rssSources.setActive);
  const removeSource = useMutation(api.rssSources.remove);
  const syncNow = useMutation(api.rssSources.syncNow);
  const seedSources = useMutation(api.rssSources.seedSources);

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ sourceId: string; message: string; stats: any } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (source: any) => {
    setEditing(source._id);
    setForm({
      name: source.name,
      feedUrl: source.feedUrl,
      websiteUrl: source.websiteUrl,
      logoUrl: source.logoUrl ?? '',
      description: source.description ?? '',
      defaultCategory: pillarOf(source.defaultCategory),
      defaultSubcategory: source.defaultSubcategory ?? '',
      pidgin: source.pidgin ?? false,
    });
    setFormOpen(true);
  };

  const handleSeed = async () => {
    if (sources.length > 0) return;
    await seedSources({});
  };

  React.useEffect(() => {
    if (sources.length === 0) return;
  }, [sources.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateSource({ id: editing as any, ...form });
    } else {
      await createSource({ ...form });
    }
    setFormOpen(false);
  };

  const handleSync = async (sourceId: string) => {
    setSyncingId(sourceId);
    setSyncResult(null);
    try {
      const stats: any = await syncNow({ sourceId: sourceId as any });
      setSyncResult({ sourceId, message: 'Sync complete', stats });
    } catch (err: any) {
      setSyncResult({ sourceId, message: err?.message ?? 'Sync failed', stats: null });
    } finally {
      setSyncingId(null);
    }
  };

  const inputClass =
    'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors';

  return (
    <div className="space-y-8">
      {sources.length === 0 && (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
            <Radio size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-white uppercase tracking-tight">No RSS sources configured</p>
            <p className="text-sm text-zinc-500 max-w-md">
              Add your first gaming publication, or seed the five default sources (IGN, GameSpot, PC Gamer, Eurogamer, Rock Paper Shotgun).
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
            >
              <Plus size={14} /> Add RSS Source
            </button>
            <button
              onClick={handleSeed}
              className="px-6 py-3 bg-zinc-900 border border-white/10 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest hover:border-[#B8FF4D]/30 transition-all"
            >
              Seed 5 Default Sources
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">RSS Sources</h2>
          <p className="text-xs text-zinc-500 mt-1">Feeds are checked on schedule and can be synced manually.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10"
        >
          <Plus size={14} /> Add RSS Source
        </button>
      </div>

      {syncResult && (
        <div className={cn(
          "px-6 py-4 rounded-2xl border text-sm font-bold",
          syncResult.stats && !syncResult.stats.error ? "bg-[#B8FF4D]/10 border-[#B8FF4D]/20 text-[#B8FF4D]" : "bg-red-500/10 border-red-500/20 text-red-400",
        )}>
          {syncResult.stats && !syncResult.stats.error
            ? `Sync complete — New stories: ${syncResult.stats.newStories} · Duplicates: ${syncResult.stats.duplicates} · Failed: ${syncResult.stats.failed} · ${(syncResult.stats.processingTimeMs / 1000).toFixed(1)}s`
            : (syncResult.stats?.error ?? syncResult.message)}
        </div>
      )}

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">RSS Feed</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last Sync</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stories</th>
              <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-zinc-500 text-sm">
                  No sources yet. Add one to start ingesting gaming news.
                </td>
              </tr>
            )}
            {sources.map((source: any) => (
              <tr key={source._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                      {source.logoUrl ? (
                        <img src={source.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Radio size={16} className="text-zinc-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{source.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest truncate">
                          {displayCategory(source.defaultCategory ?? 'Gaming', source.defaultSubcategory)}
                        </p>
                        {source.pidgin && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#B8FF4D] text-black rounded">
                            Pidgin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <a
                    href={source.feedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-[#B8FF4D] font-mono flex items-center gap-1.5 max-w-[240px] truncate"
                  >
                    <ExternalLink size={12} className="shrink-0" /> {source.feedUrl}
                  </a>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      source.active ? "bg-[#B8FF4D] shadow-[0_0_8px_#B8FF4D]" : "bg-zinc-700",
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      source.active ? "text-[#B8FF4D]" : "text-zinc-600",
                    )}>
                      {source.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-0.5">
                    <p className="text-xs text-zinc-400">{source.lastSyncedAt ? relativeTime(source.lastSyncedAt) : 'Never'}</p>
                    {source.lastSyncStatus === 'error' && source.lastSyncError && (
                      <p className="text-[10px] text-red-500 max-w-[180px] truncate" title={source.lastSyncError}>{source.lastSyncError}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-mono text-zinc-400">{source.storiesImported}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleSync(source._id)}
                      disabled={syncingId === source._id}
                      title="Sync Now"
                      className="p-2 text-zinc-500 hover:text-[#B8FF4D] transition-colors disabled:opacity-50"
                    >
                      {syncingId === source._id ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    </button>
                    <button
                      onClick={() => setActive({ id: source._id, active: !source.active })}
                      title={source.active ? 'Disable' : 'Enable'}
                      className={cn(
                        "p-2 transition-colors",
                        source.active ? "text-[#B8FF4D] hover:text-red-500" : "text-zinc-700 hover:text-[#B8FF4D]",
                      )}
                    >
                      <Power size={16} />
                    </button>
                    <button onClick={() => openEdit(source)} title="Edit" className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete source "${source.name}" and all its imported stories?`)) removeSource({ id: source._id }); }}
                      title="Delete"
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setFormOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-[32px] p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                {editing ? 'Edit RSS Source' : 'Add RSS Source'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Source Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. IGN" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Default Pillar</label>
                  <select
                    value={form.defaultCategory}
                    onChange={(e) => setForm({ ...form, defaultCategory: e.target.value, defaultSubcategory: '' })}
                    className={cn(inputClass, 'appearance-none cursor-pointer')}
                  >
                    {PILLARS.map((pillar) => (
                      <option key={pillar} value={pillar}>{pillar}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Default Subcategory</label>
                  <select
                    value={form.defaultSubcategory}
                    onChange={(e) => setForm({ ...form, defaultSubcategory: e.target.value })}
                    className={cn(inputClass, 'appearance-none cursor-pointer')}
                  >
                    <option value="">Auto (AI decides)</option>
                    {(subcategoriesOf(form.defaultCategory) as string[]).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">RSS Feed URL</label>
                <input required value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} placeholder="https://example.com/feed" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Website URL</label>
                <input required value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://example.com" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Logo URL (optional)</label>
                <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description (optional)</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} />
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, pidgin: !form.pidgin })}
                className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-2xl hover:border-[#B8FF4D]/30 transition-colors"
              >
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-widest">Subteen Pidgin</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Translate stories from dis source to Nigerian Pidgin for local readers.</p>
                </div>
                <span className={cn(
                  "relative w-12 h-7 rounded-full transition-colors shrink-0",
                  form.pidgin ? "bg-[#B8FF4D]" : "bg-zinc-700",
                )}>
                  <span className={cn(
                    "absolute top-1 w-5 h-5 rounded-full bg-white transition-all",
                    form.pidgin ? "left-6" : "left-1",
                  )} />
                </span>
              </button>
              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="flex-1 py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
                  {editing ? 'Save Changes' : 'Add Source'}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-4 bg-zinc-900 border border-white/10 text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
