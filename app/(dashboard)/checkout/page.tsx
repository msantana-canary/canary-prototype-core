'use client';

/**
 * Checkout Product Page
 *
 * Staff dashboard for managing guest checkouts.
 * Single scrollable list with collapsible sections: Submitted -> Pending -> Processed.
 * Clicking a row opens the detail panel overlay.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { SubNav } from '@/components/products/checkout/SubNav';
import { DateSelector } from '@/components/products/check-in/DateSelector';
import { CheckOutListItem } from '@/components/products/checkout/CheckOutListItem';
import { CollapsibleSection } from '@/components/products/check-in/CollapsibleSection';
import { CheckOutDetailPanel } from '@/components/products/checkout/CheckOutDetailPanel';
import { checkOutSubmissions as initialSubmissions } from '@/lib/products/checkout/mock-data';
import { CheckOutSubmission, DEMO_TODAY } from '@/lib/products/checkout/types';
import { guests as canonicalGuests } from '@/lib/core/data/guests';
import { reservations as canonicalReservations } from '@/lib/core/data/reservations';
import { colors } from '@canary-ui/components';

export default function CheckoutPage() {
  const [submissions, setSubmissions] = useState<CheckOutSubmission[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(parseISO(DEMO_TODAY));
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const guests = canonicalGuests;
  const reservations = canonicalReservations;

  // Close detail panel when sidebar nav clicks back to checkout
  useEffect(() => {
    const handleReset = () => setSelectedSubmissionId(null);
    window.addEventListener('sidebar-nav-reset', handleReset);
    return () => window.removeEventListener('sidebar-nav-reset', handleReset);
  }, []);

  const selectedSubmission = useMemo(
    () => selectedSubmissionId ? submissions.find(s => s.id === selectedSubmissionId) ?? null : null,
    [selectedSubmissionId, submissions]
  );

  // Filter submissions by search query
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
  }, [searchQuery, submissions, guests]);

  // Section data — exclude archived
  const submitted = useMemo(
    () => filtered.filter(s => s.folder === 'submitted'),
    [filtered]
  );
  const pending = useMemo(
    () => filtered.filter(s => s.folder === 'pending'),
    [filtered]
  );
  const processed = useMemo(
    () => filtered.filter(s => s.folder === 'processed'),
    [filtered]
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleMessage = (id: string) => console.log('Message:', id);

  const handleMarkProcessed = useCallback((id: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === id
        ? { ...s, folder: 'processed' as const, processedAt: new Date(), folioStatus: 'signed_on_tablet' as const, folioSignedAt: new Date() }
        : s
    ));
    setSelectedSubmissionId(null);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <SubNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onInsightsClick={() => console.log('Insights clicked')}
        onExportClick={() => console.log('Export clicked')}
        onNewCheckout={() => console.log('New checkout clicked')}
      />

      {/* Single scrollable list */}
      <div className="flex-1 overflow-auto bg-white">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Submitted section */}
        <div className="px-6 pb-4">
          <CollapsibleSection
            title="Submitted"
            count={submitted.length}
            defaultCollapsed={submitted.length === 0}
          >
            {submitted.length > 0 ? (
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {submitted.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckOutListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onMessage={() => handleMessage(submission.id)}
                    />
                  );
                })}
              </ul>
            ) : (
              <ul className="rounded-lg overflow-hidden">
                <li className="flex items-center justify-center py-8">
                  <span className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                    No submitted checkouts
                  </span>
                </li>
              </ul>
            )}
          </CollapsibleSection>
        </div>

        {/* Pending section */}
        <div className="px-6 pb-4">
          <CollapsibleSection
            title="Pending"
            count={pending.length}
            defaultCollapsed={false}
          >
            {pending.length > 0 ? (
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {pending.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckOutListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onMessage={() => handleMessage(submission.id)}
                    />
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px] pl-5" style={{ color: colors.colorBlack4 }}>
                No pending checkouts
              </p>
            )}
          </CollapsibleSection>
        </div>

        {/* Processed section */}
        <div className="px-6 pb-4">
          <CollapsibleSection
            title="Processed"
            count={processed.length}
            defaultCollapsed={false}
          >
            {processed.length > 0 ? (
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {processed.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckOutListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      onMessage={() => handleMessage(submission.id)}
                    />
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px] pl-5" style={{ color: colors.colorBlack4 }}>
                No processed checkouts
              </p>
            )}
          </CollapsibleSection>
        </div>
      </div>

      {/* Detail Panel — full-page overlay within this container */}
      <CheckOutDetailPanel
        submission={selectedSubmission}
        guest={selectedSubmission ? guests[selectedSubmission.guestId] ?? null : null}
        reservation={selectedSubmission ? reservations[selectedSubmission.reservationId] : undefined}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmissionId(null)}
        onMarkProcessed={handleMarkProcessed}
      />
    </div>
  );
}
