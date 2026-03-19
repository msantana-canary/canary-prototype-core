'use client';

/**
 * Knowledge Base Settings Page
 *
 * AI context management — hotels populate information that powers
 * Canary's AI chat and voice products.
 *
 * Includes segment tagging for custom context entries — tag statements
 * with loyalty tier, rate code, room type, or hotel to scope AI context
 * to specific guest segments.
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import { mdiDeleteOutline, mdiTagOutline, mdiTag, mdiCloseCircle } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  CanaryInput,
  CanaryTag,
  CanaryCheckbox,
  ButtonType,
  ButtonSize,
  ButtonColor,
  InputSize,
  TagSize,
  colors,
} from '@canary-ui/components';
import { useKBStore } from '@/lib/products/knowledge-base/store';
import { isYesNoEntry, SegmentTag } from '@/lib/products/knowledge-base/types';
import { KBSection } from '@/components/products/knowledge-base/KBSection';
import { KBEntryRenderer } from '@/components/products/knowledge-base/KBEntryRenderer';

// ── Segment tag option definitions ──────────────────────────────────────

type TagType = SegmentTag['type'];

interface TagOption {
  value: string;
  label: string;
}

const TAG_TYPE_LABELS: Record<TagType, string> = {
  loyalty: 'Loyalty Tier',
  rate_code: 'Rate Code',
  room_type: 'Room Type',
  hotel: 'Hotel',
};

const TAG_TYPE_OPTIONS: Record<TagType, TagOption[]> = {
  loyalty: [
    { value: 'diamond-elite', label: 'Diamond Elite' },
    { value: 'platinum-elite', label: 'Platinum Elite' },
    { value: 'gold-elite', label: 'Gold Elite' },
    { value: 'silver-elite', label: 'Silver Elite' },
    { value: 'club-member', label: 'Club Member' },
  ],
  rate_code: [
    { value: 'CORP', label: 'CORP' },
    { value: 'BAR', label: 'BAR' },
    { value: 'GOV', label: 'GOV' },
    { value: 'AAA', label: 'AAA' },
    { value: 'RACK', label: 'RACK' },
  ],
  room_type: [
    { value: 'king-suite', label: 'King Suite' },
    { value: 'king', label: 'King' },
    { value: 'double-queen', label: 'Double Queen' },
    { value: 'standard', label: 'Standard' },
  ],
  hotel: [
    { value: 'the-grand-hotel', label: 'The Grand Hotel' },
    { value: 'ic-berlin', label: 'IC Berlin' },
    { value: 'statler-new-york', label: 'Statler New York' },
  ],
};

// ── Color helpers for segment tag pills ────────────────────────────────

function getSegmentTagCustomColor(tag: SegmentTag): {
  backgroundColor: string;
  borderColor: string;
  fontColor: string;
} {
  if (tag.type === 'loyalty') {
    switch (tag.value) {
      case 'diamond-elite':
        return { backgroundColor: '#F0F0F0', borderColor: '#333333', fontColor: '#333333' };
      case 'platinum-elite':
        return { backgroundColor: '#F0F0F0', borderColor: '#666666', fontColor: '#666666' };
      case 'gold-elite':
        return { backgroundColor: '#FFF8EC', borderColor: '#D4A017', fontColor: '#96720B' };
      case 'silver-elite':
        return { backgroundColor: '#F0F0F0', borderColor: '#999999', fontColor: '#666666' };
      case 'club-member':
        return { backgroundColor: '#E8F4FF', borderColor: '#1C91FA', fontColor: '#0D6BBF' };
      default:
        return { backgroundColor: '#F0F0F0', borderColor: '#999999', fontColor: '#666666' };
    }
  }
  if (tag.type === 'rate_code') {
    return { backgroundColor: colors.colorBlueDark5, borderColor: colors.colorBlueDark3, fontColor: colors.colorBlueDark1 };
  }
  if (tag.type === 'room_type') {
    return { backgroundColor: '#F0F0F0', borderColor: '#999999', fontColor: '#666666' };
  }
  if (tag.type === 'hotel') {
    return { backgroundColor: colors.colorPurple5, borderColor: colors.colorPurple3, fontColor: colors.colorPurple1 };
  }
  return { backgroundColor: '#F0F0F0', borderColor: '#CCCCCC', fontColor: '#666666' };
}

// ── Tag Segment Modal ──────────────────────────────────────────────────

interface TagSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTags: SegmentTag[];
  onApply: (tags: SegmentTag[]) => void;
}

function TagSegmentModal({ isOpen, onClose, existingTags, onApply }: TagSegmentModalProps) {
  const [selectedType, setSelectedType] = useState<TagType>('loyalty');
  const [pendingTags, setPendingTags] = useState<SegmentTag[]>([]);

  // Initialize pending tags when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingTags([...existingTags]);
      setSelectedType('loyalty');
    }
  }, [isOpen, existingTags]);

  const isTagSelected = useCallback(
    (type: TagType, value: string) =>
      pendingTags.some((t) => t.type === type && t.value === value),
    [pendingTags]
  );

  const toggleTag = useCallback((type: TagType, option: TagOption) => {
    setPendingTags((prev) => {
      const exists = prev.some((t) => t.type === type && t.value === option.value);
      if (exists) {
        return prev.filter((t) => !(t.type === type && t.value === option.value));
      }
      const label =
        type === 'rate_code'
          ? `Rate Code: ${option.label}`
          : type === 'room_type'
            ? option.label
            : option.label;
      return [...prev, { type, value: option.value, label }];
    });
  }, []);

  const removeTag = useCallback((type: TagType, value: string) => {
    setPendingTags((prev) => prev.filter((t) => !(t.type === type && t.value === value)));
  }, []);

  const handleApply = () => {
    onApply(pendingTags);
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tag Segment"
      size="medium"
      footer={
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton type={ButtonType.TEXT} onClick={onClose}>
            Cancel
          </CanaryButton>
          <CanaryButton type={ButtonType.PRIMARY} onClick={handleApply}>
            Apply
          </CanaryButton>
        </div>
      }
    >
      <div className="flex flex-col" style={{ gap: 20 }}>
        {/* Description */}
        <p style={{ fontSize: 14, color: colors.colorBlack3, margin: 0, lineHeight: '1.5' }}>
          Tag this context statement with guest segments so the AI only includes it when responding to matching guests.
        </p>

        {/* Currently applied tags */}
        {pendingTags.length > 0 && (
          <div className="flex flex-col" style={{ gap: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: colors.colorBlack2, margin: 0 }}>
              Applied tags
            </p>
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {pendingTags.map((tag) => {
                const tagColors = getSegmentTagCustomColor(tag);
                return (
                  <span
                    key={`${tag.type}-${tag.value}`}
                    className="inline-flex items-center rounded"
                    style={{
                      gap: 6,
                      padding: '2px 8px',
                      fontSize: 12,
                      lineHeight: '20px',
                      fontWeight: 500,
                      color: tagColors.fontColor,
                      backgroundColor: tagColors.backgroundColor,
                      border: `1px solid ${tagColors.borderColor}`,
                    }}
                  >
                    {tag.label}
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer flex items-center justify-center"
                      style={{ background: 'none', border: 'none', padding: 0 }}
                      onClick={() => removeTag(tag.type, tag.value)}
                    >
                      <Icon path={mdiCloseCircle} size={0.55} color={tagColors.fontColor} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Tag type selector */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: colors.colorBlack2, margin: 0 }}>
            Tag type
          </p>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {(Object.keys(TAG_TYPE_LABELS) as TagType[]).map((type) => (
              <CanaryButton
                key={type}
                type={selectedType === type ? ButtonType.PRIMARY : ButtonType.OUTLINED}
                size={ButtonSize.COMPACT}
                onClick={() => setSelectedType(type)}
              >
                {TAG_TYPE_LABELS[type]}
              </CanaryButton>
            ))}
          </div>
        </div>

        {/* Value picker — checkboxes */}
        <div
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: colors.colorBlack6 }}
        >
          <div
            className="px-4 py-2"
            style={{
              backgroundColor: colors.colorBlack8,
              borderBottom: `1px solid ${colors.colorBlack6}`,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: colors.colorBlack2, margin: 0 }}>
              {TAG_TYPE_LABELS[selectedType]} values
            </p>
          </div>
          <div className="flex flex-col bg-white" style={{ padding: '8px 16px' }}>
            {TAG_TYPE_OPTIONS[selectedType].map((option) => (
              <CanaryCheckbox
                key={option.value}
                label={option.label}
                checked={isTagSelected(selectedType, option.value)}
                onChange={() => toggleTag(selectedType, option)}
                size="normal"
              />
            ))}
          </div>
        </div>
      </div>
    </CanaryModal>
  );
}

