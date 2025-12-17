/**
 * Canonical Room Data
 *
 * Hotel room inventory. Basic implementation for now.
 */

import { Room } from '../types/room';

export const rooms: Record<string, Room> = {
  'room-112': {
    id: 'room-112',
    number: '112',
    floor: 1,
    type: 'standard-king',
    status: 'reserved',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar'],
  },
  'room-130': {
    id: 'room-130',
    number: '130',
    floor: 1,
    type: 'double-queen',
    status: 'occupied',
    maxOccupancy: 4,
    amenities: ['wifi', 'minibar'],
  },
  'room-153': {
    id: 'room-153',
    number: '153',
    floor: 1,
    type: 'king-suite',
    status: 'occupied',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar', 'balcony'],
  },
  'room-204': {
    id: 'room-204',
    number: '204',
    floor: 2,
    type: 'king-suite',
    status: 'occupied',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar', 'balcony'],
  },
  'room-206': {
    id: 'room-206',
    number: '206',
    floor: 2,
    type: 'standard-king',
    status: 'occupied',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar'],
  },
  'room-225': {
    id: 'room-225',
    number: '225',
    floor: 2,
    type: 'double-queen',
    status: 'available',
    maxOccupancy: 4,
    amenities: ['wifi', 'minibar'],
  },
  'room-302': {
    id: 'room-302',
    number: '302',
    floor: 3,
    type: 'executive-suite',
    status: 'available',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar', 'balcony', 'jacuzzi'],
  },
  'room-415': {
    id: 'room-415',
    number: '415',
    floor: 4,
    type: 'standard-king',
    status: 'occupied',
    maxOccupancy: 2,
    amenities: ['wifi', 'minibar'],
  },
  'room-418': {
    id: 'room-418',
    number: '418',
    floor: 4,
    type: 'standard-queen',
    status: 'available',
    maxOccupancy: 2,
    amenities: ['wifi'],
  },
  'room-512': {
    id: 'room-512',
    number: '512',
    floor: 5,
    type: 'penthouse',
    status: 'available',
    maxOccupancy: 4,
    amenities: ['wifi', 'minibar', 'balcony', 'jacuzzi', 'kitchen'],
  },
};

/**
 * Get all rooms as an array
 */
export const roomList = Object.values(rooms);

/**
 * Get a room by ID
 */
export function getRoom(id: string): Room | undefined {
  return rooms[id];
}

/**
 * Get a room by room number
 */
export function getRoomByNumber(number: string): Room | undefined {
  return roomList.find(room => room.number === number);
}
