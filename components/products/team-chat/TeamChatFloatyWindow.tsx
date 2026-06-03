'use client';

/**
 * Team Chat (SPIKE) — floaty popup window  [variant F]
 *
 * A Messenger-style popup for one conversation (department group or staff DM).
 * Reuses the flat-thread renderer from TeamChatPanel. Multiple windows stack along
 * the bottom (positioned by the dock). Overlays the product — the "covers content"
 * tradeoff we're deliberately pressure-testing.
 */

import { useEffect, useMemo, useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiSendOutline, mdiPaperclip, mdiBullhornOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { getConversation, CURRENT_USER } from '@/lib/products/team-chat/mock-data';
import type { ChatMessage, ConversationId } from '@/lib/products/team-chat/types';
import { FlatMessage } from './TeamChatPanel';

export const FLOATY_WIDTH = 320;
const FLOATY_HEIGHT = 420;

export function TeamChatFloatyWindow({
  id,
  left,
  onClose,
}: {
  id: ConversationId;
  left: number;
  onClose: () => void;
}) {
  const convo = getConversation(id);
  const [draft, setDraft] = useState('');
  const [appended, setAppended] = useState<ChatMessage[]>([]);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const thread = useMemo(() => [...convo.messages, ...appended], [convo.messages, appended]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setAppended((prev) => [
      ...prev,
      {
        id: `local-${id}-${prev.length}`,
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

  const accent = convo.accent ?? colors.colorBlueDark1;

  return (
    <div
      className="fixed bottom-0 z-40 flex flex-col rounded-t-xl border border-gray-200 bg-white"
      style={{
        left,
        width: FLOATY_WIDTH,
        height: FLOATY_HEIGHT,
        boxShadow: '0 -2px 28px rgba(16,24,40,0.18)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 180ms ease, transform 200ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className="flex items-center gap-2 rounded-t-xl border-b border-gray-200 px-3 py-2">
        {convo.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={convo.avatar} alt={convo.title} className="h-7 w-7 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: accent + '1A' }}>
            {convo.isBroadcast ? (
              <Icon path={mdiBullhornOutline} size={0.7} color={accent} />
            ) : (
              <span className="text-[11px] font-bold" style={{ color: accent }}>{convo.title.slice(0, 2)}</span>
            )}
          </span>
        )}
        <span className="flex-1 truncate text-[13px] font-semibold" style={{ color: colors.colorBlack1 }}>
          {convo.title}
        </span>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100" aria-label="Close">
          <Icon path={mdiClose} size={0.75} color={colors.colorBlack3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 py-2">
        {thread.map((m) => (
          <FlatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="border-t border-gray-200 px-2 py-2">
        <div className="flex items-end gap-2 rounded-lg border border-gray-200 px-2 py-1">
          <button className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-gray-100" aria-label="Attach">
            <Icon path={mdiPaperclip} size={0.7} color={colors.colorBlack3} />
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
            className="max-h-20 flex-1 resize-none bg-transparent py-1 text-[13px] outline-none"
            style={{ color: colors.colorBlack1 }}
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded disabled:opacity-40"
            style={{ backgroundColor: colors.colorBlueDark1 }}
            aria-label="Send"
          >
            <Icon path={mdiSendOutline} size={0.65} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
