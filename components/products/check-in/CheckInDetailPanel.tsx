/**
 * CheckInDetailPanel Component
 *
 * Full-page slide-in overlay for the check-in verification workflow.
 * Covers both left and right panes (+ SubNav) but not the CanaryAppShell
 * sidebar/header. Uses absolute inset-0 z-50 within the page's relative container.
 *
 * Two-state animation: shouldRender + animateIn for smooth slide-in/out.
 *
 * Layout: Header → Progress Bar → Two-column (main content + sidebar).
 * Uses CanaryCard, CanaryTable, CanaryTag (with TagColor enums), CanaryButton
 * (with ButtonColor enums) from the component library.
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CanaryButton,
  CanaryTag,
  CanaryCard,
  CanaryModal,
  CanaryInput,
  ButtonSize,
  ButtonType,
  ButtonColor,
  IconPosition,
  InputSize,
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
  mdiKeyOutline,
  mdiPlus,
  mdiNoteTextOutline,
  mdiCheck,
  mdiMessageTextOutline,
  mdiAccountMultipleOutline,
  mdiPound,
  mdiSend,
  mdiCellphone,
} from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { IDVerificationSection } from './IDVerificationSection';
import { PaymentCardSection } from './PaymentCardSection';
import { UpsellsSection } from './UpsellsSection';
import { RegistrationCardSection } from './RegistrationCardSection';
import { CheckInSubmission, loyaltyColors, UpsellItem } from '@/lib/products/check-in/types';
import { submissionUpsells } from '@/lib/products/check-in/mock-data';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';

interface CheckInDetailPanelProps {
  submission: CheckInSubmission | null;
  guest: Guest | null;
  reservation?: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: (id: string) => void;
}

export function CheckInDetailPanel({
  submission,
  guest,
  reservation,
  isOpen,
  onClose,
  onCheckIn,
}: CheckInDetailPanelProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Local upsells state for approve/deny
  const [localUpsells, setLocalUpsells] = useState<UpsellItem[]>([]);
  // Mobile keys — array of keys, each with own status
  interface MobileKey {
    name: string;
    status: 'not_provisioned' | 'activated' | 'deactivated';
    phone: string;
    email: string;
  }
  const [mobileKeys, setMobileKeys] = useState<MobileKey[]>([]);
  const [openKeyMenuIdx, setOpenKeyMenuIdx] = useState<number | null>(null);
  const [activeKeyIdx, setActiveKeyIdx] = useState<number | null>(null);
  const keyMenuRef = useRef<HTMLDivElement>(null);

  // Modal visibility
  const [showMobileKeyModal, setShowMobileKeyModal] = useState(false);
  const [mobileKeyResendMode, setMobileKeyResendMode] = useState(false);
  const [showActivateKeyModal, setShowActivateKeyModal] = useState(false);
  const [showDeactivateKeyModal, setShowDeactivateKeyModal] = useState(false);
  const [showKeyDetailsModal, setShowKeyDetailsModal] = useState(false);

  // Mobile key modal form state
  const [keyName, setKeyName] = useState('');
  const [keyPhone, setKeyPhone] = useState('');
  const [keyEmail, setKeyEmail] = useState('');

  // Scroll refs for verification bar click-to-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    if (submission && guest) {
      setLocalUpsells(submissionUpsells[submission.id] || []);
      setMobileKeys(submission.hasMobileKey
        ? [{ name: `${guest.name} #1`, status: 'activated', phone: guest.phone || '', email: guest.email || '' }]
        : []
      );
      setOpenKeyMenuIdx(null);
    }
  }, [submission, guest]);

  // Close key menu on click outside
  useEffect(() => {
    if (openKeyMenuIdx === null) return;
    const handleClick = (e: MouseEvent) => {
      if (keyMenuRef.current && !keyMenuRef.current.contains(e.target as Node)) {
        setOpenKeyMenuIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openKeyMenuIdx]);

  const status = submission?.status;
  const isVerified = status === 'verified' || status === 'checked_in';
  const isReadOnly = status === 'checked_in';
  const isPending = status === 'pending';
  const isPartial = status === 'partially_submitted';

  // Progress bar steps
  const steps = useMemo(() => {
    const upsellCount = localUpsells.filter((u) => u.status === 'pending').length;
    const regCardDone = status === 'submitted' || status === 'verified' || status === 'checked_in';
    const idDone = isVerified;
    const ccDone = isVerified;
    const upsellsDone = upsellCount === 0 && localUpsells.length > 0;

    return [
      { key: 'regcard', label: 'Reg card signed', done: regCardDone },
      { key: 'id', label: 'Confirm ID', done: idDone },
      { key: 'cc', label: 'Confirm CC', done: ccDone },
      {
        key: 'upsells',
        label: localUpsells.length > 0
          ? `Approve ${upsellCount} upsell${upsellCount !== 1 ? 's' : ''}`
          : 'No upsell requests',
        done: upsellsDone || localUpsells.length === 0,
      },
    ];
  }, [status, isVerified, localUpsells]);

  const completedStepCount = useMemo(() => steps.filter((s) => s.done).length, [steps]);

  // Determine each step's interaction state: 'success' | 'action' | 'disabled'
  const stepStates = useMemo(() => {
    let foundFirstIncomplete = false;
    return steps.map((step) => {
      if (step.done) return 'success' as const;
      if (!foundFirstIncomplete) {
        foundFirstIncomplete = true;
        return 'action' as const;
      }
      return 'disabled' as const;
    });
  }, [steps]);

  const handleStepClick = (key: string) => {
    const el = sectionRefs.current[key];
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApproveUpsell = (id: string) => {
    setLocalUpsells((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'approved' as const } : u))
    );
  };

  const handleDenyUpsell = (id: string) => {
    setLocalUpsells((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'denied' as const } : u))
    );
  };

  if (!shouldRender) return null;
  if (!guest) return null;

  const loyaltyLabel = guest.statusTag?.label;
  const shortLoyaltyLabel = loyaltyLabel?.replace(' ELITE', '');
  const loyaltyStyle = loyaltyLabel
    ? loyaltyColors[loyaltyLabel] || loyaltyColors[shortLoyaltyLabel || '']
    : null;

  const pendingIdChecks = !isVerified && !isPending && !isPartial ? 3 : 0;
  const pendingCCChecks = !isVerified && !isPending && !isPartial && reservation?.paymentCard ? 1 : 0;
  const totalPendingChecks = pendingIdChecks + pendingCCChecks;

  // Production: getTitle() returns dynamic title based on active verification steps
  const hasId = !isPending;
  const hasPayment = !isPending && !!reservation?.paymentCard;
  // Production i18n: checkInDetails.cardTitles.paymentAndId = "Confirm ID and payment"
  const sectionTitle = hasId && hasPayment
    ? 'Confirm ID and payment'
    : hasId
      ? 'ID Verification'
      : 'Payment Verification';

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
              {submission?.arrivalTime && (
                <div className="flex items-center gap-1.5">
                  <Icon path={mdiClockOutline} size={0.6} color={colors.colorBlack4} />
                  <span className="text-[12px]" style={{ color: colors.colorBlack3 }}>
                    {submission.arrivalTime}
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
            />
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.COMPACT}
              icon={<Icon path={mdiDotsHorizontal} size={0.8} color={colors.colorBlack2} />}
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

      {/* ── Verification Bar ──────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="px-6 py-3 grid" style={{ gridTemplateColumns: '4fr 1fr', columnGap: 8, rowGap: 12 }}>
          {/* Row 1, Col 1: Steps progress bar — fill aligns to completed checkbox cells */}
          <div className="relative h-[3px]" style={{ backgroundColor: '#EAEAEA' }}>
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${(completedStepCount / steps.length) * 100}%`,
                backgroundColor: '#008040',
              }}
            />
          </div>

          {/* Row 1, Col 2: Action progress bar */}
          <div className="relative h-[3px]" style={{ backgroundColor: '#EAEAEA' }} />

          {/* Row 2, Col 1: Segmented step buttons */}
          <div className="flex items-stretch border rounded overflow-clip h-[40px]" style={{ borderColor: '#E5E5E5' }}>
            {steps.map((step, i) => {
              const state = stepStates[i];
              const isClickable = state === 'success' || state === 'action';
              return (
                <div
                  key={step.key}
                  className={`flex-1 flex items-center justify-center px-2 py-2 transition-colors
                    ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                    ${state === 'disabled' ? 'opacity-50' : ''}`}
                  style={{
                    borderRight: i < steps.length - 1 ? '1px solid #E5E5E5' : 'none',
                    backgroundColor: step.done ? colors.colorLightGreen5 : undefined,
                  }}
                  onClick={isClickable ? () => handleStepClick(step.key) : undefined}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    {step.done ? (
                      <svg width="20" height="20" viewBox="0 0 15 15" fill="none" className="shrink-0">
                        <rect x="1.08333" y="0.583333" width="12.8333" height="12.8333" rx="6.41667" fill="#008040" stroke="#008040" strokeWidth="1.16667" />
                        <path d="M6.44563 9.00375L4.62125 7.17937L4 7.79625L6.44563 10.2419L11.6956 4.99187L11.0788 4.375L6.44563 9.00375Z" fill="white" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 14 14" className="shrink-0">
                        <g transform="rotate(-90, 7, 7)">
                          <circle r="6.17" cx="7" cy="7" stroke="#EAEAEA" strokeWidth="1.66" fill="transparent" />
                          <circle r="6.17" cx="7" cy="7" stroke="#008040" strokeWidth="1.66" fill="transparent"
                            strokeDasharray="38.767253345298045" strokeDashoffset="38.767253345298045" strokeLinecap="round" />
                        </g>
                      </svg>
                    )}
                    <span
                      className="text-[12px] font-medium whitespace-nowrap"
                      style={{ color: colors.colorBlack1 }}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2, Col 2: Action button */}
          <div className="h-[40px] [&>button]:w-full [&>button]:h-full">
            {status === 'submitted' && (
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.NORMAL}
                onClick={() => submission && onCheckIn?.(submission.id)}
              >
                Mark as ready for check-in
              </CanaryButton>
            )}
            {status === 'verified' && (
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.NORMAL}
                onClick={() => submission && onCheckIn?.(submission.id)}
              >
                Check in guest
              </CanaryButton>
            )}
            {status === 'checked_in' && (
              <div className="flex items-center justify-center gap-1 h-full">
                <Icon path={mdiCheck} size={1} color={colors.success} />
                <span className="text-[14px] font-medium" style={{ color: colors.colorBlack2 }}>
                  Check-in Completed
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content + Sidebar ───────────────────────────────── */}
      {/* Production: .checkInDetailsContent { display: flex; flex: 1; overflow-y: auto } */}
      <div className="flex-1 flex overflow-y-auto">
        {/* Main scrollable content — production: .detailsBody { margin: 24px; margin-right: 8px; gap: 8px } */}
        {/* Production: .checkInDetailsBody { flex: 2 } */}
        <div ref={scrollContainerRef} className="flex flex-col gap-2" style={{ flex: 2, margin: '24px 8px 24px 24px', minWidth: 600 }}>
          {isPending ? (
            /* Pending empty state */
            <CanaryCard hasBorder>
              <h3
                className="text-[15px] font-semibold mb-6"
                style={{ color: colors.colorBlack1 }}
              >
                Payment &amp; ID Verification
              </h3>
              <div
                className="flex items-center justify-center h-[250px] rounded-lg bg-gray-50"
              >
                <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  Waiting for guest to submit check-in form
                </span>
              </div>
            </CanaryCard>
          ) : (
            <>
              {/* ── Payment & ID Verification ── */}
              {/* Production: CheckInDetailsDocumentVerificationCard → CanaryContainer hasBorder */}
              <div ref={(el) => { sectionRefs.current['id'] = el; sectionRefs.current['cc'] = el; }} />
              <CanaryCard hasBorder>
                <div className="flex items-center gap-2 mb-4">
                  <h3
                    className="text-[15px] font-semibold"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {sectionTitle}
                  </h3>
                  {isPartial && (
                    <CanaryTag
                      label="PENDING"
                      color={TagColor.DEFAULT}
                      size={TagSize.COMPACT}
                    />
                  )}
                  {!isPartial && !isVerified && totalPendingChecks > 0 && (
                    <CanaryTag
                      label={`${totalPendingChecks} Pending`}
                      color={TagColor.DEFAULT}
                      size={TagSize.COMPACT}
                    />
                  )}
                  {isVerified && (
                    <CanaryTag
                      label="Completed"
                      size={TagSize.COMPACT}
                    />
                  )}
                </div>

                {/* Production: .overallContentContainer — CSS Grid, no gap.
                    Each sub-section has own border; border-radius adjusted at breakpoints
                    so the two merge into one visual rounded rectangle.
                    Wide (default): ID rounds left; Payment rounds right. Adjacent borders = divider.
                    Stacked (<1680px): ID rounds top, no bottom border; Payment rounds bottom.
                    Matches production breakpoint exactly. */}
                <style>{`
                  .id-payment-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                  }
                  .id-section-border {
                    border: 1px solid ${colors.colorBlack6};
                    border-radius: 8px 0 0 8px;
                  }
                  .payment-section-border {
                    border: 1px solid ${colors.colorBlack6};
                    border-radius: 0 8px 8px 0;
                  }
                  @media (max-width: 1680px) {
                    .id-payment-grid {
                      grid-template-columns: 1fr;
                    }
                    .id-section-border {
                      border-radius: 8px 8px 0 0;
                      border-bottom: none;
                    }
                    .payment-section-border {
                      border-radius: 0 0 8px 8px;
                    }
                  }
                `}</style>
                <div className="id-payment-grid">
                  <div className="id-section-border">
                    <IDVerificationSection
                      guest={guest}
                      isVerified={isVerified}
                      isReadOnly={isReadOnly}
                    />
                  </div>
                  <div className="payment-section-border">
                    <PaymentCardSection
                      reservation={reservation}
                      isVerified={isVerified}
                      isReadOnly={isReadOnly}
                    />
                  </div>
                </div>
              </CanaryCard>

              {/* ── Upsells ── */}
              <div ref={(el) => { sectionRefs.current['upsells'] = el; }} />
              <CanaryCard hasBorder>
                <UpsellsSection
                  upsells={localUpsells}
                  onApprove={handleApproveUpsell}
                  onDeny={handleDenyUpsell}
                  isReadOnly={isReadOnly}
                />
              </CanaryCard>

              {/* ── Registration Card ── */}
              <div ref={(el) => { sectionRefs.current['regcard'] = el; }} />
              {!isPending && (
                <CanaryCard hasBorder>
                  <RegistrationCardSection
                    guest={guest}
                    reservation={reservation}
                    isSubmitted={status === 'submitted' || isVerified}
                  />
                </CanaryCard>
              )}
            </>
          )}
        </div>

        {/* Sidebar — production: .checkInDetailsSidebar { flex: 1; min-width: 332px; max-width: 600px }
            Sidebar.vue: { gap: 16px; padding: 24px; padding-left: 16px } */}
        <div
          className="flex flex-col gap-4 shrink-0"
          style={{ flex: 1, minWidth: 332, maxWidth: 600, padding: '24px 24px 24px 16px' }}
        >
          {/* Room key(s) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[18px] font-medium"
                style={{ color: colors.colorBlack1 }}
              >
                {mobileKeys.length > 1 ? 'Room keys' : 'Room key'}
              </h4>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiPlus} size={0.7} color={colors.colorBlueDark1} />}
                onClick={() => {
                  setKeyName(`${guest.name} #${mobileKeys.length + 1}`);
                  setKeyPhone(guest.phone || '');
                  setKeyEmail(guest.email || '');
                  setMobileKeyResendMode(false);
                  setActiveKeyIdx(null);
                  setShowMobileKeyModal(true);
                }}
              />
            </div>
            {mobileKeys.length > 0 ? (
              <div className="flex flex-col gap-3">
                {mobileKeys.map((key, idx) => {
                  const menuItems = key.status === 'deactivated'
                    ? [
                        { label: 'View Details', danger: false, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowKeyDetailsModal(true); } },
                      ]
                    : key.status === 'activated'
                    ? [
                        { label: 'View Details', danger: false, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowKeyDetailsModal(true); } },
                        { label: 'Re-send Link', danger: false, action: () => {
                          setOpenKeyMenuIdx(null);
                          setActiveKeyIdx(idx);
                          setKeyName(key.name);
                          setKeyPhone(key.phone);
                          setKeyEmail(key.email);
                          setMobileKeyResendMode(true);
                          setShowMobileKeyModal(true);
                        } },
                        { label: 'Deactivate key', danger: true, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowDeactivateKeyModal(true); } },
                      ]
                    : [
                        { label: 'Activate key', danger: false, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowActivateKeyModal(true); } },
                        { label: 'View Details', danger: false, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowKeyDetailsModal(true); } },
                        { label: 'Re-send Link', danger: false, action: () => {
                          setOpenKeyMenuIdx(null);
                          setActiveKeyIdx(idx);
                          setKeyName(key.name);
                          setKeyPhone(key.phone);
                          setKeyEmail(key.email);
                          setMobileKeyResendMode(true);
                          setShowMobileKeyModal(true);
                        } },
                        { label: 'Deactivate key', danger: true, action: () => { setOpenKeyMenuIdx(null); setActiveKeyIdx(idx); setShowDeactivateKeyModal(true); } },
                      ];

                  return (
                    <div key={idx}>
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px]" style={{ color: colors.colorBlack1 }}>
                              {key.name}
                            </span>
                            <CanaryTag
                              label={key.status === 'activated' ? 'ACTIVATED' : key.status === 'deactivated' ? 'DEACTIVATED' : 'NOT PROVISIONED'}
                              size={TagSize.COMPACT}
                              variant={TagVariant.OUTLINE}
                              color={key.status === 'activated' ? TagColor.SUCCESS : key.status === 'deactivated' ? TagColor.ERROR : TagColor.DEFAULT}
                            />
                          </div>
                          {reservation?.room && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Icon path={mdiBedOutline} size={0.6} color={colors.colorBlack4} />
                              <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
                                {reservation.room}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="relative" ref={openKeyMenuIdx === idx ? keyMenuRef : undefined}>
                          <CanaryButton
                            type={ButtonType.ICON_SECONDARY}
                            size={ButtonSize.COMPACT}
                            icon={<Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />}
                            onClick={() => setOpenKeyMenuIdx(openKeyMenuIdx === idx ? null : idx)}
                          />
                          {openKeyMenuIdx === idx && (
                            <div
                              className="absolute right-0 top-full mt-1 py-2 bg-white rounded-lg shadow-lg z-10"
                              style={{ minWidth: 180, border: `1px solid ${colors.colorBlack6}` }}
                            >
                              {menuItems.map((item) => (
                                <button
                                  key={item.label}
                                  className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 transition-colors"
                                  style={{ color: item.danger ? colors.danger : colors.colorBlack1 }}
                                  onClick={item.action}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  backgroundColor: colors.colorBlack7,
                  borderRadius: 8,
                  height: 64,
                }}
              >
                <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  {status === 'pending' ? 'Guest not checked in yet' : 'No keys created'}
                </span>
              </div>
            )}
          </div>

          {/* Divider — production uses CanaryDivider */}
          <div className="h-px w-full" style={{ backgroundColor: colors.colorBlack6 }} />

          {/* Contact info — production: ReservationContactDetails */}
          <div className="flex flex-col gap-3">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <Icon path={mdiPhoneOutline} size={0.83} color={colors.colorBlack1} />
              <span className="text-[14px] flex-1" style={{ color: colors.colorBlack1 }}>
                {guest.phone || 'No number assigned'}
              </span>
              {guest.phone && (
                <div className="flex items-center gap-1">
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    size={ButtonSize.COMPACT}
                    icon={<Icon path={mdiMessageTextOutline} size={0.67} color={colors.colorBlack3} />}
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
            <div className="flex items-center gap-4">
              <Icon path={mdiEmailOutline} size={0.83} color={colors.colorBlack1} />
              <span className="text-[14px] flex-1 truncate" style={{ color: colors.colorBlack1 }}>
                {guest.email || 'No email assigned'}
              </span>
              {guest.email && (
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  icon={<Icon path={mdiDotsHorizontal} size={0.67} color={colors.colorBlack3} />}
                />
              )}
            </div>

            {/* Language */}
            <div className="flex items-center gap-4">
              <Icon path={mdiWeb} size={0.83} color={colors.colorBlack1} />
              <span className="text-[14px]" style={{ color: colors.colorBlack1 }}>
                {guest.preferredLanguage || 'Unknown'}
              </span>
            </div>

            {/* Assign staff */}
            <div className="flex items-center gap-4">
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

          {/* Notes — production: ReservationGuestNotes */}
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
              />
            </div>
            {reservation?.notes ? (
              <CanaryCard hasBorder padding="small">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon path={mdiNoteTextOutline} size={0.5} color={colors.colorBlack4} />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: colors.colorBlack4 }}
                  >
                    Staff note
                  </span>
                </div>
                <p className="text-[12px]" style={{ color: colors.colorBlack2 }}>
                  {reservation.notes}
                </p>
              </CanaryCard>
            ) : (
              <span className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                No notes yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Send Mobile Key Modal */}
      <CanaryModal
        isOpen={showMobileKeyModal}
        onClose={() => setShowMobileKeyModal(false)}
        title={mobileKeyResendMode ? 'Re-send mobile key to guest' : 'Send mobile key to guest'}
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px]" style={{ color: colors.colorBlack3 }}>
            This will send a link to guest so that they can add their mobile key to their wallet.
          </p>

          <div
            className="flex flex-col gap-4"
            style={{
              border: `1px solid ${colors.colorBlack6}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
              Send link to
            </span>

            <CanaryInput
              label="Key Name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              size={InputSize.NORMAL}
              isReadonly={mobileKeyResendMode}
            />
            <CanaryInput
              label="Phone"
              value={keyPhone}
              onChange={(e) => setKeyPhone(e.target.value)}
              size={InputSize.NORMAL}
              isReadonly={mobileKeyResendMode}
            />
            <CanaryInput
              label="Email"
              value={keyEmail}
              onChange={(e) => setKeyEmail(e.target.value)}
              size={InputSize.NORMAL}
              isReadonly={mobileKeyResendMode}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              onClick={() => setShowMobileKeyModal(false)}
            >
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={() => {
                if (activeKeyIdx === null) {
                  // Adding a new key
                  setMobileKeys((prev) => [{ name: keyName, status: 'not_provisioned', phone: keyPhone, email: keyEmail }, ...prev]);
                }
                setShowMobileKeyModal(false);
              }}
            >
              {mobileKeyResendMode ? 'Re-send Link' : 'Send Link'}
            </CanaryButton>
          </div>
        </div>
      </CanaryModal>

      {/* Activate Key Modal */}
      <CanaryModal
        isOpen={showActivateKeyModal}
        onClose={() => setShowActivateKeyModal(false)}
        title="Activate Vostio key"
        size="small"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px]" style={{ color: colors.colorBlack1 }}>
            Are you sure you want to activate Vostio key for guest? This will also mark the reservation as checked-in and guest can use it to unlock their room.
          </p>

          <div className="flex items-center justify-end gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              onClick={() => setShowActivateKeyModal(false)}
            >
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={() => {
                if (activeKeyIdx !== null) {
                  setMobileKeys((prev) => prev.map((k, i) => i === activeKeyIdx ? { ...k, status: 'activated' } : k));
                }
                setShowActivateKeyModal(false);
              }}
            >
              Activate
            </CanaryButton>
          </div>
        </div>
      </CanaryModal>

      {/* Deactivate Key Modal */}
      <CanaryModal
        isOpen={showDeactivateKeyModal}
        onClose={() => setShowDeactivateKeyModal(false)}
        title="Deactivate Vostio key"
        size="small"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px]" style={{ color: colors.colorBlack1 }}>
            Are you sure you want to deactivate Vostio key for guest? The guest will no longer be able to use their mobile key to unlock their room.
          </p>

          <div className="flex items-center justify-end gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              onClick={() => setShowDeactivateKeyModal(false)}
            >
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              color={ButtonColor.DANGER}
              onClick={() => {
                if (activeKeyIdx !== null) {
                  setMobileKeys((prev) => prev.map((k, i) => i === activeKeyIdx ? { ...k, status: 'deactivated' } : k));
                }
                setShowDeactivateKeyModal(false);
              }}
            >
              Deactivate
            </CanaryButton>
          </div>
        </div>
      </CanaryModal>

      {/* Mobile Key Details Modal */}
      <CanaryModal
        isOpen={showKeyDetailsModal}
        onClose={() => setShowKeyDetailsModal(false)}
        title="Mobile Key Details"
      >
        {(() => {
          const activeKey = activeKeyIdx !== null ? mobileKeys[activeKeyIdx] : null;
          const ks = activeKey?.status || 'not_provisioned';
          return (
            <div className="flex flex-col gap-4">
              <div
                className="flex flex-col gap-4"
                style={{
                  border: `1px solid ${colors.colorBlack6}`,
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium" style={{ color: colors.colorBlack1 }}>
                    Mobile Key
                  </span>
                  <CanaryTag
                    label={ks === 'activated' ? 'ACTIVATED' : ks === 'deactivated' ? 'DEACTIVATED' : 'NOT PROVISIONED'}
                    size={TagSize.COMPACT}
                    variant={TagVariant.OUTLINE}
                    color={ks === 'activated' ? TagColor.SUCCESS : ks === 'deactivated' ? TagColor.ERROR : TagColor.DEFAULT}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Icon path={mdiPound} size={0.75} color={colors.colorBlack4} />
                  <span className="text-[14px]" style={{ color: colors.colorBlack2 }}>
                    Key credential: {ks === 'deactivated' ? 'd1da09c3-ab1a-4b8a-8507-5dc5667bf9a5' : '86fbb279-09ce-4acb-9c49-bf066ffad6ce'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Icon path={mdiClockOutline} size={0.75} color={colors.colorBlack4} />
                  <span className="text-[14px]" style={{ color: colors.colorBlack2 }}>
                    {ks === 'deactivated' ? 'Mobile key deactivated a few seconds ago' : 'Mobile key activated a minute ago'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Icon path={mdiBedOutline} size={0.75} color={colors.colorBlack4} />
                  <span className="text-[14px]" style={{ color: colors.colorBlack2 }}>
                    Room {reservation?.room || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Icon path={mdiSend} size={0.75} color={colors.colorBlack4} />
                  <span className="text-[14px]" style={{ color: colors.colorBlack2 }}>
                    {activeKey?.email || '—'},{activeKey?.phone || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Icon path={mdiCellphone} size={0.75} color={colors.colorBlack4} />
                  <span className="text-[14px]" style={{ color: colors.colorBlack2 }}>
                    {ks === 'deactivated' ? 'Removed from wallet' : 'Added to wallet'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <CanaryButton
                  type={ButtonType.PRIMARY}
                  onClick={() => setShowKeyDetailsModal(false)}
                >
                  Close
                </CanaryButton>
              </div>
            </div>
          );
        })()}
      </CanaryModal>
    </div>
  );
}
