'use client';

/**
 * DeployModal — Confirmation modal before deploying an agent.
 * Shows a brief animation and confirms the agent will go live.
 */

import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiRocketLaunchOutline, mdiCheckCircleOutline } from '@mdi/js';
import {
  CanaryButton,
  CanaryModal,
  ButtonType,
  colors,
} from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';

export default function DeployModal() {
  const showDeployModal = useAgentStore((s) => s.showDeployModal);
  const setShowDeployModal = useAgentStore((s) => s.setShowDeployModal);
  const deployAgent = useAgentStore((s) => s.deployAgent);
  const agentName = useAgentStore((s) => s.agentName);

  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    if (!showDeployModal) {
      setIsDeploying(false);
      setIsDeployed(false);
    }
  }, [showDeployModal]);

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate deployment animation
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      setTimeout(() => {
        deployAgent();
        setShowDeployModal(false);
      }, 1500);
    }, 2000);
  };

  return (
    <CanaryModal
      isOpen={showDeployModal}
      onClose={() => setShowDeployModal(false)}
      size="small"
    >
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        {/* Icon with animation */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: isDeployed ? '#e8f5e9' : colors.colorBlueDark5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            transition: 'all 0.5s ease',
            transform: isDeploying ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <Icon
            path={isDeployed ? mdiCheckCircleOutline : mdiRocketLaunchOutline}
            size={1.5}
            color={isDeployed ? '#4caf50' : colors.colorBlueDark1}
            style={{
              transition: 'all 0.3s ease',
              animation: isDeploying ? 'deployPulse 0.8s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: colors.colorBlack1, margin: '0 0 8px 0' }}>
          {isDeployed
            ? `${agentName || 'Agent'} is live!`
            : isDeploying
              ? 'Deploying...'
              : `Deploy ${agentName || 'Agent'}?`}
        </h2>

        <p style={{ fontSize: 14, color: colors.colorBlack3, margin: '0 0 24px 0', lineHeight: '20px' }}>
          {isDeployed
            ? 'Your agent is now active and ready to handle inquiries.'
            : isDeploying
              ? 'Setting up your agent and connecting to your systems...'
              : 'Your agent will go live and start handling inquiries immediately.'}
        </p>

        {!isDeploying && !isDeployed && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <CanaryButton type={ButtonType.OUTLINED} onClick={() => setShowDeployModal(false)}>
              Cancel
            </CanaryButton>
            <CanaryButton type={ButtonType.PRIMARY} onClick={handleDeploy}>
              Deploy Now
            </CanaryButton>
          </div>
        )}

        {/* Loading animation */}
        {isDeploying && (
          <div
            style={{
              width: 120,
              height: 4,
              backgroundColor: colors.colorBlack6,
              borderRadius: 2,
              margin: '0 auto',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: colors.colorBlueDark1,
                borderRadius: 2,
                animation: 'deployProgress 2s ease-out forwards',
              }}
            />
          </div>
        )}

        <style>{`
          @keyframes deployPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
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
