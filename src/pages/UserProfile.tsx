import React, { useState } from 'react';
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
  X as XIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const UserProfile = () => {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const settingsSections = [
    {
      title: 'Account Settings',
      items: [
        { name: 'Email Address', value: 'player.one@example.com', icon: Mail },
        { name: 'Password', value: '••••••••••••', icon: Key },
        { name: 'Security', value: 'Two-factor enabled', icon: Shield },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { name: 'Notifications', value: 'Breaking News, Game Releases', icon: Bell },
        { name: 'Appearance', value: 'Dark Mode', icon: Palette },
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

          <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}>
            {/* Visuals */}
            <div className="space-y-8">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Visual Identity</h2>
              
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cover Image</label>
                  <div className="aspect-[21/9] bg-zinc-900 rounded-[32px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">
                        <ImageIcon size={14} /> Change Cover
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-zinc-900 rounded-full border-4 border-white/5 flex items-center justify-center text-zinc-700 overflow-hidden">
                        <UserIcon size={40} />
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-[#B8FF4D] text-black rounded-full shadow-xl hover:scale-110 transition-transform">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <button className="text-xs font-bold text-white hover:text-[#B8FF4D] transition-colors">Upload new picture</button>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">JPG, PNG or GIF. Max 5MB.</p>
                      <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Remove current</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <h2 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] ml-4">Basic Information</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Display Name</label>
                    <input type="text" defaultValue="Player One" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Username</label>
                    <input type="text" defaultValue="playerone" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
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
                className="flex-2 py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-16">
        {/* Profile Header */}
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-zinc-900 rounded-full mx-auto border-4 border-[#B8FF4D]/10 flex items-center justify-center text-zinc-700">
              <UserIcon size={56} />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#B8FF4D] text-black rounded-full shadow-xl hover:scale-110 transition-transform">
              <Palette size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Player One</h1>
            <p className="text-zinc-500 font-medium">Member since March 2024</p>
          </div>

          <div className="w-full h-px bg-white/5 my-8" />

          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#B8FF4D] transition-all"
            >
              Edit Profile
            </button>
            <Link 
              to="/editor"
              className="w-full px-8 py-4 bg-zinc-900 text-zinc-300 border border-white/5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <PenTool size={16} /> Editor Studio
            </Link>
            <Link 
              to="/admin"
              className="w-full px-8 py-4 bg-zinc-900 text-zinc-300 border border-white/5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={16} /> Admin Panel
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Articles Read</p>
            <p className="text-2xl font-black text-white">124</p>
          </div>
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Days Active</p>
            <p className="text-2xl font-black text-white">42</p>
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
              Subteen ID: user_928374293847
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

