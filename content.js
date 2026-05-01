// Selectors for element.matches() sweep
const POPUP_SELECTORS = [
  '[data-testid*="social-proof"]',
  '[data-testid*="social_proof"]',
  '[class*="social-proof"]',
  '[class*="socialProof"]',
  '[id*="social-proof"]',
  '#didomi-host',
  '#didomi-popup',
  '#didomi-notice',
  '.didomi-popup-container',
  '[id^="didomi"]',
  '[class*="cookie-banner"]',
  '[class*="consent-banner"]',
  '[class*="newsletter-modal"]',
  '[class*="newsletter-popup"]',
].join(',');

// Regex for MutationObserver — catches any casing/separator variant
const SOCIAL_PROOF_RE = /social[-_]?proof/i;
const DIDOMI_RE = /^didomi/i;

function isSocialProof(el) {
  return SOCIAL_PROOF_RE.test(el.id)
    || SOCIAL_PROOF_RE.test(typeof el.className === 'string' ? el.className : '')
    || SOCIAL_PROOF_RE.test(el.dataset?.testid || '');
}

function isDidomi(el) {
  return DIDOMI_RE.test(el.id)
    || DIDOMI_RE.test(typeof el.className === 'string' ? el.className : '');
}

function killElement(el) {
  el.remove();
}

function sweepExisting() {
  document.querySelectorAll(POPUP_SELECTORS).forEach(killElement);
  // Restore scroll if a popup already locked it
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

// Layer 1 — pre-seed Didomi consent so the popup never initialises
try {
  localStorage.setItem('didomi_token', JSON.stringify({
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: 0,
    purposes: { enabled: [], disabled: [] },
    vendors: { enabled: [], disabled: [] },
  }));
} catch (_) {}

// Layer 2 — sweep once DOM is ready
document.addEventListener('DOMContentLoaded', sweepExisting);

// Layer 3 — MutationObserver catches async-injected nodes (React portals etc.)
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (isSocialProof(node) || isDidomi(node)) {
        killElement(node);
        continue;
      }

      // Also check descendants of the added node
      if (node.querySelectorAll) {
        node.querySelectorAll(POPUP_SELECTORS).forEach(killElement);
      }
    }
  }
});

// Start observing as soon as document.body exists
function startObserver() {
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

startObserver();
