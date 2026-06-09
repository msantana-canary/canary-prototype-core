'use client';

import { CollapsedSidebar } from '@/components/products/command-center/CollapsedSidebar';
import { useCommandCenterStore } from '@/lib/products/command-center/store';
import { useMemo } from 'react';

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { threads } = useCommandCenterStore();

  const unreadCount = useMemo(() => {
    return threads.filter((t) => t.isUnread && !t.isCompleted).length;
  }, [threads]);

  return (
    <div className="h-screen flex bg-white">
      <CollapsedSidebar unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
