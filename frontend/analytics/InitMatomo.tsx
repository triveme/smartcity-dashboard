'use client';

import Script from 'next/script';
import { JSX, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type InitMatomoProps = {
  matomoURL: string | undefined;
  matomoID: string | undefined;
};

function InitMatomo({ matomoURL, matomoID }: InitMatomoProps): JSX.Element {
  const baseUrl =
    matomoURL && matomoURL.endsWith('/') ? matomoURL : `${matomoURL}/`;

  // Bootstrap Matomo once; subsequent navigations handled via effect above
  const initCode = `
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
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
  const hasTrackedRef = useRef(false);
  const searchKey = searchParams?.toString();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _paq = (window as any)._paq;
    if (!_paq) return;

    // Avoid double-counting initial load since init script already does trackPageView
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      return;
    }

    try {
      const urlPath =
        searchKey && searchKey.length > 0
          ? `${pathname}?${searchKey}`
          : pathname;
      _paq.push(['setCustomUrl', urlPath]);
      _paq.push(['trackPageView']);
    } catch (e) {
      console.log('Matomo route track error', e);
    }
  }, [pathname, searchKey]);

  return (
    <Script id="matomo-init" strategy="afterInteractive">
      {initCode}
    </Script>
  );
}

export default InitMatomo;
