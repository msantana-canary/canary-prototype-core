/**
 * The panel's tab STRIP and its four tab bodies: Linked Reservations · Upsells ·
 * Service Tasks · Call History.
 *
 * Every tab is the same shape — an in-body section heading carrying that
 * section's actions, then either a bordered list of rows or a quiet empty
 * state. The heading repeats the tab label; that reads redundant in a static
 * frame, but it is what gives refresh / "+" a home and what the body hangs off
 * when it scrolls.
 *
 * EMPTY IS THE NORM. Most conversations have no companions, no upsells, no
 * tickets and no calls, so every empty state here is deliberately unfurnished:
 * one gray line, centred, no illustration and no call to action. A tab that
 * shouts when it has nothing to say makes the tab that DOES have something
 * harder to notice.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ButtonSize,
  ButtonType,
  CanaryButton,
  CanaryListItem,
  CanaryTabs,
  colors,
  TabSize,
  TabType,
  TagColor,
} from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiBedOutline,
  mdiChevronRight,
  mdiOpenInNew,
  mdiPhoneOutline,
  mdiPlus,
  mdiRefresh,
} from '@mdi/js';
import {
  EmptyState,
  glyphTitleId,
  IconAction,
  Kebab,
  KebabItem,
  LifecycleTag,
  PanelTag,
  PANEL_PAD,
  RowList,
  SectionHeading,
} from './panel-ui';
import { LinkedReservation, CallRecord, ServiceTask, Upsell } from '@/lib/products/messaging/types';
import { useRowKeyActivation } from '@/lib/products/messaging/useRowKeyActivation';

/* ─────────────────────────────────────────────────────────────────────────
   The tab strip
   ───────────────────────────────────────────────────────────────────────── */

export interface PanelTabDef {
  id: string;
  label: string;
  /** DERIVED count. Zero means no badge — never a "0" pill. */
  badge?: number;
}

/**
 * The tab strip, on `CanaryTabs` (text / compact).
 *
 * Miguel, 2026-08-20: "Are the tabs our components? they're missing their hover
 * states." They weren't, and they were — the strip was four hand-rolled buttons
 * with no pointer response at all. Everything visual now comes from the
 * library: the hover wash, the blue active label, the 4px underline, and the
 * pink count badge. The only thing this file still owns is where the strip sits
 * (the panel's 24px gutter, minus the library's own 16px tab padding, so the
 * first label lands on the same vertical as everything above it) and the
 * hairline it sits on. Height comes from `.panel-tab-bar` in globals.css —
 * see the note there.
 *
 * ⚠ TWO LIBRARY GAPS, both worked around here and both logged in
 * REDESIGN_NOTES:
 *
 * 1. `CanaryTabs` is UNCONTROLLED. It takes `defaultTab` and reports `onChange`,
 *    but has no `activeTab` prop, so it cannot be told to move. This panel moves
 *    the tab from outside three times — on thread switch, after linking a
 *    reservation, after creating a service task — so the strip is remounted (a
 *    bumped `key`) whenever the outside value diverges from the last value the
 *    library reported. Remounting ONLY on divergence, rather than keying on the
 *    active id, keeps ordinary clicks on the library's own state where their
 *    transitions still run.
 * 2. `badge` is rendered under a truthiness test, so `badge={0}` prints a
 *    literal "0" pill. Zero is passed as `undefined` instead.
 */
