'use client';

/**
 * Team Chat (SPIKE) — dev variant switcher
 *
 * The clarified fork is just two product-agnostic, shell-level models:
 * A overlay vs B shell-gutter. Flip them live and jump backdrops to compare.
 * NOT product UI.
 */

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useSpikeStore,
  VARIANT_META,
  type ChatVariant,
} from '@/lib/products/team-chat/spike-store';

const VARIANTS: ChatVariant[] = ['A', 'B', 'C', 'D', 'E'];
const BACKDROPS = [
  { label: 'Check-in', route: '/check-in' },
  { label: 'Messages', route: '/messages' },
  { label: 'Checkout', route: '/checkout' },
];

export function VariantSwitcher() {
  const { variant, setVariant, panelOpen, togglePanel, cleanHeader, setCleanHeader } = useSpikeStore();
  const router = useRouter();
  const pathname = usePathname();
  const meta = VARIANT_META[variant];
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 left-4 z-[60] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/90 shadow-2xl backdrop-blur"
        style={{ backgroundColor: 'rgba(17,20,28,0.93)' }}
        title="Expand spike harness"
      >
        Spike · {variant}
      </button>
    );
  }

  return (
    <div
      className="absolute bottom-4 left-4 z-[60] w-[280px] rounded-xl border border-white/10 p-3 text-white shadow-2xl backdrop-blur"
      style={{ backgroundColor: 'rgba(17,20,28,0.93)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Spike harness</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-[10px] text-white/45 hover:text-white/80"
          title="Collapse spike harness"
        >
          collapse ✕
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {VARIANTS.map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className="rounded-md py-1.5 text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: v === variant ? '#2858C4' : 'rgba(255,255,255,0.08)',
              color: v === variant ? 'white' : 'rgba(255,255,255,0.7)',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="mt-2">
        <div className="text-[12px] font-semibold text-white">{meta.label}</div>
        <p className="mt-0.5 text-[11px] leading-snug text-white/65">{meta.mechanic}</p>
        <p className="mt-1 text-[10px] text-white/40">ref: {meta.ref}</p>
      </div>

      <button
        onClick={togglePanel}
        className="mt-2.5 w-full rounded-md py-1.5 text-[12px] font-medium transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        {panelOpen ? 'Close panel' : 'Open panel'}
      </button>

      <div className="mt-2.5 border-t border-white/10 pt-2">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">Header treatment (any variant)</div>
        <div className="grid grid-cols-2 gap-1">
          {([['Current', false], ['Clean', true]] as const).map(([label, val]) => (
            <button
              key={label}
              onClick={() => setCleanHeader(val)}
              className="rounded-md py-1 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: cleanHeader === val ? 'rgba(40,88,196,0.35)' : 'rgba(255,255,255,0.06)',
                color: cleanHeader === val ? 'white' : 'rgba(255,255,255,0.65)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 border-t border-white/10 pt-2">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-white/40">Backdrop</div>
        <div className="grid grid-cols-3 gap-1">
          {BACKDROPS.map((b) => {
            const active = pathname === b.route;
            return (
              <button
                key={b.route}
                onClick={() => router.push(b.route)}
                className="rounded-md py-1 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'rgba(40,88,196,0.35)' : 'rgba(255,255,255,0.06)',
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
