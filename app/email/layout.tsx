/**
 * Email Channel — Route Layout (new app-shell paradigm)
 *
 * Standalone shell for the Email channel: the custom NewSidebar (240px nav
 * rail) + a content column with the NewTopBar over the page. Deliberately does
 * NOT use the legacy CanaryAppShell / (dashboard) layout — this is Wenjun's
 * redesigned shell, SJ-approved 2026-07-13.
 */

import React from 'react';
import { NewSidebar } from '@/components/products/email/shell/NewSidebar';
import { NewTopBar } from '@/components/products/email/shell/NewTopBar';

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
      <NewSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <NewTopBar />
        {children}
      </div>
    </div>
  );
}
