import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminArticles } from '../components/admin/AdminArticles';
import { AdminCategories } from '../components/admin/AdminCategories';
import { AdminTags } from '../components/admin/AdminTags';
import { AdminGames } from '../components/admin/AdminGames';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminAds } from '../components/admin/AdminAds';
import { AdminCommunities } from '../components/admin/AdminCommunities';
import { AdminSections } from '../components/admin/AdminSections';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminReviewQueue } from '../components/admin/AdminReviewQueue';
import { AdminMedia } from '../components/admin/AdminMedia';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminEvents } from '../components/admin/AdminEvents';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { Link, useLocation } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';

export const AdminPanel = () => {
  const location = useLocation();
  const path = location.pathname;

  const getSection = () => {
    if (path.startsWith('/admin/articles')) return 'articles';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/sections')) return 'sections';
    if (path.startsWith('/admin/tags')) return 'tags';
    if (path.startsWith('/admin/communities')) return 'communities';
    if (path.startsWith('/admin/games')) return 'games';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/ads')) return 'ads';
    if (path.startsWith('/admin/media')) return 'media';
    if (path.startsWith('/admin/reports')) return 'reports';
    if (path.startsWith('/admin/review-queue')) return 'review-queue';
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path.startsWith('/admin/placements')) return 'placements';
    if (path.startsWith('/admin/events')) return 'events';
    if (path.startsWith('/admin/analytics')) return 'analytics';
    return 'dashboard';
  };

  const section = getSection();

  const SECTION_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    articles: 'Articles',
    communities: 'Communities',
    categories: 'Categories',
    sections: 'Sections',
    tags: 'Tags',
    games: 'Games',
    users: 'Users',
    ads: 'Ads',
    placements: 'Placements',
    media: 'Media Library',
    reports: 'Reports',
    'review-queue': 'Review Queue',
    settings: 'Settings',
    events: 'Events',
    analytics: 'Analytics',
  };

  const SECTION_SUBTITLES: Record<string, string> = {
    dashboard: 'Platform health and content at a glance.',
    articles: 'Create, edit and manage every article on the platform.',
    communities: 'Manage community hubs and their profiles.',
    categories: 'Organize articles into editorial categories.',
    sections: 'Control which pillars appear in the site navigation.',
    tags: 'Manage topic tags across all articles.',
    games: 'Track games and game coverage.',
    users: 'Manage members, editors and their roles.',
    ads: 'Run and manage advertising campaigns.',
    placements: 'Configure where ad placements appear.',
    media: 'Upload, preview and manage site-wide media assets.',
    reports: 'Review member-reported content and keep the platform safe.',
    'review-queue': 'Approve or reject community-submitted content.',
    settings: 'Publication settings and brand assets.',
    events: 'Create and manage event coverage.',
    analytics: 'Real platform metrics, straight from your data.',
  };

  const renderActions = () => {
    switch (section) {
      case 'events':
        return (
          <>
            <Link
              to="/events"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <ExternalLink size={13} /> View Public Page
            </Link>
            <Link
              to="/editor/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              <Plus size={13} /> New Event
            </Link>
          </>
        );
      case 'articles':
        return (
          <Link
            to="/editor/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            <Plus size={13} /> New Article
          </Link>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (section) {
      case 'articles': return <AdminArticles />;
      case 'categories': return <AdminCategories />;
      case 'sections': return <AdminSections />;
      case 'tags': return <AdminTags />;
      case 'communities': return <AdminCommunities />;
      case 'games': return <AdminGames />;
      case 'users': return <AdminUsers />;
      case 'ads': return <AdminAds />;
      case 'placements': return <AdminAds initialView="Placements" />;
      case 'media': return <AdminMedia />;
      case 'reports': return <AdminReports />;
      case 'events': return <AdminEvents />;
      case 'analytics': return <AdminAnalytics />;
      case 'review-queue': return <AdminReviewQueue />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      title={SECTION_TITLES[section] ?? 'Dashboard'}
      subtitle={SECTION_SUBTITLES[section] ?? 'Manage your publication.'}
      actions={renderActions()}
    >
      {renderContent()}
    </AdminLayout>
  );
};
