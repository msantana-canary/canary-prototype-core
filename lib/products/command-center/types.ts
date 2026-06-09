import { MessageChannel } from '@/lib/products/messaging/types';

export type ThreadPriority = 'urgent' | 'high' | 'normal' | 'low';
export type AIThreadStatus = 'needs_response' | 'needs_attention' | 'ai_handled' | 'escalated';
export type SentimentScore = 'positive' | 'neutral' | 'negative' | 'angry';
export type ActionType = 'create_ticket' | 'send_draft' | 'offer_upgrade' | 'schedule_followup';

export interface SuggestedAction {
  type: ActionType;
  label: string;
  description: string;
}

export interface CommandCenterThread {
  id: string;
  guestId: string;
  reservationId: string;
  channel: MessageChannel;
  priority: ThreadPriority;
  aiStatus: AIThreadStatus;
  sentiment?: SentimentScore;
  lastMessage: string;
  lastMessageAt: Date;
  isUnread: boolean;
  aiSummary?: string;
  suggestedActions?: SuggestedAction[];
  isCompleted: boolean;
}

export interface CommandCenterMessage {
  id: string;
  threadId: string;
  sender: 'guest' | 'staff' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  channel?: MessageChannel;
}

export interface DigestStats {
  serviceRecovery: number;
  aiHandledOvernight: number;
  escalationsPending: number;
  avgResponseTime: string;
}

export interface GuestPreferences {
  coffeePreference?: string;
  pillow?: string;
  roomTemp?: string;
  dietaryRestrictions?: string;
  notes?: string[];
}

export interface ActivityEvent {
  id: string;
  type: 'check_in' | 'message' | 'upsell' | 'service_ticket' | 'ai_response' | 'sentiment_flag';
  description: string;
  timestamp: Date;
}
