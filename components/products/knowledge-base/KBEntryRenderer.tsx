'use client';

/**
 * KBEntryRenderer — Renders a single KB entry.
 * Text entries: question label + input, separated by dividers.
 * Yes/No entries: own bordered card with sub-questions inside.
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
      <div
        style={{
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
        }}
      >
        {/* Question + Yes/No toggle */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: yesNoEntry.value === 'yes' && yesNoEntry.subQuestions?.length ? 8 : 0 }}
        >
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
          <div key={sq.id} style={{ marginTop: 12 }}>
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

  // Text entry — simple question + input with divider
  return (
    <div style={{ marginBottom: 16 }}>
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
