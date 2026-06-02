# Prompt — Fix the "New message" compose paradigm in canary-prototype-core

> Paste this to a fresh Claude working in the `canary-prototype-core` repo.

You're in **canary-prototype-core** (Next.js 16, React 19, TypeScript, Tailwind 4, Zustand; UI from `@canary-ui/components`). Fix a long-standing messaging bug.

## The bug
In the **Messaging** product, clicking **"New message"** opens the phone-number input **in the thread LIST** (left column). That's wrong. In the real Canary product — and in the `canary-messaging-vaporware` reference — the new-message compose input appears in the **thread PANE** (right side) as a **"To:" header** that replaces the conversation header while composing.

## Root cause (not a recent regression)
It was inherited from the initial port from `canary-messaging` (commit `5ae7e59e`), never intentional. The wrong input lives in `components/products/messaging/ThreadList.tsx`, in the `{isComposingNew && ( … "Enter phone number…" … )}` block.

## Correct reference — READ FIRST
`~/Documents/Claude-Projects/canary-messaging-vaporware/components/messaging/ThreadView.tsx`, ~lines 118–138:
```
{isComposingNew ? (
  // Compose Mode: "To:" input header
  <div className="border-b … px-6 py-4"><span>To:</span><input placeholder="Enter phone number" autoFocus … /></div>
) : (
  // Normal Mode: full thread header (Avatar, guest name, tags…)
)}
```
That "To:" header **in the thread pane** is the target pattern.

## The fix
1. **`components/products/messaging/ThreadView.tsx`** — when `isComposingNew`, render a "To:" phone-number header (autofocus; Enter submits via `onCreateThread`; Esc cancels) in place of the normal thread header. Guard the rest of ThreadView for the compose/no-thread case — `MessageFeed`, `MessageComposer`, and `GuestInfoSidebar` assume a real `thread`, so don't render them while composing (show an empty body instead).
2. **`app/(dashboard)/messages/page.tsx`** — the right pane currently does `{selectedThread ? <ThreadView/> : <empty state>}`. During compose, `selectedThreadId` is null, so it shows the empty state. Change it so that when `isComposingNew` it renders `<ThreadView>` in compose mode instead. Pass the composing props through: `isComposingNew`, `composingPhoneNumber`, `onComposingPhoneChange={updateComposingPhone}`, `onCreateThread={createThreadFromPhone}`, `onCancelComposing={cancelComposing}` (all already exist in the page from `useMessagingStore`).
3. **`components/products/messaging/ThreadList.tsx`** — remove the `{isComposingNew && (…phone input…)}` block and its now-unused props/handlers (`handlePhoneKeyDown`, etc.).
4. **Store** (`lib/products/messaging/store.ts`) is already correct — `startNewConversation` sets `isComposingNew: true`, clears `composingPhoneNumber`, and nulls `selectedThreadId`; plus `updateComposingPhone`, `createThreadFromPhone`, `cancelComposing`. **Reuse these; do not change the store.**

## Constraints
- **Desktop only — do NOT touch mobile code.**
- Work on a **fresh branch off `main`** (do NOT use the team-chat spike branch `prototype/team-chat-container`).
- Use `@canary-ui/components` design tokens, Roboto, **MDI outline** icons. Keep it compact and consistent with the existing thread header.
- `pnpm dev` and verify: clicking "New message" shows the **To:** input in the thread pane; typing a number + Enter creates the thread; cancel/Esc exits compose; existing conversations still open normally.

## Reference implementation (optional)
A contained version already exists on the spike branch `prototype/team-chat-container` as `components/products/messaging/ComposeHeader.tsx` (rendered in the page's right pane when composing). You can crib from it, but the **proper** fix is to fold the "To:" compose mode into `ThreadView` itself, per the vaporware.
