import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { cn } from '@/utils/cn';

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-200 min-h-screen',
          isRTL ? 'lg:mr-64' : 'lg:ml-64'
        )}
      >
        {/* Top Header (Mobile Only) */}
        <AdminHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Admin Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
