/**
 * BroadcastFilterPanel — the recipients + filter surface. A MODAL, not a panel
 * (Miguel's ruling, 2026-08-25): "for broadcasts we had it as a modal." The
 * panel shape here was a spec miss — grandfathered from the old Builder-modal
 * canon through the panel-standard consolidation (see `PanelShell`'s history),
 * never an actual design decision for broadcasts. Corrected here; the surface's
 * OTHER two broadcast panels — delivery "Message details" (`BroadcastDelivery-
 * Panel`) and the scheduled-broadcast detail (`BroadcastScheduledPanel`) — are
 * unaffected and stay panels.
 *
 * Opened from the To strip — the funnel icon or the strip itself; there is no
 * other entry point. Filtering and reviewing who receives are still the same
 * job, so it is still one surface, just a wide two-column modal instead of a
 * 600px panel:
 *   LEFT   — attribute stack: loyalty chips, `CanaryInputMultiple` codes,
 *            binary chips (the Builder's controls, which survived). "Start
 *            from a segment" is gated off — see `SHOW_START_FROM_SEGMENT`.
 *   RIGHT  — a bordered card: "N guests match" header over the FULL matched
 *            roster in one sorted list — reachable rows toggle with a
 *            trailing check, unreachable rows stay inline, greyed, with their
 *            reason on the sub-line. No NOT SENDING roll-up in this modal.
 *
 * Filters apply LIVE. There is no Apply/footer button: the right column is also
 * the recipients list, so staged pending-criteria would leave it disagreeing
 * with the controls beside it.
 *
 * ── FIXED 887×738 MODAL, PER FIGMA 1435-17906 (2026-08-26) ─────────────────
 * `!max-w-[887px]` supersedes the earlier `!max-w-[1300px]` wide-modal
 * deviation, now measured exactly off Miguel's frame: 24px outer insets, two
 * 407.5px columns, a 24px gutter (24+407.5+24+407.5+24 = 887) — carried by the
 * body's own `px-6`/`gap-6` rather than per-column padding. The body slot also
 * gets a FIXED flex-basis (666px = 738 total − the 72px header) with
 * `grow-0`/`shrink`/`min-h-0`, so the modal's rendered height is IDENTICAL
 * whether 21, 1, or 0 guests match — geometry here is never content-driven.
 * `max-h-[90vh]` still clamps (and compresses the body, never the header) on
 * short viewports.
 *
 * ── HAND-ROLLED CONTROLS ────────────────────────────────────────────────────
 * `FilterChip` / `BinaryChipRow`, both in `./BroadcastFilterControls`, predate
 * the base-component era and are NOT `CanaryChip` — see that file's own note on
 * why (`CanaryChip` SELECTABLE hardwires a blue unselected hairline these chips
 * don't want, and there is no neutral-outline register to ask for instead).
 * Rate code / Group code / Room number moved OFF the hand-rolled
 * `TypeToChipInput` (deleted 2026-08-26) onto the library's own
 * `CanaryInputMultiple`. `GuestRow`'s trailing-check row is a NEW hand-rolled
 * exception in the same batch: the Figma row anatomy has no leading checkbox,
 * so `CanaryCheckbox` comes out in favour of a `role="checkbox"` div — logged
 * below, not a re-audit of every control on this surface.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import {
  colors,
  CanarySelect,
  CanaryButton,
  CanaryInput,
  CanaryInputMultiple,
  CanaryModal,
  ButtonType,
  InputSize,
} from '@canary-ui/components';
import { Avatar } from '../Avatar';
import {
  FilterSectionLabel,
  FilterChip,
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
  guestRoomMethod,
  sortGuestsByLastName,
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
import { resolveBroadcastGuest } from '@/lib/products/messaging/broadcast-contacts';
import { reservations } from '@/lib/core/data/reservations';
import { Segment } from '@/lib/products/guest-journey/types';
import { useGuestJourneyStore } from '@/lib/products/guest-journey/store';
import { ModalFocusScope } from '@/components/products/messaging/ModalFocusScope';

// Miguel 2026-08-26: not in the Figma frame (1435-17906) — the segments
// feature resurfaces later. Gated at the render only: `handleStartFrom`,
// `segmentOptions`, `sourceSegmentId`, and the Save-as-segment nested modal
// stay wired but unreachable, same idiom as `SHOW_SOURCES_CHIP` in
// `MessageBubble.tsx`. Flip back to `true` when the section returns.
const SHOW_START_FROM_SEGMENT = false;

/**
 * `CanaryInputMultiple` commits whatever was typed, verbatim — it does not
 * normalize. Rate/group/room codes are case-insensitive identifiers, so every
 * commit gets upper-cased and de-duplicated before it reaches the store, the
 * same net effect the deleted `TypeToChipInput` got from checking
 * `chips.includes(v)` before calling `onAdd`.
 */
