/**
 * ConversationDetailsPanel — the messaging surface's right-hand panel,
 * rebuilt GUEST-PROFILE-FIRST.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHAT CHANGED, AND WHY IT IS A REPLACEMENT AND NOT AN EDIT
 * ═══════════════════════════════════════════════════════════════════════════
 * The old panel (`GuestInfoSidebar`) was organised around the LINK: a stack of
 * cards, one per linked reservation, grouped by how each link came to exist.
 * That is the data model's shape, not the reader's question. A hotelier opening
 * this panel is asking "who am I talking to, and what do I need to know about
 * them" — and answering it meant paging a carousel of cards to reassemble one
 * person out of several rows.
 *
 * So the panel starts from the PERSON:
 *
 *      [avatar]  Emily Smith  CHECKED-IN                            ⋯
 *      ┌─ Assigned to ─────────┐ ┌─ Emily's Reservations ──────────┐
 *      │ None                ⇅ │ │ 4                             › │
 *      └───────────────────────┘ └─────────────────────────────────┘
 *                    ( Show reservation details ⌄ )
 *      ── Linked Reservations · Upsells ③ · Service Tasks · Call History ──
 *
 * One person in the spotlight; her stays behind a count; everything else
 * attached to her behind four tabs. Every number on screen is DERIVED — the
 * reservation count, the Upsells badge — so nothing can be stale.
 *
 * ── THE TWO-CARD CONTROL ROW ──────────────────────────────────────────────
 * Assignment and reservations are the only two things a hotelier CHANGES from
 * the root, so they get cards and everything else gets a tab. An earlier
 * iteration ran three cards (a Scheduled Messages card sat first); it lost the
 * third because guest-journey status is a property of a STAY, not of the
 * conversation, and it now lives per-stay in the Reservations drill-in where it
 * can actually be attributed.
 *
 * ── THE EXPANDER ──────────────────────────────────────────────────────────
 * "Show reservation details" is centred ON the divider, half in the white zone
 * and half in the gray band it opens. The current reservation is the panel's
 * most-read block and its least-changed one; putting it behind one click keeps
 * the tabs above the fold without hiding the record from anyone who wants it.
 *
 * ── DRILL-INS REPLACE, THEY DON'T STACK ───────────────────────────────────
 * Every drill-in takes the whole panel behind "← {Page title}". No breadcrumb,
 * no persistent profile header: at 600px a drill-in that kept the root's chrome
 * would spend a third of its height re-stating where you already know you are.
 * Navigation is a translateX track with a real STACK, so Reservations → Guest
 * Scheduled Messages is two levels deep and Back walks out one at a time.
 *
 * ── THE ANONYMOUS VARIANT ─────────────────────────────────────────────────
 * No linked reservations means no guest, so there is nothing to put a portrait
 * of: the phone number becomes the title, the reservation card becomes "Link
 * guest", and the expander opens THREAD details (name / phone / email) instead
 * of a reservation. This is not a degraded state — it is the ~norm for an
 * inbound number the PMS has never seen.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronRight, mdiChevronUp } from '@mdi/js';
import { PanelShell, PANEL_ANIM_MS, useReducedMotion } from './PanelShell';
import {
  ControlCard,
  CopyIcon,
  DetailRows,
  Kebab,
  KebabItem,
  LifecycleTag,
  PanelHeader,
  PANEL_PAD,
} from './panel-ui';
import { AssignSelect } from './AssignSelect';
import { Avatar } from '../Avatar';
import { Toast } from '@/components/core/Toast';
import {
  CallHistoryTab,
  LinkedReservationsTab,
  PanelTabBar,
  ServiceTasksTab,
  UpsellsTab,
} from './PanelTabs';
import { ReservationRecord } from './ReservationRecord';
import { ReservationsPage } from './ReservationsPage';
import { ScheduledMessagesPage } from './ScheduledMessagesPage';
import { CallDetailsPage } from './CallDetailsPage';
import { LinkReservationPage } from './LinkReservationPage';
import { SetPrimaryGuestPage } from './SetPrimaryGuestPage';
import { CreateServiceTaskPage } from './CreateServiceTaskPage';
import { UnlinkConfirmModal, UnlinkTarget } from './UnlinkConfirmModal';
import { useMessagingStore } from '@/lib/products/messaging/store';
import { firstName, panelIdentity } from '@/lib/products/messaging/panel-selectors';
import { callsByThread, upsellsByGuest } from '@/lib/products/messaging/panel-mock';
import { LinkedReservation, Thread } from '@/lib/products/messaging/types';

/* ─────────────────────────────────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────────────────────────────────── */

