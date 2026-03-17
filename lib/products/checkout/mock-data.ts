/**
 * Checkout Mock Data
 *
 * ~16 checkout submissions across 4 folders.
 * All guest/reservation IDs reference canonical data layer.
 * NO overlap with check-in mock-data guests.
 *
 * Folder distribution:
 *   pending (9)    → Main working list; today's departures
 *   submitted (0)  → Empty (matches screenshot "Submitted (0)")
 *   processed (5)  → Completed checkouts with ratings/signed folios
 *   archived (2)   → Old checkouts, no longer active
 */

import { CheckOutSubmission, FolioLineItem, DEMO_TODAY, CHECKOUT_TIME } from './types';
import { UpsellItem } from '../check-in/types';
import { GuestNote } from '../check-in/types';

// ─── Checkout Submissions ────────────────────────────────────────────────────

export const checkOutSubmissions: CheckOutSubmission[] = [

  // ── Pending (9) — today's departures ──────────────────────────────────────

  {
    id: 'co-raj',
    reservationId: 'res-raj-mar',
    guestId: 'guest-raj',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'pending',
    efolioAccepted: false,
  },
  {
    id: 'co-nook',
    reservationId: 'res-nook-mar',
    guestId: 'guest-nook',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'pending',
    efolioAccepted: false,
  },
  {
    id: 'co-anya',
    reservationId: 'res-anya-mar',
    guestId: 'guest-anya',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T08:30:00'),
    efolioAccepted: false,
  },
  {
    id: 'co-sophie-t',
    reservationId: 'res-sophie-t-mar',
    guestId: 'guest-sophie-t',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'pending',
    efolioAccepted: false,
  },
  {
    id: 'co-ines',
    reservationId: 'res-ines-mar',
    guestId: 'guest-ines',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'emailed',
    efolioAccepted: true,
  },
  {
    id: 'co-leila',
    reservationId: 'res-leila-mar',
    guestId: 'guest-leila',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: '11:00 AM',
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T09:15:00'),
    efolioAccepted: false,
  },
  {
    id: 'co-lucas',
    reservationId: 'res-lucas-mar',
    guestId: 'guest-lucas',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'pending',
    efolioAccepted: false,
  },
  {
    id: 'co-kofi',
    reservationId: 'res-kofi-mar',
    guestId: 'guest-kofi',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: '12:00 PM',
    folioStatus: 'emailed',
    efolioAccepted: true,
  },
  {
    id: 'co-dmitri',
    reservationId: 'res-dmitri-mar',
    guestId: 'guest-dmitri',
    folder: 'pending',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'pending',
    efolioAccepted: false,
  },

  // ── Submitted ───────────────────────────────────────────────────────────────
  // Empty — matches screenshot "Submitted (0)"

  // ── Processed (5) — completed checkouts ────────────────────────────────────

  {
    id: 'co-diana',
    reservationId: 'res-diana-mar',
    guestId: 'guest-diana',
    folder: 'processed',
    departureDate: DEMO_TODAY,
    departureTime: '8:45 AM',
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T08:40:00'),
    guestRating: 4,
    guestReview: 'Very comfortable stay. The room was spotless and staff were friendly. Only minor issue was slow elevator service during peak hours.',
    efolioAccepted: false,
    autoCheckoutStatus: 'completed',
    submittedAt: new Date('2026-03-16T08:30:00'),
    processedAt: new Date('2026-03-16T08:50:00'),
  },
  {
    id: 'co-chen',
    reservationId: 'res-chen-mar',
    guestId: 'guest-chen',
    folder: 'processed',
    departureDate: DEMO_TODAY,
    departureTime: '9:30 AM',
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T09:25:00'),
    guestRating: 3,
    efolioAccepted: false,
    submittedAt: new Date('2026-03-16T09:15:00'),
    processedAt: new Date('2026-03-16T09:35:00'),
  },
  {
    id: 'co-rafael',
    reservationId: 'res-rafael-mar',
    guestId: 'guest-rafael',
    folder: 'processed',
    departureDate: DEMO_TODAY,
    departureTime: CHECKOUT_TIME,
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T09:55:00'),
    guestRating: 5,
    guestReview: 'Exceptional experience from check-in to checkout. The concierge went above and beyond helping us with dinner reservations. Will recommend to everyone.',
    efolioAccepted: false,
    autoCheckoutStatus: 'completed',
    submittedAt: new Date('2026-03-16T09:45:00'),
    processedAt: new Date('2026-03-16T10:05:00'),
  },
  {
    id: 'co-javier',
    reservationId: 'res-javier-mar',
    guestId: 'guest-javier',
    folder: 'processed',
    departureDate: DEMO_TODAY,
    departureTime: '7:15 AM',
    folioStatus: 'emailed',
    guestRating: 2,
    efolioAccepted: true,
    autoCheckoutStatus: 'failed',
    submittedAt: new Date('2026-03-16T07:00:00'),
    processedAt: new Date('2026-03-16T07:20:00'),
  },
  {
    id: 'co-kenji',
    reservationId: 'res-kenji-mar',
    guestId: 'guest-kenji',
    folder: 'processed',
    departureDate: DEMO_TODAY,
    departureTime: '11:00 AM',
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-16T10:50:00'),
    guestRating: 4,
    guestReview: 'Great location and well-appointed rooms. The breakfast buffet was excellent. Would stay again on my next business trip.',
    efolioAccepted: false,
    autoCheckoutStatus: 'completed',
    submittedAt: new Date('2026-03-16T10:40:00'),
    processedAt: new Date('2026-03-16T11:00:00'),
  },

  // ── Archived (2) ───────────────────────────────────────────────────────────

  {
    id: 'co-kwame',
    reservationId: 'res-kwame-mar',
    guestId: 'guest-kwame',
    folder: 'archived',
    departureDate: '2026-03-11',
    departureTime: CHECKOUT_TIME,
    folioStatus: 'signed_on_tablet',
    folioSignedAt: new Date('2026-03-11T09:50:00'),
    guestRating: 5,
    guestReview: 'Flawless stay from start to finish. The team remembered my preferences from last visit. Truly a home away from home.',
    efolioAccepted: false,
    submittedAt: new Date('2026-03-11T09:30:00'),
    processedAt: new Date('2026-03-11T09:55:00'),
  },
  {
    id: 'co-carmen',
    reservationId: 'res-carmen-mar',
    guestId: 'guest-carmen',
    folder: 'archived',
    departureDate: '2026-03-11',
    departureTime: '11:00 AM',
    folioStatus: 'emailed',
    guestRating: 3,
    efolioAccepted: true,
    submittedAt: new Date('2026-03-11T10:30:00'),
    processedAt: new Date('2026-03-11T10:50:00'),
  },
];

