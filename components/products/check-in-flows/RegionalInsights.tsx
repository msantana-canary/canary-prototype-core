'use client';

/**
 * RegionalInsights
 *
 * Summarizes the regionally-specific and brand-specific bits of the
 * current property's flows. Highlights what will differ from a "vanilla"
 * US independent hotel. This is what the demo uses to pitch the
 * configuration-driven architecture: toggle properties and watch these
 * insights change in real time.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiScaleBalance,
  mdiShieldCheckOutline,
  mdiStarOutline,
  mdiLanguageRust,
  mdiAccountMultipleOutline,
  mdiTranslate,
  mdiAlertCircleOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';

import { useCurrentProperty, useFlowsForCurrentProperty } from '@/lib/products/check-in-flows/store';
import { resolveText } from '@/lib/products/check-in-flows/types';

interface Insight {
  icon: string;
  label: string;
  detail: string;
  highlight?: 'compliance' | 'brand' | 'feature';
}

const HIGHLIGHT_STYLE: Record<NonNullable<Insight['highlight']>, React.CSSProperties> = {
  compliance: { backgroundColor: '#FFF5E5', borderColor: '#F4CC66' },
  brand: { backgroundColor: colors.colorBlueDark5, borderColor: colors.colorBlueDark4 },
  feature: { backgroundColor: '#F4F4F5', borderColor: '#E5E5E5' },
};

const HIGHLIGHT_ICON_COLOR: Record<NonNullable<Insight['highlight']>, string> = {
  compliance: '#8B6914',
  brand: colors.colorBlueDark1,
  feature: '#666',
};

export function RegionalInsights() {
  const property = useCurrentProperty();
  const flows = useFlowsForCurrentProperty();
  const mainFlows = flows.filter((f) => f.kind === 'main');

  const insights: Insight[] = [];

  // Compliance
  if (property.features.hasAlloggiatiCompliance) {
    insights.push({
      icon: mdiScaleBalance,
      label: 'Italian Alloggiati compliance',
      detail: 'Law 773/1931 requires nationality-gated ID collection and disclosure to Polizia di Stato within 24 hours.',
      highlight: 'compliance',
    });
  }
  if (property.features.hasStbCompliance) {
    insights.push({
      icon: mdiScaleBalance,
      label: 'Singapore Tourism Board (STB)',
      detail: 'STB requires guest-stay registry submission. A dedicated step is added to the check-in flow.',
      highlight: 'compliance',
    });
  }

  // Brand perks
  if (property.features.hasIdEncodeIntegration) {
    insights.push({
      icon: mdiShieldCheckOutline,
      label: 'ENCODE ID verification',
      detail: `Brand perk (${property.brand ?? 'Wyndham'}) — ID verification runs via ENCODE provider with enhanced fraud checks.`,
      highlight: 'brand',
    });
  }

  // Loyalty
  if (property.features.hasLoyaltyProgram) {
    insights.push({
      icon: mdiStarOutline,
      label: 'Loyalty program',
      detail: 'Conditional Loyalty Welcome step greets members with tier-appropriate perks.',
      highlight: 'feature',
    });
  }

  // Multi-language
  if (property.defaultLanguages.length > 1) {
    insights.push({
      icon: mdiTranslate,
      label: `${property.defaultLanguages.length} supported languages`,
      detail: `All copy is translated into ${property.defaultLanguages.map((l) => l.toUpperCase()).join(', ')} by default.`,
      highlight: 'feature',
    });
  }

  // Accompanying guests
  if (property.features.hasAccompanyingGuests) {
    insights.push({
      icon: mdiAccountMultipleOutline,
      label: 'Accompanying guests',
      detail: 'Nested flow collects details for additional guests — loops per guest until complete.',
      highlight: 'feature',
    });
  }

  // Flow stats summary
  const totalSteps = mainFlows.reduce((sum, f) => sum + f.steps.length, 0);
  const totalConditions = mainFlows.reduce(
    (sum, f) =>
      sum + f.steps.reduce((s, step) => s + (step.conditions?.length ?? 0), 0),
    0
  );

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5]">
      <div className="px-5 py-3 border-b border-[#EEE] flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
          Regional &amp; Brand Insights
        </h3>
        <div className="flex items-center gap-3 text-[11px] text-[#888]">
          <span>
            <strong className="text-[#2B2B2B]">{mainFlows.length}</strong> main flows
          </span>
          <span>
            <strong className="text-[#2B2B2B]">{totalSteps}</strong> steps
          </span>
          <span>
            <strong className="text-[#2B2B2B]">{totalConditions}</strong> conditions
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {insights.map((insight, idx) => {
          const style = insight.highlight ? HIGHLIGHT_STYLE[insight.highlight] : undefined;
          const iconColor = insight.highlight ? HIGHLIGHT_ICON_COLOR[insight.highlight] : '#666';
          return (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-md border p-3"
              style={style}
            >
              <div
                className="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 border border-white/70"
              >
                <Icon path={insight.icon} size={0.75} color={iconColor} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[#2B2B2B]">{insight.label}</div>
                <div className="text-[11px] text-[#555] mt-0.5 leading-snug">{insight.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
