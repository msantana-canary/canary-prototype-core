/**
 * AiFeedbackModal — the 👎 path.
 *
 * Same content as the sidebar's feedback page, different surface, and the
 * difference is the ERRAND (Miguel's delineation): thumbs-down is a verdict,
 * not an investigation. You already know the answer was wrong; you want to say
 * why in ten seconds and get back to the inbox. That is a modal's whole job.
 *
 * ⚠ It is the SAME `<AiFeedbackForm>` the sidebar drills into. Only the chrome
 * differs: the modal recaps in a wider band, gates a right-aligned "Submit"
 * (the frames' label here — the sidebar's says "Submit Feedback"), and has no
 * back arrow because there is nothing behind it.
 *
 * Thumbs-down still latches blue on the message, as it has since batch 2. The
 * latch is the record that you rated it; the modal is where the rating gets its
 * reason. Opening the modal does not un-latch the thumb, and cancelling does not
 * either — you did disagree, whether or not you explained why.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CanaryModal, CanaryButton, ButtonType, ButtonSize, colors } from '@canary-ui/components';
import { AiRecapBand } from './AiRecapBand';
import { AiFeedbackForm, EMPTY_FEEDBACK, FeedbackValue, canSubmitFeedback } from './AiFeedbackForm';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { panelIdentity } from '@/lib/products/messaging/panel-selectors';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

/** `CanaryModal`'s own body/header/footer padding — `px-6 py-4`. Bleeding a
 *  full-width element out of it means giving these back, exactly. */
const MODAL_PAD_X = 24;
const MODAL_PAD_Y = 16;

export function AiFeedbackModal() {
  const messageId = useMessagingStore((s) => s.feedbackModalMessageId);
  const messages = useMessagingStore((s) => s.messages);
  const threads = useMessagingStore((s) => s.threads);
  const threadPrimaryReservationId = useMessagingStore((s) => s.threadPrimaryReservationId);
  const closeFeedbackModal = useMessagingStore((s) => s.closeFeedbackModal);
  const showToast = useMessagingStore((s) => s.showToast);

  const [feedback, setFeedback] = useState<FeedbackValue>(EMPTY_FEEDBACK);

  useEffect(() => {
    if (messageId) setFeedback(EMPTY_FEEDBACK);
  }, [messageId]);

  /**
   * The subject, resolved EXACTLY the way the explanation panel resolves it —
   * including the non-response case, where the subject IS the guest's message
   * and is therefore its own question with no answer to quote.
   *
   * Today only 👎 on an AI message opens this modal, so `isAnswer` is always
   * true. It is derived rather than assumed because the day a non-response
   * grows a quick-action door, the modal has to arrive correct rather than
   * quoting the guest back at herself under the AI's orb.
   */
  const subject = useMemo(() => {
    if (!messageId) return null;
    for (const list of Object.values(messages)) {
      const index = list.findIndex((m) => m.id === messageId);
      if (index === -1) continue;
      const message = list[index];
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

  const isAnswer = subject?.message.sender === 'ai';

  const guest = useMemo(() => {
    if (!subject) return null;
    const thread = threads.find((t) => t.id === subject.message.threadId);
    if (!thread) return null;
    return panelIdentity(thread, threadPrimaryReservationId[thread.id]).primary?.guest ?? null;
  }, [subject, threads, threadPrimaryReservationId]);

  const submit = () => {
    if (!canSubmitFeedback(feedback)) return;
    showToast('Feedback submitted');
    closeFeedbackModal();
  };

  return (
    <ModalFocusScope isOpen={!!messageId}>
      <CanaryModal
        isOpen={!!messageId}
        onClose={closeFeedbackModal}
        title="Help us improve future responses"
        size="large"
        /* One width for the content-modal family (Miguel 8/25): 800px. */
        className="!max-w-[800px]"
        footer={
          /* CanaryModal draws no rules of its own. The frames rule BOTH the
             header and the footer, so the two dividers are hand-bled back out
             through the library's px-6/py-4 padding here and on the band below. */
          <div
            className="flex justify-end"
            style={{
              marginLeft: -MODAL_PAD_X,
              marginRight: -MODAL_PAD_X,
              marginTop: -MODAL_PAD_Y,
              paddingLeft: MODAL_PAD_X,
              paddingRight: MODAL_PAD_X,
              paddingTop: MODAL_PAD_Y,
              borderTop: `1px solid ${colors.colorBlack6}`,
            }}
          >
            <CanaryButton
              type={ButtonType.PRIMARY}
              size={ButtonSize.NORMAL}
              isDisabled={!canSubmitFeedback(feedback)}
              onClick={submit}
            >
              Submit
            </CanaryButton>
          </div>
        }
      >
        {/* The band bleeds to the modal's edges — it is a quotation of the feed,
            and a quotation inset inside the body's padding reads as a form field. */}
        <div
          style={{
            marginLeft: -MODAL_PAD_X,
            marginRight: -MODAL_PAD_X,
            marginTop: -MODAL_PAD_Y,
            marginBottom: 20,
            borderTop: `1px solid ${colors.colorBlack6}`,
          }}
        >
          <AiRecapBand
            question={subject?.question}
            answer={isAnswer ? subject?.message.content : undefined}
            guest={guest}
          />
        </div>
        <AiFeedbackForm
          value={feedback}
          onChange={setFeedback}
          context={isAnswer ? 'response' : 'non-response'}
        />
      </CanaryModal>
    </ModalFocusScope>
  );
}
