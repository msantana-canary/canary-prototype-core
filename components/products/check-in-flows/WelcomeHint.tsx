'use client';

/**
 * WelcomeHint
 *
 * First-visit orientation panel shown at the top of the landing view.
 * Coaches users through the demo narrative: switch properties to see
 * regional differences, drill into a step to edit, toggle role to see
 * hotel view.
 *
 * Dismissible via localStorage; default visible on first page load.
 */

import React, { useEffect, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiLightbulbOutline,
  mdiHandPointingRight,
  mdiCursorDefaultClickOutline,
  mdiEyeOutline,
  mdiSwapHorizontal,
} from '@mdi/js';
import { colors } from '@canary-ui/components';

const DISMISS_KEY = 'checkin-flows:welcome-dismissed';

export function WelcomeHint() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setIsVisible(true);
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="rounded-lg border mb-5 overflow-hidden"
      style={{ backgroundColor: colors.colorBlueDark5, borderColor: colors.colorBlueDark4 }}
    >
      <div className="px-5 py-4 flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md bg-white flex items-center justify-center shrink-0"
          style={{ border: `1px solid ${colors.colorBlueDark4}` }}
        >
          <Icon path={mdiLightbulbOutline} size={0.85} color={colors.colorBlueDark1} />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-[14px] font-bold mb-2"
            style={{ color: colors.colorBlueDark1 }}
          >
            Welcome — a quick orientation
          </h3>
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: colors.colorBlueDark1 }}>
            This tool lets CS configure check-in flows per property without engineering.
            Everything you change below reflects live in the <strong>Live Preview</strong> tab.
          </p>

          <ol className="space-y-1.5 text-[12px]" style={{ color: colors.colorBlueDark1 }}>
            <Step icon={mdiSwapHorizontal}>
              <strong>Switch properties</strong> in the Property bar above. Watch Italy, US, and
              Singapore produce different default flows.
            </Step>
            <Step icon={mdiCursorDefaultClickOutline}>
              <strong>Click any flow</strong> to see its steps. Each step is editable — try
              renaming a field or adding a condition.
            </Step>
            <Step icon={mdiHandPointingRight}>
              <strong>Drill into ID Capture</strong> on Hotel Milano to see per-option nationality
              conditions in action.
            </Step>
            <Step icon={mdiEyeOutline}>
              <strong>Flip to the Hotel role</strong> to see what hotel users see — mostly
              read-only, with a few explicitly-unlocked items.
            </Step>
          </ol>
        </div>

        <button
          onClick={dismiss}
          className="w-7 h-7 rounded hover:bg-white/60 flex items-center justify-center shrink-0"
          style={{ color: colors.colorBlueDark1 }}
          aria-label="Dismiss"
        >
          <Icon path={mdiClose} size={0.7} />
        </button>
      </div>
    </div>
  );
}

function Step({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icon path={icon} size={0.6} color={colors.colorBlueDark1} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
