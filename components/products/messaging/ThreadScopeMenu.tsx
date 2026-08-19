/**
 * ThreadScopeMenu — the thread list's scoping controls.
 *
 * PRODUCTION AUDIT (read-only, from the chat module) — what it actually does:
 *
 *  - Production splits this across TWO controls: a `CanaryTabs` pill row for the
 *    folder (Inbox / Archived / Blocked) and a separate flat `CanarySelect` for
 *    assignment. An earlier redesign pass consolidated them into ONE menu; the
 *    landed frame (2038:57666) splits them again — two SELECTS in the list
 *    card's header, assignment on the left (where the card title used to sit)
 *    and folder on the right. The SEMANTICS below are production's, unchanged
 *    through both moves.
 *
 *  - ASSIGNMENT IS EXCLUSIVE. Production keeps three refs
 *    (assignedToDepartmentFilter / assignedToUserFilter / assignedFilter) and
 *    every setter NULLS the other two, so picking a department replaces
 *    "Assigned", and picking a person replaces a department. The server enforces
 *    the same thing, rejecting more than one assignment param. So All
 *    conversations / Assigned / Unassigned / a department / a person are one
 *    single-select axis, not five checkboxes.
 *
 *  - FOLDER AND ASSIGNMENT STACK (AND). Changing folder does not clear the
 *    assignment filter, so "Archived + Housekeeping" is reachable. Splitting the
 *    menu in two makes that stacking legible: each trigger names its own axis
 *    ("Housekeeping" · "Archived") instead of one trigger naming both.
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
 *    Conversations" because it occupies the card-title slot.
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
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiUnfoldMoreHorizontal, mdiCheck } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { ThreadFilter } from '@/lib/products/messaging/types';

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
 * The trigger sits in the card-title slot, so the default reads as a title:
 * "All Conversations" title-cased (the menu row stays production's sentence
 * case). Every other value is the same string in both places.
 */
export function assignmentTriggerLabel(scope: AssignmentScope): string {
  return scope.kind === 'all' ? 'All Conversations' : assignmentLabel(scope);
}

function Row({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 text-left transition-colors cursor-pointer hover:bg-[#f9fafb]"
      style={{ paddingLeft: 16, paddingRight: 14, paddingTop: 8, paddingBottom: 8 }}
    >
      <span
        className="flex-1 min-w-0 font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
        style={{ color: colors.colorBlack1 }}
      >
        {label}
      </span>
      <span className="w-4 shrink-0 flex items-center justify-center">
        {isActive && <Icon path={mdiCheck} size={0.7} color={colors.colorBlack3} />}
      </span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
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
  return <div className="w-full h-px" style={{ backgroundColor: colors.colorBlack6, marginTop: 6, marginBottom: 2 }} />;
}

/**
 * Shared select shell: trigger + outside-click popover. `align` decides which
 * edge the popover hangs from — the assignment select opens under the title on
 * the left, the folder select under its own trigger on the right.
 *
 * The popover is absolutely positioned INSIDE the list card, which is
 * `overflow-clip`. That is fine at these widths (both menus are narrower than
 * the header). The 480px max-height clears the full assignment list today
 * (~460px: 9 rows, 3 overlines, 2 dividers) and only starts scrolling if the
 * department/staff lists grow — the scrollbar is invisible, so a cap that bit
 * into the list would silently hide its last row.
 */
function ScopeSelect({
  triggerLabel,
  triggerColor,
  triggerSize,
  menuWidth,
  align,
  children,
  onRequestClose,
}: {
  triggerLabel: string;
  triggerColor: string;
  triggerSize: 14 | 16;
  menuWidth: number;
  align: 'left' | 'right';
  children: (close: () => void) => React.ReactNode;
  onRequestClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    onRequestClose?.();
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        title={triggerLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1 rounded-[6px] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.05)] min-w-0"
        style={{ height: 32, paddingLeft: 8, paddingRight: 6, maxWidth: '100%' }}
      >
        <span
          className={`font-['Roboto',sans-serif] font-medium leading-[24px] truncate min-w-0 ${
            triggerSize === 16 ? 'text-[16px]' : 'text-[14px]'
          }`}
          style={{ color: triggerColor }}
        >
          {triggerLabel}
        </span>
        <Icon path={mdiUnfoldMoreHorizontal} size={0.7} color={colors.colorBlueDark1} />
      </button>

      {isOpen && (
        <div
          role="listbox"
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
          {children(close)}
        </div>
      )}
    </div>
  );
}

/**
 * LEFT select — the assignment axis, sitting in the card-title slot. Sections
 * are STATUSES / DEPARTMENTS / STAFF; the whole thing is ONE single-select
 * group, so choosing a department clears "Assigned" and choosing a person
 * clears the department (production's exclusivity, preserved exactly).
 */
export function AssignmentSelect({
  assignment,
  onAssignmentChange,
}: {
  assignment: AssignmentScope;
  onAssignmentChange: (a: AssignmentScope) => void;
}) {
  return (
    <ScopeSelect
      triggerLabel={assignmentTriggerLabel(assignment)}
      triggerColor={colors.colorBlack1}
      triggerSize={16}
      menuWidth={264}
      align="left"
    >
      {(close) => (
        <>
          <SectionLabel>Statuses</SectionLabel>
          {(['all', 'assigned', 'unassigned'] as const).map((kind) => (
            <Row
              key={kind}
              label={assignmentLabel({ kind })}
              isActive={assignment.kind === kind}
              onClick={() => {
                onAssignmentChange({ kind });
                close();
              }}
            />
          ))}

          <Divider />
          <SectionLabel>Departments</SectionLabel>
          {DEPARTMENTS.map((d) => (
            <Row
              key={d.id}
              label={d.name}
              isActive={assignment.kind === 'department' && assignment.id === d.id}
              onClick={() => {
                onAssignmentChange({ kind: 'department', id: d.id });
                close();
              }}
            />
          ))}

          <Divider />
          <SectionLabel>Staff</SectionLabel>
          {STAFF.map((u) => (
            <Row
              key={u.id}
              label={u.name}
              isActive={assignment.kind === 'user' && assignment.id === u.id}
              onClick={() => {
                onAssignmentChange({ kind: 'user', id: u.id });
                close();
              }}
            />
          ))}
        </>
      )}
    </ScopeSelect>
  );
}

/** RIGHT select — the folder axis. Inbox / Archived / Blocked, check on active. */
export function FolderSelect({
  folder,
  onFolderChange,
}: {
  folder: ThreadFilter;
  onFolderChange: (f: ThreadFilter) => void;
}) {
  const label = FOLDERS.find((f) => f.id === folder)?.label ?? 'Inbox';

  return (
    <ScopeSelect
      triggerLabel={label}
      triggerColor={colors.colorBlueDark1}
      triggerSize={14}
      menuWidth={176}
      align="right"
    >
      {(close) => (
        <>
          {FOLDERS.map((f) => (
            <Row
              key={f.id}
              label={f.label}
              isActive={folder === f.id}
              onClick={() => {
                onFolderChange(f.id);
                close();
              }}
            />
          ))}
        </>
      )}
    </ScopeSelect>
  );
}
