import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Shield, 
  Palette, 
  ChevronRight, 
  Mail, 
  Key, 
  LayoutDashboard, 
  PenTool, 
  Camera, 
  Image as ImageIcon,
  Globe,
  Gamepad2,
  Monitor,
  Twitter,
  Youtube,
  Instagram,
  ArrowLeft,
  X as XIcon,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ImageCropModal } from '../components/profile/ImageCropModal';
import { useUploadImage, useRemoveImage, useResolvedMedia, MediaField } from '../hooks/useImageUpload';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { canAccessAdmin, canAccessEditor, roleLabel } from '../lib/roles';

const COVER_DEFAULT = 'bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-black';

export const UserProfile = () => {
  const { user, dbUser, logout, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(dbUser?.name ?? user?.name ?? '');
  const [cropState, setCropState] = useState<{ field: MediaField; src: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadImage();
  const removeImage = useRemoveImage();
  const updateProfile = useMutation(api.users.updateProfile);

  const avatar = useResolvedMedia(dbUser?.avatar ?? user?.photoURL);
  const cover = useResolvedMedia(dbUser?.coverImage);

  const email = user?.email ?? dbUser?.email ?? '';
  const memberSince = dbUser?.joined ? new Date(dbUser.joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const daysActive = dbUser?.joined
    ? Math.max(1, Math.floor((Date.now() - new Date(dbUser.joined).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleFileSelected = (field: MediaField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropState({ field, src: reader.result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!dbUser || !cropState) return;
    setIsUploading(true);
    try {
      await uploadImage(blob, dbUser._id, cropState.field);
      setCropState(null);
    } catch {
      setCropState(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (field: MediaField) => {
    if (!dbUser) return;
    setIsUploading(true);
    try {
      await removeImage(dbUser._id, field);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!dbUser) return;
    setIsSaving(true);
    try {
      await updateProfile({ id: dbUser._id, name: displayName.trim() || dbUser.name });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account Settings',
      items: [
        { name: 'Email Address', value: email || '—', icon: Mail },
        { name: 'Password', value: 'Managed by Google', icon: Key },
        { name: 'Security', value: 'Two-factor enabled', icon: Shield },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { name: 'Notifications', value: dbUser?.preferences?.newsletter ? 'Newsletter On' : 'Newsletter Off', icon: Bell },
        { name: 'Appearance', value: dbUser?.preferences?.darkMode ? 'Dark Mode' : 'Light Mode', icon: Palette },
      ]
    }
  ];

  if (isEditing) {
    return (
      <div className="pb-32 pt-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} /> Back to Profile
            </button>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Edit Profile</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>

          <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Visuals */}
            <div className="space-y-8">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Visual Identity</h2>
              
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cover Image</label>
                  <div className={`aspect-[21/9] rounded-[32px] border border-white/5 relative overflow-hidden ${cover ? '' : COVER_DEFAULT}`}>
                    {cover && <img src={cover} alt="Cover" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/30 flex items-end justify-between p-5">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#B8FF4D] transition-colors disabled:opacity-60"
                      >
                        <ImageIcon size={14} /> {cover ? 'Change Cover' : 'Upload Cover'}
                      </button>
                      {cover && (
                        <button
                          type="button"
                          onClick={() => handleRemove('coverImage')}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2 bg-black/60 text-red-400 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-zinc-900 rounded-full border-4 border-white/5 flex items-center justify-center text-zinc-700 overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={40} />
                        )}
                      </div>
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-[#B8FF4D] text-black rounded-full shadow-xl hover:scale-110 transition-transform">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-white hover:text-[#B8FF4D] transition-colors">Upload new picture</button>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">JPG, PNG or GIF. Cropped to a square.</p>
                      <button type="button" onClick={() => handleRemove('avatar')} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Remove current</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected('coverImage')} />
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected('avatar')} />

            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Basic Information</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Username</label>
                    <input type="text" defaultValue={email?.split('@')[0] ?? ''} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Bio</label>
                  <textarea rows={3} placeholder="Tell us about yourself..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Country</label>
                  <div className="relative">
                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors appearance-none">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Germany</option>
                    </select>
                    <Globe size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Profile */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Gaming Profile</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Favorite Games</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['GTA VI', 'Elden Ring'].map(game => (
                      <span key={game} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg text-xs text-white border border-white/5">
                        {game} <XIcon size={12} className="text-zinc-600 cursor-pointer hover:text-red-500" />
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Add a game..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
                    <Gamepad2 size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Preferred Platforms</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['PC', 'PS5', 'Xbox Series X', 'Nintendo Switch'].map(platform => (
                      <button key={platform} type="button" className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:border-[#B8FF4D] transition-all">
                        <Monitor size={14} /> {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Social Links</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 space-y-4">
                {[
                  { icon: Twitter, placeholder: 'twitter.com/yourname' },
                  { icon: Instagram, placeholder: 'instagram.com/yourname' },
                  { icon: Youtube, placeholder: 'youtube.com/@yourname' },
                ].map((social, idx) => (
                  <div key={idx} className="relative">
                    <input type="text" placeholder={social.placeholder} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
                    <social.icon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/20 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <ImageCropModal
          open={!!cropState}
          src={cropState?.src ?? ''}
          aspect={cropState?.field === 'coverImage' ? 21 / 9 : 1}
          title={cropState?.field === 'coverImage' ? 'Crop Cover Image' : 'Crop Profile Picture'}
          onCancel={() => setCropState(null)}
          onConfirm={handleCropConfirm}
        />
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto pt-28 space-y-16">
        {/* Profile Header with Cover */}
        <div>
          <div className={`relative h-44 rounded-[32px] border border-white/5 overflow-hidden ${cover ? '' : COVER_DEFAULT}`}>
            {cover && <img src={cover} alt="Cover" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="relative -mt-14 px-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="w-28 h-28 bg-zinc-900 rounded-full border-4 border-[#0A0A0A] flex items-center justify-center text-zinc-700 overflow-hidden shrink-0">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 pb-1">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">{displayName}</h1>
                <span className="px-3 py-1 rounded-full bg-[#B8FF4D]/10 border border-[#B8FF4D]/20 text-[#B8FF4D] text-[10px] font-black uppercase tracking-widest">
                  {roleLabel(role)}
                </span>
              </div>
              <p className="text-zinc-500 font-medium">{memberSince ? `Member since ${memberSince}` : 'Member'}</p>
              <p className="text-sm text-zinc-600">{email}</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/5 mt-8" />

          <div className="flex flex-col items-stretch gap-3 max-w-xs mx-auto mt-8">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#B8FF4D] transition-all"
            >
              Edit Profile
            </button>
            {canAccessEditor(role) && (
              <Link 
                to="/editor"
                className="w-full px-8 py-4 bg-zinc-900 text-zinc-300 border border-white/5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <PenTool size={16} /> Editor Studio
              </Link>
            )}
            {canAccessAdmin(role) && (
              <Link 
                to="/admin"
                className="w-full px-8 py-4 bg-zinc-900 text-zinc-300 border border-white/5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={16} /> Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Articles Read</p>
            <p className="text-2xl font-black text-white">{dbUser?.readingHistory?.length ?? 0}</p>
          </div>
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Days Active</p>
            <p className="text-2xl font-black text-white">{daysActive}</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-12">
          {settingsSections.map(section => (
            <div key={section.title} className="space-y-6">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">{section.title}</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] overflow-hidden">
                {section.items.map((item, idx) => (
                  <button 
                    key={item.name}
                    className={`w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors ${idx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                        <item.icon size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.value}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-8">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-3 p-6 rounded-3xl border border-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={18} />
              Sign Out from Device
            </button>
            <p className="text-center text-[10px] text-zinc-700 uppercase tracking-widest mt-8">
              Subteen ID: {dbUser?._id ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
