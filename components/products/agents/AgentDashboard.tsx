'use client';

/**
 * AgentDashboard — Grid of agent cards with a "Create Agent" button.
 */

import React from 'react';
import {
  CanaryButton,
  ButtonType,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import AgentCard from './AgentCard';

export default function AgentDashboard() {
  const agents = useAgentStore((s) => s.agents);
  const setView = useAgentStore((s) => s.setView);
  const selectAgent = useAgentStore((s) => s.selectAgent);

  return (
    <div className="flex flex-col h-full">
      <style>{`
        @keyframes dashCardFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header — matches standard settings header pattern */}
      <div
        className="flex items-center justify-between bg-white shrink-0"
        style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.colorBlack6}` }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 500, color: colors.colorBlack1, margin: 0 }}>
          Canary Agents
        </h1>
        <CanaryButton type={ButtonType.PRIMARY} onClick={() => setView('wizard')}>
          Create Agent
        </CanaryButton>
      </div>

      {/* Agent grid */}
      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {agents.map((agent, idx) => (
            <div
              key={agent.id}
              style={{
                opacity: 0,
                animationName: 'dashCardFadeIn',
                animationDuration: '0.35s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                animationDelay: `${idx * 0.06}s`,
              }}
            >
              <AgentCard
                agent={agent}
                onClick={() => selectAgent(agent.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
