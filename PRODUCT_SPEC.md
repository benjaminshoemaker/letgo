# LetGo — Product Specification Document

**Version:** 1.0 (MVP)  
**Date:** January 2026  
**Status:** Ready for Technical Specification

---

## Executive Summary

LetGo is a mobile web application that helps users decide what to do with items they want to get rid of. Users photograph an item, and the app uses AI to identify it and provide a clear recommendation: **sell**, **donate**, **recycle**, or **dispose** — along with reasoning, estimated value, and actionable next steps.

### The Gap in the Market

Current solutions are fragmented:
- **Selling apps** (eBay, OfferUp, Decluttr) assume you've already decided to sell
- **Recycling apps** (Bower, BinPal) only address disposal
- **Decluttering apps** (Toss, ByeBye) focus on motivation/habits, not decision-making

No existing app answers the core question: **"I have this thing — what should I do with it?"**

---

## Problem Statement

When people declutter, they face decision paralysis at scale. For each item, they must:

1. Figure out what the item is worth (if anything)
2. Decide if it's worth the effort to sell
3. Know where to donate it (and if the organization will accept it)
4. Understand how to properly dispose of it (especially for electronics, batteries, paint, etc.)

This friction causes people to either:
- Keep items they don't need ("I'll deal with it later")
- Throw away items that could be sold or donated
- Improperly dispose of hazardous materials

**LetGo removes this friction by making the decision for them.**

---

## Target User

### Primary Persona: The Weekend Declutterer

- **Who:** General consumers cleaning out closets, garages, basements, storage units
- **When:** Moving, spring cleaning, downsizing, post-holiday purges, nesting, life transitions
- **Motivation:** Wants stuff gone with minimal effort and guilt
- **Mindset:** Standing in front of an item thinking "what do I do with this?"

### User Characteristics

- US-based (v1 geographic scope)
- Mobile-first — they're physically in front of items, not at a desk
- Time-constrained — wants quick answers, not research projects
- Mildly eco-conscious — prefers not to trash things that could be reused, but won't go out of their way

### Out of Scope for MVP

- Estate sale professionals (need bulk/inventory features)
- International users (disposal rules vary too much)
- Resellers/flippers (need pricing optimization, not disposal guidance)

---

## Platform

### Mobile Web (Progressive Web App)

**Rationale:**
- Core use case is mobile: user is physically with the item
- PWA provides camera access, offline capability, home screen install
- Zero app store friction (no download, no approval delays)
- Single codebase for iOS and Android
- Easy to share via URL

**Technical Implications:**
- Must work well on Safari (iOS) and Chrome (Android)
- Camera API access required
- localStorage for any client-side caching
- Service worker for offline graceful degradation

---

## Core User Experience

### Flow Diagram

```
[Open App] → [Sign In w/ Google] → [Camera/Upload] → [Condition Select] 
    → [AI Processing] → [Recommendation Card] → [Save to My Items] 
    → [Mark Outcome When Done]
```

### Step-by-Step Walkthrough

#### 1. Entry & Authentication
- User opens app URL on mobile browser
- First-time users see brief value prop (1 screen) then Google Sign-In
- Returning users go straight to camera (session persists)

#### 2. Capture Item
- Primary action: large "Scan Item" button opens camera
- Secondary: "Upload Photo" for existing images
- Single item per scan (if multiple items visible, identifies dominant item)

#### 3. Assess Condition
- After capture, user sees photo preview
- Simple 4-option selector: **Excellent / Good / Fair / Poor**
- Brief helper text for each (e.g., "Good: Works well, minor cosmetic wear")
- Required field — cannot proceed without selection

#### 4. AI Processing
- Loading state while AI identifies item and generates recommendation
- Target: < 3 seconds
- If identification confidence is low, show text input fallback: "I'm not sure what this is. Can you tell me?"

#### 5. Recommendation Card
- **Item identified:** "IKEA MALM 6-Drawer Dresser" (or best guess)
- **Recommendation:** One of four paths, prominently displayed:
  - 🏷️ **SELL** — "Worth your time to list"
  - 🎁 **DONATE** — "Give it a new home"
  - ♻️ **RECYCLE** — "Recycle properly"
  - 🗑️ **DISPOSE** — "OK to throw away"
- **Reasoning:** 2-3 sentences explaining why (e.g., "Similar dressers sell for $75-150 on Facebook Marketplace. IKEA furniture is popular and this size is easy to transport.")
- **Estimated Value:** Range if sellable (e.g., "$75 – $150")
- **Next Steps:** Actionable guidance based on path (see below)
- **Hazard Warning:** If applicable, prominent banner (e.g., "⚠️ Contains lithium battery — do not throw in trash")

