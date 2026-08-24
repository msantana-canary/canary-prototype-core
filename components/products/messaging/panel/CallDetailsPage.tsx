/**
 * CallDetailsPage — one call, with its own Summary / Transcript pair.
 *
 * ⚠ Those two tabs are NOT the panel's main tab row. A drill-in replaces the
 * root's chrome entirely, so the only tabs on screen belong to the thing you
 * drilled into — otherwise the page would carry two competing tab strips and
 * "Transcript" would look like a sibling of "Upsells".
 *
 * THE TRANSCRIPT IS THE POINT. A voice call is the one channel a hotelier
 * cannot skim, so the transcript carries the same observability the chat feed
 * gives an AI message: speaker-labelled utterances with the agent's tool-call
 * trace inline, rendered by the SHARED <AiStepsCard>. The AI's work looks the
 * same whether it answered by SMS or by phone.
 *
 * PLAYBACK IS DECORATIVE BUT COHERENT. Nothing plays — there is no audio in a
 * prototype — but the scrubber's fill is computed from elapsed/total rather than
 * drawn at a pleasing position. The frame's knob sits at ~95% while its clock
 * reads 07:32 of 15:24 (~49%); that mismatch is a logged mock nit, and copying
 * it would teach the demo audience that the control lies.
 *
 * THE TRANSPORT IS FOUR `CanaryButton`s, even though none of them does
 * anything: rewind/forward are ICON_SECONDARY at TINY (24px — an exact match
 * for the ramp's bottom rung), play is ICON_PRIMARY re-sized to the frame's
 * 30px/rounded-6, and the speed toggle is TEXT stripped to an inline label.
 * They gain the hover and press states the four hand-rolled buttons never had,
 * which is the point — a dead control that still ANSWERS the pointer is what
 * makes a prototype read as real.
 *
 * The scrubber beside them — track, fill, knob — stays hand-rolled and that is
 * legitimate: the library ships no slider, and `CanaryProgressBar` has no knob
 * and no scrub semantics to borrow.
 */

'use client';

import React, { useState } from 'react';
import { ButtonSize, ButtonType, CanaryButton, colors, TagColor } from '@canary-ui/components';
import Icon from '@mdi/react';
import { mdiPlay, mdiRewind15, mdiFastForward15 } from '@mdi/js';
import { CopyIcon, PanelHeader, PanelTag } from './panel-ui';
import { PanelTabBar } from './PanelTabs';
import { truncateId } from './panel-format';
import { AiStepsCard } from '../AiStepsCard';
import { CallRecord } from '@/lib/products/messaging/types';
import { callProgress } from '@/lib/products/messaging/panel-mock';

type CallTab = 'summary' | 'transcript';

