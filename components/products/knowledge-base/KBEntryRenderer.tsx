'use client';

/**
 * KBEntryRenderer — Renders a single KB entry (text or yes/no with sub-questions).
 */

import {
  CanaryInput,
  CanaryTextArea,
  CanaryChip,
  InputSize,
} from '@canary-ui/components';
import { KBEntry, KBYesNoEntry, isYesNoEntry } from '@/lib/products/knowledge-base/types';

interface KBEntryRendererProps {
  entry: KBEntry;
  onAnswerChange: (answer: string) => void;
  onYesNoChange?: (value: 'yes' | 'no') => void;
  onSubAnswerChange?: (subId: string, answer: string) => void;
}

function YesNoToggle({ value, onChange }: { value: 'yes' | 'no' | null; onChange: (val: 'yes' | 'no') => void }) {
  return (
    <div className="flex" style={{ gap: 4 }}>
      <CanaryChip
        label="Yes"
        isSelected={value === 'yes'}
        isRounded
        onClick={() => onChange('yes')}
      />
      <CanaryChip
        label="No"
        isSelected={value === 'no'}
        isRounded
        onClick={() => onChange('no')}
      />
    </div>
  );
}

export function KBEntryRenderer({ entry, onAnswerChange, onYesNoChange, onSubAnswerChange }: KBEntryRendererProps) {
  if (isYesNoEntry(entry)) {
    const yesNoEntry = entry as KBYesNoEntry;
    return (
      <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: 16, marginBottom: 16 }}>
        {/* Question + Yes/No toggle */}
        <div className="flex items-center justify-between" style={{ marginBottom: yesNoEntry.value === 'yes' && yesNoEntry.subQuestions?.length ? 12 : 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#000' }}>
            {entry.question}
          </span>
          <YesNoToggle
            value={yesNoEntry.value}
            onChange={(val) => onYesNoChange?.(val)}
          />
        </div>

        {/* Sub-questions — only show when Yes */}
        {yesNoEntry.value === 'yes' && yesNoEntry.subQuestions?.map((sq) => (
          <div key={sq.id} style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>{sq.question}</p>
            <CanaryInput
              size={InputSize.NORMAL}
              value={sq.answer}
              placeholder="Please answer as if you were answering a guest."
              onChange={(e) => onSubAnswerChange?.(sq.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    );
  }

  // Text entry
  return (
    <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: 16, marginBottom: 16 }}>
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px 0' }}>{entry.question}</p>
      <CanaryInput
        size={InputSize.NORMAL}
        value={entry.answer}
        placeholder="Please answer as if you were answering a guest."
        onChange={(e) => onAnswerChange(e.target.value)}
      />
    </div>
  );
}
