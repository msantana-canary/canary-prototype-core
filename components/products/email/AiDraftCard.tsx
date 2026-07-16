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
 * `AiOrbButton` is the on-demand / re-summon affordance: an animated "Siri-orb"
 * pill that lives in the composer toolbar immediately left of Send. It shows
 * whenever the open thread is draft-eligible and no live card is on screen, and
 * clicking it kicks off (or restores/regenerates) a draft.
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
  mdiThumbUpOutline,
  mdiThumbDownOutline,
  mdiLightningBoltOutline,
  mdiCheck,
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

/** One small messaging-style thumbs feedback button (selected = blue on tint). */
function ThumbButton({
  icon,
  selected,
  onClick,
  label,
}: {
  icon: string;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={`flex items-center justify-center rounded-[4px] transition-colors cursor-pointer${
        selected ? '' : ' hover:bg-[#f0f0f0]'
      }`}
      style={{
        padding: 5,
        backgroundColor: selected ? colors.colorBlueDark5 : 'transparent',
      }}
    >
      <Icon path={icon} size={16 / 24} color={selected ? colors.colorBlueDark1 : colors.colorBlack3} />
    </button>
  );
}

export function AiDraftCard({ threadId }: { threadId: string }) {
  const entry = useEmailStore((s) => s.aiDrafts[threadId]);
  const threads = useEmailStore((s) => s.threads);
  const useDraft = useEmailStore((s) => s.useDraft);
  const regenerateDraft = useEmailStore((s) => s.regenerateDraft);
  const shortenDraft = useEmailStore((s) => s.shortenDraft);
  const dismissDraft = useEmailStore((s) => s.dismissDraft);
  const setDraftFeedback = useEmailStore((s) => s.setDraftFeedback);
  const showIntentActions = useEmailStore((s) => s.showIntentActions);
  const intentActionDone = useEmailStore((s) => !!s.intentActionsDone[threadId]);
  const markIntentActionDone = useEmailStore((s) => s.markIntentActionDone);

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

  // Re-mount key: changes on generating→ready, Regenerate (variantIndex) and
  // Shorten (isShort), so the completion glow + reveal animations re-fire each
  // time a fresh draft becomes ready.
  const revealKey = `${entry.status}-${entry.variantIndex}-${entry.isShort ? 's' : 'f'}`;

  return (
    <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 0 }}>
      <div
        key={revealKey}
        className={`rounded-[12px] overflow-hidden${generating ? '' : ' email-draft-complete'}`}
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
              className="email-draft-reveal font-['Roboto',sans-serif] text-[10px] leading-[15px]"
              style={{ color: colors.colorBlack3, paddingLeft: 16, paddingRight: 16, paddingTop: 2 }}
            >
              Review before sending — nothing is sent automatically.
            </p>

            {/* Draft body */}
            <p
              className="email-draft-reveal font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
              style={{ color: colors.colorBlack1, paddingLeft: 16, paddingRight: 16, paddingTop: 8 }}
            >
              {text}
            </p>

            {/* Grounding chips — what the draft is grounded in */}
            <div
              className="email-draft-reveal-chips flex flex-wrap items-center gap-1.5"
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

            {/* Detected intent → suggested action (prototype, default-off toggle).
                One extra row: muted intent label + arrow + a compact action button
                that flips to an Added checkmark state once taken. */}
            {showIntentActions && draft.intentAction && (
              <div
                className="email-draft-reveal-chips flex items-center gap-2 flex-wrap"
                style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10 }}
              >
                <Icon path={mdiLightningBoltOutline} size={13 / 24} color={colors.colorBlueDark1} />
                <span
                  className="font-['Roboto',sans-serif] font-medium text-[11px] leading-[16px]"
                  style={{ color: colors.colorBlack3 }}
                >
                  {draft.intentAction.intent}
                </span>
                <span
                  className="font-['Roboto',sans-serif] text-[11px] leading-[16px]"
                  style={{ color: colors.colorBlack3 }}
                >
                  →
                </span>
                {intentActionDone ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-[6px] font-['Roboto',sans-serif] font-medium text-[11px] leading-[16px]"
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 5,
                      paddingBottom: 5,
                      backgroundColor: colors.colorBlueDark5,
                      color: colors.colorBlueDark1,
                    }}
                  >
                    <Icon path={mdiCheck} size={13 / 24} color={colors.colorBlueDark1} />
                    Added
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => markIntentActionDone(threadId)}
                    className="inline-flex items-center rounded-[6px] font-['Roboto',sans-serif] font-medium text-[11px] leading-[16px] transition-colors cursor-pointer hover:bg-[#eaeef9]"
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 5,
                      paddingBottom: 5,
                      border: `1px solid ${shellTokens.copilotBorder}`,
                      color: colors.colorBlueDark1,
                    }}
                  >
                    {draft.intentAction.action}
                  </button>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div
              className="email-draft-reveal-footer flex items-center gap-2"
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

              {/* Thumbs feedback — right-aligned, mutually exclusive per variant */}
              <span className="flex-1" />
              <div className="flex items-center gap-0.5">
                <ThumbButton
                  icon={mdiThumbUpOutline}
                  selected={entry.feedback === 'up'}
                  onClick={() => setDraftFeedback(threadId, 'up')}
                  label="Good draft"
                />
                <ThumbButton
                  icon={mdiThumbDownOutline}
                  selected={entry.feedback === 'down'}
                  onClick={() => setDraftFeedback(threadId, 'down')}
                  label="Needs work"
                />
              </div>
            </div>

            {/* Thumbs-down ties feedback to the voice-learning story */}
            {entry.feedback === 'down' && (
              <p
                className="font-['Roboto',sans-serif] text-[11px] leading-[16px]"
                style={{ color: colors.colorBlack3, paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}
              >
                Thanks — Theresa&rsquo;s edits teach the AI your voice.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The animated "Siri orb" — an 18px living gradient blob. A dim indigo ground,
 * three screen-blended color petals (cyan / magenta / violet) that drift, scale,
 * and morph independently at incommensurate speeds, and a pulsing white core.
 * All motion + timing lives in globals.css (`.ai-orb*`); `generating` just lowers
 * `--orb-speed` via `.is-generating` to speed the whole composition up.
 */
function AiOrb({ generating }: { generating: boolean }) {
  return (
    <span className={`ai-orb${generating ? ' is-generating' : ''}`} aria-hidden="true">
      <span className="ai-orb-base" />
      <span className="ai-orb-petal ai-orb-a" />
      <span className="ai-orb-petal ai-orb-b" />
      <span className="ai-orb-petal ai-orb-c" />
      <span className="ai-orb-petal ai-orb-d" />
      <span className="ai-orb-core" />
    </span>
  );
}

/**
 * AiOrbButton — the on-demand / re-summon affordance. A gradient-bordered pill
 * (padding-hack border so the radius is honored) carrying the orb + a gradient
 * "Draft a reply" label, living in the composer toolbar immediately left of
 * Send.
 *
 * Visibility: shown whenever the thread is DRAFT-ELIGIBLE (latest message
 * inbound) and no live card is on screen — i.e. status is undefined / 'dismissed'
 * / 'used'. Hidden when a card is 'ready'. During 'generating' it stays visible
 * in a disabled "Drafting…" state (the orb is the loading indicator) while the
 * shimmer card also shows above the composer.
 *
 * Click → the right store action for the current state:
 *   - no entry   → generateDraft (fresh cache-guarded generate)
 *   - 'dismissed' → restoreDraft (bring the dismissed card back)
 *   - 'used'      → forceGenerateDraft (fresh draft — the prior was consumed)
 */
export function AiOrbButton({ threadId }: { threadId: string }) {
  const status = useEmailStore((s) => s.aiDrafts[threadId]?.status);
  const messages = useEmailStore((s) => s.messages[threadId] ?? []);
  const generateDraft = useEmailStore((s) => s.generateDraft);
  const restoreDraft = useEmailStore((s) => s.restoreDraft);
  const forceGenerateDraft = useEmailStore((s) => s.forceGenerateDraft);

  // Eligible when the most recent message is inbound (guest awaiting a reply).
  const lastMessage = messages[messages.length - 1];
  const isEligible = lastMessage?.direction === 'inbound';

  // Nothing to draft for this thread, not eligible, or a live card owns the
  // screen ('ready') → no button.
  if (!isEligible || !getDraft(threadId) || status === 'ready') return null;

  const generating = status === 'generating';

  const handleClick = () => {
    if (generating) return;
    if (!status) generateDraft(threadId);
    else if (status === 'dismissed') restoreDraft(threadId);
    else forceGenerateDraft(threadId); // 'used'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={generating}
      aria-label={generating ? 'Drafting a reply' : 'Draft a reply'}
      className={`ai-orb-btn rounded-full transition-all ${
        generating ? '' : 'hover:-translate-y-px hover:shadow-sm'
      }`}
      style={{
        // 1px gradient border via padding-hack (border-image ignores radius).
        padding: 1,
        background: 'linear-gradient(90deg, #465FF5, #8E4FD6, #DB3535)',
        cursor: generating ? 'default' : 'pointer',
      }}
    >
      <span
        className="flex items-center rounded-full"
        style={{
          height: 30,
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
          backgroundColor: colors.colorWhite,
        }}
      >
        <AiOrb generating={generating} />
        <span className={`${GRADIENT_TEXT} font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]`}>
          {generating ? 'Drafting…' : 'Draft a reply'}
        </span>
      </span>
    </button>
  );
}
