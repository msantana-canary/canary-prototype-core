/**
 * Agent Builder Store (Zustand)
 *
 * Manages dashboard, wizard, and detail views. The wizard is now a
 * conversational AI-guided experience — no step-by-step navigation.
 * Template selection populates all fields, then the chat refines.
 *
 * v2: Added rules (GambitRule[]), action view, and sales inquiries.
 */
import { create } from 'zustand';
import {
  Agent,
  AgentTemplate,
  AgentTrigger,
  AgentViewTab,
  AgentWorkflow,
  AppView,
  BuilderMessage,
  CanaryProduct,
  Connection,
  ConnectorConfig,
  GambitRule,
  WizardStep,
  CANARY_PRODUCTS,
} from './types';
import { mockAgents, availableConnections, mockConnectors, mockWorkflowColdLead, mockWorkflowContractPrep } from './mock-data';

interface AgentStoreState {
  // Navigation
  currentView: AppView;
  selectedAgentId: string | null;

  // Agents list
  agents: Agent[];

  // Wizard state (populated by template or conversation)
  wizardCurrentStep: WizardStep;
  wizardTemplate: AgentTemplate | null;
  wizardTriggers: AgentTrigger[];
  wizardConnections: Connection[];
  wizardCapabilities: CanaryProduct[];
  wizardGuardrails: string[];
  wizardTone: string;
  wizardRules: GambitRule[];
  agentName: string;
  agentDescription: string;

  // Wizard profile fields (Agent Profile step)
  wizardResponsibilities: string[];
  wizardBehavioralGuidelines: string;
  wizardGuardrailsText: string;
  wizardAvoidedTopics: string[];
  wizardCommunicationStyle: string;

  // Wizard connectors
  wizardConnectors: ConnectorConfig[];

  // Chat (used in wizard workflow step + detail view)
  builderMessages: BuilderMessage[];
  currentWorkflow: AgentWorkflow | null;
  currentConnections: Connection[];
  isGenerating: boolean;

  // Edit view
  editAgentTab: AgentViewTab;

  // Deploy modal
  showDeployModal: boolean;

  // Thread detail
  selectedThreadId: string | null;

  // Multi-workflow support
  wizardWorkflows: AgentWorkflow[];
  selectedWorkflowId: string | null;

  // Toast
  toastMessage: string | null;

  // Navigation actions
  setView: (view: AppView) => void;
  selectAgent: (id: string) => void;
  goBack: () => void;

  // Agent CRUD
  createAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  toggleAgentStatus: (id: string) => void;
  updateCapabilityInstructions: (agentId: string, capabilityId: string, instructions: string) => void;
  updateAgentRules: (agentId: string, rules: GambitRule[]) => void;

  // Wizard navigation
  setWizardStep: (step: WizardStep) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;

  // Wizard data setters
  setWizardTriggers: (triggers: AgentTrigger[]) => void;
  setWizardConnections: (connections: Connection[]) => void;
  setWizardCapabilities: (capabilities: CanaryProduct[]) => void;
  setWizardGuardrails: (guardrails: string[]) => void;
  setWizardTone: (tone: string) => void;
  setWizardRules: (rules: GambitRule[]) => void;

  // Wizard profile setters
  setWizardResponsibilities: (responsibilities: string[]) => void;
  setWizardBehavioralGuidelines: (guidelines: string) => void;
  setWizardGuardrailsText: (guardrails: string) => void;
  setWizardAvoidedTopics: (topics: string[]) => void;
  setWizardCommunicationStyle: (style: string) => void;
  setWizardConnectors: (connectors: ConnectorConfig[]) => void;

  // Template-based setup
  startFromTemplate: (template: AgentTemplate) => void;
  startFromScratch: () => void;
  setWizardFromTemplate: (template: AgentTemplate) => void;

