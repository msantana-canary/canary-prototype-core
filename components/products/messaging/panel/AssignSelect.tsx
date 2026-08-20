/**
 * AssignSelect — the panel's "Assigned to" control card.
 *
 * ⚠ Not the thread list's `AssignmentSelect`. That one FILTERS the list ("show
 * me Housekeeping's conversations"); this one WRITES ("give this conversation
 * to Housekeeping"). Same vocabulary, opposite direction, and they must not be
 * one component — a filter has an "All conversations" row that would be
 * meaningless as an assignment, and an assignment has an "Unassign" that would
 * be meaningless as a filter.
 *
 * ASSIGNMENT IS EXCLUSIVE, exactly as production: a thread is assigned to a USER
 * XOR a DEPARTMENT, never both. That is structural here — the menu carries ONE
 * value, so there is nowhere to put a second assignment.
 *
 * The TRIGGER is the control card itself (label over value, ⇅ at the right
 * edge), because the frame gives assignment a card and not a form field. The
 * popover borrows the branch's menu register: white rounded-8, 1px colorBlack6,
 * NO shadow, uppercase gray section overlines, right-aligned check on the
 * active row.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCheck, mdiUnfoldMoreHorizontal } from '@mdi/js';
import { DEPARTMENTS, STAFF } from '../ThreadScopeMenu';
import { ThreadAssignment } from '@/lib/products/messaging/types';

interface AssignOption {
  value: string;
  label: string;
  section?: string;
  assignment?: ThreadAssignment;
}

function buildOptions(): AssignOption[] {
  return [
    { value: 'none', label: 'Unassigned' },
    ...DEPARTMENTS.map((d) => ({
      value: `dept:${d.id}`,
      label: d.name,
      section: 'Departments',
      assignment: { type: 'department' as const, id: d.id, name: d.name },
    })),
    ...STAFF.map((u) => ({
      value: `user:${u.id}`,
      label: u.name,
      section: 'Staff',
      // Every staff member here belongs to Front Office in the mock; the
      // department is what makes department filtering transitive downstream.
      assignment: { type: 'user' as const, id: u.id, name: u.name, departmentId: 'dept-front-office' },
    })),
  ];
}

function assignmentValue(assignment?: ThreadAssignment): string {
  if (!assignment) return 'none';
  return `${assignment.type === 'department' ? 'dept' : 'user'}:${assignment.id}`;
}

export function AssignSelect({
  assignment,
  onChange,
}: {
  assignment?: ThreadAssignment;
  onChange: (assignment?: ThreadAssignment) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = buildOptions();
  const value = assignmentValue(assignment);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', onDocMouseDown);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div className="relative flex-1 min-w-0" ref={rootRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Assign this conversation"
        className="w-full text-left rounded-[8px] transition-colors hover:bg-[rgba(0,0,0,0.02)]"
        style={{
          border: `1px solid ${colors.colorBlack6}`,
          paddingLeft: 12,
          paddingRight: 10,
          paddingTop: 8,
          paddingBottom: 8,
          minHeight: 56,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <span
              className="block font-['Roboto',sans-serif] text-[13px] leading-[20px]"
              style={{ color: colors.colorBlack3 }}
            >
              Assigned to
            </span>
            <span
              className="block truncate font-['Roboto',sans-serif] text-[14px] leading-[22px]"
              style={{ color: colors.colorBlueDark1 }}
            >
              {assignment?.name ?? 'None'}
            </span>
          </div>
          <Icon path={mdiUnfoldMoreHorizontal} size={0.72} color={colors.colorBlack1} />
        </div>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 bg-white rounded-[8px] py-1 z-50 overflow-y-auto scrollbar-invisible"
          style={{
            top: 60,
            width: '100%',
            maxHeight: 320,
            border: `1px solid ${colors.colorBlack6}`,
          }}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const previousSection = i === 0 ? undefined : options[i - 1].section;
            const startsSection = option.section && option.section !== previousSection;
            return (
              <React.Fragment key={option.value}>
                {startsSection && (
                  <>
                    {i > 0 && (
                      <div
                        role="presentation"
                        style={{ height: 1, backgroundColor: colors.colorBlack6, marginTop: 6, marginBottom: 2 }}
                      />
                    )}
                    <div
                      className="font-['Roboto',sans-serif] font-medium uppercase"
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.4px',
                        color: colors.colorBlack3,
                        padding: '6px 12px 4px',
                      }}
                    >
                      {option.section}
                    </div>
                  </>
                )}
                <button
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.assignment);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left transition-colors hover:bg-gray-50"
                  style={{ padding: '7px 12px' }}
                >
                  <span
                    className="flex-1 min-w-0 truncate font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {option.label}
                  </span>
                  {isSelected && <Icon path={mdiCheck} size={0.7} color={colors.colorBlueDark1} />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
