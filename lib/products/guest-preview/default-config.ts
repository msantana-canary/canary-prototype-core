/**
 * Default Check-In Configuration
 *
 * Matches production defaults for The Statler New York.
 */

import {
  CheckInConfigState,
  OptionalStep,
  DepositStrategy,
  BorderRadius,
} from './types';

export const DEFAULT_CHECK_IN_CONFIG: CheckInConfigState = {
  // Group 1: Flow Steps
  addonsEnabled: true,
  idMode: OptionalStep.REQUIRED,
  idWithOCR: false,
  creditCardMode: OptionalStep.REQUIRED,
  creditCardPhotosEnabled: false,
  additionalGuestsEnabled: true,

  // Group 2: Registration Card Fields
  regCardFields: {
    contactInfo: true,
    address: true,
    arrivalTime: true,
    specialRequests: true,
    dateOfBirth: false,
    gender: false,
    nationality: false,
    passportTravelDoc: false,
    vehicleInfo: false,
    loyaltyProgram: false,
    companyBilling: false,
    hotelPolicy: true,
    marketingConsent: true,
    signature: true, // locked ON
  },

  // Group 3: ID Options
  idOptions: {
    acceptedTypes: {
      passport: true,
      driversLicense: true,
      nationalId: true,
    },
    requireBackPhoto: false,
    requireSelfie: false,
  },

  // Group 4: Payment
  paymentOptions: {
    depositStrategy: DepositStrategy.AUTHORIZE,
    depositAmount: 100,
    surchargeEnabled: false,
    surchargePercent: 3,
    requirePostalCode: false,
  },

  // Group 5: Additional Guest Fields
  additionalGuestFields: {
    fullName: true, // locked ON
    dateOfBirth: false,
    gender: false,
    nationality: false,
    idUpload: false,
    email: false,
    phone: false,
    address: false,
  },

  // Group 6: Reservation Header Display
  reservationHeader: {
    roomNumber: true,
    roomType: true,
    estimatedTotal: true,
  },

  // Group 7: Theme (Statler gold — from Figma)
  theme: {
    primaryColor: '#926e27',
    backgroundColor: '#fcf9f4',
    cardBackgroundColor: '#ffffff',
    fontColor: '#000000',
    borderRadius: BorderRadius.ROUND,
  },
};
