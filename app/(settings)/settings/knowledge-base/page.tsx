'use client';

/**
 * Knowledge Base Settings Page
 *
 * AI context management — hotels populate information that powers
 * Canary's AI chat and voice products.
 *
 * Segment tagging for custom context entries — users apply pre-built
 * segments from Settings > Segments to scope AI context to specific
 * guest groups.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import {
  mdiDeleteOutline,
  mdiTagOutline,
  mdiCloseCircle,
  mdiOpenInNew,
} from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  CanaryInput,
  CanaryCheckbox,
  ButtonType,
  ButtonSize,
  ButtonColor,
  InputSize,
  colors,
} from '@canary-ui/components';
import { useKBStore } from '@/lib/products/knowledge-base/store';
import { isYesNoEntry } from '@/lib/products/knowledge-base/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { KBSection } from '@/components/products/knowledge-base/KBSection';
import { KBEntryRenderer } from '@/components/products/knowledge-base/KBEntryRenderer';

// ── Apply Segments Modal ─────────────────────────────────────────────────

interface ApplySegmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSegmentIds: string[];
  onApply: (segmentIds: string[]) => void;
}

function ApplySegmentsModal({ isOpen, onClose, existingSegmentIds, onApply }: ApplySegmentsModalProps) {
  const segments = useGuestJourneyStore((s) => s.segments);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  // Initialize pending IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingIds([...existingSegmentIds]);
    }
  }, [isOpen, existingSegmentIds]);

  const isSelected = useCallback(
    (segmentId: string) => pendingIds.includes(segmentId),
    [pendingIds]
  );

  const toggleSegment = useCallback((segmentId: string) => {
    setPendingIds((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
  }, []);

  const handleApply = () => {
    onApply(pendingIds);
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Segments"
      size="medium"
      footer={
        <div className="flex justify-end" style={{ gap: 8 }}>
          <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
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
          Select which guest segments this context applies to. Only guests matching these segments will receive this information. Manage segments in Settings &gt; Segments.
        </p>

        {/* Segment checkbox list */}
        {segments.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ backgroundColor: '#F0F0F0', minHeight: 120 }}
          >
            <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
              No segments created yet. Create segments in Settings &gt; Segments.
            </p>
          </div>
        ) : (
          <div>
            {/* Header — outside the bordered container */}
            <div style={{ padding: '0 16px 12px' }}>
              <span
                className="font-['Roboto',sans-serif]"
                style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}
              >
                Available segments
              </span>
            </div>

            {/* Scrollable bordered rows */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid #E5E5E5', maxHeight: 280, overflowY: 'auto' }}
            >
              {segments.map((seg, idx) => (
                <div
                  key={seg.id}
                  className="flex items-start cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  style={{
                    padding: '10px 16px',
                    borderBottom: idx < segments.length - 1 ? '1px solid #E5E5E5' : 'none',
                  }}
                  onClick={() => toggleSegment(seg.id)}
                >
                  <div style={{ paddingTop: 1, flexShrink: 0 }}>
                    <CanaryCheckbox
                      checked={isSelected(seg.id)}
                      onChange={() => toggleSegment(seg.id)}
                      size="normal"
                    />
                  </div>
                  <div className="flex flex-col" style={{ gap: 2, marginLeft: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlack1 }}>
                      {seg.name}
                    </span>
                    {seg.description && (
                      <span
                        style={{
                          fontSize: 12,
                          color: colors.colorBlack4,
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {seg.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: count + manage button */}
        <div className="flex items-center justify-between" style={{ marginTop: -8 }}>
          <span style={{ fontSize: 13, color: colors.colorBlack3 }}>
            {pendingIds.length} segment{pendingIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center" style={{ gap: 8 }}>
            <CanaryButton
              type={ButtonType.TEXT}
              size={ButtonSize.COMPACT}
              onClick={() => setPendingIds([])}
            >
              Clear
            </CanaryButton>
            <CanaryButton
              type={ButtonType.SHADED}
              size={ButtonSize.COMPACT}
              onClick={() => window.open('/settings/segments', '_blank')}
            >
              Manage segments
            </CanaryButton>
          </div>
        </div>
      </div>
    </CanaryModal>
  );
}

// ── Inline Segment Picker (for New Context modal) ────────────────────────

interface InlineSegmentPickerProps {
  selectedIds: string[];
  onToggle: (segmentId: string) => void;
}

function InlineSegmentPicker({ selectedIds, onToggle }: InlineSegmentPickerProps) {
  const segments = useGuestJourneyStore((s) => s.segments);

  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {/* Header — outside bordered container */}
      <div style={{ padding: '0 16px 12px' }}>
        <span
          className="font-['Roboto',sans-serif]"
          style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}
        >
          Available segments
        </span>
      </div>

      {/* Scrollable bordered rows */}
      {segments.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ backgroundColor: '#F0F0F0', minHeight: 80 }}
        >
          <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
            No segments available.{' '}
            <a
              href="/settings/segments"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.colorBlueDark1, textDecoration: 'none' }}
            >
              Create one
            </a>
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid #E5E5E5', maxHeight: 200, overflowY: 'auto' }}
        >
          {segments.map((seg, idx) => (
            <div
              key={seg.id}
              className="flex items-start cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  style={{
                    padding: '10px 16px',
                    borderBottom: idx < segments.length - 1 ? '1px solid #E5E5E5' : 'none',
                  }}
                  onClick={() => onToggle(seg.id)}
                >
                  <div style={{ paddingTop: 1, flexShrink: 0 }}>
                    <CanaryCheckbox
                      checked={selectedIds.includes(seg.id)}
                      onChange={() => onToggle(seg.id)}
                      size="normal"
                    />
                  </div>
                  <div className="flex flex-col" style={{ gap: 2, marginLeft: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: colors.colorBlack1 }}>
                      {seg.name}
                    </span>
                    {seg.description && (
                      <span
                        style={{
                          fontSize: 12,
                          color: colors.colorBlack4,
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {seg.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
            <span style={{ fontSize: 13, color: colors.colorBlack3 }}>
              {selectedIds.length} segment{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center" style={{ gap: 8 }}>
              <CanaryButton
                type={ButtonType.TEXT}
                size={ButtonSize.COMPACT}
                onClick={() => selectedIds.forEach((id) => onToggle(id))}
              >
                Clear
              </CanaryButton>
              <CanaryButton
                type={ButtonType.SHADED}
                size={ButtonSize.COMPACT}
                onClick={() => window.open('/settings/segments', '_blank')}
              >
                Manage segments
              </CanaryButton>
            </div>
          </div>
        </div>
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

  const segments = useGuestJourneyStore((s) => s.segments);

  const [showNewContextModal, setShowNewContextModal] = useState(false);
  const [newContextText, setNewContextText] = useState('');
  const [newContextSegmentIds, setNewContextSegmentIds] = useState<string[]>([]);
  const [deleteContextId, setDeleteContextId] = useState<string | null>(null);
  const deleteContextEntry = deleteContextId ? customContext.find((c) => c.id === deleteContextId) : null;

  // Segment picker modal state
  const [segmentModalEntryId, setSegmentModalEntryId] = useState<string | null>(null);
  const segmentModalEntry = segmentModalEntryId ? customContext.find((c) => c.id === segmentModalEntryId) : null;

  // Resolve segment IDs to names (memoized map)
  const segmentMap = useMemo(() => {
    const map = new Map<string, string>();
    segments.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [segments]);

  const handleAddContext = () => {
    if (!newContextText.trim()) return;
    addCustomContext(
      newContextText.trim(),
      newContextSegmentIds.length > 0 ? newContextSegmentIds : undefined
    );
    setNewContextText('');
    setNewContextSegmentIds([]);
    setShowNewContextModal(false);
    showToast('Custom context added');
  };

  const toggleNewContextSegment = useCallback((segmentId: string) => {
    setNewContextSegmentIds((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
  }, []);

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
                const hasSegments = entry.segmentIds && entry.segmentIds.length > 0;
                return (
                  <div key={entry.id}>
                    {/* Row: Input + Tag button + Delete button */}
                    <div className="flex items-start" style={{ gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <CanaryInput
                          size={InputSize.NORMAL}
                          value={entry.text}
                          onChange={(e) => updateCustomContext(entry.id, e.target.value)}
                          helperText={hasSegments
                            ? `Tagged: ${entry.segmentIds!.map((id) => segmentMap.get(id)).filter(Boolean).join(', ')}`
                            : undefined
                          }
                        />
                      </div>
                      <div className="flex items-center">
                        <CanaryButton
                          type={ButtonType.ICON_SECONDARY}
                          icon={
                            <Icon
                              path={mdiTagOutline}
                              size={0.85}
                              color={hasSegments ? colors.colorBlueDark1 : undefined}
                            />
                          }
                          onClick={() => setSegmentModalEntryId(entry.id)}
                        />
                        <CanaryButton
                          type={ButtonType.ICON_SECONDARY}
                          icon={<Icon path={mdiDeleteOutline} size={0.85} />}
                          onClick={() => setDeleteContextId(entry.id)}
                        />
                      </div>
                    </div>
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

      {/* Apply Segments Modal */}
      <ApplySegmentsModal
        isOpen={!!segmentModalEntryId}
        onClose={() => setSegmentModalEntryId(null)}
        existingSegmentIds={segmentModalEntry?.segmentIds ?? []}
        onApply={(segmentIds) => {
          if (segmentModalEntryId) {
            updateCustomContextSegments(segmentModalEntryId, segmentIds);
            showToast(segmentIds.length > 0 ? 'Segments updated' : 'Segments removed');
          }
        }}
      />

      {/* New Context Modal */}
      <CanaryModal
        isOpen={showNewContextModal}
        onClose={() => { setShowNewContextModal(false); setNewContextText(''); setNewContextSegmentIds([]); }}
        title="New Custom Context"
        size="medium"
      >
        <p style={{ fontSize: 14, color: colors.colorBlack2, margin: '0 0 16px 0', lineHeight: '1.5' }}>
          Add details to the &quot;Custom Context&quot; box to train the AI with extra info — this adds to existing data, not replaces it, for better responses. Optionally, tag it with a guest segment to make this information available only to matching guests.
        </p>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <CanaryInput
            label="Information"
            size={InputSize.NORMAL}
            value={newContextText}
            placeholder="Ex. The pool opens at 10:00am"
            onChange={(e) => setNewContextText(e.target.value)}
          />
          <InlineSegmentPicker
            selectedIds={newContextSegmentIds}
            onToggle={toggleNewContextSegment}
          />
        </div>
        <div className="flex justify-end" style={{ gap: 8, marginTop: 24 }}>
          <CanaryButton
            type={ButtonType.OUTLINED}
            onClick={() => { setShowNewContextModal(false); setNewContextText(''); setNewContextSegmentIds([]); }}
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
