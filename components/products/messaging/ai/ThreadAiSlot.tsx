/**
 * ThreadAiSlot — everything the AI puts between the feed and the composer.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE STACK ORDER (Miguel's rule, 2026-08-20)
 * ═══════════════════════════════════════════════════════════════════════════
 *   draft card              ← a whole message, waiting for a human
 *   suggested fact  (AI)    ← the agent asking to learn something
 *   recommended ticket (blue) ← a detection you can act on
 *   escalation      (amber) ← a guest has been waiting
 *   not answering   (amber) ← away, or outside online hours
 *   ─────────────────────── the composer input
 *
 * AMBER IS ALWAYS NEAREST THE COMPOSER. That is the whole rule, and it is a
 * rule about what happens when you start typing: the amber bands are conditions
 * on the message you are about to send — it is going out while the property is
 * marked away; this guest has already waited 24 minutes. They belong in the last
 * line of sight before the cursor. The AI and ticket bands are things to do
 * INSTEAD of typing, so they sit further up, where the eye meets them on its way
 * down from the conversation rather than on its way into the box.
 *
 * A fixed order also means the slot never reflows into a different shape when
 * one band resolves. Dismiss the fact and the ticket rises; the amber pair does
 * not move, because it was never above anything.
 *
 * ── ONE FACT AT A TIME, AND IT DOES NOT LEAVE ─────────────────────────────
 * The fact queue is sequential and persistent. Head of the queue is the visible
 * band; "+N more" says how many are behind it; nothing auto-hides on a timer.
 * A suggestion that quietly expires is a suggestion the product asked for and
 * then threw away, and a hotelier who notices that once stops answering them.
 */

'use client';

import React, { useState } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiClockOutline, mdiForumOutline, mdiRoomServiceOutline } from '@mdi/js';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { AiDraftCard } from './AiDraftCard';
import { AddInformationModal } from './AddInformationModal';
import { AmberBandIcon, BandButton, BandOverline, BandText, ContextBand } from './band-ui';

/* ─────────────────────────────────────────────────────────────────────────
   The four bands
   ───────────────────────────────────────────────────────────────────────── */

function SuggestedFactBand({
  text,
  remaining,
  onEdit,
  onAdd,
  onSkip,
}: {
  text: string;
  remaining: number;
  onEdit: () => void;
  onAdd: () => void;
  onSkip: () => void;
}) {
  return (
    <ContextBand
      tone="ai"
      actions={
        <>
          {/* The queue depth, said quietly and only when there IS one. It sits
              left of the buttons so answering this fact visibly shortens a
              countdown rather than revealing a surprise. */}
          {remaining > 0 && (
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
              style={{ color: colors.colorBlack3, marginRight: 2 }}
            >
              +{remaining} more
            </span>
          )}
          <BandButton label="Edit" variant="outline" onClick={onEdit} />
          <BandButton label="Add to AI" variant="primary" onClick={onAdd} />
        </>
      }
      onDismiss={onSkip}
      dismissLabel="Skip this suggestion"
    >
      <BandOverline label="Suggested fact" />
      <BandText>{text}</BandText>
    </ContextBand>
  );
}

/**
 * The recommended ticket. Two label/value pairs, because those two fields ARE
 * the service-task form — Review is a hand-off, and what it hands off is
 * exactly what you can already read here. Nothing is hidden behind the click.
 */
function TicketSuggestionBand({
  room,
  issueType,
  onDismiss,
  onReview,
}: {
  room: string;
  issueType: string;
  onDismiss: () => void;
  onReview: () => void;
}) {
  const Pair = ({ label, value }: { label: string; value: string }) => (
    <div className="min-w-0">
      <span
        className="block font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase whitespace-nowrap"
        style={{ color: colors.colorBlack3, letterSpacing: '0.04em' }}
      >
        {label}
      </span>
      <span
        className="block truncate font-['Roboto',sans-serif] font-normal text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack1 }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <ContextBand
      tone="blue"
      icon={<Icon path={mdiRoomServiceOutline} size={0.95} color={colors.colorBlueDark1} />}
      actions={<BandButton label="Review" variant="primary" onClick={onReview} />}
      onDismiss={onDismiss}
      dismissLabel="Dismiss ticket suggestion"
    >
      <div className="flex items-center" style={{ gap: 28 }}>
        <Pair label="Room number" value={room} />
        <Pair label="Issue type" value={issueType} />
      </div>
    </ContextBand>
  );
}

