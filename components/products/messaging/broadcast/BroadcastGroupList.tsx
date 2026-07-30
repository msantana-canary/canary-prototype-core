/**
 * BroadcastGroupList — REDESIGN (broadcast step 1 baseline)
 *
 * The audience selector: the top zone of the combined Audience card. The status
 * trio (Arrivals / In-house / Departures) sits as compact selectable rows, then
 * a GROUPS section (label + "+" new group + kebab) lists custom groups.
 *
 * Rows use the redesign selection register (soft colorBlueDark5 fill +
 * colorBlueDark3 border, rounded-6) instead of the old solid-blue CanaryListItem
 * rows. GROUPS rows keep their member count + last-broadcast preview (both the
 * old prototype and production show them); the STATUS trio stays bare.
 *
 * The kebab replaces the removed Active/Archived pill row — "View archived"
 * flips the section to the archived empty state and back.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiLoginVariant,
  mdiBedOutline,
  mdiLogoutVariant,
  mdiAccountMultipleOutline,
  mdiPlus,
  mdiDotsHorizontal,
  mdiClockOutline,
} from '@mdi/js';
import { colors } from '@canary-ui/components';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { getFolderPopulation } from '@/lib/products/messaging/broadcast-audience-facts';

const builtInIcons: Record<string, string> = {
  arrivals: mdiLoginVariant,
  'in-house': mdiBedOutline,
  departures: mdiLogoutVariant,
};

/**
 * One selectable audience row. The STATUS trio renders bare (icon + name).
 * GROUPS rows also carry a member count and the last-broadcast preview, which
 * both the old prototype and production show.
 */
function AudienceRow({
  iconPath,
  label,
  isSelected,
  onClick,
  memberCount,
  preview,
  population,
  scheduledCount,
}: {
  iconPath: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  memberCount?: number;
  preview?: string;
  /** Right-aligned live population (variant B/C rails). */
  population?: number;
  /** Inline "N scheduled" line on groups holding a queued send. */
  scheduledCount?: number;
}) {
  const isRich = memberCount !== undefined || !!preview || !!scheduledCount;

  return (
    <button
      onClick={onClick}
      className={`w-full flex gap-3 rounded-[6px] transition-colors cursor-pointer text-left ${
        isRich ? 'items-start' : 'items-center'
      } ${isSelected ? '' : 'hover:bg-[#f9fafb]'}`}
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: isSelected ? colors.colorBlueDark5 : 'transparent',
        border: `1px solid ${isSelected ? colors.colorBlueDark3 : 'transparent'}`,
      }}
    >
      <Icon
        path={iconPath}
        size={0.83}
        color={isSelected ? colors.colorBlueDark1 : colors.colorBlack3}
        className="shrink-0"
        style={isRich ? { marginTop: 2 } : undefined}
      />

      <span className="flex-1 min-w-0 flex flex-col">
        <span className="flex items-center gap-2">
          <span
            className="font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px] truncate min-w-0"
            style={{ color: isSelected ? colors.colorBlueDark1 : colors.colorBlack1 }}
            title={label}
          >
            {label}
          </span>
          {population !== undefined && (
            <>
              <span className="flex-1" />
              <span
                className="font-['Roboto',sans-serif] text-[12px] leading-[18px] shrink-0 tabular-nums"
                style={{ color: colors.colorBlack3 }}
              >
                {population}
              </span>
            </>
          )}
        </span>

        {memberCount !== undefined && (
          <span
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack3 }}
          >
            {memberCount} guest{memberCount !== 1 ? 's' : ''}
          </span>
        )}

        {preview && (
          <span
            className="font-['Roboto',sans-serif] text-[12px] leading-[18px] truncate"
            style={{ color: colors.colorBlack4 }}
            title={preview}
          >
            {preview}
          </span>
        )}

        {!!scheduledCount && (
          <span className="flex items-center gap-1" style={{ marginTop: 2 }}>
            <Icon path={mdiClockOutline} size={0.58} color={colors.colorBlueDark1} />
            <span
              className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
              style={{ color: colors.colorBlueDark1 }}
            >
              {scheduledCount} scheduled
            </span>
          </span>
        )}
      </span>
    </button>
  );
}

