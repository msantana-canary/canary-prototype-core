'use client';

/**
 * SegmentList
 *
 * Proper bordered table with rounded corners, 52px rows,
 * uppercase 10px headers, overflow menu per row.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiDotsHorizontal } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { Segment } from '@/lib/products/guest-journey/types';
import { countSegmentGuests } from '@/lib/products/guest-journey/segment-evaluator';

interface SegmentListProps {
  segments: Segment[];
  onEdit: (segmentId: string) => void;
  onDelete: (segmentId: string) => void;
  onCreate: () => void;
}

function getSegmentDetails(segment: Segment): string {
  return segment.rules
    .map((r) => r.guestProperty)
    .filter(Boolean)
    .join(', ') || '—';
}

const WHERE_USED: Record<string, string> = {
  'seg-vip': 'Check-in, Checkout, Upsells',
  'seg-long-stay': 'Check-in, Checkout',
  'seg-weekend': 'Guest Journey, Upsells',
  'seg-corporate': 'Check-in, Checkout, In-House',
  'seg-nonmembers': 'Guest Journey, Broadcasts',
};

export function SegmentList({ segments, onEdit, onDelete, onCreate }: SegmentListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const lastIdx = segments.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          Segments
        </h1>
        <CanaryButton type={ButtonType.PRIMARY} onClick={onCreate}>
          Create Segment
        </CanaryButton>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto" style={{ padding: 24, backgroundColor: '#FAFAFA' }}>
        {segments.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ backgroundColor: '#F0F0F0', borderRadius: 4, minHeight: 200 }}
          >
            <p style={{ fontSize: 14, color: '#999' }}>No segments created yet</p>
          </div>
        ) : (
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th
                  className="text-left font-['Roboto',sans-serif]"
                  style={{ fontSize: 10, lineHeight: '1.5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', padding: '0 16px 12px' }}
                >
                  Segment Name
                </th>
                <th
                  className="text-left font-['Roboto',sans-serif]"
                  style={{ fontSize: 10, lineHeight: '1.5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', padding: '0 16px 12px' }}
                >
                  Segment Details
                </th>
                <th
                  className="text-left font-['Roboto',sans-serif]"
                  style={{ fontSize: 10, lineHeight: '1.5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', padding: '0 16px 12px' }}
                >
                  Where It&apos;s Used
                </th>
                <th
                  className="text-left font-['Roboto',sans-serif]"
                  style={{ fontSize: 10, lineHeight: '1.5', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', padding: '0 16px 12px' }}
                >
                  Est. Guests in Segment
                </th>
                <th style={{ width: 40, paddingBottom: 12 }} />
              </tr>
            </thead>
            <tbody>
              {segments.map((segment, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === lastIdx;

                return (
                  <tr
                    key={segment.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ height: 52, backgroundColor: '#FFF' }}
                    onClick={() => onEdit(segment.id)}
                  >
                    {/* Name */}
                    <td
                      className="font-['Roboto',sans-serif]"
                      style={{
                        fontSize: 14,
                        color: '#000',
                        padding: '0 16px',
                        borderTop: isFirst ? '1px solid #E5E5E5' : 'none',
                        borderBottom: '1px solid #E5E5E5',
                        borderLeft: '1px solid #E5E5E5',
                        borderTopLeftRadius: isFirst ? 8 : 0,
                        borderBottomLeftRadius: isLast ? 8 : 0,
                      }}
                    >
                      {segment.name}
                    </td>

                    {/* Details */}
                    <td
                      className="font-['Roboto',sans-serif]"
                      style={{
                        fontSize: 14,
                        color: '#333',
                        padding: '0 16px',
                        borderTop: isFirst ? '1px solid #E5E5E5' : 'none',
                        borderBottom: '1px solid #E5E5E5',
                      }}
                    >
                      {getSegmentDetails(segment)}
                    </td>

                    {/* Where used */}
                    <td
                      className="font-['Roboto',sans-serif]"
                      style={{
                        fontSize: 14,
                        color: '#333',
                        padding: '0 16px',
                        borderTop: isFirst ? '1px solid #E5E5E5' : 'none',
                        borderBottom: '1px solid #E5E5E5',
                      }}
                    >
                      {WHERE_USED[segment.id] || 'Guest Journey'}
                    </td>

                    {/* Est guests */}
                    <td
                      className="font-['Roboto',sans-serif]"
                      style={{
                        fontSize: 14,
                        color: '#000',
                        padding: '0 16px',
                        borderTop: isFirst ? '1px solid #E5E5E5' : 'none',
                        borderBottom: '1px solid #E5E5E5',
                      }}
                    >
                      {countSegmentGuests(segment)}
                    </td>

                    {/* Overflow menu */}
                    <td
                      className="relative"
                      style={{
                        padding: '0 8px',
                        borderTop: isFirst ? '1px solid #E5E5E5' : 'none',
                        borderBottom: '1px solid #E5E5E5',
                        borderRight: '1px solid #E5E5E5',
                        borderTopRightRadius: isFirst ? 8 : 0,
                        borderBottomRightRadius: isLast ? 8 : 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                        onClick={() => setMenuOpenId(menuOpenId === segment.id ? null : segment.id)}
                      >
                        <Icon path={mdiDotsHorizontal} size={0.85} color="#666" />
                      </button>
                      {menuOpenId === segment.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 36,
                            right: 8,
                            backgroundColor: '#FFF',
                            border: '1px solid #E5E5E5',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            zIndex: 50,
                            minWidth: 120,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50"
                            style={{ color: '#333', border: 'none', background: 'none', cursor: 'pointer', display: 'block' }}
                            onClick={() => {
                              setMenuOpenId(null);
                              onEdit(segment.id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50"
                            style={{ color: '#E40046', border: 'none', background: 'none', cursor: 'pointer', display: 'block' }}
                            onClick={() => {
                              setMenuOpenId(null);
                              setDeleteConfirmId(segment.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation */}
      <CanaryModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete segment"
        size="small"
      >
        <p style={{ fontSize: 14, color: '#333', margin: '0 0 24px', lineHeight: '1.5' }}>
          Are you sure you want to delete this segment? Any messages using this segment will fall back to &quot;All Guests&quot;.
        </p>
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton type={ButtonType.OUTLINED} onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            color={ButtonColor.DANGER}
            onClick={() => {
              if (deleteConfirmId) onDelete(deleteConfirmId);
              setDeleteConfirmId(null);
            }}
          >
            Delete
          </CanaryButton>
        </div>
      </CanaryModal>
    </div>
  );
}
