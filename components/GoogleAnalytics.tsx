'use client';
import Script from 'next/script';
import { useCookieConsent } from '@/context/CookieConsentContext';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const { consent } = useCookieConsent();

  // Nothing is rendered, and therefore nothing is requested from Google's
  // servers, unless consent is explicitly 'accepted'. This is the entire
  // mechanism — there's no script sitting there "disabled," it simply
  // doesn't exist in the page until this condition is true.
  if (consent !== 'accepted' || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}