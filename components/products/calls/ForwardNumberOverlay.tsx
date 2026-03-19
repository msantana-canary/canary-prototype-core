/**
 * ForwardNumberOverlay Component
 *
 * Sliding overlay for adding or editing forward number rules.
 * Follows the CampaignOverlay pattern with slide-in animation.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CanaryButton,
  CanaryInput,
  CanaryInputPhone,
  CanaryInputMultiple,
  CanaryTextArea,
  CanarySelect,
  CanaryRadio,
  CanarySwitch,
  ButtonType,
  InputSize,
  colors,
} from '@canary-ui/components';
import { mdiMinus, mdiArrowLeft, mdiTrashCanOutline, mdiPlus, mdiDrag } from '@mdi/js';
import Icon from '@mdi/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallsSettingsStore } from '@/lib/products/calls/store';
import {
  departmentOptions,
  departmentDescriptions,
  getDepartmentLabel,
} from '@/lib/products/calls/mock-data';
import type { ForwardNumberRule, AdditionalQuestion } from '@/lib/products/calls/types';

// Toggle to reveal future-state features (not yet in production)
// Set to true when these features ship: scheduled redirect, summary emails, keywords, when-to-transfer
const SHOW_FUTURE_FEATURES = false;

interface ForwardNumberOverlayProps {
  isOpen: boolean;
  editingRuleId: string | null;
  onClose: () => void;
}

// Sortable Question Item Component
interface SortableQuestionItemProps {
  question: AdditionalQuestion;
  index: number;
  additionalQuestions: AdditionalQuestion[];
  setAdditionalQuestions: (questions: AdditionalQuestion[]) => void;
  isLast: boolean;
}

function SortableQuestionItem({
  question,
  index,
  additionalQuestions,
  setAdditionalQuestions,
  isLast,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderBottom: !isLast ? `1px solid ${colors.colorBlack6}` : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col">
      {/* Question Row */}
      <div
        className="flex items-center gap-3 p-4"
        style={{ backgroundColor: colors.colorWhite }}
      >
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing"
          style={{ color: colors.colorBlack4 }}
          {...attributes}
          {...listeners}
        >
          <Icon path={mdiDrag} size={0.833} />
        </div>

        {/* Question Input */}
        <div className="flex-1">
          <CanaryInput
            value={question.question ?? ''}
            onChange={(e) => {
              const updated = additionalQuestions.map((q, i) =>
                i === index ? { ...q, question: e.target.value } : q
              );
              setAdditionalQuestions(updated);
            }}
            placeholder="e.g. What type of cuisine are you interested in?"
            size={InputSize.NORMAL}
          />
        </div>

        {/* Field Type Dropdown */}
        <div style={{ width: '200px' }}>
          <CanarySelect
            value={question.type}
            onChange={(e) => {
              const newType = e.target.value as 'freeform' | 'predetermined';
              const updated = additionalQuestions.map((q, i) =>
                i === index
                  ? {
                      ...q,
                      type: newType,
                      options:
                        newType === 'predetermined'
                          ? q.options || ['']
                          : undefined,
                    }
                  : q
              );
              setAdditionalQuestions(updated);
            }}
            options={[
              { value: 'freeform', label: 'Open response' },
              { value: 'predetermined', label: 'Answer choices' },
            ]}
            size={InputSize.NORMAL}
          />
        </div>

        {/* Delete Button */}
        <CanaryButton
          type={ButtonType.ICON_SECONDARY}
          icon={<Icon path={mdiTrashCanOutline} size={0.833} color={colors.colorBlack3} />}
          onClick={() => {
            setAdditionalQuestions(
              additionalQuestions.filter((_, i) => i !== index)
            );
          }}
        />
      </div>

      {/* Predetermined Options (if type is predetermined) */}
      {question.type === 'predetermined' && (
        <div
          className="pb-4"
          style={{
            paddingLeft: '80px',
            paddingRight: '16px',
          }}
        >
          <div className="flex flex-col gap-4">
            {(question.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <div className="flex-1">
                  <CanaryInput
                    value={option ?? ''}
                    onChange={(e) => {
                      const updatedOptions = [...(question.options || [])];
                      updatedOptions[optionIndex] = e.target.value;
                      const updated = additionalQuestions.map((q, i) =>
                        i === index ? { ...q, options: updatedOptions } : q
                      );
                      setAdditionalQuestions(updated);
                    }}
                    placeholder={`Choice ${optionIndex + 1}`}
                    size={InputSize.NORMAL}
                  />
                </div>
                <CanaryButton
                  type={ButtonType.ICON_SECONDARY}
                  icon={<Icon path={mdiTrashCanOutline} size={0.833} color={colors.colorBlack3} />}
                  onClick={() => {
                    const updatedOptions = (question.options || []).filter(
                      (_, i) => i !== optionIndex
                    );
                    const updated = additionalQuestions.map((q, i) =>
                      i === index ? { ...q, options: updatedOptions } : q
                    );
                    setAdditionalQuestions(updated);
                  }}
                />
              </div>
            ))}
            {/* Add Option Button */}
            <CanaryButton
              type={ButtonType.TEXT}
              onClick={() => {
                const updatedOptions = [...(question.options || []), ''];
                const updated = additionalQuestions.map((q, i) =>
                  i === index ? { ...q, options: updatedOptions } : q
                );
                setAdditionalQuestions(updated);
              }}
            >
              <span className="flex items-center gap-1">
                <Icon path={mdiPlus} size={0.667} />
                Add option
              </span>
            </CanaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

export function ForwardNumberOverlay({
  isOpen,
  editingRuleId,
  onClose,
}: ForwardNumberOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const {
    forwardNumberRules,
    addForwardNumberRule,
    updateForwardNumberRule,
    getForwardNumberRuleById,
  } = useCallsSettingsStore();

  const isEditMode = !!editingRuleId;
  const existingRule = editingRuleId ? getForwardNumberRuleById(editingRuleId) : null;

  // Form state
  const [transferDestination, setTransferDestination] = useState<'default' | 'custom'>('default');
  const [selectedDepartment, setSelectedDepartment] = useState('reservations');
  const [customName, setCustomName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [whenToTransfer, setWhenToTransfer] = useState('');
  const [additionalQuestions, setAdditionalQuestions] = useState<AdditionalQuestion[]>([]);
  const [fallbackBehavior, setFallbackBehavior] = useState<'route' | 'message'>('route');
  const [fallbackDepartment, setFallbackDepartment] = useState('front-desk');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [summaryEmails, setSummaryEmails] = useState<string[]>([]);

  // After-hours handling state
  const [afterHoursEnabled, setAfterHoursEnabled] = useState(false);
  const [fromTime, setFromTime] = useState('21:00');
  const [toTime, setToTime] = useState('09:00');

  // Generate time options (30-minute increments)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const value = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
        options.push({ value, label });
      }
    }
    return options;
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering questions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = additionalQuestions.findIndex((q) => q.id === active.id);
      const newIndex = additionalQuestions.findIndex((q) => q.id === over.id);
      setAdditionalQuestions(arrayMove(additionalQuestions, oldIndex, newIndex));
    }
  };

  // Validation errors
  const [errors, setErrors] = useState({
    phoneNumber: false,
    customName: false,
    fallbackMessage: false,
  });

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (existingRule) {
        // Edit mode - populate form with existing data
        setTransferDestination(existingRule.type);
        setPhoneNumber(existingRule.phoneNumber);

        if (existingRule.type === 'default') {
          const dept = departmentOptions.find(
            (d) => d.label === existingRule.departmentName
          );
          setSelectedDepartment(dept?.value || 'reservations');
        } else {
          setCustomName(existingRule.departmentName);
          setWhenToTransfer(existingRule.whenToTransfer || '');
          setKeywords(existingRule.keywords || []);
        }

        setFallbackBehavior(existingRule.fallbackType);
        if (existingRule.fallbackType === 'route') {
          setFallbackDepartment(existingRule.fallbackDepartment || 'front-desk');
        } else {
          setFallbackMessage(existingRule.fallbackMessage || '');
        }

        // Set additionalQuestions
        setAdditionalQuestions(existingRule.additionalQuestions || []);
        setSummaryEmails(existingRule.summaryEmails || []);
        setAfterHoursEnabled(existingRule.afterHoursEnabled || false);
        setFromTime(existingRule.afterHoursFrom || '21:00');
        setToTime(existingRule.afterHoursTo || '09:00');
      } else {
        // New mode - reset form
        setTransferDestination('default');
        setSelectedDepartment('reservations');
        setCustomName('');
        setKeywords([]);
        setKeywordInput('');
        setWhenToTransfer('');
        setAdditionalQuestions([]);
        setFallbackBehavior('route');
        setFallbackDepartment('front-desk');
        setFallbackMessage('');
        setPhoneNumber('');
        setSummaryEmails([]);
      }

      setErrors({
        phoneNumber: false,
        customName: false,
        fallbackMessage: false,
      });
    }
  }, [isOpen, editingRuleId, existingRule]);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setAnimateIn(true), 10);
    } else if (shouldRender) {
      setAnimateIn(false);
      setTimeout(() => setShouldRender(false), 500);
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // Keyword input handling
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors = {
      phoneNumber: !phoneNumber.trim(),
      customName: transferDestination === 'custom' && !customName.trim(),
      fallbackMessage:
        fallbackBehavior === 'message' && !fallbackMessage.trim(),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Build department name and description
    let deptName = '';
    let deptDescription = '';

    if (transferDestination === 'default') {
      deptName = getDepartmentLabel(selectedDepartment);
      deptDescription = departmentDescriptions[selectedDepartment];
    } else {
      deptName = customName;
      // For custom, use whenToTransfer as description
      deptDescription = whenToTransfer;
    }

    const ruleData: Omit<ForwardNumberRule, 'id'> = {
      type: transferDestination,
      departmentName: deptName,
      description: deptDescription,
      phoneNumber,
      keywords: transferDestination === 'custom' && keywords.length > 0 ? keywords : undefined,
      whenToTransfer: transferDestination === 'custom' && whenToTransfer.trim() ? whenToTransfer : undefined,
      additionalQuestions: additionalQuestions.filter(q => q.question.trim()).length > 0
        ? additionalQuestions.filter(q => q.question.trim())
        : undefined,
      fallbackType: fallbackBehavior,
      fallbackDepartment:
        fallbackBehavior === 'route' ? fallbackDepartment : undefined,
      fallbackMessage:
        fallbackBehavior === 'message' ? fallbackMessage : undefined,
      summaryEmails: summaryEmails.length > 0 ? summaryEmails : undefined,
      afterHoursEnabled: afterHoursEnabled || undefined,
      afterHoursFrom: afterHoursEnabled ? fromTime : undefined,
      afterHoursTo: afterHoursEnabled ? toTime : undefined,
    };

    if (isEditMode && editingRuleId) {
      updateForwardNumberRule(editingRuleId, ruleData);
    } else {
      addForwardNumberRule(ruleData);
    }

    handleClose();
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col overflow-hidden shadow-2xl transition-transform duration-500 ease-out ${
        animateIn ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ backgroundColor: colors.colorBlack7 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          backgroundColor: colors.colorWhite,
          borderBottom: `1px solid ${colors.colorBlack6}`,
          padding: '16px 24px',
          height: '72px',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex items-center" style={{ gap: '16px' }}>
          <CanaryButton
            type={ButtonType.ICON_SECONDARY}
            icon={<Icon path={mdiArrowLeft} size={0.85} />}
            onClick={handleClose}
          />
          <h1
            className="font-['Roboto',sans-serif] font-medium"
            style={{
              fontSize: '18px',
              lineHeight: '28px',
              color: colors.colorBlack1,
              margin: 0,
            }}
          >
            {isEditMode ? 'Edit forward number' : 'New forward number'}
          </h1>
        </div>
        <CanaryButton onClick={handleSave}>Save</CanaryButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
        <div className="flex flex-col gap-4 pb-6">
          {/* Select a Transfer Destination */}
          <div className="rounded-lg bg-white p-6">
            <h2
              className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Select a Transfer Destination
            </h2>
            <p
              className="font-['Roboto',sans-serif] text-[14px] leading-[20px] mb-4"
              style={{ color: colors.colorBlack1 }}
            >
              Choose where this call should be transferred. You can select from Canary&apos;s
              built-in departments (like Front Desk or Reservations), or create a custom
              destination that better fits your hotel&apos;s unique workflows.
            </p>

            {/* Destination Type Radio */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-fit">
                <CanaryRadio
                  name="destinationType"
                  value="default"
                  checked={transferDestination === 'default'}
                  onChange={() => setTransferDestination('default')}
                  label="Default Department"
                  size="normal"
                />
              </div>
              <div className="w-fit">
                <CanaryRadio
                  name="destinationType"
                  value="custom"
                  checked={transferDestination === 'custom'}
                  onChange={() => setTransferDestination('custom')}
                  label="Custom Destination"
                  size="normal"
                />
              </div>
            </div>

            {/* Department Fields */}
            <div className="flex flex-col gap-4">
              {transferDestination === 'default' ? (
                <>
                  <CanarySelect
                    label="Department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    options={departmentOptions}
                    size={InputSize.NORMAL}
                  />

                  <div>
                    <label
                      className="font-['Roboto',sans-serif] block mb-1"
                      style={{
                        fontSize: '12px',
                        lineHeight: '18px',
                        color: colors.colorBlack1,
                      }}
                    >
                      Description
                    </label>
                    <p
                      className="font-['Roboto',sans-serif]"
                      style={{
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: colors.colorBlack1,
                        margin: 0,
                      }}
                    >
                      {departmentDescriptions[selectedDepartment]}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CanaryInput
                    label="Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Wedding Coordinator, Group Sales, VIP Services"
                    size={InputSize.NORMAL}
                    error={
                      errors.customName
                        ? 'Please fill in this required field'
                        : undefined
                    }
                  />
                </>
              )}

              {/* Phone Number */}
              <CanaryInputPhone
                label="Destination number"
                size={InputSize.NORMAL}
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                placeholder="+1 201-555-0123"
                error={
                  errors.phoneNumber ? 'Please fill in this required field' : undefined
                }
              />

              {SHOW_FUTURE_FEATURES && (
              <CanaryInputMultiple
                label="Email for call summaries"
                values={summaryEmails}
                onChange={(values) => setSummaryEmails(values)}
                placeholder="Type email and press Enter"
                size={InputSize.NORMAL}
              />
              )}

              {/* When to Transfer - future state, only for custom */}
              {SHOW_FUTURE_FEATURES && transferDestination === 'custom' && (
                <CanaryTextArea
                  label="When to Transfer"
                  value={whenToTransfer}
                  onChange={(e) => setWhenToTransfer(e.target.value)}
                  placeholder='Describe the type of situation or guest request that should trigger this rule. For example: "Guest wants to modify, change, or update their existing booking or reservation." Use natural language — our system will interpret guest intent based on how they describe their needs.'
                  rows={3}
                  size={InputSize.NORMAL}
                />
              )}
            </div>
          </div>

          {/* Additional Questions */}
          <div className="rounded-lg bg-white p-6">
            {/* Header with Add button */}
            <div className="flex items-start justify-between mb-4 gap-6">
              <div className="flex-1">
                <h2
                  className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Additional Questions
                </h2>
                <p
                  className="font-['Roboto',sans-serif] text-[14px] leading-[20px] mt-1"
                  style={{ color: colors.colorBlack1 }}
                >
                  Define questions the AI should ask the guest before escalating. The
                  responses will be compiled into a summary and sent to your team via email
                  or SMS, so they have full context before following up.
                </p>
              </div>
              <CanaryButton
                type={ButtonType.ICON_SECONDARY}
                icon={<Icon path={mdiPlus} size={0.833} color={colors.colorBlueDark1} />}
                onClick={() => {
                  const newQuestion: AdditionalQuestion = {
                    id: `q-${Date.now()}`,
                    question: '',
                    type: 'freeform',
                  };
                  setAdditionalQuestions([...additionalQuestions, newQuestion]);
                }}
              />
            </div>

            {/* Questions List */}
            {additionalQuestions.length === 0 ? (
              <div
                className="text-center py-8"
                style={{
                  color: colors.colorBlack3,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                }}
              >
                No questions added yet. Click the + button to create one.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={additionalQuestions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${colors.colorBlack6}` }}
                  >
                    {additionalQuestions.map((question, index) => (
                      <SortableQuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        additionalQuestions={additionalQuestions}
                        setAdditionalQuestions={setAdditionalQuestions}
                        isLast={index === additionalQuestions.length - 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Scheduled Redirect — future state */}
          {SHOW_FUTURE_FEATURES && <div className="rounded-lg bg-white p-6">
            {/* Header with toggle */}
            <div className="flex justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2
                  className="font-['Roboto',sans-serif] font-medium text-[18px] leading-[28px]"
                  style={{ color: colors.colorBlack1 }}
                >
                  Scheduled Redirect
                </h2>
                <p
                  className="font-['Roboto',sans-serif] text-[14px] leading-[20px] mt-1"
                  style={{ color: colors.colorBlack1 }}
                >
                  Automatically redirect calls during specific hours, such as when
                  this department is closed or unavailable. Enable to define a time window
                  (e.g., 9 PM to 9 AM), then choose to either route calls to a backup
                  department or have Voice AI deliver a custom message to the guest.
                </p>
              </div>
              <div className="flex-shrink-0 pt-1">
                <CanarySwitch
                  checked={afterHoursEnabled}
                  onChange={() => setAfterHoursEnabled(!afterHoursEnabled)}
                />
              </div>
            </div>

            {/* Conditional content when enabled */}
            {afterHoursEnabled && (
              <>
                {/* Time Range Selectors */}
                <div className="flex items-end gap-3 mb-4">
                  <div className="flex-1">
                    <CanarySelect
                      label="From"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      options={timeOptions}
                      size={InputSize.NORMAL}
                    />
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ height: '44px', paddingBottom: '2px' }}
                  >
                    <Icon path={mdiMinus} size={0.833} color={colors.colorBlack3} />
                  </div>
                  <div className="flex-1">
                    <CanarySelect
                      label="To"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      options={timeOptions}
                      size={InputSize.NORMAL}
                    />
                  </div>
                </div>

                {/* Fallback Type Radio */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-fit">
                    <CanaryRadio
                      name="fallbackType"
                      value="route"
                      checked={fallbackBehavior === 'route'}
                      onChange={() => setFallbackBehavior('route')}
                      label="Route to Another Department"
                      size="normal"
                    />
                  </div>
                  <div className="w-fit">
                    <CanaryRadio
                      name="fallbackType"
                      value="message"
                      checked={fallbackBehavior === 'message'}
                      onChange={() => setFallbackBehavior('message')}
                      label="Use a Voice AI Message"
                      size="normal"
                    />
                  </div>
                </div>

                {/* Fallback Fields */}
                {fallbackBehavior === 'route' ? (
                  <CanarySelect
                    label="Department"
                    value={fallbackDepartment}
                    onChange={(e) => setFallbackDepartment(e.target.value)}
                    options={departmentOptions}
                    size={InputSize.NORMAL}
                  />
                ) : (
                  <CanaryTextArea
                    label="Voice Message Style"
                    value={fallbackMessage}
                    onChange={(e) => setFallbackMessage(e.target.value)}
                    placeholder="e.g. 'Thanks for calling. The department is currently unavailable. Please contact the front desk or try again during regular business hours.'"
                    rows={3}
                    size={InputSize.NORMAL}
                    error={
                      errors.fallbackMessage
                        ? 'Please fill in this required field'
                        : undefined
                    }
                  />
                )}
              </>
            )}
          </div>}
        </div>
      </div>
    </div>
  );
}
