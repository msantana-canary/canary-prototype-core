'use client';

/**
 * DeployModal — Two-phase deployment confirmation.
 *
 * Phase 1: Standard confirmation modal (title, description, Cancel/Deploy buttons)
 * Phase 2: Animated deployment state with rocket animation, progress bar, success
 */

import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiRocketLaunchOutline, mdiCheckCircleOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  ButtonType,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';

export default function DeployModal() {
  const showDeployModal = useAgentStore((s) => s.showDeployModal);
  const setShowDeployModal = useAgentStore((s) => s.setShowDeployModal);
  const deployAgent = useAgentStore((s) => s.deployAgent);
  const agentName = useAgentStore((s) => s.agentName);

  const [phase, setPhase] = useState<'confirm' | 'deploying' | 'deployed'>('confirm');

  useEffect(() => {
    if (!showDeployModal) setPhase('confirm');
  }, [showDeployModal]);

  const handleDeploy = () => {
    setPhase('deploying');
    setTimeout(() => {
      setPhase('deployed');
      setTimeout(() => {
        deployAgent();
        setShowDeployModal(false);
      }, 1500);
    }, 2500);
  };

  // Phase 1: Standard confirmation
  if (phase === 'confirm') {
    return (
      <CanaryModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        title={`Deploy ${agentName || 'Agent'}?`}
        size="small"
        closeOnOverlayClick
        footer={
          <div className="flex items-center justify-end gap-2">
            <CanaryButton type={ButtonType.TEXT} onClick={() => setShowDeployModal(false)}>
              Cancel
            </CanaryButton>
            <CanaryButton type={ButtonType.PRIMARY} onClick={handleDeploy}>
              Deploy Now
            </CanaryButton>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: '22px' }}>
          Your agent will go live and start handling inquiries immediately.
        </p>
      </CanaryModal>
    );
  }

  // Phase 2 & 3: Deploying animation / Deployed success
  return (
    <CanaryModal
      isOpen={showDeployModal}
      onClose={() => {}}
      size="small"
      showCloseButton={false}
    >
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        {/* Animated rocket / checkmark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: phase === 'deployed' ? '#CCE6D9' : '#EAEEF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            transition: 'background-color 0.5s ease',
          }}
        >
          {phase === 'deployed' ? (
            <Icon
              path={mdiCheckCircleOutline}
              size={2}
              color="#008040"
              style={{ animation: 'deployCheckIn 0.5s ease-out' }}
            />
          ) : (
            <Icon
              path={mdiRocketLaunchOutline}
              size={2}
              color="#2858C4"
              style={{ animation: 'deployRocketLaunch 2.5s ease-in-out infinite' }}
            />
          )}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: '0 0 8px 0' }}>
          {phase === 'deployed'
            ? `${agentName || 'Agent'} is live!`
            : `Deploying ${agentName || 'Agent'}...`}
        </h2>

        <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: '22px' }}>
          {phase === 'deployed'
            ? 'Your agent is now active and ready to handle inquiries.'
            : 'Setting up your agent and connecting to your systems...'}
        </p>

        {/* Progress bar */}
        {phase === 'deploying' && (
          <div
            style={{
              width: 160,
              height: 4,
              backgroundColor: '#E5E5E5',
              borderRadius: 2,
              margin: '24px auto 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#2858C4',
                borderRadius: 2,
                animation: 'deployProgress 2.5s ease-out forwards',
              }}
            />
          </div>
        )}

        <style>{`
          @keyframes deployRocketLaunch {
            0% { transform: translateY(0) rotate(-5deg); }
            25% { transform: translateY(-6px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(5deg); }
            75% { transform: translateY(-8px) rotate(0deg); }
            100% { transform: translateY(0) rotate(-5deg); }
          }
          @keyframes deployCheckIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes deployProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </CanaryModal>
  );
}
