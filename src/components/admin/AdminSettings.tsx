import React from 'react';
import { 
  Settings as SettingsIcon, 
  Image as ImageIcon,
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
  Timer,
  Loader2,
  Check
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { BrandAssetsPanel } from './BrandAssetsPanel';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = React.useState('General');
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);
  const [autoApproveEnabled, setAutoApproveEnabled] = React.useState(false);
  const [autoApproveDelayMinutes, setAutoApproveDelayMinutes] = React.useState(5);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setAutoApproveEnabled(settings.autoApproveEnabled ?? false);
      setAutoApproveDelayMinutes(settings.autoApproveDelayMinutes ?? 5);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        autoApproveEnabled,
        autoApproveDelayMinutes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { name: 'General', icon: SettingsIcon },
    { name: 'Brand Assets', icon: ImageIcon },
    { name: 'Homepage', icon: Layout },
    { name: 'Automation', icon: Timer },
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
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
            {saved ? 'Saved' : 'Save Changes'}
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

        {activeTab === 'Brand Assets' && (
          <BrandAssetsPanel />
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

        {activeTab === 'Automation' && (
          <div className="space-y-8 max-w-2xl">
            <div className="rounded-2xl border border-[#B8FF4D]/20 bg-[#B8FF4D]/5 p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-[#B8FF4D]" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Time-Based Auto-Approval</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-md leading-relaxed">
                    When enabled, drafts submitted for review are automatically approved and published once the delay
                    elapses — unless an editor approves or rejects them first.
                  </p>
                </div>
                <button
                  onClick={() => setAutoApproveEnabled(!autoApproveEnabled)}
                  className={cn(
                    "w-14 h-7 rounded-full relative transition-colors duration-300 shrink-0",
                    autoApproveEnabled ? "bg-[#B8FF4D]" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-5 h-5 rounded-full bg-black transition-all duration-300",
                    autoApproveEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Auto-Approval Delay</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={autoApproveDelayMinutes}
                  onChange={(e) => setAutoApproveDelayMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 pr-20 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">minutes</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Each draft in the review queue shows an "auto-approval in mm:ss" countdown using this delay. The timer is
                stored with the draft, so it survives refreshes and is checked server-side every minute.
              </p>
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
