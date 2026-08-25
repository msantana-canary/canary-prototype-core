/**
 * BroadcastScheduledPanel — the detail view for a queued broadcast.
 *
 * Production's ScheduledGroupBroadcastSidebarModal.vue is a 420px right-side
 * slide-in; here it rides the surface's one panel standard, `<PanelShell>`
 * (2026-08-24 — it was on the deleted `FloatingPanel` before). Anatomy and
 * action placement mirror production exactly:
 *
 *   actions row — close (arrow-right) on the LEFT, then on the right three bare
 *                 icon buttons (edit text · edit time · send now) and a kebab
 *                 holding only the destructive Delete. That hybrid is
 *                 production's own split, not a simplification.
 *   title       — "Scheduled Broadcast"
 *   meta rows   — body · "Scheduled for …" · sender · "Group (N)"
 *   member list — who it will go to
 *
 * Delete and Send now confirm; edit text and edit time do not, and leave this
 * panel open — also production's asymmetry.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiArrowRight,
  mdiPencilOutline,
  mdiClockTimeFourOutline,
  mdiSend,
  mdiDotsHorizontal,
  mdiMessageProcessingOutline,
  mdiAccountCircleOutline,
  mdiAccountMultipleOutline,
} from '@mdi/js';
import {
  colors,
  CanaryModal,
  CanaryButton,
  CanaryTextArea,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { PanelShell } from '../panel/PanelShell';
import { Avatar } from '../Avatar';
import { ScheduleSendTimeModal } from './ScheduleSendTimeModal';
import {
  useBroadcastStore,
  getGuestEntriesForGroup,
} from '@/lib/products/messaging/broadcast-store';
import { formatScheduledMessageTime } from '@/lib/products/messaging/broadcast-schedule';
import { resolveBroadcastGuest } from '@/lib/products/messaging/broadcast-contacts';
import { reservations } from '@/lib/core/data/reservations';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function MetaRow({ iconPath, children }: { iconPath: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0" style={{ paddingTop: 3 }}>
        <Icon path={iconPath} size={0.67} color={colors.colorBlack3} />
      </span>
      <div
        className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {children}
      </div>
    </div>
  );
}

function MemberRow({ guestId, isLast }: { guestId: string; isLast: boolean }) {
  const guest = resolveBroadcastGuest(guestId);
  if (!guest) return null;

  const reservation = Object.values(reservations).find((r) => r.guestId === guestId);
  const roomDisplay = reservation
    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
    : '';

  return (
    <div
      className="flex items-center gap-3 transition-colors hover:bg-[#f9fafb]"
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        borderBottom: isLast ? undefined : `1px solid ${colors.colorBlack6}`,
      }}
    >
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </div>
        {roomDisplay && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
          >
            {roomDisplay}
          </div>
        )}
      </div>
    </div>
  );
}

function IconAction({
  iconPath,
  label,
  onClick,
}: {
  iconPath: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
      style={{ padding: 8 }}
    >
      <Icon path={iconPath} size={0.83} color={colors.colorBlack3} />
    </button>
  );
}

export function BroadcastScheduledPanel() {
  const {
    allGroups,
    scheduledBroadcasts,
    scheduledPanelId,
    selectedDate,
    closeScheduledPanel,
    rescheduleBroadcast,
    editScheduledBroadcastText,
    sendScheduledBroadcastNow,
    deleteScheduledBroadcast,
  } = useBroadcastStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [confirm, setConfirm] = useState<'delete' | 'send' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isMenuOpen]);

  const scheduled = scheduledBroadcasts.find((s) => s.id === scheduledPanelId);
  const group = scheduled ? allGroups.find((g) => g.id === scheduled.groupId) : undefined;
  const memberIds = scheduled
    ? getGuestEntriesForGroup(scheduled.groupId, allGroups, selectedDate).map((e) => e.guestId)
    : [];

  return (
    <>
      <PanelShell isOpen={!!scheduledPanelId} onClose={closeScheduledPanel} label="Scheduled Broadcast">
        {scheduled && (
          <div className="h-full flex flex-col">
            {/* Actions row — close left, actions right (production's split) */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 12 }}
            >
              <button
                onClick={closeScheduledPanel}
                aria-label="Close scheduled broadcast"
                className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                style={{ padding: 8 }}
              >
                <Icon path={mdiArrowRight} size={0.83} color={colors.colorBlack3} />
              </button>

              <div className="flex items-center gap-1">
                <IconAction
                  iconPath={mdiPencilOutline}
                  label="Edit message"
                  onClick={() => {
                    setDraftText(scheduled.body);
                    setIsTextModalOpen(true);
                  }}
                />
                <IconAction
                  iconPath={mdiClockTimeFourOutline}
                  label="Reschedule send time"
                  onClick={() => setIsTimeModalOpen(true)}
                />
                <IconAction
                  iconPath={mdiSend}
                  label="Send now"
                  onClick={() => setConfirm('send')}
                />

                {/* Only the destructive action hides in a menu — production's
                    CanaryOverflowMenu has no equivalent in @canary-ui yet. */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen((v) => !v)}
                    aria-label="More actions"
                    className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                    style={{ padding: 8 }}
                  >
                    <Icon path={mdiDotsHorizontal} size={0.83} color={colors.colorBlack3} />
                  </button>
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 z-50 rounded-lg bg-white py-1"
                      style={{
                        width: 160,
                        border: `1px solid ${colors.colorBlack6}`,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setConfirm('delete');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                        style={{ color: colors.colorRed1 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 8 }}>
              <h2
                className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
                style={{ color: colors.colorBlack1 }}
              >
                Scheduled Broadcast
              </h2>
            </div>

            {/* Meta rows */}
            <div
              className="shrink-0 flex flex-col gap-2"
              style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 16 }}
            >
              <MetaRow iconPath={mdiMessageProcessingOutline}>{scheduled.body}</MetaRow>
              <MetaRow iconPath={mdiClockTimeFourOutline}>
                {formatScheduledMessageTime(scheduled.sendAt)}
              </MetaRow>
              <MetaRow iconPath={mdiAccountCircleOutline}>
                {toTitleCase(scheduled.senderName)}
              </MetaRow>
              <MetaRow iconPath={mdiAccountMultipleOutline}>
                {`${group?.name ?? ''} (${group?.memberCount ?? memberIds.length})`}
              </MetaRow>
            </div>

            {/* Members */}
            <div
              className="flex-1 min-h-0"
              style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }}
            >
              <div
                className="h-full overflow-y-auto scrollbar-invisible rounded-[8px]"
                style={{ border: `1px solid ${colors.colorBlack6}` }}
              >
                {memberIds.length === 0 ? (
                  <div className="flex items-center justify-center" style={{ padding: 24 }}>
                    <p
                      className="font-['Roboto',sans-serif] text-[14px] leading-[22px] text-center"
                      style={{ color: colors.colorBlack4 }}
                    >
                      There are no members in this group
                    </p>
                  </div>
                ) : (
                  memberIds.map((id, i) => (
                    <MemberRow key={id} guestId={id} isLast={i === memberIds.length - 1} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </PanelShell>

      {/* Reschedule — same modal, reschedule mode */}
      <ScheduleSendTimeModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onConfirm={(sendAt) => {
          if (scheduled) rescheduleBroadcast(scheduled.id, sendAt);
          setIsTimeModalOpen(false);
        }}
        reschedule
        initialSendAt={scheduled?.sendAt}
      />

      {/* Edit message text */}
      <ModalFocusScope isOpen={isTextModalOpen}>
        <CanaryModal
          isOpen={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          title="Edit message"
          size="small"
          footer={
            <div className="flex justify-end gap-2">
              <CanaryButton type={ButtonType.OUTLINED} onClick={() => setIsTextModalOpen(false)}>
                Cancel
              </CanaryButton>
              <CanaryButton
                type={ButtonType.PRIMARY}
                isDisabled={!draftText.trim()}
                onClick={() => {
                  if (scheduled) editScheduledBroadcastText(scheduled.id, draftText);
                  setIsTextModalOpen(false);
                }}
              >
                Save
              </CanaryButton>
            </div>
          }
        >
          <CanaryTextArea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={5}
            maxLength={1600}
          />
        </CanaryModal>
      </ModalFocusScope>

      {/* Send now / Delete confirmations — production's copy verbatim */}
      <ModalFocusScope isOpen={confirm === 'send'}>
        <CanaryModal
          isOpen={confirm === 'send'}
          onClose={() => setConfirm(null)}
          title="Send scheduled message"
          size="small"
          footer={
            <div className="flex justify-end gap-2">
              <CanaryButton type={ButtonType.OUTLINED} onClick={() => setConfirm(null)}>
                Cancel
              </CanaryButton>
              <CanaryButton
                type={ButtonType.PRIMARY}
                onClick={() => {
                  if (scheduled) sendScheduledBroadcastNow(scheduled.id);
                  setConfirm(null);
                }}
              >
                Send
              </CanaryButton>
            </div>
          }
        >
          <p className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack1 }}>
            Do you want to send this message now?
          </p>
        </CanaryModal>
      </ModalFocusScope>

      <ModalFocusScope isOpen={confirm === 'delete'}>
        <CanaryModal
          isOpen={confirm === 'delete'}
          onClose={() => setConfirm(null)}
          title="Delete scheduled message"
          size="small"
          footer={
            <div className="flex justify-end gap-2">
              <CanaryButton type={ButtonType.OUTLINED} onClick={() => setConfirm(null)}>
                Cancel
              </CanaryButton>
              <CanaryButton
                type={ButtonType.PRIMARY}
                color={ButtonColor.DANGER}
                onClick={() => {
                  if (scheduled) deleteScheduledBroadcast(scheduled.id);
                  setConfirm(null);
                }}
              >
                Delete
              </CanaryButton>
            </div>
          }
        >
          <p className="font-['Roboto',sans-serif] text-[14px] leading-[22px]" style={{ color: colors.colorBlack1 }}>
            Are you sure you want to delete this message?
          </p>
        </CanaryModal>
      </ModalFocusScope>
    </>
  );
}
