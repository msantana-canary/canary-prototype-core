/**
 * BroadcastFilterPanel — the single recipients + filter surface.
 *
 * TEAM JAM CANON. This replaces BOTH filter modals (classic and Builder) and the
 * old recipients column: filtering and reviewing who receives are the same job,
 * so they are one panel. Opened from the To strip — the funnel icon or the strip
 * itself; there is no other entry point.
 *
 * Single column, top to bottom:
 *   attribute stack   — start-from segment, loyalty chips, type-to-chip codes,
 *                       binary chips (the Builder's controls, which survived)
 *   sticky live count — "N guests match / Updates as you edit"
 *   matched list      — avatar · name · room, each row check/uncheckable
 *   NOT SENDING       — collapsed bar + reason groups (from the ledger work)
 *
 * Filters apply LIVE. There is no Apply button: the panel is also the recipients
 * list, so staged pending-criteria would leave the list disagreeing with the
 * controls directly above it.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiChevronRight, mdiChevronDown, mdiLockOutline } from '@mdi/js';
import {
  colors,
  CanaryCheckbox,
  CanarySelect,
  CanaryButton,
  CanaryInput,
  CanaryModal,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import { FloatingPanel } from '../FloatingPanel';
import { Avatar } from '../Avatar';
import {
  FilterSectionLabel,
  FilterChip,
  TypeToChipInput,
  BinaryChipRow,
  LOYALTY_TIERS,
} from './BroadcastFilterControls';
import {
  useBroadcastStore,
  getFilteredGuestEntries,
  emptyFilterCriteria,
  isFilterEmpty,
  canMessageGuest,
} from '@/lib/products/messaging/broadcast-store';
import {
  getAudienceSplit,
  summariseNotSending,
  notSendingCount,
  guestRoomMethod,
} from '@/lib/products/messaging/broadcast-audience-split';
import {
  segmentToCriteria,
  criteriaToSegmentRules,
} from '@/lib/products/messaging/broadcast-segment-rules';
import {
  BroadcastGuestEntry,
  BroadcastFilterCriteria,
  LengthOfStay,
  GuestRecurrence,
} from '@/lib/products/messaging/broadcast-types';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { Segment } from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';

function roomOf(entry: BroadcastGuestEntry): string {
  const r = reservations[entry.reservationId];
  return r ? `${r.room}${r.roomType ? ` ${r.roomType}` : ''}` : '';
}

function GuestRow({
  entry,
  checked,
  locked,
  onToggle,
}: {
  entry: BroadcastGuestEntry;
  checked: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  const guest = guests[entry.guestId];
  if (!guest) return null;
  const subtitle = guestRoomMethod(entry, roomOf(entry));

  return (
    <div
      className={`flex items-center gap-3 rounded-[6px] transition-colors ${
        locked ? '' : 'hover:bg-[#f9fafb] cursor-pointer'
      }`}
      style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
      onClick={() => !locked && onToggle?.()}
    >
      <div className="shrink-0 w-5 flex items-center justify-center">
        {locked ? (
          <Icon path={mdiLockOutline} size={0.67} color={colors.colorBlack4} />
        ) : (
          <CanaryCheckbox checked={checked} onChange={() => onToggle?.()} />
        )}
      </div>
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: colors.colorBlack1 }}
          title={guest.name}
        >
          {guest.name}
        </div>
        {subtitle && (
          <div
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
            title={subtitle}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function ReasonGroup({
  title,
  entries,
  locked,
  onIncludeAll,
  onToggle,
}: {
  title: string;
  entries: BroadcastGuestEntry[];
  locked?: boolean;
  onIncludeAll?: () => void;
  onToggle?: (guestId: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <div
        className="flex items-center gap-2"
        style={{ height: 28, paddingLeft: 12, paddingRight: 12 }}
      >
        {locked && <Icon path={mdiLockOutline} size={0.5} color={colors.colorBlack4} />}
        <span
          className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium whitespace-nowrap"
          style={{ color: colors.colorBlack4, letterSpacing: '0.4px' }}
        >
          {title} · {entries.length}
        </span>
        <span className="flex-1" />
        {onIncludeAll && (
          <button
            type="button"
            onClick={onIncludeAll}
            className="font-['Roboto',sans-serif] font-medium text-[12px] leading-[18px] cursor-pointer hover:underline whitespace-nowrap"
            style={{ color: colors.colorBlueDark1 }}
          >
            Include all
          </button>
        )}
      </div>
      {entries.map((entry) => (
        <GuestRow
          key={entry.guestId}
          entry={entry}
          checked={false}
          locked={locked}
          onToggle={onToggle ? () => onToggle(entry.guestId) : undefined}
        />
      ))}
    </div>
  );
}

export function BroadcastFilterPanel({
  isOpen,
  onClose,
  audienceName,
}: {
  isOpen: boolean;
  onClose: () => void;
  audienceName: string;
}) {
  const {
    allGroups,
    selectedGroupId,
    activeFilters,
    selectedGuestIds,
    applyFilters,
    toggleGuestSelection,
    addGuestsToSelection,
    showSegmentSavedToast,
  } = useBroadcastStore();

  const gjSegments = useGuestJourneyStore((s) => s.segments);
  const { createSegment } = useGuestJourneyStore();

  const [notSendingOpen, setNotSendingOpen] = useState(false);
  const [sourceSegmentId, setSourceSegmentId] = useState('');
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');

  const selectedGroup = allGroups.find((g) => g.id === selectedGroupId);
  const isArrivals = selectedGroup?.builtInType === 'arrivals';

  /** Editing any attribute detaches from the segment it was seeded from. */
  const edit = (next: BroadcastFilterCriteria) => {
    setSourceSegmentId('');
    applyFilters(next);
  };

  const split = useMemo(
    () => getAudienceSplit(selectedGroupId, allGroups, activeFilters, selectedGuestIds),
    [selectedGroupId, allGroups, activeFilters, selectedGuestIds]
  );

  const matchedCount = useMemo(
    () =>
      isFilterEmpty(activeFilters)
        ? split.visible.filter(canMessageGuest).length
        : getFilteredGuestEntries(selectedGroupId, allGroups, activeFilters).filter(canMessageGuest)
            .length,
    [activeFilters, selectedGroupId, allGroups, split.visible]
  );

  const handleStartFrom = (segmentId: string) => {
    setSourceSegmentId(segmentId);
    if (!segmentId) {
      applyFilters({ ...emptyFilterCriteria });
      return;
    }
    const segment = gjSegments.find((s) => s.id === segmentId);
    if (segment) applyFilters(segmentToCriteria(segment), segment.id);
  };

  const handleSaveSegment = () => {
    if (!segmentName.trim()) return;
    const segment: Segment = {
      id: `seg-${Date.now()}`,
      name: segmentName.trim(),
      rules: criteriaToSegmentRules(activeFilters),
      createdAt: Date.now(),
    };
    createSegment(segment);
    showSegmentSavedToast(segment.name);
    setIsSaveOpen(false);
    setSegmentName('');
    applyFilters(activeFilters, segment.id);
  };

  const segmentOptions = useMemo(
    () => [
      { value: '', label: 'Start from a segment…' },
      ...gjSegments.map((s) => ({ value: s.id, label: s.name })),
    ],
    [gjSegments]
  );

  const hidden = notSendingCount(split);

  return (
    <>
      <FloatingPanel isOpen={isOpen} onClose={onClose} width={480}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between"
            style={{ paddingLeft: 24, paddingRight: 16, paddingTop: 16, paddingBottom: 12 }}
          >
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {audienceName} guests
            </h2>
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="w-[30px] h-[30px] flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors cursor-pointer shrink-0"
            >
              <Icon path={mdiClose} size={0.67} color={colors.colorBlack1} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
            {/* ── Attribute stack ──────────────────────────────────────── */}
            <div
              className="flex flex-col gap-4"
              style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 20 }}
            >
              <div>
                <FilterSectionLabel>Start from</FilterSectionLabel>
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <CanarySelect
                      options={segmentOptions}
                      value={sourceSegmentId}
                      onChange={(e) => handleStartFrom(e.target.value)}
                      size={InputSize.NORMAL}
                    />
                  </div>
                  <CanaryButton
                    type={ButtonType.OUTLINED}
                    onClick={() => setIsSaveOpen(true)}
                    isDisabled={isFilterEmpty(activeFilters)}
                  >
                    Save
                  </CanaryButton>
                </div>
              </div>

              <div>
                <FilterSectionLabel>Loyalty status</FilterSectionLabel>
                <div className="flex flex-wrap gap-2">
                  {LOYALTY_TIERS.map((tier) => (
                    <FilterChip
                      key={tier.value}
                      label={tier.label}
                      isSelected={activeFilters.loyaltyTiers.includes(tier.value)}
                      onClick={() =>
                        edit({
                          ...activeFilters,
                          loyaltyTiers: activeFilters.loyaltyTiers.includes(tier.value)
                            ? activeFilters.loyaltyTiers.filter((t) => t !== tier.value)
                            : [...activeFilters.loyaltyTiers, tier.value],
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <FilterSectionLabel>Rate code</FilterSectionLabel>
                <TypeToChipInput
                  placeholder="Type in Rate Codes"
                  chips={activeFilters.rateCodes}
                  onAdd={(v) =>
                    edit({ ...activeFilters, rateCodes: [...activeFilters.rateCodes, v] })
                  }
                  onRemove={(v) =>
                    edit({
                      ...activeFilters,
                      rateCodes: activeFilters.rateCodes.filter((x) => x !== v),
                    })
                  }
                />
              </div>

              <div>
                <FilterSectionLabel>Group code</FilterSectionLabel>
                <TypeToChipInput
                  placeholder="Type in Group Codes"
                  chips={activeFilters.groupCodes}
                  onAdd={(v) =>
                    edit({ ...activeFilters, groupCodes: [...activeFilters.groupCodes, v] })
                  }
                  onRemove={(v) =>
                    edit({
                      ...activeFilters,
                      groupCodes: activeFilters.groupCodes.filter((x) => x !== v),
                    })
                  }
                />
              </div>

              {/* Room Number stays hidden on Arrivals — nobody has a room yet. */}
              {!isArrivals && (
                <div>
                  <FilterSectionLabel>Room number</FilterSectionLabel>
                  <TypeToChipInput
                    placeholder="Type in Room Numbers"
                    chips={activeFilters.roomNumbers}
                    onAdd={(v) =>
                      edit({ ...activeFilters, roomNumbers: [...activeFilters.roomNumbers, v] })
                    }
                    onRemove={(v) =>
                      edit({
                        ...activeFilters,
                        roomNumbers: activeFilters.roomNumbers.filter((x) => x !== v),
                      })
                    }
                  />
                </div>
              )}

              <div>
                <FilterSectionLabel>Length of stay</FilterSectionLabel>
                <BinaryChipRow<LengthOfStay>
                  options={[
                    ['one-night', 'One night'],
                    ['multiple-nights', 'Multiple nights'],
                  ]}
                  selected={activeFilters.lengthOfStay}
                  onChange={(v) => edit({ ...activeFilters, lengthOfStay: v })}
                />
              </div>

              <div>
                <FilterSectionLabel>Guest recurrence</FilterSectionLabel>
                <BinaryChipRow<GuestRecurrence>
                  options={[
                    ['first-time', 'First-time guest'],
                    ['recurring', 'Recurring guest'],
                  ]}
                  selected={activeFilters.guestRecurrence}
                  onChange={(v) => edit({ ...activeFilters, guestRecurrence: v })}
                />
              </div>
            </div>

            {/* ── Sticky live count ────────────────────────────────────── */}
            <div
              className="sticky top-0 z-10"
              style={{
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 12,
                paddingBottom: 12,
                backgroundColor: colors.colorWhite,
                borderTop: `1px solid ${colors.colorBlack6}`,
                borderBottom: `1px solid ${colors.colorBlack6}`,
              }}
            >
              <p
                className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                style={{ color: colors.colorBlack1 }}
              >
                {matchedCount} guest{matchedCount !== 1 ? 's' : ''} match
              </p>
              <p
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                style={{ color: colors.colorBlack3 }}
              >
                Updates as you edit
              </p>
            </div>

            {/* ── Matched guests ───────────────────────────────────────── */}
            <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 4 }}>
              {split.sending.length === 0 ? (
                <p
                  className="font-['Roboto',sans-serif] text-[13px] leading-[20px] text-center"
                  style={{ color: colors.colorBlack4, padding: 24 }}
                >
                  No one selected — this can&apos;t send.
                </p>
              ) : (
                split.sending.map((entry) => (
                  <GuestRow
                    key={entry.guestId}
                    entry={entry}
                    checked
                    onToggle={() => toggleGuestSelection(entry.guestId)}
                  />
                ))
              )}
            </div>

            {/* ── NOT SENDING ──────────────────────────────────────────── */}
            {hidden > 0 && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setNotSendingOpen((v) => !v)}
                  className="w-full flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#f9fafb]"
                  style={{
                    height: 36,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderTop: `1px solid ${colors.colorBlack6}`,
                    borderBottom: `1px solid ${colors.colorBlack6}`,
                  }}
                >
                  <Icon
                    path={notSendingOpen ? mdiChevronDown : mdiChevronRight}
                    size={0.67}
                    color={colors.colorBlack3}
                  />
                  <span
                    className="font-['Roboto',sans-serif] text-[10px] leading-[16px] uppercase font-medium whitespace-nowrap"
                    style={{ color: colors.colorBlack3, letterSpacing: '0.4px' }}
                  >
                    Not sending · {hidden}
                  </span>
                  <span className="flex-1" />
                  <span
                    className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
                    style={{ color: colors.colorBlack4 }}
                  >
                    {summariseNotSending(split)}
                  </span>
                </button>

                {notSendingOpen && (
                  <div style={{ paddingBottom: 16 }}>
                    <ReasonGroup
                      title="Opted out of messaging"
                      entries={split.unreachable.filter((e) => e.messagingOptedOut)}
                      locked
                    />
                    <ReasonGroup
                      title="No phone number"
                      entries={split.unreachable.filter((e) => !e.messagingOptedOut)}
                      locked
                    />
                    <ReasonGroup
                      title={
                        split.statusHeld.filter((e) => e.checkInStatus === 'checked-out').length >
                        split.statusHeld.length / 2
                          ? 'Already checked out'
                          : 'Already checked in'
                      }
                      entries={split.statusHeld}
                      onIncludeAll={() =>
                        addGuestsToSelection(split.statusHeld.map((e) => e.guestId))
                      }
                      onToggle={toggleGuestSelection}
                    />
                    <ReasonGroup
                      title="You unchecked"
                      entries={split.userRemoved}
                      onIncludeAll={() =>
                        addGuestsToSelection(split.userRemoved.map((e) => e.guestId))
                      }
                      onToggle={toggleGuestSelection}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </FloatingPanel>

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
