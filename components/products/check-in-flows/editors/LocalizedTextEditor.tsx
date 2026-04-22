'use client';

/**
 * LocalizedTextEditor
 *
 * Multi-language text input: one tab per language from the property,
 * single-line input or multi-line textarea. Used by preset editors
 * (id-consent, compliance, loyalty-welcome, completion, etc.) for
 * heading/body/CTA-type fields.
 */

import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTranslate } from '@mdi/js';
import { CanaryInput, CanaryTextArea, InputSize, colors } from '@canary-ui/components';
import type { LocalizedText } from '@/lib/products/check-in-flows/types';

interface Props {
  label: string;
  hint?: string;
  value: LocalizedText | undefined;
  onChange: (next: LocalizedText) => void;
  languages: string[];
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  ms: 'Bahasa Melayu',
};

export function LocalizedTextEditor({
  label,
  hint,
  value,
  onChange,
  languages,
  multiline = false,
  rows = 4,
  disabled = false,
  placeholder,
}: Props) {
  const [activeLang, setActiveLang] = useState(languages[0]);
  const current = value?.[activeLang] ?? '';

  const setLang = (lang: string, text: string) => {
    onChange({ ...(value ?? {}), [lang]: text });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-baseline gap-2">
          <label className="text-[12px] font-semibold text-[#2B2B2B]">{label}</label>
          {hint && <span className="text-[11px] text-[#888]">{hint}</span>}
        </div>
        {languages.length > 1 && (
          <div className="flex items-center gap-1 text-[11px] text-[#888]">
            <Icon path={mdiTranslate} size={0.55} color="#AAA" />
            {languages.length} languages
          </div>
        )}
      </div>

      {languages.length > 1 && (
        <div className="flex items-center gap-0.5 mb-2 -mx-0.5">
          {languages.map((lang) => {
            const isActive = lang === activeLang;
            const hasValue = Boolean(value?.[lang]?.trim());
            return (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 h-7 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-white text-[#2B2B2B] shadow-sm border'
                    : 'text-[#888] hover:text-[#2B2B2B] border border-transparent'
                }`}
                style={isActive ? { borderColor: colors.colorBlueDark4 } : undefined}
              >
                <span>{lang.toUpperCase()}</span>
                <span className={`text-[10px] ${hasValue ? 'opacity-60' : 'text-[#C00] opacity-100'}`}>
                  {hasValue ? '' : '·'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {multiline ? (
        <CanaryTextArea
          value={current}
          placeholder={placeholder ?? `${LANG_LABELS[activeLang] ?? activeLang}…`}
          onChange={(e) => setLang(activeLang, e.target.value)}
          isDisabled={disabled}
          rows={rows}
        />
      ) : (
        <CanaryInput
          size={InputSize.NORMAL}
          value={current}
          placeholder={placeholder ?? `${LANG_LABELS[activeLang] ?? activeLang}…`}
          onChange={(e) => setLang(activeLang, e.target.value)}
          isDisabled={disabled}
        />
      )}
    </div>
  );
}
