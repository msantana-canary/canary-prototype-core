/**
 * Team Chat (SPIKE) — shared state
 *
 * Container is a CONSISTENT GLOBAL LAYER over the whole suite — it never knows
 * what product is underneath. Two product-agnostic models under test:
 *   A — overlay layer : floats on top of any product; reflows nothing.
 *   B — shell gutter   : reserves a right gutter at the shell level; the product
 *                        reflows into the narrower viewport by its OWN rules.
 * (C resize and D footer were dropped — see git history.)
 *
 * Panel IA is group-list-first: open → list of groups → tap → thread → back.
 */

import { create } from 'zustand';
import type { GroupId } from './types';

export type ChatVariant = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export const PANEL_WIDTH = 384;

type PanelView = 'list' | 'thread';

interface SpikeStore {
  variant: ChatVariant;
  panelOpen: boolean;
  panelExpanded: boolean;
  view: PanelView;
  activeGroupId: GroupId | null;
  joinedGroups: GroupId[];
  cleanHeader: boolean;
  // Variant F (docked launcher): list expanded + open popup windows.
  floatyListOpen: boolean;
  floatyWindows: string[];
  // Variant G (full takeover): which conversation is open in the full workspace.
  fullActiveId: string | null;
  setVariant: (v: ChatVariant) => void;
  togglePanel: () => void;
  toggleExpanded: () => void;
  openPanel: () => void;
  closePanel: () => void;
  openThread: (id: GroupId) => void;
  backToList: () => void;
  joinGroup: (id: GroupId) => void;
  setCleanHeader: (v: boolean) => void;
  toggleFloatyList: () => void;
  openFloatyWindow: (id: string) => void;
  closeFloatyWindow: (id: string) => void;
  setFullActive: (id: string) => void;
}

export const useSpikeStore = create<SpikeStore>((set) => ({
  variant: 'A',
  panelOpen: false,
  panelExpanded: false,
  view: 'list',
  activeGroupId: null,
  joinedGroups: [],
  cleanHeader: false,
  floatyListOpen: false,
  floatyWindows: [],
  fullActiveId: 'front-desk',
  setVariant: (variant) => set({ variant }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen, view: s.panelOpen ? s.view : 'list', panelExpanded: s.panelOpen ? false : s.panelExpanded })),
  toggleExpanded: () => set((s) => ({ panelExpanded: !s.panelExpanded })),
  openPanel: () => set({ panelOpen: true, view: 'list' }),
  closePanel: () => set({ panelOpen: false, panelExpanded: false }),
  openThread: (activeGroupId) => set({ activeGroupId, view: 'thread' }),
  backToList: () => set({ view: 'list', activeGroupId: null }),
  joinGroup: (id) => set((s) => ({ joinedGroups: s.joinedGroups.includes(id) ? s.joinedGroups : [...s.joinedGroups, id] })),
  setCleanHeader: (cleanHeader) => set({ cleanHeader }),
  toggleFloatyList: () => set((s) => ({ floatyListOpen: !s.floatyListOpen })),
  openFloatyWindow: (id) =>
    set((s) => (s.floatyWindows.includes(id) ? {} : { floatyWindows: [...s.floatyWindows, id].slice(-5) })),
  closeFloatyWindow: (id) => set((s) => ({ floatyWindows: s.floatyWindows.filter((w) => w !== id) })),
  setFullActive: (fullActiveId) => set({ fullActiveId }),
}));

/** Descriptions shown in the dev variant-switcher. */
export const VARIANT_META: Record<ChatVariant, { label: string; mechanic: string; ref: string }> = {
  A: {
    label: 'Overlay layer',
    mechanic: 'Floats on top of any product — demands nothing, reflows nothing. Covers content while open.',
    ref: 'Salesforce Utility Bar / Messenger',
  },
  B: {
    label: 'Shell gutter',
    mechanic: 'Reserves a right gutter at the shell level; the product reflows into the narrower viewport by its own rules.',
    ref: 'Slack single-slot / shell push',
  },
  C: {
    label: 'Collapse nav to rail',
    mechanic: 'Hides the main sidebar and shows a collapsed icon rail (real products/icons from standardMainSidebarSections; hover to peek labels) so opening chat reclaims the nav width instead of squeezing the product.',
    ref: 'CanarySidebar MAIN, collapsed',
  },
  D: {
    label: 'D · overlay (compact)',
    mechanic: 'Compact messaging chrome (toolbar → sidebar header) + overlay panel. Compare vs A.',
    ref: 'vaporware compact inbox',
  },
  E: {
    label: 'D · gutter (compact)',
    mechanic: 'Compact messaging chrome (toolbar → sidebar header) + shell-gutter push. Compare vs B.',
    ref: 'vaporware compact inbox',
  },
  F: {
    label: 'Docked launcher (floaty)',
    mechanic:
      "SJ's Messenger-style dock: a Team chat launcher in the sidebar's bottom-left → Departments + Staff → stackable popup windows. Overlays the product (A baseline, no reflow).",
    ref: 'FB Messenger / SJ Wyndham concept',
  },
  G: {
    label: 'Overlay command center',
    mechanic:
      "Same launcher as F, but opens the FULL two-pane command center as a dismissible OVERLAY floating over your (dimmed) work — not a screen takeover. SJ's call: 'overlay not take over.'",
    ref: "SJ's 'overlay not take over'",
  },
  H: {
    label: 'Left gutter (right of nav)',
    mechanic:
      'Like B, but the panel slides in from the LEFT — right of the nav sidebar — and the product reflows to the right. Header-pill entry.',
    ref: 'Slack/Teams left thread rail',
  },
};
