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
  ButtonSize,
  ButtonType,
  ButtonColor,
  IconPosition,
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
  mdiCheck,
  mdiKeyOutline,
  mdiPlusCircleOutline,
  mdiNoteTextOutline,
} from '@mdi/js';
import { Avatar } from '../messaging/Avatar';
import { IDVerificationSection } from './IDVerificationSection';
import { PaymentCardSection } from './PaymentCardSection';
import { UpsellsSection } from './UpsellsSection';
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

  // Reset upsells when submission changes
  useEffect(() => {
    if (submission) {
      setLocalUpsells(submissionUpsells[submission.id] || []);
    }
  }, [submission]);

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

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col overflow-hidden shadow-2xl bg-white
        transition-transform duration-500 ease-out
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 px-6 py-4">
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
      <section className="border-b border-gray-200">
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
              <CanaryTag
                label="CHECKED IN"
                color={TagColor.SUCCESS}
                size={TagSize.COMPACT}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content + Sidebar ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main scrollable content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-auto p-6">
          {isPending ? (
            /* Pending empty state */
            <CanaryCard hasBorder>
              <h3
                className="text-[15px] font-semibold mb-6"
                style={{ color: colors.colorBlack1 }}
              >
                Confirm ID and payment
              </h3>
              <div
                className="flex items-center justify-center h-[200px] rounded-lg bg-gray-50"
              >
                <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  Waiting for guest to submit check-in form
                </span>
              </div>
            </CanaryCard>
          ) : (
            <>
              {/* ── Confirm ID and Payment ── */}
              <div ref={(el) => { sectionRefs.current['id'] = el; sectionRefs.current['cc'] = el; }} />
              <CanaryCard hasBorder className="mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <h3
                    className="text-[15px] font-semibold"
                    style={{ color: colors.colorBlack1 }}
                  >
                    Confirm ID and payment
                  </h3>
                  {isPartial && (
                    <CanaryTag
                      label="PENDING"
                      color={TagColor.WARNING}
                      size={TagSize.COMPACT}
                    />
                  )}
                  {!isPartial && !isVerified && totalPendingChecks > 0 && (
                    <CanaryTag
                      label={`${totalPendingChecks} PENDING`}
                      color={TagColor.WARNING}
                      size={TagSize.COMPACT}
                    />
                  )}
                  {isVerified && (
                    <CanaryTag
                      label="VERIFIED"
                      color={TagColor.SUCCESS}
                      size={TagSize.COMPACT}
                    />
                  )}
                </div>

                {/* Side-by-side ID + Payment */}
                <div className="flex gap-8 flex-wrap">
                  <IDVerificationSection
                    guest={guest}
                    isVerified={isVerified}
                    isReadOnly={isReadOnly}
                  />
                  <PaymentCardSection
                    reservation={reservation}
                    isVerified={isVerified}
                    isReadOnly={isReadOnly}
                  />
                </div>
              </CanaryCard>

              {/* ── Upsells ── */}
              <div ref={(el) => { sectionRefs.current['upsells'] = el; }} />
              <CanaryCard hasBorder className="mb-6">
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
                    isSubmitted={status === 'submitted' || isVerified}
                  />
                </CanaryCard>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div
          className="w-[280px] shrink-0 border-l border-gray-200 overflow-auto p-5"
          style={{ backgroundColor: colors.colorBlack8 }}
        >
          {/* Room key */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[13px] font-semibold"
                style={{ color: colors.colorBlack2 }}
              >
                Room key
              </h4>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiPlusCircleOutline} size={0.7} color={colors.colorBlueDark1} />}
              />
            </div>
            {submission?.hasMobileKey ? (
              <div className="flex items-center gap-2">
                <Icon path={mdiKeyOutline} size={0.65} color={colors.colorBlueDark1} />
                <span className="text-[12px]" style={{ color: colors.colorBlack2 }}>
                  Mobile key active
                </span>
              </div>
            ) : (
              <span className="text-[12px]" style={{ color: colors.colorBlack4 }}>
                No keys created
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="mb-6">
            {guest.phone && (
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiPhoneOutline} size={0.65} color={colors.colorBlack4} />
                <span className="text-[12px]" style={{ color: colors.colorBlack2 }}>
                  {guest.phone}
                </span>
              </div>
            )}
            {guest.email && (
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiEmailOutline} size={0.65} color={colors.colorBlack4} />
                <span className="text-[12px] truncate" style={{ color: colors.colorBlack2 }}>
                  {guest.email}
                </span>
              </div>
            )}
            {guest.preferredLanguage && (
              <div className="flex items-center gap-2 mb-2">
                <Icon path={mdiWeb} size={0.65} color={colors.colorBlack4} />
                <span className="text-[12px]" style={{ color: colors.colorBlack2 }}>
                  {guest.preferredLanguage}
                </span>
              </div>
            )}
          </div>

          {/* Staff assignment */}
          <div className="mb-6">
            <button
              type="button"
              className="text-[12px] font-medium cursor-pointer hover:underline"
              style={{ color: colors.colorBlueDark1 }}
            >
              Assign Staff or Department
            </button>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[13px] font-semibold"
                style={{ color: colors.colorBlack2 }}
              >
                Notes
              </h4>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                size={ButtonSize.COMPACT}
                icon={<Icon path={mdiPlusCircleOutline} size={0.7} color={colors.colorBlueDark1} />}
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
    </div>
  );
}

/* ── Registration Card sub-section (inline) ─────────────────────── */

function RegistrationCardSection({
  guest,
  isSubmitted,
}: {
  guest: Guest;
  isSubmitted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3
          className="text-[15px] font-semibold"
          style={{ color: colors.colorBlack1 }}
        >
          Registration card
        </h3>
        {isSubmitted ? (
          <CanaryTag
            label="SIGNED"
            color={TagColor.SUCCESS}
            size={TagSize.COMPACT}
          />
        ) : (
          <CanaryTag
            label="NOT SIGNED"
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        )}
        <CanaryButton
          type={ButtonType.OUTLINED}
          size={ButtonSize.COMPACT}
        >
          Print
        </CanaryButton>
        <CanaryButton
          type={ButtonType.TEXT}
          size={ButtonSize.COMPACT}
          onClick={() => setExpanded(!expanded)}
          className="ml-auto"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </CanaryButton>
      </div>

      {expanded && (
        <CanaryCard hasBorder padding="medium">
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <span style={{ color: colors.colorBlack4 }}>Name</span>
              <p className="font-medium" style={{ color: colors.colorBlack1 }}>
                {guest.name}
              </p>
            </div>
            <div>
              <span style={{ color: colors.colorBlack4 }}>Email</span>
              <p className="font-medium" style={{ color: colors.colorBlack1 }}>
                {guest.email || '—'}
              </p>
            </div>
            <div>
              <span style={{ color: colors.colorBlack4 }}>Phone</span>
              <p className="font-medium" style={{ color: colors.colorBlack1 }}>
                {guest.phone || '—'}
              </p>
            </div>
            <div>
              <span style={{ color: colors.colorBlack4 }}>Language</span>
              <p className="font-medium" style={{ color: colors.colorBlack1 }}>
                {guest.preferredLanguage || '—'}
              </p>
            </div>
          </div>
        </CanaryCard>
      )}
    </div>
  );
}
