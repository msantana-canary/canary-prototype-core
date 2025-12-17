/**
 * PageHeader Component
 *
 * Wrapper around CanaryPageHeader for the messaging product.
 */

'use client';

import React from 'react';
import { CanaryPageHeader } from '@canary-ui/components';

export function PageHeader() {
  return (
    <CanaryPageHeader
      propertyName="Statler New York"
      onPropertyClick={() => console.log('Open property selector')}
      userProfile={{
        name: 'Theresa Webb',
        role: 'Front desk',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      }}
      onUserProfileClick={() => console.log('Open user menu')}
      reservationStatus={{
        label: 'Reservations',
        isConnected: true,
      }}
      onReservationStatusClick={() => console.log('Open reservations')}
    />
  );
}
