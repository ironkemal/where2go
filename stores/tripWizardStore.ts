import { create } from 'zustand'

interface TripWizardState {
  currentStep: number
  durationHours: number
  transportMode: 'walking' | 'scooter' | 'car' | 'bicycle' | 'public_transport' | null
  activities: string[]
  activityDetails: Record<string, string[]>
  budgetLevel: 'budget' | 'mid' | 'luxury' | null
  accommodationId: string | null

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setDuration: (hours: number) => void
  setTransport: (mode: TripWizardState['transportMode']) => void
  toggleActivity: (activity: string) => void
  setActivityDetails: (activity: string, details: string[]) => void
  setBudget: (level: TripWizardState['budgetLevel']) => void
  setAccommodation: (id: string) => void
  reset: () => void
}

const initialState = {
  currentStep: 1,
  durationHours: 8,
  transportMode: null as TripWizardState['transportMode'],
  activities: [] as string[],
  activityDetails: {} as Record<string, string[]>,
  budgetLevel: null as TripWizardState['budgetLevel'],
  accommodationId: null as string | null,
}

export const useTripWizardStore = create<TripWizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),

  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setDuration: (hours) => set({ durationHours: hours }),

  setTransport: (mode) => set({ transportMode: mode }),

  toggleActivity: (activity) =>
    set((state) => ({
      activities: state.activities.includes(activity)
        ? state.activities.filter((a) => a !== activity)
        : [...state.activities, activity],
    })),

  setActivityDetails: (activity, details) =>
    set((state) => ({
      activityDetails: { ...state.activityDetails, [activity]: details },
    })),

  setBudget: (level) => set({ budgetLevel: level }),

  setAccommodation: (id) => set({ accommodationId: id }),

  reset: () => set({ ...initialState }),
}))
