/**
 * IDVerificationSection Component
 *
 * Production layout: header row (title + pending tag), then two-column
 * content with verification checks LEFT and ID image RIGHT.
 * Uses CanaryTabs text variant for Front/Back/Selfie.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { CanaryCheckbox, CanaryTag, CanaryTabs, TagColor, TagSize, colors } from '@canary-ui/components';
import { Guest } from '@/lib/core/types/guest';

interface IDVerificationSectionProps {
  guest: Guest;
  isVerified: boolean;
  isReadOnly: boolean;
}

function IdPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-[200px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
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

  const toggleCheck = (key: keyof typeof checks) => {
    if (isReadOnly) return;
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pendingCount = useMemo(
    () => Object.values(checks).filter((v) => !v).length,
    [checks],
  );

  const idTabs = [
    {
      id: 'front',
      label: 'Front',
      content: guest.idImage ? (
        <img
          src={guest.idImage}
          alt={`${guest.name} ID`}
          className="w-full rounded-lg border border-gray-200 object-contain"
        />
      ) : (
        <IdPlaceholder label="ID not available" />
      ),
    },
    {
      id: 'back',
      label: 'Back',
      content: <IdPlaceholder label="Back not available" />,
    },
    {
      id: 'selfie',
      label: 'Selfie',
      content: <IdPlaceholder label="Selfie not available" />,
    },
  ];

  return (
    <div className="flex-1 min-w-[420px]">
      {/* Sub-section header */}
      <div className="flex items-center gap-2 mb-3">
        <h4
          className="text-[13px] font-medium"
          style={{ color: colors.colorBlack2 }}
        >
          Primary Guest
        </h4>
        {pendingCount > 0 && (
          <CanaryTag
            label={`${pendingCount} Pending`}
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        )}
      </div>

      {/* flex-wrap-reverse: when wide enough → checks left, image right.
          When narrow → image wraps to top row, checks below. */}
      <div className="flex flex-wrap-reverse gap-4">
        {/* Checks — appears left when horizontal, below when stacked */}
        <div className="flex flex-col gap-2.5">
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

        {/* Image — fixed min-width, appears right when horizontal, on top when stacked */}
        <div className="flex-1 min-w-[280px]">
          <CanaryTabs
            tabs={idTabs}
            variant="text"
            size="compact"
            defaultTab="front"
          />
        </div>
      </div>
    </div>
  );
}