  // Chat actions
  addBuilderMessage: (message: Omit<BuilderMessage, 'id' | 'timestamp'>) => void;
  setBuilderWorkflow: (workflow: AgentWorkflow) => void;
  setBuilderConnections: (connections: Connection[]) => void;
  setIsGenerating: (value: boolean) => void;
  setAgentName: (name: string) => void;
  setAgentDescription: (desc: string) => void;

  // Edit view
  setEditAgentTab: (tab: AgentViewTab) => void;

  // Deploy
  setShowDeployModal: (show: boolean) => void;

  // Thread detail
  setSelectedThread: (id: string | null) => void;

  // Multi-workflow
  setWizardWorkflows: (workflows: AgentWorkflow[]) => void;
  selectWorkflow: (id: string | null) => void;
  addWorkflow: (workflow: AgentWorkflow) => void;
  createNewWorkflow: () => void;

  // Deploy + reset
  resetBuilder: () => void;
  deployAgent: () => void;
  showToast: (message: string) => void;
}

function defaultCapabilitiesFromIds(ids: string[]): CanaryProduct[] {
  return CANARY_PRODUCTS.map((p) => ({
    ...p,
    enabled: ids.includes(p.id),
  }));
}

const initialWizardState = {
  wizardCurrentStep: 'profile' as WizardStep,
  wizardTemplate: null as AgentTemplate | null,
  wizardTriggers: [] as AgentTrigger[],
  wizardConnections: [] as Connection[],
  wizardCapabilities: [] as CanaryProduct[],
  wizardGuardrails: [] as string[],
  wizardTone: 'Natural',
  wizardRules: [] as GambitRule[],
  agentName: '',
  agentDescription: '',
  // Profile fields
  wizardResponsibilities: [] as string[],
  wizardBehavioralGuidelines: '',
  wizardGuardrailsText: '',
  wizardAvoidedTopics: [] as string[],
  wizardCommunicationStyle: 'Formal',
  // Connectors
  wizardConnectors: [] as ConnectorConfig[],
  // Multi-workflow
  wizardWorkflows: [] as AgentWorkflow[],
  selectedWorkflowId: null as string | null,
  // Chat
  builderMessages: [] as BuilderMessage[],
  currentWorkflow: null as AgentWorkflow | null,
  currentConnections: [] as Connection[],
  isGenerating: false,
};

const STEP_ORDER: WizardStep[] = ['profile', 'capabilities', 'workflows', 'connectors'];

const TEMPLATE_RESPONSIBILITIES: Record<string, string[]> = {
  'tpl-front-desk': [
    'Respond to guest messages across all enabled channels',
    'Answer hotel FAQ and property questions from knowledge base',
    'Process booking requests and check availability',
    'Handle service requests and create tickets',
    'Offer upsells (room upgrades, early check-in, late checkout)',
    'Process checkout requests and send folio',
    'Escalate to staff when unable to resolve',
  ],
  'tpl-voice-ai': [
    'Answer inbound hotel phone calls',
    'Identify callers and personalize greetings',
    'Answer hotel questions from knowledge base',
    'Look up and confirm reservations',
    'Transfer calls to appropriate departments',
    'Send follow-up SMS after calls',
  ],
  'tpl-sales-events': [
    'Respond to inbound sales and event inquiries via email',
    'Identify event type, dates, headcount, and budget from inquiry details',
    'Check availability of event spaces and room blocks',
    'Draft and send personalized proposals with availability and pricing',
    'Schedule meetings and site visits with prospective clients',
    'Follow up on leads that haven\'t responded',
    'Qualify and route leads to the appropriate sales team member',
    'Flag high-value events for Director of Sales review',
  ],
  'tpl-housekeeping': [
    'Process guest housekeeping service requests',
    'Create tasks in vendor management system',
    'Track task completion and follow up with guests',
    'Route maintenance issues to correct department',
    'Send proactive housekeeping offers during stay',
  ],
  'tpl-no-show': [
    'Send pre-arrival messages to upcoming guests',
    'Encourage mobile pre-check-in completion',
    'Monitor guest engagement with outreach messages',
    'Flag non-responsive guests for front desk attention',
    'Send arrival day reminders and property information',
  ],
  'tpl-email-reservation': [
    'Monitor inbound emails for reservation-related requests',
    'Parse cancellation, modification, and confirmation emails',
    'Validate requests against property cancellation policy',
    'Update reservations in the PMS automatically',
    'Send confirmation emails to guests after processing',
    'Flag exceptions for staff review (non-refundable, disputes, OTA bookings)',
    'Log all actions for audit trail',
  ],
};

