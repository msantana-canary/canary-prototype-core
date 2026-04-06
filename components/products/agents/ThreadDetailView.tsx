'use client';

/**
 * ThreadDetailView — Rich timeline view of a single agent interaction.
 *
 * Looks up timeline data by activity item ID from the centralized timelineData store.
 * Supports all agent types: sales, voice, front desk, check-in, email reservation, service tickets.
 *
 * CTA hookups:
 * - "View Check-in" → navigates to /check-in?guest=guest-emily
 * - "View Transcript" → opens CallDetailsModal with call data
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActivityTimeline from './ActivityTimeline';
import { CallDetailsModal } from '@/components/products/calls/CallDetailsModal';
import { timelineData } from '@/lib/products/agents/timeline-data';
import { agentActivityFeeds } from '@/lib/products/agents/mock-data';
import type { CallSummary } from '@/lib/products/calls/dashboard-types';

// Mock call for the "View Transcript" CTA in timelines that include call events
const MOCK_PARKING_CALL: CallSummary = {
  uuid: 'call-timeline-parking',
  terminal_state: 'handled',
  derived_state: 'completed',
  phone_number: '+15005550012',
  call_start_date: '2026-03-16T19:45:00Z',
  call_duration_seconds: 72,
  guest: {
    name: 'Emily Smith',
    phone_number: '+15005550012',
    loyalty_label: 'DIAMOND ELITE',
  },
  call: {
    summary: 'Guest called asking for directions to the hotel parking garage. AI provided the garage location (West 54th Street entrance), confirmed self-parking rate ($45/night), and mentioned valet is also available ($65/night). Guest confirmed she would use self-parking.',
    forward_category: 'Valet / Parking',
  },
  transcript: [
    { speaker: 'agent', text: 'Thank you for calling The Statler New York. How can I help you today?', timestamp: '2026-03-16T19:45:05Z' },
    { speaker: 'guest', text: 'Hi, I\'m checking in tonight and I\'m driving in. Where is the parking garage?', timestamp: '2026-03-16T19:45:15Z' },
    { speaker: 'agent', text: 'Welcome, Emily! Our parking garage entrance is on West 54th Street, just past the main hotel entrance. You\'ll see signs for "Statler Guest Parking" on the right side.', timestamp: '2026-03-16T19:45:25Z' },
    { speaker: 'guest', text: 'Great, and how much is it per night?', timestamp: '2026-03-16T19:45:35Z' },
    { speaker: 'agent', text: 'Self-parking is $45 per night with in-and-out privileges. We also offer valet parking at $65 per night if you\'d prefer. Both include unlimited access during your stay.', timestamp: '2026-03-16T19:45:48Z' },
    { speaker: 'guest', text: 'Self-parking is fine. Thanks!', timestamp: '2026-03-16T19:45:58Z' },
    { speaker: 'agent', text: 'You\'re welcome! When you arrive, just pull up to the garage gate and scan the QR code we sent with your check-in confirmation. Have a safe drive in, and welcome to The Statler!', timestamp: '2026-03-16T19:46:10Z' },
  ],
  answeredQuestions: [
    { questionId: 'q1', question: 'Where is the parking garage?', answer: 'West 54th Street entrance, past the main hotel entrance, signs for "Statler Guest Parking" on the right.' },
    { questionId: 'q2', question: 'How much is parking per night?', answer: 'Self-parking $45/night, valet $65/night, both with in-and-out privileges.' },
  ],
};

interface ThreadDetailViewProps {
  inquiryId: string;
  onBack: () => void;
  agentName?: string;
}

export default function ThreadDetailView({ inquiryId, onBack, agentName }: ThreadDetailViewProps) {
  const router = useRouter();
  const [showCallModal, setShowCallModal] = useState(false);

  const handleAction = (label: string) => {
    if (label === 'View Check-in') {
      router.push('/check-in?guest=guest-emily');
    } else if (label === 'View Transcript') {
      setShowCallModal(true);
    }
  };

  // Look up timeline data by activity item ID
  const timeline = timelineData[inquiryId];

  // Find the activity feed item to get title/subtitle
  const activityItem = Object.values(agentActivityFeeds)
    .flat()
    .find((item) => item.inquiryId === inquiryId);

  if (!timeline) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
        <p>No timeline data available for this activity.</p>
      </div>
    );
  }

  return (
    <>
      <ActivityTimeline
        events={timeline.events}
        onBack={onBack}
        title={activityItem?.title || 'Activity Detail'}
        subtitle={activityItem?.description}
        agentName={agentName}
        onAction={handleAction}
        animated={timeline.animated}
        hideHeader
      />

      <CallDetailsModal
        call={MOCK_PARKING_CALL}
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />
    </>
  );
}
