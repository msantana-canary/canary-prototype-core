/**
 * Team Chat (SPIKE) — mock content
 *
 * Realistic-but-static coordination content so the container mechanic feels
 * real. Object cards reference CANONICAL guests/reservations by id (see
 * lib/core/data) per the repo's "never hardcode guest data" rule.
 */

import type { ChatGroup, ChatMessage, GroupId, StaffMember, ConversationId, Conversation } from './types';

export const CURRENT_USER = {
  name: 'Theresa Webb',
  initials: 'TW',
  avatar: 'https://i.pravatar.cc/150?img=5',
};

export const groups: ChatGroup[] = [
  { id: 'front-desk', name: 'Front Desk', accent: '#2858C4', unread: 2 },
  { id: 'housekeeping', name: 'Housekeeping', accent: '#1F9D78', unread: 5 },
  { id: 'maintenance', name: 'Maintenance', accent: '#C2700E', unread: 1 },
  { id: 'valet', name: 'Valet', accent: '#7A5AF8', unread: 0 },
  { id: 'announcements', name: 'Announcements', accent: '#D92D20', unread: 1, isBroadcast: true },
];

export const messagesByGroup: Record<GroupId, ChatMessage[]> = {
  'front-desk': [
    {
      id: 'fd-1',
      groupId: 'front-desk',
      authorName: 'Priya Nair',
      authorInitials: 'PN',
      time: '9:18 AM',
      text: 'Lobby printer is jammed again — using the back-office one for reg cards until IT looks at it.',
    },
    {
      id: 'fd-2',
      groupId: 'front-desk',
      authorName: 'Theresa Webb',
      authorInitials: 'TW',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      time: '9:41 AM',
      self: true,
      text: 'Diamond guest arriving early (~11:30). Is the room ready? Flagging her details here:',
      card: { kind: 'guest', guestId: 'guest-emily', reservationId: 'res-emily-nov' },
    },
    {
      id: 'fd-3',
      groupId: 'front-desk',
      authorName: 'Marcus Lee',
      authorInitials: 'ML',
      time: '9:43 AM',
      text: 'Still being turned — about 30 min out. I’ll rush it and ping you the moment it’s clean.',
      seenBy: 4,
    },
    {
      id: 'fd-4',
      groupId: 'front-desk',
      authorName: 'Canary AI',
      authorInitials: 'AI',
      time: '9:45 AM',
      isAI: true,
      text: 'VIP arrival flagged — Diamond Elite, pre-checked in via Canary. Room not yet ready.',
      card: { kind: 'guest', guestId: 'guest-emily', reservationId: 'res-emily-nov' },
    },
  ],
  'housekeeping': [
    {
      id: 'hk-1',
      groupId: 'housekeeping',
      authorName: 'Marcus Lee',
      authorInitials: 'ML',
      time: '8:55 AM',
      text: 'Short-staffed on the PM turn — 6 rooms still on the board for the 3pm checkout flip. Prioritizing arrivals first.',
      seenBy: 6,
    },
    {
      id: 'hk-2',
      groupId: 'housekeeping',
      authorName: 'Theresa Webb',
      authorInitials: 'TW',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      self: true,
      time: '9:02 AM',
      text: 'Thanks — the early Diamond arrival is the priority one. Everything else can hold.',
    },
  ],
  'maintenance': [
    {
      id: 'mt-1',
      groupId: 'maintenance',
      authorName: 'Diego Ramos',
      authorInitials: 'DR',
      time: '9:30 AM',
      text: 'Guest reported this via the messaging AI — heading up now.',
      card: { kind: 'ticket', ticket: { title: 'Toilet clogged', status: 'in-progress', room: '214' } },
    },
    {
      id: 'mt-2',
      groupId: 'maintenance',
      authorName: 'Theresa Webb',
      authorInitials: 'TW',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      self: true,
      time: '9:34 AM',
      text: 'Guest is waiting in the lobby to drop bags — can you prioritize? I’ll keep them comfortable.',
    },
  ],
  'valet': [
    {
      id: 'vl-1',
      groupId: 'valet',
      authorName: 'Sam Cole',
      authorInitials: 'SC',
      time: '8:40 AM',
      text: 'Garage level 2 is full — sending overflow to the lot across 7th.',
    },
  ],
  'announcements': [
    {
      id: 'an-1',
      groupId: 'announcements',
      authorName: 'Canary AI',
      authorInitials: 'AI',
      time: '8:00 AM',
      isAI: true,
      text: 'Sysco delivery rescheduled to 2 PM. Loading dock A blocked until then — route guests through the main entrance.',
      seenBy: 12,
    },
    {
      id: 'an-2',
      groupId: 'announcements',
      authorName: 'GM Office',
      authorInitials: 'GM',
      time: 'Mon 4:10 PM',
      text: 'Reminder: harassment-prevention training is due Friday. Link is in your email — please confirm once done.',
      seenBy: 9,
    },
  ],
};

