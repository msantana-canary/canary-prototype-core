/**
 * FilterGuestsModalBuilder — the "Builder" side of the step-3 filter-modal A/B.
 *
 * The classic modal is a WALL: every attribute rendered at once, mostly empty,
 * with the match count buried in the footer and only in Guest Segments mode.
 * This variant reframes filtering as building an audience and showing the answer
 * live. References the designer named: Loops' campaign-audience builder (start
 * from a saved segment, edit it, header flips to unsaved), Fresha's presets,
 * Customer.io's condition panel.
 *
 * Two columns:
 *   LEFT  — "Start from: [Guest Segment]" + Save as Guest Segment, then rule rows
 *           revealed one at a time via "+ Add filter". Loading a segment fills
 *           the rows; editing any of them flips the header to "Custom".
 *   RIGHT — the live answer: "N guests match" plus a scrolling preview of who
 *           they are. This column is why the modal earns its width.
 *
 * STORE SEMANTICS ARE IDENTICAL TO CLASSIC — same BroadcastFilterCriteria shape,
 * same applyFilters call, same sticky-selection interaction, same save-as-segment
 * toast. This is presentation and workflow only.
 *
 * Built from @canary-ui (CanaryModal, CanarySelect, CanaryInput, CanaryButton,
 * CanaryRadio). Hand-rolled, because the library exports no equivalent: the
 * loyalty quick-chips and dismissible value chips (classic hand-rolls these
 * too), the "+ Add filter" popover menu, and the row remove button.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiCloseCircle, mdiPlus, mdiTrashCanOutline, mdiAccountSearchOutline } from '@mdi/js';
import {
  colors,
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
  LengthOfStay,
  GuestRecurrence,
} from '@/lib/products/messaging/broadcast-types';
import {
  useBroadcastStore,
  getFilteredGuestEntries,
  emptyFilterCriteria,
  isFilterEmpty,
  canMessageGuest,
} from '@/lib/products/messaging/broadcast-store';
import {
  segmentToCriteria,
  criteriaToSegmentRules,
} from '@/lib/products/messaging/broadcast-segment-rules';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { Segment } from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { Avatar } from '../Avatar';

const LOYALTY_TIERS: { value: LoyaltyTier; label: string }[] = [
  { value: 'non-member', label: 'Non-member' },
  { value: 'club-member', label: 'Club Member' },
  { value: 'silver-elite', label: 'Silver Elite' },
  { value: 'gold-elite', label: 'Gold Elite' },
  { value: 'platinum-elite', label: 'Platinum Elite' },
  { value: 'diamond-elite', label: 'Diamond Elite' },
];

type AttributeKey =
  | 'loyalty'
  | 'rateCode'
  | 'groupCode'
  | 'roomNumber'
  | 'lengthOfStay'
  | 'guestRecurrence';

const ATTRIBUTE_LABEL: Record<AttributeKey, string> = {
  loyalty: 'Loyalty Status',
  rateCode: 'Rate Code',
  groupCode: 'Group Code',
  roomNumber: 'Room Number',
  lengthOfStay: 'Length of Stay',
  guestRecurrence: 'Guest Recurrence',
};

const ATTRIBUTE_ORDER: AttributeKey[] = [
  'loyalty',
  'rateCode',
  'groupCode',
  'roomNumber',
  'lengthOfStay',
  'guestRecurrence',
];

/** Which attributes a set of criteria actually uses — drives rule rows on load. */
function attributesInUse(criteria: BroadcastFilterCriteria): AttributeKey[] {
  const keys: AttributeKey[] = [];
  if (criteria.loyaltyTiers.length) keys.push('loyalty');
  if (criteria.rateCodes.length) keys.push('rateCode');
  if (criteria.groupCodes.length) keys.push('groupCode');
  if (criteria.roomNumbers.length) keys.push('roomNumber');
  if (criteria.lengthOfStay !== null) keys.push('lengthOfStay');
  if (criteria.guestRecurrence !== null) keys.push('guestRecurrence');
  return keys;
}

