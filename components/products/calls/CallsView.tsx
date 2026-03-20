/**
 * CallsView Component
 *
 * Main view for the Calls dashboard with filter tabs and call list.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { CanaryTabs, colors } from '@canary-ui/components';
import { CallRow } from './CallRow';
import { CallDetailsModal } from './CallDetailsModal';
import { mockCalls, getCallsByState } from '@/lib/products/calls/dashboard-mock-data';
import type { CallSummary, CallFilter } from '@/lib/products/calls/dashboard-types';

const FILTER_TABS = [
  { id: 'missed_by_front_desk', label: 'Missed by Front Desk', content: <></> },
  { id: 'completed', label: 'Completed', content: <></> },
  { id: 'active', label: 'Active', content: <></> },
];

export function CallsView() {
  const [activeFilter, setActiveFilter] = useState<CallFilter>('missed_by_front_desk');
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null);

  const filteredCalls = useMemo(() => {
    return getCallsByState(activeFilter);
  }, [activeFilter]);

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: colors.colorWhite }}
    >
      {/* Main container - 24px padding all around, scrollable */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Filter Tabs - no padding on this div */}
        <div>
          <CanaryTabs
            variant="rounded"
            size="compact"
            tabs={FILTER_TABS}
            defaultTab={activeFilter}
            onChange={(tabId) => setActiveFilter(tabId as CallFilter)}
          />
        </div>

        {/* Table Section */}
        <div>
          {/* Table Headers - Outside bordered container */}
          {activeFilter === 'completed' ? (
            <div className="grid grid-cols-[0.5fr_1.5fr_0.5fr_1fr] gap-4 px-4 pb-2">
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Guest Information
              </div>
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Summary
              </div>
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Handle Status
              </div>
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Forward Category and Reason
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[0.5fr_1.5fr_1fr] gap-4 px-4 pb-2">
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Guest Information
              </div>
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Summary
              </div>
              <div
                className="font-['Roboto',sans-serif] text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.colorBlack3 }}
              >
                Forward Category and Reason
              </div>
            </div>
          )}

          {/* Table Body - Bordered container */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${colors.colorBlack6}` }}
          >
            {filteredCalls.length === 0 ? (
              <div
                className="text-center py-12 font-['Roboto',sans-serif] text-[14px]"
                style={{ color: colors.colorBlack3, backgroundColor: colors.colorWhite }}
              >
                No calls in this category.
              </div>
            ) : (
              filteredCalls.map((call, index) => (
                <CallRow
                  key={call.uuid}
                  call={call}
                  onClick={() => setSelectedCall(call)}
                  isFirst={index === 0}
                  isLast={index === filteredCalls.length - 1}
                  viewType={activeFilter}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Call Details Modal */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}
