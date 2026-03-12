'use client';

/**
 * Check-In Product Page
 *
 * Staff dashboard for managing guest check-ins.
 * Two-pane layout: submission list (left) + arrivals grid (right).
 * All data derives from a single checkInSubmissions array.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { parseISO, format } from 'date-fns';
import { SubNav } from '@/components/products/check-in/SubNav';
import { DateSelector } from '@/components/products/check-in/DateSelector';
import { CheckInListItem } from '@/components/products/check-in/CheckInListItem';
import { ArrivalCard } from '@/components/products/check-in/ArrivalCard';
import { CollapsibleSection } from '@/components/products/check-in/CollapsibleSection';
import { CheckInDetailPanel } from '@/components/products/check-in/CheckInDetailPanel';
import { checkInSubmissions as initialSubmissions } from '@/lib/products/check-in/mock-data';
import { CheckInSubmission, DEMO_TODAY } from '@/lib/products/check-in/types';
import { guests as canonicalGuests } from '@/lib/core/data/guests';
import { reservations as canonicalReservations } from '@/lib/core/data/reservations';
import { Guest } from '@/lib/core/types/guest';
import { Reservation } from '@/lib/core/types/reservation';
import {
  CanaryModal,
  CanaryInput,
  CanaryInputDateRange,
  CanaryButton,
  ButtonType,
  InputSize,
  colors,
} from '@canary-ui/components';

export default function CheckInPage() {
  const [submissions, setSubmissions] = useState<CheckInSubmission[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(parseISO(DEMO_TODAY));
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Runtime-created guests and reservations (extends canonical data)
  const [runtimeGuests, setRuntimeGuests] = useState<Record<string, Guest>>({});
  const [runtimeReservations, setRuntimeReservations] = useState<Record<string, Reservation>>({});
  const guests = useMemo(() => ({ ...canonicalGuests, ...runtimeGuests }), [runtimeGuests]);
  const reservations = useMemo(() => ({ ...canonicalReservations, ...runtimeReservations }), [runtimeReservations]);

  // New check-in modal state
  const [showNewCheckIn, setShowNewCheckIn] = useState(false);
  const [newConfirmation, setNewConfirmation] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Close detail panel when sidebar nav clicks back to check-in
  useEffect(() => {
    const handleReset = () => setSelectedSubmissionId(null);
    window.addEventListener('sidebar-nav-reset', handleReset);
    return () => window.removeEventListener('sidebar-nav-reset', handleReset);
  }, []);

  const selectedSubmission = useMemo(
    () => selectedSubmissionId ? submissions.find(s => s.id === selectedSubmissionId) ?? null : null,
    [selectedSubmissionId, submissions]
  );

  // Filter all submissions by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter((submission) => {
      const guest = guests[submission.guestId];
      if (!guest) return false;
      return (
        guest.name.toLowerCase().includes(query) ||
        guest.phone?.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, submissions]);

  // ── Left pane sections ───────────────────────────────────────────
  const submitted = useMemo(
    () => filtered.filter(s => s.status === 'submitted' && !s.isArchived),
    [filtered]
  );
  const partial = useMemo(
    () => filtered.filter(s => s.status === 'partially_submitted' && !s.isArchived),
    [filtered]
  );
  const pending = useMemo(
    () => filtered.filter(s => s.status === 'pending' && !s.isArchived),
    [filtered]
  );

  // ── Right pane sections (derived from verified/checked_in) ──────
  const expectedToday = useMemo(
    () => filtered.filter(s => s.status === 'verified' && s.arrivalDate === DEMO_TODAY),
    [filtered]
  );
  const future = useMemo(
    () => filtered.filter(s => s.status === 'verified' && s.arrivalDate > DEMO_TODAY),
    [filtered]
  );
  const checkedInToday = useMemo(
    () => filtered.filter(s => s.status === 'checked_in' && s.arrivalDate === DEMO_TODAY),
    [filtered]
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleVerify = (id: string) => console.log('Verify:', id);
  const handleSendToTablet = (id: string) => console.log('Send to tablet:', id);
  const handleMessage = (id: string) => console.log('Message:', id);
  const handleMobileKey = (id: string) => console.log('Send mobile key:', id);

  const handleCheckIn = useCallback((id: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: 'checked_in' as const, checkInTime: format(new Date(), 'h:mm a') }
        : s
    ));
  }, []);

  const handleCreateCheckIn = useCallback(() => {
    const ts = Date.now();
    const guestId = `guest-new-${ts}`;
    const resId = `res-new-${ts}`;
    const subId = `sub-new-${ts}`;
    const fullName = `${newFirstName} ${newLastName}`.trim();
    const initials = `${newFirstName.charAt(0)}${newLastName.charAt(0)}`.toUpperCase();

    const newGuest: Guest = {
      id: guestId,
      name: fullName || 'New Guest',
      initials: initials || 'NG',
      phone: newPhone || undefined,
      email: newEmail || undefined,
      preferredLanguage: 'English',
    };

    const newRes: Reservation = {
      id: resId,
      guestId,
      confirmationCode: newConfirmation || `NEW${ts.toString().slice(-6)}`,
      checkInDate: newStartDate || format(new Date(), 'MMM. dd, yyyy'),
      checkOutDate: newEndDate || '',
      status: 'upcoming',
      checkInStatus: 'Not Started',
      checkOutStatus: 'Not Started',
    };

    const newSub: CheckInSubmission = {
      id: subId,
      reservationId: resId,
      guestId,
      status: 'pending',
      arrivalDate: DEMO_TODAY,
    };

    setRuntimeGuests(prev => ({ ...prev, [guestId]: newGuest }));
    setRuntimeReservations(prev => ({ ...prev, [resId]: newRes }));
    setSubmissions(prev => [...prev, newSub]);

    // Reset form and close modal
    setShowNewCheckIn(false);
    setNewConfirmation('');
    setNewFirstName('');
    setNewLastName('');
    setNewStartDate('');
    setNewEndDate('');
    setNewEmail('');
    setNewPhone('');

    // Auto-open detail panel
    setSelectedSubmissionId(subId);
  }, [newFirstName, newLastName, newConfirmation, newStartDate, newEndDate, newEmail, newPhone]);

  const hasLeftContent = submitted.length > 0 || partial.length > 0 || pending.length > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <SubNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onInsightsClick={() => console.log('Insights clicked')}
        onExportClick={() => console.log('Export clicked')}
        onNewCheckIn={() => setShowNewCheckIn(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Pane — Submissions List ─────────────────────────── */}
        <div className="w-[480px] border-r border-gray-200 bg-white overflow-auto">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Completed submissions */}
          {submitted.length > 0 && (
            <div className="px-6 pb-6">
              <p
                className="text-[13px] font-medium mb-2"
                style={{ color: colors.colorBlack3 }}
              >
                Completed submissions ({submitted.length})
              </p>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {submitted.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckInListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onVerify={() => handleVerify(submission.id)}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          {/* Partial submissions */}
          {partial.length > 0 && (
            <div className="px-6 pb-6">
              <p
                className="text-[13px] font-medium mb-2"
                style={{ color: colors.colorBlack3 }}
              >
                Partial submissions ({partial.length})
              </p>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {partial.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckInListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pending */}
          <div className="px-6 pb-6">
            <p
              className="text-[13px] font-medium mb-2"
              style={{ color: colors.colorBlack3 }}
            >
              Pending ({pending.length})
            </p>
            {pending.length > 0 ? (
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {pending.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckInListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onSendToTablet={() => handleSendToTablet(submission.id)}
                    />
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                No pending submissions
              </p>
            )}
          </div>

          {/* Empty state for all left-pane sections */}
          {!hasLeftContent && (
            <div className="p-6 text-center text-gray-500">
              No submissions found
            </div>
          )}
        </div>

        {/* ── Right Pane — Arrivals Grid ───────────────────────────── */}
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: colors.colorBlack8 }}>
          <h2
            className="text-[18px] font-medium mb-6"
            style={{ color: colors.colorBlack1 }}
          >
            Ready for check-In
          </h2>

          {/* Expected today */}
          {expectedToday.length > 0 && (
            <div className="mb-8">
              <p
                className="text-[14px] font-medium mb-4"
                style={{ color: colors.colorBlack3 }}
              >
                Expected today ({expectedToday.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {expectedToday.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <ArrivalCard
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onMobileKey={() => handleMobileKey(submission.id)}
                      onCheckIn={() => handleCheckIn(submission.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Future — collapsible */}
          <div className="mb-8">
            <CollapsibleSection
              title="Future"
              count={future.length}
              defaultCollapsed={true}
            >
              {future.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {future.map((submission) => {
                    const guest = guests[submission.guestId];
                    const reservation = reservations[submission.reservationId];
                    if (!guest) return null;
                    return (
                      <ArrivalCard
                        key={submission.id}
                        submission={submission}
                        guest={guest}
                        reservation={reservation}
                        onClick={() => setSelectedSubmissionId(submission.id)}
                        onMobileKey={() => handleMobileKey(submission.id)}
                        onCheckIn={() => handleCheckIn(submission.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                  No future verified guests
                </p>
              )}
            </CollapsibleSection>
          </div>

          {/* Checked-in today */}
          <div className="mb-8">
            <p
              className="text-[14px] font-medium mb-4"
              style={{ color: colors.colorBlack3 }}
            >
              Checked-in today ({checkedInToday.length})
            </p>
            {checkedInToday.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {checkedInToday.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <ArrivalCard
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onMobileKey={() => handleMobileKey(submission.id)}
                      onCheckIn={() => handleCheckIn(submission.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                No check-ins today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel — full-page overlay within this container */}
      <CheckInDetailPanel
        submission={selectedSubmission}
        guest={selectedSubmission ? guests[selectedSubmission.guestId] ?? null : null}
        reservation={selectedSubmission ? reservations[selectedSubmission.reservationId] : undefined}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmissionId(null)}
        onCheckIn={handleCheckIn}
      />

      {/* New Check-in Modal */}
      <CanaryModal
        isOpen={showNewCheckIn}
        onClose={() => setShowNewCheckIn(false)}
        title="Create new check-in"
      >
        <div className="flex flex-col gap-4">
          <CanaryInput
            label="Confirmation Number"
            placeholder="Confirmation Number"
            value={newConfirmation}
            onChange={(e) => setNewConfirmation(e.target.value)}
            size={InputSize.NORMAL}
          />

          <div className="grid grid-cols-2 gap-4">
            <CanaryInput
              label="First name"
              placeholder="First name"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              size={InputSize.NORMAL}
            />
            <CanaryInput
              label="Last name"
              placeholder="Last name"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>

          <CanaryInputDateRange
            label="Arrival and departure"
            startDate={newStartDate}
            endDate={newEndDate}
            onChange={(start, end) => { setNewStartDate(start); setNewEndDate(end); }}
            size={InputSize.NORMAL}
          />

          <p className="text-[13px]" style={{ color: colors.colorBlack3 }}>
            Enter a phone number or email to send guest a check-in link via SMS or email.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <CanaryInput
              label="Email"
              placeholder="Email (optional)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              size={InputSize.NORMAL}
            />
            <CanaryInput
              label="Mobile phone"
              placeholder="Mobile phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              size={InputSize.NORMAL}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <CanaryButton
              type={ButtonType.OUTLINED}
              onClick={() => setShowNewCheckIn(false)}
            >
              Cancel
            </CanaryButton>
            <CanaryButton
              type={ButtonType.PRIMARY}
              onClick={handleCreateCheckIn}
            >
              Create
            </CanaryButton>
          </div>
        </div>
      </CanaryModal>
    </div>
  );
}