type PanelRoute =
  | { kind: 'reservations' }
  | { kind: 'scheduled'; reservationId: string }
  | { kind: 'call'; callId: string }
  | { kind: 'link' }
  | { kind: 'primary' }
  | { kind: 'create-task' };

type TabId = 'linked' | 'upsells' | 'tasks' | 'calls';

const TABS: { id: TabId; label: string }[] = [
  { id: 'linked', label: 'Linked Reservations' },
  { id: 'upsells', label: 'Upsells' },
  { id: 'tasks', label: 'Service Tasks' },
  { id: 'calls', label: 'Call History' },
];

/* ─────────────────────────────────────────────────────────────────────────
   Root furniture
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The right-hand control card: label over value, chevron at the edge. Chrome,
 * hover and all, is the shared `<ControlCard>` — the same one the Assign card
 * uses, so the pair can never drift.
 */
function DrillCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <ControlCard label={label} value={value} iconPath={mdiChevronRight} onClick={onClick} />
    </div>
  );
}

/**
 * The expander pill, centred ON the boundary line. It carries a white ground
 * because it straddles two surfaces — the white profile zone above and the
 * gray details band below.
 */
function ExpanderPill({
  isOpen,
  labelOpen,
  labelClosed,
  onToggle,
}: {
  isOpen: boolean;
  labelOpen: string;
  labelClosed: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex items-center gap-1 rounded-full transition-colors hover:bg-[#fafafa]"
      style={{
        height: 30,
        paddingLeft: 14,
        paddingRight: 10,
        border: `1px solid ${colors.colorBlack6}`,
        backgroundColor: colors.colorWhite,
      }}
    >
      <span
        className="font-['Roboto',sans-serif] text-[13px] leading-[20px] whitespace-nowrap"
        style={{ color: colors.colorBlack1 }}
      >
        {isOpen ? labelOpen : labelClosed}
      </span>
      <Icon path={isOpen ? mdiChevronUp : mdiChevronDown} size={0.7} color={colors.colorBlack1} />
    </button>
  );
}

/**
 * The details band's ground. There is no token between colorBlack7 (#F0F0F0,
 * too heavy behind body text) and colorBlack8 (#FAFAFA, invisible against
 * white), so this surface picks the value the frames draw and says so out loud
 * rather than pretending a token fits.
 */
const BAND_BG = '#F7F8F9';

/**
 * The details band's expand. Opening is the slower of the two: it is the motion
 * that has to be READ (a block of record you are about to scan appearing under
 * your click). Closing is a dismissal — a dismissal that lingers reads sticky.
 */
const BAND_OPEN_MS = 220;
const BAND_CLOSE_MS = 160;

/* ─────────────────────────────────────────────────────────────────────────
   The panel
   ───────────────────────────────────────────────────────────────────────── */

export function ConversationDetailsPanel({
  thread,
  isOpen,
  onClose,
}: {
  thread: Thread;
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    threadPrimaryReservationId,
    serviceTasks,
    setThreadPrimary,
    assignThread,
    linkReservation,
    unlinkReservation,
    unlinkGuest,
    createServiceTask,
    unlinkServiceTask,
  } = useMessagingStore();

  const reduced = useReducedMotion();

  const identity = useMemo(
    () => panelIdentity(thread, threadPrimaryReservationId[thread.id]),
    [thread, threadPrimaryReservationId]
  );
  const { primary, ownStays, companions, samePhone, isAnonymous } = identity;

  const [tab, setTab] = useState<TabId>('linked');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stack, setStack] = useState<PanelRoute[]>([]);
  const [depth, setDepth] = useState(0);
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Switching threads resets the panel to its root — a drill-in about one guest
  // is meaningless once the panel is about another.
  useEffect(() => {
    setStack([]);
    setDepth(0);
    setTab('linked');
    setDetailsOpen(false);
    setUnlinkTarget(null);
    setToast(null);
  }, [thread.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const push = (route: PanelRoute) => {
    setStack((s) => [...s, route]);
    setDepth((d) => d + 1);
  };
  /** Slide back first, THEN drop the pane — otherwise the exit has nothing to show. */
  const pop = () => {
    setDepth((d) => Math.max(0, d - 1));
    window.setTimeout(() => setStack((s) => s.slice(0, -1)), PANEL_ANIM_MS);
  };

  const upsells = primary ? upsellsByGuest[primary.guest.id] ?? [] : [];
  const tasks = primary ? serviceTasks[primary.guest.id] ?? [] : [];
  const calls = callsByThread[thread.id] ?? [];

  const confirmUnlink = () => {
    if (!unlinkTarget) return;
    if (unlinkTarget.scope === 'guest') unlinkGuest(thread.id, unlinkTarget.reservationIds);
    else unlinkReservation(thread.id, unlinkTarget.reservationIds[0]);
    setUnlinkTarget(null);
  };

  /**
   * Profile kebab. "Unlink guest" is DISABLED when the primary auto-linked: a
   * phone match is a fact from the PMS, and unlinking it would only last until
   * the next sync. The item still renders, carrying the reason.
   */
  const kebabItems: KebabItem[] = primary
    ? [
        { label: 'Change primary guest', onClick: () => push({ kind: 'primary' }) },
        primary.isAutoLinked
          ? {
              label: 'Unlink guest',
              disabled: true,
              hint: `Automatically linked via matching phone number (${thread.contactNumber})`,
            }
          : {
              label: 'Unlink guest',
              danger: true,
              onClick: () =>
                setUnlinkTarget({
                  scope: 'guest',
                  guestName: primary.guest.name,
                  reservationIds: ownStays.map((lr) => lr.reservation.id),
                }),
            },
      ]
    : [];

  const route = (index: number): PanelRoute | undefined => stack[index];

  return (
    <PanelShell isOpen={isOpen} onClose={onClose}>
      {/* NAV TRACK — one pane per stack level. The track is exactly the panel's
          width, so translateX(-N × 100%) advances by exactly N panes. */}
      <div
        className="flex h-full min-h-0"
        style={{
          transform: `translateX(-${depth * 100}%)`,
          transition: `transform ${PANEL_ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {/* ── ROOT ─────────────────────────────────────────────────────── */}
        <div className="w-full h-full shrink-0 flex flex-col min-h-0">
          <PanelHeader title="Conversation Details" onClose={onClose} />

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
            {/* PROFILE */}
            <div style={{ paddingLeft: PANEL_PAD, paddingRight: PANEL_PAD, paddingTop: 20, paddingBottom: 24 }}>
              {isAnonymous ? (
                // No guest, no portrait: the number IS the conversation.
                <h3
                  className="font-['Roboto',sans-serif] font-medium text-[17px] leading-[26px] truncate"
                  style={{ color: colors.colorBlack1, minHeight: 48, display: 'flex', alignItems: 'center' }}
                >
                  {thread.contactNumber}
                </h3>
              ) : (
                <div className="flex items-start gap-3">
                  <Avatar
                    src={primary?.guest.avatar}
                    initials={primary?.guest.initials ?? ''}
                    size="profile"
                    shape="circle"
                  />
                  <div className="flex-1 min-w-0" style={{ paddingTop: 2 }}>
                    <h3
                      className="truncate font-['Roboto',sans-serif] font-medium text-[17px] leading-[26px]"
                      style={{ color: colors.colorBlack1 }}
                    >
                      {primary?.guest.name}
                    </h3>
                    <div style={{ marginTop: 2 }}>
                      {primary && <LifecycleTag status={primary.reservation.status} />}
                    </div>
                  </div>
                  <Kebab items={kebabItems} label="Guest actions" width={280} />
                </div>
              )}

              {/* CONTROL ROW — the only two things you CHANGE from the root. */}
              <div className="flex gap-4" style={{ marginTop: 18 }}>
                <AssignSelect
                  assignment={thread.assignedTo}
                  onChange={(assignment) => assignThread(thread.id, assignment)}
                />
                {isAnonymous ? (
                  <DrillCard label="Reservations" value="Link guest" onClick={() => push({ kind: 'link' })} />
                ) : (
                  <DrillCard
                    label={`${firstName(primary?.guest.name ?? '')}'s Reservations`}
                    value={String(ownStays.length)}
                    onClick={() => push({ kind: 'reservations' })}
                  />
                )}
              </div>
            </div>

            {/* EXPANDER + DETAILS BAND. The pill is centred on the boundary
                line above; the band opens beneath it.

                ── ONE LINE, NOT TWO ─────────────────────────────────────────
                This zone used to carry a top hairline AND the tab strip carried
                its own, so the closed state drew two rules 15px apart with
                nothing between them — a band of empty gray that read as a
                mistake. The pill's line stays (it is what the pill straddles);
                the tab strip's top rule is gone. The strip keeps its BOTTOM
                hairline, because that is the rail the active indicator sits on.

                ── WHY grid-template-rows ───────────────────────────────────
                The band used to mount and unmount, so a click swapped 200-odd
                pixels in with no transit. Height can't be transitioned from
                `auto`, and a measured max-height has to guess a number that the
                anonymous variant (three rows) and the reservation variant (a
                dozen) don't share. `0fr → 1fr` on a one-row grid animates to the
                content's OWN height, whatever it is, with `overflow: hidden` on
                the track so nothing flashes a scrollbar on the way. */}
            <div
              className="relative"
              style={{
                borderTop: `1px solid ${colors.colorBlack6}`,
                paddingTop: 15,
                backgroundColor: detailsOpen ? BAND_BG : 'transparent',
                transition: reduced
                  ? 'none'
                  : `background-color ${detailsOpen ? BAND_OPEN_MS : BAND_CLOSE_MS}ms ease-out`,
              }}
            >
              <div className="absolute left-0 right-0 flex justify-center" style={{ top: -15, zIndex: 1 }}>
                <ExpanderPill
                  isOpen={detailsOpen}
                  labelClosed={isAnonymous ? 'Show thread details' : 'Show reservation details'}
                  labelOpen={isAnonymous ? 'Hide thread details' : 'Hide reservation details'}
                  onToggle={() => setDetailsOpen((v) => !v)}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: detailsOpen ? '1fr' : '0fr',
                  transition: reduced
                    ? 'none'
                    : detailsOpen
                      ? `grid-template-rows ${BAND_OPEN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                      : `grid-template-rows ${BAND_CLOSE_MS}ms cubic-bezier(0.4, 0, 1, 1)`,
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    overflow: 'hidden',
                    opacity: detailsOpen ? 1 : 0,
                    transition: reduced
                      ? 'none'
                      : detailsOpen
                        ? 'opacity 170ms ease-out 60ms'
                        : 'opacity 110ms ease-in',
                  }}
                >
                  {/* 15 above (the zone's own padding, which holds the pill's
                      lower half) + 13 here = the frame's 28. */}
                  <div style={{ padding: `13px ${PANEL_PAD}px 18px` }} inert={!detailsOpen}>
                    {isAnonymous ? (
                      <DetailRows
                        rows={[
                          {
                            label: 'Name',
                            // Stub: naming an unknown number is a real production
                            // action, but it writes to the PMS, and inventing that
                            // write here would demo a pipeline that doesn't exist.
                            value: 'Add name',
                            isLink: true,
                            trailing: <CopyIcon value="" label="Copy name" />,
                          },
                          { label: 'Phone', value: thread.contactNumber },
                          {
                            label: 'Email',
                            value: 'Add email',
                            isLink: true,
                            trailing: <CopyIcon value="" label="Copy email" />,
                          },
                        ]}
                      />
                    ) : (
                      primary && (
                        <>
                          <h4
                            className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px]"
                            style={{ color: colors.colorBlack1, marginBottom: 8 }}
                          >
                            Current Reservation
                          </h4>
                          <ReservationRecord reservation={primary.reservation} guest={primary.guest} />
                        </>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <PanelTabBar
              tabs={TABS.map((t) => ({
                ...t,
                badge: t.id === 'upsells' ? upsells.length : undefined,
              }))}
              activeTab={tab}
              onChange={(id) => setTab(id as TabId)}
            />

            {/* TAB BODY */}
            <div style={{ padding: PANEL_PAD }}>
              {tab === 'linked' && (
                <LinkedReservationsTab
                  companions={companions}
                  contactNumber={thread.contactNumber}
                  onLink={() => push({ kind: 'link' })}
                  onUnlink={(lr: LinkedReservation) =>
                    setUnlinkTarget({
                      scope: 'reservation',
                      guestName: lr.guest.name,
                      reservationIds: [lr.reservation.id],
                    })
                  }
                />
              )}
              {tab === 'upsells' && <UpsellsTab upsells={upsells} />}
              {tab === 'tasks' && (
                <ServiceTasksTab
                  tasks={tasks}
                  onCreate={() => push({ kind: 'create-task' })}
                  /* No confirm: production unlinks the association outright, and
                     nothing is destroyed — the ticket lives in Service Tickets.
                     The toast is the receipt. */
                  onUnlink={(task) => {
                    if (!primary) return;
                    unlinkServiceTask(primary.guest.id, task.id);
                    setToast('Service task unlinked');
                  }}
                />
              )}
              {tab === 'calls' && (
                <CallHistoryTab calls={calls} onOpenCall={(call) => push({ kind: 'call', callId: call.id })} />
              )}
            </div>
          </div>
        </div>

        {/* ── DRILL-IN PANES ───────────────────────────────────────────── */}
        {stack.map((_, i) => {
          const r = route(i);
          if (!r) return null;
          return (
            <React.Fragment key={`${r.kind}-${i}`}>
              {r.kind === 'reservations' && (
                <ReservationsPage
                  stays={ownStays}
                  initialExpandedId={primary?.reservation.id}
                  onBack={pop}
                  onClose={onClose}
                  onOpenScheduledMessages={(reservationId) => push({ kind: 'scheduled', reservationId })}
                />
              )}

              {r.kind === 'scheduled' && (
                <ScheduledMessagesPage reservationId={r.reservationId} onBack={pop} onClose={onClose} />
              )}

              {r.kind === 'call' && (
                <CallPane callId={r.callId} threadId={thread.id} onBack={pop} onClose={onClose} />
              )}

              {r.kind === 'link' && (
                <LinkReservationPage
                  contactNumber={thread.contactNumber}
                  alreadyLinkedIds={thread.linkedReservationIds}
                  onBack={pop}
                  onClose={onClose}
                  onLink={(reservationId) => {
                    linkReservation(thread.id, reservationId);
                    setTab('linked');
                    pop();
                  }}
                />
              )}

              {r.kind === 'primary' && (
                <SetPrimaryGuestPage
                  candidates={samePhone}
                  currentPrimaryId={primary?.reservation.id}
                  onBack={pop}
                  onClose={onClose}
                  onSetPrimary={(reservationId) => {
                    setThreadPrimary(thread.id, reservationId);
                    pop();
                  }}
                />
              )}

              {r.kind === 'create-task' && (
                <CreateServiceTaskPage
                  defaultRoom={primary?.reservation.room}
                  onBack={pop}
                  onClose={onClose}
                  onSubmit={({ room, issue, quantity }) => {
                    if (primary) {
                      createServiceTask(primary.guest.id, {
                        title: issue,
                        status: 'open',
                        room,
                        quantity,
                      });
                    }
                    setTab('tasks');
                    pop();
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <UnlinkConfirmModal
        target={unlinkTarget}
        contactNumber={thread.contactNumber}
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={confirmUnlink}
      />

      {/* Portals to <body>, so it escapes the panel's transform context. */}
      <Toast message={toast ?? ''} isOpen={!!toast} variant="success" />
    </PanelShell>
  );
}

/** Resolves a call id to its record so the drill-in survives a re-render. */
function CallPane({
  callId,
  threadId,
  onBack,
  onClose,
}: {
  callId: string;
  threadId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const call = (callsByThread[threadId] ?? []).find((c) => c.id === callId);
  if (!call) return <div className="w-full h-full shrink-0" />;
  return <CallDetailsPage call={call} onBack={onBack} onClose={onClose} />;
}
