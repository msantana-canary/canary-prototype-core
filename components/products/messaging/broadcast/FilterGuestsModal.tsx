/**
 * FilterGuestsModal Component
 *
 * Modal to filter broadcast guests by loyalty status, rate code,
 * group code, and room number. Supports saved filters.
 * Filters use AND logic across attributes, OR within each attribute.
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import {
  CanaryModal,
  CanaryInput,
  CanarySelect,
  CanaryButton,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import {
  BroadcastFilterCriteria,
  LoyaltyTier,
  SavedFilter,
} from '@/lib/products/messaging/broadcast-types';
import {
  useBroadcastStore,
  getFilteredGuestEntries,
  emptyFilterCriteria,
  isFilterEmpty,
} from '@/lib/products/messaging/broadcast-store';
import { guests } from '@/lib/core/data/guests';

const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'non-member', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

// --- Sub-components ---

function LoyaltyChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="h-[40px] min-w-[72px] px-4 rounded-[120px] font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] transition-colors cursor-pointer"
      style={
        isSelected
          ? { backgroundColor: '#2858c4', color: '#ffffff' }
          : { backgroundColor: '#ffffff', color: '#2858c4', border: '1px solid #2858c4' }
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function DismissibleChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 h-[32px] min-w-[72px] px-4 rounded-[4px] font-['Roboto',sans-serif] text-[12px] leading-[18px]"
      style={{ backgroundColor: '#e5e5e5', color: '#000000' }}
    >
      {label}
      <button
        type="button"
        className="shrink-0 rounded-full cursor-pointer flex items-center justify-center"
        onClick={onRemove}
      >
        <Icon path={mdiCloseCircle} size={0.67} color="#666666" />
      </button>
    </span>
  );
}

function TextToChipInput({
  placeholder,
  helperText,
  chips,
  onAdd,
  onRemove,
}: {
  placeholder: string;
  helperText: string;
  chips: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const val = inputValue.trim().toUpperCase();
      if (!chips.includes(val)) {
        onAdd(val);
      }
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <CanaryInput
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        size={InputSize.NORMAL}
        helperText={helperText}
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <DismissibleChip
              key={chip}
              label={chip}
              onRemove={() => onRemove(chip)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

interface FilterGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, the modal is in "edit saved filter" mode */
  editingFilter?: SavedFilter;
  onSaveEdit?: (id: string, name: string, criteria: BroadcastFilterCriteria) => void;
}

