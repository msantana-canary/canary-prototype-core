'use client';

/**
 * Team Chat (SPIKE) — Suggested Team Chat Post
 *
 * The command-center moment surfacing AT THE TRIGGER: the messaging AI spots
 * something in a guest thread (e.g. a flight delay) and offers to post it to the
 * right staff group with one tap. (Jake's idea — stronger than an in-chat auto-post
 * because it originates where the human is already looking.) Static for the spike.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiStarFourPointsOutline, mdiAccountGroupOutline, mdiCheck } from '@mdi/js';
import { colors } from '@canary-ui/components';

export function SuggestedTeamChatPost({
  targetGroup = 'Front Desk',
  suggestion,
}: {
  targetGroup?: string;
  suggestion: string;
}) {
  const [state, setState] = useState<'idle' | 'posted' | 'dismissed'>('idle');

  if (state === 'dismissed') return null;

  if (state === 'posted') {
    return (
      <div
        className="mx-6 mb-2 flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{ backgroundColor: '#E7F6EC', borderColor: '#BFE6CD' }}
      >
        <Icon path={mdiCheck} size={0.8} color="#1F9D78" />
        <span className="text-[13px] font-medium" style={{ color: '#147A52' }}>
          Posted to {targetGroup}
        </span>
      </div>
    );
  }

  return (
    <div className="mx-6 mb-2 rounded-xl border px-3 py-2.5" style={{ backgroundColor: '#F3F1FF', borderColor: '#DAD3FF' }}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon path={mdiStarFourPointsOutline} size={0.65} color="#7A5AF8" />
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#5B3FD6' }}>
          Suggested team chat post
        </span>
        <span
          className="ml-1 flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium"
          style={{ color: colors.colorBlack3 }}
        >
          <Icon path={mdiAccountGroupOutline} size={0.5} color={colors.colorBlack3} />
          {targetGroup}
        </span>
        <button
          onClick={() => setState('dismissed')}
          className="ml-auto px-1 text-[12px] leading-none"
          style={{ color: colors.colorBlack4 }}
          aria-label="Dismiss suggestion"
        >
          ✕
        </button>
      </div>

      <p className="text-[13px] italic leading-snug" style={{ color: colors.colorBlack1 }}>
        “{suggestion}”
      </p>

      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => setState('posted')}
          className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-white"
          style={{ backgroundColor: colors.colorBlueDark1 }}
        >
          Post to {targetGroup}
        </button>
        <button
          className="rounded-md border px-3 py-1.5 text-[12px] font-medium"
          style={{ color: colors.colorBlack1, backgroundColor: 'white', borderColor: '#E5E7EB' }}
        >
          Edit
        </button>
        <button
          onClick={() => setState('dismissed')}
          className="px-2 py-1.5 text-[12px] font-medium"
          style={{ color: colors.colorBlack3 }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
