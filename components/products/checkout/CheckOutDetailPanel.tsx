/**
 * CheckOutDetailPanel Component
 *
 * Full-page slide-in overlay for the checkout detail view.
 * Same layout pattern as CheckInDetailPanel:
 * Header -> Two-column (main content + sidebar).
 *
 * Two-state animation: shouldRender + animateIn for smooth slide-in/out.
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { mockThreads } from '@/lib/products/messaging/mock-data';
import {
  CanaryButton,
  CanaryTag,
  CanaryCard,
  CanaryTextArea,
  ButtonSize,
  ButtonType,
  ButtonColor,
  TagColor,
  TagSize,
  TagVariant,
  colors,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiClockOutline,
  mdiBedOutline,
  mdiCalendarOutline,
  mdiDotsHorizontal,
  mdiHistory,
  mdiPhoneOutline,
  mdiEmailOutline,
  mdiWeb,
  mdiPlus,
  mdiCheck,
  mdiMessageTextOutline,
  mdiAccountMultipleOutline,
  mdiStar,
  mdiStarOutline,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { ActionMenu } from '../../core/ActionMenu';
import { CheckOutSubmission, loyaltyColors, FolioLineItem, DEMO_TODAY } from '@/lib/products/checkout/types';
import { GuestNote } from '@/lib/products/check-in/types';
import { checkoutFolioItems, checkoutNotes, checkoutUpsells, checkoutActivityLogs } from '@/lib/products/checkout/mock-data';
import { ActivityLogModal } from './ActivityLogModal';
import { UpsellsSection } from '../check-in/UpsellsSection';
import { UpsellItem } from '@/lib/products/check-in/types';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'a few seconds ago';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (amount < 0) return `($${formatted})`;
  return `$${formatted}`;
}

interface CheckOutDetailPanelProps {
  submission: CheckOutSubmission | null;
  guest: Guest | null;
  reservation?: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onMarkProcessed?: (id: string) => void;
}

export function CheckOutDetailPanel({
  submission,
  guest,
  reservation,
  isOpen,
  onClose,
  onMarkProcessed,
}: CheckOutDetailPanelProps) {
  const router = useRouter();
  const selectThread = useMessagingStore((s) => s.selectThread);
  const closeGuestInfo = useMessagingStore((s) => s.closeGuestInfo);

  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Local notes state
  const [localNotes, setLocalNotes] = useState<GuestNote[]>([]);

  // Local upsells state
  const [localUpsells, setLocalUpsells] = useState<UpsellItem[]>([]);

  // Notes UI
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [openNoteMenuId, setOpenNoteMenuId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const noteMenuRef = useRef<HTMLDivElement>(null);

  // Folio collapsed state
  const [folioExpanded, setFolioExpanded] = useState(false);

  // Activity log modal
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else if (shouldRender) {
      setAnimateIn(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Reset local state when submission changes
  useEffect(() => {
    if (submission) {
      setLocalNotes(checkoutNotes[submission.id] || []);
      setLocalUpsells(checkoutUpsells[submission.id] || []);
      setShowNoteInput(false);
      setEditingNoteId(null);
      setOpenNoteMenuId(null);
      setFolioExpanded(false);
    }
  }, [submission]);

  const handleApproveUpsell = (id: string) => {
    setLocalUpsells(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' as const } : u));
  };
  const handleDenyUpsell = (id: string) => {
    setLocalUpsells(prev => prev.map(u => u.id === id ? { ...u, status: 'denied' as const } : u));
  };

  // Auto-dismiss copy toast
  useEffect(() => {
    if (!showCopyToast) return;
    const timer = setTimeout(() => setShowCopyToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showCopyToast]);

  // Close note menu on click outside
  useEffect(() => {
    if (openNoteMenuId === null) return;
    const handleClick = (e: MouseEvent) => {
      if (noteMenuRef.current && !noteMenuRef.current.contains(e.target as Node)) {
        setOpenNoteMenuId(null);
        setHoveredNoteId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openNoteMenuId]);

  const folioItems: FolioLineItem[] = useMemo(() => {
    if (!submission) return [];
    return checkoutFolioItems[submission.id] || [];
  }, [submission]);

  const folioBalance = useMemo(() => {
    return folioItems.reduce((sum, item) => sum + item.amount, 0);
  }, [folioItems]);

  if (!shouldRender) return null;
  if (!guest) return null;

  const isProcessed = submission?.folder === 'processed' || submission?.folder === 'archived';
  const isPending = submission?.folder === 'pending';
  const isSubmitted = submission?.folder === 'submitted';

  const loyaltyLabel = guest.statusTag?.label;
  const shortLoyaltyLabel = loyaltyLabel?.replace(' ELITE', '');
  const loyaltyStyle = loyaltyLabel
    ? loyaltyColors[loyaltyLabel] || loyaltyColors[shortLoyaltyLabel || '']
    : null;

  const folioStatusLabel = submission?.folioStatus === 'signed_on_tablet'
    ? 'SIGNED ON TABLET'
    : submission?.folioStatus === 'emailed'
      ? 'EMAILED'
      : 'PENDING';

  const folioStatusColor = submission?.folioStatus === 'signed_on_tablet'
    ? TagColor.SUCCESS
    : submission?.folioStatus === 'emailed'
      ? TagColor.INFO
      : TagColor.DEFAULT;

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col overflow-hidden shadow-2xl
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ backgroundColor: colors.colorBlack8 }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        {/* 3-column: Avatar | Content Stack | Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Column 1: Avatar */}
          <Avatar
            src={guest.avatar}
            initials={guest.initials}
            size="medium"
          />

          {/* Column 2: Name row + Info strip stacked */}
          <div className="flex-1 min-w-0">
            {/* Name + Loyalty */}
            <div className="flex items-center gap-2 mb-1.5">
              <h2
                className="text-[16px] font-semibold truncate"
                style={{ color: colors.colorBlack1 }}
              >
                {guest.name}
              </h2>
              {loyaltyStyle && shortLoyaltyLabel && (
                <CanaryTag
                  label={shortLoyaltyLabel}
                  size={TagSize.COMPACT}
                  variant={TagVariant.OUTLINE}
                  customColor={{
                    backgroundColor: loyaltyStyle.background,
                    borderColor: loyaltyStyle.border,
                    fontColor: loyaltyStyle.text,
                  }}
                  uppercase={false}
                />
              )}
            </div>

            {/* Info strip */}
            <div className="flex items-center gap-4 flex-wrap">
              {submission?.departureTime && (
                <div className="flex items-center gap-1.5">
                  <Icon path={mdiClockOutline} size={0.6} color={colors.colorBlack4} />
                  <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
                    {submission.departureTime}
                  </span>
                </div>
              )}
              {reservation?.room && (
                <div className="flex items-center gap-1.5">
                  <Icon path={mdiBedOutline} size={0.6} color={colors.colorBlack4} />
                  <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.roomTypeCode || ''} {reservation.room}
                  </span>
                </div>
              )}
              {reservation && (
                <div className="flex items-center gap-1.5">
                  <Icon path={mdiCalendarOutline} size={0.6} color={colors.colorBlack4} />
                  <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
                    {reservation.checkInDate} – {reservation.checkOutDate}
                  </span>
                </div>
              )}
              {reservation?.confirmationCode && (
                <span className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Confirmation: {reservation.confirmationCode}
                </span>
              )}
              {reservation?.rateCode && (
                <span className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                  Rate Code: {reservation.rateCode}
                </span>
              )}
            </div>
          </div>

          {/* Column 3: Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={mdiHistory} size={0.8} color={colors.colorBlack2} />}
              onClick={() => setShowActivityLog(true)}
            />
            <ActionMenu
              minWidth={250}
              items={[
                {
                  label: 'View Check-in',
                  onClick: () => {
                    onClose();
                    router.push(`/check-in?guest=${submission?.guestId}`);
                  },
                },
                {
                  label: 'Stop automated messages',
                  onClick: () => {},
                },
                {
                  label: 'Delete reservation',
                  danger: true,
                  onClick: () => {},
                },
              ]}
              iconSize={0.8}
              iconColor={colors.colorBlack2}
            />
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={mdiClose} size={0.8} color={colors.colorBlack2} />}
              onClick={onClose}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content + Sidebar ───────────────────────────────── */}
      <div className="flex-1 flex overflow-y-auto">
        {/* Main scrollable content */}
        <div className="flex flex-col gap-2" style={{ flex: 2, margin: '24px 8px 24px 24px', minWidth: 600 }}>

          {/* ── Section 1: Departure time ── */}
          <CanaryCard hasBorder>
            <div className="flex items-center justify-between">
              <h3
                className="text-[15px] font-semibold"
                style={{ color: colors.colorBlack1 }}
              >
                Departure time
              </h3>
              <span className="text-[14px]" style={{ color: colors.colorBlack3 }}>
                {isProcessed ? (
                  <>Expected to depart at <strong style={{ color: colors.colorBlack1 }}>{submission?.departureTime || '10:00 AM'}</strong></>
                ) : (
                  <>Standard checkout time <strong style={{ color: colors.colorBlack1 }}>{submission?.departureTime || '10:00 AM'}</strong></>
                )}
              </span>
            </div>
          </CanaryCard>

          {/* ── Section 2: Folio ── */}
          <CanaryCard hasBorder>
            {/* Header row: Folio + tag on left, buttons + chevron on right */}
            <div className={`flex items-center justify-between${folioExpanded ? ' mb-4' : ''}`}>
              <div className="flex items-center gap-2">
                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: colors.colorBlack1 }}
                >
                  Folio
                </h3>
                <CanaryTag
                  label={folioStatusLabel}
                  size={TagSize.COMPACT}
                  color={folioStatusColor}
                />
              </div>
              <div className="flex items-center gap-2">
                <CanaryButton
                  type={ButtonType.SHADED}
                  size={ButtonSize.COMPACT}
                >
                  Email Summary of Charges
                </CanaryButton>
                {!isProcessed && (
                  <CanaryButton
                    type={ButtonType.SHADED}
                    size={ButtonSize.COMPACT}
                  >
                    Send to Tablet
                  </CanaryButton>
                )}
                <button
                  type="button"
                  onClick={() => setFolioExpanded(!folioExpanded)}
                  className="cursor-pointer p-1"
                >
                  <Icon
                    path={folioExpanded ? mdiChevronUp : mdiChevronDown}
                    size={0.8}
                    color={colors.colorBlack3}
                  />
                </button>
              </div>
            </div>

            {/* Folio content container — only visible when expanded */}
            {folioExpanded && <div
              className="rounded-lg p-4"
              style={{ border: `1px solid ${colors.colorBlack6}` }}
            >
              {/* Folio line items */}
              {folioItems.length > 0 ? (
                <div className="mb-3">
                  {/* Charge list */}
                  <div className="flex flex-col">
                    {folioItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center pb-2 text-[13px]"
                      >
                        <div className="w-[95px] shrink-0" style={{ color: colors.colorBlack4 }}>
                          {item.date}
                        </div>
                        <div className="flex-1" style={{ color: colors.colorBlack1 }}>
                          {item.description}
                        </div>
                        <div className="text-right" style={{ color: colors.colorBlack1 }}>
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider — black */}
                  <hr className="my-2" style={{ borderColor: colors.colorBlack1 }} />

                  {/* Balance due */}
                  <div className="flex items-center pb-2 text-[13px]">
                    <div className="flex-1 font-semibold" style={{ color: colors.colorBlack1 }}>
                      Balance due
                    </div>
                    <div className="font-semibold text-right" style={{ color: colors.colorBlack1 }}>
                      {formatCurrency(folioBalance)}
                    </div>
                  </div>

                  {/* Updated timestamp */}
                  <p className="text-[13px] mt-2" style={{ color: colors.colorBlack4 }}>
                    Updated as of {DEMO_TODAY.replace(/-/g, '/').replace(/(\d{4})\/(\d{2})\/(\d{2})/, (_, y, m, d) => {
                      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                    })} at 3:53 PM EDT
                  </p>

                  {/* Divider — grey */}
                  <hr className="my-3" style={{ borderColor: colors.colorBlack6 }} />
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                    No folio line items.
                  </span>
                </div>
              )}

              {/* Folio confirmation messages */}
              {submission?.folioStatus === 'signed_on_tablet' && submission?.folioSignedAt ? (
                <div className="flex items-center gap-2">
                  <Icon path={mdiCheck} size={0.7} color={colors.success} />
                  <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
                    {guest?.name} signed the folio on {submission.folioSignedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                    {submission.folioSignedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} EDT
                  </span>
                  {isProcessed && (
                    <CanaryButton
                      type={ButtonType.SHADED}
                      size={ButtonSize.COMPACT}
                    >
                      View signed folio
                    </CanaryButton>
                  )}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  {guest?.name} has not confirmed the folio yet
                </p>
              )}
            </div>}
          </CanaryCard>

          {/* ── Section 3: Manage upsells ── */}
          <CanaryCard hasBorder>
            <UpsellsSection
              key={`ups-${submission?.id}`}
              upsells={localUpsells}
              onApprove={handleApproveUpsell}
              onDeny={handleDenyUpsell}
              isReadOnly={isProcessed}
            />
          </CanaryCard>

          {/* ── Section 4: Guest review ── */}
          <CanaryCard hasBorder>
            <h3
              className="text-[15px] font-semibold mb-3"
              style={{ color: colors.colorBlack1 }}
            >
              Guest review
            </h3>

            {submission?.guestRating != null && submission.guestRating > 0 ? (
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      path={star <= submission.guestRating! ? mdiStar : mdiStarOutline}
                      size={0.9}
                      color={star <= submission.guestRating! ? '#FAB541' : colors.colorBlack5}
                    />
                  ))}
                  <span
                    className="text-[14px] ml-2"
                    style={{ color: colors.colorBlack3 }}
                  >
                    {submission.guestRating} / 5
                  </span>
                </div>

                {/* Review text */}
                {submission.guestReview && (
                  <p className="text-[14px]" style={{ color: colors.colorBlack1 }}>
                    &ldquo;{submission.guestReview}&rdquo;
                  </p>
                )}

                {/* External review indicators */}
                {(submission.tripadvisorClicked || submission.googleReviewClicked) && (
                  <div className="mt-3">
                    <hr className="mb-3" style={{ borderColor: colors.colorBlack6 }} />

                    {submission.tripadvisorClicked && (
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#34E0A1',
                          }}
                        >
                          <span className="text-white text-[11px] font-bold leading-none">T</span>
                        </div>
                        <span className="text-[14px]" style={{ color: colors.colorBlack3 }}>
                          {guest?.name} visited the Tripadvisor review website from Canary checkout.
                        </span>
                      </div>
                    )}

                    {submission.googleReviewClicked && (
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#4285F4',
                          }}
                        >
                          <span className="text-white text-[11px] font-bold leading-none">G</span>
                        </div>
                        <span className="text-[14px]" style={{ color: colors.colorBlack3 }}>
                          {guest?.name} visited the Google review website from Canary checkout.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  No guest review.
                </span>
              </div>
            )}
          </CanaryCard>

          {/* ── Footer ── */}
          <div className="py-4 text-center">
            <span className="text-[12px]" style={{ color: colors.colorBlack4 }}>
              Created by Canary{reservation?.confirmationCode ? ` \u2022 ${reservation.confirmationCode}` : ''}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="flex flex-col gap-4 shrink-0"
          style={{ flex: 1, minWidth: 332, maxWidth: 600, padding: '24px 24px 24px 16px' }}
        >
          {/* Processed status / Mark as processed button */}
          {isProcessed ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-lg"
              style={{ backgroundColor: colors.colorLightGreen5 }}
            >
              <Icon path={mdiCheck} size={0.9} color={colors.ok} />
              <span
                className="text-[14px] font-medium"
                style={{ color: colors.ok }}
              >
                This checkout has been processed
              </span>
            </div>
          ) : (
            <div className="[&>button]:w-full">
              <CanaryButton
                type={ButtonType.PRIMARY}
                onClick={() => submission && onMarkProcessed?.(submission.id)}
              >
                Mark as processed
              </CanaryButton>
            </div>
          )}

          {/* Divider */}
          <div className="h-px w-full" style={{ backgroundColor: colors.colorBlack6 }} />

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            {/* Phone */}
            <div className="flex items-center gap-4 min-h-[32px]">
              <Icon path={mdiPhoneOutline} size={0.83} color={colors.colorBlack1} />
              {guest.phone ? (
                <span className="text-[14px] flex-1" style={{ color: colors.colorBlack1 }}>
                  {guest.phone}
                </span>
              ) : (
                <button
                  className="text-[14px] flex-1 text-left hover:underline"
                  style={{ color: colors.colorBlueDark1 }}
                >
                  Add phone number
                </button>
              )}
              {guest.phone && (
                <div className="flex items-center gap-1">
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    size={ButtonSize.COMPACT}
                    icon={<Icon path={mdiMessageTextOutline} size={0.67} color={colors.colorBlack3} />}
                    onClick={() => {
                      const thread = mockThreads.find((t) => t.contactNumber === guest.phone);
                      if (thread) selectThread(thread.id);
                      closeGuestInfo();
                      router.push('/messages');
                    }}
                  />
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    size={ButtonSize.COMPACT}
                    icon={<Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />}
                  />
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 min-h-[32px]">
              <Icon path={mdiEmailOutline} size={0.83} color={colors.colorBlack1} />
              {guest.email ? (
                <span className="text-[14px] flex-1 truncate" style={{ color: colors.colorBlack1 }}>
                  {guest.email}
                </span>
              ) : (
                <button
                  className="text-[14px] flex-1 text-left hover:underline"
                  style={{ color: colors.colorBlueDark1 }}
                >
                  Add email address
                </button>
              )}
              {guest.email && (
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  icon={<Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />}
                />
              )}
            </div>

            {/* Language */}
            <div className="flex items-center gap-4 min-h-[32px]">
              <Icon path={mdiWeb} size={0.83} color={colors.colorBlack1} />
              <span className="text-[14px]" style={{ color: colors.colorBlack1 }}>
                {guest.preferredLanguage || 'Unknown'}
              </span>
            </div>

            {/* Assign staff */}
            <div className="flex items-center gap-4 min-h-[32px]">
              <Icon path={mdiAccountMultipleOutline} size={0.83} color={colors.colorBlack1} />
              <button
                className="text-[14px] hover:underline"
                style={{ color: colors.colorBlueDark1 }}
              >
                Assign Staff or Department
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full" style={{ backgroundColor: colors.colorBlack6 }} />

          {/* Notes */}
          <div className="flex-1 overflow-y-hidden">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[18px] font-medium"
                style={{ color: colors.colorBlack1 }}
              >
                Notes
              </h4>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiPlus} size={0.7} color={colors.colorBlueDark1} />}
                onClick={() => { setShowNoteInput(true); setNoteText(''); }}
              />
            </div>

            {showNoteInput && (
              <div className="flex flex-col gap-2 mb-3">
                <CanaryTextArea
                  placeholder="Leave a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  style={{ backgroundColor: 'white' }}
                />
                <div className="flex items-center justify-end gap-2">
                  <CanaryButton
                    type={ButtonType.TEXT}
                    size={ButtonSize.COMPACT}
                    onClick={() => setShowNoteInput(false)}
                  >
                    Cancel
                  </CanaryButton>
                  <CanaryButton
                    type={ButtonType.SHADED}
                    size={ButtonSize.COMPACT}
                    isDisabled={!noteText.trim()}
                    onClick={() => {
                      setLocalNotes(prev => [{
                        id: `note-new-${Date.now()}`,
                        text: noteText.trim(),
                        type: 'staff',
                        author: 'Theresa Webb',
                        createdAt: new Date(),
                      }, ...prev]);
                      setShowNoteInput(false);
                    }}
                  >
                    Save
                  </CanaryButton>
                </div>
              </div>
            )}

            {localNotes.length > 0 ? (
              <div className="flex flex-col">
                {localNotes.map((note) => (
                  editingNoteId === note.id ? (
                    /* Edit mode */
                    <div key={note.id} className="flex flex-col gap-2 py-3">
                      <CanaryTextArea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        rows={3}
                        style={{ backgroundColor: 'white' }}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <CanaryButton
                          type={ButtonType.TEXT}
                          size={ButtonSize.COMPACT}
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </CanaryButton>
                        <CanaryButton
                          type={ButtonType.SHADED}
                          size={ButtonSize.COMPACT}
                          isDisabled={!editNoteText.trim()}
                          onClick={() => {
                            setLocalNotes(prev => prev.map(n =>
                              n.id === note.id ? { ...n, text: editNoteText.trim() } : n
                            ));
                            setEditingNoteId(null);
                          }}
                        >
                          Save
                        </CanaryButton>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <div
                      key={note.id}
                      className="relative rounded-lg transition-all duration-200 ease-in-out"
                      style={{
                        padding: hoveredNoteId === note.id || openNoteMenuId === note.id ? '12px 16px' : '12px 0',
                        backgroundColor: hoveredNoteId === note.id || openNoteMenuId === note.id ? '#f5f5f5' : 'transparent',
                      }}
                      onMouseEnter={() => setHoveredNoteId(note.id)}
                      onMouseLeave={() => { if (openNoteMenuId !== note.id) setHoveredNoteId(null); }}
                    >
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] mb-1" style={{ color: colors.colorBlack1 }}>
                            {note.text}
                          </p>
                          <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                            {note.type === 'guest_request' ? `Special request from ${note.author}` : note.author}
                            {' \u00B7 '}
                            {formatRelativeTime(note.createdAt)}
                          </p>
                        </div>
                        <div
                          className="relative shrink-0"
                          ref={openNoteMenuId === note.id ? noteMenuRef : undefined}
                        >
                          <div
                            className="transition-opacity duration-200"
                            style={{ opacity: hoveredNoteId === note.id || openNoteMenuId === note.id ? 1 : 0 }}
                          >
                            <CanaryButton
                              type={ButtonType.ICON_SECONDARY}
                              size={ButtonSize.COMPACT}
                              icon={<Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />}
                              onClick={() => setOpenNoteMenuId(openNoteMenuId === note.id ? null : note.id)}
                            />
                          </div>
                          {openNoteMenuId === note.id && (
                            <div
                              className="absolute right-0 bottom-full mb-1 py-2 bg-white rounded-lg shadow-lg z-10"
                              style={{ minWidth: 140, border: `1px solid ${colors.colorBlack6}` }}
                            >
                              <button
                                className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors"
                                style={{ color: colors.colorBlueDark1 }}
                                onClick={() => {
                                  navigator.clipboard.writeText(note.text);
                                  setOpenNoteMenuId(null);
                                  setShowCopyToast(true);
                                }}
                              >
                                Copy
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors"
                                style={{ color: colors.colorBlueDark1 }}
                                onClick={() => {
                                  setOpenNoteMenuId(null);
                                  setEditNoteText(note.text);
                                  setEditingNoteId(note.id);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors"
                                style={{ color: colors.danger }}
                                onClick={() => {
                                  setOpenNoteMenuId(null);
                                  setLocalNotes(prev => prev.filter(n => n.id !== note.id));
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16">
                <span className="text-[14px]" style={{ color: colors.colorBlack4 }}>
                  No notes yet.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy toast */}
      {showCopyToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-[60]"
          style={{ backgroundColor: colors.colorBlack2, color: colors.colorWhite }}
        >
          <span className="text-[14px]">Copied to clipboard</span>
        </div>
      )}

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        logs={submission ? (checkoutActivityLogs[submission.id] || []) : []}
      />
    </div>
  );
}
