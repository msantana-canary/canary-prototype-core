'use client';

/**
 * Guest-Facing Check-In Configurator Page
 *
 * Wires together: PhoneFrame + CheckInFlow + ParameterSidebar
 * Route: /guest/check-in
 */

import React, { Suspense } from 'react';
import { PhoneFrame } from '@/components/core/PhoneFrame';
import { CheckInFlow } from '@/components/products/guest-preview/CheckInFlow';
import { ParameterSidebar } from '@/components/products/guest-preview/ParameterSidebar';
import { useCheckInConfigStore } from '@/lib/products/guest-preview/check-in-config-store';
import { ViewMode } from '@/lib/products/guest-preview/types';
import Icon from '@mdi/react';
import { mdiCellphoneLink, mdiMonitor, mdiArrowLeft } from '@mdi/js';
import Link from 'next/link';

function CheckInPageContent() {
  const viewMode = useCheckInConfigStore((s) => s.viewMode);
  const setViewMode = useCheckInConfigStore((s) => s.setViewMode);

  return (
    <>
      {/* Main stage area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex-shrink-0 h-[52px] flex items-center justify-between px-5 border-b border-[#2d2d44]">
          {/* Left: Back to hotel view */}
          <Link
            href="/check-in"
            className="flex items-center gap-2 text-[13px] text-[#8b8ba3] hover:text-white transition-colors"
          >
            <Icon path={mdiArrowLeft} size={0.65} />
            <span>Hotel Dashboard</span>
          </Link>

          {/* Center: Title */}
          <div className="text-[14px] font-medium text-white">
            Guest Check-In Preview
          </div>

          {/* Right: View mode toggle */}
          <div className="flex items-center gap-1 bg-[#2d2d44] rounded-lg p-1">
            <button
              onClick={() => setViewMode(ViewMode.PHONE)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                viewMode === ViewMode.PHONE
                  ? 'bg-[#4481e6] text-white'
                  : 'text-[#8b8ba3] hover:text-white'
              }`}
            >
              <Icon path={mdiCellphoneLink} size={0.55} />
              Phone
            </button>
            <button
              onClick={() => setViewMode(ViewMode.FULLSCREEN)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                viewMode === ViewMode.FULLSCREEN
                  ? 'bg-[#4481e6] text-white'
                  : 'text-[#8b8ba3] hover:text-white'
              }`}
            >
              <Icon path={mdiMonitor} size={0.55} />
              Desktop
            </button>
          </div>
        </div>

        {/* Phone frame stage */}
        <div className="flex-1 overflow-hidden p-6">
          {viewMode === ViewMode.PHONE ? (
            <PhoneFrame statusBarColor="light">
              <CheckInFlow />
            </PhoneFrame>
          ) : (
            <div className="w-full max-w-[800px] h-full mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
              <CheckInFlow />
            </div>
          )}
        </div>
      </div>

      {/* Parameter sidebar */}
      <ParameterSidebar />
    </>
  );
}

export default function GuestCheckInPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#8b8ba3] text-[14px]">Loading configurator...</div>
      </div>
    }>
      <CheckInPageContent />
    </Suspense>
  );
}
