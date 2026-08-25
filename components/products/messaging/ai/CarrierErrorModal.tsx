/**
 * CarrierErrorModal — "Message Not Delivered".
 *
 * Reached from the red "MESSAGE FAILED TO SEND" caption link on a failed
 * outbound message. A MODAL, not a sidebar, and for once the two halves of
 * Miguel's delineation agree: this is neither observability nor an action, it
 * is an interruption — something went wrong with a message you thought you had
 * sent, and the answer is four lines long.
 *
 * ── TWO CHANNELS, ONE FAILURE ─────────────────────────────────────────────
 * The frame lists WhatsApp AND SMS on a single failed send, which is not mock
 * noise: production attempts the rich channel and falls back, so one red
 * caption can stand for two different refusals. Showing only the last one would
 * send a hotelier to fix the wrong thing.
 *
 * ── THE CODE IS THE ONLY LINK ─────────────────────────────────────────────
 * The whole error line is in the red register and only the CODE is underlined —
 * the carrier's number is the searchable, quotable, support-ticket-able part,
 * and everything around it is our translation of it. Underlining the sentence
 * would offer a hotelier a link to a paragraph we wrote ourselves.
 *
 * ⚠ KNOWN DEAD PROMISE, KEPT AS DRAWN. The helper paragraph says some issues
 * "may require action, such as updating recipient info or retrying the
 * message," and the modal offers neither a retry nor a way to the guest record.
 * It is already on the fix-in-post list; the copy ships verbatim so the review
 * argues about the frame rather than about my paraphrase of it.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { CanaryModal, colors } from '@canary-ui/components';
import { CarrierErrorLine } from '../panel/panel-ui';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { CarrierError } from '@/lib/products/messaging/types';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

function ErrorRow({ error, isFirst }: { error: CarrierError; isFirst: boolean }) {
  return (
    <div style={{ borderTop: isFirst ? undefined : `1px solid ${colors.colorBlack6}`, padding: 14 }}>
      {/* The SHARED register — the same `<CarrierErrorLine>` the guest-journey
          timeline prints, at its full (non-compact) size. */}
      <CarrierErrorLine channel={error.channel} code={error.code} detail={error.detail} />
    </div>
  );
}

export function CarrierErrorModal() {
  const messageId = useMessagingStore((s) => s.carrierErrorMessageId);
  const findMessage = useMessagingStore((s) => s.findMessage);
  const close = useMessagingStore((s) => s.closeCarrierErrors);

  // Held so the receipts survive the modal's unmount frame.
  const [errors, setErrors] = useState<CarrierError[]>([]);
  useEffect(() => {
    if (!messageId) return;
    setErrors(findMessage(messageId)?.carrierErrors ?? []);
  }, [messageId, findMessage]);

  return (
    <ModalFocusScope isOpen={!!messageId}>
      <CanaryModal
        isOpen={!!messageId}
        onClose={close}
        title="Message Not Delivered"
        size="large"
        /* One width for the content-modal family (Miguel 8/25): 800px, matching
           the templates/group modals — bare size="large" is 896 and drifted. */
        className="!max-w-[800px]"
      >
        {/* The frame rules the header; CanaryModal does not. Bleed out through
            its `px-6 py-4` body padding and ink the line ourselves. */}
        <div
          style={{
            marginLeft: -24,
            marginRight: -24,
            marginTop: -16,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 20,
            paddingBottom: 8,
            borderTop: `1px solid ${colors.colorBlack6}`,
          }}
        >
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: colors.colorBlack2 }}
          >
            This message couldn&apos;t be delivered due to a send error. See the error code(s) below
            for more details. Some issues may require action, such as updating recipient info or
            retrying the message.
          </p>

          <div
            className="rounded-[8px] overflow-hidden"
            style={{ border: `1px solid ${colors.colorBlack6}`, marginTop: 16 }}
          >
            {errors.map((error, i) => (
              <ErrorRow key={error.channel} error={error} isFirst={i === 0} />
            ))}
          </div>
        </div>
      </CanaryModal>
    </ModalFocusScope>
  );
}