/**
 * The unanswered clock. No actions and no dismiss, deliberately: you cannot
 * agree or disagree with how long someone has been waiting, and the only way to
 * clear it is to answer them — which is what the composer directly below is for.
 */
function EscalationBand({ minutes }: { minutes: number }) {
  return (
    <ContextBand tone="amber" icon={<AmberBandIcon path={mdiClockOutline} />}>
      <BandText compact>Unanswered for {minutes} minutes.</BandText>
    </ContextBand>
  );
}

/**
 * The not-answering notice. Global rather than per-thread — it is a fact about
 * the PROPERTY, so it shows on every conversation the moment the status pill
 * flips, which is also what makes it demo-able by clicking one control.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ THE OFF-HOURS VARIANT IS BUILT NOW (QA-2, 2026-08-25)
 * ═══════════════════════════════════════════════════════════════════════════
 * `offline` was a valid `WorkspaceStatus`, selectable from the status pill, and
 * consumed by nothing but the pill's own colours: flipping to Offline produced
 * NO band on any thread, while Away produced one on all of them. Two states
 * that mean the same operational thing — the property is not answering, the AI
 * is — and only one of them said so.
 *
 * THE MUTATION RULE, which is the whole of the decision here:
 *
 *   The band's TONE, ICON and second sentence never change. Only the FIRST
 *   sentence changes, and what it names is WHO decided the property is not
 *   answering — a person, or the clock.
 *
 *     away     "You are away. Auto response is enabled."
 *     offline  "Outside online hours. Auto response is enabled."
 *
 * That is production's distinction ("a human set us to Away" vs "we are past
 * the hours printed in the top bar") and production's second copy. It is one
 * band with one prop rather than two components, because there is one fact
 * being reported and one consequence; a second component would let the
 * consequence drift.
 *
 * ⚠ WHAT IS STILL NOT BUILT: a real SCHEDULE. The top bar prints "Online hours:
 * 8:00 AM – 11:00 PM EST" as static text, and nothing compares the clock
 * against it. So the off-hours copy is reached by picking Offline from the
 * pill, not by time passing. That is the honest demo shape — the copy exists
 * and is reachable — and the scheduler stays on the not-built list.
 */
const NOT_ANSWERING_COPY: Record<'away' | 'offline', string> = {
  away: 'You are away. Auto response is enabled.',
  offline: 'Outside online hours. Auto response is enabled.',
};

