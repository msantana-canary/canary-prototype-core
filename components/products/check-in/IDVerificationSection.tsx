/**
 * IDVerificationSection Component
 *
 * Translated from production: CheckInIdVerificationCard.vue
 *
 * Border/radius handled by parent wrapper in CheckInDetailPanel.
 * Internal padding: 16px (production .defaultContainer).
 *
 * Responsive internal layout (production .documentVerificationCardContainer):
 *   >= 1681px (side-by-side with payment): vertical — tabs → image → checks
 *   < 1681px (stacked with payment): 2-col grid — checks left, image right;
 *     tabs move inline with header row.
 *
 * Uses CSS Grid areas so a single CanaryTabs instance moves between header row
 * (stacked) and its own row (side-by-side) without duplication.
 *
 * ID image uses CR80 card ratio: 250px height × ~396px width (fixed).
 *
 * Additional guests: dot indicators in header let staff switch between guests.
 * Primary guest shows full verification (checkboxes, ID tabs).
 * Additional guests show a lighter view (name, adult/child, status, ID placeholder).
 */

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CanaryCheckbox, CanaryTag, CanaryTabs, TagColor, TagSize, colors } from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';
import { AdditionalGuest } from '@/lib/products/check-in/types';

// CR80 card dimensions (from production SCSS)
const CARD_HEIGHT = 250;
const CARD_WIDTH = Math.round(CARD_HEIGHT * (3.37 / 2.125)); // ≈ 396px
const CARD_BORDER_RADIUS = Math.round(CARD_HEIGHT * (0.125 / 2.125));

interface IDVerificationSectionProps {
  guest: Guest;
  isVerified: boolean;
  isReadOnly: boolean;
  additionalGuests?: AdditionalGuest[];
}

function IdPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_BORDER_RADIUS,
        border: `1px solid ${colors.colorBlack6}`,
        backgroundColor: colors.colorBlack7,
      }}
    >
      <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
        {label}
      </span>
    </div>
  );
}

