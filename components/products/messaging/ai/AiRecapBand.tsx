/**
 * AiRecapBand — the gray band that says WHICH exchange you are looking at.
 *
 * It opens the AI Explanation sidebar (one row: the AI's answer) and both
 * feedback surfaces (two rows: the guest's question, then the AI's answer). One
 * component, because they are the same object: a quotation of the conversation,
 * lifted out of the feed and set on a gray ground so the sections below it read
 * as commentary rather than as more conversation.
 *
 * ⚠ THE ORB, NOT THE WAVEFORM (Miguel's ruling, 2026-08-20). Every one of these
 * frames draws the AI as a five-bar waveform tile — the VOICE product's mark,
 * pasted into a messaging surface. The feed next to it already speaks in orbs.
 * "Orb everywhere": the agent gets one face across the product, and it is the
 * living one, not the equaliser.
 *
 * Guest rows carry the guest's own avatar. Where the frames drew a rounded
 * square in one and a circle in the other, this takes the FEED's square — the
 * band is quoting the feed, and a quotation that restyles its subject is a
 * paraphrase.
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';
import { Avatar } from '../Avatar';
import { AiOrbTile } from '../AiOrb';
import { PANEL_PAD } from '../panel/panel-ui';

/** The band's ground — the same #FAFAFA the panel's details band settled on. */
const BAND_BG = colors.colorBlack8;

function RecapRow({ avatar, text }: { avatar: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      {avatar}
      <p
        className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
        style={{ color: colors.colorBlack2, paddingTop: 4 }}
      >
        {text}
      </p>
    </div>
  );
}

export function AiRecapBand({
  question,
  answer,
  guest,
}: {
  /** The guest's message. Omitted on surfaces that only recap the answer. */
  question?: string;
  /** What the AI sent. Absent when the AI is being explained for NOT sending. */
  answer?: string;
  guest?: Guest | null;
}) {
  if (!question && !answer) return null;

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: BAND_BG,
        borderBottom: `1px solid ${colors.colorBlack6}`,
        padding: `${16}px ${PANEL_PAD}px`,
        gap: 16,
      }}
    >
      {question && (
        <RecapRow
          avatar={
            <Avatar
              src={guest?.avatar}
              initials={guest?.initials ?? ''}
              size="small"
              tone="neutral"
              className="shrink-0"
            />
          }
          text={question}
        />
      )}
      {answer && <RecapRow avatar={<AiOrbTile />} text={answer} />}
    </div>
  );
}
