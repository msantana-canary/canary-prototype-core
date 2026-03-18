'use client';

/**
 * GuestJourneyHeader
 *
 * Page header: "Guest Journey" title + "Activity log" outlined text button.
 * White bg, bottom border, consistent with Canary settings pages.
 */

import Icon from '@mdi/react';
import { mdiHistory } from '@mdi/js';
import { CanaryButton, ButtonType, IconPosition } from '@canary-ui/components';

export function GuestJourneyHeader() {
  return (
    <div
      className="flex items-center justify-between bg-white"
      style={{
        padding: '16px 24px 16px 32px',
        borderBottom: '1px solid #E5E5E5',
      }}
    >
      <h1
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#000000',
          margin: 0,
        }}
      >
        Guest Journey
      </h1>
      <CanaryButton
        type={ButtonType.OUTLINED}
        icon={<Icon path={mdiHistory} size={0.8} />}
        iconPosition={IconPosition.LEFT}
        onClick={() => {}}
      >
        Activity log
      </CanaryButton>
    </div>
  );
}
