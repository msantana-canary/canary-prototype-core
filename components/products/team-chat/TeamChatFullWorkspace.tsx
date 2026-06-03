'use client';

/**
 * Team Chat (SPIKE) — full takeover  [variant G]
 *
 * The "other reading" of SJ's bottom-left messaging idea: the SAME ever-present
 * launcher as F, but clicking it opens team chat as a FULL workspace (two-pane:
 * dept/staff list | thread) that takes over the content area — NOT small popups
 * (that's F). The nav stays (his "full left sidebar for navigation"). Built so F vs G
 * makes SJ's own ambiguity feel-able: popups vs takeover — which did he picture?
 */

import { useEffect, useMemo, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronUp,
  mdiClose,
  mdiSendOutline,
  mdiPaperclip,
  mdiAccountMultipleOutline,
  mdiBullhornOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups, staff, getConversation, CURRENT_USER } from '@/lib/products/team-chat/mock-data';
import type { ChatMessage, ConversationId } from '@/lib/products/team-chat/types';
import { FlatMessage } from './TeamChatPanel';

const LAUNCHER_WIDTH = 180; // matches the navy App Shell sidebar

export function TeamChatFullWorkspace() {
  const { floatyListOpen, toggleFloatyList, fullActiveId, setFullActive } = useSpikeStore();
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (floatyListOpen) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
  }, [floatyListOpen]);

  if (!floatyListOpen) {
    return (
      <button
        onClick={toggleFloatyList}
        className="fixed bottom-0 left-0 z-40 flex items-center justify-between border-t border-white/15 px-4 py-3 text-white"
        style={{ width: LAUNCHER_WIDTH, backgroundColor: colors.colorBlueDark1 }}
      >
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          Team chat
          {totalUnread > 0 && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#F16682' }} />}
        </span>
        <Icon path={mdiChevronUp} size={0.9} color="white" />
      </button>
    );
  }

  return (
    <>
      {/* dim the work behind — overlay, not takeover (dismiss to get back to it) */}
      <div className="fixed inset-0 z-30" style={{ backgroundColor: 'rgba(16,24,40,0.18)', opacity: shown ? 1 : 0, transition: 'opacity 200ms ease' }} onClick={toggleFloatyList} />
      <div
        className="fixed z-40 flex overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{
          top: 72,
          bottom: 24,
          left: LAUNCHER_WIDTH + 24,
          right: 24,
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.985)',
          transformOrigin: 'bottom left',
          transition: 'opacity 200ms ease, transform 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
      {/* left: conversation list */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-gray-200">
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.colorBlueDark1 }}>
          <span className="text-[15px] font-semibold text-white">Team chat</span>
          <button onClick={toggleFloatyList} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10" aria-label="Close team chat">
            <Icon path={mdiClose} size={0.8} color="white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-2">
          <WsSection label="Departments" />
          {groups.map((g) => (
            <WsRow
              key={g.id}
              name={g.name}
              icon={g.isBroadcast ? mdiBullhornOutline : mdiAccountMultipleOutline}
              accent={g.accent}
              unread={g.unread}
              active={fullActiveId === g.id}
              onClick={() => setFullActive(g.id)}
            />
          ))}
          <WsSection label="Staff" />
          {staff.map((s) => (
            <WsRow
              key={s.id}
              name={s.name}
              avatar={s.avatar}
              initials={s.initials}
              online={s.online}
              active={fullActiveId === `staff:${s.id}`}
              onClick={() => setFullActive(`staff:${s.id}`)}
            />
          ))}
        </div>
      </div>

      {/* right: active thread */}
      <FullThread id={(fullActiveId ?? 'front-desk') as ConversationId} />
      </div>
    </>
  );
}

function FullThread({ id }: { id: ConversationId }) {
  const convo = getConversation(id);
  const [draft, setDraft] = useState('');
  const [appended, setAppended] = useState<ChatMessage[]>([]);
  const thread = useMemo(() => [...convo.messages, ...appended], [convo.messages, appended]);
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setAppended((p) => [
      ...p,
      { id: `wf-${id}-${p.length}`, authorName: CURRENT_USER.name, authorInitials: CURRENT_USER.initials, authorAvatar: CURRENT_USER.avatar, time: 'Now', self: true, text: t },
    ]);
    setDraft('');
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        {convo.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={convo.avatar} alt={convo.title} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: (convo.accent ?? colors.colorBlueDark1) + '1A' }}>
            <span className="text-[12px] font-bold" style={{ color: convo.accent ?? colors.colorBlueDark1 }}>{convo.title.slice(0, 2)}</span>
          </span>
        )}
        <span className="text-[15px] font-semibold" style={{ color: colors.colorBlack1 }}>{convo.title}</span>
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col overflow-y-auto px-4 py-3">
        {thread.map((m) => (
          <FlatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="mx-auto flex w-full max-w-[760px] items-end gap-2 rounded-lg border border-gray-200 px-2 py-1.5">
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-gray-100" aria-label="Attach">
            <Icon path={mdiPaperclip} size={0.8} color={colors.colorBlack3} />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`Message ${convo.title}…`}
            className="max-h-24 flex-1 resize-none bg-transparent py-1 text-[13px] outline-none"
            style={{ color: colors.colorBlack1 }}
          />
          <button onClick={send} disabled={!draft.trim()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md disabled:opacity-40" style={{ backgroundColor: colors.colorBlueDark1 }} aria-label="Send">
            <Icon path={mdiSendOutline} size={0.7} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WsSection({ label }: { label: string }) {
  return <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.colorBlack4 }}>{label}</div>;
}

function WsRow({
  name, icon, avatar, initials, accent, unread, online, active, onClick,
}: {
  name: string; icon?: string; avatar?: string; initials?: string; accent?: string; unread?: number; online?: boolean; active?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-gray-50" style={{ backgroundColor: active ? '#EAF1FE' : 'transparent' }}>
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover" />
        ) : initials ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#8A94A6' }}>{initials}</span>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: (accent ?? colors.colorBlueDark1) + '1A' }}>
            <Icon path={icon!} size={0.75} color={accent ?? colors.colorBlueDark1} />
          </span>
        )}
        {online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ backgroundColor: '#3DD68C' }} />}
      </span>
      <span className="flex-1 truncate text-[13px] font-medium" style={{ color: colors.colorBlack1 }}>{name}</span>
      {unread ? (
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: colors.colorBlueDark1 }}>{unread}</span>
      ) : null}
    </button>
  );
}
