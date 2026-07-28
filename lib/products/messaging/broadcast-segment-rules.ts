/**
 * Conversions between broadcast filter criteria and guest-journey Segment rules.
 *
 * NOTE — deliberate duplication. `FilterGuestsModal` (the CLASSIC variant) holds
 * its own private copies of these two functions. Classic is the "before" side of
 * a live A/B and must stay byte-identical, so it is not refactored to import
 * from here. When the A/B resolves, delete the losing variant and make the
 * winner the sole consumer of this module.
 */

import {
  BroadcastFilterCriteria,
  LoyaltyTier,
} from './broadcast-types';
import { emptyFilterCriteria } from './broadcast-store';
import { Segment, SegmentRule } from '@/lib/products/guest-journey/types';

const TIER_FROM_LABEL: Record<string, LoyaltyTier> = {
  Diamond: 'diamond-elite',
  Platinum: 'platinum-elite',
  Gold: 'gold-elite',
  Silver: 'silver-elite',
  'Club Member': 'club-member',
  'Non-member': 'non-member',
};

const TIER_TO_LABEL: Record<LoyaltyTier, string> = {
  'non-member': 'Non-member',
  'club-member': 'Club Member',
  'silver-elite': 'Silver',
  'gold-elite': 'Gold',
  'platinum-elite': 'Platinum',
  'diamond-elite': 'Diamond',
};

/** Resolve a segment's rules into broadcast filter criteria. */
export function segmentToCriteria(segment: Segment): BroadcastFilterCriteria {
  const criteria: BroadcastFilterCriteria = { ...emptyFilterCriteria };

  for (const rule of segment.rules) {
    switch (rule.guestProperty) {
      case 'Loyalty Status': {
        if (rule.condition === 'includes') {
          criteria.loyaltyTiers = rule.values.map(v => TIER_FROM_LABEL[v]).filter(Boolean);
        }
        if (rule.condition === 'excludes') {
          const excluded = new Set(rule.values.map(v => TIER_FROM_LABEL[v]).filter(Boolean));
          criteria.loyaltyTiers = (Object.values(TIER_FROM_LABEL) as LoyaltyTier[]).filter(
            t => !excluded.has(t)
          );
        }
        break;
      }
      case 'Rate Code':
        if (rule.condition === 'includes') criteria.rateCodes = [...rule.values];
        break;
      case 'Room Number':
        if (rule.condition === 'includes') criteria.roomNumbers = [...rule.values];
        break;
      case 'Number of Nights Staying':
        if (rule.dropdownValue === 'Multiple Nights') criteria.lengthOfStay = 'multiple-nights';
        else if (rule.dropdownValue === 'One Night') criteria.lengthOfStay = 'one-night';
        break;
      case 'Guest Recurrence':
        if (rule.dropdownValue === 'First-time') criteria.guestRecurrence = 'first-time';
        else if (rule.dropdownValue === 'Recurring') criteria.guestRecurrence = 'recurring';
        break;
    }
  }
  return criteria;
}

/** Convert broadcast filter criteria into guest-journey segment rules. */
export function criteriaToSegmentRules(criteria: BroadcastFilterCriteria): SegmentRule[] {
  const rules: SegmentRule[] = [];
  const push = (rule: Omit<SegmentRule, 'operator'>) => {
    rules.push({ ...rule, ...(rules.length > 0 ? { operator: 'And' as const } : {}) });
  };

  if (criteria.loyaltyTiers.length > 0) {
    push({
      id: `rule-${Date.now()}-loyalty`,
      guestProperty: 'Loyalty Status',
      condition: 'includes',
      values: criteria.loyaltyTiers.map(t => TIER_TO_LABEL[t]),
      dropdownValue: '',
    });
  }
  if (criteria.rateCodes.length > 0) {
    push({
      id: `rule-${Date.now()}-rate`,
      guestProperty: 'Rate Code',
      condition: 'includes',
      values: [...criteria.rateCodes],
      dropdownValue: '',
    });
  }
  if (criteria.roomNumbers.length > 0) {
    push({
      id: `rule-${Date.now()}-room`,
      guestProperty: 'Room Number',
      condition: 'includes',
      values: [...criteria.roomNumbers],
      dropdownValue: '',
    });
  }
  if (criteria.lengthOfStay) {
    push({
      id: `rule-${Date.now()}-stay`,
      guestProperty: 'Number of Nights Staying',
      condition: 'is equal to',
      values: [],
      dropdownValue: criteria.lengthOfStay === 'one-night' ? 'One Night' : 'Multiple Nights',
    });
  }
  if (criteria.guestRecurrence) {
    push({
      id: `rule-${Date.now()}-recurrence`,
      guestProperty: 'Guest Recurrence',
      condition: 'is equal to',
      values: [],
      dropdownValue: criteria.guestRecurrence === 'first-time' ? 'First-time' : 'Recurring',
    });
  }
  return rules;
}
