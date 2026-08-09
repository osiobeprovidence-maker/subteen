import React from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { Zap, Radio, FileStack, Inbox, SlidersHorizontal } from 'lucide-react';
import { AutomationOverview } from '../components/automation/AutomationOverview';
import { RssSources } from '../components/automation/RssSources';
import { AutomationReviews } from '../components/automation/AutomationReviews';
import { AutomationReviewDetail } from '../components/automation/AutomationReviewDetail';
import { AutomationImported } from '../components/automation/AutomationImported';
import { AutomationSettings } from '../components/automation/AutomationSettings';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const TABS = [
  { path: '/admin/automation', label: 'Overview', icon: Zap, end: true },
  { path: '/admin/automation/sources', label: 'Sources', icon: Radio, adminOnly: true },
  { path: '/admin/automation/reviews', label: 'Reviews', icon: FileStack },
  { path: '/admin/automation/imported', label: 'Imported', icon: Inbox },
  { path: '/admin/automation/settings', label: 'Settings', icon: SlidersHorizontal },
];

export const NewsAutomation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';

  const isReviewDetail = location.pathname.includes('/admin/automation/review/');

  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdmin);

  const activeTab = isReviewDetail
    ? '/admin/automation/reviews'
    : visibleTabs.find((tab) =>
        tab.end ? location.pathname === tab.path : location.pathname.startsWith(tab.path),
      )?.path ?? '/admin/automation';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B8FF4D] flex items-center justify-center">
            <Zap size={22} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">News Automation</h1>
            <p className="text-xs text-zinc-500 mt-1.5 uppercase tracking-widest">
              Ingest gaming headlines · AI drafting · editorial control
            </p>
          </div>
        </div>
      </div>

      {!isReviewDetail && (
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-white/5">
          {visibleTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-t-xl border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.path
                  ? "border-[#B8FF4D] text-[#B8FF4D]"
                  : "border-transparent text-zinc-500 hover:text-white",
              )}
            >
              <tab.icon size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <Routes>
        <Route index element={<AutomationOverview />} />
        <Route path="sources" element={isAdmin ? <RssSources /> : <AutomationOverview />} />
        <Route path="reviews" element={<AutomationReviews />} />
        <Route path="review/:id" element={<AutomationReviewDetail />} />
        <Route path="imported" element={<AutomationImported />} />
        <Route path="settings" element={<AutomationSettings />} />
        <Route path="*" element={<AutomationOverview />} />
      </Routes>
    </div>
  );
};