const TEMPLATE_GUIDELINES: Record<string, string> = {
  'tpl-front-desk': '• Match channel tone — casual for SMS, structured for email, concise for OTA\n• Always confirm before making reservation changes\n• Route billing disputes to staff — never auto-resolve\n• Match the language the guest writes in\n• Escalate safety or harassment concerns to manager immediately',
  'tpl-voice-ai': '• Keep greetings warm and under 10 seconds\n• Always offer to transfer when the guest asks — don\'t push back more than once\n• Never share guest room numbers or personal info to unverified callers\n• Send follow-up SMS with key details after every resolved call\n• Keep hold time under 30 seconds before offering callback',
  'tpl-sales-events': '• Always greet by name and reference their specific event details\n• Keep responses warm, concise, and professional\n• Push for ACH payments when possible\n• Include a CTA to schedule a meeting or site visit in every response\n• Reference past booking history for returning clients',
  'tpl-housekeeping': '• Always confirm room number before creating any task\n• Route maintenance issues (broken, leaking) to maintenance, not housekeeping\n• Don\'t promise specific completion times — use estimates\n• Never enter a room without guest consent or standard checkout protocol\n• Limit follow-ups to 1 per completed task',
  'tpl-no-show': '• Never send outreach between 10 PM and 8 AM hotel time\n• Maximum 3 outreach messages per reservation\n• Always include opt-out option in messages\n• Don\'t send to OTA reservations managed by the OTA\n• Try alternate channel if first channel gets no engagement',
  'tpl-email-reservation': '• Always verify confirmation number before processing any changes\n• Apply cancellation policy exactly as configured — no manual overrides\n• Log every action with timestamp for audit compliance\n• Route OTA reservations to the OTA portal — do not modify in PMS directly\n• Retry PMS writes once on failure before escalating',
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  currentView: 'dashboard',
  selectedAgentId: null,
  agents: mockAgents,
  editAgentTab: 'overview' as AgentViewTab,
  showDeployModal: false,
  selectedThreadId: null,
  toastMessage: null,
  ...initialWizardState,

  // -- Navigation --
  setView: (view) => set({ currentView: view }),
  selectAgent: (id) => set({ selectedAgentId: id, currentView: 'detail', editAgentTab: 'overview' }),
  goBack: () => set({ currentView: 'dashboard', selectedAgentId: null, showDeployModal: false, selectedThreadId: null, ...initialWizardState }),

  // -- Agent CRUD --
  createAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, { ...agent, id: `agent-${Date.now()}`, createdAt: new Date().toISOString() }],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({ agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),

  deleteAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
      currentView: state.selectedAgentId === id ? 'dashboard' : state.currentView,
    })),

  toggleAgentStatus: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
      ),
    })),

  updateCapabilityInstructions: (agentId, capabilityId, instructions) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId
          ? { ...a, capabilities: a.capabilities.map((cap) => (cap.id === capabilityId ? { ...cap, instructions } : cap)) }
          : a
      ),
    })),

  updateAgentRules: (agentId, rules) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, rules } : a
      ),
    })),

  // -- Wizard step navigation --
  setWizardStep: (step) => set({ wizardCurrentStep: step }),
  nextWizardStep: () => {
    const idx = STEP_ORDER.indexOf(get().wizardCurrentStep);
    if (idx < STEP_ORDER.length - 1) set({ wizardCurrentStep: STEP_ORDER[idx + 1] });
  },
  prevWizardStep: () => {
    const idx = STEP_ORDER.indexOf(get().wizardCurrentStep);
    if (idx > 0) set({ wizardCurrentStep: STEP_ORDER[idx - 1] });
  },

  // -- Wizard data setters --
  setWizardTriggers: (triggers) => set({ wizardTriggers: triggers }),
  setWizardConnections: (connections) => set({ wizardConnections: connections }),
  setWizardCapabilities: (capabilities) => set({ wizardCapabilities: capabilities }),
  setWizardGuardrails: (guardrails) => set({ wizardGuardrails: guardrails }),
  setWizardTone: (tone) => set({ wizardTone: tone }),
  setWizardRules: (rules) => set({ wizardRules: rules }),

  // -- Wizard profile setters --
  setWizardResponsibilities: (responsibilities) => set({ wizardResponsibilities: responsibilities }),
  setWizardBehavioralGuidelines: (guidelines) => set({ wizardBehavioralGuidelines: guidelines }),
  setWizardGuardrailsText: (guardrails) => set({ wizardGuardrailsText: guardrails }),
  setWizardAvoidedTopics: (topics) => set({ wizardAvoidedTopics: topics }),
  setWizardCommunicationStyle: (style) => set({ wizardCommunicationStyle: style }),
  setWizardConnectors: (connectors) => set({ wizardConnectors: connectors }),

  // -- Auto-populate ALL fields from a template --
  setWizardFromTemplate: (template) => {
    set({
      wizardTemplate: template,
      agentName: template.name,
      agentDescription: template.description,
      wizardTriggers: template.defaultTriggers.map((t) => ({ ...t })),
      wizardConnections: template.defaultConnections.map((c) => ({ ...c })),
      wizardCapabilities: defaultCapabilitiesFromIds(template.defaultCapabilities),
      wizardGuardrails: [...template.defaultWorkflow.guardrails],
      wizardTone: template.defaultTone,
      wizardRules: template.defaultRules ? [...template.defaultRules] : [],
      currentWorkflow: template.defaultWorkflow,
      currentConnections: template.defaultConnections,
    });
  },

  // -- Start wizard from template (navigates to wizard view) --
  startFromTemplate: (template) => {
    set({
      wizardCurrentStep: 'profile',
      wizardTemplate: template,
      agentName: template.name,
      agentDescription: template.description,
      wizardTriggers: template.defaultTriggers.map((t) => ({ ...t })),
      wizardConnections: template.defaultConnections.map((c) => ({ ...c })),
      wizardCapabilities: defaultCapabilitiesFromIds(template.defaultCapabilities),
      wizardGuardrails: [...template.defaultWorkflow.guardrails],
      wizardTone: template.defaultTone,
      wizardRules: template.defaultRules ? [...template.defaultRules] : [],
      wizardCommunicationStyle: template.defaultTone,
      wizardResponsibilities: TEMPLATE_RESPONSIBILITIES[template.id] || [],
      wizardBehavioralGuidelines: TEMPLATE_GUIDELINES[template.id] || '',
      wizardGuardrailsText: template.defaultWorkflow.guardrails.map((g) => `• ${g}`).join('\n'),
      wizardAvoidedTopics: template.id === 'tpl-sales-events'
        ? ['Complaints', 'Last Checkout Disputes', 'Legal Questions']
        : [],
      wizardConnectors: mockConnectors.map((c) => ({ ...c })),
      wizardWorkflows: template.id === 'tpl-sales-events'
        ? [template.defaultWorkflow, mockWorkflowColdLead, mockWorkflowContractPrep]
        : [template.defaultWorkflow],
      selectedWorkflowId: null,
      currentWorkflow: null,
      currentConnections: template.defaultConnections,
      builderMessages: [],
      currentView: 'wizard',
      isGenerating: false,
    });
  },

  // -- Start wizard from scratch --
  startFromScratch: () => {
    const emptyCapabilities = CANARY_PRODUCTS.map((p) => ({ ...p, enabled: false }));
    // Create a minimal "scratch" template marker so the wizard renders
    const scratchTemplate: AgentTemplate = {
      id: 'tpl-scratch',
      name: 'Custom Agent',
      role: 'Custom',
      description: '',
      icon: 'mdiStarOutline',
      tier: 'included',
      isLocked: false,
      defaultTriggers: [],
      defaultConnections: [],
      defaultCapabilities: [],
      defaultWorkflow: { trigger: '', steps: [], guardrails: [] },
      defaultTone: '',
    };
    set({
      ...initialWizardState,
      wizardTemplate: scratchTemplate,
      agentName: '',
      agentDescription: '',
      wizardCapabilities: emptyCapabilities,
      wizardConnections: availableConnections.map((c) => ({ ...c })),
      wizardConnectors: mockConnectors.map((c) => ({ ...c, status: 'setup-required' as const })),
      wizardWorkflows: [],
      wizardResponsibilities: [],
      wizardBehavioralGuidelines: '',
      wizardGuardrailsText: '',
      wizardAvoidedTopics: [],
      wizardCommunicationStyle: '',
      builderMessages: [],
      currentView: 'wizard',
    });
  },

  // -- Chat actions --
  addBuilderMessage: (message) =>
    set((state) => ({
      builderMessages: [
        ...state.builderMessages,
        { ...message, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date() },
      ],
    })),

  setBuilderWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  setBuilderConnections: (connections) => set({ currentConnections: connections }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  setAgentName: (name) => set({ agentName: name }),
  setAgentDescription: (desc) => set({ agentDescription: desc }),
  // -- Edit view --
  setEditAgentTab: (tab) => set({ editAgentTab: tab }),

  // -- Deploy modal --
  setShowDeployModal: (show) => set({ showDeployModal: show }),

  // -- Thread detail --
  setSelectedThread: (id) => set({ selectedThreadId: id }),

  // -- Multi-workflow --
  setWizardWorkflows: (workflows) => set({ wizardWorkflows: workflows }),
  selectWorkflow: (id) => {
    if (id === null) {
      set({ selectedWorkflowId: null, currentWorkflow: null, builderMessages: [] });
      return;
    }
    const wf = get().wizardWorkflows.find((w) => w.id === id);
    if (wf) set({ selectedWorkflowId: id, currentWorkflow: wf, builderMessages: [] });
  },
  addWorkflow: (workflow) => set((s) => ({ wizardWorkflows: [...s.wizardWorkflows, workflow] })),
  createNewWorkflow: () => {
    const newWf: AgentWorkflow = {
      id: `wf-${Date.now()}`,
      name: '',
      description: '',
      trigger: '',
      steps: [],
      guardrails: [],
    };
    set((s) => ({
      wizardWorkflows: [...s.wizardWorkflows, newWf],
      selectedWorkflowId: newWf.id,
      currentWorkflow: newWf,
      builderMessages: [],
    }));
  },

  resetBuilder: () => set(initialWizardState),

  // -- Deploy agent from wizard data --
  deployAgent: () => {
    const state = get();
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: state.agentName || 'New Agent',
      role: state.wizardTemplate?.role ?? 'Custom',
      description: state.agentDescription || '',
      status: 'active',
      triggers: state.wizardTriggers,
      connections: state.wizardConnections,
      capabilities: state.wizardCapabilities,
      workflow: state.currentWorkflow ?? { trigger: 'Manual', steps: [], guardrails: state.wizardGuardrails },
      tone: state.wizardTone,
      metrics: { totalConversations: 0, resolutionRate: 0, avgResponseTime: '\u2014', satisfactionScore: 0 },
      recentActivity: [],
      createdAt: new Date().toISOString(),
      rules: state.wizardRules,
    };
    set((s) => ({
      agents: [...s.agents, newAgent],
      currentView: 'dashboard',
      selectedAgentId: null,
      ...initialWizardState,
    }));
    get().showToast(`"${newAgent.name}" deployed successfully`);
  },

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
}));
