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
import { firstName, panelIdentity, serviceTaskOwnerKey } from '@/lib/products/messaging/panel-selectors';
import { callsByThread, upsellsByGuest } from '@/lib/products/messaging/panel-mock';
import { LinkedReservation, Thread } from '@/lib/products/messaging/types';
import { formatPhoneForDisplay } from '@/lib/products/messaging/phone';

/* ─────────────────────────────────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────────────────────────────────── */

type PanelRoute =
  | { kind: 'reservations' }
  | { kind: 'scheduled'; reservationId: string }
  | { kind: 'call'; callId: string }
  | { kind: 'link' }
  | { kind: 'primary' }
  /** `room` / `issue` are the recommended-ticket band's prefill (see below). */
  | { kind: 'create-task'; room?: string; issue?: string };

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
 *
 * HEIGHT IS 28, NOT 30, and that is measured rather than chosen: in the frames
 * the pill's border rows sit 14px above the boundary line and 13px below it
 * (`PILL_OVERHANG`), which only closes on a 28px box. The 2px it gives back is
 * what lets the band's top padding and the pill's lower clearance both land on
 * the frame's numbers instead of trading 2px against each other.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠ STRUCTURAL EXCEPTION — no base expresses a NEUTRAL-outline pill
 * ═══════════════════════════════════════════════════════════════════════════
 * The two candidates are `CanaryChip` and `CanaryButton`, and both are
 * colour-locked in the one place that matters.
 *
 * `CanaryChip`'s SELECTABLE register hardwires BLUE — `colorBlueDark1` border
 * and label, `rgba(40,88,196,.08)` on hover, `.16` on press — as INLINE,
 * state-driven styles it rewrites on every pointer event. A gray-bordered pill
 * with a black label would mean `!important`-overriding every one of those
 * states, which is not layering an override on a component, it is fighting the
 * component's whole state model. `CanaryButton` OUTLINED derives its border
 * from `ButtonColor`, and that enum offers blue, red, green, yellow and white
 * — there is no neutral `colorBlack6` — while TEXT has no border at all.
 *
 * So this stays hand-rolled, and the ask is logged with the rest of the
 * pill/chip family (the Sources chip, the Scheduled pill): a NEUTRAL OUTLINE
 * register — or, better, `customColor` on `CanaryChip` for parity with
 * `CanaryTag.customColor`, which already has it. The 28px height and the
 * straddling placement are this panel's own geometry either way.
 */
