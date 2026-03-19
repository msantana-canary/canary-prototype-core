'use client';

/**
 * Knowledge Base Settings Page
 *
 * AI context management — hotels populate information that powers
 * Canary's AI chat and voice products.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import { mdiDeleteOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  CanaryInput,
  ButtonType,
  ButtonColor,
  InputSize,
  colors,
} from '@canary-ui/components';
import { useKBStore } from '@/lib/products/knowledge-base/store';
import { isYesNoEntry } from '@/lib/products/knowledge-base/types';
import { KBSection } from '@/components/products/knowledge-base/KBSection';
import { KBEntryRenderer } from '@/components/products/knowledge-base/KBEntryRenderer';

function calculateProgress(entries: Array<{ answer?: string; value?: string | null; question?: string }>): number {
  if (entries.length === 0) return 0;
  const answered = entries.filter((e) => {
    if ('value' in e && e.value !== undefined) return e.value !== null;
    if ('answer' in e) return (e.answer || '').trim().length > 0;
    return false;
  }).length;
  return Math.round((answered / entries.length) * 100);
}

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
    showToast,
  } = useKBStore();

  const [showNewContextModal, setShowNewContextModal] = useState(false);
  const [newContextText, setNewContextText] = useState('');
  const [deleteContextId, setDeleteContextId] = useState<string | null>(null);
  const deleteContextEntry = deleteContextId ? customContext.find((c) => c.id === deleteContextId) : null;

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
        style={{ padding: '16px 24px', borderBottom: '1px solid #E5E5E5' }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
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
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FAFAFA', padding: 24 }}>
        <div className="flex flex-col" style={{ gap: 16 }}>
          {/* Managed Context */}
          <KBSection
            title="Managed Context"
            description="This information is managed by your corporate/management companies. If you have any questions, please reach out to them for more information or corrections."
          >
            <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '16px 0' }}>
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
              {customContext.map((entry) => (
                <div key={entry.id} className="flex items-start" style={{ gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <CanaryInput
                      size={InputSize.NORMAL}
                      value={entry.text}
                      onChange={(e) => updateCustomContext(entry.id, e.target.value)}
                    />
                  </div>
                  <CanaryButton
                    type={ButtonType.ICON_SECONDARY}
                    icon={<Icon path={mdiDeleteOutline} size={0.85} />}
                    onClick={() => setDeleteContextId(entry.id)}
                  />
                </div>
              ))}
              {customContext.length === 0 && (
                <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '16px 0' }}>
                  No custom context added yet. Click &quot;New context&quot; to add.
                </p>
              )}
            </div>
          </KBSection>
        </div>
      </div>

      {/* New Context Modal */}
      <CanaryModal
        isOpen={showNewContextModal}
        onClose={() => { setShowNewContextModal(false); setNewContextText(''); }}
        title="New Custom Context"
        size="medium"
      >
        <p style={{ fontSize: 14, color: '#333', margin: '0 0 16px 0', lineHeight: '1.5' }}>
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
        size="small"
      >
        <p style={{ fontSize: 14, color: '#333', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          Are you sure you want to delete this custom context?
        </p>
        {deleteContextEntry && (
          <p style={{ fontSize: 14, color: '#333', margin: '0 0 24px 0', lineHeight: '1.5' }}>
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
