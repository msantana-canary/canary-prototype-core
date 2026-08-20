/**
 * The panel's four tab bodies: Linked Reservations · Upsells · Service Tasks ·
 * Call History.
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

import React from 'react';
import { colors, TagColor } from '@canary-ui/components';
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
  IconAction,
  Kebab,
  KebabItem,
  LifecycleTag,
  PanelTag,
  RowDivider,
  RowList,
  SectionHeading,
} from './panel-ui';
import { LinkedReservation, CallRecord, ServiceTask, Upsell } from '@/lib/products/messaging/types';

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
          {companions.map((lr, i) => (
            <React.Fragment key={lr.reservation.id}>
              <RowDivider isFirst={i === 0} />
              <CompanionRow lr={lr} contactNumber={contactNumber} onUnlink={() => onUnlink(lr)} />
            </React.Fragment>
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
    <div className="flex items-center gap-2" style={{ padding: '12px 12px 12px 16px' }}>
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
    </div>
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
          {upsells.map((upsell, i) => (
            <React.Fragment key={upsell.id}>
              <RowDivider isFirst={i === 0} />
              <div className="flex items-center gap-2" style={{ padding: '12px 16px' }}>
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
                {/* Opening the upsell is the Upsells product's job — a stub here. */}
                <button
                  aria-label={`Open ${upsell.name} in Upsells`}
                  className="shrink-0 w-[30px] h-[30px] flex items-center justify-center rounded-full transition-colors hover:bg-[#f0f0f0]"
                >
                  <Icon path={mdiOpenInNew} size={0.72} color={colors.colorBlack1} />
                </button>
              </div>
            </React.Fragment>
          ))}
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
}: {
  tasks: ServiceTask[];
  onCreate: () => void;
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
          {tasks.map((task, i) => {
            const tag = serviceTaskTag(task);
            return (
              <React.Fragment key={task.id}>
                <RowDivider isFirst={i === 0} />
                <div className="flex items-center gap-2" style={{ padding: '12px 12px 12px 16px' }}>
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
                  {/* Task lifecycle lives in the Service Tickets product; these
                      are deliberate stubs. */}
                  <Kebab
                    items={[
                      { label: 'Mark as complete' },
                      { label: 'Reassign' },
                      { label: 'Open in Service Tickets' },
                    ]}
                    label={`Actions for ${task.title}`}
                  />
                </div>
              </React.Fragment>
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
          {calls.map((call, i) => (
            <React.Fragment key={call.id}>
              <RowDivider isFirst={i === 0} />
              <button
                onClick={() => onOpenCall(call)}
                className="w-full flex items-center gap-2 text-left transition-colors hover:bg-[#fafafa]"
                style={{ padding: '12px 16px' }}
              >
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
              </button>
            </React.Fragment>
          ))}
        </RowList>
      )}
    </>
  );
}
