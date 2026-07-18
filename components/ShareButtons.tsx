'use client';
import { useState, useSyncExternalStore } from 'react';
import { Mail, Copy, Check, Share2 } from 'lucide-react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

function getServerSnapshot() {
  return false;
}

const iconButtonClass =
  'flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 text-shop-text/70 hover:text-shop-accent hover:border-shop-accent transition-colors';

export function ShareButtons({ url, title, image }: { url: string; title: string; image?: string }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = image ? encodeURIComponent(image) : '';

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled the native share sheet — nothing to do
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (canNativeShare) {
    return (
      <button onClick={handleNativeShare} className={iconButtonClass} aria-label="Share this item">
        <Share2 className="w-4 h-4" />
      </button>
    );
  }

  const shareLinks = [
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.84c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
        </svg>
      ),
    },
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.2l-5.6-7.4L4 22H1l8.2-9.3L1 2h7.4l5 6.7L18.9 2zm-1.3 18h2L7.5 4h-2l12.1 16z" />
        </svg>
      ),
    },
    {
      label: 'Share on Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.86 6.35 9.32-.09-.79-.17-2.01.03-2.88.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .85-.55 2.13-.83 3.31-.24.99.5 1.8 1.48 1.8 1.77 0 3.13-1.87 3.13-4.56 0-2.38-1.71-4.05-4.16-4.05-2.83 0-4.5 2.13-4.5 4.32 0 .86.33 1.78.74 2.28a.3.3 0 01.07.29c-.08.32-.25 1-.29 1.14-.05.19-.15.24-.35.14-1.3-.6-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 5.99 0 3.58-2.25 6.45-5.38 6.45-1.05 0-2.04-.55-2.37-1.2l-.65 2.46c-.23.9-.86 2.02-1.29 2.71.97.3 1.99.46 3.05.46 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      ),
    },
    {
      label: 'Share on WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.03c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.61-.6-2.85-1.23-4.7-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.53-.35.71-.35.18 0 .35 0 .5.01.16.01.38-.06.6.45.24.56.8 1.96.87 2.1.07.14.11.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.27-.12.53.16.26.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.2 1.37.26.14.41.12.56-.07.16-.19.68-.79.86-1.06.18-.27.35-.22.6-.13.24.09 1.55.73 1.81.86.27.13.44.19.51.3.07.11.07.63-.17 1.31z" />
        </svg>
      ),
    },
    {
      label: 'Share by email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-shop-text/60 mr-1">Share:</span>

      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={iconButtonClass}
        >
          {link.icon}
        </a>
      ))}

      <button onClick={handleCopy} aria-label="Copy link" className={iconButtonClass}>
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}