/* ── Variant F: staff DMs + conversation resolver ───────────────────────
 * The docked launcher lists Departments (the groups above) + individual Staff.
 * A "conversation" opened in a popup is addressed by ConversationId. */

export const staff: StaffMember[] = [
  { id: 'kristin', name: 'Kristin Watson', initials: 'KW', avatar: 'https://i.pravatar.cc/150?img=45', online: true },
  { id: 'ralph', name: 'Ralph Edwards', initials: 'RE', avatar: 'https://i.pravatar.cc/150?img=12', online: true },
  { id: 'bessie', name: 'Bessie Cooper', initials: 'BC', avatar: 'https://i.pravatar.cc/150?img=20' },
  { id: 'brooklyn', name: 'Brooklyn Simmons', initials: 'BS', avatar: 'https://i.pravatar.cc/150?img=32', online: true },
  { id: 'guy', name: 'Guy Hawkins', initials: 'GH', avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: 'bill', name: 'Bill Robertson', initials: 'BR', avatar: 'https://i.pravatar.cc/150?img=8' },
];

const messagesByStaff: Record<string, ChatMessage[]> = {
  kristin: [
    { id: 'kr-1', authorName: 'Kristin Watson', authorInitials: 'KW', authorAvatar: 'https://i.pravatar.cc/150?img=45', time: '8:32 PM',
      text: 'Hey, have you seen room 302 on the third floor? It still needs to be cleaned.' },
    { id: 'kr-2', authorName: CURRENT_USER.name, authorInitials: CURRENT_USER.initials, authorAvatar: CURRENT_USER.avatar, self: true, time: '8:34 PM',
      text: "No, I haven't been up there yet. What's the status of the room?" },
    { id: 'kr-3', authorName: 'Kristin Watson', authorInitials: 'KW', authorAvatar: 'https://i.pravatar.cc/150?img=45', time: '8:38 PM',
      text: 'The guest checked out this morning and it needs a thorough cleaning. Dirty towels on the floor, trash in the bin, and the bed needs to be made.' },
  ],
  ralph: [
    { id: 'ra-1', authorName: 'Ralph Edwards', authorInitials: 'RE', authorAvatar: 'https://i.pravatar.cc/150?img=12', time: '2:10 PM',
      text: 'Front drive is backed up — can someone grab the next arrival for me?' },
  ],
  bessie: [
    { id: 'be-1', authorName: 'Bessie Cooper', authorInitials: 'BC', time: '11:20 AM',
      text: 'Conference group needs 4 extra rollaways set up before tonight.' },
  ],
  brooklyn: [
    { id: 'br-1', authorName: 'Brooklyn Simmons', authorInitials: 'BS', authorAvatar: 'https://i.pravatar.cc/150?img=32', time: '10:05 AM',
      text: 'Lost & found: AirPods turned in from 1408 — logging them now.' },
  ],
  guy: [
    { id: 'gu-1', authorName: 'Guy Hawkins', authorInitials: 'GH', time: '9:15 AM',
      text: 'Pool chemicals delivered and balanced — all set for the day.' },
  ],
  bill: [
    { id: 'bi-1', authorName: 'Bill Robertson', authorInitials: 'BR', time: 'Yesterday',
      text: 'Covering the AM shift Thursday — swapped with Marcus.' },
  ],
};

export function getConversation(id: ConversationId): Conversation {
  if (id.startsWith('staff:')) {
    const sid = id.slice('staff:'.length);
    const s = staff.find((x) => x.id === sid);
    return { id, title: s?.name ?? 'Staff', avatar: s?.avatar, initials: s?.initials, messages: messagesByStaff[sid] ?? [] };
  }
  const g = groups.find((x) => x.id === id);
  return { id, title: g?.name ?? 'Group', accent: g?.accent, isBroadcast: g?.isBroadcast, messages: messagesByGroup[id as GroupId] ?? [] };
}
