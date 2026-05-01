'use client';

/**
 * AtomRow — single-line click-to-select row for one Global Config atom.
 *
 * Phase 6 split-pane: row is purely about scan + quick toggles + selection.
 * Deep editing (label, helper, PMS tag, conditions) happens in AtomDetailPane
 * (right pane). Click anywhere on the row to select; quick toggles and the
 * delete button stop propagation.
 */

import React from 'react';
import Icon from '@mdi/react';
import {
  mdiApplicationOutline,
  mdiCellphone,
  mdiTabletCellphone,
  mdiMonitor,
  mdiTextBoxOutline,
  mdiPuzzleOutline,
  mdiTuneVariant,
  mdiDelete,
  mdiAlertOutline,
  mdiShieldCheckOutline,
  mdiCardAccountDetailsOutline,
  mdiCameraOutline,
  mdiCreditCardOutline,
  mdiSafeSquareOutline,
  mdiStarOutline,
  mdiCheckCircleOutline,
} from '@mdi/js';
import {
  CanarySwitch,
  CanaryTag,
  TagSize,
  TagColor,
  colors,
} from '@canary-ui/components';

import type {
  Atom,
  InputAtom,
  PresetAtom,
  CopyBlockAtom,
  PresetAtomType,
  Surface,
} from '@/lib/products/check-in-flows/types';
import { resolveText } from '@/lib/products/check-in-flows/types';
import { getFieldTypeMeta } from '@/lib/products/check-in-flows/field-types';
import { ELEMENT_TAGS } from '@/lib/products/check-in-flows/element-tags';
import { useCheckInFlowsStore } from '@/lib/products/check-in-flows/store';

interface Props {
  atom: Atom;
  onUpdate: (updates: Partial<Atom>) => void;
  onRemove?: () => void;
}

