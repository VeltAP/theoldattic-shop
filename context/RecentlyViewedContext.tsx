'use client';
import { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from 'react';

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 10;

type RecentlyViewedContextValue = {
  recentIds: number[];
  addView: (id: number) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

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
const EMPTY: number[] = [];

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
  return EMPTY;
}

function writeRecentIds(ids: number[]) {
  cachedIds = ids;
  cachedRaw = JSON.stringify(ids);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  emitChange();
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const recentIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addView = useCallback((id: number) => {
    const current = getSnapshot();
    if (current[0] === id) return; // already most-recent — avoid a needless write/notify loop
    const next = [id, ...current.filter((existing) => existing !== id)].slice(0, MAX_ITEMS);
    writeRecentIds(next);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, addView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  return context;
}