#### 6. Path-Specific Guidance

**SELL Path:**
- Suggested platforms ranked by fit (e.g., "1. Facebook Marketplace, 2. OfferUp")
- Suggested listing price
- Quick tips (e.g., "Take photos in natural light, mention brand in title")
- Link: Google search for "[item] site:facebook.com/marketplace" (or similar)

**DONATE Path:**
- Types of orgs that accept this item (e.g., "Habitat ReStore, Goodwill, Buy Nothing groups")
- Link: Google Maps search for "donation center near me"
- Bonus: Estimated tax deduction value (IRS fair market value guidance)

**RECYCLE Path:**
- How to recycle this item type
- Link: Google search for "recycle [item type] near [city]" or Earth911
- Special instructions if needed (e.g., "Remove batteries first")

**DISPOSE Path:**
- Confirmation it's OK for normal trash
- Any prep needed (e.g., "Bag broken glass separately")
- If bulky: link to search for municipal bulk pickup

#### 7. Save & Track
- "Add to My Items" button saves to user's list
- Default status: **To Do**
- User can also dismiss without saving

#### 8. My Items List
- Persistent list of all saved items
- Shows: thumbnail, item name, recommendation, status
- Status options: **To Do → Sold / Donated / Recycled / Trashed**
- User taps to change status when they've dealt with item
- Simple filters: "All" / "To Do" / "Done"

---

## MVP Features

### Must Have (P0)

| Feature | Description |
|---------|-------------|
| Google OAuth | Sign in with Google, session persistence |
| Photo capture | Camera access + photo upload fallback |
| Condition input | 4-option selector (Excellent/Good/Fair/Poor) |
| AI identification | Identify item from photo using vision model |
| Recommendation engine | Generate sell/donate/recycle/dispose recommendation |
| Value estimation | Rough resale price range for sellable items |
| Reasoning display | 2-3 sentence explanation of recommendation |
| Next steps | Actionable guidance + external links per path |
| Hazard detection | Flag hazardous items with warnings + special instructions |
| Text fallback | Manual item entry when AI confidence is low |
| My Items list | Persistent list with status tracking |
| Status management | Mark items as Sold/Donated/Recycled/Trashed |

### Nice to Have (P1) — Post-MVP

| Feature | Description |
|---------|-------------|
| Impact summary | "You've donated 23 items worth $450 this year" |
| Share results | Share recommendation card via native share |
| Scan history | View past scans even if not saved |
| Multi-item detection | Identify multiple items, let user choose |
| Price lookup | Real-time marketplace price data |
| Direct integrations | Deep links to create FB Marketplace listing, schedule Goodwill pickup |
| Offline mode | Cache recent recommendations, queue scans |

### Out of Scope for MVP

- Native mobile apps
- Desktop optimization
- Inventory/batch management
- Social features
- Gamification
- Monetization

---

## Data Model

### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| google_id | String | Google OAuth identifier |
| email | String | From Google profile |
| display_name | String | From Google profile |
| created_at | Timestamp | Account creation |
| last_login | Timestamp | Most recent login |

### Item

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to User |
| photo_url | String | Cloud storage URL for uploaded photo |
| identified_name | String | AI-identified item name |
| user_override_name | String (nullable) | If user corrected identification |
| condition | Enum | Excellent / Good / Fair / Poor |
| recommendation | Enum | Sell / Donate / Recycle / Dispose |
| reasoning | Text | AI-generated explanation |
| estimated_value_low | Integer (nullable) | Low end of price range (cents) |
| estimated_value_high | Integer (nullable) | High end of price range (cents) |
| guidance | Text | AI-generated next steps |
| is_hazardous | Boolean | Flagged for special handling |
| hazard_warning | Text (nullable) | Specific hazard instructions |
| status | Enum | ToDo / Sold / Donated / Recycled / Trashed |
| created_at | Timestamp | When scanned |
| updated_at | Timestamp | Last status change |

### Analytics Events (Anonymous)

| Event | Properties |
|-------|------------|
| item_scanned | item_category, condition, recommendation, is_hazardous |
| identification_failed | fallback_used (boolean) |
| status_changed | from_status, to_status, days_since_scan |
| recommendation_link_clicked | link_type (marketplace, donate, recycle) |

---

## Authentication & Access Control

### Authentication
- **Method:** Google OAuth 2.0 (Sign in with Google)
- **Session:** JWT stored in httpOnly cookie, 30-day expiry
- **Refresh:** Silent refresh while active

