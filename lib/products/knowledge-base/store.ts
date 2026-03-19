/**
 * Knowledge Base Store (Zustand)
 */

import { create } from 'zustand';
import { KBCategory, KBEntry, isYesNoEntry, CustomContextEntry } from './types';
import { mockCategories, mockCustomContext } from './mock-data';

interface KBState {
  categories: KBCategory[];
  customContext: CustomContextEntry[];
  toastMessage: string | null;

  updateEntry: (categoryId: string, entryId: string, updates: Partial<KBEntry>) => void;
  updateSubQuestion: (categoryId: string, entryId: string, subId: string, answer: string) => void;
  setYesNo: (categoryId: string, entryId: string, value: 'yes' | 'no') => void;

  addCustomContext: (text: string) => void;
  updateCustomContext: (id: string, text: string) => void;
  deleteCustomContext: (id: string) => void;

  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useKBStore = create<KBState>((set) => ({
  categories: mockCategories,
  customContext: mockCustomContext,
  toastMessage: null,

  updateEntry: (categoryId, entryId, updates) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              entries: cat.entries.map((e) =>
                e.id === entryId ? { ...e, ...updates } : e
              ),
            }
          : cat
      ),
    })),

  updateSubQuestion: (categoryId, entryId, subId, answer) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              entries: cat.entries.map((e) => {
                if (e.id !== entryId || !isYesNoEntry(e)) return e;
                return {
                  ...e,
                  subQuestions: e.subQuestions?.map((sq) =>
                    sq.id === subId ? { ...sq, answer } : sq
                  ),
                };
              }),
            }
          : cat
      ),
    })),

  setYesNo: (categoryId, entryId, value) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              entries: cat.entries.map((e) =>
                e.id === entryId && isYesNoEntry(e) ? { ...e, value } : e
              ),
            }
          : cat
      ),
    })),

  addCustomContext: (text) =>
    set((state) => ({
      customContext: [
        { id: `cc-${Date.now()}`, text },
        ...state.customContext,
      ],
    })),

  updateCustomContext: (id, text) =>
    set((state) => ({
      customContext: state.customContext.map((c) =>
        c.id === id ? { ...c, text } : c
      ),
    })),

  deleteCustomContext: (id) =>
    set((state) => ({
      customContext: state.customContext.filter((c) => c.id !== id),
    })),

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  clearToast: () => set({ toastMessage: null }),
}));
