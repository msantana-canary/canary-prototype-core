/**
 * AiExplanationPanel — why the AI said that, or why it said nothing.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE DELINEATION (Miguel's ruling, 2026-08-20)
 * ═══════════════════════════════════════════════════════════════════════════
 *   SIDEBAR = OBSERVABILITY.   MODAL = QUICK ACTION.
 *
 * Explaining an answer is reading, not doing: you scan it, you compare it
 * against the thread still visible beside you, you may go and look at a source.
 * A modal for that would black out the conversation the explanation is about.
 * So the explanation is a PANEL, on the panel standard — 600px, 12px to three
 * viewport edges, above the app chrome — the same shell as Conversation
 * Details, because a hotelier should not have to learn two right-hand cards.
 *
 * The frames draw it as a floating modal card. That is a Figma convention for
 * "here is a surface, in isolation", not a placement instruction: the same file
 * draws the Conversation Details panel the same way, and that one is a panel.
 *
 * ── IT OPENS AT THE EXPLANATION, NEVER AT A PARENT ────────────────────────
 * Header is "AI Explanation" + X. No back arrow — there is nowhere behind it.
 * Three affordances land here and all three land on the SAME page:
 *
 *   ⓘ on an AI message           → success state (band recapping what was sent)
 *   "AI CHOSE NOT TO RESPOND"    → non-response state (intro + Action Taken,
 *                                   and no band, because nothing was sent)
 *   "3 SOURCES ⌄" chip           → the same page. The chip used to promise its
 *                                   own popover of sources; it now opens the
 *                                   surface that already lists them, in context,
 *                                   with the reasoning that chose them. One
 *                                   source of truth, reachable three ways.
 *
 * ── AND ONE DRILL-IN ──────────────────────────────────────────────────────
 * "Give AI Feedback" pushes the feedback page behind a back arrow, on the same
 * translateX track the Conversation Details panel uses. Back returns to the
 * explanation: you came here to understand, and disagreeing is a step inside
 * that, not a departure from it.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ButtonType, CanaryButton, colors } from '@canary-ui/components';
import { PanelShell, PANEL_ANIM_MS } from '../panel/PanelShell';
import { PanelHeader, PanelFooterAction, PANEL_PAD } from '../panel/panel-ui';
import { AiRecapBand } from './AiRecapBand';
import { AiFeedbackForm, EMPTY_FEEDBACK, FeedbackValue, canSubmitFeedback } from './AiFeedbackForm';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { panelIdentity } from '@/lib/products/messaging/panel-selectors';
import { Message } from '@/lib/products/messaging/types';

/* ─────────────────────────────────────────────────────────────────────────
   Section furniture
   ───────────────────────────────────────────────────────────────────────── */

/**
 * One explained section. Every one carries a bottom hairline, the last included
 * — the frames close the Result section with a rule and then leave the rest of
 * the card white. The dead space is not a mistake to design around: the sidebar
 * is a fixed-height card and the footer is pinned, so a short explanation is
 * simply a short explanation.
 */
function ExplainSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        paddingLeft: PANEL_PAD,
        paddingRight: PANEL_PAD,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottom: `1px solid ${colors.colorBlack6}`,
      }}
    >
      {title && (
        <h4
          className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

function ExplainBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
      style={{ color: colors.colorBlack2 }}
    >
      {children}
    </p>
  );
}

/**
 * A source statement. The bullet is a middot in its own 12px column so wrapped
 * lines hang under the text and not under the dot — a KB statement is a
 * sentence, and a sentence that re-indents mid-thought reads as two.
 */
function SourceBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start" style={{ gap: 8, marginTop: 4 }}>
      <span
        aria-hidden="true"
        className="shrink-0 text-center font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ width: 6, color: colors.colorBlack2 }}
      >
        ·
      </span>
      <span
        className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack2 }}
      >
        {text}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   The panel
   ───────────────────────────────────────────────────────────────────────── */

