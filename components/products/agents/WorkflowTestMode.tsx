'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlayOutline,
  mdiStopCircleOutline,
  mdiRestartAlert,
  mdiAccountOutline,
  mdiCheckCircleOutline,
  mdiAlertOutline,
  mdiChevronDown,
} from '@mdi/js';
import {
  CanaryButton,
  ButtonType,
  ButtonSize,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import WorkflowVisualizer from './WorkflowVisualizer';
import { getScenariosForWorkflow, type TestScenario, type TestScenarioEvent } from '@/lib/products/agents/workflow-test-scenarios';

type TestStatus = 'idle' | 'running' | 'complete';

export default function WorkflowTestMode() {
  const workflow = useAgentStore((s) => s.currentWorkflow);
  const workflows = useAgentStore((s) => s.wizardWorkflows);
  const stopTestMode = useAgentStore((s) => s.stopTestMode);

  const scenarios = workflow?.id ? getScenariosForWorkflow(workflow.id) : [];
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(scenarios[0] || null);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [visibleEvents, setVisibleEvents] = useState<TestScenarioEvent[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [activeConditionId, setActiveConditionId] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0]);
    }
  }, [scenarios, selectedScenario]);

  useEffect(() => {
    if (!showPersonaPicker) return;
    const close = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPersonaPicker(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showPersonaPicker]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleEvents]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runScenario = useCallback(() => {
    if (!selectedScenario) return;
    clearTimers();
    setVisibleEvents([]);
    setActiveStepId(null);
    setActiveConditionId(null);
    setStatus('running');

    let cumulativeDelay = 0;
    selectedScenario.events.forEach((event, i) => {
      cumulativeDelay += event.delay + (i === 0 ? 400 : 600);
      const timer = setTimeout(() => {
        setVisibleEvents((prev) => [...prev, event]);
        if (event.activeStepId) setActiveStepId(event.activeStepId);
        if (event.matchedConditionId) setActiveConditionId(event.matchedConditionId);
        if (i === selectedScenario.events.length - 1) {
          setTimeout(() => setStatus('complete'), 800);
        }
      }, cumulativeDelay);
      timersRef.current.push(timer);
    });
  }, [selectedScenario, clearTimers]);

  const resetTest = useCallback(() => {
    clearTimers();
    setVisibleEvents([]);
    setActiveStepId(null);
    setActiveConditionId(null);
    setStatus('idle');
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!workflow) return null;

  const noScenarios = scenarios.length === 0;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes testEventFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Left: Workflow Visualizer with active step tracking */}
      <div style={{ flex: '0 0 50%', overflowY: 'auto', padding: 24, borderRight: '1px solid #E5E5E5' }}>
        <WorkflowVisualizer
          workflow={workflow}
          workflows={workflows}
          activeStepId={activeStepId}
          activeConditionId={activeConditionId}
        />
      </div>

      {/* Right: Test execution panel */}
      <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
        {/* Test header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E5E5', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: status === 'running' ? '#059669' : status === 'complete' ? '#2858C4' : '#999',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>
                {status === 'idle' ? 'Ready to test' : status === 'running' ? 'Test running...' : 'Test complete'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {status === 'idle' && (
                <CanaryButton
                  type={ButtonType.PRIMARY}
                  size={ButtonSize.COMPACT}
                  onClick={runScenario}
                  isDisabled={noScenarios}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon path={mdiPlayOutline} size={0.65} />
                    Run Test
                  </span>
                </CanaryButton>
              )}
              {status === 'running' && (
                <CanaryButton type={ButtonType.SHADED} size={ButtonSize.COMPACT} onClick={resetTest}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon path={mdiStopCircleOutline} size={0.65} />
                    Stop
                  </span>
                </CanaryButton>
              )}
              {status === 'complete' && (
                <CanaryButton type={ButtonType.SHADED} size={ButtonSize.COMPACT} onClick={resetTest}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon path={mdiRestartAlert} size={0.65} />
                    Reset
                  </span>
                </CanaryButton>
              )}
            </div>
          </div>

          {/* Persona picker */}
          {!noScenarios && (
            <div ref={pickerRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPersonaPicker(!showPersonaPicker)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  background: '#F8F9FD', border: '1px solid #E5E5E5', borderRadius: 4,
                  padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundColor: '#EAEEF9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: colors.colorBlueDark1, flexShrink: 0,
                  }}
                >
                  {selectedScenario?.persona.avatar || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#000', margin: 0 }}>
                    {selectedScenario?.persona.name || 'Select persona'}
                  </p>
                  <p style={{ fontSize: 12, color: '#666', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedScenario?.persona.description || ''}
                  </p>
                </div>
                {selectedScenario?.persona.tier && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#D97706', backgroundColor: '#FEF3C7',
                    borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                  }}>
                    {selectedScenario.persona.tier}
                  </span>
                )}
                <Icon path={mdiChevronDown} size={0.7} color="#999" />
              </button>

              {showPersonaPicker && (
                <div
                  style={{
                    position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 10,
                    backgroundColor: '#fff', border: '1px solid #E5E5E5', borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '4px 0', maxHeight: 240, overflowY: 'auto',
                  }}
                >
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => { setSelectedScenario(scenario); setShowPersonaPicker(false); resetTest(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        background: scenario.id === selectedScenario?.id ? '#F8F9FD' : 'none',
                        border: 'none', cursor: 'pointer', padding: '10px 12px', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { if (scenario.id !== selectedScenario?.id) e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = scenario.id === selectedScenario?.id ? '#F8F9FD' : 'transparent'; }}
                    >
                      <div
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          backgroundColor: '#EAEEF9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, color: colors.colorBlueDark1, flexShrink: 0,
                        }}
                      >
                        {scenario.persona.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#000', margin: 0 }}>
                          {scenario.persona.name}
                        </p>
                        <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{scenario.persona.description}</p>
                      </div>
                      {scenario.persona.tier && (
                        <span style={{
                          fontSize: 9, fontWeight: 600, color: '#D97706', backgroundColor: '#FEF3C7',
                          borderRadius: 3, padding: '1px 4px', flexShrink: 0,
                        }}>
                          {scenario.persona.tier}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {noScenarios && (
            <div style={{ padding: '12px 0', color: '#999', fontSize: 13 }}>
              No test scenarios available for this workflow yet.
            </div>
          )}
        </div>

        {/* Event feed */}
        <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {status === 'idle' && !noScenarios && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 13 }}>
              Click &quot;Run Test&quot; to simulate this workflow with {selectedScenario?.persona.name}
            </div>
          )}

          {visibleEvents.map((event, i) => (
            <div
              key={i}
              style={{
                animationName: 'testEventFadeIn',
                animationDuration: '0.3s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
              }}
            >
              {event.type === 'trigger' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  backgroundColor: '#EAEEF9', borderRadius: 4, borderLeft: '3px solid #2858C4',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors.colorBlueDark1 }}>TRIGGER</span>
                  <span style={{ fontSize: 13, color: '#333' }}>{event.content}</span>
                </div>
              )}

              {event.type === 'guest-message' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', backgroundColor: '#F0F0F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: '#666', flexShrink: 0, marginTop: 2,
                  }}>
                    {selectedScenario?.persona.avatar}
                  </div>
                  <div style={{
                    backgroundColor: '#fff', border: '1px solid #E5E5E5', borderRadius: '4px 12px 12px 12px',
                    padding: '10px 14px', maxWidth: '85%',
                  }}>
                    <p style={{ fontSize: 13, color: '#000', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {event.content}
                    </p>
                  </div>
                </div>
              )}

              {event.type === 'agent-response' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  <div style={{
                    backgroundColor: '#2858C4', borderRadius: '12px 4px 12px 12px',
                    padding: '10px 14px', maxWidth: '85%',
                  }}>
                    <p style={{ fontSize: 13, color: '#fff', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {event.content}
                    </p>
                  </div>
                </div>
              )}

              {event.type === 'system-note' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                  backgroundColor: '#F5F5F5', borderRadius: 4, borderLeft: '2px solid #999',
                }}>
                  <span style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>{event.content}</span>
                </div>
              )}

              {event.type === 'condition-match' && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6, padding: '6px 10px',
                  backgroundColor: '#F0FDF4', borderRadius: 4, borderLeft: '2px solid #059669',
                }}>
                  <Icon path={mdiCheckCircleOutline} size={0.55} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: '#065F46' }}>{event.content}</span>
                </div>
              )}

              {event.type === 'guardrail-check' && (
                <div style={{
                  padding: '8px 10px', backgroundColor: '#FFFBEB', borderRadius: 4,
                  borderLeft: '2px solid #D97706', marginTop: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon path={mdiAlertOutline} size={0.55} color="#D97706" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Guardrail Check
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {event.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {status === 'complete' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
              backgroundColor: '#F0FDF4', borderRadius: 4, border: '1px solid #BBF7D0', marginTop: 8,
              animationName: 'testEventFadeIn', animationDuration: '0.3s',
              animationTimingFunction: 'ease-out', animationFillMode: 'forwards',
            }}>
              <Icon path={mdiCheckCircleOutline} size={0.7} color="#059669" />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#065F46' }}>
                Test complete — all steps executed, {visibleEvents.filter((e) => e.type === 'condition-match').length} conditions matched, guardrails verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