export function AtomRow({ atom, onUpdate, onRemove }: Props) {
  const selectedAtomId = useCheckInFlowsStore((s) => s.selectedAtomId);
  const selectAtom = useCheckInFlowsStore((s) => s.selectAtom);
  const isSelected = selectedAtomId === atom.id;

  const display = describeAtom(atom);
  const conditionCount = atom.conditions?.length ?? 0;
  const isInput = atom.kind === 'input';
  const required = isInput && (atom as InputAtom).required;
  const hiddenRequired =
    required && !Object.values(atom.deviceVisibility).some((v) => v);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div>
      <div
        onClick={() => selectAtom(atom.id)}
        className="rounded-md cursor-pointer transition-colors group"
        style={{
          backgroundColor: isSelected ? colors.colorBlueDark5 : '#FFF',
          border: `1px solid ${isSelected ? colors.colorBlueDark1 : colors.colorBlack7}`,
          paddingLeft: 0,
        }}
      >
        <div className="flex items-center gap-3 px-3 py-2 min-h-[44px]">
          {/* Type icon */}
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F4F4F5' }}
          >
            <Icon path={display.icon} size={0.65} color="#555" />
          </div>

          {/* Name + tag */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="text-[13px] font-semibold truncate"
              style={{ color: colors.colorBlack2 }}
            >
              {display.title}
            </span>
            {display.subtitle && (
              <CanaryTag
                label={display.subtitle}
                color={TagColor.DEFAULT}
                size={TagSize.COMPACT}
              />
            )}
            {display.kindLabel && (
              <CanaryTag
                label={display.kindLabel}
                color={TagColor.DEFAULT}
                size={TagSize.COMPACT}
              />
            )}
          </div>

          {/* Required (input atoms only) */}
          {isInput && (
            <div onClick={stop} className="flex items-center gap-1.5 shrink-0">
              <CanarySwitch
                checked={(atom as InputAtom).required}
                onChange={(v) => onUpdate({ required: v } as Partial<Atom>)}
              />
              <span
                className="text-[11px]"
                style={{ color: colors.colorBlack4 }}
              >
                Req
              </span>
            </div>
          )}

          {/* Device pills */}
          <div onClick={stop} className="flex items-center gap-1 shrink-0">
            {(['mobile-web', 'mobile-app', 'tablet-reg', 'kiosk'] as Surface[]).map((s) => {
              const on = atom.deviceVisibility[s];
              const surfaceMeta = SURFACE_META[s];
              return (
                <button
                  key={s}
                  onClick={() =>
                    onUpdate({
                      deviceVisibility: {
                        ...atom.deviceVisibility,
                        [s]: !on,
                      },
                    } as Partial<Atom>)
                  }
                  className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors"
                  style={{
                    backgroundColor: on ? colors.colorBlueDark5 : 'transparent',
                    color: on ? colors.colorBlueDark1 : colors.colorBlack5,
                    border: `1px solid ${on ? colors.colorBlueDark4 : colors.colorBlack7}`,
                  }}
                  title={`${surfaceMeta.label}: ${on ? 'visible' : 'hidden'}`}
                >
                  <Icon
                    path={surfaceMeta.icon}
                    size={0.55}
                    color={on ? colors.colorBlueDark1 : colors.colorBlack5}
                  />
                </button>
              );
            })}
          </div>

          {/* Conditions badge — read-only on row, edit happens in right pane */}
          <div className="shrink-0 min-w-[60px] text-right">
            {conditionCount > 0 ? (
              <span
                className="inline-flex items-center gap-1 px-1.5 h-6 rounded text-[11px] font-semibold"
                style={{
                  backgroundColor: colors.colorBlueDark5,
                  color: colors.colorBlueDark1,
                }}
                title={`${conditionCount} visibility condition${conditionCount === 1 ? '' : 's'} — click row to edit`}
              >
                <Icon path={mdiTuneVariant} size={0.5} />
                {conditionCount}
              </span>
            ) : (
              <span
                className="text-[11px]"
                style={{ color: colors.colorBlack6 }}
              >
                —
              </span>
            )}
          </div>

          {/* Delete (hover-revealed) */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded flex items-center justify-center transition-all"
              style={{ color: colors.colorBlack5 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.danger;
                e.currentTarget.style.backgroundColor = '#FDECEF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.colorBlack5;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Remove component"
            >
              <Icon path={mdiDelete} size={0.6} />
            </button>
          )}
        </div>
      </div>

      {/* Required-but-not-shown warning (Phase 4) */}
      {hiddenRequired && (
        <div
          className="px-3 py-1.5 mt-1 flex items-center gap-2 rounded-md text-[11px]"
          style={{
            backgroundColor: '#FEF3C7',
            border: `1px solid #FCD34D`,
            color: '#92400E',
          }}
        >
          <Icon path={mdiAlertOutline} size={0.55} color="#92400E" />
          Required but hidden on all surfaces — guests can't satisfy this.
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────

const SURFACE_META: Record<Surface, { icon: string; label: string }> = {
  'mobile-web': { icon: mdiCellphone, label: 'Mobile Check-In' },
  'mobile-app': { icon: mdiApplicationOutline, label: 'Mobile SDK' },
  'tablet-reg': { icon: mdiTabletCellphone, label: 'Tablet Registration' },
  'kiosk': { icon: mdiMonitor, label: 'Kiosk' },
};

export function describeAtom(atom: Atom): {
  icon: string;
  title: string;
  subtitle?: string;
  kindLabel?: string;
} {
  if (atom.kind === 'input') {
    const meta = getFieldTypeMeta(atom.fieldType);
    const tagMeta = atom.pmsTag ? ELEMENT_TAGS.find((t) => t.id === atom.pmsTag) : null;
    return {
      icon: meta.icon,
      title: resolveText(atom.label) || meta.displayName,
      subtitle: tagMeta?.pmsField,
    };
  }
  if (atom.kind === 'preset') {
    return {
      icon: getPresetIcon(atom.presetType),
      title: resolveText(atom.label),
      kindLabel: 'PRESET',
    };
  }
  return {
    icon: mdiTextBoxOutline,
    title: atom.name,
    kindLabel: 'COPY',
  };
}

function getPresetIcon(presetType: PresetAtomType): string {
  switch (presetType) {
    case 'id-consent': return mdiShieldCheckOutline;
    case 'id-photo-front':
    case 'id-photo-back':
    case 'id-selfie':
      return mdiCameraOutline;
    case 'credit-card-form': return mdiCreditCardOutline;
    case 'deposit-collection': return mdiSafeSquareOutline;
    case 'loyalty-welcome': return mdiStarOutline;
    case 'completion': return mdiCheckCircleOutline;
    default: return mdiPuzzleOutline;
  }
}
