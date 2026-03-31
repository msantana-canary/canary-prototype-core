'use client';

/**
 * AgentBuilderPage — Top-level view switcher for the Agent Builder product.
 *
 * Reads currentView from the store and renders the appropriate view:
 * dashboard | wizard | detail. Wizard and detail render as slide-overs
 * on top of the dashboard.
 */

import React from 'react';
import { colors } from '@canary-ui/components';
import { useAgentStore } from '@/lib/products/agents/store';
import AgentDashboard from './AgentDashboard';
import AgentTemplateGrid from './AgentTemplateGrid';
import AgentView from './AgentView';
import WizardLayout from './WizardLayout';
import AgentProfileStep from './AgentProfileStep';
import CapabilitiesStep, { CapabilitiesSidebar } from './CapabilitiesStep';
import WorkflowsStep, { WorkflowsSidebar } from './WorkflowsStep';
import ConnectorsStep, { ConnectorsSidebar } from './ConnectorsStep';
import DeployModal from './DeployModal';

export default function AgentBuilderPage() {
  const currentView = useAgentStore((s) => s.currentView);
  const wizardTemplate = useAgentStore((s) => s.wizardTemplate);
  const wizardCurrentStep = useAgentStore((s) => s.wizardCurrentStep);
  const selectedWorkflowId = useAgentStore((s) => s.selectedWorkflowId);
  const toastMessage = useAgentStore((s) => s.toastMessage);

  const renderWizardStep = () => {
    switch (wizardCurrentStep) {
      case 'profile':
        return <AgentProfileStep />;
      case 'capabilities':
        return <CapabilitiesStep />;
      case 'workflows':
        return <WorkflowsStep />;
      case 'connectors':
        return <ConnectorsStep />;
      default:
        return <AgentProfileStep />;
    }
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Dashboard always mounted (slide-overs render on top) */}
      <AgentDashboard />

      {/* Wizard slide-over: template grid first, then wizard steps */}
      {currentView === 'wizard' && (
        wizardTemplate
          ? <WizardLayout
              sidebar={
                wizardCurrentStep === 'capabilities' ? <CapabilitiesSidebar /> :
                wizardCurrentStep === 'workflows' && selectedWorkflowId ? <WorkflowsSidebar /> :
                wizardCurrentStep === 'connectors' ? <ConnectorsSidebar /> :
                undefined
              }
            >
              {renderWizardStep()}
            </WizardLayout>
          : <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#fff' }}>
              <AgentTemplateGrid />
            </div>
        )
      }

      {/* Detail/edit slide-over — AgentView handles its own slide-over animation */}
      {currentView === 'detail' && <AgentView />}

      {/* Deploy modal */}
      <DeployModal />

      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 24px',
            backgroundColor: colors.colorBlack2,
            color: colors.colorWhite,
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            animation: 'toastSlideUp 0.3s ease-out',
          }}
        >
          {toastMessage}
          <style>{`
            @keyframes toastSlideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(16px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
