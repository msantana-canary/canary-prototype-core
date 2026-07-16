/**
 * Email Channel — New Shell Tokens
 *
 * Raw color/geometry constants for the NEW app-shell paradigm (Wenjun's nav +
 * header redesign, SJ-approved 2026-07-13). These are values that do NOT yet
 * map to a token in `@canary-ui/components` — anything that DOES have a token
 * (colorBlueDark1, colorBlack6, colorPink1, etc.) should be imported from
 * `colors` at the call site rather than duplicated here.
 *
 * New-paradigm colors not yet in the library:
 */
export const shellTokens = {
  /** Sidebar background — new deep navy nav rail */
  sidebarBg: '#375492',
  /** Team Chat pill background (full opacity) */
  teamChatPill: '#022440',
  /** User row background inside the sidebar */
  userRowBg: 'rgba(0, 0, 0, 0.16)',
  /** Inactive nav item hover (white at ~8%) */
  navHover: 'rgba(255, 255, 255, 0.08)',
  /** Sidebar hairline dividers (white ~20%) */
  sidebarDivider: 'rgba(255, 255, 255, 0.2)',

  /** Copilot pill border + accent (electric blue) */
  copilotBorder: '#465FF5',
  /** Copilot pill faint AI-tint overlay */
  copilotTint:
    'linear-gradient(6.19deg, rgba(25,55,237,0.03) 23.5%, rgba(140,40,255,0.03) 41.4%, rgba(196,54,244,0.03) 56.2%, rgba(221,49,49,0.03) 73.8%)',
  /** Copilot gradient-text stops (Tailwind arbitrary-value friendly) */
  copilotGradientFrom: '#465FF5',
  copilotGradientVia: '#8E4FD6',
  copilotGradientTo: '#DB3535',

  /** Archive action button background (blue at 10%) */
  archiveBtnBg: 'rgba(40, 88, 196, 0.1)',
} as const;

/** New dashboard radius convention (unit-6). */
export const UNIT_6 = 6;
