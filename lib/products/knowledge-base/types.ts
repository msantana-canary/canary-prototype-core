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

export interface CustomContextEntry {
  id: string;
  text: string;
  segmentIds?: string[];  // References segment IDs from guest-journey store
}
