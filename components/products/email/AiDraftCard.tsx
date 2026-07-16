/**
 * AiDraftCard — Email Channel (AI fork)
 *
 * The star of the AI fork: a review card that sits ABOVE the composer inside
 * the thread view and shows an AI-suggested reply for a thread awaiting one.
 * The AI never auto-sends — staff review, optionally transform, then accept the
 * draft into the composer. The card carries the AI visual language on this
 * build (the top-bar Copilot pill stays hidden by design).
 *
 * States (driven by store `aiDrafts[threadId]`):
 *  - generating → shimmering placeholder lines ("Drafting a reply…")
 *  - ready      → the draft, grounding chips, and Use draft / Shorten / Regenerate
 *  - dismissed / used → the card renders nothing (re-summon lives in the composer)
 *
 * Grounding chips are the differentiator: below the draft we surface WHAT the
 * reply leans on — the linked reservation and the guest's loyalty tier (from
 * canonical data) plus one static property-policy chip (from ai-drafts.ts).
 * That source-citation trust cue is what a generic email client can't do.
 *
 * `AiDraftPrompt` is the on-demand cold-start affordance: the same card chrome
 * collapsed to a single "Draft a reply" row that generates on click.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiWaveform,
  mdiClose,
  mdiRefresh,
  mdiTextShort,
  mdiStarOutline,
  mdiBedOutline,
  mdiCalendarBlankOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { getGuest, getGuestReservations } from '@/lib/core/data';
import { useEmailStore, draftTextFor } from '@/lib/products/email/store';
import { getDraft } from '@/lib/products/email/ai-drafts';
import { shellTokens } from './shell/shell-tokens';

/** Shared gradient-text treatment for the AI labels. */
const GRADIENT_TEXT =
  'inline-block bg-gradient-to-r from-[#465FF5] via-[#8E4FD6] to-[#DB3535] bg-clip-text text-transparent';

/** "Jul. 13, 2024" → "Jul 13" (drop period + year for the compact chip). */
function shortDate(s: string): string {
  return s.replace(/\./g, '').replace(/,?\s*\d{4}$/, '').trim();
}

/** One small muted grounding chip: tiny mdi icon + uppercase label. */
function GroundingChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[4px] shrink-0"
      style={{
        backgroundColor: colors.colorBlack8,
        border: `1px solid ${colors.colorBlack6}`,
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      <Icon path={icon} size={0.46} color={colors.colorBlack3} />
      <span
        className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[14px] uppercase whitespace-nowrap"
        style={{ color: colors.colorBlack3, letterSpacing: '0.2px' }}
      >
        {label}
      </span>
    </span>
  );
}

