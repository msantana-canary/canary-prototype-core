/**
 * BroadcastThread — REDESIGN (broadcast step 1 baseline)
 *
 * The right card: white rounded-12 bordered container holding the audience
 * header, the flat-block broadcast feed, and the composer — the same anatomy as
 * the Conversations thread card.
 *
 * Header now names the audience ("In-house") with the recipient count beneath
 * it, matching the Conversations thread-header register. The dead info button is
 * gone.
 */

'use client';

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroupOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { BroadcastMessageFeed } from './BroadcastMessageFeed';
import { BroadcastComposer } from './BroadcastComposer';
import { BroadcastToStrip } from './BroadcastToStrip';
import { BroadcastFilterPanel } from './BroadcastFilterPanel';
import { useBroadcastStore } from '@/lib/products/messaging/broadcast-store';
import { getAudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';
import { Avatar } from '../Avatar';
import { guests } from '@/lib/core/data/guests';

export function BroadcastThread() {
  const {
    allGroups,
    selectedGroupId,
    selectedGuestIds,
    messages,
    sendBroadcast,
    scheduledBroadcasts,
    scheduleBroadcast,
    openScheduledPanel,
    activeFilters,
    clearAllFilters,
  } = useBroadcastStore();

  const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);

  const facts = getAudienceFacts(selectedGroupId, allGroups, activeFilters, selectedGuestIds);

  const groupMessages = messages[selectedGroupId] || [];
  const recipientCount = selectedGuestIds.length;
  const currentGroup = allGroups.find(g => g.id === selectedGroupId);
  const groupName = currentGroup?.name ?? 'Broadcast';

  /**
   * Scheduling is CUSTOM-GROUP ONLY. Production passes
   * `:group-broadcast-enabled="!isBuiltInBroadcastFolder(currentFolder)"` into
   * the composer (BroadcastsV2.vue:213-220) and the composer renders the clock
   * only when that is true — the affordance is absent on built-in folders, not
   * disabled.
   */
  const canSchedule = currentGroup?.type === 'custom';

  const groupScheduled = canSchedule
    ? scheduledBroadcasts.filter(s => s.groupId === selectedGroupId)
    : [];

  return (
    <div
      className="flex-1 min-w-0 flex flex-col h-full overflow-clip rounded-[12px]"
      style={{ backgroundColor: colors.colorWhite, border: `1px solid ${colors.colorBlack6}` }}
    >
      {/* Header */}
      <div
        className="flex items-center shrink-0"
        style={{
          minHeight: 70,
          borderBottom: `1px solid ${colors.colorBlack6}`,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div className="flex items-center min-w-0">
          {/* Audience tile — rounded-8 square, redesign avatar register */}
          <div
            className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.colorBlueDark5 }}
          >
            <Icon path={mdiAccountGroupOutline} size={0.83} color={colors.colorBlueDark1} />
          </div>

          <div className="min-w-0" style={{ paddingLeft: 8 }}>
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[24px] truncate"
              style={{ color: colors.colorBlack1 }}
            >
              {groupName}
            </h2>
            {/* The count's home is the To strip — the header is pure identity,
                so the number lives in exactly one place on the surface. */}
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <BroadcastMessageFeed
        messages={groupMessages}
        scheduled={groupScheduled}
        memberCount={currentGroup?.memberCount ?? recipientCount}
        onOpenScheduled={openScheduledPanel}
      />

      {/* The one recipients + filter surface */}
      <BroadcastFilterPanel
        isOpen={isRecipientsOpen}
        onClose={() => setIsRecipientsOpen(false)}
        audienceName={groupName}
      />

      {/* Composer */}
      <div className="shrink-0">
        <BroadcastComposer
          onSend={sendBroadcast}
          recipientCount={recipientCount}
          canSchedule={canSchedule}
          onSchedule={scheduleBroadcast}
          showSendCount
          topSlot={
            <BroadcastToStrip
              audienceName={groupName}
              builtInType={currentGroup?.builtInType}
              facts={facts}
              onOpenRecipients={() => setIsRecipientsOpen(true)}
              onOpenFilters={() => setIsRecipientsOpen(true)}
              onClearFilters={clearAllFilters}
            />
          }
          renderConfirmDetail={(draft) => (
            <SendConfirmDetail
              draft={draft}
              audienceName={groupName}
              facts={facts}
              recipientIds={selectedGuestIds}
            />
          )}
          onReviewRecipients={() => setIsRecipientsOpen(true)}
        />
      </div>
    </div>
  );
}


/**
 * Variant B's send confirmation. The classic confirm asserts a number; this one
 * shows the message, states the audience in a sentence, and puts faces on the
 * recipients — the last chance to notice you're about to blast the wrong people.
 */
function SendConfirmDetail({
  draft,
  audienceName,
  facts,
  recipientIds,
}: {
  draft: string;
  audienceName: string;
  facts: ReturnType<typeof getAudienceFacts>;
  recipientIds: string[];
}) {
  const AVATAR_LIMIT = 12;
  const shown = recipientIds.slice(0, AVATAR_LIMIT);
  const overflow = recipientIds.length - shown.length;

  const clauses: string[] = [audienceName];
  if (facts.filterActive) {
    clauses.push(`filtered by ${facts.filterCount} rule${facts.filterCount !== 1 ? 's' : ''}`);
  }
  if (facts.removedByYou > 0) clauses.push(`${facts.removedByYou} removed by you`);
  if (facts.addedByYou > 0) clauses.push(`${facts.addedByYou} added by you`);

  return (
    <div className="flex flex-col gap-3">
      {/* Message preview — clamped to two lines */}
      <div
        className="rounded-[8px]"
        style={{ backgroundColor: colors.colorBlack8, padding: 12 }}
      >
        <p
          className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
          style={{
            color: colors.colorBlack1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {draft}
        </p>
      </div>

      {/* Audience sentence */}
      <p
        className="font-['Roboto',sans-serif] text-[13px] leading-[20px]"
        style={{ color: colors.colorBlack3 }}
      >
        {clauses.join(' · ')}
      </p>

      {/* Faces */}
      <div className="flex items-center">
        {shown.map((id, i) => {
          const guest = guests[id];
          if (!guest) return null;
          return (
            <span
              key={id}
              style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}
              className="rounded-[8px]"
              title={guest.name}
            >
              <Avatar
                src={guest.avatar}
                initials={guest.initials}
                size="small"
                className="ring-2 ring-white"
              />
            </span>
          );
        })}
        {overflow > 0 && (
          <span
            className="w-8 h-8 rounded-[8px] flex items-center justify-center ring-2 ring-white font-['Roboto',sans-serif] font-medium text-[12px]"
            style={{ marginLeft: -8, backgroundColor: colors.colorBlack7, color: colors.colorBlack2 }}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
