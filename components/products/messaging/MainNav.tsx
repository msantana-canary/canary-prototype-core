/**
 * MainNav Component — REDESIGN (Figma "Messaging" frame 29:2099, node 29:2101)
 *
 * White 64px bar with text tabs (Conversations / Broadcast):
 * 16px Medium labels, 4px flush-bottom underline on the active tab, no icons.
 * Right side: "Online hours" caption + a tonal status pill (green dot +
 * "Online" + caret) that opens a small Online/Offline/Away menu.
 *
 * ── THE PILL IS REAL NOW (batch 4) ────────────────────────────────────────
 * The status used to be local state: the pill changed colour and nothing else
 * in the product knew. It now writes `workspaceStatus` to the store, because
 * AWAY is the condition the amber away band renders on — and a band that
 * demos by editing mock data is a band nobody can show in a meeting. One
 * control, flipped live, and every open conversation says so.
 *
 * ── BOTH CONTROLS ARE LIBRARY COMPONENTS NOW (batch 5) ────────────────────
 * The tab pair was the clearest re-implementation in the branch: the
 * hand-rolled markup was a pixel-level DUPLICATE of `CanaryTabs`' text variant,
 * down to the `px-4 py-2` label box, the 16px/24px medium Roboto, the
 * `hover:bg-black/5` wash and the `w-full h-1` underline. It is `CanaryTabs`
 * now, with `!w-auto` as the only override — the base forces `w-full`, which
 * would eat the bar's `justify-between`. `CanaryTabs` is UNCONTROLLED
 * (`defaultTab` + `onChange`, no `activeTab` prop), which is safe here for the
 * same reason it is safe in `SubNav`: nothing outside this control ever changes
 * the active tab.
 *
 * The status pill is `CanaryTag` (custom colours, a leading dot and a trailing
 * caret in the icon slots) wrapped as a `CanaryOverflowMenu` trigger — the
 * library's own contract for "any node opens this menu". That retires a second
 * hand-rolled popover and its click-outside effect. `CanaryTag` has no
 * `onClick`, which is fine: the menu's trigger wrapper supplies it.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiUnfoldMoreHorizontal } from '@mdi/js';
import {
  CanaryTabs,
  CanaryTag,
  CanaryOverflowMenu,
  TabType,
  TagVariant,
  colors,
} from '@canary-ui/components';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { useMessagingStore, WorkspaceStatus } from '@/lib/products/messaging/store';

type OnlineStatus = WorkspaceStatus;

const STATUS_META: Record<OnlineStatus, { label: string; dot: string; text: string; bg: string }> = {
  online: { label: 'Online', dot: colors.colorLightGreen1, text: colors.colorLightGreen1, bg: 'rgba(0,128,64,0.1)' },
  away: { label: 'Away', dot: '#E8A317', text: '#B37C00', bg: 'rgba(232,163,23,0.12)' },
  offline: { label: 'Offline', dot: colors.colorBlack4, text: colors.colorBlack3, bg: colors.colorBlack7 },
};

/** The 8px status dot. Same glyph in the pill's leading slot and in every menu
 *  row, so the thing you pick is visibly the thing you get. */
function StatusDot({ color }: { color: string }) {
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

export function MainNav({ activeTab, onTabChange }: { activeTab: MainNavTab; onTabChange: (tab: MainNavTab) => void }) {
  const onlineStatus = useMessagingStore((s) => s.workspaceStatus);
  const setOnlineStatus = useMessagingStore((s) => s.setWorkspaceStatus);

  const status = STATUS_META[onlineStatus];

  return (
    <div
      className="h-[64px] flex items-end justify-between shrink-0"
      style={{ backgroundColor: colors.colorWhite, borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 24, paddingRight: 24 }}
    >
      {/* Text tabs with 4px underline (flush to the container's bottom border).
          The body lives elsewhere, so every tab's `content` is empty — the same
          arrangement SubNav uses. */}
      <CanaryTabs
        tabs={[
          { id: 'conversations', label: 'Conversations', content: <></> },
          { id: 'broadcast', label: 'Broadcast', content: <></> },
        ]}
        tabType={TabType.TEXT}
        defaultTab={activeTab}
        onChange={(tabId) => onTabChange(tabId as MainNavTab)}
        className="!w-auto"
      />

      {/* Online hours + status pill */}
      <div className="flex items-center gap-4 self-center">
        <span
          className="font-['Roboto',sans-serif] whitespace-nowrap text-right"
          style={{ fontSize: 12, lineHeight: '18px', color: '#9f9f9f' }}
        >
          Online hours: 8:00 AM – 11:00 PM EST
        </span>

        <CanaryOverflowMenu
          placement="bottom-end"
          trigger={
            <CanaryTag
              label={status.label}
              variant={TagVariant.FILLED}
              uppercase={false}
              customColor={{ backgroundColor: status.bg, fontColor: status.text, iconColor: status.text }}
              leadingIcon={<StatusDot color={status.dot} />}
              trailingIcon={<Icon path={mdiUnfoldMoreHorizontal} size={0.83} color={status.text} />}
              /* The tag's own metrics are a 12px chip; the pill is a 32px
                 control. Radius 6 is the branch's, and the two icon slots are
                 re-sized independently because the base draws both at 12px —
                 the dot wants 8, the caret wants 20. */
              className="!h-[32px] !rounded-[6px] !pl-3 !pr-2 !gap-2 !text-[14px] !leading-[22px] cursor-pointer transition-opacity hover:opacity-80 [&>div:first-child]:!w-2 [&>div:first-child]:!h-2 [&>div:last-child]:!w-5 [&>div:last-child]:!h-5"
            />
          }
          items={(Object.keys(STATUS_META) as OnlineStatus[]).map((key) => ({
            id: key,
            label: STATUS_META[key].label,
            icon: <StatusDot color={STATUS_META[key].dot} />,
            onClick: () => setOnlineStatus(key),
          }))}
        />
      </div>
    </div>
  );
}
