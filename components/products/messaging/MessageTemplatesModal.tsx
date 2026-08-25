/**
 * MessageTemplatesModal — the composer's template picker (frames `tpl-open`,
 * `tpl-select`).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE VERB SPLIT — the design rule this component exists to express
 * ═══════════════════════════════════════════════════════════════════════════
 * The two tabs commit to two DIFFERENT actions, and the footer button says so:
 *
 *   PRESET MESSAGES  → "Use".  The body is inserted into the composer input,
 *                      REPLACING whatever is there, and the modal closes. The
 *                      agent edits it and sends when she is ready. A preset is
 *                      a first draft the hotel wrote for her, not a decision.
 *   APPLE MESSAGE    → "Send". The message goes immediately as a staff message.
 *   TEMPLATES          An Apple template is an Apple-hosted payload; there is
 *                      no text to edit, so an "insert then send" step would be
 *                      two clicks that change nothing.
 *
 * The frames only draw the Apple tab. Both are built, because the split is the
 * point — a picker where every row does the same thing does not need two tabs.
 *
 * ⚠ SELECTION IS PER-TAB AND RESETS ON SWITCH. Carrying a preset selection into
 * the Apple tab would leave a "Send" button armed with a row nobody can see.
 *
 * ── BASE COMPONENTS ───────────────────────────────────────────────────────
 * `CanaryModal` (title + ×, its own overlay/Escape) · `CanaryTabs` TEXT (the
 * same control MainNav and SubNav use) · `CanaryList` + `CanaryListItem` for
 * the rows (the list draws its own hairlines between children, so there is no
 * divider element here) · `CanaryButton` TEXT for "Manage templates" and
 * PRIMARY for the commit.
 *
 * Four call-site overrides, all descendant variants on the modal's own
 * structure rather than new global classes:
 *   • `[&>div:nth-child(2)]:!p-0` — the modal body is `px-6 py-4`; the frame
 *     runs the rows FULL-BLEED so a selected row's tint reaches both edges.
 *     Each row then pays its own 24px inset back.
 *   • `[&>div:first-child]:border-b` / `[&>div:last-child]:border-t` — the
 *     frame rules the header and the footer off from the list. `CanaryModal`
 *     draws neither.
 *   • `!max-w-[800px]` — the frame's modal is 800px; `size="large"` is
 *     `max-w-4xl` (896px).
 */

'use client';

import React, { useState } from 'react';
import {
  ButtonType,
  CanaryButton,
  CanaryList,
  CanaryListItem,
  CanaryModal,
  CanaryTabs,
  colors,
  TabSize,
  TabType,
} from '@canary-ui/components';
import {
  APPLE_TEMPLATES,
  MessageTemplate,
  PRESET_TEMPLATES,
} from '@/lib/products/messaging/message-templates';
import { useRowKeyActivation } from '@/lib/products/messaging/useRowKeyActivation';
import { ModalFocusScope } from './ModalFocusScope';

type TemplateTab = 'preset' | 'apple';

interface MessageTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Preset tab: put this body in the composer input, replacing its contents. */
  onUse: (body: string) => void;
  /**
   * Apple tab: send this body now, as a staff message. Only ever called when
   * `isAppleBusiness` is true — there is no other route to the Apple list.
   */
  onSendNow?: (body: string) => void;
  /**
   * THE APPLE GATE. Apple Message Templates are an Apple Messages for Business
   * artefact and cannot be delivered down an SMS thread, so the tab renders
   * only where an AMB session exists. Callers pass the FACT (this thread's
   * channel), never a preference — see `Thread.channel`.
   *
   * Default false: a surface that has not thought about the gate does not get
   * the tab. The broadcast composer is one of those on purpose (a broadcast has
   * no Apple session and no single recipient).
   */
  isAppleBusiness?: boolean;
  /**
   * Applied to the body on the way OUT of the preset tab, never to the rows.
   *
   * The composer passes merge-tag interpolation here so the agent edits a
   * resolved sentence; the broadcast composer passes nothing and inserts the
   * literal, which is production's broadcast behaviour. The LIST always shows
   * raw tags either way — that is the documented point of the list.
   */
  resolveBody?: (body: string) => string;
}

/**
 * One template row: bold title over the body, on `CanaryListItem`.
 *
 * `children` rather than `title`/`subtitle` because the body is a MULTI-LINE
 * block that has to wrap and keep its authored line breaks (the Extend Your
 * Stay copy is three lines in the frame), and the base's subtitle slot is a
 * single truncating line.
 *
 * Selection is the blue tint the frame draws — `selectedBackgroundColor` on the
 * base, full-bleed, no border and no check. This picker is single-select and
 * the row is 100px tall; the tint is unmissable at that size, which is why it
 * does not carry the reservation picker's belt-and-braces tint+check.
 *
 * ⚠ `useRowKeyActivation` — `CanaryListItem` renders `<li role="button"
 * tabIndex={0}>` and handles no keys. Same stopgap every clickable row on this
 * surface carries; delete it with the others when the library lands its own.
 */
