'use client';

import Script from 'next/script';
import { JSX } from 'react';

type InitMatomoProps = {
  matomoURL: string | undefined;
  matomoID: string | undefined;
};

function InitMatomo({ matomoURL, matomoID }: InitMatomoProps): JSX.Element {
  const baseUrl =
    matomoURL && matomoURL.endsWith('/') ? matomoURL : `${matomoURL}/`;

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

  return (
    <Script id="matomo-init" strategy="afterInteractive">
      {initCode}
    </Script>
  );
}

export default InitMatomo;
