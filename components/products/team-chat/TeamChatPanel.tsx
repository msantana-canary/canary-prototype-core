'use client';

/**
 * Team Chat (SPIKE) — panel content
 *
 * Group-list-first IA: list → tap group → flat thread. Expands to a full-screen
 * two-pane (list | thread). Window controls (collapse + close) are pinned to the
 * TOP-RIGHT in every state, so expanding doesn't make them travel — the panel just
 * opens leftward around them. Two-tier list (Your / Other groups); you can READ any
 * group, with a "Join Group" CTA when you're not a member.
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
  mdiFullscreen,
  mdiFullscreenExit,
  mdiDotsHorizontal,
  mdiPlus,
  mdiAccountMultipleOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups, messagesByGroup, CURRENT_USER } from '@/lib/products/team-chat/mock-data';
import type { ChatGroup, ChatMessage } from '@/lib/products/team-chat/types';
import { ObjectCard } from './ObjectCard';

export function TeamChatPanel() {
  const view = useSpikeStore((s) => s.view);
  const panelExpanded = useSpikeStore((s) => s.panelExpanded);

  if (panelExpanded) {
    return (
      <div className="flex h-full w-full bg-white">
        <div className="flex w-[320px] shrink-0 flex-col border-r border-gray-200">
          <GroupListView />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <ThreadView />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {view === 'list' ? <GroupListView /> : <ThreadView />}
    </div>
  );
}

/* Window chrome — expand/collapse + close, pinned top-right in every state. */
function WindowControls() {
  const { panelExpanded, toggleExpanded, closePanel } = useSpikeStore();
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={toggleExpanded}
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
        title={panelExpanded ? 'Collapse' : 'Expand to full screen'}
        aria-label={panelExpanded ? 'Collapse team chat' : 'Expand team chat'}
      >
        <Icon path={panelExpanded ? mdiFullscreenExit : mdiFullscreen} size={0.85} color={colors.colorBlack3} />
      </button>
      <button
        onClick={closePanel}
        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
        aria-label="Close team chat"
      >
        <Icon path={mdiClose} size={0.8} color={colors.colorBlack3} />
      </button>
    </div>
  );
}

function isSubscribed(g: ChatGroup, joined: string[]) {
  return Boolean(g.subscribed) || joined.includes(g.id);
}

/* ── Group list ─────────────────────────────────────────────────────── */

function GroupListView() {
  const { openThread, activeGroupId, panelExpanded, joinedGroups } = useSpikeStore();
  const effectiveActive = activeGroupId ?? groups[0].id;
  const yours = groups.filter((g) => isSubscribed(g, joinedGroups));
  const others = groups.filter((g) => !isSubscribed(g, joinedGroups));

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <span className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: colors.colorBlack1 }}>
          <Icon path={mdiAccountMultipleOutline} size={0.8} color={colors.colorBlack2} />
          Your Groups
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
            style={{ backgroundColor: colors.colorBlueDark1 }}
          >
            {yours.length}
          </span>
        </span>
        <div className="flex items-center gap-0.5">
          <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100" title="New group" aria-label="New group">
            <Icon path={mdiPlus} size={0.95} color={colors.colorBlack3} />
          </button>
          {!panelExpanded && <WindowControls />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        <GroupSection label="Your groups" />
        {yours.map((g) => (
          <GroupRow key={g.id} group={g} active={panelExpanded && g.id === effectiveActive} onClick={() => openThread(g.id)} />
        ))}
        {others.length > 0 && <GroupSection label="Other groups" />}
        {others.map((g) => (
          <GroupRow key={g.id} group={g} active={panelExpanded && g.id === effectiveActive} onClick={() => openThread(g.id)} />
        ))}
      </div>
    </>
  );
}

function GroupSection({ label }: { label: string }) {
  return (
    <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.colorBlack4 }}>
      {label}
    </div>
  );
}

function GroupRow({ group, active, onClick }: { group: ChatGroup; active?: boolean; onClick: () => void }) {
  const msgs = messagesByGroup[group.id] ?? [];
  const last = msgs[msgs.length - 1];
  const lastAuthor = last ? (last.self ? 'You' : last.authorName.split(' ')[0]) : '';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
      style={{ backgroundColor: active ? '#EAF1FE' : undefined }}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: group.accent + '1A' }}>
        {group.isBroadcast ? (
          <Icon path={mdiBullhornOutline} size={0.8} color={group.accent} />
        ) : (
          <span className="text-[12px] font-bold" style={{ color: group.accent }}>{group.name.slice(0, 2)}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold" style={{ color: colors.colorBlack1 }}>{group.name}</span>
          <span className="shrink-0 text-[10px]" style={{ color: colors.colorBlack4 }}>{last?.time ?? ''}</span>
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
  const { activeGroupId, backToList, panelExpanded, joinedGroups, joinGroup } = useSpikeStore();
  const [draft, setDraft] = useState('');
  const [appended, setAppended] = useState<ChatMessage[]>([]);

  const group = groups.find((g) => g.id === activeGroupId) ?? groups[0];
  const baseMsgs = messagesByGroup[group.id] ?? [];
  const thread = useMemo(() => [...baseMsgs, ...appended], [baseMsgs, appended]);
  const subscribed = isSubscribed(group, joinedGroups);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setAppended((prev) => [
      ...prev,
      {
        id: `local-${group.id}-${prev.length}`,
        groupId: group.id,
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
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5">
        {!panelExpanded && (
          <button
            onClick={backToList}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-gray-100"
            aria-label="Back to groups"
          >
            <Icon path={mdiArrowLeft} size={0.8} color={colors.colorBlack3} />
          </button>
        )}
        <span className="truncate text-[14px] font-semibold" style={{ color: colors.colorBlack1 }}>{group.name}</span>
        {group.members != null && (
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: '#EAF1FE', color: colors.colorBlueDark1 }}
          >
            {group.members} members
          </span>
        )}
        <span className="flex-1" />
        {group.isBroadcast && <Icon path={mdiBullhornOutline} size={0.6} color={colors.colorBlack4} />}
        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100" title="Group options" aria-label="Group options">
          <Icon path={mdiDotsHorizontal} size={0.85} color={colors.colorBlack3} />
        </button>
        <WindowControls />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className={panelExpanded ? 'mx-auto w-full max-w-[760px]' : ''}>
          {thread.map((m) => (
            <FlatMessage key={m.id} message={m} />
          ))}
        </div>
      </div>

      {subscribed ? (
        <div className="border-t border-gray-200 px-3 py-2.5">
          <div className={`flex items-end gap-2 rounded-lg border border-gray-200 px-2 py-1.5 ${panelExpanded ? 'mx-auto w-full max-w-[760px]' : ''}`}>
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
      ) : (
        <div className="border-t border-gray-200 px-3 py-3">
          <button
            onClick={() => joinGroup(group.id)}
            className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: colors.colorBlueDark1 }}
          >
            Join Group
          </button>
        </div>
      )}
    </>
  );
}

export function FlatMessage({ message: m }: { message: ChatMessage }) {
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
