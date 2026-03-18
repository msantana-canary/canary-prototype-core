/**
 * Guest Journey Type Definitions
 *
 * Types for the Guest Journey messaging timeline, campaigns, and segments.
 */

// ── Journey Stages ──────────────────────────────────────────────────────

export type JourneyStage =
  | 'PRE_ARRIVAL'
  | 'ARRIVAL'
  | 'IN_HOUSE'
  | 'DEPARTURE'
  | 'POST_DEPARTURE';

export const JOURNEY_STAGES: JourneyStage[] = [
  'PRE_ARRIVAL',
  'ARRIVAL',
  'IN_HOUSE',
  'DEPARTURE',
  'POST_DEPARTURE',
];

export const STAGE_LABELS: Record<JourneyStage, string> = {
  PRE_ARRIVAL: 'Pre-Arrival',
  ARRIVAL: 'Arrival',
  IN_HOUSE: 'In-House',
  DEPARTURE: 'Departure',
  POST_DEPARTURE: 'Post-Departure',
};

// ── Message Types ───────────────────────────────────────────────────────

export type MessageType =
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'CUSTOM'
  | 'HOUSEKEEPING_SERVICE'
  | 'POST_CHECK_IN'
  | 'POST_CHECK_OUT'
  | 'PRE_DEPARTURE'
  | 'UPSELL'
  | 'MID_STAY';

/**
 * Tag labels — only some types display a tag. null = no tag shown.
 * Production: CHECK_IN → "Check-in", CHECK_OUT → "Checkout",
 * UPSELL/PRE_DEPARTURE → "Upsells", CUSTOM → "Custom", rest → no tag.
 */
export function getMessageTagLabel(type: MessageType, parentType?: MessageType | null): string | null {
  const effectiveType = parentType ?? type;
  switch (effectiveType) {
    case 'CHECK_IN': return 'Check-in';
    case 'CHECK_OUT': return 'Checkout';
    case 'UPSELL':
    case 'PRE_DEPARTURE': return 'Upsells';
    case 'CUSTOM': return 'Custom';
    default: return null; // POST_CHECK_IN, POST_CHECK_OUT, MID_STAY, HOUSEKEEPING_SERVICE
  }
}

/**
 * Tag color: CUSTOM → blue (INFO), all system types → gray (DARK).
 * Returns true if the tag should be blue (custom), false for gray (system).
 */
export function isCustomMessageType(type: MessageType, parentType?: MessageType | null): boolean {
  return (parentType ?? type) === 'CUSTOM';
}

/**
 * System messages are pre-seeded and cannot be deleted.
 * Custom messages are user-created and can be deleted.
 * Reminders (parentId set) can always be deleted.
 */
export function isSystemMessage(type: MessageType): boolean {
  return type !== 'CUSTOM';
}

export function isDeletable(message: { type: MessageType; parentId?: string }): boolean {
  return message.type === 'CUSTOM' || !!message.parentId;
}

// ── Channels ────────────────────────────────────────────────────────────

export type Channel = 'email' | 'sms' | 'whatsapp' | 'expedia' | 'booking';

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  expedia: 'Expedia',
  booking: 'Booking',
};

// ── Timing ──────────────────────────────────────────────────────────────

export type TimingDelta =
  | 'ASAP'
  | 'SAME_DAY'
  | '1_DAY'
  | '2_DAYS'
  | '3_DAYS'
  | '4_DAYS'
  | '5_DAYS'
  | '6_DAYS'
  | '1_WEEK'
  | '2_WEEKS'
  | '3_WEEKS'
  | '4_WEEKS'
  | '2_MONTHS'
  | '3_MONTHS';

export type TimingDirection = 'BEFORE' | 'AFTER';

export type TimingAnchor =
  | 'ARRIVAL'
  | 'DEPARTURE'
  | 'CHECK_IN'
  | 'CHECK_OUT';

export interface MessageTiming {
  delta: TimingDelta;
  direction: TimingDirection;
  anchor: TimingAnchor;
  sendTime?: string; // "9:00 AM", "10:00 AM", etc.
  delayMinutes?: number; // For ASAP-based timing
}

// ── Channel Content ─────────────────────────────────────────────────────

export interface ChannelContent {
  channel: Channel;
  isEnabled: boolean;
  subject?: string; // Email only
  body: string;
  language: string; // "en", "es", etc.
}

// ── WhatsApp Template Status ────────────────────────────────────────────

export type WhatsAppProviderStatus =
  | 'approved'
  | 'approved_marketing'
  | 'pending'
  | 'rejected'
  | 'unsubmitted';

