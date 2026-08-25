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
 * The TRIGGER is the shared `<ControlCard>` (label over value, ⇅ at the right
 * edge), because the frame gives assignment a card and not a form field —
 * shared with the Reservations card so the two can't drift apart on hover. The
 * popover borrows the branch's menu register: white rounded-8, 1px colorBlack6,
 * NO shadow, uppercase gray section overlines, right-aligned check on the
 * active row.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ STRUCTURAL EXCEPTION — the SAME `CanarySelect` contract gap as ScopeSelect
 * ═══════════════════════════════════════════════════════════════════════════
 * The nearest base is `CanarySelect`, and it cannot express this control for
 * the reasons already written out at length in `ThreadScopeMenu.tsx` (see its
 * header): `CanarySelect` wraps a NATIVE `<select>` — its `onChange` is a
 * `ChangeEvent<HTMLSelectElement>` — so it cannot take a card as its trigger,
 * cannot draw an uppercase section overline or a right-aligned check row, and
 * its flat `CanarySelectOption` model has no notion of sections at all.
 * `CanaryAutocomplete` is input-triggered over the same flat `{value, label}`
 * options, so it is no closer.
 *
 * This file is the SECOND consumer of that one gap, not a second gap. The two
 * library asks — option SECTIONS and a stylable CHECK ROW — are already logged
 * in REDESIGN_NOTES.md against ScopeSelect; the exception is noted here so it
 * is traceable from this side too, and so nobody re-litigates it per file.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiCheck, mdiUnfoldMoreHorizontal } from '@mdi/js';
import { ControlCard } from './panel-ui';
import { DEPARTMENTS, STAFF } from '../ThreadScopeMenu';
import { ThreadAssignment } from '@/lib/products/messaging/types';
import { useEscapeLayer } from '@/lib/products/messaging/escape-stack';

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
    if (isOpen) document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen]);

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * THE KEYBOARD CONTRACT, BROUGHT UP TO `ScopeSelect`'s (QA-2, 2026-08-25)
   * ═══════════════════════════════════════════════════════════════════════
   * This control already closed on Escape — the one part of the QA filing that
   * was wrong — but it closed via its OWN document listener and left focus on
   * `<body>`, so a keyboard user dismissing the listbox lost their place
   * mid-panel. And ArrowDown did nothing at all: options were reachable only by
   * Tab, one surface away from `ThreadScopeMenu`, which gets the whole contract
   * right (arrows, Home/End, Escape-returns-to-trigger).
   *
   * Two changes. The Escape listener moves onto the shared layer stack, because
   * this popover lives inside `PanelShell` — which now also answers Escape —
   * and only the stack guarantees the listbox closes without taking the panel
   * with it. And Escape now returns focus to the trigger, which is the
   * `ControlCard` `<button>`: the FIRST button inside the root, since the
   * option rows are buttons too and always render after it.
   *
   * Arrow movement is real focus, not `aria-activedescendant`. `ScopeSelect`'s
   * options are `<div role="option">` and need the virtual cursor; these are
   * real `<button>`s, so moving focus IS the selection cursor, and Enter/Space
   * already activate natively.
   */
  const triggerButton = () => rootRef.current?.querySelector('button') ?? null;

  useEscapeLayer(isOpen, () => {
    setIsOpen(false);
    triggerButton()?.focus();
  });

  const optionButtons = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []).slice(1);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() => {
        const opts = optionButtons();
        (e.key === 'ArrowUp' ? opts[opts.length - 1] : opts[0])?.focus();
      });
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

    const opts = optionButtons();
    if (opts.length === 0) return;
    e.preventDefault();
    const at = opts.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? opts.length - 1
          : e.key === 'ArrowDown'
            ? Math.min(at + 1, opts.length - 1)
            : at <= 0
              ? 0
              : at - 1;
    opts[next]?.focus();
  };

  return (
    <div className="relative flex-1 min-w-0" ref={rootRef} onKeyDown={onKeyDown}>
      <ControlCard
        label="Assigned to"
        value={assignment?.name ?? 'None'}
        iconPath={mdiUnfoldMoreHorizontal}
        iconSize={0.72}
        onClick={() => setIsOpen((v) => !v)}
        ariaLabel="Assign this conversation"
        ariaHasPopup="listbox"
        ariaExpanded={isOpen}
      />

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
