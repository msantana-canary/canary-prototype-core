'use client';

/**
 * Team Chat (SPIKE) — CollapsedNavRail  [variant C]
 *
 * C's real form: the main product nav collapsed to a FULL-HEIGHT icon rail in the
 * sidebar's own slot. The dashboard layout hides the AppShell sidebar and offsets
 * the whole shell right by RAIL_WIDTH, so this rail sits flush top-left BESIDE the
 * header (not underneath it). Opening team chat collapses the nav to reclaim its
 * width instead of squeezing the product.
 *
 * Fidelity: renders the SAME `standardMainSidebarSections` the live CanarySidebar
 * uses (threaded from the layout so the unread badge + selection stay 1:1), with the
 * real MAIN treatment — ground #375492, white icons ~50% at rest, selected = white
 * pill with icon/label in the ground color, sections w/ dividers, Settings pinned
 * bottom, Canary mark up top. Hover the rail to peek labels (mini → expanded).
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { standardMainSidebarSections, CanaryLogo } from '@canary-ui/components';
import type { SidebarSection } from '@canary-ui/components';

export const RAIL_WIDTH = 64; // keep in sync with the shell offset (pl-[64px]) in app/(dashboard)/layout.tsx
const EXPANDED_WIDTH = 208;
const SIDEBAR_BG = '#375492'; // CanarySidebar MAIN ground color (from @canary-ui/components)

interface CollapsedNavRailProps {
  /** Threaded from the dashboard layout so the rail is 1:1 with the live sidebar
   *  (same products, order, badges). Falls back to the library default. */
  sections?: SidebarSection[];
  selectedItemId?: string;
  onItemClick?: (itemId: string) => void;
}

export function CollapsedNavRail({
  sections = standardMainSidebarSections,
  selectedItemId,
  onItemClick,
}: CollapsedNavRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  // Use the threaded selection/handler when present; otherwise derive from the
  // route so the rail still works standalone. Product routes are `/${item.id}`.
  const activeId =
    selectedItemId ??
    sections.flatMap((s) => s.items).find((i) => pathname === `/${i.id}`)?.id;
  const navigate = (id: string) => (onItemClick ? onItemClick(id) : router.push(`/${id}`));

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden pb-4"
      style={{
        width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH,
        backgroundColor: SIDEBAR_BG,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: expanded ? '6px 0 28px rgba(0,0,0,0.22)' : 'none',
      }}
    >
      {/* brand mark — mirrors the real sidebar's logo slot (top-left); clipped when collapsed */}
      <div className="flex h-14 shrink-0 items-center overflow-hidden pl-4">
        <div className="shrink-0" style={{ width: 132, height: 24, opacity: 0.35 }}>
          <CanaryLogo />
        </div>
      </div>

      {sections.map((section, sectionIndex) => {
        const isLast = sectionIndex === sections.length - 1;
        return (
          <div key={section.id} className={`flex flex-col ${isLast ? 'mt-auto' : ''}`}>
            {sectionIndex > 0 && !isLast && (
              <div
                className="mx-3 mb-3 mt-1 h-px shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              />
            )}
            {section.items.map((item) => {
              const selected = item.id === activeId;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  title={item.label}
                  className="group relative flex h-11 w-full shrink-0 items-center focus:outline-none"
                  style={{ color: selected ? SIDEBAR_BG : '#FFFFFF', cursor: 'pointer' }}
                >
                  {/* selected / hover pill */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-1 left-2 right-2 rounded-lg transition-colors ${
                      selected ? '' : 'group-hover:bg-white/10'
                    }`}
                    style={selected ? { backgroundColor: '#FFFFFF' } : undefined}
                  />
                  {/* icon — reused real sidebar icon node, inherits currentColor */}
                  <span
                    className={`relative z-10 flex shrink-0 items-center justify-center transition-opacity ${
                      selected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                    }`}
                    style={{ width: RAIL_WIDTH }}
                  >
                    {item.icon}
                    {item.badge ? (
                      <span
                        className="absolute top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none text-white"
                        style={{ right: 14, backgroundColor: '#F16682' }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  {/* label — revealed on hover-expand */}
                  <span
                    className="relative z-10 whitespace-nowrap text-[14px] font-medium"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      opacity: expanded ? (selected ? 1 : 0.9) : 0,
                      transition: 'opacity 160ms ease',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
