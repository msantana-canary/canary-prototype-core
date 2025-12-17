/**
 * PageHeader Component
 *
 * Top header bar with property selector, referral/reservation badges, and user profile.
 * Static UI component - not interactive.
 */

import React from 'react';
import { Avatar } from './Avatar';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiGift, mdiCheckCircle } from '@mdi/js';

export function PageHeader() {
  return (
    <div className="bg-white border-b border-gray-200 h-[56px] px-6 py-2 flex items-center justify-between">
      {/* Left: Property Selector */}
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="text-sm font-medium text-gray-900">Statler New York</span>
        <Icon path={mdiChevronDown} size={0.8} className="text-blue-600" />
      </div>

      {/* Right: Info Pills + User Profile */}
      <div className="flex items-center gap-2">
        {/* Referral Pill */}
        <div className="flex items-center gap-2 bg-[#f0f0f0] rounded-[24px] px-4 py-1">
          <Icon path={mdiGift} size={1} className="text-gray-700" />
          <span className="text-sm text-gray-900">Refer to earn $200</span>
        </div>

        {/* Reservation Status Pill */}
        <div className="flex items-center gap-2 bg-[#cce6d9] rounded-[20px] px-4 py-1">
          <Icon path={mdiCheckCircle} size={1} className="text-green-700 opacity-50" />
          <span className="text-sm text-gray-900">Reservations</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <Avatar
            src="https://i.pravatar.cc/150?img=5"
            initials="TW"
            size="medium"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-gray-900">Theresa Webb</span>
            <span className="text-[10px] text-gray-500 uppercase">Front desk</span>
          </div>
          <Icon path={mdiChevronDown} size={0.8} className="text-gray-900" />
        </div>
      </div>
    </div>
  );
}