// ── Progress helper ────────────────────────────────────────────────────

function calculateProgress(entries: Array<{ answer?: string; value?: string | null; question?: string }>): number {
  if (entries.length === 0) return 0;
  const answered = entries.filter((e) => {
    if ('value' in e && e.value !== undefined) return e.value !== null;
    if ('answer' in e) return (e.answer || '').trim().length > 0;
    return false;
  }).length;
  return Math.round((answered / entries.length) * 100);
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const {
    categories,
    customContext,
    toastMessage,
    updateEntry,
    updateSubQuestion,
    setYesNo,
    addCustomContext,
    updateCustomContext,
    deleteCustomContext,
    updateCustomContextSegments,
    showToast,
  } = useKBStore();

  const [showNewContextModal, setShowNewContextModal] = useState(false);
  const [newContextText, setNewContextText] = useState('');
  const [deleteContextId, setDeleteContextId] = useState<string | null>(null);
  const deleteContextEntry = deleteContextId ? customContext.find((c) => c.id === deleteContextId) : null;

  // Segment tag modal state
  const [tagModalEntryId, setTagModalEntryId] = useState<string | null>(null);
  const tagModalEntry = tagModalEntryId ? customContext.find((c) => c.id === tagModalEntryId) : null;

  const handleAddContext = () => {
    if (!newContextText.trim()) return;
    addCustomContext(newContextText.trim());
    setNewContextText('');
    setShowNewContextModal(false);
    showToast('Custom context added');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.colorBlack6}` }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>
          Knowledge Base
        </h1>
        <div className="flex items-center" style={{ gap: 8 }}>
          <CanaryButton
            type={ButtonType.OUTLINED}
            onClick={() => setShowNewContextModal(true)}
          >
            New context
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={() => showToast('Knowledge base saved')}
          >
            Save
          </CanaryButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: colors.colorBlack8, padding: 24 }}>
        <div className="flex flex-col" style={{ gap: 16 }}>
          {/* Managed Context */}
          <KBSection
            title="Managed Context"
            description="This information is managed by your corporate/management companies. If you have any questions, please reach out to them for more information or corrections."
          >
            <p style={{ fontSize: 14, color: colors.colorBlack4, textAlign: 'center', padding: '16px 0' }}>
              No managed answers available yet
            </p>
          </KBSection>

          {/* Default Context Categories */}
          {categories.map((category) => (
            <KBSection
              key={category.id}
              title={category.title}
              progress={calculateProgress(category.entries)}
            >
              {category.entries.map((entry) => (
                <KBEntryRenderer
                  key={entry.id}
                  entry={entry}
                  onAnswerChange={(answer) =>
                    updateEntry(category.id, entry.id, { answer })
                  }
                  onYesNoChange={(value) =>
                    setYesNo(category.id, entry.id, value)
                  }
                  onSubAnswerChange={(subId, answer) =>
                    updateSubQuestion(category.id, entry.id, subId, answer)
                  }
                />
              ))}
            </KBSection>
          ))}

          {/* Custom Context */}
          <KBSection title="Custom Context" count={customContext.length}>
            <div className="flex flex-col" style={{ gap: 16 }}>
              {customContext.map((entry) => {
                const hasTags = entry.segmentTags && entry.segmentTags.length > 0;
                return (
                  <div key={entry.id} className="flex flex-col" style={{ gap: 4 }}>
                    {/* Row: Input + Tag button + Delete button */}
                    <div className="flex items-start" style={{ gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <CanaryInput
                          size={InputSize.NORMAL}
                          value={entry.text}
                          onChange={(e) => updateCustomContext(entry.id, e.target.value)}
                        />
                      </div>
                      <CanaryButton
                        type={ButtonType.ICON_SECONDARY}
                        icon={
                          <Icon
                            path={hasTags ? mdiTag : mdiTagOutline}
                            size={0.85}
                            color={hasTags ? colors.colorBlueDark1 : undefined}
                          />
                        }
                        onClick={() => setTagModalEntryId(entry.id)}
                      />
                      <CanaryButton
                        type={ButtonType.ICON_SECONDARY}
                        icon={<Icon path={mdiDeleteOutline} size={0.85} />}
                        onClick={() => setDeleteContextId(entry.id)}
                      />
                    </div>

                    {/* Tag pills below input */}
                    {hasTags && (
                      <div className="flex flex-wrap" style={{ gap: 4, paddingLeft: 0 }}>
                        {entry.segmentTags!.map((tag) => {
                          const tagColors = getSegmentTagCustomColor(tag);
                          return (
                            <CanaryTag
                              key={`${tag.type}-${tag.value}`}
                              label={tag.label}
                              size={TagSize.COMPACT}
                              customColor={{
                                backgroundColor: tagColors.backgroundColor,
                                borderColor: tagColors.borderColor,
                                fontColor: tagColors.fontColor,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {customContext.length === 0 && (
                <p style={{ fontSize: 14, color: colors.colorBlack4, textAlign: 'center', padding: '16px 0' }}>
                  No custom context added yet. Click &quot;New context&quot; to add.
                </p>
              )}
            </div>
          </KBSection>
        </div>
      </div>

      {/* Tag Segment Modal */}
      <TagSegmentModal
        isOpen={!!tagModalEntryId}
        onClose={() => setTagModalEntryId(null)}
        existingTags={tagModalEntry?.segmentTags ?? []}
        onApply={(tags) => {
          if (tagModalEntryId) {
            updateCustomContextSegments(tagModalEntryId, tags);
            showToast(tags.length > 0 ? 'Segment tags updated' : 'Segment tags removed');
          }
        }}
      />

      {/* New Context Modal */}
      <CanaryModal
        isOpen={showNewContextModal}
        onClose={() => { setShowNewContextModal(false); setNewContextText(''); }}
        title="New Custom Context"
        size="medium"
      >
        <p style={{ fontSize: 14, color: colors.colorBlack2, margin: '0 0 16px 0', lineHeight: '1.5' }}>
          Add details to the &quot;Custom Context&quot; box to train the AI with extra info — this adds to existing data, not replaces it, for better responses.
        </p>
        <CanaryInput
          label="Information"
          size={InputSize.NORMAL}
          value={newContextText}
          placeholder="Ex. The pool opens at 10:00am"
          onChange={(e) => setNewContextText(e.target.value)}
        />
        <div className="flex justify-end" style={{ gap: 8, marginTop: 24 }}>
          <CanaryButton
            type={ButtonType.OUTLINED}
            onClick={() => { setShowNewContextModal(false); setNewContextText(''); }}
          >
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={handleAddContext}
          >
            Add
          </CanaryButton>
        </div>
      </CanaryModal>

      {/* Delete Custom Context Confirmation */}
      <CanaryModal
        isOpen={!!deleteContextId}
        onClose={() => setDeleteContextId(null)}
        title="Delete Custom Context?"
        size="medium"
      >
        <p style={{ fontSize: 14, color: colors.colorBlack2, margin: '0 0 16px 0', lineHeight: '1.5' }}>
          Are you sure you want to delete this custom context?
        </p>
        {deleteContextEntry && (
          <p style={{ fontSize: 14, color: colors.colorBlack2, margin: '0 0 24px 0', lineHeight: '1.5' }}>
            <strong>Statement:</strong> {deleteContextEntry.text}
          </p>
        )}
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton type={ButtonType.OUTLINED} onClick={() => setDeleteContextId(null)}>
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            color={ButtonColor.DANGER}
            onClick={() => {
              if (deleteContextId) {
                deleteCustomContext(deleteContextId);
                showToast('Custom context removed');
              }
              setDeleteContextId(null);
            }}
          >
            Delete
          </CanaryButton>
        </div>
      </CanaryModal>

      {/* Toast */}
      {typeof document !== 'undefined' && toastMessage && createPortal(
        <div
          className="fixed bottom-4 left-1/2 px-6 py-3 rounded-lg shadow-lg text-[14px] font-medium text-white z-[9999]"
          style={{
            backgroundColor: colors.colorBlueDark1,
            transform: 'translateX(-50%)',
            animation: 'toast-in 300ms ease-out',
          }}
        >
          {toastMessage}
        </div>,
        document.body
      )}
    </div>
  );
}