export function IDVerificationSection({
  guest,
  isVerified,
  isReadOnly,
  additionalGuests,
}: IDVerificationSectionProps) {
  const [checks, setChecks] = useState({
    govIssued: isVerified,
    nameMatches: isVerified,
    notExpired: isVerified,
  });
  const [activeTab, setActiveTab] = useState('front');

  // Guest switching state
  const [activeGuestIndex, setActiveGuestIndex] = useState(0); // 0 = primary
  const [transitioning, setTransitioning] = useState(false);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasAdditionalGuests = additionalGuests && additionalGuests.length > 0;
  const totalGuests = 1 + (additionalGuests?.length ?? 0);
  const currentAdditionalGuest = displayedIndex > 0 && additionalGuests
    ? additionalGuests[displayedIndex - 1]
    : null;

  // Two-phase transition: fade out → swap content → fade in
  useEffect(() => {
    if (activeGuestIndex === displayedIndex) return;
    setTransitioning(true);
    transitionTimer.current = setTimeout(() => {
      setDisplayedIndex(activeGuestIndex);
      setTransitioning(false);
    }, 150);
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [activeGuestIndex, displayedIndex]);

  const toggleCheck = (key: keyof typeof checks) => {
    if (isReadOnly) return;
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pendingCount = useMemo(
    () => Object.values(checks).filter((v) => !v).length,
    [checks],
  );

  // CanaryTabs with empty content — tab headers only; image rendered separately
  const idTabs = [
    { id: 'front', label: 'Front', content: <></> },
    { id: 'back', label: 'Back', content: <></> },
    { id: 'selfie', label: 'Selfie', content: <></> },
  ];

  // Image content driven by activeTab state
  const imageContent =
    activeTab === 'front' ? (
      guest.idImage ? (
        <div
          className="overflow-hidden shrink-0"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: CARD_BORDER_RADIUS,
            border: `1px solid ${colors.colorBlack6}`,
          }}
        >
          <img
            src={guest.idImage}
            alt={`${guest.name} ID`}
            className="w-full h-full object-cover"
            style={{ backgroundColor: 'black' }}
          />
        </div>
      ) : (
        <IdPlaceholder label="ID not available" />
      )
    ) : activeTab === 'back' ? (
      <IdPlaceholder label="Back not available" />
    ) : (
      <IdPlaceholder label="Selfie not available" />
    );

  return (
    <div className="id-section" style={{ padding: 16, minWidth: 0 }}>
      <style>{`
        .id-section {
          display: grid;
          row-gap: 16px;
          column-gap: 16px;
          grid-template-areas:
            "header tabs"
            "checks image";
          grid-template-columns: 1fr auto;
          grid-template-rows: auto 1fr;
        }
        .id-section-header { grid-area: header; align-self: center; }
        .id-section-tabs { grid-area: tabs; align-self: center; justify-self: end; }
        .id-section-checks { grid-area: checks; align-self: start; }
        .id-section-image { grid-area: image; }

        /* Strip CanaryCheckbox internal padding (pl-1 pr-2 py-2) to match
           production .checkItem { height: 32px } — 4px vert padding keeps 32px total */
        .id-section-checks label {
          padding: 4px 0 !important;
        }

        @media (min-width: 1681px) {
          .id-section {
            grid-template-areas:
              "header tabs"
              "image image"
              "checks checks";
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto auto;
          }
          .id-section-tabs { justify-self: end; }
        }
      `}</style>

      {/* Header — production: .cardHeader */}
      <div className="id-section-header flex items-center gap-2">
        {/* Name + tags fade on transition; dots stay visible */}
        <div
          className="flex items-center gap-2"
          style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}
        >
          <span
            className="text-[14px] font-medium"
            style={{ color: colors.colorBlack1 }}
          >
            {displayedIndex === 0 ? 'Primary Guest' : currentAdditionalGuest?.name}
          </span>
          {displayedIndex === 0 ? (
            pendingCount > 0 ? (
              <CanaryTag
                label={`${pendingCount} Pending`}
                color={TagColor.DEFAULT}
                size={TagSize.COMPACT}
              />
            ) : (
              <CanaryTag label="Completed" size={TagSize.COMPACT} />
            )
          ) : currentAdditionalGuest ? (
            <>
              {currentAdditionalGuest.verificationStatus === 'verified' ? (
                <CanaryTag label="Verified" size={TagSize.COMPACT} />
              ) : (
                <CanaryTag label="Pending" color={TagColor.DEFAULT} size={TagSize.COMPACT} />
              )}
              <CanaryTag
                label={currentAdditionalGuest.isAdult ? 'Adult' : 'Child'}
                color={currentAdditionalGuest.isAdult ? TagColor.INFO : TagColor.WARNING}
                size={TagSize.COMPACT}
              />
            </>
          ) : null}
        </div>

        {/* Dot indicators — always visible */}
        {hasAdditionalGuests && (
          <div className="flex items-center gap-1.5 ml-1">
            {Array.from({ length: totalGuests }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveGuestIndex(i)}
                className="p-0 border-0 bg-transparent"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: i === activeGuestIndex
                    ? colors.colorBlueDark1
                    : colors.colorBlack5,
                  cursor: i === activeGuestIndex ? 'default' : 'pointer',
                  transition: 'background-color 200ms ease',
                }}
                aria-label={i === 0 ? 'Primary guest' : `Additional guest ${i}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content — transitions between primary and additional guest views */}
      {displayedIndex === 0 ? (
        <>
          {/* Primary guest: full verification view */}
          <div className="id-section-tabs" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <CanaryTabs
              tabs={idTabs}
              variant="text"
              size="compact"
              defaultTab="front"
              onChange={setActiveTab}
            />
          </div>

          <div className="id-section-checks" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <div className="flex flex-col gap-1">
              <CanaryCheckbox
                label="Verify ID is government-issued"
                checked={checks.govIssued}
                onChange={() => toggleCheck('govIssued')}
                isDisabled={isReadOnly}
                size="normal"
              />
              <CanaryCheckbox
                label="Verify name on ID"
                checked={checks.nameMatches}
                onChange={() => toggleCheck('nameMatches')}
                isDisabled={isReadOnly}
                size="normal"
              />
              <CanaryCheckbox
                label="Verify ID has not expired"
                checked={checks.notExpired}
                onChange={() => toggleCheck('notExpired')}
                isDisabled={isReadOnly}
                size="normal"
              />
            </div>
          </div>

          <div className="id-section-image" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}>{imageContent}</div>
        </>
      ) : currentAdditionalGuest ? (
        <>
          {/* Additional guest: light verification view */}
          <div className="id-section-tabs" />
          <div className="id-section-checks" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
                  ID Verification
                </span>
                {currentAdditionalGuest.verificationStatus === 'verified' ? (
                  <CanaryTag label="Verified" size={TagSize.COMPACT} />
                ) : (
                  <CanaryTag label="Pending" color={TagColor.DEFAULT} size={TagSize.COMPACT} />
                )}
              </div>
            </div>
          </div>
          <div className="id-section-image" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <IdPlaceholder
              label={
                currentAdditionalGuest.verificationStatus === 'verified'
                  ? 'ID verified'
                  : 'ID not submitted'
              }
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
