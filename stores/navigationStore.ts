import { create } from 'zustand'
import type { TripPlanData } from '@/types/database'

interface NavigationState {
  isNavigating: boolean
  currentPlan: TripPlanData | null
  currentStopIndex: number
  userLocation: { lat: number; lng: number } | null

  startNavigation: (plan: TripPlanData) => void
  stopNavigation: () => void
  setUserLocation: (location: { lat: number; lng: number }) => void
  nextStop: () => void
  skipStop: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  isNavigating: false,
  currentPlan: null,
  currentStopIndex: 0,
  userLocation: null,

  startNavigation: (plan) =>
    set({ isNavigating: true, currentPlan: plan, currentStopIndex: 0 }),

  stopNavigation: () =>
    set({ isNavigating: false, currentPlan: null, currentStopIndex: 0 }),

  setUserLocation: (location) => set({ userLocation: location }),

  nextStop: () =>
    set((state) => {
      if (!state.currentPlan) return state
      const maxIndex = state.currentPlan.stops.length - 1
      return { currentStopIndex: Math.min(state.currentStopIndex + 1, maxIndex) }
    }),

  skipStop: () => {
    get().nextStop()
  },
}))
