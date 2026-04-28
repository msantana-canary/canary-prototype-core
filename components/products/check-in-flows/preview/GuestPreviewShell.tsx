'use client';

/**
 * GuestPreviewShell
 *
 * Production-faithful chrome around step body content: themed CSS vars,
 * iOS status bar PNG, gold header with title + progress bar.
 *
 * Mirrors CheckInFlow.tsx from feature/guest-check-in but takes everything
 * as props so it's driven by the configurator's state, not a separate store.
 */

import React from 'react';
import { GuestProgressBar } from '@/components/core/GuestProgressBar';

interface Props {
  title: string;
  totalSegments: number;
  completedSegments: number;
  primaryColor?: string;
  backgroundColor?: string;
  fontColor?: string;
  cardBackgroundColor?: string;
  showHeader?: boolean;
  ctaLabel?: string;
  children: React.ReactNode;
}

export function GuestPreviewShell({
  title,
  totalSegments,
  completedSegments,
  primaryColor = '#926e27',
  backgroundColor = '#fcf9f4',
  fontColor = '#000000',
  cardBackgroundColor = '#ffffff',
  showHeader = true,
  ctaLabel = 'Submit',
  children,
}: Props) {
  return (
    <div
      className="flex flex-col h-full guest-theme"
      style={{
        backgroundColor,
        color: fontColor,
        fontFamily: 'Roboto, sans-serif',
        '--canaryThemeHeaderColor': primaryColor,
        '--canaryThemeButtonColor': primaryColor,
        '--canaryThemeBackgroundColor': backgroundColor,
        '--canaryThemeFontColor': fontColor,
        '--canaryThemeFontColorButton': '#ffffff',
        '--canaryThemeFontColorHeader': '#ffffff',
        '--canaryThemeCardBackgroundColor': cardBackgroundColor,
      } as React.CSSProperties}
    >
      {showHeader && (
        <div
          className="flex-shrink-0 flex flex-col items-stretch"
          style={{ backgroundColor: primaryColor }}
        >
          <img
            src="/images/ios-status-bar.png"
            alt=""
            className="w-full"
            draggable={false}
          />

          <div className="flex flex-col gap-2 p-6">
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                lineHeight: '36px',
                color: '#ffffff',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {totalSegments > 0 && (
              <div style={{ width: 124 }}>
                <GuestProgressBar
                  totalSegments={totalSegments}
                  completedSegments={completedSegments}
                  primaryColor="#ffffff"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative">
        {children}
      </div>

      <div className="flex-shrink-0" style={{ padding: '16px 24px 24px' }}>
        <button
          className="w-full text-white font-medium"
          style={{
            backgroundColor: primaryColor,
            height: 48,
            borderRadius: 4,
            fontSize: 16,
          }}
          disabled
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
