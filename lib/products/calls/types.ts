/**
 * Calls Settings Types
 *
 * TypeScript interfaces for the Transfer Rules settings feature.
 */

export interface AdditionalQuestion {
  id: string;
  question: string;
  type: 'freeform' | 'predetermined';
  options?: string[];
}

export interface ForwardNumberRule {
  id: string;
  type: 'default' | 'custom';
  departmentName: string;
  description: string;
  phoneNumber: string;
  matchType?: 'exact' | 'smart';
  keywords?: string[];
  whenToTransfer?: string;
  additionalQuestions?: AdditionalQuestion[];
  fallbackType: 'route' | 'message';
  fallbackDepartment?: string;
  fallbackMessage?: string;
  summaryEmails?: string[];
  afterHoursEnabled?: boolean;
  afterHoursFrom?: string;
  afterHoursTo?: string;
}

export interface VoiceOption {
  label: string;
  value: string;
}

export interface DepartmentOption {
  label: string;
  value: string;
}

export interface CallsSettingsState {
  // Number Settings
  voiceNumber: string;
  forwardCallNumber: string;
  bypassNumbers: string[];

  // Voice Settings
  selectedVoice: string;
  personalizedMessage: string;
  welcomeMessage: string;

  // Send Follow-Up SMS
  sendFollowUpSMS: boolean;

  // Booking Link
  defaultBookingLink: string;
  bookingLinkMessage: string;

  // Forward Numbers
  forwardNumberRules: ForwardNumberRule[];

  // Additional Settings
  pushBackOnImmediateTransfer: boolean;
  forwardWithoutSummary: boolean;
}

export interface CallsSettingsActions {
  // Number Settings
  setForwardCallNumber: (value: string) => void;
  setBypassNumbers: (values: string[]) => void;

  // Voice Settings
  setSelectedVoice: (value: string) => void;
  setPersonalizedMessage: (value: string) => void;
  setWelcomeMessage: (value: string) => void;

  // Send Follow-Up SMS
  setSendFollowUpSMS: (value: boolean) => void;

  // Booking Link
  setDefaultBookingLink: (value: string) => void;
  setBookingLinkMessage: (value: string) => void;

  // Forward Numbers
  addForwardNumberRule: (rule: Omit<ForwardNumberRule, 'id'>) => void;
  updateForwardNumberRule: (id: string, updates: Partial<ForwardNumberRule>) => void;
  removeForwardNumberRule: (id: string) => void;
  getForwardNumberRuleById: (id: string) => ForwardNumberRule | undefined;

  // Additional Settings
  setPushBackOnImmediateTransfer: (value: boolean) => void;
  setForwardWithoutSummary: (value: boolean) => void;

  // Reset
  reset: () => void;
}

export type CallsSettingsStore = CallsSettingsState & CallsSettingsActions;