function clearAttribute(
  criteria: BroadcastFilterCriteria,
  key: AttributeKey
): BroadcastFilterCriteria {
  switch (key) {
    case 'loyalty':
      return { ...criteria, loyaltyTiers: [] };
    case 'rateCode':
      return { ...criteria, rateCodes: [] };
    case 'groupCode':
      return { ...criteria, groupCodes: [] };
    case 'roomNumber':
      return { ...criteria, roomNumbers: [] };
    case 'lengthOfStay':
      return { ...criteria, lengthOfStay: null };
    case 'guestRecurrence':
      return { ...criteria, guestRecurrence: null };
  }
}

// ── Hand-rolled atoms (no @canary-ui equivalent) ─────────────────────────────

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
      className="h-[32px] px-3 rounded-[6px] font-['Roboto',sans-serif] text-[13px] font-medium leading-[20px] transition-colors cursor-pointer"
      style={
        isSelected
          ? { backgroundColor: colors.colorBlueDark1, color: colors.colorWhite }
          : {
              backgroundColor: colors.colorWhite,
              color: colors.colorBlack2,
              border: `1px solid ${colors.colorBlack5}`,
            }
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ValueChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-[6px] font-['Roboto',sans-serif] text-[12px] leading-[18px]"
      style={{ backgroundColor: colors.colorBlack7, color: colors.colorBlack1 }}
    >
      {label}
      <button type="button" className="shrink-0 cursor-pointer flex items-center" onClick={onRemove}>
        <Icon path={mdiCloseCircle} size={0.6} color={colors.colorBlack3} />
      </button>
    </span>
  );
}

