'use client';

/**
 * Team Chat (SPIKE) — CollapsedNavRail  [variant C]
 *
 * C's real form: the main product nav collapsed to a narrow icon rail, shown (with
 * the AppShell sidebar hidden) when variant C + panel open — so opening team chat
 * reclaims the nav's width instead of squeezing the product.
 *
 * Fidelity: this does NOT re-list products. It renders the SAME
 * `standardMainSidebarSections` the live CanarySidebar uses — threaded from the
 * dashboard layout so the unread badge + selected item stay 1:1 — so links, icons,
 * order, and section grouping match the real sidebar exactly. Visual treatment
 * mirrors CanarySidebar MAIN: #375492 ground, white icons at rest, selected = white
 * pill with the icon/label in the ground color. Hover the rail to peek labels
 * (mini → expanded) so collapsing the nav doesn't cost legibility.
 *
 * (Earlier this rail hardcoded 5 products with guessed icons. The component library
 * has no real collapse mode, so we render a faithful stand-in rather than a wrong one.)
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { standardMainSidebarSections } from '@canary-ui/components';
import type { SidebarSection } from '@canary-ui/components';

export const RAIL_WIDTH = 64;
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
      className="absolute inset-y-0 left-0 z-40 flex flex-col overflow-hidden py-4"
      style={{
        width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH,
        backgroundColor: SIDEBAR_BG,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: expanded ? '6px 0 28px rgba(0,0,0,0.22)' : 'none',
      }}
    >
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
