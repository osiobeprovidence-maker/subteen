import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Bold, 
  Italic, 
  List, 
  Quote, 
  Heading1, 
  Heading2, 
  Type, 
  Code, 
  Minus, 
  LayoutGrid, 
  Table as TableIcon,
  Video,
  ChevronDown,
  Globe,
  Lock,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  Settings,
  ChevronRight,
  Plus,
  FileText,
  Check,
  RefreshCw,
  Scissors,
  Loader2,
  X
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { cn } from '../lib/utils';
import { ImageCropModal } from '../components/profile/ImageCropModal';
import { useAuth } from '../context/AuthContext';
import { slugify, objectUrlToDataUrl, readingTimeFor } from '../lib/articleHelpers';
import { usePageTitle } from '../hooks/usePageTitle';

export const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  usePageTitle(id ? 'Edit Article' : 'New Article');
  const { user } = useAuth();
  const communities = useQuery(api.communities.listAll);
  const editable = useQuery(api.articles.getEditable, id ? { id: id as any } : 'skip');
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);
  const removeArticle = useMutation(api.articles.remove);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [createdAt, setCreatedAt] = useState<number>(Date.now());
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('News');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Scheduled'>('Draft');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHomepage, setIsHomepage] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving' | 'Unsaved'>('Saved');
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverMeta, setCoverMeta] = useState<{ width: number; height: number; sizeKB: number; format: string } | null>(null);
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [title]);

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).length;
    setWordCount(content.trim() === '' ? 0 : words);
  }, [content]);

  // Load an existing article when editing
  useEffect(() => {
    if (!editable || hydrated) return;
    setHydrated(true);
    setDraftId(editable._id as any);
    setCreatedAt(Date.now());
    setTitle(editable.title);
    setSubtitle(editable.subtitle ?? '');
    setExcerpt('');
    setSlug(editable.slug);
    setContent(editable.content);
    setCategory(editable.category);
    setSelectedGame(editable.gameId ?? '');
    setSelectedCommunity(editable.communityId ?? '');
    setStatus(editable.status === 'scheduled' ? 'Scheduled' : editable.status === 'published' ? 'Published' : 'Draft');
    setScheduledFor(editable.scheduledFor ? new Date(editable.scheduledFor).toISOString().slice(0, 16) : '');
    setIsFeatured(!!editable.isFeatured);
    setCoverUrl(editable.heroImage || null);
  }, [editable, hydrated]);

  const handleChange = (setter: any, value: any) => {
    setter(value);
    setSaveStatus('Unsaved');
  };

  const readingTime = Math.max(1, readingTimeFor(content));

  const persistArticle = async (nextStatus: 'Draft' | 'Published' | 'Scheduled'): Promise<{ slug: string }> => {
    setSaveStatus('Saving');
    const dbStatus = nextStatus.toLowerCase() as 'draft' | 'published' | 'scheduled';
    const finalSlug = slug.trim() || slugify(title) || `article-${Date.now()}`;
    const heroImage = coverUrl ? await objectUrlToDataUrl(coverUrl) : '';
    const payload: Record<string, unknown> = {
      title: title.trim() || 'Untitled',
      subtitle: subtitle || undefined,
      slug: finalSlug,
      content,
      heroImage: heroImage || undefined,
      category,
      gameId: selectedGame || undefined,
      communityId: selectedCommunity || undefined,
      isFeatured,
      readingTime,
      status: dbStatus,
      publishDate: dbStatus === 'published' ? new Date().toISOString().slice(0, 10) : undefined,
      scheduledFor: dbStatus === 'scheduled' && scheduledFor ? new Date(scheduledFor).getTime() : undefined,
    };

    if (draftId) {
      await updateArticle({ id: draftId as any, ...(payload as any) });
    } else {
      const created = await createArticle(payload as any);
      if (created) setDraftId(created._id as any);
    }
    setStatus(nextStatus);
    setSaveStatus('Saved');
    return { slug: finalSlug };
  };

  const handleSaveDraft = async () => {
    await persistArticle('Draft');
  };

  const handlePublish = async () => {
    await persistArticle('Published');
    navigate('/editor/published');
  };

  const handlePreview = async () => {
    const { slug: finalSlug } = await persistArticle(status === 'Draft' ? 'Draft' : status === 'Scheduled' ? 'Scheduled' : 'Published');
    navigate(`/article/${finalSlug}?preview=1`);
  };

  const handleDeleteDraft = async () => {
    if (draftId) {
      await removeArticle({ id: draftId as any });
    }
    navigate('/editor/drafts');
  };

  const applyCover = (blob: Blob, file?: File) => {
    const url = URL.createObjectURL(blob);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (coverUrl) URL.revokeObjectURL(coverUrl);
        setCoverUrl(url);
        setCoverMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKB: Math.max(1, Math.round(blob.size / 1024)),
          format: (file?.type ?? blob.type).split('/')[1]?.toUpperCase() ?? 'IMG',
        });
        setIsCoverLoading(false);
      };
      img.onerror = () => setIsCoverLoading(false);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(blob);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsCoverLoading(true);
    applyCover(file, file);
  };

  const handleCropConfirm = (blob: Blob) => {
    setIsCropOpen(false);
    setCropSource(null);
    applyCover(blob);
  };

  const openCrop = () => {
    if (!coverUrl) return;
    setCropSource(coverUrl);
    setIsCropOpen(true);
  };

  const handleRemoveCover = () => {
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    setCoverUrl(null);
    setCoverMeta(null);
  };

  const toolbarTools = [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: Heading1, label: 'H1' },
    { icon: Heading2, label: 'H2' },
    { icon: List, label: 'List' },
    { icon: Quote, label: 'Quote' },
    { icon: LinkIcon, label: 'Link' },
    { icon: ImageIcon, label: 'Image' },
    { icon: Video, label: 'Video' },
    { icon: Minus, label: 'Divider' },
    { icon: Code, label: 'Code' },
    { icon: LayoutGrid, label: 'Gallery' },
    { icon: TableIcon, label: 'Table' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Editor Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4 px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/editor')}
              className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Back to Editor</span>
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{draftId ? 'Edit Article' : 'New Article'}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  saveStatus === 'Saved' ? "text-[#B8FF4D]" : saveStatus === 'Saving' ? "text-blue-400" : "text-zinc-500"
                )}>
                  {saveStatus === 'Saved' ? 'Saved just now' : saveStatus === 'Saving' ? 'Saving...' : 'Unsaved changes'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={handleSaveDraft} disabled={saveStatus === 'Saving'} className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black text-zinc-400 hover:bg-zinc-900 uppercase tracking-widest transition-all disabled:opacity-50">
              <Save size={14} /> Save Draft
            </button>
            <button onClick={handlePreview} disabled={saveStatus === 'Saving'} className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black text-zinc-400 hover:bg-zinc-900 uppercase tracking-widest transition-all disabled:opacity-50">
              <Eye size={14} /> Preview
            </button>
            <button onClick={handlePublish} disabled={saveStatus === 'Saving'} className="flex items-center gap-2 px-8 py-2 rounded-full bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(184,255,77,0.2)] disabled:opacity-50">
              <Send size={14} /> Publish
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          {/* Content Area */}
          <div className="max-w-[760px] mx-auto w-full space-y-6">
            {/* Title & Meta */}
            <div className="space-y-5">
              <textarea
                value={title}
                onChange={(e) => handleChange(setTitle, e.target.value)}
                placeholder="Article Title"
                className="w-full bg-transparent border-none text-4xl sm:text-6xl font-black text-white focus:outline-none placeholder:text-zinc-900 tracking-tighter resize-none"
                rows={1}
              />
              <div className="space-y-3">
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => handleChange(setSubtitle, e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="w-full bg-transparent border-none text-xl text-zinc-500 focus:outline-none placeholder:text-zinc-900 font-medium"
                />
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 bg-zinc-900/50 w-fit px-3 py-1.5 rounded-lg">
                  <span className="uppercase tracking-widest">Slug:</span>
                  <span className="text-zinc-400">subteen.com/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleChange(setSlug, e.target.value)}
                    className="bg-transparent border-none text-[#B8FF4D] focus:outline-none w-auto min-w-[50px]"
                    placeholder="url-slug"
                  />
                </div>
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => handleChange(setExcerpt, e.target.value)}
                placeholder="Add a short excerpt for homepage and social previews..."
                className="w-full bg-transparent border-none text-lg text-zinc-400 focus:outline-none placeholder:text-zinc-900 italic resize-none leading-relaxed"
                rows={2}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cover Image</label>
                {coverMeta && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest">
                    <Check size={12} /> Cover uploaded
                  </span>
                )}
              </div>

              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />

              {coverUrl ? (
                <>
                  <div className="group relative h-[360px] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950">
                    <img
                      src={coverUrl}
                      alt="Cover"
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]"
                      onClick={() => setIsCoverPreviewOpen(true)}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest truncate">
                        {coverMeta ? `${coverMeta.width} × ${coverMeta.height} · ${coverMeta.sizeKB} KB · ${coverMeta.format}` : 'Cover'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => coverInputRef.current?.click()} title="Replace" className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-black hover:bg-[#B8FF4D] transition-colors">
                          <RefreshCw size={14} />
                        </button>
                        <button onClick={openCrop} title="Crop" className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-black hover:bg-[#B8FF4D] transition-colors">
                          <Scissors size={14} />
                        </button>
                        <button onClick={handleRemoveCover} title="Remove" className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-red-400 hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => setIsCoverPreviewOpen(true)} title="Preview" className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-black hover:bg-[#B8FF4D] transition-colors">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {coverMeta && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-zinc-500">
                        {coverMeta.width} × {coverMeta.height} · {coverMeta.sizeKB} KB · {coverMeta.format}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <div className="flex items-center gap-3">
                        <button onClick={() => coverInputRef.current?.click()} className="text-[#B8FF4D] hover:text-white transition-colors">Replace</button>
                        <button onClick={openCrop} className="text-[#B8FF4D] hover:text-white transition-colors">Crop</button>
                        <button onClick={handleRemoveCover} className="text-red-500 hover:text-red-400 transition-colors">Remove</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-40 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-white hover:border-[#B8FF4D]/30 transition-all"
                >
                  {isCoverLoading ? (
                    <Loader2 size={20} className="animate-spin text-[#B8FF4D]" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                        <Plus size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-widest">Upload Cover Image</p>
                        <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">320-420px tall · 1920x820px recommended</p>
                      </div>
                    </>
                  )}
                </button>
              )}

              {/* Fullscreen Preview */}
              <AnimatePresence>
                {isCoverPreviewOpen && coverUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setIsCoverPreviewOpen(false)}
                  >
                    <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <X size={20} />
                    </button>
                    <motion.img
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      src={coverUrl}
                      alt="Cover preview"
                      className="max-w-full max-h-[90vh] rounded-lg object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <ImageCropModal
                open={isCropOpen}
                src={cropSource ?? ''}
                aspect={21 / 9}
                title="Crop Cover Image"
                onCancel={() => { setIsCropOpen(false); setCropSource(null); }}
                onConfirm={handleCropConfirm}
              />
            </div>

            {/* Editor Toolbar */}
            <div className="sticky top-[80px] z-40 flex items-center bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-3xl p-2 overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex items-center gap-1 min-w-max">
                {toolbarTools.map((tool, i) => (
                  <button 
                    key={i} 
                    className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-2xl transition-all group relative"
                    title={tool.label}
                  >
                    <tool.icon size={20} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-tighter">
                      {tool.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Text Editor Body */}
            <div className="min-h-[600px] py-4">
              <textarea
                value={content}
                onChange={(e) => handleChange(setContent, e.target.value)}
                placeholder="Start writing your story..."
                className="w-full h-full bg-transparent border-none text-[18px] sm:text-[19px] text-zinc-300 leading-[1.8] focus:outline-none resize-none placeholder:text-zinc-900"
              />
            </div>

            {/* Word Count / Stats */}
            <div className="flex items-center gap-8 border-t border-white/5 pt-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <Type size={14} className="text-zinc-800" />
                 <span>{wordCount} Words</span>
               </div>
               <div className="flex items-center gap-2">
                 <Clock size={14} className="text-zinc-800" />
                 <span>{readingTime} Min Read</span>
               </div>
            </div>

            {/* SEO Settings (Collapsible) */}
            <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
               <button 
                 onClick={() => setIsSeoOpen(!isSeoOpen)}
                 className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-blue-400">
                     <Globe size={20} />
                   </div>
                   <div className="text-left">
                     <h3 className="text-sm font-black uppercase tracking-widest">SEO Settings</h3>
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Configure search engine visibility</p>
                   </div>
                 </div>
                 <ChevronDown className={cn("text-zinc-600 transition-transform duration-300", isSeoOpen && "rotate-180")} />
               </button>
               
               <AnimatePresence>
                 {isSeoOpen && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="px-8 pb-8 space-y-6"
                   >
                     <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Meta Title</label>
                       <input type="text" placeholder={title || 'Article Title'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400" />
                     </div>
                     <div className="space-y-4">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Meta Description</label>
                       <textarea rows={3} placeholder="Add a custom meta description..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400 resize-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-4">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Canonical URL</label>
                         <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400" />
                       </div>
                       <div className="space-y-4">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Keywords</label>
                         <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400" />
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Mobile Accordion / Desktop Card */}
              <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
                <div className="lg:hidden">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                        <Settings size={20} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Publishing Settings</h3>
                    </div>
                    <ChevronDown className={cn("text-zinc-600 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {(isSidebarOpen || window.innerWidth >= 1024) && (
                    <motion.div
                      initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : false}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-8 pt-0 lg:pt-8 space-y-10"
                    >
                      {/* Publish Settings */}
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Publish Status</h3>
                        <div className="space-y-2">
                          {[
                            { id: 'Draft', label: 'Draft', icon: FileText, color: 'text-zinc-500' },
                            { id: 'Published', label: 'Published', icon: Globe, color: 'text-[#B8FF4D]' },
                            { id: 'Scheduled', label: 'Scheduled', icon: Calendar, color: 'text-blue-400' },
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => handleChange(setStatus, item.id as any)}
                              className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                status === item.id 
                                  ? "bg-zinc-900 border-white/10" 
                                  : "border-transparent hover:bg-white/[0.02]"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon size={16} className={status === item.id ? item.color : "text-zinc-700"} />
                                <span className={cn("text-xs font-bold", status === item.id ? "text-white" : "text-zinc-500")}>{item.label}</span>
                              </div>
                              {status === item.id && <div className="w-2 h-2 rounded-full bg-[#B8FF4D] shadow-[0_0_10px_#B8FF4D]" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Schedule Date */}
                      {status === 'Scheduled' && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Publish Date & Time</label>
                          <input
                            type="datetime-local"
                            value={scheduledFor}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => handleChange(setScheduledFor, e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#B8FF4D] transition-all [color-scheme:dark]"
                          />
                        </div>
                      )}

                      {/* Category */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Category</label>
                        <div className="relative group">
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#B8FF4D] transition-all cursor-pointer"
                          >
                            {['News', 'Reviews', 'Guides', 'Esports', 'Deals', 'Trailers', 'Patch Notes', 'Hardware', 'Opinion', 'Features', 'Industry'].map(cat => (
                              <option key={cat}>{cat}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Linked Community */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Linked Community</label>
                        <div className="relative group">
                          <select 
                            value={selectedCommunity}
                            onChange={(e) => handleChange(setSelectedCommunity, e.target.value)}
                            className="w-full appearance-none bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#B8FF4D] transition-all cursor-pointer"
                          >
                            <option value="">None</option>
                            {(communities ?? []).map(community => (
                              <option key={community._id as any} value={community._id as any}>{community.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Author */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Author</label>
                          <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Settings size={18} className="text-zinc-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Player One'}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Staff Writer</p>
                          </div>
                          <MoreVertical size={16} className="text-zinc-700" />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white">Featured Article</span>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Priority slot</p>
                          </div>
                          <button 
                            onClick={() => setIsFeatured(!isFeatured)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              isFeatured ? "bg-[#B8FF4D]" : "bg-zinc-800"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300",
                              isFeatured ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white">Show on Homepage</span>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Visible to public</p>
                          </div>
                          <button 
                            onClick={() => setIsHomepage(!isHomepage)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              isHomepage ? "bg-[#B8FF4D]" : "bg-zinc-800"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-black transition-all duration-300",
                              isHomepage ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      {/* Image Preview if uploaded */}
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cover Preview</label>
                        <div className={cn("rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 flex items-center justify-center", coverUrl ? "h-32" : "aspect-[16/9]")}>
                          {coverUrl ? (
                            <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-zinc-800" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-3">
                <button onClick={handleDeleteDraft} className="w-full py-4 rounded-3xl border border-white/5 bg-zinc-950 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Delete Draft
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Save (Mobile Only) */}
      <div className="lg:hidden fixed bottom-8 right-8 z-50">
        <button
          onClick={handleSaveDraft}
          disabled={saveStatus === 'Saving'}
          title="Save Draft"
          className="w-14 h-14 rounded-full bg-[#B8FF4D] text-black shadow-2xl flex items-center justify-center disabled:opacity-50"
        >
          <Save size={24} />
        </button>
      </div>
    </div>
  );
};
