/**
 * CallsNav Component
 *
 * Navigation bar for Calls product with tabs (Call History, Insights).
 */

'use client';

import React from 'react';
import { colors } from '@canary-ui/components';

export function CallsNav() {
  // Call History is always active for now
  const activeTab = 'call-history';

  const segments = [
    {
      id: 'call-history' as const,
      label: 'Call History',
      href: '/calls',
    },
    {
      id: 'insights' as const,
      label: 'Insights',
      href: '#',
    },
  ];

  return (
    <div style={{ backgroundColor: colors.colorBlack6 }}>
      <div className="h-[60px] px-6 py-2 flex items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center">
          {segments.map((segment) => {
            const isActive = activeTab === segment.id;
            return (
              <button
                key={segment.id}
                onClick={() => {
                  if (segment.href !== '#') {
                    // Navigate only if href is not #
                  }
                }}
                className="flex flex-col items-start overflow-clip relative shrink-0 focus:outline-none transition-all duration-200"
              >
                <div className="flex items-center justify-center px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-black/5 focus-within:bg-black/5">
                  <span
                    className="font-medium font-['Roboto',sans-serif] text-center whitespace-nowrap"
                    style={{
                      fontSize: '16px',
                      color: isActive ? colors.colorBlueDark1 : colors.colorBlack2,
                      lineHeight: '24px',
                    }}
                  >
                    {segment.label}
                  </span>
                </div>
                <div
                  className="w-full h-1"
                  style={{
                    backgroundColor: isActive ? colors.colorBlueDark1 : 'transparent',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
