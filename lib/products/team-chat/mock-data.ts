/**
 * Team Chat (SPIKE) — mock content
 *
 * Realistic-but-static coordination content so the container mechanic feels
 * real. Object cards reference CANONICAL guests/reservations by id (see
 * lib/core/data) per the repo's "never hardcode guest data" rule.
 */

import type { ChatGroup, ChatMessage, GroupId } from './types';

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
