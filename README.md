# DIY Popup Blocker

A lightweight Chrome extension that kills social-proof nudges ("Only 2 left!", "X people viewing"), GDPR consent popups, and overlay banners on diy.com product pages.

## How it works

Three layers fire at page load:

1. **CSS injection** (`document_start`) — hides known popup containers before they paint
2. **Didomi pre-seeding** — writes a consent token to `localStorage` so the cookie popup never initialises
3. **MutationObserver** — watches the DOM and removes social-proof elements the instant React injects them

## Installation

1. Open `chrome://extensions`
2. Toggle on **Developer mode** (top right)
3. Click **Load unpacked** → point at this directory (`C:\Code\diy-popup-blocker`)
4. Visit a diy.com product page in a fresh incognito window

## Adding selectors

If a popup still sneaks through:

1. Open DevTools → Elements
2. Find the element's `data-testid`, `class`, or `id`
3. Add a matching selector to `POPUP_SELECTORS` in `content.js`
4. Hit the refresh icon on the extension in `chrome://extensions`
