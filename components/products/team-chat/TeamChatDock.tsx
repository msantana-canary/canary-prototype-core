'use client';

/**
 * Team Chat (SPIKE) — docked launcher  [variant F]
 *
 * SJ's Messenger-style dock: a "Team chat" launcher pinned to the bottom-left (over
 * the App Shell sidebar's foot) → expands UP into Departments + Staff → tapping a row
 * opens a stackable popup window. Overlays the product (no reflow). Everything is
 * fixed/viewport-anchored so it reads as living in the sidebar.
 *
 * NOTE: the dev harness also lives bottom-left (higher z) — collapse it to see the
 * launcher cleanly. Department names reuse the spike's existing groups.
 */

import Icon from '@mdi/react';
import { mdiChevronUp, mdiChevronDown, mdiAccountMultipleOutline, mdiBullhornOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups, staff } from '@/lib/products/team-chat/mock-data';
import type { ConversationId } from '@/lib/products/team-chat/types';
import { TeamChatFloatyWindow, FLOATY_WIDTH } from './TeamChatFloatyWindow';

const LAUNCHER_WIDTH = 212;
const LIST_WIDTH = 264;
const DOCK_BLUE = colors.colorBlueDark1; // #2858C4

export function TeamChatDock() {
  const { floatyListOpen, toggleFloatyList, floatyWindows, openFloatyWindow, closeFloatyWindow } = useSpikeStore();
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);
  const windowsLeftStart = (floatyListOpen ? LIST_WIDTH : LAUNCHER_WIDTH) + 28;

  return (
    <>
      {floatyListOpen ? (
        <div
          className="fixed bottom-0 left-0 z-40 flex max-h-[74vh] flex-col rounded-tr-xl text-white"
          style={{ width: LIST_WIDTH, backgroundColor: DOCK_BLUE, boxShadow: '4px 0 28px rgba(0,0,0,0.22)' }}
        >
          <button onClick={toggleFloatyList} className="flex shrink-0 items-center justify-between px-4 py-3 hover:bg-white/5">
            <span className="text-[14px] font-semibold">Team chat</span>
            <Icon path={mdiChevronDown} size={0.9} color="white" />
          </button>
          <div className="flex-1 overflow-y-auto pb-2">
            <DockSection label="Departments" />
            {groups.map((g) => (
              <DockRow
                key={g.id}
                name={g.name}
                icon={g.isBroadcast ? mdiBullhornOutline : mdiAccountMultipleOutline}
                unread={g.unread}
                active={floatyWindows.includes(g.id)}
                onClick={() => openFloatyWindow(g.id)}
              />
            ))}
            <DockSection label="Staff" />
            {staff.map((s) => (
              <DockRow
                key={s.id}
                name={s.name}
                avatar={s.avatar}
                initials={s.initials}
                online={s.online}
                active={floatyWindows.includes(`staff:${s.id}`)}
                onClick={() => openFloatyWindow(`staff:${s.id}`)}
              />
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={toggleFloatyList}
          className="fixed bottom-0 left-0 z-40 flex items-center justify-between rounded-tr-xl px-4 py-3 text-white"
          style={{ width: LAUNCHER_WIDTH, backgroundColor: DOCK_BLUE, boxShadow: '0 -2px 16px rgba(0,0,0,0.18)' }}
        >
          <span className="flex items-center gap-2 text-[14px] font-semibold">
            Team chat
            {totalUnread > 0 && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#F16682' }} />}
          </span>
          <Icon path={mdiChevronUp} size={0.9} color="white" />
        </button>
      )}

      {floatyWindows.map((id, i) => (
        <TeamChatFloatyWindow
          key={id}
          id={id as ConversationId}
          left={windowsLeftStart + i * (FLOATY_WIDTH + 12)}
          onClose={() => closeFloatyWindow(id)}
        />
      ))}
    </>
  );
}

function DockSection({ label }: { label: string }) {
  return <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-white/55">{label}</div>;
}

function DockRow({
  name,
  icon,
  avatar,
  initials,
  unread,
  online,
  active,
  onClick,
}: {
  name: string;
  icon?: string;
  avatar?: string;
  initials?: string;
  unread?: number;
  online?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-white/10"
      style={{ backgroundColor: active ? 'rgba(255,255,255,0.16)' : 'transparent' }}
    >
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover" />
        ) : initials ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">{initials}</span>
        ) : (
          <Icon path={icon!} size={0.8} color="white" />
        )}
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: '#3DD68C', borderColor: DOCK_BLUE }} />
        )}
      </span>
      <span className="flex-1 truncate text-[13px] font-medium text-white">{name}</span>
      {unread ? (
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ backgroundColor: 'white', color: DOCK_BLUE }}>
          {unread}
        </span>
      ) : null}
    </button>
  );
}
