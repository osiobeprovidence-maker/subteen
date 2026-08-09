import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  Power,
  Loader2,
  Check,
  X,
  MessagesSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { CommunityImage } from '../common/CommunityImage';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Community } from '../../types';

interface FormState {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  icon: string;
  platform: string;
  category: string;
  gameTitle: string;
  releaseYear: string;
  setting: string;
  protagonist: string;
  featured: boolean;
  status: 'published' | 'draft';
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  description: '',
  coverImage: '',
  icon: '',
  platform: '',
  category: '',
  gameTitle: '',
  releaseYear: '',
  setting: '',
  protagonist: '',
  featured: false,
  status: 'draft',
};

const FILTERS = ['All', 'Published', 'Draft', 'Featured'] as const;

const inputClass =
  'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors';

const labelClass = 'text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1';

export const AdminCommunities = () => {
  usePageTitle('Communities');
  const communities = useQuery(api.communities.listAll) ?? [];
  const createCommunity = useMutation(api.communities.create);
  const updateCommunity = useMutation(api.communities.update);
  const setStatus = useMutation(api.communities.setStatus);
  const setFeatured = useMutation(api.communities.setFeatured);
  const removeCommunity = useMutation(api.communities.remove);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Community | null>(null);
  const slugTouched = useRef(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<'coverImage' | 'icon' | null>(null);

  const flash = (msg: string | null, kind: 'error' | 'success') => {
    if (kind === 'error') { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
  };

  useEffect(() => {
    if (!modalOpen) return;
    const t = setTimeout(() => {
      if (error) setError(null);
      if (success) setSuccess(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [error, success, modalOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communities.filter((c) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Published' && c.status === 'published') ||
        (filter === 'Draft' && c.status === 'draft') ||
        (filter === 'Featured' && c.featured);
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || (c.platform ?? '').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [communities, search, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    slugTouched.current = false;
    setModalOpen(true);
  };

  const openEdit = (c: Community) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImage: c.coverImage ?? '',
      icon: c.icon ?? '',
      platform: c.platform ?? '',
      category: c.category ?? '',
      gameTitle: c.gameTitle ?? '',
      releaseYear: c.releaseYear ?? '',
      setting: c.setting ?? '',
      protagonist: c.protagonist ?? '',
      featured: !!c.featured,
      status: c.status,
    });
    slugTouched.current = true;
    setModalOpen(true);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const url = await generateUploadUrl();
    const res = await fetch(url, { method: 'POST', body: file });
    if (!res.ok) throw new Error('Upload failed.');
    const { storageId } = (await res.json()) as { storageId: string };
    return storageId;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'icon') => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(field);
    try {
      const storageId = await uploadFile(file);
      setForm((f) => ({ ...f, [field]: storageId }));
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleNameChange = (value: string) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugTouched.current ? f.slug : value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const name = form.name.trim();
      if (!name) throw new Error('Community name is required.');
      if (!form.description.trim()) throw new Error('Description is required.');
      const payload = {
        name,
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        coverImage: form.coverImage.trim() || undefined,
        icon: form.icon.trim() || undefined,
        platform: form.platform.trim() || undefined,
        category: form.category.trim() || undefined,
        gameTitle: form.gameTitle.trim() || undefined,
        releaseYear: form.releaseYear.trim() || undefined,
        setting: form.setting.trim() || undefined,
        protagonist: form.protagonist.trim() || undefined,
        featured: form.featured,
        status: form.status,
      };
      if (editing) {
        await updateCommunity({ id: editing._id as any, ...payload });
        flash('Community updated.', 'success');
      } else {
        await createCommunity(payload as any);
        flash('Community created.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (c: Community) => {
    try {
      await setStatus({ id: c._id as any, status: c.status === 'published' ? 'draft' : 'published' });
      flash(c.status === 'published' ? 'Community unpublished.' : 'Community published.', 'success');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed to update status.', 'error');
    }
  };

  const handleToggleFeatured = async (c: Community) => {
    try {
      await setFeatured({ id: c._id as any, featured: !c.featured });
      flash(!c.featured ? 'Community featured.' : 'Community unfeatured.', 'success');
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed to update feature.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeCommunity({ id: confirmDelete._id as any });
      flash('Community deleted. Its stories were kept.', 'success');
      setConfirmDelete(null);
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Failed to delete community.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10"
          >
            <Plus size={14} /> Create Community
          </button>
          <div className="relative flex-1 lg:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shrink-0',
                filter === f ? 'bg-[#B8FF4D] text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Status flash */}
      {(error || success) && (
        <div
          className={cn(
            'px-6 py-4 rounded-2xl text-sm font-bold border',
            error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#B8FF4D]/10 border-[#B8FF4D]/30 text-[#B8FF4D]',
          )}
        >
          {error ?? success}
        </div>
      )}

      {/* Table */}
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Community</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Posts</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Featured</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Created</th>
              <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-8 py-16 text-center text-zinc-500 text-sm">
                  No communities found. Create your first one.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 sm:px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                      <CommunityImage
                        src={c.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        fallbackClassName="text-zinc-800"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">/{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 sm:px-8 py-6">
                  <span className="text-[10px] font-black px-2 py-1 bg-zinc-900 border border-white/5 rounded-md text-zinc-400 uppercase tracking-wider">
                    {c.platform ?? '—'}
                  </span>
                </td>
                <td className="px-6 sm:px-8 py-6">
                  <p className="text-sm font-mono text-zinc-400">{c.postCount ?? 0}</p>
                </td>
                <td className="px-6 sm:px-8 py-6">
                  <span className={cn(
                    'text-[10px] font-black uppercase tracking-widest',
                    c.status === 'published' ? 'text-[#B8FF4D]' : 'text-zinc-600',
                  )}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 sm:px-8 py-6">
                  {c.featured ? (
                    <Star size={14} className="text-[#B8FF4D] fill-[#B8FF4D]" />
                  ) : (
                    <Star size={14} className="text-zinc-800" />
                  )}
                </td>
                <td className="px-6 sm:px-8 py-6">
                  <p className="text-sm text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 sm:px-8 py-6">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggleFeatured(c)}
                      title={c.featured ? 'Unfeature' : 'Feature'}
                      className={cn(
                        'p-2 transition-colors',
                        c.featured ? 'text-[#B8FF4D] hover:text-white' : 'text-zinc-600 hover:text-[#B8FF4D]',
                      )}
                    >
                      <Star size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(c)}
                      title={c.status === 'published' ? 'Unpublish' : 'Publish'}
                      className={cn(
                        'p-2 transition-colors',
                        c.status === 'published' ? 'text-[#B8FF4D] hover:text-red-500' : 'text-zinc-600 hover:text-[#B8FF4D]',
                      )}
                    >
                      <Power size={16} />
                    </button>
                    <button onClick={() => openEdit(c)} title="Edit" className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c)}
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

      {/* Create / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-[32px] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <MessagesSquare size={18} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {editing ? 'Edit Community' : 'Create Community'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Community Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Grand Theft Auto VI"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => { slugTouched.current = true; setForm({ ...form, slug: e.target.value }); }}
                    placeholder="grand-theft-auto-vi"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this community about?"
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Cover Image</label>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'coverImage')} />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-40 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900 overflow-hidden relative flex items-center justify-center"
                  >
                    {uploading === 'coverImage' ? (
                      <Loader2 size={20} className="animate-spin text-[#B8FF4D]" />
                    ) : form.coverImage ? (
                      <CommunityImage src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <ImageIcon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Cover</span>
                      </div>
                    )}
                  </button>
                  {form.coverImage && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest flex items-center gap-1">
                        <Check size={12} /> Cover uploaded
                      </span>
                      <button type="button" onClick={() => setForm({ ...form, coverImage: '' })} className="text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Icon / Image</label>
                  <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'icon')} />
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    className="w-full h-40 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900 overflow-hidden relative flex items-center justify-center"
                  >
                    {uploading === 'icon' ? (
                      <Loader2 size={20} className="animate-spin text-[#B8FF4D]" />
                    ) : form.icon ? (
                      <CommunityImage src={form.icon} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <ImageIcon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Icon</span>
                      </div>
                    )}
                  </button>
                  {form.icon && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest flex items-center gap-1">
                        <Check size={12} /> Icon uploaded
                      </span>
                      <button type="button" onClick={() => setForm({ ...form, icon: '' })} className="text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className={cn(inputClass, 'appearance-none cursor-pointer')}
                  >
                    <option value="">Select platform</option>
                    {['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Action / Open World"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Game Title</label>
                  <input
                    value={form.gameTitle}
                    onChange={(e) => setForm({ ...form, gameTitle: e.target.value })}
                    placeholder="e.g. Grand Theft Auto VI"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Release Year</label>
                  <input
                    value={form.releaseYear}
                    onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
                    placeholder="e.g. 2025"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Setting</label>
                  <input
                    value={form.setting}
                    onChange={(e) => setForm({ ...form, setting: e.target.value })}
                    placeholder="e.g. Leonida"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Protagonist</label>
                  <input
                    value={form.protagonist}
                    onChange={(e) => setForm({ ...form, protagonist: e.target.value })}
                    placeholder="e.g. Lucia & Jason"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-2xl hover:border-[#B8FF4D]/30 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Featured</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Only published communities can be featured.</p>
                  </div>
                  <span className={cn('relative w-12 h-7 rounded-full transition-colors shrink-0', form.featured ? 'bg-[#B8FF4D]' : 'bg-zinc-700')}>
                    <span className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-all', form.featured ? 'left-6' : 'left-1')} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: form.status === 'published' ? 'draft' : 'published' })}
                  className="flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-2xl hover:border-[#B8FF4D]/30 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Status</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Draft hides it from public discovery.</p>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                    form.status === 'published' ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]' : 'bg-zinc-800 text-zinc-400',
                  )}>
                    {form.status}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Community'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-4 bg-zinc-900 border border-white/10 text-zinc-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[32px] p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Trash2 size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Delete this community?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                "{confirmDelete.name}" will be removed from public community discovery. Its stories will
                <span className="text-white font-bold"> not</span> be deleted — they'll just be unassigned.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-400 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 bg-zinc-900 border border-white/10 text-zinc-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
