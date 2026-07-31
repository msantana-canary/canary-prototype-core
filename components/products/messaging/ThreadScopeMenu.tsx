/**
 * ThreadScopeMenu — the thread list's scoping control.
 *
 * PRODUCTION AUDIT (read-only, from the chat module) — what it actually does:
 *
 *  - Production splits this across TWO controls: a `CanaryTabs` pill row for the
 *    folder (Inbox / Archived / Blocked) and a separate flat `CanarySelect` for
 *    assignment. The landed design consolidates them into one menu; the
 *    SEMANTICS below are production's, unchanged.
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
 *    assignment filter, so "Archived + Housekeeping" is reachable.
 *
 *  - DEPARTMENT MATCHING IS TRANSITIVE: a department matches threads assigned
 *    directly to it OR assigned to a user who belongs to it. User matching is
 *    exact-uuid only, never transitive.
 *
 *  - "Assigned"/"Unassigned" mean assigned to ANYONE, not to me. Production has
 *    no "assigned to me" option and never compares against the current user.
 *
 *  - Copy is production's verbatim: "Inbox" / "Archived" (not "Archive") /
 *    "Blocked", and "All conversations" / "Assigned" / "Unassigned".
 *
 *  CHANNELS: none. An earlier pass built a channel axis from the mock; the
 *  audit found production has no channel filter on the conversation list at all
 *  (no channel param in the request schema, and "Non-Web Chat" appears nowhere
 *  in the codebase), and the designer declined it — "we don't do channels then
 *  don't add it". So this menu is exactly production's TWO axes. Message-level
 *  channel data is untouched; it was only ever this list-scoping axis that was
 *  invented.
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

function Row({
  label,
  isActive,
  onClick,
  indent,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 text-left transition-colors cursor-pointer ${
        isActive ? '' : 'hover:bg-[#f9fafb]'
      }`}
      style={{
        paddingLeft: indent ? 24 : 12,
        paddingRight: 12,
        paddingTop: 7,
        paddingBottom: 7,
        // Tick AND the selection-register tint. Two ticks are visible at once
        // (one per axis), so the tint is what makes each read as "the choice in
        // this section" rather than as multi-select. Reuses the existing
        // register — the design system has no radio row to borrow.
        backgroundColor: isActive ? colors.colorBlueDark5 : 'transparent',
      }}
    >
      <span className="w-4 shrink-0 flex items-center justify-center">
        {isActive && <Icon path={mdiCheck} size={0.6} color={colors.colorBlueDark1} />}
      </span>
      <span
        className="font-['Roboto',sans-serif] text-[14px] leading-[22px] truncate"
        style={{ color: isActive ? colors.colorBlueDark1 : colors.colorBlack1 }}
      >
        {label}
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
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 4,
      }}
    >
      {children}
    </p>
  );
}

export function ThreadScopeMenu({
  folder,
  assignment,
  onFolderChange,
  onAssignmentChange,
}: {
  folder: ThreadFilter;
  assignment: AssignmentScope;
  onFolderChange: (f: ThreadFilter) => void;
  onAssignmentChange: (a: AssignmentScope) => void;
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

  /**
   * The trigger names the CURRENT SCOPE, not the verb "Filter" — production's
   * habit. Because the two axes stack, it has to name both: the folder always,
   * and the assignment appended when it isn't the default. So "Inbox",
   * "Inbox · Housekeeping", "Archived · Unassigned".
   */
  const folderLabel = FOLDERS.find((f) => f.id === folder)?.label ?? 'Inbox';
  const triggerLabel =
    assignment.kind === 'all' ? folderLabel : `${folderLabel} · ${assignmentLabel(assignment)}`;

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        title={triggerLabel}
        className="flex items-center gap-1 rounded-[6px] cursor-pointer transition-colors hover:bg-[#f0f0f0] min-w-0"
        style={{ height: 28, paddingLeft: 8, paddingRight: 6, maxWidth: 200 }}
      >
        <span
          className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate min-w-0"
          style={{ color: colors.colorBlack1 }}
        >
          {triggerLabel}
        </span>
        <Icon path={mdiUnfoldMoreHorizontal} size={0.7} color={colors.colorBlack3} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 rounded-[8px] bg-white overflow-y-auto scrollbar-invisible"
          style={{
            top: 32,
            width: 240,
            maxHeight: 420,
            paddingTop: 4,
            paddingBottom: 4,
            border: `1px solid ${colors.colorBlack6}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          }}
        >
          {FOLDERS.map((f) => (
            <Row
              key={f.id}
              label={f.label}
              isActive={folder === f.id}
              onClick={() => onFolderChange(f.id)}
            />
          ))}

          <SectionLabel>Statuses</SectionLabel>
          {(['all', 'assigned', 'unassigned'] as const).map((kind) => (
            <Row
              key={kind}
              label={assignmentLabel({ kind })}
              isActive={assignment.kind === kind}
              onClick={() => onAssignmentChange({ kind })}
            />
          ))}


          <SectionLabel>Departments</SectionLabel>
          {DEPARTMENTS.map((d) => (
            <Row
              key={d.id}
              label={d.name}
              isActive={assignment.kind === 'department' && assignment.id === d.id}
              onClick={() => onAssignmentChange({ kind: 'department', id: d.id })}
            />
          ))}

          <SectionLabel>Assigned to</SectionLabel>
          {STAFF.map((u) => (
            <Row
              key={u.id}
              label={u.name}
              isActive={assignment.kind === 'user' && assignment.id === u.id}
              onClick={() => onAssignmentChange({ kind: 'user', id: u.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
