/**
 * Calls Settings Store
 *
 * Manages state for Transfer Rules settings feature.
 * Uses Zustand for state management.
 */

import { create } from 'zustand';
import type { CallsSettingsStore, ForwardNumberRule } from '@/lib/products/calls/types';

// Initial state values
const initialState = {
  // Number Settings
  voiceNumber: '+1-(123)-456-7890',
  forwardCallNumber: '+1-(987)-654-3210',
  bypassNumbers: ['+1-(987)-654-3210', '+1-(555)-123-4567', '+1-(444)-987-6543'],

  // Voice Settings
  selectedVoice: 'lyra',
  personalizedMessage:
    'Hello {{guest_first_name}}, and a warm welcome to {{hotel_name}}! We truly hope you\'re having a wonderful {{time_of_day}}. If there\'s anything you need to make your stay even better, please don\'t hesitate to reach out!',
  welcomeMessage:
    'Welcome to {{hotel_name}}! We hope you\'re having a wonderful {{time_of_day}}. If there\'s anything you need during your stay, please don\'t hesitate to ask!',

  // Send Follow-Up SMS
  sendFollowUpSMS: true,

  // Booking Link
  defaultBookingLink:
    'https://be.synxis.com/?adult=1&arrive=2025-06-30&chain=20678&child=0&currency=USD&depart=2025-07-02&hotel=45225&level=hotel&locale=en-US&productcurrency=USD&rooms=1',
  bookingLinkMessage:
    'Would you like us to send you a booking link so you can complete your reservation at your convenience?',

  // Forward Numbers
  forwardNumberRules: [
    {
      id: 'rule-1',
      type: 'default' as const,
      departmentName: 'Front Desk',
      description:
        'General inquiries, security, noise complaints, lost items, early check-in/late checkout',
      phoneNumber: '+1-(833)-798-4092',
      additionalQuestions: [
        { id: 'q18', question: 'What is your room number?', type: 'freeform' as const },
        { id: 'q19', question: 'What type of assistance do you need?', type: 'predetermined' as const, options: ['Room issue', 'Housekeeping request', 'Check-in/Check-out', 'Lost item', 'Noise complaint', 'Other'] },
        { id: 'q20', question: 'How urgent is your request?', type: 'predetermined' as const, options: ['Immediate', 'Within the hour', 'Today', 'Not urgent'] },
      ],
      fallbackType: 'route' as const,
      fallbackDepartment: 'front-desk',
    },
    {
      id: 'rule-2',
      type: 'default' as const,
      departmentName: 'Catering & Events',
      description: 'Event bookings, corporate retreats, weddings, group functions',
      phoneNumber: '+1-(833)-798-4093',
      additionalQuestions: [
        { id: 'q1', question: 'What type of event are you planning?', type: 'predetermined' as const, options: ['Corporate retreat', 'Wedding', 'Birthday party', 'Conference', 'Other'] },
        { id: 'q2', question: 'How many guests are you expecting?', type: 'freeform' as const },
        { id: 'q3', question: 'What dates are you considering?', type: 'freeform' as const },
        { id: 'q4', question: 'Do you have any catering requirements or dietary restrictions?', type: 'freeform' as const },
        { id: 'q5', question: 'What is your approximate budget?', type: 'predetermined' as const, options: ['Under $5,000', '$5,000 - $10,000', '$10,000 - $20,000', 'Over $20,000'] },
      ],
      fallbackType: 'route' as const,
      fallbackDepartment: 'front-desk',
    },
    {
      id: 'rule-3',
      type: 'default' as const,
      departmentName: 'Restaurant',
      description: 'Restaurant reservations, private dining, menu inquiries',
      phoneNumber: '+1-(833)-798-4094',
      additionalQuestions: [
        { id: 'q6', question: 'How many guests will be dining?', type: 'freeform' as const },
        { id: 'q7', question: 'What date and time would you prefer?', type: 'freeform' as const },
        { id: 'q8', question: 'Are there any dietary restrictions or allergies we should know about?', type: 'freeform' as const },
        { id: 'q9', question: 'Is this for a special occasion?', type: 'predetermined' as const, options: ['Birthday', 'Anniversary', 'Business dinner', 'Date night', 'No special occasion'] },
      ],
      fallbackType: 'route' as const,
      fallbackDepartment: 'front-desk',
    },
    {
      id: 'rule-4',
      type: 'default' as const,
      departmentName: 'Reservations',
      description: 'Room bookings, rate inquiries, availability checks, modifications',
      phoneNumber: '+1-(833)-798-4095',
      additionalQuestions: [
        { id: 'q10', question: 'What are your check-in and check-out dates?', type: 'freeform' as const },
        { id: 'q11', question: 'How many guests will be staying?', type: 'freeform' as const },
        { id: 'q12', question: 'Do you have a room type preference?', type: 'predetermined' as const, options: ['Standard King', 'Standard Double', 'Suite', 'No preference'] },
        { id: 'q13', question: 'Is this booking for a special occasion?', type: 'predetermined' as const, options: ['Honeymoon', 'Anniversary', 'Birthday', 'Business trip', 'No special occasion'] },
      ],
      fallbackType: 'route' as const,
      fallbackDepartment: 'front-desk',
    },
    {
      id: 'rule-5',
      type: 'default' as const,
      departmentName: 'Spa',
      description: 'Spa appointments, treatment inquiries, wellness packages',
      phoneNumber: '+1-(833)-798-4096',
      additionalQuestions: [
        { id: 'q14', question: 'What type of treatment are you interested in?', type: 'predetermined' as const, options: ['Massage', 'Facial', 'Body treatment', 'Nail services', 'Package'] },
        { id: 'q15', question: 'What date and time would you prefer?', type: 'freeform' as const },
        { id: 'q16', question: 'Do you have a therapist preference?', type: 'predetermined' as const, options: ['Female therapist', 'Male therapist', 'No preference'] },
        { id: 'q17', question: 'Any health conditions or allergies we should be aware of?', type: 'freeform' as const },
      ],
      fallbackType: 'route' as const,
      fallbackDepartment: 'front-desk',
    },
  ],

  // Additional Settings
  pushBackOnImmediateTransfer: true,
  forwardWithoutSummary: true,
};

