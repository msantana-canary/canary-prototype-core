/**
 * ThreadScopeMenu — the thread list's scoping controls.
 *
 * PRODUCTION AUDIT (read-only, from the chat module) — what it actually does:
 *
 *  - Production splits this across TWO controls: a `CanaryTabs` pill row for the
 *    folder (Inbox / Archived / Blocked) and a separate flat `CanarySelect` for
 *    assignment. An earlier redesign pass consolidated them into ONE menu; frame
 *    2038:57666 split them again — two SELECTS in the list card's header,
 *    assignment on the left (where the card title used to sit) and folder on the
 *    right. The design review of **2026-08-21** SWAPPED THEM: the arrangement
 *    below is the THIRD, and it is frame `2112:26219`.
 *
 *      1st  one consolidated menu, trigger naming both axes ("Inbox · Housekeeping")
 *      2nd  assignment LEFT in the title slot (16px black) · folder RIGHT (14px blue)
 *      3rd  folder LEFT in the title slot (16px black) · assignment RIGHT (14px blue)
 *
 *    WHY THE SWAP. The title slot is the card's NAME, and a name should be the
 *    stabler of the two axes: the folder is a place you are IN (Inbox, and it
 *    stays Inbox for whole shifts), while the assignment is a filter you throw
 *    at that place and take off again. Titling the card "All Conversations" and
 *    then quietly changing it to "Housekeeping" renamed the card every time you
 *    narrowed it. Now the card is called what it IS — "Inbox" — and the filter
 *    sits on the right in the blue that already means "this is a control", with
 *    its label always reporting the live selection so the scope is legible
 *    without opening anything.
 *
 *    The SEMANTICS below are production's, unchanged through all three moves.
 *    Nothing about the menus, the sections or the `ScopeSelect` contract moved
 *    with the triggers — this was placement and register only.
 *
 *  - ASSIGNMENT IS EXCLUSIVE. Production keeps three refs
 *    (assignedToDepartmentFilter / assignedToUserFilter / assignedFilter) and
 *    every setter NULLS the other two, so picking a department replaces
 *    "Assigned", and picking a person replaces a department. The server enforces
 *    the same thing, rejecting more than one assignment param. So All
 *    conversations / Assigned / Unassigned / a department / a person are one
 *    single-select axis, not five checkboxes. Here that rule is structural: the
 *    whole assignment menu is ONE option list with ONE `value`, so it cannot
 *    represent two simultaneous choices even by accident.
 *
 *  - FOLDER AND ASSIGNMENT STACK (AND). Changing folder does not clear the
 *    assignment filter, so "Archived + Housekeeping" is reachable. Splitting the
 *    menu in two makes that stacking legible: each trigger names its own axis
 *    ("Archived" · "Housekeeping") instead of one trigger naming both.
 *
 *  - DEPARTMENT MATCHING IS TRANSITIVE: a department matches threads assigned
 *    directly to it OR assigned to a user who belongs to it. User matching is
 *    exact-uuid only, never transitive.
 *
 *  - "Assigned"/"Unassigned" mean assigned to ANYONE, not to me. Production has
 *    no "assigned to me" option and never compares against the current user.
 *
 *  - Copy is production's verbatim: "Inbox" / "Archived" (not "Archive") /
 *    "Blocked", and "All conversations" / "Assigned" / "Unassigned". The
 *    assignment TRIGGER is the one exception — the frame title-cases it to "All
 *    Conversations". It kept that casing through the 8/21 swap: the string is
 *    the frame's, and it is the only trigger label that is a PHRASE rather than
 *    a proper noun, so title case is what stops it reading as a sentence
 *    fragment beside "Housekeeping" and "Theresa Webb".
 *
 *  CHANNELS: none. An earlier pass built a channel axis from the mock; the
 *  audit found production has no channel filter on the conversation list at all
 *  (no channel param in the request schema, and "Non-Web Chat" appears nowhere
 *  in the codebase), and the designer declined it — "we don't do channels then
 *  don't add it". So these menus are exactly production's TWO axes.
 *
 * MENU REGISTER (frame `dd-allconv` / `dd-inbox`): white rounded-8 popover,
 * 1px colorBlack6 border and NO drop shadow (branch-wide rule), uppercase gray
 * section overlines, hairline dividers BETWEEN sections, and a right-aligned
 * check on the active row. No blue selection tint — with one axis per menu
 * there is only ever one tick on screen, so the tick alone carries it.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ WHY THIS IS NOT LITERALLY `<CanarySelect>` — and what it borrows instead
 * ═══════════════════════════════════════════════════════════════════════════
 * Miguel 2026-08-20: *"take the CanarySelect as the base structure so that it's
 * not a massive deviance from the real product."* Both menus were rebuilt
 * against that brief. The finding, recorded here so nobody re-litigates it:
 *
 * `@canary-ui`'s **`CanarySelect` is a thin wrapper around a native
 * `<select>`** — it forwards a `ref` to `HTMLSelectElement`, spreads
 * `SelectHTMLAttributes` onto it, and renders `options` as plain `<option>`
 * children. Its popover is therefore drawn by the OPERATING SYSTEM. Nothing in
 * this file's design contract survives that:
 *
 *   | The frame needs            | Native `<select>` / CanarySelect gives      |
 *   |----------------------------|---------------------------------------------|
 *   | STATUSES/DEPARTMENTS/STAFF | no grouping at all — `options` is a FLAT     |
 *   |   uppercase overlines      |   array; no `<optgroup>`, and even with one  |
 *   |                            |   the label's type/colour is OS-controlled   |
 *   | hairline dividers between  | nothing; not expressible                     |
 *   |   sections                 |                                              |
 *   | a right-aligned check row  | OS-drawn selection mark, position/glyph not  |
 *   |                            |   ours                                       |
 *   | 264px / 176px popovers,    | OS-sized and OS-positioned                   |
 *   |   white rounded-8, 1px     |                                              |
 *   |   colorBlack6, no shadow   |                                              |
 *   | a BORDERLESS trigger in    | a full-width bordered field box on the       |
 *   |   the card-title slot,     |   library's fixed 32/40/48px ramp            |
 *   |   16px medium + ⇅          |                                              |
 *
 * So "keep the trigger and the popover, replace only the menu content" is not
 * on the table: `CanarySelect` has no separable trigger or popover to keep.
 * What this file keeps instead is its **contract**, so a future swap is
 * mechanical rather than a rewrite:
 *
 *   1. Options are the library's own `CanarySelectOption` type
 *      (`{ label, value, disabled? }`), extended by exactly ONE field —
 *      `section` — which is the capability gap named above. Drop `section` and
 *      the arrays below feed `<CanarySelect>` unmodified.
 *   2. One controlled `value` + one `onChange`, single-select, `disabled`
 *      options honoured — same state shape as the library control.
 *   3. Trigger sizing comes off the library's `InputSize` ramp, not magic
 *      numbers.
 *   4. The a11y contract a native `<select>` gave us for free is rebuilt by
 *      hand rather than dropped: `role="combobox"`/`listbox`/`option`,
 *      `aria-selected`, `aria-activedescendant`, and full keyboard operation
 *      (Enter/Space/↓/↑ to open, ↑/↓/Home/End to move, Enter/Space to pick,
 *      Escape/Tab to close). The version this replaced had NONE of that — it
 *      was a `<button>` and a `role="listbox"` div with click handlers.
 *
 * ⚠ KNOWN LIBRARY QUIRK, checked: `CanarySelect` renders its `placeholder`
 * (or, failing that, its `label`) as a real `<option value="" disabled>` — a
 * phantom row inside the menu. `ScopeSelect` deliberately has NO placeholder
 * prop. Both axes always hold a real selection ("All conversations" / "Inbox"
 * are values, not empty states), so a placeholder would be a lie as well as an
 * extra row. Nothing here can grow one.
 *
 * The two gaps — option SECTIONS and a stylable CHECK ROW — are logged as
 * foundation-library asks in REDESIGN_NOTES.md.
 */

