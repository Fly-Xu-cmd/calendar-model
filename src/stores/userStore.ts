import { create } from "zustand"
import type { UserProfile } from "@/types"

interface UserState {
  user: UserProfile
  updateUser: (patch: Partial<UserProfile>) => void
  toggleAutoPublish: () => void
  setConnected: (service: "linkedinConnected" | "calendarConnected", val: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: "u-001",
    name: "Lauren Lucas",
    email: "lauren@kwcolumbus.com",
    role: "房产经纪人",
    company: "Keller Williams Columbus",
    region: "俄亥俄州 · 富兰克林县",
    preferences: {
      autoPublish: false,
      pushTime: "09:00",
      propertyTypes: ["独栋住宅"],
      priceRange: { min: 200000, max: 400000 },
      targetCounty: "Franklin County",
      linkedinConnected: true,
      calendarConnected: true,
    },
  },

  updateUser: (patch) =>
    set((s) => ({ user: { ...s.user, ...patch } })),

  toggleAutoPublish: () =>
    set((s) => ({
      user: {
        ...s.user,
        preferences: {
          ...s.user.preferences,
          autoPublish: !s.user.preferences.autoPublish,
        },
      },
    })),

  setConnected: (service, val) =>
    set((s) => ({
      user: {
        ...s.user,
        preferences: { ...s.user.preferences, [service]: val },
      },
    })),
}))
