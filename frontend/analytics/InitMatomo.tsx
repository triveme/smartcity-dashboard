'use client';

import Script from 'next/script';
import { JSX, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type InitMatomoProps = {
  matomoURL: string | undefined;
  matomoID: string | undefined;
};

function InitMatomo({ matomoURL, matomoID }: InitMatomoProps): JSX.Element {
  const baseUrl =
    matomoURL && matomoURL.endsWith('/') ? matomoURL : `${matomoURL}/`;

  // Load Matomo script; do not track here. SPA pageviews tracked in effect below.
  const initCode = `
  var _paq = window._paq = window._paq || [];
  (function() {
    var u="${baseUrl}";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '${matomoID}']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
  `;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w._paq = w._paq || [];

    // Configure tracker once in the client to ensure ordering before first track.
    if (!w.__matomoConfigured) {
      const u = baseUrl;
      w._paq.push(['setTrackerUrl', u + 'matomo.php']);
      w._paq.push(['setSiteId', String(matomoID || '')]);
      w._paq.push(['enableLinkTracking']);
      w.__matomoConfigured = true;
    }

    try {
      const urlPath =
        searchKey && searchKey.length > 0
          ? `${pathname}?${searchKey}`
          : pathname;
      w._paq.push(['setCustomUrl', urlPath]);
      w._paq.push(['setDocumentTitle', document.title]);
      w._paq.push(['trackPageView']);
    } catch (e) {
      console.log('Matomo route track error', e);
    }
  }, [pathname, searchKey, baseUrl, matomoID]);

  return (
    <Script id="matomo-init" strategy="afterInteractive">
      {initCode}
    </Script>
  );
}

export default InitMatomo;
