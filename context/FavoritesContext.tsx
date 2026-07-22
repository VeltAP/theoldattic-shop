'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode } from 'react';

const STORAGE_KEY = 'favorites';

type FavoritesContextValue = {
  favoriteIds: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const listeners = new Set<() => void>();
function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) emitChange();
  }
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

let cachedRaw: string | null = null;
let cachedIds: number[] = [];
const EMPTY_FAVORITES: number[] = [];

function getSnapshot(): number[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedIds = raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      cachedIds = [];
    }
  }
  return cachedIds;
}

function getServerSnapshot(): number[] {
  return EMPTY_FAVORITES;
}

function writeFavorites(ids: number[]) {
  cachedIds = ids;
  cachedRaw = JSON.stringify(ids);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  emitChange();
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = (id: number) => favoriteIds.includes(id);

  const toggleFavorite = (id: number) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((existingId) => existingId !== id)
      : [...current, id];
    writeFavorites(next);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}