export function FilterGuestsModal({
  isOpen,
  onClose,
  editingFilter,
  onSaveEdit,
}: FilterGuestsModalProps) {
  const {
    allGroups,
    selectedGroupId,
    activeFilters,
    savedFilters,
    loadedSavedFilterId,
    applyFilters,
  } = useBroadcastStore();

  const isEditMode = !!editingFilter;

  // Local pending criteria
  const [pendingCriteria, setPendingCriteria] = useState<BroadcastFilterCriteria>({
    ...emptyFilterCriteria,
  });
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Initialize pending criteria when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingFilter) {
        setPendingCriteria({ ...editingFilter.criteria });
        setSelectedSavedFilterId('');
      } else {
        setPendingCriteria({ ...activeFilters });
        setSelectedSavedFilterId(loadedSavedFilterId || '');
      }
    }
  }, [isOpen, activeFilters, loadedSavedFilterId, editingFilter]);

  // Live matched count
  const matchedCount = useMemo(() => {
    if (isFilterEmpty(pendingCriteria)) return null;
    const filtered = getFilteredGuestEntries(selectedGroupId, allGroups, pendingCriteria);
    return filtered.filter(e => guests[e.guestId]?.phone).length;
  }, [pendingCriteria, selectedGroupId, allGroups]);

  // Toggle loyalty tier
  const toggleLoyaltyTier = useCallback((tier: LoyaltyTier) => {
    setPendingCriteria(prev => ({
      ...prev,
      loyaltyTiers: prev.loyaltyTiers.includes(tier)
        ? prev.loyaltyTiers.filter(t => t !== tier)
        : [...prev.loyaltyTiers, tier],
    }));
    setSelectedSavedFilterId('');
  }, []);

  // Add/remove for text-based filters
  const addToList = useCallback((field: 'rateCodes' | 'groupCodes' | 'roomNumbers', value: string) => {
    setPendingCriteria(prev => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
    setSelectedSavedFilterId('');
  }, []);

  const removeFromList = useCallback((field: 'rateCodes' | 'groupCodes' | 'roomNumbers', value: string) => {
    setPendingCriteria(prev => ({
      ...prev,
      [field]: prev[field].filter(v => v !== value),
    }));
    setSelectedSavedFilterId('');
  }, []);

  // Handle saved filter selection
  const handleSavedFilterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterId = e.target.value;
    setSelectedSavedFilterId(filterId);
    if (filterId) {
      const sf = savedFilters.find(f => f.id === filterId);
      if (sf) {
        setPendingCriteria({ ...sf.criteria });
      }
    }
  };

  // Apply
  const handleApply = () => {
    applyFilters(pendingCriteria, selectedSavedFilterId || undefined);
  };

  // Save edit (for manage filters flow)
  const handleSaveEdit = () => {
    if (editingFilter && onSaveEdit) {
      onSaveEdit(editingFilter.id, editingFilter.name, pendingCriteria);
    }
  };

  // Saved filter dropdown options
  const savedFilterOptions = useMemo(() => {
    return [
      { value: '', label: 'Select filter' },
      ...savedFilters.map(f => {
        const count = getFilteredGuestEntries(selectedGroupId, allGroups, f.criteria)
          .filter(e => guests[e.guestId]?.phone).length;
        return { value: f.id, label: `${f.name} (${count} guests)` };
      }),
    ];
  }, [savedFilters, selectedGroupId, allGroups]);

  const hasPendingFilters = !isFilterEmpty(pendingCriteria);

  return (
    <>
      <CanaryModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Edit filter' : 'Filter guests'}
        size="large"
        className="!max-w-[560px]"
        footer={
          <div className="flex items-center justify-between">
            {/* Left: guest match count */}
            <div>
              {hasPendingFilters && matchedCount !== null && (
                <span
                  className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                  style={{ color: '#000000' }}
                >
                  {matchedCount} guest{matchedCount !== 1 ? 's' : ''} match
                </span>
              )}
            </div>

            {/* Right: action buttons */}
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
                    Cancel
                  </CanaryButton>
                  <CanaryButton
                    type={ButtonType.PRIMARY}
                    onClick={handleSaveEdit}
                  >
                    Save
                  </CanaryButton>
                </>
              ) : (
                <>
                  <CanaryButton
                    type={ButtonType.OUTLINED}
                    onClick={() => setShowSaveModal(true)}
                    isDisabled={!hasPendingFilters}
                  >
                    Save filter
                  </CanaryButton>
                  <CanaryButton
                    type={ButtonType.PRIMARY}
                    onClick={handleApply}
                    isDisabled={hasPendingFilters && matchedCount === 0}
                  >
                    Apply
                  </CanaryButton>
                </>
              )}
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Subtitle */}
          <p
            className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: '#000000' }}
          >
            Select one or more filters to narrow your guest list. Guests must match all filters applied.
          </p>

          {/* Filter sections card */}
          <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
            {/* Saved Filters dropdown (first row, only in apply mode, only if saved filters exist) */}
            {!isEditMode && savedFilters.length > 0 && (
              <div className="bg-white p-4 border-b border-[#e5e5e5]">
                <p
                  className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-1"
                  style={{ color: '#000000' }}
                >
                  Saved Filters
                </p>
                <p
                  className="font-['Roboto',sans-serif] text-[14px] leading-[22px] mb-3"
                  style={{ color: '#666666' }}
                >
                  Apply a previously saved filter to quickly narrow your guest list.
                </p>
                <CanarySelect
                  options={savedFilterOptions}
                  value={selectedSavedFilterId}
                  onChange={handleSavedFilterSelect}
                  size={InputSize.NORMAL}
                  className={selectedSavedFilterId ? 'text-black' : 'text-[#999999]'}
                />
              </div>
            )}

            {/* Loyalty Status */}
            <div className="bg-white p-4 border-b border-[#e5e5e5]">
              <p
                className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-3"
                style={{ color: '#000000' }}
              >
                Loyalty Status
              </p>
              <div className="flex flex-wrap gap-2">
                {LOYALTY_TIERS.map(tier => (
                  <LoyaltyChip
                    key={tier.value}
                    label={tier.label}
                    isSelected={pendingCriteria.loyaltyTiers.includes(tier.value)}
                    onClick={() => toggleLoyaltyTier(tier.value)}
                  />
                ))}
              </div>
            </div>

            {/* Rate Code */}
            <div className="bg-white p-4 border-b border-[#e5e5e5]">
              <p
                className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
                style={{ color: '#000000' }}
              >
                Rate Code
              </p>
              <TextToChipInput
                placeholder="Type in Rate Codes"
                helperText='Press "Enter" to add the Rate Code to the list.'
                chips={pendingCriteria.rateCodes}
                onAdd={(val) => addToList('rateCodes', val)}
                onRemove={(val) => removeFromList('rateCodes', val)}
              />
            </div>

            {/* Group Code */}
            <div className="bg-white p-4 border-b border-[#e5e5e5]">
              <p
                className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
                style={{ color: '#000000' }}
              >
                Group Code
              </p>
              <TextToChipInput
                placeholder="Type in Group Codes"
                helperText='Press "Enter" to add the Group Code to the list.'
                chips={pendingCriteria.groupCodes}
                onAdd={(val) => addToList('groupCodes', val)}
                onRemove={(val) => removeFromList('groupCodes', val)}
              />
            </div>

            {/* Room Number */}
            <div className="bg-white p-4">
              <p
                className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
                style={{ color: '#000000' }}
              >
                Room Number
              </p>
              <TextToChipInput
                placeholder="Type in Room Number"
                helperText='Press "Enter" to add the Room Number to the list.'
                chips={pendingCriteria.roomNumbers}
                onAdd={(val) => addToList('roomNumbers', val)}
                onRemove={(val) => removeFromList('roomNumbers', val)}
              />
            </div>
          </div>
        </div>
      </CanaryModal>

      {/* Inline Save Filter Modal */}
      {showSaveModal && (
        <SaveFilterInline
          criteria={pendingCriteria}
          onClose={() => setShowSaveModal(false)}
          onSaved={(savedFilterId) => {
            setShowSaveModal(false);
            // Apply with the newly saved filter
            applyFilters(pendingCriteria, savedFilterId);
          }}
        />
      )}
    </>
  );
}

// Inline save filter dialog (rendered within FilterGuestsModal)
function SaveFilterInline({
  criteria,
  onClose,
  onSaved,
}: {
  criteria: BroadcastFilterCriteria;
  onClose: () => void;
  onSaved: (savedFilterId: string) => void;
}) {
  const { saveFilter, savedFilters } = useBroadcastStore();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    saveFilter(name, criteria);
    // Read the last saved filter's ID from the store (just appended)
    const updated = useBroadcastStore.getState().savedFilters;
    const newId = updated[updated.length - 1]?.id ?? '';
    onSaved(newId);
  };

  return (
    <CanaryModal
      isOpen={true}
      onClose={onClose}
      title="Save filter"
      size="small"
      footer={
        <div className="flex justify-end gap-2">
          <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
            Cancel
          </CanaryButton>
          <CanaryButton
            type={ButtonType.PRIMARY}
            onClick={handleSave}
            isDisabled={!name.trim()}
          >
            Save
          </CanaryButton>
        </div>
      }
    >
      <CanaryInput
        label="Filter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter filter name"
        size={InputSize.NORMAL}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
      />
    </CanaryModal>
  );
}
