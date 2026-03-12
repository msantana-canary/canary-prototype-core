/**
 * UpsellsSection Component
 *
 * Upsell requests list with Approve/Deny actions.
 * Layout from Figma 148:8138 — column headers outside bordered list,
 * items inside rounded container with border-bottom dividers.
 */

'use client';

import React, { useState } from 'react';
import {
  CanaryButton,
  CanaryTag,
  CanaryCheckbox,
  ButtonSize,
  ButtonType,
  ButtonColor,
  TagColor,
  TagSize,
  colors,
} from '@canary-ui/components';
import { UpsellItem } from '@/lib/products/check-in/types';

interface UpsellsSectionProps {
  upsells: UpsellItem[];
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  isReadOnly: boolean;
}

export function UpsellsSection({
  upsells,
  onApprove,
  onDeny,
  isReadOnly,
}: UpsellsSectionProps) {
  const [reviewed, setReviewed] = useState(isReadOnly);
  const pendingCount = upsells.filter((u) => u.status === 'pending').length;
  const approvedTotal = upsells
    .filter((u) => u.status === 'approved')
    .reduce((sum, u) => sum + u.unitPrice * u.quantity, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span
          className="text-[18px] font-medium"
          style={{ color: colors.colorBlack1 }}
        >
          Manage upsells
        </span>
        {upsells.length > 0 && pendingCount > 0 && (
          <CanaryTag
            label={`${pendingCount} PENDING`}
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        )}
        {upsells.length > 0 && pendingCount === 0 && (
          <CanaryTag
            label="REVIEWED"
            color={TagColor.SUCCESS}
            size={TagSize.COMPACT}
          />
        )}
      </div>

      {upsells.length === 0 ? (
        <p
          className="text-[13px] text-center py-4"
          style={{ color: colors.colorBlack4 }}
        >
          No requests
        </p>
      ) : (
        <>
          {/* List with column headers + bordered items */}
          <div className="flex flex-col">
            {/* Column headers — outside bordered container */}
            <div
              className="flex items-center px-4 py-0.5"
            >
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: colors.colorBlack3, width: 240 }}
              >
                Item
              </span>
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: colors.colorBlack3, width: 80 }}
              >
                Quantity
              </span>
              <span
                className="text-[10px] font-medium uppercase"
                style={{ color: colors.colorBlack3 }}
              >
                Unit price
              </span>
            </div>

            {/* Item rows — inside bordered rounded container */}
            <div
              className="overflow-hidden"
              style={{
                border: `1px solid ${colors.colorBlack6}`,
                borderRadius: 8,
              }}
            >
              {upsells.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                  style={{
                    minHeight: 48,
                    padding: '8px 8px 8px 16px',
                    borderBottom:
                      i < upsells.length - 1
                        ? `1px solid ${colors.colorBlack6}`
                        : undefined,
                  }}
                >
                  {/* Content columns */}
                  <div className="flex items-center">
                    <span
                      className="text-[14px] truncate"
                      style={{ color: colors.colorBlack1, width: 240 }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-[14px]"
                      style={{ color: colors.colorBlack2, width: 80 }}
                    >
                      {item.quantity}x
                    </span>
                    <span
                      className="text-[14px]"
                      style={{ color: colors.colorBlack1, width: 170 }}
                    >
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && !isReadOnly ? (
                      <>
                        <CanaryButton
                          type={ButtonType.SHADED}
                          size={ButtonSize.COMPACT}
                          color={ButtonColor.DANGER}
                          onClick={() => onDeny?.(item.id)}
                        >
                          Deny
                        </CanaryButton>
                        <CanaryButton
                          type={ButtonType.PRIMARY}
                          size={ButtonSize.COMPACT}
                          onClick={() => onApprove?.(item.id)}
                        >
                          Approve
                        </CanaryButton>
                      </>
                    ) : item.status === 'approved' ? (
                      <CanaryTag
                        label="Approved"
                        color={TagColor.SUCCESS}
                        size={TagSize.COMPACT}
                        uppercase={false}
                      />
                    ) : item.status === 'denied' ? (
                      <CanaryTag
                        label="Denied"
                        color={TagColor.ERROR}
                        size={TagSize.COMPACT}
                        uppercase={false}
                      />
                    ) : (
                      <CanaryTag
                        label="Pending"
                        color={TagColor.WARNING}
                        size={TagSize.COMPACT}
                        uppercase={false}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <CanaryCheckbox
              label="Upsell requests have been reviewed"
              checked={reviewed}
              onChange={() => !isReadOnly && setReviewed(!reviewed)}
              isDisabled={isReadOnly}
              size="normal"
            />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="text-[14px]"
                style={{ color: colors.colorBlack1 }}
              >
                Total approved revenue:
              </span>
              <span
                className="text-[14px] font-medium"
                style={{ color: colors.colorBlack1 }}
              >
                ${approvedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