export const WHATSAPP_STATUS_CONFIG: Record<WhatsAppProviderStatus, {
  label: string;
  color: 'success' | 'warning' | 'error';
  tooltip: string;
}> = {
  approved: {
    label: 'APPROVED',
    color: 'success',
    tooltip: 'This message has been approved by Meta and is ready to be sent to guests.',
  },
  approved_marketing: {
    label: 'APPROVED - MARKETING',
    color: 'warning',
    tooltip: 'Approved as Marketing message by Meta. Be aware that Marketing messages may have lower delivery rates due to user opt-outs.',
  },
  pending: {
    label: 'PENDING APPROVAL FROM META',
    color: 'warning',
    tooltip: 'While this update is under review by Meta, the currently approved version will still be sent.',
  },
  rejected: {
    label: 'REJECTED',
    color: 'error',
    tooltip: 'This template was rejected by Meta. Please review the content and resubmit.',
  },
  unsubmitted: {
    label: 'UNSUBMITTED FOR APPROVAL',
    color: 'warning',
    tooltip: 'While this update is under review by Meta, the currently approved version will still be sent.',
  },
};

// ── Guest Journey Message ───────────────────────────────────────────────

export interface GuestJourneyMessage {
  id: string;
  title: string;
  type: MessageType;
  stage: JourneyStage;
  timing: MessageTiming;
  channels: ChannelContent[];
  isEnabled: boolean;
  supportedLanguages: string[];
  segmentTarget: SegmentTargetType;
  segmentId?: string; // If targeting specific segment
  reminderCount?: number;
  parentId?: string; // For reminder sub-messages
  parentType?: MessageType | null; // Copies parent's type for tag display
  whatsappStatus?: WhatsAppProviderStatus; // Meta template approval status
}

// ── Scheduled Campaigns ─────────────────────────────────────────────────

export type CampaignCadence = 'weekly' | 'monthly';

export type WeekDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface ScheduledCampaign {
  id: string;
  title: string;
  sendTime: string; // "10:00 AM"
  repeatEvery: number; // e.g., 1 = every week/month
  cadence: CampaignCadence;
  weeklyDay?: WeekDay; // Single day for weekly
  monthlyDay?: number; // 1-31 for monthly by-date
  monthlyWeekday?: WeekDay; // For monthly by-weekday
  monthlyWeekdayOccurrence?: number; // 1-5 (1st, 2nd, 3rd, etc.)
  endCondition: 'never' | 'after_count' | 'on_date';
  endAfterCount?: number;
  endOnDate?: string;
  channels: ChannelContent[];
  isEnabled: boolean;
  supportedLanguages: string[];
  segmentTarget: SegmentTargetType;
  segmentId?: string;
  nextSendDate?: string; // e.g., "01/14/2025"
  lastRunAt?: string; // e.g., "01/07/2025"
}

// ── Segments ────────────────────────────────────────────────────────────

export type SegmentTargetType = 'ALL_GUESTS' | 'SPECIFIC_SEGMENT';

// ── Segments (Rule-based, adapted from Segment Creator) ─────────────

export const SEGMENT_PROPERTIES = [
  'Rate Code',
  'Loyalty Status',
  'Room Type',
  'Room Number',
  'Number of Nights Staying',
  'Guest Recurrence',
] as const;

export type SegmentProperty = typeof SEGMENT_PROPERTIES[number];

// Properties that use includes/excludes with multi-value input
export const MULTI_VALUE_PROPERTIES: SegmentProperty[] = ['Rate Code', 'Loyalty Status', 'Room Type', 'Room Number'];
// Properties that use is equal to/is not equal to with dropdown
export const DROPDOWN_PROPERTIES: SegmentProperty[] = ['Number of Nights Staying', 'Guest Recurrence'];

export const DROPDOWN_VALUE_OPTIONS: Record<string, string[]> = {
  'Number of Nights Staying': ['One night', 'Multiple Nights'],
  'Guest Recurrence': ['First stay', 'Return Guest'],
};

export interface SegmentRule {
  id: string;
  guestProperty: SegmentProperty | '';
  condition: string; // "includes" | "excludes" | "is equal to" | "is not equal to"
  values: string[];
  dropdownValue: string;
  operator?: 'And' | 'Or';
}

export interface Segment {
  id: string;
  name: string;
  rules: SegmentRule[];
  description?: string;
  estimatedGuests?: number;
  createdAt: number;
}

// ── Tab State ───────────────────────────────────────────────────────────

export type GuestJourneyTab = 'reservation-messages' | 'scheduled-campaigns';
