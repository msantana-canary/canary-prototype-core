'use client';

/**
 * StructuredInstructions — Text sections for Overview, Actions, and Guardrails.
 * Workflow is handled by the visual diagram (WorkflowVisualizer), not text.
 */

import React, { useState, useEffect } from 'react';
import { colors } from '@canary-ui/components';
import Icon from '@mdi/react';
import {
  mdiInformationOutline,
  mdiLightningBoltOutline,
  mdiShieldCheckOutline,
} from '@mdi/js';
import type { AgentWorkflow, CanaryProduct } from '@/lib/products/agents/types';

interface StructuredInstructionsProps {
  description: string;
  workflow: AgentWorkflow | null;
  capabilities: CanaryProduct[];
  isRevealing?: boolean;
}

function TypewriterText({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setStarted(false);
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  useEffect(() => {
    if (!started || !text) return;
    const words = text.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= words.length) {
        clearInterval(interval);
        setDisplayed(text);
      } else {
        setDisplayed(words.slice(0, i).join(' '));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  if (!started) return null;
  return <>{displayed}</>;
}

export default function StructuredInstructions({
  description,
  workflow,
  capabilities,
  isRevealing = false,
}: StructuredInstructionsProps) {
  const enabledCapabilities = capabilities.filter((c) => c.enabled);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Overview */}
      <Section icon={mdiInformationOutline} title="Overview" accent={colors.colorBlueDark1}>
        {description ? (
          <p style={{ fontSize: 14, color: colors.colorBlack2, margin: 0, lineHeight: 1.6 }}>
            {isRevealing ? <TypewriterText text={description} speed={30} /> : description}
          </p>
        ) : (
          <p style={{ fontSize: 14, color: colors.colorBlack4, margin: 0, fontStyle: 'italic' }}>
            AI will generate an overview based on your workflow.
          </p>
        )}
      </Section>

      {/* Actions / Capabilities */}
      <Section
        icon={mdiLightningBoltOutline}
        title="Actions"
        accent={colors.colorBlueDark1}
        count={enabledCapabilities.length || undefined}
      >
        {enabledCapabilities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {enabledCapabilities.map((cap, i) => (
              <div key={cap.id} style={{ fontSize: 14, lineHeight: 1.5 }}>
                <strong style={{ color: colors.colorBlack1 }}>
                  {isRevealing ? <TypewriterText text={cap.name} delay={i * 200} /> : cap.name}
                </strong>
                <span style={{ color: colors.colorBlack3 }}>
                  {isRevealing ? <> — <TypewriterText text={cap.description} delay={i * 200 + 100} /></> : <> — {cap.description}</>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No capabilities enabled.</Empty>
        )}
      </Section>

      {/* Guardrails */}
      <Section
        icon={mdiShieldCheckOutline}
        title="Guardrails"
        accent={colors.colorBlueDark1}
        count={workflow?.guardrails.length || undefined}
      >
        {workflow && workflow.guardrails.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {workflow.guardrails.map((g, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: colors.colorBlack3, lineHeight: 1.5 }}
              >
                <span style={{ color: colors.colorBlack4, flexShrink: 0 }}>•</span>
                {isRevealing ? <TypewriterText text={g} delay={i * 300} /> : g}
              </div>
            ))}
          </div>
        ) : (
          <Empty>No guardrails defined yet.</Empty>
        )}
      </Section>
    </div>
  );
}

function Section({ icon, title, accent, count, children }: {
  icon: string; title: string; accent: string; count?: number; children: React.ReactNode;
}) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${colors.colorBlack6}`, backgroundColor: colors.colorWhite, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon path={icon} size={0.7} color={accent} />
        <span style={{ fontWeight: 600, fontSize: 14, color: colors.colorBlack1 }}>{title}</span>
        {count != null && count > 0 && (
          <span style={{ fontSize: 11, color: colors.colorBlack4, backgroundColor: colors.colorBlack7, borderRadius: 10, padding: '1px 8px', fontWeight: 500 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: string }) {
  return <p style={{ fontSize: 14, color: colors.colorBlack4, margin: 0, fontStyle: 'italic' }}>{children}</p>;
}
