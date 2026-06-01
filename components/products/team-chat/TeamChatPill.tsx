'use client';

/**
 * Team Chat (SPIKE) — header pill
 *
 * The global entry point, mounted into CanaryAppShell's `headerActions` slot so
 * it sits beside the user profile and is reachable from every product surface.
 */

import Icon from '@mdi/react';
import { mdiMessageTextOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups } from '@/lib/products/team-chat/mock-data';

export function TeamChatPill() {
  const { togglePanel, panelOpen } = useSpikeStore();
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);

  return (
    <button
      onClick={togglePanel}
      className="relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors"
      style={{
        borderColor: panelOpen ? colors.colorBlueDark1 : '#E5E7EB',
        backgroundColor: panelOpen ? '#EEF3FD' : 'white',
      }}
    >
      <Icon
        path={mdiMessageTextOutline}
        size={0.85}
        color={panelOpen ? colors.colorBlueDark1 : colors.colorBlack1}
      />
      <span
        className="text-[13px] font-medium"
        style={{ color: panelOpen ? colors.colorBlueDark1 : colors.colorBlack1 }}
      >
        Team
      </span>
      {totalUnread > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ backgroundColor: '#D92D20' }}
        >
          {totalUnread}
        </span>
      )}
    </button>
  );
}
