'use client';

/**
 * PhoneFrame — Reusable iPhone 16 Pro Max frame
 *
 * Internal canvas is always 430×932 (matching Figma).
 * Uses CSS transform to scale the entire phone to fit the container.
 * Status bar uses a clean SVG approach that renders crisply at any scale.
 * Content scrolls inside the screen area.
 */

import React, { useRef, useEffect, useState } from 'react';

// ── Fixed dimensions (iPhone 16 Pro Max @ Figma) ──
const PHONE_W = 430;
const PHONE_H = 932;
const BEZEL = 12;       // black bezel thickness
const SHELL = 4;        // titanium shell thickness
const CORNER_R = 55;    // outer corner radius
const SCREEN_R = 44;    // screen corner radius
const ISLAND_W = 126;
const ISLAND_H = 37;
const ISLAND_TOP = 14;  // from top of screen

interface PhoneFrameProps {
  children: React.ReactNode;
  showStatusBar?: boolean;
  showUrlBar?: boolean;
  url?: string;
  statusBarColor?: 'light' | 'dark'; // light = white text (for dark/gold headers), dark = black text
}

export function PhoneFrame({
  children,
  showStatusBar = true,
  showUrlBar = true,
  url = 'statlernewyork.com',
  statusBarColor = 'dark',
}: PhoneFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale: measure container and compute best-fit scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const totalW = PHONE_W + SHELL * 2 + BEZEL * 2;
    const totalH = PHONE_H + SHELL * 2 + BEZEL * 2;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const s = Math.min(width / totalW, height / totalH, 1);
      setScale(s);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalW = PHONE_W + SHELL * 2 + BEZEL * 2;
  const totalH = PHONE_H + SHELL * 2 + BEZEL * 2;
  const isLight = statusBarColor === 'light';

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <div
        style={{
          width: totalW,
          height: totalH,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {/* Titanium shell */}
        <div
          className="w-full h-full relative"
          style={{
            borderRadius: CORNER_R,
            background: 'linear-gradient(160deg, #848489 0%, #5e5e62 40%, #3a3a3c 100%)',
            padding: SHELL,
          }}
        >
          {/* Black bezel */}
          <div
            className="w-full h-full bg-black relative"
            style={{
              borderRadius: CORNER_R - SHELL,
              padding: BEZEL,
            }}
          >
            {/* Screen */}
            <div
              className="w-full h-full bg-white relative overflow-hidden flex flex-col"
              style={{ borderRadius: SCREEN_R }}
            >
              {/* Dynamic Island — centered at top of screen */}
              <div
                className="absolute z-50"
                style={{
                  width: ISLAND_W,
                  height: ISLAND_H,
                  top: ISLAND_TOP,
                  left: (PHONE_W - ISLAND_W) / 2,
                  borderRadius: ISLAND_H / 2,
                  backgroundColor: '#000',
                }}
              />

              {/* iOS Status Bar — absolutely positioned over content */}
              {showStatusBar && (
                <div
                  className="absolute top-0 left-0 right-0 z-40 flex items-end justify-between"
                  style={{ height: 54, paddingLeft: 28, paddingRight: 20, paddingBottom: 2 }}
                >
                  {/* Time */}
                  <span
                    className="text-[17px] font-semibold leading-[22px]"
                    style={{ width: 54, color: isLight ? '#fff' : '#000', fontFamily: '-apple-system, system-ui, sans-serif' }}
                  >
                    9:41
                  </span>

                  {/* Spacer for island */}
                  <div style={{ width: ISLAND_W }} />

                  {/* Signal + WiFi + Battery as inline SVG */}
                  <svg width="71" height="13" viewBox="0 0 71 13" fill="none" style={{ flexShrink: 0 }}>
                    {/* Signal bars */}
                    <rect x="0" y="9.5" width="3" height="3.5" rx="0.7" fill={isLight ? '#fff' : '#000'} />
                    <rect x="4.5" y="6.5" width="3" height="6.5" rx="0.7" fill={isLight ? '#fff' : '#000'} />
                    <rect x="9" y="3.5" width="3" height="9.5" rx="0.7" fill={isLight ? '#fff' : '#000'} />
                    <rect x="13.5" y="0" width="3" height="13" rx="0.7" fill={isLight ? '#fff' : '#000'} />
                    {/* WiFi */}
                    <circle cx="27" cy="11" r="1.2" fill={isLight ? '#fff' : '#000'} />
                    <path d="M23.5 8a5 5 0 0 1 7 0" stroke={isLight ? '#fff' : '#000'} strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M21 5.2a9 9 0 0 1 12 0" stroke={isLight ? '#fff' : '#000'} strokeWidth="1.3" strokeLinecap="round" />
                    {/* Battery */}
                    <rect x="40" y="1" width="25" height="11" rx="2.5" stroke={isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'} strokeWidth="1" />
                    <rect x="42" y="3" width="21" height="7" rx="1.5" fill={isLight ? '#fff' : '#000'} />
                    <path d="M66.5 4.5v4a2.2 2.2 0 0 0 0-4z" fill={isLight ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                  </svg>
                </div>
              )}

              {/* Scrollable content — starts at top, content is responsible for padding under status bar */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
              </div>

              {/* Safari URL Bar */}
              {showUrlBar && (
                <div className="flex-shrink-0" style={{ backgroundColor: 'rgba(242,242,247,0.94)', backdropFilter: 'blur(10px)' }}>
                  {/* URL pill */}
                  <div className="px-[22px] pt-2 pb-1">
                    <div className="bg-[rgba(255,255,255,0.95)] rounded-xl h-[44px] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="mr-1.5 opacity-50">
                        <circle cx="6.5" cy="6.5" r="5.5" stroke="#000" strokeWidth="0.8" />
                        <path d="M6.5 1v11M1 6.5h11" stroke="#000" strokeWidth="0.6" />
                      </svg>
                      <span className="text-[16px] text-black tracking-[-0.45px]" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
                        {url}
                      </span>
                    </div>
                  </div>
                  {/* Bottom toolbar */}
                  <div className="flex justify-between items-center px-5 py-[9px]">
                    {/* Back */}
                    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                      <path d="M10 2L2 10l8 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Forward */}
                    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                      <path d="M2 2l8 8-8 8" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Share */}
                    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                      <path d="M9 1v12M9 1l4 4M9 1L5 5" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {/* Bookmarks */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="2" stroke="#007AFF" strokeWidth="1.5" />
                      <path d="M3 7h14" stroke="#007AFF" strokeWidth="1.5" />
                    </svg>
                    {/* Tabs */}
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="2" y="6" width="14" height="10" rx="2" stroke="#007AFF" strokeWidth="1.5" />
                      <rect x="6" y="2" width="14" height="10" rx="2" stroke="#007AFF" strokeWidth="1.5" />
                    </svg>
                  </div>
                  {/* Home indicator */}
                  <div className="flex justify-center pb-2">
                    <div className="rounded-full bg-black" style={{ width: 139, height: 5 }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
