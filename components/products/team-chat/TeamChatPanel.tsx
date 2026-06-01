'use client';

/**
 * Team Chat (SPIKE) — Panel content (variant-agnostic)
 *
 * The interior is the same across all four container variants; only HOW it's
 * mounted (overlay / push / resize / footer) differs. Header with a group
 * switcher, a scrollable thread (with object cards + AI auto-posts), composer.
 */

import { useMemo, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiChevronDown,
  mdiSendOutline,
  mdiPaperclip,
  mdiBullhornOutline,
  mdiCheckAll,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useSpikeStore } from '@/lib/products/team-chat/spike-store';
import { groups, messagesByGroup, CURRENT_USER } from '@/lib/products/team-chat/mock-data';
import type { ChatMessage, GroupId } from '@/lib/products/team-chat/types';
import { ObjectCard } from './ObjectCard';

export function TeamChatPanel() {
  const { activeGroupId, setActiveGroup, closePanel } = useSpikeStore();
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [appended, setAppended] = useState<Record<string, ChatMessage[]>>({});

  const activeGroup = groups.find((g) => g.id === activeGroupId)!;

  const thread = useMemo(
    () => [...(messagesByGroup[activeGroupId] ?? []), ...(appended[activeGroupId] ?? [])],
    [activeGroupId, appended]
  );

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `local-${activeGroupId}-${thread.length}`,
      groupId: activeGroupId,
      authorName: CURRENT_USER.name,
      authorInitials: CURRENT_USER.initials,
      authorAvatar: CURRENT_USER.avatar,
      time: 'Now',
      self: true,
      text,
    };
    setAppended((prev) => ({ ...prev, [activeGroupId]: [...(prev[activeGroupId] ?? []), msg] }));
    setDraft('');
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* ── Header: group switcher + close ─────────────────────────── */}
      <div className="relative flex items-center gap-2 border-b border-gray-200 px-3 py-2.5">
        <button
          onClick={() => setGroupMenuOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: activeGroup.accent }} />
          <span className="truncate text-[14px] font-semibold" style={{ color: colors.colorBlack1 }}>
            {activeGroup.name}
          </span>
          {activeGroup.isBroadcast && (
            <Icon path={mdiBullhornOutline} size={0.6} color={colors.colorBlack4} />
          )}
          <Icon path={mdiChevronDown} size={0.7} color={colors.colorBlack3} />
        </button>
        <button
          onClick={closePanel}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Close team chat"
        >
          <Icon path={mdiClose} size={0.8} color={colors.colorBlack3} />
        </button>

        {groupMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setGroupMenuOpen(false)} />
            <div className="absolute left-3 top-12 z-20 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGroup(g.id as GroupId);
                    setGroupMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 ${
                    g.id === activeGroupId ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: g.accent }} />
                  <span className="flex-1 text-[13px]" style={{ color: colors.colorBlack1 }}>
                    {g.name}
                  </span>
                  {g.unread > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: colors.colorBlueDark1 }}
                    >
                      {g.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Thread ─────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-3">
        {thread.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>

      {/* ── Composer ───────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 bg-white px-3 py-2.5">
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
            placeholder={`Message ${activeGroup.name}…`}
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
    </div>
  );
}

function MessageRow({ message: m }: { message: ChatMessage }) {
  if (m.self) {
    return (
      <div className="flex flex-col items-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-[13px] text-white"
          style={{ backgroundColor: colors.colorBlueDark1 }}
        >
          {m.text}
        </div>
        {m.card && <div className="w-[85%]"><ObjectCard card={m.card} /></div>}
        <span className="mt-0.5 text-[10px]" style={{ color: colors.colorBlack4 }}>{m.time}</span>
      </div>
    );
  }

  const isAI = m.isAI;
  return (
    <div className="flex gap-2">
      {/* avatar */}
      {m.authorAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.authorAvatar} alt={m.authorName} className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: isAI ? '#7A5AF8' : '#8A94A6' }}
        >
          {m.authorInitials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold" style={{ color: colors.colorBlack1 }}>
            {m.authorName}
          </span>
          {isAI && (
            <span
              className="rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: '#7A5AF8' }}
            >
              Auto
            </span>
          )}
          <span className="text-[10px]" style={{ color: colors.colorBlack4 }}>{m.time}</span>
        </div>

        <div
          className={`mt-0.5 rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] ${isAI ? 'border' : ''}`}
          style={{
            color: colors.colorBlack1,
            backgroundColor: isAI ? '#F3F1FF' : 'white',
            borderColor: isAI ? '#DAD3FF' : undefined,
          }}
        >
          {m.text}
          {m.card && <ObjectCard card={m.card} />}
        </div>

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
