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
import { PanelShell, PANEL_ANIM_MS } from './PanelShell';
import {
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
import {
  CallHistoryTab,
  LinkedReservationsTab,
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

/** The right-hand control card: label over value, chevron at the edge. */
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
    <button
      onClick={onClick}
      className="flex-1 min-w-0 text-left rounded-[8px] transition-colors hover:bg-[rgba(0,0,0,0.02)]"
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
            className="block truncate font-['Roboto',sans-serif] text-[13px] leading-[20px]"
            style={{ color: colors.colorBlack3 }}
          >
            {label}
          </span>
          <span
            className="block truncate font-['Roboto',sans-serif] text-[14px] leading-[22px]"
            style={{ color: colors.colorBlueDark1 }}
          >
            {value}
          </span>
        </div>
        <Icon path={mdiChevronRight} size={0.8} color={colors.colorBlack1} />
      </div>
    </button>
  );
}

/** The count badge on the Upsells tab. Derived; hidden at zero. */
function TabBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="flex items-center justify-center shrink-0 font-['Roboto',sans-serif] font-bold"
      style={{
        width: 18,
        height: 18,
        borderRadius: 9999,
        backgroundColor: colors.colorPink1,
        color: colors.colorWhite,
        fontSize: 11,
        lineHeight: '18px',
      }}
    >
      {count}
    </span>
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
  } = useMessagingStore();

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

  // Switching threads resets the panel to its root — a drill-in about one guest
  // is meaningless once the panel is about another.
  useEffect(() => {
    setStack([]);
    setDepth(0);
    setTab('linked');
    setDetailsOpen(false);
    setUnlinkTarget(null);
  }, [thread.id]);

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

            {/* EXPANDER + DETAILS BAND. The pill is centred on the boundary,
                so the white zone above needs no extra room and the band below
                opens beneath it. */}
            <div
              className="relative"
              style={{
                borderTop: `1px solid ${colors.colorBlack6}`,
                paddingTop: detailsOpen ? 0 : 15,
                backgroundColor: detailsOpen ? BAND_BG : undefined,
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

              {detailsOpen && (
                <div style={{ padding: `28px ${PANEL_PAD}px 18px` }}>
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
              )}
            </div>

            {/* TABS */}
            <div
              className="flex items-center"
              style={{
                gap: 28,
                paddingLeft: PANEL_PAD,
                paddingRight: PANEL_PAD,
                borderTop: `1px solid ${colors.colorBlack6}`,
                borderBottom: `1px solid ${colors.colorBlack6}`,
              }}
            >
              {TABS.map((t) => {
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(t.id)}
                    className="relative flex items-center gap-1.5"
                    style={{ paddingTop: 12, paddingBottom: 12 }}
                  >
                    <span
                      className="font-['Roboto',sans-serif] text-[14px] leading-[22px] whitespace-nowrap"
                      style={{
                        color: isActive ? colors.colorBlueDark1 : colors.colorBlack1,
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {t.label}
                    </span>
                    {t.id === 'upsells' && <TabBadge count={upsells.length} />}
                    {isActive && (
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: -2,
                          right: -2,
                          bottom: -1,
                          height: 3,
                          borderRadius: '2px 2px 0 0',
                          backgroundColor: colors.colorBlueDark1,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

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
                <ServiceTasksTab tasks={tasks} onCreate={() => push({ kind: 'create-task' })} />
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