'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiUnfoldMoreHorizontal, mdiCheck } from '@mdi/js';
import { colors, InputSize, type CanarySelectOption } from '@canary-ui/components';
import { ThreadFilter } from '@/lib/products/messaging/types';

/* ─────────────────────────────────────────────────────────────────────────
   The option model: the library's, plus one field.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * A `CanarySelectOption` that also knows which section it belongs to.
 *
 * Options sharing a `section` MUST be contiguous — the renderer walks the array
 * once and opens a new overline every time the value changes, exactly the way
 * `<optgroup>` would if the library's option model had one. `undefined` means
 * "no overline" (the folder menu's three rows).
 */
export interface ScopeSelectOption extends CanarySelectOption {
  section?: string;
}

/** Trigger heights, off the library's `InputSize` ramp — not magic numbers. */
const TRIGGER_HEIGHT: Partial<Record<InputSize, number>> = {
  [InputSize.COMPACT]: 32,
  [InputSize.NORMAL]: 40,
};

/* ─────────────────────────────────────────────────────────────────────────
   Domain
   ───────────────────────────────────────────────────────────────────────── */

/** The assignment axis — one value at a time, production's rule. */
export type AssignmentScope =
  | { kind: 'all' }
  | { kind: 'assigned' }
  | { kind: 'unassigned' }
  | { kind: 'department'; id: string }
  | { kind: 'user'; id: string };

