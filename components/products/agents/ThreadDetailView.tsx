'use client';

/**
 * ThreadDetailView — Rich timeline view of a single agent interaction.
 *
 * Shows the full chronological story: agent actions, guest messages,
 * AI responses, system events, expandable details.
 * Two mock scenarios: completed check-in + in-progress sales inquiry.
 */

import React from 'react';
import ActivityTimeline, { MOCK_COMPLETED_TIMELINE, MOCK_INPROGRESS_TIMELINE } from './ActivityTimeline';
import { mockSalesInquiries } from '@/lib/products/agents/mock-data';

interface ThreadDetailViewProps {
  inquiryId: string;
  onBack: () => void;
}

export default function ThreadDetailView({ inquiryId, onBack }: ThreadDetailViewProps) {
  const inquiry = mockSalesInquiries.find((i) => i.id === inquiryId);

  // Determine which timeline to show based on inquiry status
  const isInProgress = inquiry?.status === 'processing';

  // For in-progress inquiries, use the sales inquiry timeline
  if (isInProgress) {
    return (
      <ActivityTimeline
        events={MOCK_INPROGRESS_TIMELINE}
        onBack={onBack}
        title={inquiry ? `${inquiry.from}` : 'Processing...'}
        subtitle={inquiry ? `${inquiry.subject}` : undefined}
      />
    );
  }

  // For completed/responded inquiries, use the check-in timeline as a rich example
  // In production, each agent type would have its own timeline format
  return (
    <ActivityTimeline
      events={MOCK_COMPLETED_TIMELINE}
      onBack={onBack}
      title={inquiry ? inquiry.from : 'Guest Interaction'}
      subtitle={inquiry ? inquiry.subject : undefined}
    />
  );
}