// ─── Folio Line Items ─────────────────────────────────────────────────────────
// Realistic hotel charges per submission. Negative = credits/payments.
// 5 submissions have detailed folios.

export const checkoutFolioItems: Record<string, FolioLineItem[]> = {

  // Raj Kapoor — King (Room 507), 5 nights Mar 9–14, pending checkout
  // Room: $380/night x 5 = $1900. Tax 14.5% = $275.50. In-Room Dining $52. Total = $2227.50
  // Deposit -$500, balance due = $1727.50
  'co-raj': [
    { id: 'f-rj-1', date: 'Mar 9, 2026',  description: 'Room Charge — King (507)',  amount: 380.00 },
    { id: 'f-rj-2', date: 'Mar 10, 2026', description: 'Room Charge — King (507)', amount: 380.00 },
    { id: 'f-rj-3', date: 'Mar 11, 2026', description: 'Room Charge — King (507)', amount: 380.00 },
    { id: 'f-rj-4', date: 'Mar 12, 2026', description: 'Room Charge — King (507)', amount: 380.00 },
    { id: 'f-rj-5', date: 'Mar 13, 2026', description: 'Room Charge — King (507)', amount: 380.00 },
    { id: 'f-rj-6', date: 'Mar 9, 2026',  description: 'Room Sales Tax (14.5%)',   amount: 275.50 },
    { id: 'f-rj-7', date: 'Mar 12, 2026', description: 'In-Room Dining',           amount: 52.00 },
    { id: 'f-rj-8', date: 'Mar 9, 2026',  description: 'Advance Deposit',          amount: -500.00 },
  ],

  // Leila Khoury — King (Room 411), 5 nights Mar 8–13, pending checkout
  // Room: $420/night x 5 = $2100. Tax 14.5% = $304.50. Spa $175. Minibar $38.
  // Total = $2617.50. Deposit -$600, Card payment -$2017.50 = $0 balance
  'co-leila': [
    { id: 'f-le-1', date: 'Mar 8, 2026',  description: 'Room Charge — King (411)',   amount: 420.00 },
    { id: 'f-le-2', date: 'Mar 9, 2026',  description: 'Room Charge — King (411)',   amount: 420.00 },
    { id: 'f-le-3', date: 'Mar 10, 2026', description: 'Room Charge — King (411)',  amount: 420.00 },
    { id: 'f-le-4', date: 'Mar 11, 2026', description: 'Room Charge — King (411)',  amount: 420.00 },
    { id: 'f-le-5', date: 'Mar 12, 2026', description: 'Room Charge — King (411)',  amount: 420.00 },
    { id: 'f-le-6', date: 'Mar 8, 2026',  description: 'Room Sales Tax (14.5%)',    amount: 304.50 },
    { id: 'f-le-7', date: 'Mar 10, 2026', description: 'Spa Treatment',             amount: 175.00 },
    { id: 'f-le-8', date: 'Mar 11, 2026', description: 'Minibar',                   amount: 38.00 },
    { id: 'f-le-9', date: 'Mar 8, 2026',  description: 'Advance Deposit',           amount: -600.00 },
    { id: 'f-le-10', date: 'Mar 16, 2026', description: 'Visa Card ····(on file)',  amount: -2017.50 },
  ],

  // Anya Kowalski — STD (Room 217), 3 nights Mar 9–12, pending checkout
  // Room: $199/night x 3 = $597. Tax 14.5% = $86.57. Parking $35.
  // Total = $718.57. Deposit -$200, balance due = $518.57
  'co-anya': [
    { id: 'f-an-1', date: 'Mar 9, 2026',  description: 'Room Charge — STD (217)',   amount: 199.00 },
    { id: 'f-an-2', date: 'Mar 10, 2026', description: 'Room Charge — STD (217)',  amount: 199.00 },
    { id: 'f-an-3', date: 'Mar 11, 2026', description: 'Room Charge — STD (217)',  amount: 199.00 },
    { id: 'f-an-4', date: 'Mar 9, 2026',  description: 'Room Sales Tax (14.5%)',   amount: 86.57 },
    { id: 'f-an-5', date: 'Mar 11, 2026', description: 'Parking (3 nights)',       amount: 35.00 },
    { id: 'f-an-6', date: 'Mar 9, 2026',  description: 'Advance Deposit',          amount: -200.00 },
  ],

  // Diana Reyes — STD (Room 303), processed, 3 nights Mar 8–11
  // Room: $179/night x 3 = $537. Tax 14.5% = $77.87. Minibar $28.
  // Total = $642.87. Card payment -$642.87 = $0 balance (fully paid)
  'co-diana': [
    { id: 'f-di-1', date: 'Mar 8, 2026',  description: 'Room Charge — STD (303)',   amount: 179.00 },
    { id: 'f-di-2', date: 'Mar 9, 2026',  description: 'Room Charge — STD (303)',   amount: 179.00 },
    { id: 'f-di-3', date: 'Mar 10, 2026', description: 'Room Charge — STD (303)',   amount: 179.00 },
    { id: 'f-di-4', date: 'Mar 8, 2026',  description: 'Room Sales Tax (14.5%)',    amount: 77.87 },
    { id: 'f-di-5', date: 'Mar 9, 2026',  description: 'Minibar',                  amount: 28.00 },
    { id: 'f-di-6', date: 'Mar 16, 2026', description: 'Visa Card ····(on file)',   amount: -642.87 },
  ],

  // Rafael Costa — King (Room 412), processed, 4 nights Mar 7–11
  // Room: $450/night x 4 = $1800. Tax 14.5% = $261.00. In-Room Dining $72. Spa $195.
  // Total = $2328.00. Deposit -$750, Card payment -$1578.00 = $0 balance (fully paid)
  'co-rafael': [
    { id: 'f-ra-1', date: 'Mar 7, 2026',  description: 'Room Charge — King (412)',  amount: 450.00 },
    { id: 'f-ra-2', date: 'Mar 8, 2026',  description: 'Room Charge — King (412)',  amount: 450.00 },
    { id: 'f-ra-3', date: 'Mar 9, 2026',  description: 'Room Charge — King (412)',  amount: 450.00 },
    { id: 'f-ra-4', date: 'Mar 10, 2026', description: 'Room Charge — King (412)', amount: 450.00 },
    { id: 'f-ra-5', date: 'Mar 7, 2026',  description: 'Room Sales Tax (14.5%)',   amount: 261.00 },
    { id: 'f-ra-6', date: 'Mar 8, 2026',  description: 'In-Room Dining',           amount: 72.00 },
    { id: 'f-ra-7', date: 'Mar 9, 2026',  description: 'Spa Treatment',            amount: 195.00 },
    { id: 'f-ra-8', date: 'Mar 7, 2026',  description: 'Advance Deposit',          amount: -750.00 },
    { id: 'f-ra-9', date: 'Mar 16, 2026', description: 'Mastercard ····(on file)', amount: -1578.00 },
  ],
};