/** A meta-grid cell: 10px uppercase overline over a 14px value. */
function MetaCell({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className="min-w-0" style={{ gridColumn: `span ${span}` }}>
      <span
        className="block font-['Roboto',sans-serif] font-medium uppercase"
        style={{ fontSize: 10, letterSpacing: '0.5px', color: colors.colorBlack3, lineHeight: '16px' }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-1 font-['Roboto',sans-serif] text-[14px] leading-[22px] min-w-0"
        style={{ color: colors.colorBlack1, marginTop: 2 }}
      >
        {children}
      </div>
    </div>
  );
}

export function CallDetailsPage({
  call,
  onBack,
  onClose,
}: {
  call: CallRecord;
  onBack: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<CallTab>('summary');
  const progress = callProgress(call);

  return (
    <div className="w-full h-full shrink-0 flex flex-col min-h-0">
      <PanelHeader title="Call details" onBack={onBack} onClose={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
        {/* META GRID */}
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px 16px', padding: '16px 24px 0' }}
        >
          <MetaCell label="Guest name">{call.guestName}</MetaCell>
          <MetaCell label="Time of call">{call.timeOfCall}</MetaCell>
          <MetaCell label="Call duration">{call.durationClock}</MetaCell>
          <MetaCell label="Handle status">
            <PanelTag
              label={call.handleStatus}
              color={call.handleStatus === 'Contained' ? TagColor.SUCCESS : TagColor.DEFAULT}
              uppercase={false}
            />
          </MetaCell>
          <MetaCell label="ID" span={2}>
            <span className="truncate" title={call.externalId}>
              {truncateId(call.externalId)}
            </span>
            <CopyIcon value={call.externalId} label="Copy call ID" />
          </MetaCell>
        </div>

        {/* PLAYBACK BAR — decorative, but the scrubber agrees with the clock. */}
        <div style={{ padding: '16px 24px 0' }}>
          <div
            className="flex items-center gap-3 rounded-[8px]"
            style={{ backgroundColor: colors.colorBlueDark5, padding: '10px 14px' }}
          >
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.TINY}
              className="icon-btn-neutral"
              icon={
                <Icon
                  path={mdiRewind15}
                  size={0.86}
                  color={colors.colorBlueDark1}
                  title="Back 15 seconds"
                  id="call-playback-rewind"
                />
              }
            />
            <CanaryButton
              type={ButtonType.ICON_PRIMARY}
              size={ButtonSize.COMPACT}
              className="icon-btn-30 icon-btn-r6"
              icon={
                <Icon
                  path={mdiPlay}
                  size={0.8}
                  color={colors.colorWhite}
                  title="Play recording"
                  id="call-playback-play"
                />
              }
            />
            <CanaryButton
              type={ButtonType.ICON_SECONDARY}
              size={ButtonSize.TINY}
              className="icon-btn-neutral"
              icon={
                <Icon
                  path={mdiFastForward15}
                  size={0.86}
                  color={colors.colorBlueDark1}
                  title="Forward 15 seconds"
                  id="call-playback-forward"
                />
              }
            />

            <span
              className="shrink-0 font-['Roboto',sans-serif] text-[13px] leading-[20px] tabular-nums"
              style={{ color: colors.colorBlack2 }}
            >
              {call.elapsedClock}
            </span>

            <div className="relative flex-1 min-w-0" style={{ height: 20 }}>
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 9,
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: 9999,
                  backgroundColor: colors.colorBlueDark4,
                }}
              />
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 9,
                  left: 0,
                  width: `${progress * 100}%`,
                  height: 3,
                  borderRadius: 9999,
                  backgroundColor: colors.colorBlueDark1,
                }}
              />
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 5,
                  left: `calc(${progress * 100}% - 5px)`,
                  width: 11,
                  height: 11,
                  borderRadius: 9999,
                  backgroundColor: colors.colorBlueDark1,
                }}
              />
            </div>

            <span
              className="shrink-0 font-['Roboto',sans-serif] text-[13px] leading-[20px] tabular-nums"
              style={{ color: colors.colorBlack2 }}
            >
              {call.durationClock}
            </span>
            {/* `.text-btn-inline` takes the button chrome off a TEXT button —
                height, padding, hover wash — so "1×" reads as the inline
                affordance the frame draws. The blue is the library's own:
                ButtonColor.NORMAL resolves the content colour to
                colorBlueDark1, which is exactly this value. */}
            <CanaryButton
              type={ButtonType.TEXT}
              size={ButtonSize.TINY}
              className="text-btn-inline !text-[13px] !leading-[20px] !font-medium"
            >
              1×
            </CanaryButton>
          </div>
        </div>

        {/* SUMMARY / TRANSCRIPT — this page's OWN tabs, on the SAME
            `<PanelTabBar>` as the root strip. Two hand-rolled tab strips on one
            surface is two chances to drift; this one was the second, and it had
            the same missing hover the root strip did. */}
        <div style={{ marginTop: 16 }}>
          <PanelTabBar
            tabs={[
              { id: 'summary', label: 'Summary' },
              { id: 'transcript', label: 'Transcript' },
            ]}
            activeTab={tab}
            onChange={(id) => setTab(id as CallTab)}
          />
        </div>

        <div style={{ padding: 24 }}>
          {tab === 'summary' ? (
            <div className="flex flex-col" style={{ gap: 16 }}>
              {call.summary.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <Transcript call={call} />
          )}
        </div>
      </div>

      {/* Stub — there is no file to hand over in a prototype. The CHROME is the
          library's, though: `CanaryButton` SHADED is the tonal-blue commit
          register this bar was hand-rolling (colorBlueDark1 at 10% over white),
          and it brings the hover and press states the hand-rolled one never had.
          `.panel-commit-button` restores the panel's 44px / rounded-8 geometry —
          see globals.css. */}
      <div className="shrink-0" style={{ borderTop: `1px solid ${colors.colorBlack6}`, padding: 24 }}>
        <CanaryButton
          type={ButtonType.SHADED}
          size={ButtonSize.NORMAL}
          className="panel-commit-button w-full"
        >
          Download Transcript
        </CanaryButton>
      </div>
    </div>
  );
}

function Transcript({ call }: { call: CallRecord }) {
  return (
    <div>
      {/* "Call Begins" rule — a hairline either side of the label. */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <span className="flex-1" style={{ height: 1, backgroundColor: colors.colorBlack6 }} />
        <span
          className="shrink-0 font-['Roboto',sans-serif] text-[13px] leading-[20px]"
          style={{ color: colors.colorBlack3 }}
        >
          {call.beginsLabel}
        </span>
        <span className="flex-1" style={{ height: 1, backgroundColor: colors.colorBlack6 }} />
      </div>

      <div className="flex flex-col" style={{ gap: 16 }}>
        {call.transcript.map((turn, i) => (
          <div key={i}>
            <div
              style={{
                borderLeft: `2px solid ${turn.isAi ? colors.colorBlueDark1 : colors.colorBlack5}`,
                paddingLeft: 12,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="truncate font-['Roboto',sans-serif] font-medium text-[14px] leading-[22px]"
                  style={{ color: turn.isAi ? colors.colorBlueDark1 : colors.colorBlack1 }}
                >
                  {turn.speaker}
                </span>
                <span className="flex-1" />
                <span
                  className="shrink-0 font-['Roboto',sans-serif] text-[12px] leading-[18px]"
                  style={{ color: colors.colorBlack3 }}
                >
                  {turn.time}
                </span>
              </div>
              <p
                className="font-['Roboto',sans-serif] text-[14px] leading-[22px]"
                style={{ color: colors.colorBlack1 }}
              >
                {turn.text}
              </p>
            </div>

            {/* The trace that this utterance produced — the SAME component the
                chat feed renders. `accent` is gone as a prop: the gradient rail
                this transcript asked for is now the trace's ONLY dress, because
                the 8/21 review took the feed's bordered box away too. This
                caller keeps its own 12px/4px inset (the column already speaks in
                speaker bars and the trace pays the column's padding); the feed's
                copy sits flush under the name. Nothing about this row moved. */}
            {turn.steps && turn.steps.length > 0 && (
              <AiStepsCard steps={turn.steps} style={{ marginTop: 8 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