function NotAnsweringBand({ reason }: { reason: 'away' | 'offline' }) {
  return (
    <ContextBand tone="amber" icon={<AmberBandIcon path={mdiForumOutline} />}>
      <BandText compact>{NOT_ANSWERING_COPY[reason]}</BandText>
    </ContextBand>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   The slot
   ───────────────────────────────────────────────────────────────────────── */

export function ThreadAiSlot({ threadId }: { threadId: string }) {
  const rawDraft = useMessagingStore((s) => s.drafts[threadId]);
  const facts = useMessagingStore((s) => s.facts[threadId]);
  const ticket = useMessagingStore((s) => s.ticketSuggestions[threadId]);
  const unansweredMinutes = useMessagingStore((s) => s.unansweredMinutes[threadId]);
  const workspaceStatus = useMessagingStore((s) => s.workspaceStatus);
  const isThreadAiOn = useMessagingStore((s) => s.threadAiEnabled[threadId] !== false);

  const dismissDraft = useMessagingStore((s) => s.dismissDraft);
  const sendDraft = useMessagingStore((s) => s.sendDraft);
  const resolveFact = useMessagingStore((s) => s.resolveFact);
  const addFactToKnowledge = useMessagingStore((s) => s.addFactToKnowledge);
  const dismissTicketSuggestion = useMessagingStore((s) => s.dismissTicketSuggestion);
  const injectIntoComposer = useMessagingStore((s) => s.injectIntoComposer);
  const requestCreateTask = useMessagingStore((s) => s.requestCreateTask);
  const showToast = useMessagingStore((s) => s.showToast);

  const [isEditingFact, setIsEditingFact] = useState(false);

  const fact = facts?.[0];
  const remaining = Math.max(0, (facts?.length ?? 0) - 1);

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * THE DRAFT CARD HIDES WHILE THIS CONVERSATION'S AI IS OFF (QA-2)
   * ═══════════════════════════════════════════════════════════════════════
   * "Response drafted by AI" used to render beside an "AI Off" pill, fully
   * actionable, and Send still worked. The behaviour was defensible — the
   * draft predates the pause, and approving it is a human act — but the SCREEN
   * said two opposite things at once, and this file's neighbours all carry an
   * explicit stance where the draft carried none. Taking one:
   *
   *   The pill is the hotelier saying "I am handling this conversation." A
   *   drafted reply is the AI's offer to handle it. While the first is true
   *   the second should not be on screen asking for an answer.
   *
   * ⚠ HIDDEN, NOT DISCARDED. `drafts[threadId]` is untouched — nothing here
   * calls `dismissDraft` — so toggling the AI back On brings the same draft
   * back, word for word. That matters: the toggle is a demo control, and a
   * pause that silently destroys the AI's work would make it a one-way door.
   * The store's `toggleThreadAi` deliberately does not touch drafts either,
   * which is what makes hiding sufficient.
   */
  const draft = isThreadAiOn ? rawDraft : undefined;

  // Both non-answering postures raise the band; only the sentence differs.
  const notAnswering = workspaceStatus === 'away' || workspaceStatus === 'offline' ? workspaceStatus : null;

  /**
   * ACCEPT the fact. `text` is the sentence actually approved — the band's Add
   * passes nothing and accepts the suggestion verbatim; the modal passes what
   * the hotelier edited it into.
   *
   * ⚠ The argument used to be dropped (`onCommit={addFact}` against a no-arg
   * handler), which made "edit, then add" byte-identical to "add". Nothing on
   * this surface renders added facts yet, so it was invisible — and it would
   * have become a real bug the day a KB surface showed what was added.
   */
  const addFact = (text?: string) => {
    if (!fact) return;
    addFactToKnowledge(threadId, fact.id, text ?? fact.text);
    setIsEditingFact(false);
    // Post-Add is a TOAST, not an inline confirmation state on the band. The
    // band's job is finished the moment the fact is accepted, and a band that
    // stays behind to congratulate itself is a band still taking up the slot
    // the next fact needs.
    showToast('Added to AI knowledge');
  };

  const nothingToShow = !draft && !fact && !ticket && !unansweredMinutes && !notAnswering;
  if (nothingToShow) return null;

  return (
    <>
      <div className="flex flex-col" style={{ gap: 12 }}>
        {draft && (
          <AiDraftCard
            draft={draft}
            onEdit={() => {
              injectIntoComposer(threadId, draft.content);
              dismissDraft(threadId);
            }}
            onSend={() => sendDraft(threadId)}
            onDismiss={() => dismissDraft(threadId)}
          />
        )}

        {fact && (
          <SuggestedFactBand
            text={fact.text}
            remaining={remaining}
            onEdit={() => setIsEditingFact(true)}
            onAdd={() => addFact()}
            onSkip={() => resolveFact(threadId, fact.id)}
          />
        )}

        {ticket && (
          <TicketSuggestionBand
            room={ticket.room}
            issueType={ticket.issueType}
            onDismiss={() => dismissTicketSuggestion(threadId)}
            /* Review does NOT open a review dialog of its own. It opens the
               Create-service-task page that already exists in the Conversation
               Details panel, prefilled — the form is the review. Building a
               second one here would have been a copy that drifts. */
            onReview={() => requestCreateTask(ticket.room, ticket.issueType)}
          />
        )}

        {!!unansweredMinutes && <EscalationBand minutes={unansweredMinutes} />}

        {notAnswering && <NotAnsweringBand reason={notAnswering} />}
      </div>

      <AddInformationModal
        isOpen={isEditingFact && !!fact}
        initialText={fact?.text ?? ''}
        onCancel={() => setIsEditingFact(false)}
        /* Committing the edit is the SAME event as Add-to-AI from the band.
           Edit is a detour on the way to Add, not a second outcome. */
        onCommit={addFact}
      />
    </>
  );
}