function TypeToChip({
  placeholder,
  chips,
  onAdd,
  onRemove,
}: {
  placeholder: string;
  chips: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <CanaryInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            e.preventDefault();
            const v = value.trim().toUpperCase();
            if (!chips.includes(v)) onAdd(v);
            setValue('');
          }
        }}
        size={InputSize.NORMAL}
        helperText='Press "Enter" to add'
      />
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <ValueChip key={c} label={c} onRemove={() => onRemove(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Deselectable radio — same trick classic uses, so a chosen value can be undone. */
function DeselectableRadio({
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

function RuleRow({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[8px]"
      style={{ border: `1px solid ${colors.colorBlack6}`, padding: 12 }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span
          className="font-['Roboto',sans-serif] text-[14px] font-medium leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
          style={{ padding: 4 }}
        >
          <Icon path={mdiTrashCanOutline} size={0.67} color={colors.colorBlack3} />
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface FilterGuestsModalBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterGuestsModalBuilder({ isOpen, onClose }: FilterGuestsModalBuilderProps) {
  const router = useRouter();
  const { allGroups, selectedGroupId, activeFilters, applyFilters } = useBroadcastStore();
  const showSegmentSavedToast = useBroadcastStore((s) => s.showSegmentSavedToast);
  const gjSegments = useGuestJourneyStore((s) => s.segments);
  const { createSegment } = useGuestJourneyStore();

  const [criteria, setCriteria] = useState<BroadcastFilterCriteria>({ ...emptyFilterCriteria });
  const [activeAttributes, setActiveAttributes] = useState<AttributeKey[]>([]);
  /** Which saved segment the builder started from, and whether it's been edited. */
  const [sourceSegmentId, setSourceSegmentId] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const addRef = useRef<HTMLDivElement>(null);

  // Seed from whatever is currently applied.
  useEffect(() => {
    if (!isOpen) return;
    setCriteria({ ...activeFilters });
    setActiveAttributes(attributesInUse(activeFilters));
    setSourceSegmentId('');
    setIsDirty(false);
    setIsAddOpen(false);
  }, [isOpen, activeFilters]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setIsAddOpen(false);
    };
    if (isAddOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isAddOpen]);

  const selectedGroup = allGroups.find((g) => g.id === selectedGroupId);
  const isArrivals = selectedGroup?.builtInType === 'arrivals';

  /** Any edit to a rule detaches the builder from its source segment. */
  const edit = useCallback((next: BroadcastFilterCriteria) => {
    setCriteria(next);
    setIsDirty(true);
  }, []);

  const handleStartFrom = (segmentId: string) => {
    setSourceSegmentId(segmentId);
    setIsDirty(false);
    if (!segmentId) {
      setCriteria({ ...emptyFilterCriteria });
      setActiveAttributes([]);
      return;
    }
    const segment = gjSegments.find((s) => s.id === segmentId);
    if (!segment) return;
    const loaded = segmentToCriteria(segment);
    setCriteria(loaded);
    setActiveAttributes(attributesInUse(loaded));
  };

  // Live answer — same computation the classic modal uses for its footer count.
  const matchedEntries = useMemo(() => {
    if (isFilterEmpty(criteria)) return [];
    return getFilteredGuestEntries(selectedGroupId, allGroups, criteria).filter(canMessageGuest);
  }, [criteria, selectedGroupId, allGroups]);

  const matchedCount = isFilterEmpty(criteria) ? null : matchedEntries.length;

  const availableAttributes = ATTRIBUTE_ORDER.filter(
    (k) => !activeAttributes.includes(k) && !(k === 'roomNumber' && isArrivals)
  );

  const addAttribute = (key: AttributeKey) => {
    setActiveAttributes((prev) => [...prev, key]);
    setIsAddOpen(false);
  };

  const removeAttribute = (key: AttributeKey) => {
    setActiveAttributes((prev) => prev.filter((k) => k !== key));
    edit(clearAttribute(criteria, key));
  };

  const handleClearAll = () => {
    setCriteria({ ...emptyFilterCriteria });
    setActiveAttributes([]);
    setSourceSegmentId('');
    setIsDirty(false);
  };

  const handleApply = () => {
    // Identical to classic: a segment-sourced apply passes the segment id so the
    // sent broadcast's chip renders the segment name.
    applyFilters(criteria, sourceSegmentId && !isDirty ? sourceSegmentId : undefined);
  };

  const handleSaveSegment = () => {
    if (!segmentName.trim()) return;
    const segmentId = `seg-${Date.now()}`;
    const segment: Segment = {
      id: segmentId,
      name: segmentName.trim(),
      rules: criteriaToSegmentRules(criteria),
      createdAt: Date.now(),
    };
    createSegment(segment);
    showSegmentSavedToast(segment.name);
    setIsSaveOpen(false);
    setSegmentName('');
    applyFilters(criteria, segmentId);
  };

  const sourceSegment = gjSegments.find((s) => s.id === sourceSegmentId);
  const hasFilters = !isFilterEmpty(criteria);
  const canApply = hasFilters && (matchedCount ?? 0) > 0;

  const segmentOptions = useMemo(
    () => [
      { value: '', label: 'Nothing — build from scratch' },
      ...gjSegments.map((s) => ({ value: s.id, label: s.name })),
    ],
    [gjSegments]
  );

  return (
    <>
      <CanaryModal
        isOpen={isOpen}
        onClose={onClose}
        title="Filter guests"
        size="large"
        className="!max-w-[760px]"
        footer={
          <div className="flex items-center justify-between">
            <CanaryButton type={ButtonType.TEXT} onClick={handleClearAll} isDisabled={!hasFilters}>
              Clear all
            </CanaryButton>
            <div className="flex gap-2">
              <CanaryButton type={ButtonType.OUTLINED} onClick={onClose}>
                Cancel
              </CanaryButton>
              <CanaryButton type={ButtonType.PRIMARY} onClick={handleApply} isDisabled={!canApply}>
                Apply
              </CanaryButton>
            </div>
          </div>
        }
      >
        <div className="flex gap-5" style={{ minHeight: 380 }}>
          {/* ── LEFT: the builder ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Start from */}
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <CanarySelect
                    label="Start from"
                    options={segmentOptions}
                    value={sourceSegmentId}
                    onChange={(e) => handleStartFrom(e.target.value)}
                    size={InputSize.NORMAL}
                  />
                </div>
                <CanaryButton
                  type={ButtonType.OUTLINED}
                  onClick={() => setIsSaveOpen(true)}
                  isDisabled={!hasFilters}
                >
                  Save as Guest Segment
                </CanaryButton>
              </div>

              {/* Loops' "Unsaved Segment" tell: editing a loaded segment detaches it */}
              {sourceSegment && (
                <span
                  className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                  style={{ color: isDirty ? colors.colorBlueDark1 : colors.colorBlack3 }}
                >
                  {isDirty
                    ? `Custom — edited from "${sourceSegment.name}"`
                    : `Using "${sourceSegment.name}"`}
                </span>
              )}
            </div>

            {/* Rule rows — progressive reveal, one attribute at a time */}
            <div className="flex flex-col gap-3">
              {activeAttributes.map((key) => {
                switch (key) {
                  case 'loyalty':
                    return (
                      <RuleRow
                        key={key}
                        label={ATTRIBUTE_LABEL[key]}
                        onRemove={() => removeAttribute(key)}
                      >
                        <div className="flex flex-wrap gap-2">
                          {LOYALTY_TIERS.map((tier) => (
                            <LoyaltyChip
                              key={tier.value}
                              label={tier.label}
                              isSelected={criteria.loyaltyTiers.includes(tier.value)}
                              onClick={() =>
                                edit({
                                  ...criteria,
                                  loyaltyTiers: criteria.loyaltyTiers.includes(tier.value)
                                    ? criteria.loyaltyTiers.filter((t) => t !== tier.value)
                                    : [...criteria.loyaltyTiers, tier.value],
                                })
                              }
                            />
                          ))}
                        </div>
                      </RuleRow>
                    );
                  case 'rateCode':
                  case 'groupCode':
                  case 'roomNumber': {
                    const field =
                      key === 'rateCode'
                        ? 'rateCodes'
                        : key === 'groupCode'
                        ? 'groupCodes'
                        : 'roomNumbers';
                    return (
                      <RuleRow
                        key={key}
                        label={ATTRIBUTE_LABEL[key]}
                        onRemove={() => removeAttribute(key)}
                      >
                        <TypeToChip
                          placeholder={`Type in ${ATTRIBUTE_LABEL[key]}s`}
                          chips={criteria[field]}
                          onAdd={(v) => edit({ ...criteria, [field]: [...criteria[field], v] })}
                          onRemove={(v) =>
                            edit({ ...criteria, [field]: criteria[field].filter((x) => x !== v) })
                          }
                        />
                      </RuleRow>
                    );
                  }
                  case 'lengthOfStay':
                    return (
                      <RuleRow
                        key={key}
                        label={ATTRIBUTE_LABEL[key]}
                        onRemove={() => removeAttribute(key)}
                      >
                        <div className="flex gap-4">
                          {(
                            [
                              ['one-night', 'One night'],
                              ['multiple-nights', 'Multiple nights'],
                            ] as [LengthOfStay, string][]
                          ).map(([val, label]) => (
                            <DeselectableRadio
                              key={val}
                              name="builderLengthOfStay"
                              value={val}
                              label={label}
                              isSelected={criteria.lengthOfStay === val}
                              onToggle={() =>
                                edit({
                                  ...criteria,
                                  lengthOfStay: criteria.lengthOfStay === val ? null : val,
                                })
                              }
                            />
                          ))}
                        </div>
                      </RuleRow>
                    );
                  case 'guestRecurrence':
                    return (
                      <RuleRow
                        key={key}
                        label={ATTRIBUTE_LABEL[key]}
                        onRemove={() => removeAttribute(key)}
                      >
                        <div className="flex gap-4">
                          {(
                            [
                              ['first-time', 'First-time guest'],
                              ['recurring', 'Recurring guest'],
                            ] as [GuestRecurrence, string][]
                          ).map(([val, label]) => (
                            <DeselectableRadio
                              key={val}
                              name="builderGuestRecurrence"
                              value={val}
                              label={label}
                              isSelected={criteria.guestRecurrence === val}
                              onToggle={() =>
                                edit({
                                  ...criteria,
                                  guestRecurrence: criteria.guestRecurrence === val ? null : val,
                                })
                              }
                            />
                          ))}
                        </div>
                      </RuleRow>
                    );
                }
              })}

              {/* + Add filter — progressive reveal instead of a wall of inputs */}
              {availableAttributes.length > 0 && (
                <div className="relative w-fit" ref={addRef}>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f9fafb]"
                    style={{
                      height: 36,
                      paddingLeft: 12,
                      paddingRight: 12,
                      border: `1px dashed ${colors.colorBlack5}`,
                    }}
                  >
                    <Icon path={mdiPlus} size={0.67} color={colors.colorBlueDark1} />
                    <span
                      className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                      style={{ color: colors.colorBlueDark1 }}
                    >
                      Add filter
                    </span>
                  </button>

                  {isAddOpen && (
                    <div
                      className="absolute left-0 mt-1 z-50 rounded-lg bg-white py-1"
                      style={{
                        width: 200,
                        border: `1px solid ${colors.colorBlack6}`,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      }}
                    >
                      {availableAttributes.map((key) => (
                        <button
                          key={key}
                          onClick={() => addAttribute(key)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                          style={{ color: colors.colorBlack1 }}
                        >
                          {ATTRIBUTE_LABEL[key]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: the live answer ────────────────────────────────────── */}
          <div
            className="shrink-0 flex flex-col rounded-[8px] overflow-hidden"
            style={{ width: 260, border: `1px solid ${colors.colorBlack6}` }}
          >
            <div
              className="shrink-0"
              style={{ padding: 12, borderBottom: `1px solid ${colors.colorBlack6}` }}
            >
              <p
                className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                style={{ color: colors.colorBlack1 }}
              >
                {matchedCount === null
                  ? 'All guests'
                  : `${matchedCount} guest${matchedCount !== 1 ? 's' : ''} match`}
              </p>
              <p
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                style={{ color: colors.colorBlack3 }}
              >
                {matchedCount === null ? 'Add a filter to narrow this down' : 'Updates as you edit'}
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
              {matchedCount === null ? (
                <div
                  className="h-full flex flex-col items-center justify-center gap-2"
                  style={{ padding: 16 }}
                >
                  <Icon path={mdiAccountSearchOutline} size={1.2} color={colors.colorBlack5} />
                  <p
                    className="font-['Roboto',sans-serif] text-[12px] leading-[18px] text-center"
                    style={{ color: colors.colorBlack4 }}
                  >
                    Your matching guests will appear here
                  </p>
                </div>
              ) : matchedEntries.length === 0 ? (
                <div className="h-full flex items-center justify-center" style={{ padding: 16 }}>
                  <p
                    className="font-['Roboto',sans-serif] text-[12px] leading-[18px] text-center"
                    style={{ color: colors.colorBlack4 }}
                  >
                    No guests match these filters
                  </p>
                </div>
              ) : (
                matchedEntries.map((entry) => {
                  const guest = guests[entry.guestId];
                  if (!guest) return null;
                  const reservation = reservations[entry.reservationId];
                  const room = reservation
                    ? `${reservation.room}${reservation.roomType ? ` ${reservation.roomType}` : ''}`
                    : '';
                  return (
                    <div
                      key={entry.guestId}
                      className="flex items-center gap-2"
                      style={{ padding: 8 }}
                    >
                      <Avatar src={guest.avatar} initials={guest.initials} size="small" />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-['Roboto',sans-serif] text-[13px] leading-[20px] font-medium truncate"
                          style={{ color: colors.colorBlack1 }}
                          title={guest.name}
                        >
                          {guest.name}
                        </div>
                        {room && (
                          <div
                            className="font-['Roboto',sans-serif] text-[11px] leading-[16px] truncate"
                            style={{ color: colors.colorBlack3 }}
                          >
                            {room}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                router.push('/settings/segments');
              }}
              className="shrink-0 text-left cursor-pointer hover:bg-[#f9fafb] transition-colors"
              style={{ padding: 12, borderTop: `1px solid ${colors.colorBlack6}` }}
            >
              <span
                className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px]"
                style={{ color: colors.colorBlueDark1 }}
              >
                Manage segments
              </span>
            </button>
          </div>
        </div>
      </CanaryModal>

      {/* Save as Guest Segment */}
      <CanaryModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        title="Save as Guest Segment"
        size="small"
        footer={
          <div className="flex justify-end gap-2">
            <CanaryButton type={ButtonType.OUTLINED} onClick={() => setIsSaveOpen(false)}>
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={handleSaveSegment}
              isDisabled={!segmentName.trim()}
            >
              Save
            </CanaryButton>
          </div>
        }
      >
        <CanaryInput
          label="Guest Segment Name"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
          placeholder="Enter segment name"
          size={InputSize.NORMAL}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveSegment();
          }}
        />
      </CanaryModal>
    </>
  );
}
