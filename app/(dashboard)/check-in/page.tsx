'use client';

/**
 * Check-In Product Page
 *
 * Staff dashboard for managing guest check-ins.
 * Two-pane layout: submission list (left) + arrivals grid (right).
 */

import React, { useState, useMemo } from 'react';
import { SubNav } from '@/components/products/check-in/SubNav';
import { DateSelector } from '@/components/products/check-in/DateSelector';
import { CheckInListItem } from '@/components/products/check-in/CheckInListItem';
import { ArrivalCard } from '@/components/products/check-in/ArrivalCard';
import { checkInSubmissions, getArrivalsByStatus } from '@/lib/products/check-in/mock-data';
import { guests } from '@/lib/core/data/guests';
import { reservations } from '@/lib/core/data/reservations';
import { colors } from '@canary-ui/components';

export default function CheckInPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter submissions by search query
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return checkInSubmissions;
    const query = searchQuery.toLowerCase();
    return checkInSubmissions.filter((submission) => {
      const guest = guests[submission.guestId];
      if (!guest) return false;
      return (
        guest.name.toLowerCase().includes(query) ||
        guest.phone?.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Group submissions by status
  const completedSubmissions = useMemo(
    () => filteredSubmissions.filter((s) => s.status === 'completed'),
    [filteredSubmissions]
  );
  const pendingSubmissions = useMemo(
    () => filteredSubmissions.filter((s) => s.status === 'pending'),
    [filteredSubmissions]
  );

  // Group arrivals by status
  const expectedArrivals = useMemo(() => getArrivalsByStatus('expected'), []);
  const futureArrivals = useMemo(() => getArrivalsByStatus('future'), []);
  const checkedInArrivals = useMemo(() => getArrivalsByStatus('checked-in'), []);

  // Handlers
  const handleVerify = (submissionId: string) => {
    console.log('Verify:', submissionId);
  };

  const handleSendToTablet = (submissionId: string) => {
    console.log('Send to tablet:', submissionId);
  };

  const handleMobileKey = (arrivalId: string) => {
    console.log('Send mobile key:', arrivalId);
  };

  const handleArrivalCheckIn = (arrivalId: string) => {
    console.log('Check in arrival:', arrivalId);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub Navigation */}
      <SubNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onInsightsClick={() => console.log('Insights clicked')}
        onExportClick={() => console.log('Export clicked')}
        onNewCheckIn={() => console.log('New check-in clicked')}
      />

      {/* Main Content - Two Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Submissions List */}
        <div className="w-[480px] border-r border-gray-200 bg-white overflow-auto">
          {/* Date Selector */}
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Completed Submissions Section */}
          {completedSubmissions.length > 0 && (
            <div className="px-6 pb-6">
              <p
                className="text-[13px] font-medium mb-2"
                style={{ color: colors.colorBlack3 }}
              >
                Completed submissions ({completedSubmissions.length})
              </p>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {completedSubmissions.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckInListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => console.log('Selected:', submission.id)}
                      onVerify={() => handleVerify(submission.id)}
                      onSendToTablet={() => handleSendToTablet(submission.id)}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pending Submissions Section */}
          {pendingSubmissions.length > 0 && (
            <div className="px-6 pb-6">
              <p
                className="text-[13px] font-medium mb-2"
                style={{ color: colors.colorBlack3 }}
              >
                Pending ({pendingSubmissions.length})
              </p>
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                {pendingSubmissions.map((submission) => {
                  const guest = guests[submission.guestId];
                  const reservation = reservations[submission.reservationId];
                  if (!guest) return null;
                  return (
                    <CheckInListItem
                      key={submission.id}
                      submission={submission}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => console.log('Selected:', submission.id)}
                      onVerify={() => handleVerify(submission.id)}
                      onSendToTablet={() => handleSendToTablet(submission.id)}
                    />
                  );
                })}
              </ul>
            </div>
          )}

          {/* Empty State */}
          {filteredSubmissions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No submissions found
            </div>
          )}
        </div>

        {/* Right Pane - Arrivals Grid */}
        <div className="flex-1 bg-white overflow-auto p-6">
          {/* Main Title */}
          <h2
            className="text-[18px] font-medium mb-6"
            style={{ color: colors.colorBlack1 }}
          >
            Ready for check-In
          </h2>

          {/* Expected Today Section */}
          {expectedArrivals.length > 0 && (
            <div className="mb-8">
              <p
                className="text-[14px] font-medium mb-4"
                style={{ color: colors.colorBlack3 }}
              >
                Expected today ({expectedArrivals.length})
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {expectedArrivals.map((arrival) => {
                  const guest = guests[arrival.guestId];
                  const reservation = reservations[arrival.reservationId];
                  if (!guest) return null;
                  return (
                    <ArrivalCard
                      key={arrival.id}
                      arrival={arrival}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => console.log('Arrival clicked:', arrival.id)}
                      onMobileKey={() => handleMobileKey(arrival.id)}
                      onCheckIn={() => handleArrivalCheckIn(arrival.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Future Arrivals Section */}
          <div className="mb-8">
            <p
              className="text-[14px] font-medium mb-4"
              style={{ color: colors.colorBlack3 }}
            >
              Future ({futureArrivals.length})
            </p>
            {futureArrivals.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {futureArrivals.map((arrival) => {
                  const guest = guests[arrival.guestId];
                  const reservation = reservations[arrival.reservationId];
                  if (!guest) return null;
                  return (
                    <ArrivalCard
                      key={arrival.id}
                      arrival={arrival}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => console.log('Arrival clicked:', arrival.id)}
                      onMobileKey={() => handleMobileKey(arrival.id)}
                      onCheckIn={() => handleArrivalCheckIn(arrival.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: colors.colorBlack4 }}>
                No future verified guests
              </p>
            )}
          </div>

          {/* Checked-in Today Section */}
          <div className="mb-8">
            <p
              className="text-[14px] font-medium mb-4"
              style={{ color: colors.colorBlack3 }}
            >
              Checked-in today ({checkedInArrivals.length})
            </p>
            {checkedInArrivals.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                {checkedInArrivals.map((arrival) => {
                  const guest = guests[arrival.guestId];
                  const reservation = reservations[arrival.reservationId];
                  if (!guest) return null;
                  return (
                    <ArrivalCard
                      key={arrival.id}
                      arrival={arrival}
                      guest={guest}
                      reservation={reservation}
                      onClick={() => console.log('Arrival clicked:', arrival.id)}
                      onMobileKey={() => handleMobileKey(arrival.id)}
                      onCheckIn={() => handleArrivalCheckIn(arrival.id)}
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
    </div>
  );
}
