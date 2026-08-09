import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAppState = create<GlobalState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sourceFolder: null,
      toggleTheme: () =>
        set((prev) => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : 'dark',
        })),
      setSourceFolder: (path) =>
        set((prev) => ({ ...prev, sourceFolder: path })),
    }),
    {
      name: 'global-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
