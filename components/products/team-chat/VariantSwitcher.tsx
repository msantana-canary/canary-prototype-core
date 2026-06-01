'use client';

/**
 * Team Chat (SPIKE) — dev variant switcher
 *
 * A floating harness (NOT product UI) so Miguel can flip A/B/C/D live and jump
 * between backdrops to compare the container mechanic side by side at 1440px.
 */

import { usePathname, useRouter } from 'next/navigation';
import {
  useSpikeStore,
  VARIANT_META,
  type ChatVariant,
} from '@/lib/products/team-chat/spike-store';

const VARIANTS: ChatVariant[] = ['A', 'B', 'C', 'D'];
const BACKDROPS = [
  { label: 'Check-in', route: '/check-in' },
  { label: 'Messages', route: '/messages' },
  { label: 'Checkout', route: '/checkout' },
];

export function VariantSwitcher() {
  const { variant, setVariant, panelOpen, togglePanel, panelWidth } = useSpikeStore();
  const router = useRouter();
  const pathname = usePathname();
  const meta = VARIANT_META[variant];

  return (
    <div
      className="absolute bottom-4 left-4 z-[60] w-[272px] rounded-xl border border-white/10 p-3 text-white shadow-2xl backdrop-blur"
      style={{ backgroundColor: 'rgba(17,20,28,0.93)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">Spike harness</span>
        <span className="text-[10px] text-white/45">not final UI</span>
      </div>

      {/* Variant segmented control */}
      <div className="grid grid-cols-4 gap-1">
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

      {/* Active variant description */}
      <div className="mt-2">
        <div className="text-[12px] font-semibold text-white">{meta.label}</div>
        <p className="mt-0.5 text-[11px] leading-snug text-white/65">{meta.mechanic}</p>
        <p className="mt-1 text-[10px] text-white/40">ref: {meta.ref}</p>
        {(variant === 'B' || variant === 'C') && (
          <p className="mt-1 text-[10px] text-white/40">panel width: {panelWidth}px</p>
        )}
      </div>

      {/* Panel open/close */}
      <button
        onClick={togglePanel}
        className="mt-2.5 w-full rounded-md py-1.5 text-[12px] font-medium transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        {panelOpen ? 'Close panel' : 'Open panel'}
      </button>

      {/* Backdrop quick-nav */}
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