const PILL_H = 28;

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    /**
     * ⚠ THE DEAD HOVER, third instance — and the same bug the thread row and
     * the broadcast group row both had. This pill carried `hover:bg-[#fafafa]`
     * as a class AND `backgroundColor: colorWhite` as an inline style. An
     * inline style outranks any class, including a `:hover` one, so the wash
     * had never painted once in the life of the panel's centrepiece control.
     *
     * The fix is theirs: state the background where it can WIN, and take the
     * branch's one neutral wash while we are here. `rgba(0,0,0,0.08)` is the
     * library's own hover step — the value `.icon-btn-neutral` rides and the
     * one `ThreadListItem` passes as `hoverColor` — where the declared
     * `#fafafa` was a 2% grey ON WHITE that would have been invisible even if
     * it had rendered. Fixing the cascade without fixing the colour would have
     * shipped a hover nobody could see and called it done.
     *
     * `cursor-pointer` is the other half: Tailwind 4's preflight leaves a bare
     * `<button>` on the default arrow, so the pill read as static in two
     * independent ways.
     */
    <button
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-expanded={isOpen}
      className="flex items-center gap-1 rounded-full transition-colors cursor-pointer"
      style={{
        height: PILL_H,
        paddingLeft: 14,
        paddingRight: 10,
        border: `1px solid ${colors.colorBlack6}`,
        backgroundColor: isHovered ? 'rgba(0,0,0,0.08)' : colors.colorWhite,
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
 * The details band's ground. The frames draw #FAFAFA — which IS colorBlack8 —
 * so the token fits after all: batch 3.2's row-profiling corrected an earlier
 * mis-read that had this as a #F7F8F9 literal. The band reads against the
 * white panel via its top/bottom rules, not via contrast of the ground itself.
 */
const BAND_BG = colors.colorBlack8;

/**
 * The details band's expand. Opening is the slower of the two: it is the motion
 * that has to be READ (a block of record you are about to scan appearing under
 * your click). Closing is a dismissal — a dismissal that lingers reads sticky.
 */
const BAND_OPEN_MS = 220;
const BAND_CLOSE_MS = 160;

/* ── THE ZONE'S VERTICAL RHYTHM, MEASURED OFF THE FRAMES ───────────────────
   Every number below was read out of the 600px-wide root frames (collapsed
   `2030:50317`, expanded `2038:51492` and its three siblings) rather than
   picked, because the zone's whole problem was that it had been picked. The
   panel used to run the control cards into the boundary line at 24px and then
   butt the pill/band straight against the tab strip at 0 — two hard stops in
   the busiest 60px of the panel.

        card bottom
            │  PILL_APPROACH        32   (was 24)
        ────┼──── boundary line, pill straddling it
            │  PILL_OVERHANG        13   (14 above the line, 13 below)
        band top ─ BAND_PAD_TOP     11 ─ "Current Reservation"
            │      … rows …
            │  BAND_PAD_BOTTOM      15   (was 18)
        ────┴──── band's closing line (open only)
               TABS_GAP_OPEN        14   (was 0)
        tab strip

   Closed, the same run is: line → pill's lower half → TABS_GAP_CLOSED 9 → tab
   strip. The two gaps differ because the frames differ: closed, the eye is
   measuring from a floating pill; open, from a ruled edge that has already
   closed the band. Nine and fourteen are what Miguel drew, so nine and
   fourteen are what this renders. */
const PILL_APPROACH = 32;
const PILL_OVERHANG = 13;
const BAND_PAD_TOP = 11;
const BAND_PAD_BOTTOM = 15;
const TABS_GAP_CLOSED = 9;
const TABS_GAP_OPEN = 14;

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
    panelIntent,
    clearPanelIntent,
  } = useMessagingStore();

  const reduced = useReducedMotion();

  const identity = useMemo(
    () => panelIdentity(thread, threadPrimaryReservationId[thread.id]),
    [thread, threadPrimaryReservationId]
  );
  const { primary, ownStays, companions, samePhone, isAnonymous } = identity;

  const [tab, setTab] = useState<TabId>('linked');
  /**
   * Reservation details open BY DEFAULT for a linked thread (Miguel,
   * 2026-08-26 demo-day review: "the sidebar should show reservation details
   * already"). Anonymous threads keep the collapsed default — the low-weight
   * "Show thread details" treatment for a bare phone number is a deliberate,
   * data-justified call from the 2026-08-25 panel rebuild, not an oversight —
   * so the initial value is DERIVED from `isAnonymous` rather than hardcoded.
   */
  const [detailsOpen, setDetailsOpen] = useState(!isAnonymous);
  /**
   * ARRIVAL DOES NOT ANIMATE, only user toggles do — same mechanism
   * `ReservationsPage`'s `hasToggled` uses for its spotlight stay, which opens
   * on mount for the identical reason: growing the band open while the pane is
   * still landing would read as the page settling rather than as an answer to
   * anything nobody asked for. `hasToggledDetails` gates the band's own CSS
   * transitions below rather than an `ExpandRegion`'s `animateOnMount`,
   * because this band (unlike `ReservationsPage`'s per-stay accordion) is not
   * conditionally mounted — it is one grid-template-rows div that is always
   * present, so "don't animate yet" has to mean "no transition property" for
   * exactly the render where it either mounts or arrives on a new thread.
   */
  const [hasToggledDetails, setHasToggledDetails] = useState(false);
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
    // `isAnonymous` is read here for the NEW thread's identity — by the time
    // this effect fires, `identity` has already been recomputed for
    // `thread.id` (its own `useMemo` depends on `thread`).
    setDetailsOpen(!isAnonymous);
    setHasToggledDetails(false);
    setUnlinkTarget(null);
    setToast(null);
    // Only `thread.id` may re-run this. Linking or unlinking a guest
    // mid-thread also flips `isAnonymous`, and that narrower event must not
    // re-trigger this whole reset (stack, tab, toast) the way an actual thread
    // switch should.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /**
   * A COMMAND FROM OUTSIDE — the recommended-ticket band's "Review".
   *
   * The panel owns its navigation stack and nothing else should be able to push
   * a page onto it. So the band states an INTENT on the store and the panel
   * decides how to honour it: reset to the root, then push Create service task
   * with the band's room and issue. The `nonce` in the intent is what makes two
   * identical Reviews two events rather than one, and clearing the intent here
   * keeps it from replaying when the panel re-opens later.
   */
  useEffect(() => {
    if (panelIntent?.kind !== 'create-task') return;
    setStack([{ kind: 'create-task', room: panelIntent.room, issue: panelIntent.issue }]);
    setDepth(1);
    clearPanelIntent();
  }, [panelIntent, clearPanelIntent]);

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
  /* Service tasks hang off the primary GUEST, or off the THREAD when there is
     no guest to hang them off — see `serviceTaskOwnerKey`. One key for the read
     and the write, so a task raised on an anonymous conversation can actually
     come back. */
  const taskOwnerId = serviceTaskOwnerKey(thread, identity);
  const tasks = serviceTasks[taskOwnerId] ?? [];
  const calls = callsByThread[thread.id] ?? [];

  const confirmUnlink = () => {
    if (!unlinkTarget) return;
    if (unlinkTarget.scope === 'guest') unlinkGuest(thread.id, unlinkTarget.reservationIds);
    else unlinkReservation(thread.id, unlinkTarget.reservationIds[0]);
    setUnlinkTarget(null);
  };

  /**
   * Profile kebab.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * "Unlink guest" IS ABSENT WHEN THE PRIMARY AUTO-LINKED (Miguel, 2026-08-25)
   * ═══════════════════════════════════════════════════════════════════════════
   * THE BLOCK IS REAL, and the reason is worth keeping even though the UI no
   * longer prints it: a phone match is a FACT from the PMS, not an assertion
   * made in this panel, so unlinking it would only hold until the next sync
   * re-asserted it. Production hard-blocks the action for exactly that reason.
   *
   * This used to render the item DISABLED, carrying that sentence as its hint —
   * "you can't do this and here's why" beats a missing menu item, normally.
   * Miguel's call reverses it here on a narrower point: the escape hatch the
   * hint implies DOESN'T EXIST YET. There is no un-auto-link anywhere in the
   * product, so a permanently dead row promises a door that was never built.
   * Until one is, the honest menu is the one that offers only what works —
   * "Change primary guest" re-points the spotlight at whoever is actually
   * holding the phone, which is what a hotelier reaching for "unlink" on an
   * auto-linked guest almost always wanted.
   *
   * ⚠ RESTORE THE DISABLED ITEM the day an unlink-override ships: the state and
   * its copy are one `git log` away, and at that point a visible-but-blocked row
   * teaches the rule instead of hiding it.
   *
   * The COMPANION rows in Linked Reservations still render their disabled
   * "Unlink reservation" — that is a different question (this stay, not this
   * person) and it is deliberately left alone.
   */
  const kebabItems: KebabItem[] = primary
    ? [
        { label: 'Change primary guest', onClick: () => push({ kind: 'primary' }) },
        // Staff-linked only: the link was asserted here, so it can be withdrawn here.
        ...(primary.isAutoLinked
          ? []
          : [
              {
                label: 'Unlink guest',
                danger: true,
                onClick: () =>
                  setUnlinkTarget({
                    scope: 'guest',
                    guestName: primary.guest.name,
                    reservationIds: ownStays.map((lr) => lr.reservation.id),
                  }),
              } satisfies KebabItem,
            ]),
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
            <div
              style={{
                paddingLeft: PANEL_PAD,
                paddingRight: PANEL_PAD,
                paddingTop: 20,
                /* The control cards' run-out to the boundary line the pill sits
                   on. This is the gap the frames are most emphatic about. */
                paddingBottom: PILL_APPROACH,
              }}
            >
              {isAnonymous ? (
                // No guest, no portrait: the number IS the conversation.
                <h3
                  className="font-['Roboto',sans-serif] font-medium text-[17px] leading-[26px] truncate"
                  style={{ color: colors.colorBlack1, minHeight: 48, display: 'flex', alignItems: 'center' }}
                >
                  {/* The anonymous panel's title IS the number, so it gets
                      the same hotelier register as the row and the header
                      (QA-2). Display only. */}
                  {formatPhoneForDisplay(thread.contactNumber)}
                </h3>
              ) : (
                <div className="flex items-start gap-3">
                  {/* SQUARE, like every other avatar on the surface. The panel
                      frames draw this 48px portrait as a circle and the build
                      flagged it; Miguel ruled 2026-08-25 that the cross-cutting
                      avatar shape wins over the frame (see Avatar.tsx). */}
                  <Avatar
                    src={primary?.guest.avatar}
                    initials={primary?.guest.initials ?? ''}
                    size="profile"
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

                ── THE CLOSING LINE IS NOT THAT RULE COMING BACK ─────────────
                The zone's own bottom border only inks when the band is OPEN,
                and it sits `TABS_GAP_OPEN` above the tab strip rather than
                against it. It is the gray slab's bottom edge, not the strip's
                top edge: closed, it is transparent and there is no second rule
                anywhere in the run. It is held at 1px in both states so that
                opening the band moves nothing but the band.

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
                borderBottom: `1px solid ${detailsOpen ? colors.colorBlack6 : 'transparent'}`,
                /* The pill's lower half. Content starts exactly where the pill
                   ends, so the band's own top padding is measured from the pill
                   and not from the line. */
                paddingTop: PILL_OVERHANG,
                marginBottom: detailsOpen ? TABS_GAP_OPEN : TABS_GAP_CLOSED,
                backgroundColor: detailsOpen ? BAND_BG : 'transparent',
                // No transition until the user has actually toggled once —
                // arrival (mount, or landing on a new thread already open)
                // must render its resting state directly, not ease into it.
                transition: reduced || !hasToggledDetails
                  ? 'none'
                  : ['background-color', 'border-bottom-color', 'margin-bottom']
                      .map((p) => `${p} ${detailsOpen ? BAND_OPEN_MS : BAND_CLOSE_MS}ms ease-out`)
                      .join(', '),
              }}
            >
              {/* `top` resolves against the zone's PADDING box, which starts 1px
                  below the border box — so this lands the pill's bottom exactly
                  on the padding box's top edge, which is where the band's
                  content starts. Everything above the line follows from that:
                  28 − 13 = 15 up from the padding box = 14 above the rule. */}
              <div
                className="absolute left-0 right-0 flex justify-center"
                style={{ top: -(PILL_H - PILL_OVERHANG), zIndex: 1 }}
              >
                <ExpanderPill
                  isOpen={detailsOpen}
                  labelClosed={isAnonymous ? 'Show thread details' : 'Show reservation details'}
                  labelOpen={isAnonymous ? 'Hide thread details' : 'Hide reservation details'}
                  onToggle={() => {
                    setHasToggledDetails(true);
                    setDetailsOpen((v) => !v);
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: detailsOpen ? '1fr' : '0fr',
                  // Same arrival-is-static rule as the zone above: no
                  // transition on the render that first opens (or arrives
                  // already open on a fresh thread) — only a user toggle
                  // afterward earns the ease.
                  transition: reduced || !hasToggledDetails
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
                    transition: reduced || !hasToggledDetails
                      ? 'none'
                      : detailsOpen
                        ? 'opacity 170ms ease-out 60ms'
                        : 'opacity 110ms ease-in',
                  }}
                >
                  {/* 13 above (the zone's own padding, which holds the pill's
                      lower half) + 11 here = the frame's 24 from the band's top
                      edge to the section title's line box. */}
                  <div
                    style={{ padding: `${BAND_PAD_TOP}px ${PANEL_PAD}px ${BAND_PAD_BOTTOM}px` }}
                    inert={!detailsOpen}
                  >
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
                          { label: 'Phone', value: formatPhoneForDisplay(thread.contactNumber) },
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
                  /* The SAME timeline page the Reservations drill-in opens, for
                     the companion's own stay. One guest-journey surface, two
                     doors — the panel never grows a second timeline. */
                  onOpenScheduledMessages={(reservationId) =>
                    push({ kind: 'scheduled', reservationId })
                  }
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
                    unlinkServiceTask(taskOwnerId, task.id);
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
                  /* The band's room wins over the stay's when there is one: the
                     band read a room out of the conversation, and the guest may
                     well be messaging about a room that is not their own. */
                  defaultRoom={r.room ?? primary?.reservation.room}
                  defaultIssue={r.issue}
                  onBack={pop}
                  onClose={onClose}
                  onSubmit={({ room, issue, quantity }) => {
                    /* No `if (primary)` guard: an anonymous conversation keys
                       its tasks on the thread, so the write always lands and
                       the tab the flow returns to always shows the row it just
                       promised. The guard is what used to eat the task. */
                    createServiceTask(taskOwnerId, {
                      title: issue,
                      status: 'open',
                      room,
                      quantity,
                    });
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
