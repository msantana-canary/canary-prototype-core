/**
 * NewTopBar — Email Channel (new app-shell paradigm)
 *
 * h-52 white header sitting to the right of the nav rail. Page title left,
 * the Copilot pill centered over the content column, and the Insights /
 * guest-messages-today cluster on the right. All inert in Phase 1 (the
 * Copilot draft-reply moment is Phase 2).
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { colors } from '@canary-ui/components';
import { mdiWaveform, mdiChartBoxOutline, mdiChevronRight } from '@mdi/js';
import { shellTokens } from './shell-tokens';

// Hidden on the baseline per Miguel (7/16): the top bar is "product name +
// Insights only" for now — Copilot is AI-forward material. The AI fork flips
// this to true to bring the pill back.
const SHOW_COPILOT = false;

export function NewTopBar() {
  return (
    <div
      className="relative flex items-center justify-between shrink-0"
      style={{
        height: 52,
        backgroundColor: colors.colorWhite,
        borderBottom: `1px solid ${colors.colorBlack6}`,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Left: page title */}
      <span
        className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
        style={{ color: colors.colorBlack1 }}
      >
        Email
      </span>

      {/* Center: Copilot pill (centered inside the bar, which already sits right of the sidebar) */}
      {SHOW_COPILOT && (
      <div className="absolute left-1/2 -translate-x-1/2">
        <div
          className="flex items-center gap-2 rounded-full"
          style={{
            height: 28,
            paddingLeft: 12,
            paddingRight: 12,
            border: `1px solid ${shellTokens.copilotBorder}`,
            backgroundColor: colors.colorWhite,
            backgroundImage: shellTokens.copilotTint,
          }}
        >
          <Icon path={mdiWaveform} size={0.66} color={shellTokens.copilotGradientFrom} />
          <span className="font-['Roboto',sans-serif] font-medium text-[14px] bg-gradient-to-r from-[#465FF5] via-[#8E4FD6] to-[#DB3535] bg-clip-text text-transparent">
            Copilot
          </span>
          <span style={{ width: 1, height: 10, backgroundColor: colors.colorBlack6 }} />
          <span className="font-['Roboto',sans-serif] font-medium text-[14px] bg-gradient-to-r from-[#465FF5] via-[#8E4FD6] to-[#DB3535] bg-clip-text text-transparent">
            2 items need attention
          </span>
        </div>
      </div>
      )}

      {/* Right: Insights + guest messages today */}
      <div className="flex items-center gap-3">
        <Icon path={mdiChartBoxOutline} size={0.5} color={colors.colorBlack3} />
        <span
          className="font-['Roboto',sans-serif] text-[14px]"
          style={{ color: colors.colorBlack3 }}
        >
          Insights
        </span>
        <span style={{ width: 1, height: 12, backgroundColor: colors.colorBlack6 }} />
        <span className="font-['Roboto',sans-serif] text-[14px]" style={{ color: colors.colorBlack1 }}>
          <span className="font-bold">106</span> guest messages today
        </span>
        <Icon path={mdiChevronRight} size={0.66} color={colors.colorBlack1} />
      </div>
    </div>
  );
}