function TemplateRow({
  template,
  isSelected,
  onSelect,
}: {
  template: MessageTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const rowRef = useRowKeyActivation(onSelect);

  return (
    <CanaryListItem
      ref={rowRef}
      onClick={onSelect}
      isSelected={isSelected}
      selectedBackgroundColor={colors.colorBlueDark5}
      hoverColor="rgba(0,0,0,0.04)"
      alignment="start"
      allowTextWrap
      /* 24px horizontal / 16px vertical — the frame's row inset, paid by the
         row because the modal body is flush. `[&>*]:` reaches the base's inner
         div, which is where the library puts its own padding. */
      className="[&>*]:!px-6 [&>*]:!py-4 [&>*]:hover:!opacity-100"
    >
      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
        <span
          className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          {template.title}
        </span>
        <span
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-pre-wrap"
          style={{ color: colors.colorBlack1 }}
        >
          {template.body}
        </span>
      </div>
    </CanaryListItem>
  );
}

function TemplateList({
  templates,
  selectedId,
  onSelect,
}: {
  templates: MessageTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    /* No `hasOuterBorder`: the frame's list is full-bleed inside the modal, so
       the only rules it draws are the ones BETWEEN rows — which `CanaryList`
       supplies to every child on its own. Children are mapped straight in,
       keyed: the base reads `children` as an array and a wrapping fragment
       would count as one child and take every divider with it. */
    <CanaryList>
      {templates.map((t) => (
        <TemplateRow
          key={t.id}
          template={t}
          isSelected={selectedId === t.id}
          onSelect={() => onSelect(t.id)}
        />
      ))}
    </CanaryList>
  );
}

export function MessageTemplatesModal({
  isOpen,
  onClose,
  onUse,
  onSendNow,
  isAppleBusiness = false,
  resolveBody,
}: MessageTemplatesModalProps) {
  /**
   * `CanaryTabs` is UNCONTROLLED (`defaultTab` + `onChange`, no `activeTab`
   * prop) — the same contract MainNav and SubNav take it on. The base owns
   * which tab LOOKS active; this mirror exists only so the footer can name the
   * right verb, and it can never disagree because `onChange` is the only writer.
   */
  const [activeTab, setActiveTab] = useState<TemplateTab>('preset');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Without the Apple session there is no Apple tab, so `activeTab` can only
  // ever be 'preset' — the mirror is pinned rather than trusted.
  const tab: TemplateTab = isAppleBusiness ? activeTab : 'preset';
  const templates = tab === 'preset' ? PRESET_TEMPLATES : APPLE_TEMPLATES;
  const selected = templates.find((t) => t.id === selectedId) ?? null;

  const reset = () => {
    setSelectedId(null);
    setActiveTab('preset');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCommit = () => {
    if (!selected) return;
    if (tab === 'preset') {
      // The ROW shows the template as authored; what lands in the composer is
      // what the caller says it should be (resolved merge tags in a 1:1
      // conversation, the literal in a broadcast).
      onUse(resolveBody ? resolveBody(selected.body) : selected.body);
    } else {
      onSendNow?.(selected.body);
    }
    reset();
    onClose();
  };

  return (
    <ModalFocusScope isOpen={isOpen}>
      <CanaryModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Message templates"
        size="large"
        className="!max-w-[800px] [&>div:nth-child(2)]:!p-0 [&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5] [&>div:last-child]:border-t [&>div:last-child]:border-[#E5E5E5]"
        footer={
          <div className="flex items-center justify-between">
            {/* "Manage templates" — a route into Settings that this branch does
                not own. STANDALONE action, not in-sentence prose, so it keeps
                the library's own TEXT chrome (QA-4, 2026-08-25): `.text-btn-
                inline` used to strip it — height, padding, hover wash — which
                is the right move for a caption LINK but wrong here, where it
                just made the button's hover look dead. Stock NORMAL TEXT
                already renders `text-[14px]` and `font-medium`, so nothing
                needs restating; the base's own box + 8% hover wash paint. */}
            <CanaryButton type={ButtonType.TEXT}>
              Manage templates
            </CanaryButton>

            {/* THE VERB. Disabled until a row is picked — the frame's idle state
                draws it faded, which is `CanaryButton`'s own 50% disabled dim. */}
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={handleCommit}
              isDisabled={!selected}
            >
              {tab === 'preset' ? 'Use' : 'Send'}
            </CanaryButton>
          </div>
        }
      >
        {/* The tab strip pays the body's inset back for itself; the LISTS stay
            flush. `content` carries each list because that is `CanaryTabs`'
            contract — the base switches the body, so there is no second source of
            truth for which list is on screen. */}
        <CanaryTabs
          tabType={TabType.TEXT}
          tabSize={TabSize.COMPACT}
          defaultTab="preset"
          onChange={(tabId) => {
            setActiveTab(tabId as TemplateTab);
            // A selection from the other tab would arm the commit with a row
            // nobody can see.
            setSelectedId(null);
          }}
          /* 24px inset back onto the strip only, plus 16px of top air off the
             header's rule, plus the frame's own hairline under the strip.
             `CanaryTabs` TEXT draws the active tab's 4px blue underline
             `w-full` at the strip's bottom edge and nothing across the rest of
             the row, so the rule goes on the strip and the blue bar lands on top
             of it — which is how MainNav's tabs meet their own bar. */
          className="[&>div:first-child]:!px-6 [&>div:first-child]:!pt-4 [&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5]"
          /* The Apple tab is CONDITIONAL, on the thread's own channel — see
             `isAppleBusiness`. With no AMB session there is nothing to send an
             Apple-hosted payload into, so the tab is not rendered at all rather
             than rendered-and-disabled: a disabled tab is a promise that
             something is coming, and on an SMS thread nothing is. The strip stays
             (it labels the list, and it is the same control MainNav uses). */
          tabs={[
            {
              id: 'preset',
              label: 'Preset Messages',
              content: (
                <TemplateList
                  templates={PRESET_TEMPLATES}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ),
            },
            ...(isAppleBusiness
              ? [
                  {
                    id: 'apple',
                    label: 'Apple Message Templates',
                    content: (
                      <TemplateList
                        templates={APPLE_TEMPLATES}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </CanaryModal>
    </ModalFocusScope>
  );
}
