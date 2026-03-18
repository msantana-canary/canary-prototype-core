/**
 * Guest Journey Store (Zustand)
 *
 * Global state for the Guest Journey settings page.
 * Manages messages, campaigns, segments, selections, and tab state.
 */

import { create } from 'zustand';
import {
  GuestJourneyMessage,
  ScheduledCampaign,
  Segment,
  GuestJourneyTab,
  JourneyStage,
} from './types';
import { mockMessages, mockCampaigns, mockSegments } from './mock-data';

interface GuestJourneyState {
  // Data
  messages: GuestJourneyMessage[];
  campaigns: ScheduledCampaign[];
  segments: Segment[];

  // UI State
  activeTab: GuestJourneyTab;
  selectedMessageId: string | null;
  selectedCampaignId: string | null;
  isEditorOpen: boolean;
  isCampaignEditorOpen: boolean;
  isSegmentEditorOpen: boolean;
  editingSegmentId: string | null;
  isCreatingNew: boolean;
  creatingInStage: JourneyStage | null;

  // Tab Actions
  setActiveTab: (tab: GuestJourneyTab) => void;

  // Message Actions
  selectMessage: (messageId: string) => void;
  clearSelection: () => void;
  toggleMessageEnabled: (messageId: string) => void;
  updateMessage: (messageId: string, updates: Partial<GuestJourneyMessage>) => void;
  deleteMessage: (messageId: string) => void;
  createMessage: (message: GuestJourneyMessage) => void;
  startCreatingMessage: (stage: JourneyStage) => void;
  openEditor: (messageId: string) => void;
  closeEditor: () => void;

  // Campaign Actions
  selectCampaign: (campaignId: string) => void;
  toggleCampaignEnabled: (campaignId: string) => void;
  updateCampaign: (campaignId: string, updates: Partial<ScheduledCampaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  createCampaign: (campaign: ScheduledCampaign) => void;
  openCampaignEditor: (campaignId?: string) => void;
  closeCampaignEditor: () => void;

  // Segment Actions
  createSegment: (segment: Segment) => void;
  updateSegment: (segmentId: string, updates: Partial<Segment>) => void;
  deleteSegment: (segmentId: string) => void;
  openSegmentEditor: (segmentId?: string) => void;
  closeSegmentEditor: () => void;
}

export const useGuestJourneyStore = create<GuestJourneyState>((set) => ({
  // Initial data from mock
  messages: mockMessages,
  campaigns: mockCampaigns,
  segments: mockSegments,

  // Initial UI state
  activeTab: 'reservation-messages',
  selectedMessageId: null,
  selectedCampaignId: null,
  isEditorOpen: false,
  isCampaignEditorOpen: false,
  isSegmentEditorOpen: false,
  editingSegmentId: null,
  isCreatingNew: false,
  creatingInStage: null,

  // ── Tab Actions ─────────────────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Message Actions ─────────────────────────────────────────────────
  selectMessage: (messageId) => set({ selectedMessageId: messageId }),

  clearSelection: () => set({ selectedMessageId: null }),

  toggleMessageEnabled: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isEnabled: !msg.isEnabled } : msg
      ),
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
      selectedMessageId:
        state.selectedMessageId === messageId ? null : state.selectedMessageId,
      isEditorOpen:
        state.selectedMessageId === messageId ? false : state.isEditorOpen,
    })),

  createMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      isCreatingNew: false,
      creatingInStage: null,
    })),

  startCreatingMessage: (stage) =>
    set({
      isCreatingNew: true,
      creatingInStage: stage,
      isEditorOpen: true,
      selectedMessageId: null,
    }),

  openEditor: (messageId) =>
    set({
      selectedMessageId: messageId,
      isEditorOpen: true,
      isCreatingNew: false,
      creatingInStage: null,
    }),

  closeEditor: () =>
    set({
      isEditorOpen: false,
      isCreatingNew: false,
      creatingInStage: null,
      selectedMessageId: null,
    }),

  // ── Campaign Actions ────────────────────────────────────────────────
  selectCampaign: (campaignId) => set({ selectedCampaignId: campaignId }),

  toggleCampaignEnabled: (campaignId) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId ? { ...c, isEnabled: !c.isEnabled } : c
      ),
    })),

  updateCampaign: (campaignId, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId ? { ...c, ...updates } : c
      ),
    })),

  deleteCampaign: (campaignId) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== campaignId),
      selectedCampaignId:
        state.selectedCampaignId === campaignId ? null : state.selectedCampaignId,
      isCampaignEditorOpen:
        state.selectedCampaignId === campaignId ? false : state.isCampaignEditorOpen,
    })),

  createCampaign: (campaign) =>
    set((state) => ({
      campaigns: [...state.campaigns, campaign],
    })),

  openCampaignEditor: (campaignId) =>
    set({
      selectedCampaignId: campaignId || null,
      isCampaignEditorOpen: true,
    }),

  closeCampaignEditor: () =>
    set({
      isCampaignEditorOpen: false,
    }),

  // ── Segment Actions ─────────────────────────────────────────────────
  createSegment: (segment) =>
    set((state) => ({
      segments: [...state.segments, segment],
    })),

  updateSegment: (segmentId, updates) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === segmentId ? { ...s, ...updates } : s
      ),
    })),

  deleteSegment: (segmentId) =>
    set((state) => ({
      segments: state.segments.filter((s) => s.id !== segmentId),
    })),

  openSegmentEditor: (segmentId) =>
    set({
      editingSegmentId: segmentId || null,
      isSegmentEditorOpen: true,
    }),

  closeSegmentEditor: () =>
    set({
      isSegmentEditorOpen: false,
      editingSegmentId: null,
    }),
}));
