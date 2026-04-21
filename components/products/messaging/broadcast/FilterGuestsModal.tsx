/**
 * FilterGuestsModal Component
 *
 * Modal to filter broadcast guests. Two modes:
 * - Quick Filters: filter by loyalty, rate code, group code, room number,
 *   length of stay, and guest recurrence
 * - Guest Segments: select an existing segment from /settings/segments
 *
 * Matches Figma: Broadcast Filters (nodes 97:6017, 97:6652, 97:6976, 98:9664, 97:8484)
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiCloseCircle } from '@mdi/js';
import {
  CanaryModal,
  CanaryInput,
  CanarySelect,
  CanaryButton,
  CanaryRadio,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import {
  BroadcastFilterCriteria,
  LoyaltyTier,
  RoomType,
  LengthOfStay,
  GuestRecurrence,
  SavedFilter,
} from '@/lib/products/messaging/broadcast-types';
import {
  useBroadcastStore,
  getFilteredGuestEntries,
  emptyFilterCriteria,
  isFilterEmpty,
} from '@/lib/products/messaging/broadcast-store';
import { guests } from '@/lib/core/data/guests';
import { mockSegments } from '@/lib/products/guest-journey/mock-data';
import { Segment, SegmentRule } from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

type FilterMode = 'quick-filters' | 'guest-segments';

const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'non-member', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'standard-king', label: 'Standard King' },
  { value: 'standard-double', label: 'Standard Double' },
  { value: 'deluxe-king', label: 'Deluxe King' },
  { value: 'deluxe-double', label: 'Deluxe Double' },
  { value: 'junior-suite', label: 'Junior Suite' },
  { value: 'executive-suite', label: 'Executive Suite' },
  { value: 'penthouse', label: 'Penthouse' },
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
      className="inline-flex items-center gap-2 h-[32px] min-w-[72px] px-4 rounded-[120px] font-['Roboto',sans-serif] text-[12px] leading-[18px]"
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

/** Deselectable radio — wraps CanaryRadio but intercepts clicks to allow deselection */
function DeselelectableRadio({
  name,
  value,
  label,
  isSelected,
  onToggle,
}: {
  name: string;
  value: string;
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="w-fit"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <CanaryRadio
        name={name}
        value={value}
        label={label}
        checked={isSelected}
        onChange={() => {}}
        size="normal"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}

/** Deselectable radio button pair */
function BinaryRadioRow({
  label,
  name,
  option1: { value: val1, label: label1 },
  option2: { value: val2, label: label2 },
  selected,
  onChange,
}: {
  label: string;
  name: string;
  option1: { value: string; label: string };
  option2: { value: string; label: string };
  selected: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="bg-white p-4 border-b border-[#e5e5e5]">
      <p
        className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
        style={{ color: '#000000' }}
      >
        {label}
      </p>
      <div className="flex gap-4">
        <DeselelectableRadio
          name={name}
          value={val1}
          label={label1}
          isSelected={selected === val1}
          onToggle={() => onChange(selected === val1 ? null : val1)}
        />
        <DeselelectableRadio
          name={name}
          value={val2}
          label={label2}
          isSelected={selected === val2}
          onToggle={() => onChange(selected === val2 ? null : val2)}
        />
      </div>
    </div>
  );
}

/** Resolve a segment's rules to a BroadcastFilterCriteria for filtering */
function segmentToCriteria(segment: Segment): BroadcastFilterCriteria {
  const criteria: BroadcastFilterCriteria = { ...emptyFilterCriteria, roomTypes: [] };

  for (const rule of segment.rules) {
    switch (rule.guestProperty) {
      case 'Loyalty Status': {
        const tierMap: Record<string, LoyaltyTier> = {
          'Diamond': 'diamond-elite',
          'Platinum': 'platinum-elite',
          'Gold': 'gold-elite',
          'Silver': 'silver-elite',
          'Club Member': 'club-member',
          'Non-member': 'non-member',
        };
        // For "includes", add matching tiers
        if (rule.condition === 'includes') {
          criteria.loyaltyTiers = rule.values
            .map(v => tierMap[v])
            .filter(Boolean);
        }
        // For "excludes", add all tiers EXCEPT excluded ones
        if (rule.condition === 'excludes') {
          const excluded = new Set(rule.values.map(v => tierMap[v]).filter(Boolean));
          criteria.loyaltyTiers = (Object.values(tierMap) as LoyaltyTier[])
            .filter(t => !excluded.has(t));
        }
        break;
      }
      case 'Rate Code':
        if (rule.condition === 'includes') {
          criteria.rateCodes = [...rule.values];
        }
        break;
      case 'Number of Nights Staying':
        if (rule.dropdownValue === 'Multiple Nights') {
          criteria.lengthOfStay = 'multiple-nights';
        } else if (rule.dropdownValue === 'One Night') {
          criteria.lengthOfStay = 'one-night';
        }
        break;
      case 'Guest Recurrence':
        if (rule.dropdownValue === 'First-time') {
          criteria.guestRecurrence = 'first-time';
        } else if (rule.dropdownValue === 'Recurring') {
          criteria.guestRecurrence = 'recurring';
        }
        break;
    }
  }
  return criteria;
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
  const router = useRouter();
  const {
    allGroups,
    selectedGroupId,
    activeFilters,
    applyFilters,
  } = useBroadcastStore();

  const isEditMode = !!editingFilter;

  // Filter mode toggle
  const [filterMode, setFilterMode] = useState<FilterMode>('quick-filters');

  // Quick Filters state
  const [pendingCriteria, setPendingCriteria] = useState<BroadcastFilterCriteria>({
    ...emptyFilterCriteria,
  });
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Guest Segments state
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingFilter) {
        setFilterMode('quick-filters');
        setPendingCriteria({ ...editingFilter.criteria });
        setSelectedSegmentId('');
      } else {
        setFilterMode('quick-filters');
        setPendingCriteria({ ...activeFilters });
        setSelectedSegmentId('');
      }
    }
  }, [isOpen, activeFilters, editingFilter]);

  // Read segments from the guest journey store (live, includes newly created ones)
  const gjSegments = useGuestJourneyStore(s => s.segments);

  // Selected segment object
  const selectedSegment = useMemo(() => {
    if (!selectedSegmentId) return null;
    return gjSegments.find(s => s.id === selectedSegmentId) ?? null;
  }, [selectedSegmentId, gjSegments]);

  // Resolved criteria for selected segment
  const segmentCriteria = useMemo(() => {
    if (!selectedSegment) return null;
    return segmentToCriteria(selectedSegment);
  }, [selectedSegment]);

  // The active criteria to use for match count (depends on mode)
  const activeCriteria = filterMode === 'guest-segments' && segmentCriteria
    ? segmentCriteria
    : pendingCriteria;

  // Live matched count
  const matchedCount = useMemo(() => {
    if (filterMode === 'quick-filters' && isFilterEmpty(pendingCriteria)) return null;
    if (filterMode === 'guest-segments' && !segmentCriteria) return null;
    const filtered = getFilteredGuestEntries(selectedGroupId, allGroups, activeCriteria);
    return filtered.filter(e => guests[e.guestId]?.phone).length;
  }, [activeCriteria, filterMode, pendingCriteria, segmentCriteria, selectedGroupId, allGroups]);

  // Toggle loyalty tier
  const toggleLoyaltyTier = useCallback((tier: LoyaltyTier) => {
    setPendingCriteria(prev => ({
      ...prev,
      loyaltyTiers: prev.loyaltyTiers.includes(tier)
        ? prev.loyaltyTiers.filter(t => t !== tier)
        : [...prev.loyaltyTiers, tier],
    }));
  }, []);

  // Toggle room type
  const toggleRoomType = useCallback((rt: RoomType) => {
    setPendingCriteria(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(rt)
        ? prev.roomTypes.filter(t => t !== rt)
        : [...prev.roomTypes, rt],
    }));
  }, []);

  // Add/remove for text-based filters
  const addToList = useCallback((field: 'rateCodes' | 'groupCodes' | 'roomNumbers', value: string) => {
    setPendingCriteria(prev => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
  }, []);

  const removeFromList = useCallback((field: 'rateCodes' | 'groupCodes' | 'roomNumbers', value: string) => {
    setPendingCriteria(prev => ({
      ...prev,
      [field]: prev[field].filter(v => v !== value),
    }));
  }, []);

  // Length of Stay / Guest Recurrence
  const setLengthOfStay = useCallback((value: LengthOfStay | null) => {
    setPendingCriteria(prev => ({ ...prev, lengthOfStay: value }));
  }, []);

  const setGuestRecurrence = useCallback((value: GuestRecurrence | null) => {
    setPendingCriteria(prev => ({ ...prev, guestRecurrence: value }));
  }, []);

  // Clear all filters within the modal
  const handleClearFilters = useCallback(() => {
    setPendingCriteria({ ...emptyFilterCriteria });
  }, []);

  // Apply
  const handleApply = () => {
    if (filterMode === 'guest-segments' && segmentCriteria) {
      applyFilters(segmentCriteria, selectedSegment?.id);
    } else {
      applyFilters(pendingCriteria);
    }
  };

  // Save edit (for manage filters flow)
  const handleSaveEdit = () => {
    if (editingFilter && onSaveEdit) {
      onSaveEdit(editingFilter.id, editingFilter.name, pendingCriteria);
    }
  };

  // Segment dropdown options (from live store)
  const segmentOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Segment' },
      ...gjSegments.map(s => ({ value: s.id, label: s.name })),
    ];
  }, [gjSegments]);

  const hasPendingFilters = filterMode === 'quick-filters'
    ? !isFilterEmpty(pendingCriteria)
    : !!segmentCriteria;

  // Determine which group type is selected (for hiding Room Number on arrivals)
  const selectedGroup = allGroups.find(g => g.id === selectedGroupId);
  const isArrivals = selectedGroup?.builtInType === 'arrivals';

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
            {/* Left side */}
            <div className="flex items-center gap-3">
              {isEditMode ? null : filterMode === 'quick-filters' ? (
                <CanaryButton
                  type={ButtonType.TEXT}
                  onClick={handleClearFilters}
                  isDisabled={isFilterEmpty(pendingCriteria)}
                >
                  Clear Filters
                </CanaryButton>
              ) : (
                // Guest Segments mode: show match count on left when segment selected
                matchedCount !== null && (
                  <span
                    className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                    style={{ color: '#000000' }}
                  >
                    {matchedCount} guest{matchedCount !== 1 ? 's' : ''} match
                  </span>
                )
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
              ) : filterMode === 'quick-filters' ? (
                <>
                  <CanaryButton
                    type={ButtonType.OUTLINED}
                    onClick={() => setShowSaveModal(true)}
                    isDisabled={!hasPendingFilters}
                  >
                    Save as Guest Segment
                  </CanaryButton>
                  <CanaryButton
                    type={ButtonType.PRIMARY}
                    onClick={handleApply}
                    isDisabled={!hasPendingFilters}
                  >
                    Apply
                  </CanaryButton>
                </>
              ) : (
                /* Guest Segments mode */
                <>
                  <CanaryButton
                    type={ButtonType.OUTLINED}
                    onClick={() => {
                      onClose();
                      router.push('/settings/segments');
                    }}
                  >
                    Manage segments
                  </CanaryButton>
                  <CanaryButton
                    type={ButtonType.PRIMARY}
                    onClick={handleApply}
                    isDisabled={!selectedSegmentId}
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

          {/* Radio toggle: Quick Filters / Guest Segments */}
          {!isEditMode && (
            <div className="flex gap-4">
              <div className="w-fit">
                <CanaryRadio
                  name="filterMode"
                  value="quick-filters"
                  label="Quick Filters"
                  checked={filterMode === 'quick-filters'}
                  onChange={() => setFilterMode('quick-filters')}
                  size="normal"
                />
              </div>
              <div className="w-fit">
                <CanaryRadio
                  name="filterMode"
                  value="guest-segments"
                  label="Guest Segments"
                  checked={filterMode === 'guest-segments'}
                  onChange={() => setFilterMode('guest-segments')}
                  size="normal"
                />
              </div>
            </div>
          )}

          {/* Content depends on mode */}
          {filterMode === 'quick-filters' ? (
            /* ──── Quick Filters Mode ──── */
            <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
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

              {/* Room Number — hidden for Arrivals per PRD */}
              {!isArrivals && (
                <div className="bg-white p-4 border-b border-[#e5e5e5]">
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
              )}

              {/* Room Type */}
              <div className="bg-white p-4 border-b border-[#e5e5e5]">
                <p
                  className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-3"
                  style={{ color: '#000000' }}
                >
                  Room Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map(rt => (
                    <LoyaltyChip
                      key={rt.value}
                      label={rt.label}
                      isSelected={pendingCriteria.roomTypes.includes(rt.value)}
                      onClick={() => toggleRoomType(rt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Length of Stay */}
              <BinaryRadioRow
                label="Length of Stay"
                name="lengthOfStay"
                option1={{ value: 'one-night', label: 'One night' }}
                option2={{ value: 'multiple-nights', label: 'Multiple nights' }}
                selected={pendingCriteria.lengthOfStay}
                onChange={(val) => setLengthOfStay(val as LengthOfStay | null)}
              />

              {/* Guest Recurrence */}
              <div className="bg-white p-4">
                <p
                  className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
                  style={{ color: '#000000' }}
                >
                  Guest Recurrence
                </p>
                <div className="flex gap-4">
                  <DeselelectableRadio
                    name="guestRecurrence"
                    value="first-time"
                    label="First-time guest"
                    isSelected={pendingCriteria.guestRecurrence === 'first-time'}
                    onToggle={() => setGuestRecurrence(
                      pendingCriteria.guestRecurrence === 'first-time' ? null : 'first-time'
                    )}
                  />
                  <DeselelectableRadio
                    name="guestRecurrence"
                    value="recurring"
                    label="Recurring guest"
                    isSelected={pendingCriteria.guestRecurrence === 'recurring'}
                    onToggle={() => setGuestRecurrence(
                      pendingCriteria.guestRecurrence === 'recurring' ? null : 'recurring'
                    )}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ──── Guest Segments Mode ──── */
            <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden">
              <div className="bg-white p-4 border-b border-[#e5e5e5]">
                <p
                  className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px] mb-2"
                  style={{ color: '#000000' }}
                >
                  Guest Segment
                </p>
                <CanarySelect
                  options={segmentOptions}
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  size={InputSize.NORMAL}
                />
              </div>
            </div>
          )}
        </div>
      </CanaryModal>

      {/* Inline Save as Guest Segment Modal */}
      {showSaveModal && (
        <SaveAsGuestSegment
          criteria={pendingCriteria}
          onClose={() => setShowSaveModal(false)}
          onSaved={(savedFilterId) => {
            setShowSaveModal(false);
            applyFilters(pendingCriteria, savedFilterId);
          }}
        />
      )}
    </>
  );
}

/** Convert broadcast filter criteria to segment rules */
function criteriaToSegmentRules(criteria: BroadcastFilterCriteria): SegmentRule[] {
  const rules: SegmentRule[] = [];
  const tierLabelMap: Record<LoyaltyTier, string> = {
    'non-member': 'Non-member',
    'club-member': 'Club Member',
    'silver-elite': 'Silver',
    'gold-elite': 'Gold',
    'platinum-elite': 'Platinum',
    'diamond-elite': 'Diamond',
  };

  if (criteria.loyaltyTiers.length > 0) {
    rules.push({
      id: `rule-${Date.now()}-loyalty`,
      guestProperty: 'Loyalty Status',
      condition: 'includes',
      values: criteria.loyaltyTiers.map(t => tierLabelMap[t]),
      dropdownValue: '',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  if (criteria.rateCodes.length > 0) {
    rules.push({
      id: `rule-${Date.now()}-rate`,
      guestProperty: 'Rate Code',
      condition: 'includes',
      values: [...criteria.rateCodes],
      dropdownValue: '',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  if (criteria.roomNumbers.length > 0) {
    rules.push({
      id: `rule-${Date.now()}-room`,
      guestProperty: 'Room Number',
      condition: 'includes',
      values: [...criteria.roomNumbers],
      dropdownValue: '',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  if (criteria.roomTypes.length > 0) {
    const rtLabelMap: Record<RoomType, string> = {
      'standard-king': 'Standard King',
      'standard-double': 'Standard Double',
      'deluxe-king': 'Deluxe King',
      'deluxe-double': 'Deluxe Double',
      'junior-suite': 'Junior Suite',
      'executive-suite': 'Executive Suite',
      'penthouse': 'Penthouse',
    };
    rules.push({
      id: `rule-${Date.now()}-roomtype`,
      guestProperty: 'Room Type',
      condition: 'includes',
      values: criteria.roomTypes.map(rt => rtLabelMap[rt]),
      dropdownValue: '',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  if (criteria.lengthOfStay) {
    rules.push({
      id: `rule-${Date.now()}-stay`,
      guestProperty: 'Number of Nights Staying',
      condition: 'is equal to',
      values: [],
      dropdownValue: criteria.lengthOfStay === 'one-night' ? 'One Night' : 'Multiple Nights',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  if (criteria.guestRecurrence) {
    rules.push({
      id: `rule-${Date.now()}-recurrence`,
      guestProperty: 'Guest Recurrence',
      condition: 'is equal to',
      values: [],
      dropdownValue: criteria.guestRecurrence === 'first-time' ? 'First-time' : 'Recurring',
      ...(rules.length > 0 ? { operator: 'And' } : {}),
    });
  }
  return rules;
}

// Inline save dialog — matches Figma node 97:6976
function SaveAsGuestSegment({
  criteria,
  onClose,
  onSaved,
}: {
  criteria: BroadcastFilterCriteria;
  onClose: () => void;
  onSaved: (segmentId: string) => void;
}) {
  const { createSegment } = useGuestJourneyStore();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const segmentId = `seg-${Date.now()}`;
    const segment: Segment = {
      id: segmentId,
      name: name.trim(),
      rules: criteriaToSegmentRules(criteria),
      createdAt: Date.now(),
    };
    createSegment(segment);
    onSaved(segmentId);
  };

  return (
    <CanaryModal
      isOpen={true}
      onClose={onClose}
      title="Save as Guest Segment"
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
        label="Guest Segment Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter segment name"
        size={InputSize.NORMAL}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
      />
    </CanaryModal>
  );
}