function normalizeCodeValues(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = raw.toUpperCase();
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function roomOf(entry: BroadcastGuestEntry): string {
  const r = reservations[entry.reservationId];
  return r ? `${r.room}${r.roomType ? ` ${r.roomType}` : ''}` : '';
}

/**
 * One roster row. Reachable guests are a real `role="checkbox"` control —
 * trailing check, hover wash, keyboard toggle — because the Figma row anatomy
 * (1435-17906) has no leading checkbox to hang `CanaryCheckbox` on; unreachable
 * guests (opted out / no phone) render inline in the same list, greyed, with
 * their reason folded into the sub-line by `guestRoomMethod`, `aria-disabled`
 * and un-toggleable. See the file header for why this is hand-rolled rather
 * than a base-component wrap.
 */
function GuestRow({
  entry,
  reachable,
  checked,
  onToggle,
}: {
  entry: BroadcastGuestEntry;
  reachable: boolean;
  checked: boolean;
  onToggle?: () => void;
}) {
  const guest = resolveBroadcastGuest(entry.guestId);
  const [isHovered, setIsHovered] = useState(false);
  if (!guest) return null;
  const subtitle = guestRoomMethod(entry, roomOf(entry));
  const hovered = reachable && isHovered;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onToggle?.();
  };

  return (
    <div
      role={reachable ? 'checkbox' : undefined}
      aria-checked={reachable ? checked : undefined}
      aria-disabled={reachable ? undefined : true}
      tabIndex={reachable ? 0 : undefined}
      onClick={reachable ? onToggle : undefined}
      onKeyDown={reachable ? handleKeyDown : undefined}
      onMouseEnter={reachable ? () => setIsHovered(true) : undefined}
      onMouseLeave={reachable ? () => setIsHovered(false) : undefined}
      className={`flex items-center gap-3 rounded-[6px] transition-colors outline-none ${
        reachable ? 'cursor-pointer' : ''
      }`}
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: hovered ? colors.colorBlack8 : undefined,
      }}
    >
      <Avatar src={guest.avatar} initials={guest.initials} size="small" />
      <div className="flex-1 min-w-0">
        <div
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px] font-medium truncate"
          style={{ color: reachable ? colors.colorBlack1 : colors.colorBlack3 }}
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
      {reachable && checked && (
        <Icon
          path={mdiCheck}
          size={0.833}
          color={hovered ? colors.colorBlack1 : colors.colorBlueDark1}
          className="shrink-0"
        />
      )}
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
    selectedDate,
    applyFilters,
    toggleGuestSelection,
    showSegmentSavedToast,
  } = useBroadcastStore();

  const gjSegments = useGuestJourneyStore((s) => s.segments);
  const { createSegment } = useGuestJourneyStore();

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
    () => getAudienceSplit(selectedGroupId, allGroups, activeFilters, selectedGuestIds, selectedDate),
    [selectedGroupId, allGroups, activeFilters, selectedGuestIds, selectedDate]
  );

  /** The roster in "normal sort position" — reachable and unreachable guests
   *  interleaved by last name, not split into a matched list plus a NOT
   *  SENDING roll-up. See `GuestRow` / the right column below. */
  const rows = useMemo(() => sortGuestsByLastName(split.visible), [split.visible]);

  const matchedCount = useMemo(
    () =>
      isFilterEmpty(activeFilters)
        ? split.visible.filter(canMessageGuest).length
        : getFilteredGuestEntries(selectedGroupId, allGroups, activeFilters, selectedDate).filter(
            canMessageGuest
          ).length,
    [activeFilters, selectedGroupId, allGroups, split.visible, selectedDate]
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

  return (
    <>
      {/* THE FILTER MODAL — fixed 887×738, per Figma 1435-17906. See the file
          header for the full geometry note. `nth-child(2)` is the library's
          own body div (`CanaryModal` only renders a header div at all when
          `title` or `showCloseButton` is set, which is always true here, so
          the body is reliably child 2): turned into a `!flex` row (default
          `align-items: stretch` gives each column the body's full height for
          free) with `!px-6`/`!gap-6` carrying the 24px outer insets and
          gutter instead of per-column padding, `!grow-0`/`!shrink`/
          `!basis-[666px]` fixing its height independent of content, and
          `!overflow-hidden` + `!min-h-0` so the body itself never scrolls —
          each column scrolls on its own. */}
      <ModalFocusScope isOpen={isOpen}>
        <CanaryModal
          isOpen={isOpen}
          onClose={onClose}
          title={`${audienceName} guests`}
          size="large"
          className="!max-w-[887px] [&>div:nth-child(2)]:!flex [&>div:nth-child(2)]:!px-6 [&>div:nth-child(2)]:!py-0 [&>div:nth-child(2)]:!gap-6 [&>div:nth-child(2)]:!overflow-hidden [&>div:nth-child(2)]:!min-h-0 [&>div:nth-child(2)]:!grow-0 [&>div:nth-child(2)]:!shrink [&>div:nth-child(2)]:!basis-[666px] [&>div:first-child]:border-b [&>div:first-child]:border-[#E5E5E5]"
        >
          {/* ── LEFT: attribute stack ──────────────────────────────────── */}
          <div
            className="flex-1 min-w-0 min-h-0 overflow-y-auto scrollbar-invisible flex flex-col gap-4"
            style={{ paddingTop: 20, paddingBottom: 20 }}
          >
            {SHOW_START_FROM_SEGMENT && (
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
            )}

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

            <CanaryInputMultiple
              label="Rate code"
              placeholder="Type in Rate Codes"
              values={activeFilters.rateCodes}
              onChange={(values) =>
                edit({ ...activeFilters, rateCodes: normalizeCodeValues(values) })
              }
              size={InputSize.NORMAL}
              helperText='Press "Enter" to add'
            />

            <CanaryInputMultiple
              label="Group code"
              placeholder="Type in Group Codes"
              values={activeFilters.groupCodes}
              onChange={(values) =>
                edit({ ...activeFilters, groupCodes: normalizeCodeValues(values) })
              }
              size={InputSize.NORMAL}
              helperText='Press "Enter" to add'
            />

            {/* Room Number stays hidden on Arrivals — nobody has a room yet. */}
            {!isArrivals && (
              <CanaryInputMultiple
                label="Room number"
                placeholder="Type in Room Numbers"
                values={activeFilters.roomNumbers}
                onChange={(values) =>
                  edit({ ...activeFilters, roomNumbers: normalizeCodeValues(values) })
                }
                size={InputSize.NORMAL}
                helperText='Press "Enter" to add'
              />
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

          {/* ── RIGHT: matched-guest card ──────────────────────────────── */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col" style={{ paddingTop: 20, paddingBottom: 20 }}>
            <div
              className="flex-1 min-h-0 flex flex-col rounded-[8px] overflow-hidden"
              style={{ border: `1px solid ${colors.colorBlack6}` }}
            >
              {/* Live count — shrink-0 so it stays put while only the list
                  below it scrolls. The "Updates as you edit" caption is a
                  hidden layer in Figma 1435-17906 and does not render. */}
              <div
                className="shrink-0"
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${colors.colorBlack6}`,
                }}
              >
                <p
                  className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  {matchedCount} guest{matchedCount !== 1 ? 's' : ''} match
                </p>
              </div>

              {/* The full roster, one sorted list — no NOT SENDING roll-up in
                  this modal (Figma 1435-17906). Reachable guests toggle with
                  a trailing check; unreachable guests stay inline, greyed,
                  un-toggleable, with their reason on the sub-line. */}
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
                <div style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 4 }}>
                  {rows.length === 0 ? (
                    <p
                      className="font-['Roboto',sans-serif] text-[13px] leading-[20px] text-center"
                      style={{ color: colors.colorBlack4, padding: 24 }}
                    >
                      No one selected — this can&apos;t send.
                    </p>
                  ) : (
                    rows.map((entry) => {
                      const reachable = canMessageGuest(entry);
                      return (
                        <GuestRow
                          key={entry.guestId}
                          entry={entry}
                          reachable={reachable}
                          checked={reachable && selectedGuestIds.includes(entry.guestId)}
                          onToggle={
                            reachable ? () => toggleGuestSelection(entry.guestId) : undefined
                          }
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </CanaryModal>
      </ModalFocusScope>

      {/* Save as Guest Segment */}
      <ModalFocusScope isOpen={isSaveOpen}>
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
      </ModalFocusScope>
    </>
  );
}
