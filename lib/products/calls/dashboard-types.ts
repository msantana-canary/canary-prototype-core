/**
 * Calls Types
 *
 * Type definitions for the Calls dashboard.
 */

export type CallTerminalState =
  | 'handled'
  | 'transferred'
  | 'blocked'
  | 'failed'
  | 'voicemail'
  | 'abandoned';

export type CallDerivedState = 'active' | 'completed' | 'missed_by_front_desk';

export interface CallGuest {
  name?: string;
  phone_number: string;
  arrival_date?: string;
  departure_date?: string;
  loyalty_label?: string;
}

export interface CallDetails {
  summary?: string;
  forward_category?: string;
  forward_reason?: string;
}

export interface CallTranscriptEntry {
  speaker: 'agent' | 'guest';
  text: string;
  timestamp: string;
}

export interface AnsweredQuestion {
  questionId: string;
  question: string;
  answer: string;
}

export interface CallSummary {
  uuid: string;
  terminal_state?: CallTerminalState;
  derived_state: CallDerivedState;
  phone_number: string;
  call_start_date: string;
  call_duration_seconds?: number;
  guest?: CallGuest;
  call?: CallDetails;
  transcript?: CallTranscriptEntry[];
  answeredQuestions?: AnsweredQuestion[];
}

export type CallFilter = 'missed_by_front_desk' | 'completed' | 'active';
