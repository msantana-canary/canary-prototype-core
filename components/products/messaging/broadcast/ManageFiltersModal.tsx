/**
 * ManageFiltersModal Component
 *
 * Modal to view, edit, and delete saved broadcast filters.
 * Edit opens FilterGuestsModal in edit mode.
 * Delete shows a confirmation sub-modal.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPencilOutline, mdiDeleteOutline } from '@mdi/js';
import {
  CanaryModal,
  CanaryButton,
  ButtonType,
  ButtonColor,
} from '@canary-ui/components';
import { SavedFilter, BroadcastFilterCriteria } from '@/lib/products/messaging/broadcast-types';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { FilterGuestsModal } from './FilterGuestsModal';
import { Toast } from '@/components/core/Toast';

interface ManageFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageFiltersModal({ isOpen, onClose }: ManageFiltersModalProps) {
  const { savedFilters, deleteFilter, updateFilter } = useBroadcastStore();
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [deletingFilter, setDeletingFilter] = useState<SavedFilter | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleDeleteConfirm = () => {
    if (deletingFilter) {
      deleteFilter(deletingFilter.id);
      setDeletingFilter(null);
    }
  };

  const handleSaveEdit = (id: string, name: string, criteria: BroadcastFilterCriteria) => {
    updateFilter(id, name, criteria);
    setEditingFilter(null);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  return (
    <>
      <CanaryModal
        isOpen={isOpen && !editingFilter}
        onClose={onClose}
        title="Manage guest segments"
        size="medium"
        className="!max-w-[560px]"
      >
        <div className="-my-4 py-6 -mx-6 px-6 flex flex-col">
          {/* Header */}
          <div className="px-4 h-8 flex items-center">
            <span
              className="font-['Roboto',sans-serif] text-[10px] font-medium leading-[16px] uppercase"
              style={{ color: '#666666' }}
            >
              Segment Name
            </span>
          </div>

          {/* Filter list */}
          <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
            {savedFilters.length === 0 ? (
              <div className="p-4 text-center">
                <span
                  className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                  style={{ color: '#999999' }}
                >
                  No saved guest segments yet
                </span>
              </div>
            ) : (
              savedFilters.map(filter => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between px-4 py-4 bg-white border-b border-[#e5e5e5] last:border-b-0"
                >
                  <span
                    className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                    style={{ color: '#2d2d2d' }}
                  >
                    {filter.name}
                  </span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="p-1.5 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setEditingFilter(filter)}
                    >
                      <Icon path={mdiPencilOutline} size={0.83} color="#333333" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setDeletingFilter(filter)}
                    >
                      <Icon path={mdiDeleteOutline} size={0.83} color="#333333" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CanaryModal>

      {/* Edit filter modal */}
      {editingFilter && (
        <FilterGuestsModal
          isOpen={true}
          onClose={() => setEditingFilter(null)}
          editingFilter={editingFilter}
          onSaveEdit={handleSaveEdit}
        />
      )}

      {/* Delete confirmation */}
      {deletingFilter && (
        <CanaryModal
          isOpen={true}
          onClose={() => setDeletingFilter(null)}
          title="Remove this guest segment"
          size="small"
          footer={
            <div className="flex justify-end gap-2">
              <CanaryButton type={ButtonType.OUTLINED} onClick={() => setDeletingFilter(null)}>
                Cancel
              </CanaryButton>
              <CanaryButton type={ButtonType.PRIMARY} color={ButtonColor.DANGER} onClick={handleDeleteConfirm}>
                Remove
              </CanaryButton>
            </div>
          }
        >
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: '#333333' }}
          >
            This guest segment will be deleted. You can recreate it anytime from the filter modal.
          </p>
        </CanaryModal>
      )}

      {/* Toast: Filter edit saved */}
      <Toast message="Guest segment saved" isOpen={showSaveToast} variant="success" />
    </>
  );
}