/** `showPopulation` adds the live folder counts the challenger rails carry. */
export function BroadcastGroupList({
  showPopulation = false,
  section = 'all',
}: {
  showPopulation?: boolean;
  /** The canon layout renders these as two separate stacked cards. */
  section?: 'all' | 'states' | 'groups';
} = {}) {
  const {
    allGroups,
    selectedGroupId,
    activeGroupTab,
    selectGroup,
    setActiveGroupTab,
    openCreateGroupModal,
    scheduledBroadcasts,
    selectedDate,
  } = useBroadcastStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRootRef.current && !menuRootRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const builtInGroupsList = allGroups.filter(g => g.type === 'built-in');
  const isArchivedView = activeGroupTab === 'archived';
  const customGroupsList = allGroups.filter(
    g => g.type === 'custom' && (isArchivedView ? g.isArchived : !g.isArchived)
  );

  return (
    <div className="flex flex-col" style={{ padding: 8 }}>
      {/* Status trio */}
      {section !== 'groups' && (
      <div className="flex flex-col gap-1">
        {builtInGroupsList.map(group => (
          <AudienceRow
            key={group.id}
            iconPath={builtInIcons[group.builtInType!]}
            label={group.name}
            isSelected={selectedGroupId === group.id}
            onClick={() => selectGroup(group.id)}
            population={
              showPopulation ? getFolderPopulation(group.id, allGroups, selectedDate) : undefined
            }
          />
        ))}
      </div>
      )}

      {section !== 'states' && (
      <>
      {/* GROUPS section header — label + new group + kebab (holds "View archived") */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingLeft: 12,
          paddingRight: 4,
          paddingTop: section === 'groups' ? 4 : 16,
          paddingBottom: 4,
        }}
      >
        <span
          className="font-['Roboto',sans-serif] font-medium text-[10px] leading-[16px] uppercase"
          style={{ color: colors.colorBlack3, letterSpacing: '0.4px' }}
        >
          {isArchivedView ? 'Archived groups' : 'Groups'}
        </span>

        <div className="flex items-center">
          <button
            onClick={openCreateGroupModal}
            aria-label="New group"
            className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
            style={{ padding: 6 }}
          >
            <Icon path={mdiPlus} size={0.75} color={colors.colorBlueDark1} />
          </button>

          <div className="relative" ref={menuRootRef}>
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Group options"
              className="rounded-[4px] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              style={{ padding: 6 }}
            >
              <Icon path={mdiDotsHorizontal} size={0.75} color={colors.colorBlack3} />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 z-50 rounded-lg bg-white py-1"
                style={{
                  width: 168,
                  border: `1px solid ${colors.colorBlack6}`,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                }}
              >
                <button
                  onClick={() => {
                    setActiveGroupTab(isArchivedView ? 'active' : 'archived');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors font-['Roboto',sans-serif]"
                  style={{ color: colors.colorBlack1 }}
                >
                  {isArchivedView ? 'View active' : 'View archived'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom groups */}
      {customGroupsList.length === 0 ? (
        <div className="flex items-center justify-center" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <p
            className="font-['Roboto',sans-serif] text-[14px] text-center"
            style={{ color: colors.colorBlack4 }}
          >
            {isArchivedView ? 'No archived groups' : 'No groups yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {customGroupsList.map(group => (
            <AudienceRow
              key={group.id}
              iconPath={mdiAccountMultipleOutline}
              label={group.name}
              isSelected={selectedGroupId === group.id}
              onClick={() => selectGroup(group.id)}
              memberCount={group.memberCount ?? 0}
              preview={group.lastBroadcastPreview}
              scheduledCount={
                showPopulation
                  ? scheduledBroadcasts.filter(sb => sb.groupId === group.id).length
                  : undefined
              }
            />
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
