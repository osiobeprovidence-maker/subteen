import React from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Layout, 
  Navigation, 
  Lock, 
  Search, 
  Mail, 
  Megaphone, 
  ShieldAlert, 
  Database, 
  Key, 
  ShieldCheck,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = React.useState('General');

  const settingsTabs = [
    { name: 'General', icon: SettingsIcon },
    { name: 'Branding', icon: Palette },
    { name: 'Homepage', icon: Layout },
    { name: 'Navigation', icon: Navigation },
    { name: 'Authentication', icon: Lock },
    { name: 'SEO', icon: Search },
    { name: 'Newsletter', icon: Mail },
    { name: 'Ads', icon: Megaphone },
    { name: 'Moderation', icon: ShieldAlert },
    { name: 'Storage', icon: Database },
    { name: 'API Keys', icon: Key },
    { name: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      {/* Settings Sub-nav */}
      <aside className="space-y-2">
        {settingsTabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab.name 
                ? "bg-[#B8FF4D] text-black shadow-xl shadow-[#B8FF4D]/10" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </aside>

      {/* Settings Content */}
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 lg:p-12 space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeTab} Settings</h2>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-white/10">
            Save Changes
          </button>
        </div>

        {activeTab === 'General' && (
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Site Name</label>
              <input type="text" defaultValue="SUBTEEN" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Site Description</label>
              <textarea rows={3} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors resize-none" defaultValue="The ultimate gaming news publication." />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Language</label>
                <select className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none appearance-none">
                  <option>English (US)</option>
                  <option>German</option>
                  <option>French</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Timezone</label>
                <select className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none appearance-none">
                  <option>UTC-7 (Pacific)</option>
                  <option>UTC+0 (London)</option>
                  <option>UTC+1 (Berlin)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Branding' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Site Logo</label>
                <div className="aspect-video bg-zinc-900 rounded-[32px] border border-white/5 flex items-center justify-center relative group overflow-hidden">
                   <span className="text-4xl font-black italic tracking-tighter">SUBTEEN</span>
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <button className="px-4 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Replace Logo</button>
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Accent Color</label>
                <div className="flex flex-wrap gap-4">
                  {['#B8FF4D', '#FF4D4D', '#4D9FFF', '#FF4DEB', '#FFFFFF'].map(color => (
                    <button 
                      key={color} 
                      className={cn(
                        "w-12 h-12 rounded-2xl border-4 transition-all",
                        color === '#B8FF4D' ? "border-white/20" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Homepage' && (
          <div className="space-y-8 max-w-2xl">
             <div className="space-y-4">
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Featured Article Layout</label>
               <div className="grid grid-cols-3 gap-4">
                 {['Hero', 'Grid', 'Slider'].map(layout => (
                   <button key={layout} className="aspect-square bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:border-[#B8FF4D] transition-colors">
                     {layout}
                   </button>
                 ))}
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Trending Limit</label>
                  <input type="number" defaultValue={5} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Latest Limit</label>
                  <input type="number" defaultValue={10} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm" />
                </div>
             </div>
          </div>
        )}

        {/* Other tabs placeholders */}
        {['Ads', 'SEO', 'API Keys'].includes(activeTab) && (
          <div className="py-20 text-center opacity-30">
            <SettingsIcon size={48} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">{activeTab} configuration logic goes here</p>
          </div>
        )}
      </div>
    </div>
  );
};
