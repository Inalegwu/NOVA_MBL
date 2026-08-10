import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const ACCENTS: ReadonlyArray<
  Accent & {
    id: string;
  }
> = [
  {
    dark: '',
    light: '',
    id: 'purple',
  },
];

export const useAppState = create<GlobalState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sourceFolder: null,
      accent: null,
      toggleTheme: () =>
        set((prev) => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : 'dark',
        })),
      setSourceFolder: (path) =>
        set((prev) => ({ ...prev, sourceFolder: path })),
      setAccent: (id) =>
        set((prev) => ({ ...prev, accent: ACCENTS.find((v) => v.id === id) })),
    }),
    {
      name: 'global-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
