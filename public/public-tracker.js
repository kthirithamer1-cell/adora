/**
 * ColdMail Website Visitor Behavior Tracker
 *
 * Include this script in your website's <head> or before </body>:
 *   <script src="/public-tracker.js" defer></script>
 *
 * What it does:
 * 1. Captures ?_ct=<tracking_token> when a prospect clicks a link from your email
 * 2. Persists the token in localStorage & cookie for 30 days
 * 3. Automatically queues every page view (e.g. /pricing, /demo) and CTA button/link click
 *    to /api/v1/t/web-event so your local ColdMail Engine scores & tracks the prospect!
 */
(function () {
  const STORAGE_KEY = 'coldmail_tracking_token';
  const ENDPOINT = '/api/v1/t/web-event';

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  let isDirectEmailClick = false;

  function resolveToken() {
    try {
      // 1. Check Stealth Hash Fragment (#t=<token>) from direct email link
      if (window.location.hash && window.location.hash.includes('t=')) {
        const hashRaw = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hashRaw);
        const hashToken = hashParams.get('t');
        if (hashToken) {
          isDirectEmailClick = true;
          localStorage.setItem(STORAGE_KEY, hashToken);
          hashParams.delete('t');
          const remainingHash = hashParams.toString();
          const cleanUrl =
            window.location.pathname +
            window.location.search +
            (remainingHash ? '#' + remainingHash : '');
          window.history.replaceState({}, document.title, cleanUrl);
          return hashToken;
        }
      }

      // 2. Check Query Parameter (?_ct=<token>)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('_ct');
      if (urlToken) {
        localStorage.setItem(STORAGE_KEY, urlToken);
        // Clean ?_ct= from address bar without reloading
        params.delete('_ct');
        const cleanQuery = params.toString();
        const cleanUrl =
          window.location.pathname +
          (cleanQuery ? '?' + cleanQuery : '') +
          window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return urlToken;
      }
      return localStorage.getItem(STORAGE_KEY) || getCookie('ct_token');
    } catch {
      return getCookie('ct_token');
    }
  }

  function sendEvent(token, eventType, url, elementText) {
    const payload = JSON.stringify({
      token,
      event_type: eventType,
      url: url || window.location.href,
      element_text: elementText || null,
      page_title: document.title || null,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => { });
    }
  }

  const token = resolveToken();
  if (!token) return;

  // 1. If the user just clicked a direct #t=<token> link from the email, record the email 'click' event
  if (isDirectEmailClick) {
    sendEvent(token, 'click', window.location.href, 'email_link');
  } else {
    // Otherwise record a website page_view
    sendEvent(token, 'page_view', window.location.href, null);
  }

  // 2. Track clicks on important buttons and links on the website
  document.addEventListener(
    'click',
    function (e) {
      const target = e.target.closest('a, button, [role="button"], input[type="submit"]');
      if (!target) return;

      const label = (
        target.innerText ||
        target.value ||
        target.getAttribute('aria-label') ||
        ''
      )
        .trim()
        .slice(0, 120);
      const href = target.href || window.location.href;

      sendEvent(token, 'web_click', href, label);
    },
    { capture: true, passive: true }
  );
})();

