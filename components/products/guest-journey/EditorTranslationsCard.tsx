'use client';

/**
 * EditorTranslationsCard
 *
 * Translations row: "Translations" label + help icon, language dropdown on the right.
 * Matches Figma: node 1:10159 — single row, 72px height, centered vertically.
 */

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiHelpCircleOutline } from '@mdi/js';
import { CanarySelect, InputSize } from '@canary-ui/components';
import { GuestJourneyMessage } from '@/lib/products/guest-journey/types';

interface EditorTranslationsCardProps {
  message: GuestJourneyMessage;
}

const LANG_MAP: Record<string, string> = {
  en: 'English (EN) - Default',
  es: 'Español (ES)',
  fr: 'Français (FR)',
  de: 'Deutsch (DE)',
  pt: 'Português (PT)',
};

export function EditorTranslationsCard({ message }: EditorTranslationsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex items-center justify-between"
      style={{
        backgroundColor: '#FFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Left: label + help icon */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 500, color: '#000', margin: 0 }}>
          Translations
        </h3>
        <div
          className="relative inline-flex"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Icon path={mdiHelpCircleOutline} size={0.85} color="#666" style={{ width: 20, height: 20 }} />
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                left: 28,
                top: -8,
                width: 260,
                fontSize: 14,
                lineHeight: '20px',
                color: '#333',
                backgroundColor: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 4,
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              Manage translations for this message. Each language requires its own content for each channel.
            </div>
          )}
        </div>
      </div>

      {/* Right: language dropdown */}
      <div style={{ width: 195 }}>
        <CanarySelect
          size={InputSize.NORMAL}
          value="en"
          options={message.supportedLanguages.map((lang) => ({
            value: lang,
            label: LANG_MAP[lang] || lang,
          }))}
          onChange={() => {}}
        />
      </div>
    </div>
  );
}
