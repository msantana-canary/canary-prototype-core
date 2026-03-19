/**
 * Knowledge Base Types
 */

export interface KBTextEntry {
  id: string;
  question: string;
  answer: string;
}

export interface KBYesNoEntry {
  id: string;
  question: string;
  value: 'yes' | 'no' | null;
  subQuestions?: KBTextEntry[];
}

export type KBEntry = KBTextEntry | KBYesNoEntry;

export function isYesNoEntry(entry: KBEntry): entry is KBYesNoEntry {
  return 'value' in entry;
}

export interface KBCategory {
  id: string;
  title: string;
  entries: KBEntry[];
}

export interface SegmentTag {
  type: 'loyalty' | 'rate_code' | 'room_type' | 'hotel';
  value: string;      // e.g. "platinum-elite", "CORP", "King Suite", "IC Berlin"
  label: string;      // Display label
}

export interface CustomContextEntry {
  id: string;
  text: string;
  segmentTags?: SegmentTag[];
}
