/**
 * UpsellsSection Component
 *
 * CanaryTable of upsell requests with Approve/Deny actions.
 * Uses TagColor enums for status, ButtonColor for action colors.
 */

'use client';

import React, { useState } from 'react';
import {
  CanaryButton,
  CanaryTag,
  CanaryTable,
  CanaryCheckbox,
  ButtonSize,
  ButtonType,
  ButtonColor,
  TagColor,
  TagSize,
  TagVariant,
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

  const columns = [
    {
      key: 'name',
      label: 'Item',
      render: (value: string) => (
        <span className="text-[13px]" style={{ color: colors.colorBlack1 }}>
          {value}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      width: '60px',
      align: 'center' as const,
      render: (value: number) => (
        <span className="text-[13px]" style={{ color: colors.colorBlack3 }}>
          {value}x
        </span>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Price',
      width: '80px',
      align: 'right' as const,
      render: (value: number, row: UpsellItem) => (
        <span className="text-[13px]" style={{ color: colors.colorBlack1 }}>
          ${(value * row.quantity).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Actions',
      width: '140px',
      align: 'right' as const,
      render: (value: string, row: UpsellItem) => (
        <div className="flex items-center justify-end gap-1.5">
          {value === 'pending' && !isReadOnly ? (
            <>
              <CanaryButton
                type={ButtonType.OUTLINED}
                size={ButtonSize.COMPACT}
                color={ButtonColor.DANGER}
                onClick={() => onDeny?.(row.id)}
              >
                Deny
              </CanaryButton>
              <CanaryButton
                type={ButtonType.PRIMARY}
                size={ButtonSize.COMPACT}
                color={ButtonColor.SUCCESS}
                onClick={() => onApprove?.(row.id)}
              >
                Approve
              </CanaryButton>
            </>
          ) : value === 'approved' ? (
            <CanaryTag
              label="Approved"
              color={TagColor.SUCCESS}
              size={TagSize.COMPACT}
              uppercase={false}
            />
          ) : value === 'denied' ? (
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
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3
          className="text-[15px] font-semibold"
          style={{ color: colors.colorBlack1 }}
        >
          Manage upsells
        </h3>
        {upsells.length === 0 ? (
          <CanaryTag
            label="NO REQUESTS"
            color={TagColor.DEFAULT}
            size={TagSize.COMPACT}
          />
        ) : pendingCount > 0 ? (
          <CanaryTag
            label={`${pendingCount} PENDING`}
            color={TagColor.WARNING}
            size={TagSize.COMPACT}
          />
        ) : (
          <CanaryTag
            label="REVIEWED"
            color={TagColor.SUCCESS}
            size={TagSize.COMPACT}
          />
        )}
      </div>

      {upsells.length === 0 ? (
        <p className="text-[13px] text-center py-4" style={{ color: colors.colorBlack4 }}>
          No requests
        </p>
      ) : (
        <>
          {/* Table */}
          <div className="mb-4">
            <CanaryTable
              columns={columns}
              data={upsells}
              emptyMessage="No upsell requests"
            />
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
            {approvedTotal > 0 && (
              <span
                className="text-[13px] font-medium"
                style={{ color: colors.colorBlack2 }}
              >
                Total approved revenue: ${approvedTotal.toFixed(2)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
