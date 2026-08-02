'use client'

import { create } from 'zustand'
import type { CompressedContext, ConversationMessage } from '@/lib/conversation/domain'
import { defaultPersonality, type PersonalityKey } from '@/lib/personalities'

type ResponseMap = Partial<Record<PersonalityKey, string>>

export type VentSessionMessage = ConversationMessage

/**
 * A vent handed off across a route change, so /chat/[personality] can send it once the
 * transition finishes. Used when the persona changes mid-flow: accepting a suggestion on
 * /home, or switching to a gentler lens from a chat.
 */
export interface PendingSubmission {
  text: string
  acceptedSuggestedPersona: PersonalityKey | null
}

interface VentState {
  currentVentText: string
  currentVent: string
  activePersonality: PersonalityKey
  defaultPersonality: PersonalityKey
  responses: ResponseMap
  sessionMessages: VentSessionMessage[]
  transcriptMessages: VentSessionMessage[]
  compressedContext: CompressedContext | null
  safetyNote: string | null
  nextMessageIndex: number
  pendingSubmission: PendingSubmission | null
  setCurrentVentText: (text: string) => void
  setCurrentVent: (text: string) => void
  setActivePersonality: (personality: PersonalityKey) => void
  setDefaultPersonality: (personality: PersonalityKey) => void
  setResponse: (personality: PersonalityKey, content: string) => void
  setResponses: (responses: ResponseMap) => void
  addSessionMessage: (message: Omit<VentSessionMessage, 'index'>) => void
  applyCompressedContext: (context: CompressedContext) => void
  setSafetyNote: (note: string | null) => void
  setPendingSubmission: (submission: PendingSubmission | null) => void
  resetSession: () => void
}

export const useVentStore = create<VentState>((set) => ({
  currentVentText: '',
  currentVent: '',
  activePersonality: defaultPersonality,
  defaultPersonality,
  responses: {},
  sessionMessages: [],
  transcriptMessages: [],
  compressedContext: null,
  safetyNote: null,
  nextMessageIndex: 0,
  pendingSubmission: null,
  setCurrentVentText: (currentVentText) => set({ currentVentText }),
  setCurrentVent: (currentVent) => set({ currentVent }),
  setActivePersonality: (activePersonality) => set({ activePersonality }),
  setDefaultPersonality: (defaultPersonality) => set({ defaultPersonality, activePersonality: defaultPersonality }),
  setResponse: (personality, content) =>
    set((state) => ({
      responses: {
        ...state.responses,
        [personality]: content,
      },
    })),
  setResponses: (responses) => set({ responses }),
  addSessionMessage: (message) =>
    set((state) => ({
      nextMessageIndex: state.nextMessageIndex + 1,
      sessionMessages: [
        ...state.sessionMessages,
        {
          ...message,
          index: state.nextMessageIndex,
        },
      ],
      transcriptMessages: [
        ...state.transcriptMessages,
        {
          ...message,
          index: state.nextMessageIndex,
        },
      ],
    })),
  applyCompressedContext: (compressedContext) =>
    set((state) => ({
      compressedContext,
      sessionMessages: state.sessionMessages.filter(
        (message) => message.index > compressedContext.lastCompressedMessageIndex,
      ),
    })),
  setSafetyNote: (safetyNote) => set({ safetyNote }),
  setPendingSubmission: (pendingSubmission) => set({ pendingSubmission }),
  resetSession: () =>
    set({
      currentVentText: '',
      currentVent: '',
      responses: {},
      sessionMessages: [],
      transcriptMessages: [],
      compressedContext: null,
      safetyNote: null,
      nextMessageIndex: 0,
      pendingSubmission: null,
    }),
}))