// ─── Guest Notes ──────────────────────────────────────────────────────────────
// Staff notes attached to checkout submissions.

export const checkoutNotes: Record<string, GuestNote[]> = {

  'co-raj': [
    {
      id: 'cn-rj-1',
      text: 'Guest requested itemized folio emailed to raj.kapoor@example.com before departure.',
      type: 'staff',
      author: 'Front Desk',
      createdAt: new Date('2026-03-16T08:15:00'),
    },
  ],

  'co-leila': [
    {
      id: 'cn-le-1',
      text: 'Gold Elite guest — approved late checkout until 11 AM. Luggage stored at bell desk.',
      type: 'staff',
      author: 'Night Manager',
      createdAt: new Date('2026-03-15T22:30:00'),
    },
    {
      id: 'cn-le-2',
      text: 'Guest complimented housekeeping during stay — pass along to team.',
      type: 'staff',
      author: 'Guest Relations',
      createdAt: new Date('2026-03-16T09:00:00'),
    },
  ],

  'co-diana': [
    {
      id: 'cn-di-1',
      text: 'Guest mentioned she will be back next month for a conference. Offered 10% returning guest discount.',
      type: 'staff',
      author: 'Front Desk',
      createdAt: new Date('2026-03-16T08:40:00'),
    },
  ],

  'co-rafael': [
    {
      id: 'cn-ra-1',
      text: 'Return guest — 8th stay. Comp spa treatment as loyalty gesture per GM approval.',
      type: 'staff',
      author: 'Guest Relations',
      createdAt: new Date('2026-03-15T18:00:00'),
    },
    {
      id: 'cn-ra-2',
      text: 'Parking validation provided for all 4 nights.',
      type: 'staff',
      author: 'Valet',
      createdAt: new Date('2026-03-16T09:50:00'),
    },
  ],
};

