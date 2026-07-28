/**
 * BroadcastLedgerHeader — variant C's card-spanning result header.
 *
 * The thesis: the number you are about to send to is the most consequential
 * fact on the surface, so it should be the largest type on it, and it should
 * arrive with its provenance attached. The headline is the RESULT; the token row
 * beneath is the funnel that produced it, in order.
 *
 * Tokens render only when nonzero, so a clean folder shows headline + caption
 * and nothing else — the ledger appears exactly when there is something to
 * explain. There is deliberately no "=" token: the headline already is the sum.
 */

'use client';

import React from 'react';
import Icon from '@mdi/react';
import { mdiLockOutline } from '@mdi/js';
import { colors } from '@canary-ui/components';
import { AudienceFacts } from '@/lib/products/messaging/broadcast-audience-facts';

export type LedgerReason = 'status' | 'unreachable' | 'edits';

function LedgerToken({
  label,
  bg,
  fg,
  locked,
  onClick,
}: {
  label: string;
  bg?: string;
  fg: string;
  locked?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`inline-flex items-center gap-1 rounded-[6px] shrink-0 ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      style={{
        height: 24,
        paddingLeft: bg ? 8 : 0,
        paddingRight: bg ? 8 : 0,
        backgroundColor: bg,
      }}
    >
      {locked && <Icon path={mdiLockOutline} size={0.5} color={fg} />}
      <span
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px] whitespace-nowrap"
        style={{ color: fg }}
      >
        {label}
      </span>
    </Tag>
  );
}

export function BroadcastLedgerHeader({
  audienceName,
  dateLabel,
  facts,
  onJumpToReason,
}: {
  audienceName: string;
  dateLabel: string;
  facts: AudienceFacts;
  onJumpToReason: (reason: LedgerReason) => void;
}) {
  const statusHeld = facts.alreadyCheckedIn + facts.alreadyCheckedOut;
  const unreachable = facts.optedOut + facts.noPhone;
  const statusLabel =
    facts.alreadyCheckedOut > facts.alreadyCheckedIn ? 'already checked out' : 'already checked in';

  return (
    <div
      className="shrink-0"
      style={{ padding: 16, borderBottom: `1px solid ${colors.colorBlack6}` }}
    >
      <h2
        className="font-['Roboto',sans-serif] font-medium"
        style={{ fontSize: 20, lineHeight: '28px', color: colors.colorBlack1 }}
      >
        {facts.selectedCount} recipient{facts.selectedCount !== 1 ? 's' : ''}
      </h2>
      <p
        className="font-['Roboto',sans-serif] text-[12px] leading-[18px]"
        style={{ color: colors.colorBlack3 }}
      >
        {audienceName} · {dateLabel}
      </p>

      {/* Funnel, in order: source → filter → system → locked → your edits */}
      <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 8 }}>
        {facts.filterActive && (
          <>
            <LedgerToken
              label={`${facts.sourceTotal} in ${audienceName}`}
              fg={colors.colorBlack3}
            />
            <LedgerToken
              label={`→ ${facts.visibleTotal} match ${facts.filterCount} filter${
                facts.filterCount !== 1 ? 's' : ''
              }`}
              bg={colors.colorBlueDark5}
              fg={colors.colorBlueDark1}
            />
          </>
        )}
        {!facts.filterActive && (statusHeld > 0 || unreachable > 0 || facts.removedByYou > 0) && (
          <LedgerToken label={`${facts.sourceTotal} in ${audienceName}`} fg={colors.colorBlack3} />
        )}

        {statusHeld > 0 && (
          <LedgerToken
            label={`− ${statusHeld} ${statusLabel}`}
            bg={colors.colorBlack7}
            fg={colors.colorBlack2}
            onClick={() => onJumpToReason('status')}
          />
        )}
        {unreachable > 0 && (
          <LedgerToken
            label={`− ${unreachable} unreachable`}
            bg={colors.colorBlack7}
            fg={colors.colorBlack3}
            locked
            onClick={() => onJumpToReason('unreachable')}
          />
        )}
        {facts.removedByYou > 0 && (
          <LedgerToken
            label={`− ${facts.removedByYou} you unchecked`}
            bg={colors.colorBlueDark5}
            fg={colors.colorBlueDark1}
            onClick={() => onJumpToReason('edits')}
          />
        )}
        {facts.addedByYou > 0 && (
          <LedgerToken
            label={`+ ${facts.addedByYou} you added`}
            bg={colors.colorBlueDark5}
            fg={colors.colorBlueDark1}
          />
        )}
      </div>
    </div>
  );
}
