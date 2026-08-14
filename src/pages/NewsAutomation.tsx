import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AutomationOverview } from '../components/automation/AutomationOverview';
import { RssSources } from '../components/automation/RssSources';
import { AutomationReviews } from '../components/automation/AutomationReviews';
import { AutomationReviewDetail } from '../components/automation/AutomationReviewDetail';
import { AutomationImported } from '../components/automation/AutomationImported';
import { AutomationSettings } from '../components/automation/AutomationSettings';
import { useAuth } from '../context/AuthContext';

export const NewsAutomation = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <AdminLayout
      title="News Automation"
      subtitle="Ingest gaming headlines · AI drafting · editorial control"
    >
      <Routes>
        <Route index element={<AutomationOverview />} />
        <Route path="sources" element={isAdmin ? <RssSources /> : <AutomationOverview />} />
        <Route path="reviews" element={<AutomationReviews />} />
        <Route path="review/:id" element={<AutomationReviewDetail />} />
        <Route path="imported" element={<AutomationImported />} />
        <Route path="settings" element={<AutomationSettings />} />
        <Route path="*" element={<AutomationOverview />} />
      </Routes>
    </AdminLayout>
  );
};
