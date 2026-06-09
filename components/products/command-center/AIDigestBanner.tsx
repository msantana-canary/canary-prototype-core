'use client';

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiRobotOutline,
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiClose,
} from '@mdi/js';
import { DigestStats } from '@/lib/products/command-center/types';

interface AIDigestBannerProps {
  stats: DigestStats;
  onDismiss?: () => void;
}

export function AIDigestBanner({ stats, onDismiss }: AIDigestBannerProps) {
  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl bg-gradient-to-r from-[#1B2B3A] to-[#2D4A5E] px-5 py-3.5 text-white relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 text-white/40 hover:text-white/70 transition-colors"
        >
          <Icon path={mdiClose} size={0.65} />
        </button>
      )}

      <div className="flex items-center gap-2 mb-2.5">
        <Icon path={mdiRobotOutline} size={0.7} className="text-blue-300" />
        <span className="text-[13px] font-semibold">Good morning, Theresa</span>
        <span className="text-[11px] text-white/50 ml-1">Daily Briefing</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/8 rounded-lg px-2.5 py-1.5 -mx-1 transition-colors">
          <Icon path={mdiAlertCircleOutline} size={0.65} className="text-amber-400" />
          <div>
            <span className="text-lg font-bold leading-none">{stats.serviceRecovery}</span>
            <span className="text-[11px] text-white/60 ml-1.5">service recovery</span>
          </div>
        </div>

        <div className="w-px h-7 bg-white/15" />

        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/8 rounded-lg px-2.5 py-1.5 -mx-1 transition-colors">
          <Icon path={mdiCheckCircleOutline} size={0.65} className="text-emerald-400" />
          <div>
            <span className="text-lg font-bold leading-none">{stats.aiHandledOvernight}</span>
            <span className="text-[11px] text-white/60 ml-1.5">AI handled overnight</span>
          </div>
        </div>

        <div className="w-px h-7 bg-white/15" />

        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/8 rounded-lg px-2.5 py-1.5 -mx-1 transition-colors">
          <Icon path={mdiAlertCircleOutline} size={0.65} className="text-red-400" />
          <div>
            <span className="text-lg font-bold leading-none">{stats.escalationsPending}</span>
            <span className="text-[11px] text-white/60 ml-1.5">escalations pending</span>
          </div>
        </div>

        <div className="w-px h-7 bg-white/15" />

        <div className="flex items-center gap-2">
          <Icon path={mdiClockOutline} size={0.65} className="text-blue-300" />
          <div>
            <span className="text-lg font-bold leading-none">{stats.avgResponseTime}</span>
            <span className="text-[11px] text-white/60 ml-1.5">avg response time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
