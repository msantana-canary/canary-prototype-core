/**
 * CreateGroupModal — "New group" (frames `group-1` empty / `group-2` populated).
 *
 * A REBUILD, not an edit. The old modal drew the frame's furniture without any
 * of its behaviour: the contact row was labelled "(decorative)" in its own
 * comment, "Add" added nothing, there was no table to add it TO, and the only
 * field that reached the store was the group's name. So a hotelier could open
 * the one flow in Broadcast that builds an audience and come out the other side
 * with an empty group.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHAT THIS MODAL IS FOR
 * ═══════════════════════════════════════════════════════════════════════════
 * The three built-in folders (Arrivals / In-house / Departures) are the PMS's
 * own answer to "who is here". A CUSTOM group is the list the PMS has no
 * opinion about — the wedding party, the conference block, the ownership group
 * — which is why the contact row asks for a NAME and a NUMBER rather than
 * offering a guest picker. Nothing typed here is expected to resolve to a
 * reservation, and the data model says so (`contacts`, not `memberGuestIds`).
 *
 * ── THE FORM ──────────────────────────────────────────────────────────────
 * "Group name" · then one entry row — full name (optional) / phone with the
 * country affordance / channel / "Add contact" — which appends to the table
 * below and CLEARS ITSELF. Clearing matters: the row is a repeating action, and
 * a form that keeps the last contact in it invites a hotelier to hit Add twice
 * and get the same person on the list.
 *
 * CHANNEL IS SMS OR WHATSAPP. Production has no third option; the old modal's
 * "Apple Messages" was invented (see `BroadcastContactChannel`).
 *
 * ── THE TABLE ─────────────────────────────────────────────────────────────
 * `CanaryTable` is a near-exact match for the drawn anatomy and it is not a
 * coincidence: uppercase-able column labels OUTSIDE the border, an 8px gap, and
 * a bordered rounded-8 body whose first and last rows carry the radius. The
 * only overrides are the header's type register (the base draws 14px semibold
 * `colorBlack2`; the frame draws a 10px uppercase overline) and the row height.
 *
 * ⚠ THE FRAME'S THREE IDENTICAL "Miguel Santana" ROWS ARE MOCK FILLER and are
 * NOT seeded. The table is populated by real Add-contact entries — a demo that
 * ships with three copies of one person teaches that the flow does not work.
 *
 * ── DELIBERATE DEVIATIONS ─────────────────────────────────────────────────
 * 1. FIELD BORDERS ARE STOCK `#666666`, not the frame's pale hairline. This is
 *    the batch-6 ruling applied: Miguel called the pale border on the AI
 *    textareas *frame drift, not a sanctioned design-system change*, and the
 *    same pale hairline on the same base components here is the same drift. If
 *    the pale border is actually wanted it is a change to `CanaryInput` and
 *    belongs on the promotion list, not in this file.
 * 2. SAVE IS GATED ON A CONTACT **AND** A NAME. The rule as briefed is "≥1
 *    contact"; the name is added because `createGroup` refuses a nameless group
 *    (it would be unlistable), and a Save that is enabled and then silently does
 *    nothing is worse than a Save that is honestly disabled.
 * 3. NO CANCEL BUTTON. The frame's footer holds "Upload Contacts ⓘ" and "Save";
 *    the × is the cancel. The old modal's Cancel is gone rather than kept as a
 *    fourth control the frame does not draw.
 *
 * ── STUB ──────────────────────────────────────────────────────────────────
 * "Upload Contacts" + ⓘ is inert. Production opens a CSV flow: download a
 * template, upload a file, map its columns to name/phone/channel, review the
 * rows it could not parse, then commit them into this same table. That is four
 * screens and a parser, and none of it is what this batch was scoped to build.
 * Logged in REDESIGN_NOTES' stub inventory.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiInformationOutline, mdiTrashCanOutline } from '@mdi/js';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryInput,
  CanaryInputPhone,
  CanaryModal,
  CanarySelect,
  CanaryTable,
  colors,
  InputSize,
} from '@canary-ui/components';
import {
  BroadcastContactChannel,
  BroadcastGroupContact,
} from '@/lib/products/messaging/broadcast-types';
import { formatPhoneForDisplay, isPlausiblePhone } from '@/lib/products/messaging/phone';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, contacts: BroadcastGroupContact[]) => void;
}

/** Production's two. Email is not a broadcast channel — see the type. */
const CHANNEL_OPTIONS: { value: BroadcastContactChannel; label: string }[] = [
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const CHANNEL_LABEL: Record<BroadcastContactChannel, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

export function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [contacts, setContacts] = useState<BroadcastGroupContact[]>([]);

  // The entry row's own state — three fields that live and die together.
  const [entryName, setEntryName] = useState('');
  const [entryPhone, setEntryPhone] = useState('');
  const [entryChannel, setEntryChannel] = useState<BroadcastContactChannel | ''>('');

  /**
   * A contact needs a NUMBER and a CHANNEL. The name is optional in the form
   * and optional in the model, because half the lists this modal exists for are
   * built off a sheet of phone numbers with no names attached.
   *
   * ⚠ AND THE NUMBER HAS TO BE A NUMBER (QA-2, 2026-08-25). The gate used to be
   * `entryPhone.trim().length > 0`, so "banana" enabled Add contact, landed as
   * a row in the table, and Save built a real group around it. `isPlausiblePhone`
   * is the shared E.164-ish test — an optional `+`, digits and the usual human
   * separators, 10–15 digits — the same one the compose gate reads, so a number
   * this form accepts is a number the rest of the product would.
   */
  const phoneIsUsable = isPlausiblePhone(entryPhone);
  const canAddContact = phoneIsUsable && entryChannel !== '';

  /**
   * Shown only once the field is NON-EMPTY and has lost focus at least once —
   * an error on the first keystroke of a ten-digit number is an error about a
   * number nobody has finished typing.
   */
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneError =
    phoneTouched && entryPhone.trim() && !phoneIsUsable ? 'Enter a valid phone number' : undefined;

  const addContact = () => {
    if (!canAddContact) {
      // Enter on an unusable number must SAY so rather than doing nothing.
      if (entryPhone.trim()) setPhoneTouched(true);
      return;
    }
    setContacts((prev) => [
      ...prev,
      {
        id: `contact-${Date.now()}-${prev.length}`,
        name: entryName.trim() || undefined,
        phone: entryPhone.trim(),
        channel: entryChannel as BroadcastContactChannel,
      },
    ]);
    setPhoneTouched(false);
    // Clear the row — it is a repeating action, not a form you fill in once.
    setEntryName('');
    setEntryPhone('');
    setEntryChannel('');
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const reset = () => {
    setName('');
    setContacts([]);
    setPhoneTouched(false);
    setEntryName('');
    setEntryPhone('');
    setEntryChannel('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!contacts.length || !name.trim()) return;
    onCreate(name.trim(), contacts);
    reset();
  };

  return (
    <ModalFocusScope isOpen={isOpen}>
      <CanaryModal
        isOpen={isOpen}
        onClose={handleClose}
        title="New group"
        size="large"
        /* 800px is the frame's modal (`size="large"` is `max-w-4xl` = 896). The
           two border rules are the frame's header and footer hairlines, which
           `CanaryModal` does not draw; `min-h` holds the empty state open so the
           modal does not collapse to a strip before the first contact lands. */
        className="!max-w-[800px] [&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5] [&>div:last-child]:border-t [&>div:last-child]:border-[#E5E5E5] [&>div:nth-child(2)]:min-h-[360px]"
        footer={
          <div className="flex items-center justify-between">
            {/* Upload Contacts — a stub. `CanaryButton` TEXT stripped to an inline
                label, the surface's standing workaround for the link primitive the
                library has no component for (ask 45). The ⓘ sits outside it so the
                button's accessible name stays the words. */}
            <div className="flex items-center" style={{ gap: 6 }}>
              <CanaryButton
                type={ButtonType.TEXT}
                className="text-btn-inline font-['Roboto',sans-serif] !text-[14px] !font-medium"
              >
                Upload Contacts
              </CanaryButton>
              <Icon
                path={mdiInformationOutline}
                size={0.67}
                color={colors.colorBlack4}
                title="Upload a CSV of names, phone numbers and channels"
                id="group-upload-info"
              />
            </div>

            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={handleSave}
              isDisabled={!contacts.length || !name.trim()}
            >
              Save
            </CanaryButton>
          </div>
        }
      >
        <div className="flex flex-col" style={{ gap: 16 }}>
          {/* Group name */}
          <CanaryInput
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Text"
            size={InputSize.NORMAL}
          />

          {/* The entry row. `items-start` rather than `items-end`: none of the
              three fields carries a label, so their tops align and there is no
              baseline to hang them from. */}
          <div className="flex items-start" style={{ gap: 8 }}>
            <div className="flex-1 min-w-0">
              <CanaryInput
                placeholder="Full name (optional)"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addContact();
                }}
                size={InputSize.NORMAL}
              />
            </div>

            {/* The phone field with the frame's flag + ⇅ country affordance.
                `CanaryInputPhone` is `intl-tel-input` under the hood, so the flag
                button, the divider and the dial-code formatting are the base's —
                this is exactly the control the frame draws, not an approximation
                of it. Its `onChange` hands back a STRING (not an event), which is
                the one place this form's handlers differ from the others. */}
            {/* ⚠ `onBlur` RIDES THE WRAPPER. `CanaryInputPhoneProps` declares no
                native input props at all — no `onBlur`, no `onKeyDown` — so the
                "touched" signal is taken off the React blur that bubbles out of
                the field. Logged as ask #61. */}
            <div style={{ width: 210 }} onBlur={() => setPhoneTouched(true)}>
              <CanaryInputPhone
                placeholder="+1 201-555-0123"
                value={entryPhone}
                onChange={(v) => {
                  // Editing is the retry — see the gate note above.
                  if (phoneTouched) setPhoneTouched(false);
                  setEntryPhone(v);
                }}
                /* The base's error register IN FULL here, unlike the compose
                   header's chromeless field: this one keeps its box, so the red
                   hairline, the red focus ring (which compiles now — ask #49)
                   and the pink chip underneath all paint. No helper line of
                   ours is needed; the base already has one. */
                error={phoneError}
                size={InputSize.NORMAL}
              />
            </div>

            <div style={{ width: 210 }}>
              <CanarySelect
                aria-label="Select channel"
                placeholder="Select channel"
                value={entryChannel}
                onChange={(e) => setEntryChannel(e.target.value as BroadcastContactChannel)}
                options={CHANNEL_OPTIONS}
                size={InputSize.NORMAL}
              />
            </div>

            {/* Tonal, not solid. `ButtonType.SHADED` is the library's tonal
                register and the frame draws exactly it — pale blue ground, blue
                label. It has to stay quieter than Save: Add is a step, Save is
                the commit. */}
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.NORMAL}
              onClick={addContact}
              isDisabled={!canAddContact}
            >
              Add contact
            </CanaryButton>
          </div>

          {/* The contacts table. Nothing renders until there is something in it —
              `CanaryTable`'s own empty state is a centred sentence, and the frame
              draws bare space, which is the more honest empty: the row above is
              already the instruction. */}
          {contacts.length > 0 && (
            <CanaryTable
              data={contacts}
              /* Header → the frame's 10px uppercase overline (base: 14px
                 semibold). Rows → 20px vertical, which lands the drawn 64px row
                 around a 24px delete button (base: `py-1`). Both reach the base's
                 own cells; there is no prop for either.
                 ⚠ `tr:not(:first-child)` is load-bearing: `CanaryTable`'s first
                 tbody row is an 8px SPACER `<td class="h-2">` that sets the gap
                 between the overlines and the box, and a blanket `td` padding
                 inflates it to 48px. */
              className="[&_th]:!text-[10px] [&_th]:!leading-[16px] [&_th]:!font-medium [&_th]:!text-[#666666] [&_th]:!tracking-[0.4px] [&_tbody_tr:not(:first-child)_td]:!py-5"
              columns={[
                {
                  key: 'name',
                  label: 'NAME',
                  render: (_value, row: BroadcastGroupContact) => (
                    <span style={{ color: colors.colorBlack1 }}>{row.name || '—'}</span>
                  ),
                },
                {
                  key: 'phone',
                  label: 'PHONE NUMBER',
                  render: (_value, row: BroadcastGroupContact) => (
                    /* The table prints the hotelier register, not the raw string the
                       field took — the placeholder above promises a formatted number
                       and this row used to answer with `+12015550142`. */
                    <span style={{ color: colors.colorBlack1 }}>{formatPhoneForDisplay(row.phone)}</span>
                  ),
                },
                {
                  key: 'channel',
                  /* "SUMMARY" is the frame's word and production's. It reads odd
                     for a single channel name, and it is kept anyway: this column
                     is where production prints whatever it knows about how the
                     contact will be reached, and renaming it "CHANNEL" here would
                     put the prototype and the product in disagreement over a
                     column heading a hotelier already recognises. */
                  label: 'SUMMARY',
                  render: (_value, row: BroadcastGroupContact) => (
                    <span style={{ color: colors.colorBlack1 }}>
                      {CHANNEL_LABEL[row.channel]}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  label: '',
                  align: 'right',
                  width: '56px',
                  render: (_value, row: BroadcastGroupContact) => (
                    <CanaryButton
                      type={ButtonType.ICON_SECONDARY}
                      size={ButtonSize.COMPACT}
                      onClick={() => removeContact(row.id)}
                      className="icon-btn-neutral icon-btn-28 icon-btn-r6"
                      icon={
                        <Icon
                          path={mdiTrashCanOutline}
                          size={0.83}
                          color={colors.colorBlueDark1}
                          title={`Remove ${row.name || row.phone}`}
                          id={`group-contact-remove-${row.id}`}
                        />
                      }
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      </CanaryModal>
    </ModalFocusScope>
  );
}
