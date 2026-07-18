'use client';
import Link from 'next/link';
import { useCookieConsent } from '@/context/CookieConsentContext';

export function CookieBanner() {
  const { hasChosen, setConsent } = useCookieConsent();

  if (hasChosen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-shop-text text-white p-4 z-50 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-sm max-w-2xl">
        We use essential local storage to run your cart and favorites, and only with your
        permission Google Analytics to understand site traffic. See our{' '}
        <Link href="/policy/privacy-policy" className="underline">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setConsent('rejected')} className="border border-white px-4 py-2 rounded text-sm">
          Reject analytics
        </button>
        <button onClick={() => setConsent('accepted')} className="bg-white text-shop-text px-4 py-2 rounded text-sm">
          Accept
        </button>
      </div>
    </div>
  );
}