export const useCallsSettingsStore = create<CallsSettingsStore>((set, get) => ({
  ...initialState,

  // Number Settings
  setForwardCallNumber: (value: string) => set({ forwardCallNumber: value }),
  setBypassNumbers: (values: string[]) => set({ bypassNumbers: values }),

  // Voice Settings
  setSelectedVoice: (value: string) => set({ selectedVoice: value }),
  setPersonalizedMessage: (value: string) => set({ personalizedMessage: value }),
  setWelcomeMessage: (value: string) => set({ welcomeMessage: value }),

  // Send Follow-Up SMS
  setSendFollowUpSMS: (value: boolean) => set({ sendFollowUpSMS: value }),

  // Booking Link
  setDefaultBookingLink: (value: string) => set({ defaultBookingLink: value }),
  setBookingLinkMessage: (value: string) => set({ bookingLinkMessage: value }),

  // Forward Numbers
  addForwardNumberRule: (rule: Omit<ForwardNumberRule, 'id'>) =>
    set((state) => ({
      forwardNumberRules: [
        ...state.forwardNumberRules,
        { ...rule, id: `rule-${Date.now()}` },
      ],
    })),

  updateForwardNumberRule: (id: string, updates: Partial<ForwardNumberRule>) =>
    set((state) => ({
      forwardNumberRules: state.forwardNumberRules.map((rule) =>
        rule.id === id ? { ...rule, ...updates } : rule
      ),
    })),

  removeForwardNumberRule: (id: string) =>
    set((state) => ({
      forwardNumberRules: state.forwardNumberRules.filter((rule) => rule.id !== id),
    })),

  getForwardNumberRuleById: (id: string) => {
    return get().forwardNumberRules.find((rule) => rule.id === id);
  },

  // Additional Settings
  setPushBackOnImmediateTransfer: (value: boolean) =>
    set({ pushBackOnImmediateTransfer: value }),
  setForwardWithoutSummary: (value: boolean) => set({ forwardWithoutSummary: value }),

  // Reset
  reset: () => set(initialState),
}));
