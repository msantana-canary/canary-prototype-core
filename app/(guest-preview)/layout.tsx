'use client';

/**
 * Guest Preview Layout
 *
 * Dark stage background with phone frame centered and parameter sidebar on the right.
 * No CanaryAppShell — this is a standalone configurator layout.
 */

import React from 'react';

export default function GuestPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-[#1a1a2e] flex overflow-hidden">
      {children}
    </div>
  );
}