export const DEPARTMENTS: { id: string; name: string }[] = [
  { id: 'dept-housekeeping', name: 'Housekeeping' },
  { id: 'dept-food-beverage', name: 'Food and Beverage' },
  { id: 'dept-front-office', name: 'Front Office' },
];

export const STAFF: { id: string; name: string }[] = [
  { id: 'u-miguel', name: 'Miguel Santana' },
  { id: 'u-david', name: 'David Chen' },
  { id: 'u-wenjun', name: 'Wenjun Li' },
];

const FOLDERS: { id: ThreadFilter; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archived', label: 'Archived' },
  { id: 'blocked', label: 'Blocked' },
];

export function assignmentLabel(scope: AssignmentScope): string {
  switch (scope.kind) {
    case 'all':
      return 'All conversations';
    case 'assigned':
      return 'Assigned';
    case 'unassigned':
      return 'Unassigned';
    case 'department':
      return DEPARTMENTS.find((d) => d.id === scope.id)?.name ?? 'Department';
    case 'user':
      return STAFF.find((u) => u.id === scope.id)?.name ?? 'Staff';
  }
}

/**
 * What the assignment TRIGGER reads. It always reports the live selection —
 * "Housekeeping", "Theresa Webb", "Unassigned" — so the scope is legible without
 * opening the menu; only the default is title-cased to "All Conversations" (the
 * menu row stays production's sentence case). Every other value is the same
 * string in both places, because a department is a proper noun in both.
 */
export function assignmentTriggerLabel(scope: AssignmentScope): string {
  return scope.kind === 'all' ? 'All Conversations' : assignmentLabel(scope);
}

/**
 * AssignmentScope ⇄ option value. The select carries ONE string, which is what
 * makes production's exclusivity structural rather than enforced by hand: there
 * is nowhere to put a second assignment.
 */
function scopeToValue(scope: AssignmentScope): string {
  switch (scope.kind) {
    case 'department':
      return `dept:${scope.id}`;
    case 'user':
      return `user:${scope.id}`;
    default:
      return scope.kind;
  }
}

function valueToScope(value: string): AssignmentScope {
  if (value.startsWith('dept:')) return { kind: 'department', id: value.slice(5) };
  if (value.startsWith('user:')) return { kind: 'user', id: value.slice(5) };
  if (value === 'assigned' || value === 'unassigned') return { kind: value };
  return { kind: 'all' };
}

/* ─────────────────────────────────────────────────────────────────────────
   Presentation pieces
   ───────────────────────────────────────────────────────────────────────── */

function SectionLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      /* Presentational to the a11y tree: a `role="listbox"` may only contain
         options and groups, and the library's option model has no grouping for
         us to map onto (see the file header). The overline is a visual
         affordance; the option labels are unambiguous without it. */
      role="presentation"
      className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
      style={{
        color: colors.colorBlack4,
        letterSpacing: '0.4px',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 10,
        paddingBottom: 4,
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div
      className="w-full h-px"
      role="presentation"
      style={{ backgroundColor: colors.colorBlack6, marginTop: 6, marginBottom: 2 }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ScopeSelect — the shared shell both menus are built on.
   ───────────────────────────────────────────────────────────────────────── */

interface ScopeSelectProps {
  /** Library-shaped options, plus the `section` overline the library lacks. */
  options: ScopeSelectOption[];
  /** The single selected value. There is no empty state — see the file header. */
  value: string;
  /**
   * CanarySelect hands back a `ChangeEvent<HTMLSelectElement>`; our trigger is
   * a button, so there is no such event to forge. The value is handed back
   * directly — the one deliberate deviation from the library's signature.
   */
  onChange: (value: string) => void;
  /** What the trigger reads. Usually the selected option's label, but the
   *  assignment axis title-cases its default (see `assignmentTriggerLabel`). */
  triggerLabel: string;
  triggerColor: string;
  triggerTextSize: 14 | 16;
  size?: InputSize;
  menuWidth: number;
  /** Which edge the popover hangs from. */
  align: 'left' | 'right';
  /** Names the AXIS, since the visible trigger names only its current value. */
  ariaLabel: string;
}

/**
 * Trigger + popover listbox.
 *
 * The popover is absolutely positioned INSIDE the list card, which is
 * `overflow-clip`. That is fine at these widths (both menus are narrower than
 * the header). The 480px max-height clears the full assignment list today
 * (~460px: 9 rows, 3 overlines, 2 dividers) and only starts scrolling if the
 * department/staff lists grow — the scrollbar is invisible, so a cap that bit
 * into the list would silently hide its last row.
 */
function ScopeSelect({
  options,
  value,
  onChange,
  triggerLabel,
  triggerColor,
  triggerTextSize,
  size = InputSize.COMPACT,
  menuWidth,
  align,
  ariaLabel,
}: ScopeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((o) => String(o.value) === value),
    [options, value]
  );

  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const close = (focusTrigger = false) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const open = () => {
    setIsOpen(true);
    // Open ON the current selection, the way a native select does.
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled(options, 0, 1));
  };

  const commit = (i: number) => {
    const option = options[i];
    if (!option || option.disabled) return;
    onChange(String(option.value));
    close(true);
  };

  // Outside click closes. Kept on mousedown so a click that lands on another
  // control does not first fire that control's own handler through an open menu.
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  // Keep the highlighted row in view when arrowing past the 480px cap.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  /** A native select's keyboard contract, rebuilt. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => firstEnabled(options, i + 1, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => firstEnabled(options, i - 1, -1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(firstEnabled(options, 0, 1));
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(firstEnabled(options, options.length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        break;
    }
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={onKeyDown}
        title={triggerLabel}
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={`${baseId}-list`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        className="flex items-center gap-1 rounded-[6px] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.05)] min-w-0"
        style={{
          height: TRIGGER_HEIGHT[size] ?? 32,
          paddingLeft: 8,
          paddingRight: 6,
          maxWidth: '100%',
        }}
      >
        <span
          className={`font-['Roboto',sans-serif] font-medium leading-[24px] truncate min-w-0 ${
            triggerTextSize === 16 ? 'text-[16px]' : 'text-[14px]'
          }`}
          style={{ color: triggerColor }}
        >
          {triggerLabel}
        </span>
        {/* The ⇅ takes the TRIGGER's colour rather than a fixed blue: after the
            8/21 swap the two triggers are a black title and a blue control, and
            a blue glyph on the black one made the title look half-linked. One
            colour per trigger, glyph included. */}
        <Icon path={mdiUnfoldMoreHorizontal} size={0.7} color={triggerColor} />
      </button>

      {isOpen && (
        <div
          id={`${baseId}-list`}
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 rounded-[8px] bg-white overflow-y-auto scrollbar-invisible ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{
            top: 36,
            width: menuWidth,
            maxHeight: 480,
            paddingTop: 4,
            paddingBottom: 4,
            border: `1px solid ${colors.colorBlack6}`,
          }}
        >
          {options.map((option, i) => {
            const previousSection = i === 0 ? undefined : options[i - 1].section;
            const opensSection = option.section !== undefined && option.section !== previousSection;
            const isSelected = String(option.value) === value;
            const isActive = i === activeIndex;

            return (
              <React.Fragment key={String(option.value)}>
                {opensSection && (
                  <>
                    {i > 0 && <Divider />}
                    <SectionLabel id={`${baseId}-sec-${i}`}>{option.section}</SectionLabel>
                  </>
                )}
                <div
                  id={optionId(i)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onClick={() => commit(i)}
                  onMouseEnter={() => !option.disabled && setActiveIndex(i)}
                  className="w-full flex items-center gap-2 text-left transition-colors"
                  style={{
                    paddingLeft: 16,
                    paddingRight: 14,
                    paddingTop: 8,
                    paddingBottom: 8,
                    cursor: option.disabled ? 'default' : 'pointer',
                    backgroundColor: isActive && !option.disabled ? '#f9fafb' : 'transparent',
                    opacity: option.disabled ? 0.5 : 1,
                  }}
                >
                  <span
                    className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {option.label}
                  </span>
                  {/* The check is the ONLY selection signal — no blue tint. With
                      one axis per menu there is never more than one tick. */}
                  <span className="w-4 shrink-0 flex items-center justify-center">
                    {isSelected && <Icon path={mdiCheck} size={0.7} color={colors.colorBlack3} />}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Next selectable index from `start` walking in `step`, clamped at the ends. */
function firstEnabled(options: ScopeSelectOption[], start: number, step: 1 | -1): number {
  for (let i = Math.max(0, Math.min(start, options.length - 1)); i >= 0 && i < options.length; i += step) {
    if (!options[i].disabled) return i;
  }
  return start < 0 ? 0 : Math.min(start, options.length - 1);
}

/* ─────────────────────────────────────────────────────────────────────────
   The two axes
   ───────────────────────────────────────────────────────────────────────── */

/**
 * RIGHT select (since 8/21) — the assignment axis, in the blue control register.
 * Sections are STATUSES / DEPARTMENTS / STAFF; the whole thing is ONE
 * single-select option list, so choosing a department clears "Assigned" and
 * choosing a person clears the department (production's exclusivity, now
 * structural).
 *
 * The trigger reads the LIVE selection, so "Housekeeping" or "Theresa Webb"
 * stands where "All Conversations" was. That is the whole point of moving it out
 * of the title slot: the label may change on every pick, and a card whose NAME
 * changes on every pick is a card you have to re-read.
 */
export function AssignmentSelect({
  assignment,
  onAssignmentChange,
}: {
  assignment: AssignmentScope;
  onAssignmentChange: (a: AssignmentScope) => void;
}) {
  const options: ScopeSelectOption[] = useMemo(
    () => [
      ...(['all', 'assigned', 'unassigned'] as const).map((kind) => ({
        value: kind,
        label: assignmentLabel({ kind }),
        section: 'Statuses',
      })),
      ...DEPARTMENTS.map((d) => ({
        value: `dept:${d.id}`,
        label: d.name,
        section: 'Departments',
      })),
      ...STAFF.map((u) => ({
        value: `user:${u.id}`,
        label: u.name,
        section: 'Staff',
      })),
    ],
    []
  );

  return (
    <ScopeSelect
      options={options}
      value={scopeToValue(assignment)}
      onChange={(v) => onAssignmentChange(valueToScope(v))}
      triggerLabel={assignmentTriggerLabel(assignment)}
      triggerColor={colors.colorBlueDark1}
      triggerTextSize={14}
      menuWidth={264}
      align="right"
      ariaLabel="Filter conversations by assignment"
    />
  );
}

/**
 * LEFT select (since 8/21) — the folder axis, in the card-title slot. Inbox /
 * Archived / Blocked, check on the active row.
 *
 * It gets the title register because it is the stabler axis: a folder is a place
 * you are in for a whole shift, and "Inbox" is what this card IS. Three values,
 * all proper nouns, so the slot never has to hold a phrase.
 */
export function FolderSelect({
  folder,
  onFolderChange,
}: {
  folder: ThreadFilter;
  onFolderChange: (f: ThreadFilter) => void;
}) {
  const options: ScopeSelectOption[] = useMemo(
    () => FOLDERS.map((f) => ({ value: f.id, label: f.label })),
    []
  );

  const label = FOLDERS.find((f) => f.id === folder)?.label ?? 'Inbox';

  return (
    <ScopeSelect
      options={options}
      value={folder}
      onChange={(v) => onFolderChange(v as ThreadFilter)}
      triggerLabel={label}
      triggerColor={colors.colorBlack1}
      triggerTextSize={16}
      menuWidth={176}
      align="left"
      ariaLabel="Filter conversations by folder"
    />
  );
}
