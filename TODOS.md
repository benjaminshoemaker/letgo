# TODO

## In Progress

- [ ] **[P1 / Low]** Hide Scan & My Items nav options on signin page — These navigation options should only be visible to authenticated users
- [ ] **[P1 / Low]** Add CTA to scan/upload photo on landing page — After login, the landing page should prominently feature a call-to-action to scan or upload a new photo
- [x] **[P1 / Medium]** Fix confusing post-upload button UX — After uploading and classifying an item, the "Continue to upload" button remains visible, misleading users to think it advances the flow when it actually re-uploads. Need to redesign the user flow after classification. **DONE: Added `!result` condition to hide Continue button after scan completes.**
- [x] **[P1 / Medium]** Fix auto-add to My Items behavior — Items are automatically added to My Items after scanning, but a button is still presented as if user action is required. The button is misleading since the item is already saved regardless. **DONE: Changed button text from "Add to My Items" to "View in My Items".**
- [ ] **[P1 / Low]** Make bottom nav always visible — Scan and My Items navigation should be persistently visible at the bottom of the page (for authenticated users)

## Future Concepts

- [ ] **[P1 / Medium]** Create marketing landing page — Public-facing page to showcase the app's features and drive signups
