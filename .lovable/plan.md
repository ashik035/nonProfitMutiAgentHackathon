
# Fix Voice Notes Feature

## Problem

The Voice Notes page uses the browser's **Web Speech API** for recording. This fails in the Lovable preview for two reasons:

1. **Iframe microphone permissions** — The preview runs inside an iframe that may not have `allow="microphone"`, so the browser blocks mic access silently or throws a `NotAllowedError`.
2. **No error surfacing** — The `useSpeechRecognition` hook catches errors but the page component doesn't display them to the user, so recording appears to start but nothing happens.

## Plan

### 1. Improve error handling in `useSpeechRecognition` hook

- Wrap `recognition.start()` in a try/catch to handle `NotAllowedError`, `NotFoundError`, and `NotReadableError`
- Surface meaningful error messages (e.g., "Microphone blocked — open this page directly or use the manual input below")

### 2. Always show manual text input as fallback

- Currently the manual textarea only appears when `isSupported` is false
- Change the idle state UI to **always show** a "Or type your note" textarea below the record button, so users can still use the feature regardless of mic access
- Keep the record button for browsers that support it

### 3. Display speech recognition errors in the UI

- Show the `error` state from `useSpeechRecognition` as an Alert on the page
- If recording fails, automatically reset to idle state so the user isn't stuck

### 4. Add guidance for preview vs published

- Add a small info note: "Having trouble recording? Try opening the published app directly, or use the text input below."

## Technical Details

**Files changed:**
- `src/hooks/useSpeechRecognition.ts` — Add try/catch around `recognition.start()`, return specific error messages
- `src/pages/VoiceNotesPage.tsx` — Show errors from the hook, always render manual text fallback alongside the mic button, handle error-to-idle reset
