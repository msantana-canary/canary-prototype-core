'use client';

/**
 * Team Chat (SPIKE) — panel content (variant-agnostic)
 *
 * Group-list-first IA (scales to Andrew's many department groups + lets you
 * triage unread across groups): open → list → tap a group → thread → back.
 * Messages render as a FLAT thread (Slack/Teams style), not chat bubbles —
 * denser, scannable as an ops log, and AI auto-posts / object cards sit cleanly.
 */

import { useMemo, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiArrowLeft,
  mdiSendOutline,
  mdiPaperclip,
  mdiBullhornOutline,
  mdiCheckAll,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups, messagesByGroup, CURRENT_USER } from '@/lib/products/team-chat/mock-data';
import type { ChatGroup, ChatMessage } from '@/lib/products/team-chat/types';
import { ObjectCard } from './ObjectCard';

export function TeamChatPanel() {
  const view = useSpikeStore((s) => s.view);
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {view === 'list' ? <GroupListView /> : <ThreadView />}
    </div>
  );
}

/* ── Group list ─────────────────────────────────────────────────────── */

function GroupListView() {
  const { closePanel, openThread } = useSpikeStore();
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <span className="text-[15px] font-semibold" style={{ color: colors.colorBlack1 }}>
          Team Chat
        </span>
        <button
          onClick={closePanel}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Close team chat"
        >
          <Icon path={mdiClose} size={0.8} color={colors.colorBlack3} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-2">
        <div
          className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: colors.colorBlack4 }}
        >
          Your groups
        </div>
        {groups.map((g) => (
          <GroupRow key={g.id} group={g} onClick={() => openThread(g.id)} />
        ))}
      </div>
    </>
  );
}

function GroupRow({ group, onClick }: { group: ChatGroup; onClick: () => void }) {
  const msgs = messagesByGroup[group.id] ?? [];
  const last = msgs[msgs.length - 1];
  const lastAuthor = last ? (last.self ? 'You' : last.authorName.split(' ')[0]) : '';

  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50">
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: group.accent + '1A' }}
      >
        {group.isBroadcast ? (
          <Icon path={mdiBullhornOutline} size={0.8} color={group.accent} />
        ) : (
          <span className="text-[12px] font-bold" style={{ color: group.accent }}>
            {group.name.slice(0, 2)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold" style={{ color: colors.colorBlack1 }}>
            {group.name}
          </span>
          <span className="shrink-0 text-[10px]" style={{ color: colors.colorBlack4 }}>
            {last?.time ?? ''}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: colors.colorBlack3 }}>
            {last ? `${lastAuthor}: ${last.text ?? '[card]'}` : 'No messages yet'}
          </span>
          {group.unread > 0 && (
            <span
              className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: colors.colorBlueDark1 }}
            >
              {group.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

/* ── Thread ─────────────────────────────────────────────────────────── */

function ThreadView() {
  const { activeGroupId, backToList, closePanel } = useSpikeStore();
  const [draft, setDraft] = useState('');
  const [appended, setAppended] = useState<ChatMessage[]>([]);

  const group = groups.find((g) => g.id === activeGroupId) ?? groups[0];
  const baseMsgs = activeGroupId ? messagesByGroup[activeGroupId] ?? [] : [];
  const thread = useMemo(() => [...baseMsgs, ...appended], [baseMsgs, appended]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeGroupId) return;
    setAppended((prev) => [
      ...prev,
      {
        id: `local-${activeGroupId}-${prev.length}`,
        groupId: activeGroupId,
        authorName: CURRENT_USER.name,
        authorInitials: CURRENT_USER.initials,
        authorAvatar: CURRENT_USER.avatar,
        time: 'Now',
        self: true,
        text,
      },
    ]);
    setDraft('');
  };

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-gray-200 px-2 py-2.5">
        <button
          onClick={backToList}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Back to groups"
        >
          <Icon path={mdiArrowLeft} size={0.8} color={colors.colorBlack3} />
        </button>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: group.accent }} />
        <span className="flex-1 truncate text-[14px] font-semibold" style={{ color: colors.colorBlack1 }}>
          {group.name}
        </span>
        {group.isBroadcast && <Icon path={mdiBullhornOutline} size={0.6} color={colors.colorBlack4} />}
        <button
          onClick={closePanel}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Close team chat"
        >
          <Icon path={mdiClose} size={0.8} color={colors.colorBlack3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {thread.map((m) => (
          <FlatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="border-t border-gray-200 px-3 py-2.5">
        <div className="flex items-end gap-2 rounded-lg border border-gray-200 px-2 py-1.5">
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-gray-100" aria-label="Attach">
            <Icon path={mdiPaperclip} size={0.8} color={colors.colorBlack3} />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={`Message ${group.name}…`}
            className="max-h-24 flex-1 resize-none bg-transparent py-1 text-[13px] outline-none"
            style={{ color: colors.colorBlack1 }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md disabled:opacity-40"
            style={{ backgroundColor: colors.colorBlueDark1 }}
            aria-label="Send"
          >
            <Icon path={mdiSendOutline} size={0.7} color="white" />
          </button>
        </div>
      </div>
    </>
  );
}

function FlatMessage({ message: m }: { message: ChatMessage }) {
  const isAI = m.isAI;
  const isSelf = m.self;

  return (
    <div className="flex gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50">
      {m.authorAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.authorAvatar} alt={m.authorName} className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: isAI ? '#7A5AF8' : isSelf ? colors.colorBlueDark1 : '#8A94A6' }}
        >
          {m.authorInitials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold" style={{ color: isSelf ? colors.colorBlueDark1 : colors.colorBlack1 }}>
            {isSelf ? 'You' : m.authorName}
          </span>
          {isAI && (
            <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: '#7A5AF8' }}>
              Auto
            </span>
          )}
          <span className="text-[10px]" style={{ color: colors.colorBlack4 }}>{m.time}</span>
        </div>

        {m.text && (
          <div className="mt-0.5 text-[13px] leading-snug" style={{ color: colors.colorBlack1 }}>
            {m.text}
          </div>
        )}
        {m.card && <ObjectCard card={m.card} />}
        {m.seenBy != null && (
          <span className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: colors.colorBlack4 }}>
            <Icon path={mdiCheckAll} size={0.55} color={colors.colorBlueDark1} />
            Seen by {m.seenBy}
          </span>
        )}
      </div>
    </div>
  );
}
