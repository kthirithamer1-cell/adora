/**
 * ColdMail Website Visitor Behavior, Dwell-Time & CTA Button Tracker
 *
 * Include this script in your website's <head> or before </body>:
 *   <script src="/public-tracker.js" defer></script>
 *
 * Tracks:
 * 1. Email click-through token (?_ct=<token> or #t=<token>)
 * 2. Exact active time spent on website (dwell_time in seconds) + scroll depth %
 * 3. Every button, CTA, and link clicked on your website (web_click + button text)
 */
(function () {
  const STORAGE_KEY = 'coldmail_tracking_token';
  const ENDPOINT = '/api/v1/t/web-event';

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  let isDirectEmailClick = false;
  let isRedirectedFromClickEndpoint = false;

  function resolveToken() {
    try {
      // 1. Check Stealth Hash Fragment (#t=<token>)
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

      // 2. Check Query Parameter (?_ct=<token>) from /api/v1/t/click/<token>
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('_ct');
      if (urlToken) {
        isRedirectedFromClickEndpoint = true;
        localStorage.setItem(STORAGE_KEY, urlToken);
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

  const token = resolveToken();
  if (!token) return;

  // --- Active Dwell Time & Scroll Depth State ---
  let activeSeconds = 0;
  let lastReportedSeconds = 0;
  let maxScrollDepth = 0;
  let isTabActive = !document.hidden;

  function updateScrollDepth() {
    try {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        ) - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
        if (pct > maxScrollDepth) maxScrollDepth = pct;
      } else {
        maxScrollDepth = 100;
      }
    } catch {}
  }

  window.addEventListener('scroll', updateScrollDepth, { passive: true });
  updateScrollDepth();

  function sendEvent(eventType, url, elementText, extra = {}) {
    const payload = JSON.stringify({
      token,
      event_type: eventType,
      url: url || window.location.href,
      element_text: elementText || null,
      page_title: document.title || window.location.pathname,
      duration_seconds: activeSeconds,
      scroll_depth: maxScrollDepth,
      ...extra,
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
      }).catch(() => {});
    }
  }

  // 1. Initial landing event (skip duplicate page_view if redirected from /api/v1/t/click)
  if (isDirectEmailClick) {
    sendEvent('click', window.location.href, 'email_link');
  } else if (!isRedirectedFromClickEndpoint) {
    sendEvent('page_view', window.location.href, null);
  }

  // 2. Count active seconds on website and send milestone dwell_time updates (15s, 45s, 120s)
  setInterval(function () {
    if (!document.hidden && isTabActive) {
      activeSeconds += 1;
      if (activeSeconds === 15 || activeSeconds === 45 || activeSeconds === 120) {
        lastReportedSeconds = activeSeconds;
        sendEvent('dwell_time', window.location.href, null, {
          milestone: `${activeSeconds}s`,
        });
      }
    }
  }, 1000);

  window.addEventListener('focus', function () {
    isTabActive = true;
  });
  window.addEventListener('blur', function () {
    isTabActive = false;
  });

  // 3. Report final time spent when visitor leaves page or switches tab (if >= 5s new activity)
  function flushDwellTime() {
    if (activeSeconds >= 5 && activeSeconds - lastReportedSeconds >= 5) {
      lastReportedSeconds = activeSeconds;
      sendEvent('dwell_time', window.location.href, null);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      flushDwellTime();
    }
  });
  window.addEventListener('pagehide', flushDwellTime);

  // 4. Track clicks on ANY button, CTA, or link on the website
  document.addEventListener(
    'click',
    function (e) {
      const target = e.target.closest('a, button, [role="button"], input[type="submit"], [data-track]');
      if (!target) return;

      const label = (
        target.getAttribute('data-track') ||
        target.innerText ||
        target.value ||
        target.getAttribute('aria-label') ||
        target.getAttribute('title') ||
        target.id ||
        'Button'
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);

      const href = target.href || window.location.href;
      sendEvent('web_click', href, label);
    },
    { capture: true, passive: true }
  );
})();
