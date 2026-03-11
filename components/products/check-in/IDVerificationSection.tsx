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
 */

'use client';

import React, { useState, useMemo } from 'react';
import { CanaryCheckbox, CanaryTag, CanaryTabs, TagColor, TagSize, colors } from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';

// CR80 card dimensions (from production SCSS)
const CARD_HEIGHT = 250;
const CARD_WIDTH = Math.round(CARD_HEIGHT * (3.37 / 2.125)); // ≈ 396px
const CARD_BORDER_RADIUS = Math.round(CARD_HEIGHT * (0.125 / 2.125));

interface IDVerificationSectionProps {
  guest: Guest;
  isVerified: boolean;
  isReadOnly: boolean;
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
}: IDVerificationSectionProps) {
  const [checks, setChecks] = useState({
    govIssued: isVerified,
    nameMatches: isVerified,
    notExpired: isVerified,
  });
  const [activeTab, setActiveTab] = useState('front');

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
              "header"
              "tabs"
              "image"
              "checks";
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto auto;
          }
          .id-section-tabs { justify-self: start; }
        }
      `}</style>

      {/* Header — production: .cardHeader */}
      <div className="id-section-header flex items-center gap-4">
        <span
          className="text-[14px] font-medium"
          style={{ color: colors.colorBlack1 }}
        >
          Primary Guest
        </span>
        {pendingCount > 0 ? (
          <CanaryTag
            label={`${pendingCount} Pending`}
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        ) : (
          <CanaryTag label="Completed" size={TagSize.COMPACT} />
        )}
      </div>

      {/* Tabs — single instance, repositioned by CSS grid areas */}
      <div className="id-section-tabs">
        <CanaryTabs
          tabs={idTabs}
          variant="text"
          size="compact"
          defaultTab="front"
          onChange={setActiveTab}
        />
      </div>

      {/* Verification checks */}
      <div className="id-section-checks">
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

      {/* ID image — content driven by tab state */}
      <div className="id-section-image">{imageContent}</div>
    </div>
  );
}