export function PanelTabBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: PanelTabDef[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  const [seed, setSeed] = useState(0);
  const reported = useRef(activeTab);

  useEffect(() => {
    if (reported.current !== activeTab) {
      reported.current = activeTab;
      setSeed((s) => s + 1);
    }
  }, [activeTab]);

  return (
    <div
      className="panel-tab-bar"
      style={{
        paddingLeft: PANEL_PAD - 16,
        borderBottom: `1px solid ${colors.colorBlack6}`,
      }}
    >
      <CanaryTabs
        key={seed}
        tabs={tabs.map((t) => ({
          id: t.id,
          label: t.label,
          badge: t.badge && t.badge > 0 ? t.badge : undefined,
          content: <></>,
        }))}
        tabType={TabType.TEXT}
        tabSize={TabSize.COMPACT}
        defaultTab={activeTab}
        onChange={(id) => {
          reported.current = id;
          onChange(id);
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   THE ROW REGISTER — CanaryListItem, four times

   Every row in these four tabs is a `CanaryListItem` inside the shared
   `<RowList>` (`CanaryList hasOuterBorder`). The list draws its own hairline
   between children, so there is no divider component any more; rows map
   straight in, keyed.

   The rows keep their exact drawn anatomy through the `children` escape hatch
   — `title`/`subtitle`/`rightContent` are ignored when `children` is passed —
   and the base supplies the chrome: `hoverColor` (its default IS colorBlack8 /
   #FAFAFA, exactly the wash the clickable rows were hand-rolling), the
   selected fill, and `isClickable={false}` for the rows that are just records.

   ⚠ PADDING OVERRIDES HAVE TO REACH THE INNER DIV. `CanaryListItem` renders
   `<li class={className}>` around a `<div class="… gap-4 px-4 py-4">`, so the
   panel's 12px vertical rhythm and 8px gap arrive as `[&>*]:!py-3
   [&>*]:!gap-2`, and the rows whose kebab hugs the right edge trim that side
   with `[&>*]:!pr-3`. "12px list-row padding" is logged as the design-system
   ask — the base ramp offers only compact 8px and normal 16px.

   ⚠ AND IT WOULD COST THE ROWS THEIR BUTTON. A clickable `CanaryListItem` is a
   `<li role="button" tabIndex=0>` with the click handler on an inner div and NO
   key handler — it takes focus, announces itself as a button, and then ignores
   Enter and Space. `useRowKeyActivation` puts the keyboard back on the `<li>`
   the base forwards its ref to. It is a stopgap for a library gap, not a
   pattern: "keyboard activation on `CanaryListItem`" is the sharpest ask this
   batch produced, and the hook should be deleted the day it lands.
   ───────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   Linked Reservations — COMPANIONS ONLY
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Miguel: "linked rez are companions to this reservation — Emily's family that
 * has a separate room but is connected to her." So this tab is everyone on the
 * thread who ISN'T the primary. The guest herself is excluded: a person listed
 * as her own companion is a tautology, and the frame that shows Emily inside
 * Emily's own linked list is a stale iteration.
 */
export function LinkedReservationsTab({
  companions,
  contactNumber,
  onLink,
  onUnlink,
}: {
  companions: LinkedReservation[];
  contactNumber: string;
  onLink: () => void;
  onUnlink: (lr: LinkedReservation) => void;
}) {
  return (
    <>
      <SectionHeading
        title="Linked Reservations"
        actions={
          <>
            <IconAction path={mdiRefresh} label="Refresh linked reservations" />
            <IconAction path={mdiPlus} label="Link a reservation" onClick={onLink} />
          </>
        }
      />
      {companions.length === 0 ? (
        <EmptyState label="No linked reservations" />
      ) : (
        <RowList>
          {companions.map((lr) => (
            <CompanionRow
              key={lr.reservation.id}
              lr={lr}
              contactNumber={contactNumber}
              onUnlink={() => onUnlink(lr)}
            />
          ))}
        </RowList>
      )}
    </>
  );
}

function CompanionRow({
  lr,
  contactNumber,
  onUnlink,
}: {
  lr: LinkedReservation;
  contactNumber: string;
  onUnlink: () => void;
}) {
  /**
   * A PHONE-MATCHED link is a FACT, not an assertion — production hard-blocks
   * unlinking it, because the link would only reappear on the next sync. The
   * item still renders, disabled, carrying the reason: "you can't do this and
   * here's why" is information; a missing menu item is a mystery.
   */
  const items: KebabItem[] = lr.isAutoLinked
    ? [
        {
          label: 'Unlink reservation',
          disabled: true,
          hint: `Automatically linked via matching phone number (${contactNumber})`,
        },
      ]
    : [{ label: 'Unlink reservation', onClick: onUnlink, danger: true }];

  return (
    <CanaryListItem isClickable={false} className="[&>*]:!py-3 [&>*]:!pr-3 [&>*]:!gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
            style={{ color: colors.colorBlack1 }}
          >
            {lr.guest.name}
          </span>
          <LifecycleTag status={lr.reservation.status} />
        </div>
        <div className="flex items-center gap-4" style={{ marginTop: 2 }}>
          {lr.guest.phone && (
            <span className="flex items-center gap-1.5 min-w-0">
              <Icon path={mdiPhoneOutline} size={0.6} color={colors.colorBlack3} />
              <span
                className="truncate font-['Roboto',sans-serif] text-[13px] leading-[20px]"
                style={{ color: colors.colorBlack3 }}
              >
                {lr.guest.phone}
              </span>
            </span>
          )}
          {lr.reservation.room && (
            <span className="flex items-center gap-1.5">
              <Icon path={mdiBedOutline} size={0.6} color={colors.colorBlack3} />
              <span
                className="font-['Roboto',sans-serif] text-[13px] leading-[20px]"
                style={{ color: colors.colorBlack3 }}
              >
                {lr.reservation.room}
              </span>
            </span>
          )}
        </div>
      </div>
      <Kebab items={items} label={`Actions for ${lr.guest.name}`} width={272} />
    </CanaryListItem>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Upsells
   ───────────────────────────────────────────────────────────────────────── */

const UPSELL_TAG: Record<Upsell['status'], { label: string; color: TagColor }> = {
  requested: { label: 'Requested', color: TagColor.INFO },
  approved: { label: 'Approved', color: TagColor.SUCCESS },
  denied: { label: 'Denied', color: TagColor.ERROR },
};

export function UpsellsTab({ upsells }: { upsells: Upsell[] }) {
  return (
    <>
      <SectionHeading
        title="Upsells"
        actions={<IconAction path={mdiPlus} label="Add an upsell" />}
      />
      {upsells.length === 0 ? (
        <EmptyState label="No upsells" />
      ) : (
        <RowList>
          {upsells.map((upsell) => {
            const openLabel = `Open ${upsell.name} in Upsells`;
            return (
              <CanaryListItem
                key={upsell.id}
                isClickable={false}
                className="[&>*]:!py-3 [&>*]:!gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                      style={{ color: colors.colorBlack1 }}
                    >
                      {/* A room upgrade carries no quantity — you don't buy two
                          of a King Suite. */}
                      {upsell.quantity ? `${upsell.quantity}x ${upsell.name}` : upsell.name}
                    </span>
                    <PanelTag label={UPSELL_TAG[upsell.status].label} color={UPSELL_TAG[upsell.status].color} />
                  </div>
                  <span
                    className="block font-['Roboto',sans-serif] text-[13px] leading-[20px]"
                    style={{ color: colors.colorBlack3, marginTop: 2 }}
                  >
                    {upsell.category}
                  </span>
                </div>
                {/* Opening the upsell is the Upsells product's job — a stub
                    here, on the same icon-button register as the rest of the
                    panel so a stub can't drift from a live control. */}
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  size={ButtonSize.COMPACT}
                  isRounded
                  className="icon-btn-neutral icon-btn-30"
                  icon={
                    <Icon
                      path={mdiOpenInNew}
                      size={0.72}
                      color={colors.colorBlack1}
                      title={openLabel}
                      id={glyphTitleId(`upsell-open-${upsell.id}`)}
                    />
                  }
                />
              </CanaryListItem>
            );
          })}
        </RowList>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Service Tasks
   ───────────────────────────────────────────────────────────────────────── */

function serviceTaskTag(task: ServiceTask): { label: string; color: TagColor } {
  if (task.status === 'waiting') {
    // Production prints the elapsed minutes INSIDE the tag. The number is the
    // point — 1652M is a ticket nobody picked up for over a day.
    return { label: `Waiting ${task.waitingMinutes ?? 0}M`, color: TagColor.DEFAULT };
  }
  if (task.status === 'closed') return { label: 'Closed', color: TagColor.DEFAULT };
  return { label: 'Open', color: TagColor.SUCCESS };
}

export function ServiceTasksTab({
  tasks,
  onCreate,
  onUnlink,
}: {
  tasks: ServiceTask[];
  onCreate: () => void;
  onUnlink: (task: ServiceTask) => void;
}) {
  return (
    <>
      <SectionHeading
        title="Service Tasks"
        actions={
          <>
            <IconAction path={mdiRefresh} label="Refresh service tasks" />
            <IconAction path={mdiPlus} label="Create service task" onClick={onCreate} />
          </>
        }
      />
      {tasks.length === 0 ? (
        <EmptyState label="No service tickets" />
      ) : (
        <RowList>
          {tasks.map((task) => {
            const tag = serviceTaskTag(task);
            return (
              <CanaryListItem
                key={task.id}
                isClickable={false}
                className="[&>*]:!py-3 [&>*]:!pr-3 [&>*]:!gap-2"
              >
                <div className="flex-1 min-w-0">
                  <span
                    className="block truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                    style={{ color: colors.colorBlack1 }}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
                    <PanelTag label={tag.label} color={tag.color} />
                    {task.room && (
                      <span className="flex items-center gap-1.5">
                        <Icon path={mdiBedOutline} size={0.6} color={colors.colorBlack3} />
                        <span
                          className="font-['Roboto',sans-serif] text-[13px] leading-[20px]"
                          style={{ color: colors.colorBlack3 }}
                        >
                          {task.room}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                {/**
                 * ONE item, and it is production's. The earlier menu offered
                 * "Mark as complete" / "Reassign" / "Open in Service Tickets"
                 * — three invented stubs. Production's row menu carries
                 * "Unlink" alone, in the danger register, because the task's
                 * LIFECYCLE belongs to the Service Tickets product; the only
                 * thing this panel owns is the task's ASSOCIATION with this
                 * conversation. No confirm dialog: production unlinks the
                 * association without one, and unlike a guest unlink this
                 * destroys nothing — the ticket still exists in its own
                 * product.
                 */}
                <Kebab
                  items={[{ label: 'Unlink', danger: true, onClick: () => onUnlink(task) }]}
                  label={`Actions for ${task.title}`}
                  width={160}
                />
              </CanaryListItem>
            );
          })}
        </RowList>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Call History
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The one CLICKABLE row in these four tabs, and the reason it is a component
 * rather than inline JSX: `useRowKeyActivation` is a hook, and a hook cannot be
 * called inside a `.map`.
 *
 * `hoverColor` is left at the base's default because that default IS
 * colorBlack8 (#FAFAFA) — the exact wash this row was hand-rolling.
 */
function CallHistoryRow({ call, onOpen }: { call: CallRecord; onOpen: () => void }) {
  const rowRef = useRowKeyActivation(onOpen);
  return (
    <CanaryListItem ref={rowRef} onClick={onOpen} className="[&>*]:!py-3 [&>*]:!gap-2">
      <div className="flex-1 min-w-0">
        <span
          className="block truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
          style={{ color: colors.colorBlack1 }}
        >
          {call.startedAtLabel}
        </span>
        <span
          className="block font-['Roboto',sans-serif] text-[13px] leading-[20px]"
          style={{ color: colors.colorBlack3 }}
        >
          {call.durationLabel}
        </span>
      </div>
      <Icon path={mdiChevronRight} size={0.8} color={colors.colorBlack1} />
    </CanaryListItem>
  );
}

export function CallHistoryTab({
  calls,
  onOpenCall,
}: {
  calls: CallRecord[];
  onOpenCall: (call: CallRecord) => void;
}) {
  return (
    <>
      <SectionHeading title="Call History" />
      {calls.length === 0 ? (
        <EmptyState label="No call history" />
      ) : (
        <RowList>
          {calls.map((call) => (
            <CallHistoryRow key={call.id} call={call} onOpen={() => onOpenCall(call)} />
          ))}
        </RowList>
      )}
    </>
  );
}
