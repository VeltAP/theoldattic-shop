'use client';
import { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from 'react';

const STORAGE_KEY = 'cookie-consent';
type ConsentValue = 'accepted' | 'rejected' | null;

type CookieConsentContextValue = {
  consent: ConsentValue;
  hasChosen: boolean;
  setConsent: (value: 'accepted' | 'rejected') => void;
  resetConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

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

function getSnapshot(): ConsentValue {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'accepted' || stored === 'rejected' ? stored : null;
}

function getServerSnapshot(): ConsentValue {
  return null; // server never has a stored choice — matches client's pre-hydration state
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hasChosen = consent !== null;

  const setConsent = useCallback((value: 'accepted' | 'rejected') => {
    window.localStorage.setItem(STORAGE_KEY, value);
    emitChange();
  }, []);

  const resetConsent = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    emitChange(); // banner reappears so the visitor can choose again
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, hasChosen, setConsent, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return context;
}