### Access Control
- Simple model: users can only access their own items
- No roles, no sharing, no admin panel for MVP
- All API endpoints require valid session except health check

### Privacy Considerations
- Photos stored in cloud storage with user-scoped paths
- No photo analysis data retained beyond the item record
- Analytics events contain no PII
- User can delete account (cascades to all items + photos)

---

## External Dependencies

### AI/ML
- **Vision + Language Model:** GPT-4o, Claude, or Gemini (recommendation: GPT-4o for vision + reasoning in single call)
- Used for: item identification, recommendation logic, value estimation, guidance generation, hazard detection

### Cloud Services
- **Auth:** Google OAuth
- **Photo Storage:** AWS S3 or Google Cloud Storage
- **Analytics:** PostHog, Mixpanel, or Amplitude (any with free tier)

### External Links (not integrations)
- Google Maps (donation center search)
- Google Search (marketplace listings, recycling facilities)
- Earth911 (recycling lookup)

---

## Non-Functional Requirements

### Performance
- Photo upload + processing: < 5 seconds end-to-end
- AI response time: < 3 seconds
- My Items list load: < 1 second

### Reliability
- 99% uptime target
- Graceful degradation if AI service is slow/down

### Security
- HTTPS everywhere
- Photos not publicly accessible (signed URLs)
- OAuth tokens never exposed to client
- Rate limiting on scan endpoint (prevent abuse)

### Scale (MVP)
- Support 1,000 DAU
- Support 10,000 items per day
- No hard limits on items per user

---

## Success Metrics

### Primary (Validate Product-Market Fit)
- **Scans per user:** Target ≥ 5 items per session
- **Return rate:** Target ≥ 30% of users return within 7 days
- **Completion rate:** Target ≥ 50% of scanned items eventually marked done

### Secondary (Product Quality)
- **Identification accuracy:** < 10% use text fallback
- **Time to recommendation:** < 5 seconds p95
- **Recommendation helpfulness:** (future) in-app feedback thumbs up/down

---

## Open Questions for Technical Specification

1. **AI Provider Selection:** GPT-4o vs Claude vs Gemini — tradeoffs on cost, speed, accuracy?
2. **Photo Handling:** Resize/compress client-side before upload? What resolution needed for good identification?
3. **Prompt Engineering:** Single prompt for identification + recommendation, or chain of prompts?
4. **Caching:** Cache common items/recommendations to reduce AI costs?
5. **PWA Scope:** Which PWA features to implement (service worker, manifest, offline)?
6. **Deployment:** Recommended hosting (Vercel, Render, Railway, etc.)?

---

## Appendix A: Recommendation Logic Guidelines

These guidelines inform the AI prompt for generating recommendations:

### SELL if:
- Item has resale value > $20
- Item is in Excellent or Good condition
- Item category has active resale market (electronics, furniture, brand-name clothing, tools)
- Item is not overly bulky/difficult to ship for online sale

### DONATE if:
- Item is functional but low resale value (< $20 or high effort-to-value ratio)
- Item is in Good or Fair condition
- Item category commonly accepted by donation centers
- Examples: clothing, kitchenware, books, toys, furniture

### RECYCLE if:
- Item is not functional or in Poor condition
- Item material is recyclable (metal, glass, paper, certain plastics)
- Item is e-waste (electronics, batteries, cables)
- Special recycling path exists (textiles, mattresses)

### DISPOSE if:
- Item is broken/non-functional AND not recyclable
- Item has no resale or donation value
- Item is worn out beyond reasonable use
- Examples: broken ceramics, worn-out shoes, damaged particle board furniture

### HAZARD FLAG if:
- Batteries (lithium, lead-acid)
- Electronics with batteries
- Paint, solvents, chemicals
- Fluorescent bulbs (mercury)
- Medications
- Propane tanks
- Motor oil, antifreeze
- Pesticides, herbicides

---

## Appendix B: Competitive Landscape

| App | Focus | Gap |
|-----|-------|-----|
| Decluttr | Sell electronics/media | Limited categories, no donate/recycle path |
| OfferUp | Sell anything | No identification, no guidance |
| ByeBye | Inventory tracking | Manual entry, no AI, no recommendations |
| Toss | Declutter habits | Motivation-focused, no item-level guidance |
| Bower | Recycling | Only recycling, no sell/donate |
| Google Lens | Identification | No disposal recommendation |

**LetGo's differentiation:** Only app that combines AI identification with actionable sell/donate/recycle/dispose decision framework.

---

*This document contains sufficient product context for engineering to produce a technical specification. For questions or clarifications, contact the product owner.*
