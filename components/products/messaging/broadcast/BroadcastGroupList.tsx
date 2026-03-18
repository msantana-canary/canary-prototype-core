/**
 * BroadcastGroupList Component
 *
 * Left column of the broadcast view.
 * Uses CanaryList/CanaryListItem for built-in groups (Arrivals, In-house, Departures)
 * and custom groups. Active/Archived filtering is handled by BroadcastSubNav.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiLoginVariant,
  mdiBedOutline,
  mdiLogoutVariant,
  mdiAccountMultipleOutline,
  mdiPlus,
} from '@mdi/js';
import { CanaryList, CanaryListItem, ButtonType, CanaryButton } from '@canary-ui/components';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';

const builtInIcons: Record<string, string> = {
  arrivals: mdiLoginVariant,
  'in-house': mdiBedOutline,
  departures: mdiLogoutVariant,
};

function CustomGroupIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 40,
        height: 40,
        borderRadius: 50,
        padding: 10,
        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#cccccc',
        marginRight: -8,
      }}
    >
      <Icon
        path={mdiAccountMultipleOutline}
        size="20px"
        color="#ffffff"
      />
    </div>
  );
}

export function BroadcastGroupList() {
  const {
    allGroups,
    selectedGroupId,
    activeGroupTab,
    selectGroup,
    openCreateGroupModal,
  } = useBroadcastStore();

  const builtInGroupsList = allGroups.filter(g => g.type === 'built-in');
  const activeCustomGroups = allGroups.filter(g => g.type === 'custom' && !g.isArchived);

  if (activeGroupTab === 'archived') {
    return (
      <div className="h-full flex flex-col border-r border-gray-200" style={{ backgroundColor: '#fafafa' }}>
        <div className="flex items-center justify-center h-32">
          <p
            className="font-['Roboto',sans-serif] text-[14px] text-center"
            style={{ color: '#999999' }}
          >
            No archived groups
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r border-gray-200 overflow-y-auto broadcast-group-list" style={{ backgroundColor: '#fafafa' }}>
      {/* Built-in Groups */}
      <CanaryList className="list-none">
        {builtInGroupsList.map(group => {
          const isSelected = selectedGroupId === group.id;
          return (
            <CanaryListItem
              key={group.id}
              title={group.name}
              icon={
                <Icon
                  path={builtInIcons[group.builtInType!]}
                  size={1}
                  color={isSelected ? '#ffffff' : '#414141'}
                />
              }
              isSelected={isSelected}
              backgroundColor={isSelected ? '#2858c4' : '#fafafa'}
              hoverColor="#f2f2f2"
              onClick={() => selectGroup(group.id)}
              alignment="center"
            />
          );
        })}
      </CanaryList>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Custom Groups Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span
          className="font-['Roboto',sans-serif] text-[12px] leading-[16px] uppercase font-medium"
          style={{ color: '#999999' }}
        >
          Groups
        </span>
        <button
          onClick={openCreateGroupModal}
          aria-label="Create group"
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <Icon path={mdiPlus} size={0.67} color="#2858c4" />
        </button>
      </div>

      {/* Custom Groups List */}
      <CanaryList className="list-none">
        {activeCustomGroups.map(group => {
          const isSelected = selectedGroupId === group.id;
          return (
            <CanaryListItem
              key={group.id}
              title={group.name}
              subtitle={`${group.memberCount ?? 0} guest${(group.memberCount ?? 0) !== 1 ? 's' : ''}`}
              description={group.lastBroadcastPreview}
              leftContent={<CustomGroupIcon isSelected={isSelected} />}
              isSelected={isSelected}
              backgroundColor={isSelected ? '#2858c4' : '#fafafa'}
              hoverColor="#f2f2f2"
              onClick={() => selectGroup(group.id)}
              alignment="center"
            />
          );
        })}
      </CanaryList>
    </div>
  );
}
