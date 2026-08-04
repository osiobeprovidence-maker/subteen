import React from 'react';
import { 
  Megaphone, 
  MousePointer2, 
  Eye, 
  DollarSign, 
  Plus, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Monitor,
  Layout,
  LayoutGrid,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminAds = () => {
  const [activeView, setActiveView] = React.useState<'Campaigns' | 'Placements'>('Campaigns');

  const campaigns = [
    { advertiser: 'Razer', name: 'Kraken V4 Launch', status: 'Active', clicks: '12.4k', views: '142k', ctr: '8.7%', rev: '$1,240' },
    { advertiser: 'Samsung', name: 'Odyssey G9 Promo', status: 'Active', clicks: '45.2k', views: '820k', ctr: '5.5%', rev: '$4,520' },
    { advertiser: 'Logitech', name: 'G Pro Wireless', status: 'Paused', clicks: '8.1k', views: '120k', ctr: '6.7%', rev: '$810' },
  ];

  const placements = [
    { name: 'Homepage Hero', status: true, platform: 'Desktop / Mobile', size: '1920x450' },
    { name: 'Sidebar Sticky', status: true, platform: 'Desktop', size: '300x600' },
    { name: 'Article Inline', status: true, platform: 'Desktop / Mobile', size: '728x90' },
    { name: 'Mobile Banner', status: false, platform: 'Mobile', size: '320x50' },
    { name: 'Search Results', status: true, platform: 'Desktop / Mobile', size: 'Native' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-white/5 rounded-2xl w-fit">
        {['Campaigns', 'Placements'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view as any)}
            className={cn(
              "px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeView === view ? "bg-[#B8FF4D] text-black shadow-lg" : "text-zinc-500 hover:text-white"
            )}
          >
            {view}
          </button>
        ))}
      </div>

      {activeView === 'Campaigns' ? (
        <div className="space-y-12">
          {/* Ad Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: '$12,840', icon: DollarSign, change: '+18%' },
              { label: 'Impressions', value: '2.4M', icon: Eye, change: '+12%' },
              { label: 'Avg. CTR', value: '6.4%', icon: MousePointer2, change: '+0.5%' },
              { label: 'Active Ads', value: '14', icon: Megaphone, change: '0%' },
            ].map(stat => (
              <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <span className="text-[10px] font-bold text-[#B8FF4D]">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Campaigns</h3>
              <button className="px-6 py-2 bg-[#B8FF4D] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10">
                + New Campaign
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Advertiser / Campaign</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Performance</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800">
                          <ImageIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors cursor-pointer">{camp.advertiser}</p>
                          <p className="text-xs text-zinc-500">{camp.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                        camp.status === 'Active' ? "text-[#B8FF4D]" : "text-zinc-600"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", camp.status === 'Active' ? "bg-[#B8FF4D]" : "bg-zinc-600")} />
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-white">{camp.views} views</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{camp.ctr} CTR</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white">{camp.rev}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-zinc-600 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placements.map((p, i) => (
            <div key={i} className="bg-zinc-950 border border-white/5 p-8 rounded-[40px] space-y-6 group hover:border-[#B8FF4D]/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <LayoutGrid size={24} />
                </div>
                <button 
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    p.status ? "bg-[#B8FF4D]/10 text-[#B8FF4D]" : "bg-zinc-900 text-zinc-600"
                  )}
                >
                  {p.status ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{p.platform} • {p.size}</p>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Active Ads: 2</span>
                <button className="text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest hover:text-white transition-colors">Configure</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MoreVertical = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);

const ImageIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