export function AiExplanationPanel() {
  const messageId = useMessagingStore((s) => s.aiExplanationMessageId);
  const messages = useMessagingStore((s) => s.messages);
  const threads = useMessagingStore((s) => s.threads);
  const threadPrimaryReservationId = useMessagingStore((s) => s.threadPrimaryReservationId);
  const closeAiExplanation = useMessagingStore((s) => s.closeAiExplanation);
  const showToast = useMessagingStore((s) => s.showToast);

  // Feedback drill-in: one level, one track. `depth` drives the slide; the pane
  // stays mounted so its exit has something to animate.
  const [depth, setDepth] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackValue>(EMPTY_FEEDBACK);

  /**
   * The subject SURVIVES the close animation. `messageId` nulls the instant the
   * X is clicked, but the card is still on screen for 240ms — reading the
   * message straight from the store would blank the panel's contents and then
   * slide an empty card out. So the last non-null subject is held.
   */
  const [held, setHeld] = useState<{ message: Message; question?: string } | null>(null);

  const subject = useMemo(() => {
    if (!messageId) return null;
    for (const list of Object.values(messages)) {
      const index = list.findIndex((m) => m.id === messageId);
      if (index === -1) continue;
      const message = list[index];
      // The question this answer answers: the nearest guest message ABOVE it.
      // For a non-response, the subject IS the guest message, so it is its own
      // question and there is no answer to quote.
      const question =
        message.sender === 'guest'
          ? message.content
          : list
              .slice(0, index)
              .reverse()
              .find((m) => m.sender === 'guest')?.content;
      return { message, question };
    }
    return null;
  }, [messageId, messages]);

  const thread = useMemo(
    () => (subject ? threads.find((t) => t.id === subject.message.threadId) ?? null : null),
    [subject, threads]
  );

  const guest = useMemo(() => {
    if (!thread) return null;
    return panelIdentity(thread, threadPrimaryReservationId[thread.id]).primary?.guest ?? null;
  }, [thread, threadPrimaryReservationId]);

  useEffect(() => {
    if (subject) setHeld({ message: subject.message, question: subject.question });
  }, [subject]);

  // A new subject always opens at the explanation with a clean form. Landing on
  // a half-filled feedback page about a DIFFERENT message would be a bug that
  // ships someone else's complaint.
  useEffect(() => {
    if (!messageId) return;
    setDepth(0);
    setFeedback(EMPTY_FEEDBACK);
  }, [messageId]);

  const message = held?.message;
  const explanation = message?.aiExplanation;
  const isAnswer = message?.sender === 'ai';

  const close = () => closeAiExplanation();
  const back = () => setDepth(0);

  const submitFeedback = () => {
    if (!canSubmitFeedback(feedback)) return;
    showToast('Feedback submitted');
    setFeedback(EMPTY_FEEDBACK);
    // Submit ends the loop (Miguel 2026-08-26): toast + the whole panel closes,
    // same exit the 👎 modal takes — supersedes the earlier back-to-explanation.
    closeAiExplanation();
  };

  return (
    <PanelShell isOpen={!!messageId} onClose={close} label="AI Explanation">
      <div
        className="flex h-full min-h-0"
        style={{
          transform: `translateX(-${depth * 100}%)`,
          transition: `transform ${PANEL_ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {/* ── EXPLANATION ──────────────────────────────────────────────── */}
        <div className="w-full h-full shrink-0 flex flex-col min-h-0">
          <PanelHeader title="AI Explanation" onClose={close} />

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
            {explanation?.intro && (
              <ExplainSection>
                <ExplainBody>{explanation.intro}</ExplainBody>
              </ExplainSection>
            )}

            {/* The success state recaps what was SENT. The non-response state
                has nothing to recap, which is precisely its point. */}
            {isAnswer && message && <AiRecapBand answer={message.content} guest={guest} />}

            {explanation && (
              <>
                <ExplainSection title="What AI understood">
                  <ExplainBody>{explanation.understood}</ExplainBody>
                </ExplainSection>

                <ExplainSection>
                  <div className="flex items-baseline justify-between gap-3">
                    <h4
                      className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                      style={{ color: colors.colorBlack1 }}
                    >
                      Sources Used
                    </h4>
                    {/* STUB. The Knowledge Base is a whole other product surface
                        and this prototype does not carry it; a fake destination
                        would be worse than an honest dead link. The empty
                        handler is the point — do not wire it.

                        STANDALONE action, not in-sentence prose (QA-4,
                        2026-08-25): it used to fake a hyperlink — `.text-btn-
                        inline` stripped the button chrome and an underline
                        stood in for it, because "a link is the one thing the
                        base cannot draw." That register is for caption text a
                        link sits INSIDE (the failed-to-send / no-response
                        footers); this is a standalone CTA below its own
                        heading, so it now keeps the library's own TEXT chrome
                        — box, padding, hover wash — same as its siblings
                        ("Manage templates", "Upload Contacts"), and the
                        underline goes with the chrome it was compensating for.
                        `ButtonType.TEXT` still pays for itself: content colour
                        resolves to `colorBlueDark1` and NORMAL is
                        `text-[14px]`, both exactly the frame's. */}
                    <CanaryButton type={ButtonType.TEXT} onClick={() => {}}>
                      Go to Knowledge Base
                    </CanaryButton>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    {explanation.sources.map((source, i) => (
                      <SourceBullet key={i} text={source} />
                    ))}
                  </div>
                </ExplainSection>

                {explanation.actionTaken && (
                  <ExplainSection title="Action Taken">
                    <ExplainBody>{explanation.actionTaken}</ExplainBody>
                  </ExplainSection>
                )}

                <ExplainSection title="Result">
                  <ExplainBody>{explanation.result}</ExplainBody>
                </ExplainSection>
              </>
            )}
          </div>

          <PanelFooterAction label="Give AI Feedback" onClick={() => setDepth(1)} />
        </div>

        {/* ── FEEDBACK (drill-in) ──────────────────────────────────────── */}
        <div className="w-full h-full shrink-0 flex flex-col min-h-0">
          <PanelHeader title="Help us improve future responses" onBack={back} onClose={close} />

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
            <AiRecapBand
              question={held?.question}
              answer={isAnswer ? message?.content : undefined}
              guest={guest}
            />
            <div style={{ padding: PANEL_PAD }}>
              {/* The form follows the DOOR you came in by. Arriving from "AI
                  CHOSE NOT TO RESPOND" there is no answer on screen to
                  critique, so the form asks the other question — see
                  `FeedbackContext`. The recap band above already tells the same
                  story by carrying only the guest's message. */}
              <AiFeedbackForm
                value={feedback}
                onChange={setFeedback}
                context={isAnswer ? 'response' : 'non-response'}
              />
            </div>
          </div>

          <PanelFooterAction
            label="Submit Feedback"
            variant="primary"
            disabled={!canSubmitFeedback(feedback)}
            onClick={submitFeedback}
          />
        </div>
      </div>
    </PanelShell>
  );
}
