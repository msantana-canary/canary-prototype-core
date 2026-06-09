'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiCircle, mdiChevronDown } from '@mdi/js';

export function CommandCenterHeader() {
  return (
    <div className="h-[52px] border-b border-gray-200 bg-white flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-gray-900">Messages</h1>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">Statler New York</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>Online hours: 8:00 AM – 11:00 PM EST</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 cursor-pointer">
          <Icon path={mdiCircle} size={0.35} className="text-emerald-500" />
          <span className="text-xs font-medium text-emerald-700">Online</span>
          <Icon path={mdiChevronDown} size={0.55} className="text-emerald-600" />
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          TW
        </div>
      </div>
    </div>
  );
}