// ===== Upsell Requests per Checkout =====

export const checkoutUpsells: Record<string, UpsellItem[]> = {
  'co-raj': [
    { id: 'cup-1', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'pending' },
    { id: 'cup-2', name: 'Airport shuttle', quantity: 2, unitPrice: 45, status: 'pending' },
  ],
  'co-leila': [
    { id: 'cup-3', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'approved' },
    { id: 'cup-4', name: 'Spa access', quantity: 1, unitPrice: 120, status: 'approved' },
  ],
  'co-anya': [
    { id: 'cup-5', name: 'Late checkout (1PM)', quantity: 1, unitPrice: 30, status: 'pending' },
  ],
  'co-diana': [
    { id: 'cup-6', name: 'Late checkout (2PM)', quantity: 1, unitPrice: 50, status: 'approved' },
    { id: 'cup-7', name: 'Champagne & Strawberries', quantity: 1, unitPrice: 65, status: 'denied' },
  ],
  'co-rafael': [
    { id: 'cup-8', name: 'Spa Treatment', quantity: 2, unitPrice: 150, status: 'approved' },
    { id: 'cup-9', name: 'Late checkout (3PM)', quantity: 1, unitPrice: 75, status: 'approved' },
    { id: 'cup-10', name: 'Minibar restock', quantity: 1, unitPrice: 35, status: 'approved' },
  ],
};
