/**
 * Guest Journey Utilities
 *
 * Timing label formatter and stage helpers.
 */

import { MessageTiming, TimingDelta, JourneyStage, STAGE_LABELS } from './types';

const DELTA_LABELS: Record<TimingDelta, string> = {
  ASAP: 'ASAP',
  SAME_DAY: 'Same day',
  '1_DAY': '1 day',
  '2_DAYS': '2 days',
  '3_DAYS': '3 days',
  '4_DAYS': '4 days',
  '5_DAYS': '5 days',
  '6_DAYS': '6 days',
  '1_WEEK': '1 week',
  '2_WEEKS': '2 weeks',
  '3_WEEKS': '3 weeks',
  '4_WEEKS': '4 weeks',
  '2_MONTHS': '2 months',
  '3_MONTHS': '3 months',
};

const ANCHOR_LABELS: Record<string, string> = {
  ARRIVAL: 'arrival',
  DEPARTURE: 'departure',
  CHECK_IN: 'check-in',
  CHECK_OUT: 'checkout',
};

/**
 * Structured timing label with separate lines for timeline display.
 * Production uses <br> to split "14 days" and "before arrival" on separate lines.
 */
export interface TimingLabel {
  lines: string[];
}

/**
 * Convert a MessageTiming to structured multi-line label.
 * Returns lines array matching production format.
 */
export function timingToLabel(timing: MessageTiming): TimingLabel {
  const anchor = ANCHOR_LABELS[timing.anchor] || timing.anchor;
  const direction = timing.direction.toLowerCase();

  if (timing.delta === 'ASAP') {
    if (timing.delayMinutes) {
      return { lines: [`${timing.delayMinutes}min ${direction} ${anchor}`] };
    }
    return { lines: [`ASAP ${direction} ${anchor}`] };
  }

  if (timing.delta === 'SAME_DAY') {
    if (timing.anchor === 'ARRIVAL' || timing.anchor === 'CHECK_IN') {
      return { lines: ['Day of arrival'] };
    }
    if (timing.anchor === 'DEPARTURE' || timing.anchor === 'CHECK_OUT') {
      return { lines: ['Day of departure'] };
    }
    return { lines: ['Same day'] };
  }

  const delta = DELTA_LABELS[timing.delta] || timing.delta;
  return {
    lines: [
      `${delta}`,
      `${direction} ${anchor}`,
    ],
  };
}

/**
 * Get the display label for a stage.
 */
export function getStageLabel(stage: JourneyStage): string {
  return STAGE_LABELS[stage];
}

/**
 * Format a channel list into a summary string.
 */
export function formatChannelSummary(channels: { channel: string; isEnabled: boolean }[]): string {
  const enabled = channels.filter((c) => c.isEnabled);
  if (enabled.length === 0) return 'No channels';
  if (enabled.length <= 2) {
    return enabled.map((c) => c.channel === 'sms' ? 'SMS' : c.channel === 'whatsapp' ? 'WhatsApp' : c.channel.charAt(0).toUpperCase() + c.channel.slice(1)).join(', ');
  }
  const first = enabled[0].channel === 'sms' ? 'SMS' : enabled[0].channel.charAt(0).toUpperCase() + enabled[0].channel.slice(1);
  return `${first} + ${enabled.length - 1} more`;
}