export function AiDraftCard({ threadId }: { threadId: string }) {
  const entry = useEmailStore((s) => s.aiDrafts[threadId]);
  const threads = useEmailStore((s) => s.threads);
  const useDraft = useEmailStore((s) => s.useDraft);
  const regenerateDraft = useEmailStore((s) => s.regenerateDraft);
  const shortenDraft = useEmailStore((s) => s.shortenDraft);
  const dismissDraft = useEmailStore((s) => s.dismissDraft);

  const draft = getDraft(threadId);
  // Only render while the card is live. dismissed/used → nothing (the composer
  // toolbar owns re-summon); no scripted content → nothing.
  if (!entry || !draft || (entry.status !== 'generating' && entry.status !== 'ready')) {
    return null;
  }

  const generating = entry.status === 'generating';
  const text = draftTextFor(threadId, entry) ?? '';

  // Grounding — from canonical data (reservation + loyalty tier) + static policy.
  const thread = threads.find((t) => t.id === threadId);
  const guest = thread?.linkedGuestId ? getGuest(thread.linkedGuestId) : undefined;
  const reservation = guest ? getGuestReservations(guest.id)[0] : undefined;
  const tier = guest?.statusTag?.label;

  const reservationChipLabel = reservation
    ? `Reservation · ${reservation.room ? `Room ${reservation.room} · ` : ''}${shortDate(
        reservation.checkInDate
      )}–${shortDate(reservation.checkOutDate)}`
    : null;

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 0 }}>
      <div
        className="rounded-[12px] overflow-hidden"
        style={{
          border: `1px solid ${shellTokens.copilotBorder}`,
          backgroundColor: colors.colorWhite,
          backgroundImage: shellTokens.copilotTint,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: 16, paddingRight: 12, paddingTop: 12, paddingBottom: 0 }}
        >
          <Icon path={mdiWaveform} size={16 / 24} color={shellTokens.copilotBorder} />
          <span className={`${GRADIENT_TEXT} font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]`}>
            {generating ? 'Drafting a reply…' : 'Suggested reply'}
          </span>
          <span className="flex-1" />
          {!generating && (
            <button
              onClick={() => dismissDraft(threadId)}
              aria-label="Dismiss suggested reply"
              className="rounded-[4px] transition-colors hover:bg-[#f0f0f0] cursor-pointer"
              style={{ padding: 6 }}
            >
              <Icon path={mdiClose} size={0.6} color={colors.colorBlack3} />
            </button>
          )}
        </div>

        {generating ? (
          /* Generating — shimmering placeholder lines */
          <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 16 }}>
            <div className="email-draft-shimmer-line" style={{ height: 10, width: '92%', marginBottom: 8 }} />
            <div className="email-draft-shimmer-line" style={{ height: 10, width: '100%', marginBottom: 8 }} />
            <div className="email-draft-shimmer-line" style={{ height: 10, width: '64%' }} />
          </div>
        ) : (
          <>
            {/* Micro-reassurance — makes the never-auto-send promise legible */}
            <p
              className="font-['Roboto',sans-serif] text-[10px] leading-[15px]"
              style={{ color: colors.colorBlack3, paddingLeft: 16, paddingRight: 16, paddingTop: 2 }}
            >
              Review before sending — nothing is sent automatically.
            </p>

            {/* Draft body */}
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
              style={{ color: colors.colorBlack1, paddingLeft: 16, paddingRight: 16, paddingTop: 8 }}
            >
              {text}
            </p>

            {/* Grounding chips — what the draft is grounded in */}
            <div
              className="flex flex-wrap items-center gap-1.5"
              style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10 }}
            >
              {reservationChipLabel && (
                <GroundingChip
                  icon={reservation?.room ? mdiBedOutline : mdiCalendarBlankOutline}
                  label={reservationChipLabel}
                />
              )}
              {tier && <GroundingChip icon={mdiStarOutline} label={tier} />}
              <GroundingChip icon={draft.policyChip.icon} label={draft.policyChip.label} />
            </div>

            {/* Footer actions */}
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14 }}
            >
              <button
                onClick={() => useDraft(threadId)}
                className="flex items-center justify-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[12px] transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
                style={{
                  height: 32,
                  paddingLeft: 16,
                  paddingRight: 16,
                  backgroundColor: colors.colorBlueDark1,
                  color: colors.colorWhite,
                }}
              >
                Use draft
              </button>
              <button
                onClick={() => shortenDraft(threadId)}
                disabled={entry.isShort}
                className="flex items-center gap-1 rounded-[6px] font-['Roboto',sans-serif] font-medium text-[12px] transition-colors hover:bg-[#eaeef9] cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                style={{ height: 32, paddingLeft: 10, paddingRight: 10, color: colors.colorBlueDark1 }}
              >
                <Icon path={mdiTextShort} size={0.62} color={colors.colorBlueDark1} />
                Shorten
              </button>
              <button
                onClick={() => regenerateDraft(threadId)}
                className="flex items-center gap-1 rounded-[6px] font-['Roboto',sans-serif] font-medium text-[12px] transition-colors hover:bg-[#eaeef9] cursor-pointer"
                style={{ height: 32, paddingLeft: 10, paddingRight: 10, color: colors.colorBlueDark1 }}
              >
                <Icon path={mdiRefresh} size={0.62} color={colors.colorBlueDark1} />
                Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * AiDraftPrompt — on-demand cold-start affordance. Same card chrome collapsed
 * to a single "Draft a reply" row; clicking generates the draft. Shown above
 * the composer in on-demand mode when no draft exists yet for the thread.
 */
export function AiDraftPrompt({ threadId }: { threadId: string }) {
  const generateDraft = useEmailStore((s) => s.generateDraft);
  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 0 }}>
      <button
        onClick={() => generateDraft(threadId)}
        className="w-full flex items-center gap-2 rounded-[12px] transition-colors hover:brightness-[0.99] cursor-pointer"
        style={{
          border: `1px solid ${shellTokens.copilotBorder}`,
          backgroundColor: colors.colorWhite,
          backgroundImage: shellTokens.copilotTint,
          paddingLeft: 14,
          paddingRight: 14,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Icon path={mdiWaveform} size={16 / 24} color={shellTokens.copilotBorder} />
        <span className={`${GRADIENT_TEXT} font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]`}>
          Draft a reply
        </span>
      </button>
    </div>
  );
}
