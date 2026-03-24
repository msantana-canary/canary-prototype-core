'use client';

/**
 * PhoneFrame — Reusable CSS-only iPhone 16 Pro Max frame
 *
 * 430×932px viewport matching Figma frames.
 * Features: Dynamic Island, status bar, Safari URL bar, home indicator.
 * Content scrolls within the screen area.
 */

import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
  showStatusBar?: boolean;
  showUrlBar?: boolean;
  url?: string;
}

export function PhoneFrame({
  children,
  scale = 1,
  showStatusBar = true,
  showUrlBar = true,
  url = 'statlernewyork.com',
}: PhoneFrameProps) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 430 * scale,
        height: 932 * scale,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* Outer shell — titanium gradient */}
      <div
        className="absolute inset-0 rounded-[60px]"
        style={{
          background: 'linear-gradient(145deg, #8a8a8f 0%, #636366 50%, #48484a 100%)',
          padding: 4,
        }}
      >
        {/* Black bezel */}
        <div
          className="w-full h-full rounded-[56px] bg-black relative overflow-hidden"
          style={{ padding: 6 }}
        >
          {/* Screen */}
          <div className="w-full h-full rounded-[50px] bg-white relative overflow-hidden flex flex-col">
            {/* Dynamic Island */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-50">
              <div
                className="bg-black rounded-full"
                style={{ width: 124, height: 36 }}
              />
            </div>

            {/* Status Bar */}
            {showStatusBar && (
              <div
                className="flex-shrink-0 flex items-end justify-between px-8 relative z-40"
                style={{ height: 58, paddingBottom: 4 }}
              >
                {/* Time */}
                <span className="text-[15px] font-semibold text-black w-[54px]">
                  9:42
                </span>
                {/* Center spacer for Dynamic Island */}
                <div style={{ width: 124 }} />
                {/* Right indicators */}
                <div className="flex items-center gap-[5px]">
                  {/* Signal bars */}
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <rect x="0" y="9" width="3" height="3" rx="0.5" fill="black" />
                    <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="black" />
                    <rect x="9" y="3" width="3" height="9" rx="0.5" fill="black" />
                    <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="black" />
                  </svg>
                  {/* WiFi */}
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" fill="black" />
                    <path d="M4.7 7.8a4.7 4.7 0 016.6 0" stroke="black" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2.1 5.2a8 8 0 0111.8 0" stroke="black" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {/* Battery */}
                  <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
                    <rect x="0.5" y="0.5" width="22" height="11" rx="2" stroke="black" strokeOpacity="0.35" />
                    <rect x="2" y="2" width="19" height="8" rx="1" fill="black" />
                    <path d="M24 4v4a2 2 0 000-4z" fill="black" fillOpacity="0.4" />
                  </svg>
                </div>
              </div>
            )}

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {children}
            </div>

            {/* Safari URL Bar */}
            {showUrlBar && (
              <div className="flex-shrink-0 bg-[#f2f2f7] border-t border-[#c6c6c8]">
                {/* URL pill */}
                <div className="px-4 pt-2 pb-1">
                  <div className="bg-white rounded-full h-[36px] flex items-center justify-center border border-[#e0e0e0]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mr-1.5">
                      <path d="M1 6a5 5 0 1110 0A5 5 0 011 6z" stroke="#8e8e93" strokeWidth="1" />
                      <path d="M6 1v10M1 6h10M1.8 3.5h8.4M1.8 8.5h8.4" stroke="#8e8e93" strokeWidth="0.7" />
                    </svg>
                    <span className="text-[14px] text-[#8e8e93]">{url}</span>
                  </div>
                </div>
                {/* Bottom toolbar icons */}
                <div className="flex justify-between items-center px-8 py-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 10H5M5 10l4.5-4.5M5 10l4.5 4.5" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10h10M15 10l-4.5-4.5M15 10l-4.5 4.5" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3v8M10 3l3.5 3.5M10 3L6.5 6.5M4 13v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="#007AFF" strokeWidth="1.5" />
                    <path d="M4 8h12" stroke="#007AFF" strokeWidth="1.5" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="5" width="14" height="10" rx="2" stroke="#007AFF" strokeWidth="1.5" />
                    <rect x="6" y="8" width="8" height="4" rx="1" stroke="#007AFF" strokeWidth="1" />
                  </svg>
                </div>
                {/* Home indicator */}
                <div className="flex justify-center pb-2">
                  <div className="w-[134px] h-[5px] bg-black rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
