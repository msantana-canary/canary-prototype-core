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
 */

'use client';

import React, { useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiUnfoldMoreHorizontal } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { MainNavTab } from '@/lib/products/messaging/broadcast-types';
import { useMessagingStore, WorkspaceStatus } from '@/lib/products/messaging/store';

type OnlineStatus = WorkspaceStatus;

const STATUS_META: Record<OnlineStatus, { label: string; dot: string; text: string; bg: string }> = {
  online: { label: 'Online', dot: colors.colorLightGreen1, text: colors.colorLightGreen1, bg: 'rgba(0,128,64,0.1)' },
  away: { label: 'Away', dot: '#E8A317', text: '#B37C00', bg: 'rgba(232,163,23,0.12)' },
  offline: { label: 'Offline', dot: colors.colorBlack4, text: colors.colorBlack3, bg: colors.colorBlack7 },
};

export function MainNav({ activeTab, onTabChange }: { activeTab: MainNavTab; onTabChange: (tab: MainNavTab) => void }) {
  const onlineStatus = useMessagingStore((s) => s.workspaceStatus);
  const setOnlineStatus = useMessagingStore((s) => s.setWorkspaceStatus);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    if (isStatusMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isStatusMenuOpen]);

  const segments = [
    { id: 'conversations' as const, label: 'Conversations' },
    { id: 'broadcast' as const, label: 'Broadcast' },
  ];

  const status = STATUS_META[onlineStatus];

  return (
    <div
      className="h-[64px] flex items-end justify-between shrink-0"
      style={{ backgroundColor: colors.colorWhite, borderBottom: `1px solid ${colors.colorBlack6}`, paddingLeft: 24, paddingRight: 24 }}
    >
      {/* Text tabs with 4px underline (flush to the container's bottom border) */}
      <div className="flex items-end">
        {segments.map((segment) => {
          const isActive = activeTab === segment.id;
          return (
            <button
              key={segment.id}
              onClick={() => onTabChange(segment.id)}
              className="flex flex-col items-stretch focus:outline-none cursor-pointer"
            >
              <div className="px-4 py-2 transition-colors hover:bg-black/5">
                <span
                  className="font-['Roboto',sans-serif] font-medium whitespace-nowrap"
                  style={{ fontSize: 16, lineHeight: '24px', color: isActive ? colors.colorBlueDark1 : colors.colorBlack2 }}
                >
                  {segment.label}
                </span>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: isActive ? colors.colorBlueDark1 : 'transparent' }} />
            </button>
          );
        })}
      </div>

      {/* Online hours + status pill */}
      <div className="flex items-center gap-4 self-center">
        <span
          className="font-['Roboto',sans-serif] whitespace-nowrap text-right"
          style={{ fontSize: 12, lineHeight: '18px', color: '#9f9f9f' }}
        >
          Online hours: 8:00 AM – 11:00 PM EST
        </span>

        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setIsStatusMenuOpen((v) => !v)}
            className="flex items-center rounded-[6px] cursor-pointer transition-opacity hover:opacity-80"
            style={{ height: 32, paddingLeft: 12, paddingRight: 8, backgroundColor: status.bg }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status.dot }} />
            <span
              className="font-['Roboto',sans-serif] font-medium whitespace-nowrap"
              style={{ fontSize: 14, lineHeight: '22px', color: status.text, paddingLeft: 8, paddingRight: 8 }}
            >
              {status.label}
            </span>
            <Icon path={mdiUnfoldMoreHorizontal} size={0.83} color={status.text} />
          </button>

          {isStatusMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 z-50"
              style={{ borderColor: colors.colorBlack6 }}
            >
              {(Object.keys(STATUS_META) as OnlineStatus[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setOnlineStatus(key);
                    setIsStatusMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                  style={{ color: colors.colorBlack1 }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_META[key].dot }} />
                  {STATUS_META[key].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
