/**
 * ForwardNumbersTable Component
 *
 * Displays the list of forward number rules in a table format.
 * Shows destination, phone number, match type, and description.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CanaryTag, TagSize, TagVariant, colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiDotsHorizontal } from '@mdi/js';
import { useCallsSettingsStore } from '@/lib/products/calls/store';
import type { ForwardNumberRule } from '@/lib/products/calls/types';

interface ForwardNumbersTableProps {
  onEdit: (ruleId: string) => void;
}

export function ForwardNumbersTable({ onEdit }: ForwardNumbersTableProps) {
  const { forwardNumberRules, removeForwardNumberRule } = useCallsSettingsStore();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any dropdown
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getMatchType = (rule: ForwardNumberRule): string => {
    if (rule.type === 'default') {
      return 'Default';
    } else if (rule.matchType === 'exact') {
      return 'Exact Match';
    } else {
      return 'Smart Match';
    }
  };

  const getTagColor = (
    rule: ForwardNumberRule
  ): { backgroundColor: string; fontColor: string } => {
    if (rule.type === 'default') {
      return {
        backgroundColor: colors.colorBlack7,
        fontColor: colors.colorBlack3,
      };
    } else if (rule.matchType === 'exact') {
      return {
        backgroundColor: colors.colorLightGreen5,
        fontColor: colors.colorLightGreen1,
      };
    } else {
      return {
        backgroundColor: colors.colorBlueDark5,
        fontColor: colors.colorBlueDark1,
      };
    }
  };

  const handleDropdownToggle = (ruleId: string) => {
    setOpenDropdownId(openDropdownId === ruleId ? null : ruleId);
  };

  const handleEdit = (ruleId: string) => {
    setOpenDropdownId(null);
    onEdit(ruleId);
  };

  const handleDelete = (ruleId: string) => {
    setOpenDropdownId(null);
    removeForwardNumberRule(ruleId);
  };

  if (forwardNumberRules.length === 0) {
    return (
      <div
        className="text-center py-10"
        style={{
          color: colors.colorBlack3,
          fontFamily: "'Roboto', sans-serif",
          fontSize: '14px',
        }}
      >
        No forward numbers configured yet. Click &quot;Add new&quot; to create one.
      </div>
    );
  }

  return (
    <div>
      {/* Table Header */}
      <div
        className="flex items-center gap-6 px-4 pb-2"
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          className="font-['Roboto',sans-serif] uppercase"
          style={{
            width: '200px',
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '16px',
            color: colors.colorBlack3,
          }}
        >
          Destination & Number
        </div>
        <div
          className="font-['Roboto',sans-serif] uppercase"
          style={{
            width: '100px',
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '16px',
            color: colors.colorBlack3,
          }}
        >
          Match Type
        </div>
        <div
          className="font-['Roboto',sans-serif] uppercase flex-1"
          style={{
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '16px',
            color: colors.colorBlack3,
          }}
        >
          Description
        </div>
        <div style={{ width: '32px' }}></div>
      </div>

      {/* Table Body */}
      <div
        className="rounded-lg overflow-visible"
        style={{ border: `1px solid ${colors.colorBlack6}` }}
      >
        {forwardNumberRules.map((rule, index) => {
          const tagColors = getTagColor(rule);
          const isFirst = index === 0;
          const isLast = index === forwardNumberRules.length - 1;

          return (
            <div
              key={rule.id}
              className="flex items-center gap-6 p-4"
              style={{
                backgroundColor: colors.colorWhite,
                borderTop: isFirst ? 'none' : `1px solid ${colors.colorBlack6}`,
                borderRadius: isFirst
                  ? '7px 7px 0 0'
                  : isLast
                  ? '0 0 7px 7px'
                  : '0',
              }}
            >
              {/* Destination & Number */}
              <div style={{ width: '200px' }}>
                <div
                  className="font-['Roboto',sans-serif]"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: colors.colorBlack2,
                  }}
                >
                  {rule.departmentName}
                </div>
                <div
                  className="font-['Roboto',sans-serif]"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: colors.colorBlack2,
                  }}
                >
                  {rule.phoneNumber}
                </div>
              </div>

              {/* Match Type */}
              <div style={{ width: '100px' }}>
                <CanaryTag
                  label={getMatchType(rule)}
                  size={TagSize.COMPACT}
                  variant={TagVariant.FILLED}
                  customColor={tagColors}
                />
              </div>

              {/* Description */}
              <div
                className="flex-1 font-['Roboto',sans-serif] overflow-hidden text-ellipsis"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: colors.colorBlack2,
                }}
              >
                {rule.description}
              </div>

              {/* Actions */}
              <div className="relative" style={{ width: '32px' }} data-dropdown>
                <button
                  onClick={() => handleDropdownToggle(rule.id)}
                  className="flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon path={mdiDotsHorizontal} size={0.85} color={colors.colorBlack2} />
                </button>

                {/* Dropdown Menu */}
                {openDropdownId === rule.id && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-50"
                    style={{
                      backgroundColor: colors.colorWhite,
                      border: `1px solid ${colors.colorBlack6}`,
                      minWidth: '140px',
                    }}
                  >
                    <button
                      onClick={() => handleEdit(rule.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                      style={{
                        fontSize: '14px',
                        color: colors.colorBlack1,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                      style={{
                        fontSize: '14px',
                        color: colors.colorRed1,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      Delete Number
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
