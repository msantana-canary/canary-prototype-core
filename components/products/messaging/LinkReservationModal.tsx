/**
 * LinkReservationModal Component
 *
 * Modal for searching and linking reservations to a messaging thread.
 * Staff can search by guest name, select a reservation from results, and link it.
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  CanaryModal,
  CanaryInput,
  CanaryList,
  CanaryListItem,
  CanaryButton,
  ButtonType,
  ButtonSize,
  InputType,
  InputSize,
  colors,
} from '@canary-ui/components';
import { Avatar } from './Avatar';
import { reservationList } from '@/lib/core/data/reservations';
import { guests } from '@/lib/core/data/guests';
import Icon from '@mdi/react';
import { mdiCalendarBlank, mdiCalendarOutline, mdiPhoneOutline } from '@mdi/js';

interface LinkReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (reservationId: string) => void;
  alreadyLinkedIds: string[];
}

export function LinkReservationModal({ isOpen, onClose, onLink, alreadyLinkedIds }: LinkReservationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

  // Filter reservations by guest name, excluding already-linked ones
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return reservationList
      .filter((res) => {
        if (alreadyLinkedIds.includes(res.id)) return false;
        const guest = guests[res.guestId];
        if (!guest) return false;
        return guest.name.toLowerCase().includes(query);
      })
      .map((res) => ({
        reservation: res,
        guest: guests[res.guestId]!,
      }));
  }, [searchQuery, alreadyLinkedIds]);

  const handleLink = () => {
    if (selectedReservationId) {
      onLink(selectedReservationId);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedReservationId(null);
    onClose();
  };

  return (
    <CanaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Link reservation"
      size="medium"
      footer={
        <div className="flex justify-end">
          <CanaryButton
            type={ButtonType.PRIMARY}
            size={ButtonSize.NORMAL}
            onClick={handleLink}
            isDisabled={!selectedReservationId}
          >
            Link reservation
          </CanaryButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Description */}
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[21px]"
          style={{ color: colors.colorBlack3 }}
        >
          Link a reservation to this conversation for additional context. Messages will continue going to the contact number.
        </p>

        {/* Search Fields */}
        <div className="flex gap-4">
          <div className="flex-1">
            <CanaryInput
              label="Guest Name"
              type={InputType.TEXT}
              size={InputSize.NORMAL}
              placeholder="Search Guest"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedReservationId(null);
              }}
            />
          </div>
          <div className="flex-1">
            <p className="font-['Roboto',sans-serif] font-normal text-[12px] leading-[1.5] text-black mb-1">
              Stay dates
            </p>
            <div
              className="flex items-center gap-2 h-[40px] rounded border px-2 cursor-default"
              style={{ borderColor: colors.colorBlack3, backgroundColor: colors.colorWhite }}
            >
              <Icon path={mdiCalendarOutline} size={0.8} color={colors.colorBlack3} />
              <span className="font-['Roboto',sans-serif] text-[14px] leading-[1.5]" style={{ color: colors.colorBlack3 }}>
                MM/DD/YYYY
              </span>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div>
            {searchResults.length === 0 ? (
              <p
                className="font-['Roboto',sans-serif] text-[14px] leading-[21px] text-center py-4"
                style={{ color: colors.colorBlack3 }}
              >
                No reservations found
              </p>
            ) : (
              <CanaryList hasOuterBorder>
                {searchResults.map(({ reservation, guest }) => (
                  <CanaryListItem
                    key={reservation.id}
                    isClickable
                    isSelected={selectedReservationId === reservation.id}
                    onClick={() => setSelectedReservationId(reservation.id)}
                    leftContent={
                      <Avatar initials={guest.initials} size="small" />
                    }
                    title={guest.name}
                    subtitle={
                      <div className="flex items-center gap-3">
                        {reservation.checkInDate && reservation.checkOutDate && (
                          <span className="flex items-center gap-1">
                            <Icon path={mdiCalendarBlank} size={0.5} color={colors.colorBlack3} />
                            <span>{reservation.checkInDate} - {reservation.checkOutDate}</span>
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Icon path={mdiPhoneOutline} size={0.5} color={colors.colorBlack3} />
                            <span>{guest.phone}</span>
                          </span>
                        )}
                      </div>
                    }
                  />
                ))}
              </CanaryList>
            )}
          </div>
        )}
      </div>
    </CanaryModal>
  );
}
