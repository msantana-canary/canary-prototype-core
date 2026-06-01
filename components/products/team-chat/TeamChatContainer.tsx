'use client';

/**
 * Team Chat (SPIKE) — variant-aware container
 *
 * Same panel interior, four different mounting mechanics. Rendered as an
 * absolutely-positioned sibling INSIDE the dashboard content region (below the
 * header, right of the sidebar) so it naturally respects the app shell.
 *
 *   A — overlay float : fixed-width panel floats over the page (page untouched).
 *   B — push + reflow : panel reserves a gutter; content is pushed by SpikeRoot.
 *   C — push + resize : like B, plus a drag handle on the panel's left edge.
 *   D — footer launcher: a persistent bottom bar; panel pops up bottom-right.
 */

import Icon from '@mdi/react';
import { mdiMessageTextOutline, mdiChevronUp, mdiChevronDown } from '@mdi/js';
import { colors } from '@canary-ui/components';
import {
  useSpikeStore,
  FOOTER_BAR_HEIGHT,
} from '@/lib/products/team-chat/spike-store';
import { groups } from '@/lib/products/team-chat/mock-data';
import { TeamChatPanel } from './TeamChatPanel';

export function TeamChatContainer() {
  const { variant, panelOpen, panelWidth, setPanelWidth, togglePanel } = useSpikeStore();
  const totalUnread = groups.reduce((n, g) => n + g.unread, 0);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => setPanelWidth(window.innerWidth - ev.clientX);
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Variant D — persistent footer bar + bottom-right popup ────────
  if (variant === 'D') {
    return (
      <>
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex items-center border-t border-gray-200 bg-white px-4"
          style={{ height: FOOTER_BAR_HEIGHT }}
        >
          <button onClick={togglePanel} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50">
            <Icon path={mdiMessageTextOutline} size={0.8} color={colors.colorBlack1} />
            <span className="text-[13px] font-medium" style={{ color: colors.colorBlack1 }}>Team Chat</span>
            {totalUnread > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: colors.colorBlueDark1 }}
              >
                {totalUnread}
              </span>
            )}
            <Icon path={panelOpen ? mdiChevronDown : mdiChevronUp} size={0.7} color={colors.colorBlack3} />
          </button>
        </div>

        {panelOpen && (
          <div
            className="absolute z-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
            style={{
              right: 16,
              bottom: FOOTER_BAR_HEIGHT + 8,
              width: 384,
              height: 'min(560px, calc(100% - 64px))',
            }}
          >
            <TeamChatPanel />
          </div>
        )}
      </>
    );
  }

  // ── Variants A / B / C — right-anchored panel ─────────────────────
  const isFloat = variant === 'A';
  return (
    <div
      className="absolute inset-y-0 right-0 z-40 bg-white"
      style={{
        width: panelWidth,
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFloat && panelOpen ? '0 0 28px rgba(16,24,40,0.18)' : undefined,
        borderLeft: isFloat ? undefined : '1px solid #E5E7EB',
      }}
    >
      {variant === 'C' && (
        <div
          onMouseDown={startResize}
          className="group absolute inset-y-0 left-0 z-50 flex w-2 -translate-x-1/2 cursor-col-resize items-center justify-center"
          title="Drag to resize"
        >
          <span className="h-10 w-1 rounded-full bg-gray-300 group-hover:bg-blue-400" />
        </div>
      )}
      <TeamChatPanel />
    </div>
  );
}
