# Forum Playbook OS — Product Brief
Updated Wed / 2026-08-19 / 5:50 PM CT · v1.0.0

Source: Colton's 2026-08-19 Plaud recording ("08-19 Meeting: Forum Play"), captured while driving, ~18 minutes, transcript in full below the fold of this brief's research trail. Action items in that recording were addressed directly to "Claude and Calvin" as development lead: write the phased brief, recommend the AI integration architecture, design the account/forum data model. This file is that response.

## Changelog
- v1.0.0 (2026-08-19): first draft, written same day as the recording, by the Calvin session. Nothing built yet, this is the plan.

---

## 0. One-line restatement of the ask

Turn Forum Playbook from a free resource site plus a standalone timer app into a paid, per-forum "operating system": one app that runs the whole meeting (synced timer, live agenda, parking lot, calendar, AI-assisted debrief), sold at $20/month per forum, free to download, funded by Colton's decade of running Forum 14 and training other chapters.

## 1. Naming flag (open question, not decided by this brief)

The recording is auto-titled "Forum Play" by Plaud, and Colton says "forum play" a few times, but in his own words on tape he also says the product **is** "the forum playbook, which is the complete forum organizer." This brief assumes the product ships under the existing **Forum Playbook** brand (same site, same visual identity, same voice) rather than a new name, because that is what he says explicitly and because forumplaybook.com and the App Store listing for Forum Timer already say "from Forum Playbook." If he actually wants a distinct product name and brand split from the free resource site, that is a real decision, not a typo, see Decision D1 at the bottom.

## 2. What already exists (reuse inventory, don't rebuild)

Two real assets are already live and are the literal Phase 1 seed:

- **forum-timer-ios** (`~/Apps/forum-timer-ios`, GitHub `coltonmul/forum-timer-ios`): a working Swift/Xcode iOS timer app at v1.1, with agenda mode, themes, a synthesized sound/chime library, haptic tap feedback, launch screen reading "FORUM TIMER / from Forum Playbook." This is the seed for the Dynamic Agenda Engine and the per-device timer UI described on the recording. It does not yet talk to a server, so it has no cross-device sync, no accounts, and no subscriptions.
- **forumplaybook.com** (`~/Sites/forum-playbook`, GitHub `coltonmul/forum-playbook`): the free resource site. `/timer` already hosts a full web port of the Forum Timer app (quick timer + agenda mode) labeled "coming soon to the iOS App Store." `/brand` carries templates. This is the natural home for "Who Built This," the intro video, and the website subscription checkout the recording calls for.
- **The Cloudflare stack pattern already proven twice** (wilcoxsonhouse.com and forum14.com arcades): Pages Functions + D1 + KV, roster-based identity, a shared crew/forum code for access. That pattern is most of what a Phase 1 backend needs (forum accounts, parking lot, roster) and should be reused rather than re-architected. The one new piece Forum Playbook OS needs that those arcades didn't: real-time push of timer state to multiple simultaneous devices, addressed in Section 6.

Net: this is not a from-scratch build. It is (a) give forum-timer-ios a server to talk to, (b) build the parking lot/agenda/calendar data layer behind it, (c) add a subscription and account model, (d) later, layer in AI. Framing it that way changes the estimate a lot: Phase 1 is mostly wiring proven patterns together, not inventing new architecture.

## 3. Forum taxonomy (first draft, so Colton edits instead of starting blank)

Colton's own action item was to "define the standard forum taxonomy." Everything below is pulled directly from how he described his own forum's structure on the recording. Treat this as the draft data schema for the Agenda Engine; he should mark it up rather than write it from zero.

**A forum meeting has four blocks, roughly 4 hours total:**

| Block | Label | Length | Contents |
|---|---|---|---|
| 1 | Five Percent + Parking Lot Build | ~60 min | Each member gets a 6-min slot (3 min share, 3 min questions), order randomized. Impromptu topics surface organically here; if none does, a "pull random IQ topic" button exists. |
| 2 | Planned Deep Dive | ~60 min | One pre-scheduled I-Cube topic pulled from the parking lot, assigned to a member in advance. |
| 3 | Impromptu + Lightning Round | ~90 min | One or two EQ impromptu deep dives, then 10-min lightning-round IQ topics pulled from the parking lot or from that day's five-percent reflections. |
| 4 | Housekeeping | ~15 min | Confirm next location, next presenter/coach, retreat logistics, any decisions to record. |

**Roles:** Moderator (runs the meeting, records decisions, sends the debrief), Timekeeper (may be the same person, controls the shared timer), Member (shares, asks questions, can be assigned Block 2 presenter), Coach (external to the forum, assigned per presenter). Colton should confirm whether Timekeeper is always the Moderator or a rotating job, that decides whether "who can control the shared timer" is a single-owner or role-based permission.

**Content objects a forum accumulates over time:** Parking Lot Item (an IQ or EQ topic proposed but not yet used), Five Percent Reflection (per member, per meeting, optionally photographed/OCR'd), Decision (a line item from a past meeting's housekeeping block), Retreat (a dated multi-day event with its own logistics thread).

## 4. Phase 1: Tier 1, no AI, buildable today

Everything in this tier needs zero AI infrastructure and no per-forum marginal API cost, so it is pure margin once built. This is the floor of the $20/month price and should ship first.

1. **Synced shared timer.** Any device in a forum's session can start/pause/add time; every other device connected to that session sees it change live. Buzz/haptic option so phones can stay pocketed.
2. **Agenda Engine.** Loads a forum's template (default: the 4-block structure in Section 3, or a custom-uploaded one), shows current segment + who's on deck + a contextual prompt string ("Questions about meaning, not details"), and re-balances automatically if a segment runs long (tracked so the forum can later see "you always lose time in Block 3").
3. **Parking Lot.** Structured replacement for the spreadsheet: IQ/EQ topic list, tap to pull one at random into the live agenda, tap to browse and hand-pick.
4. **Calendar hub.** A dedicated per-forum calendar (e.g. "Forum 14 Calendar") that members subscribe to once; every logged decision (next meeting date, retreat dates) pushes to it automatically, syncing out to Google/Apple calendars.
5. **Templates.** Standard timing templates ship in the app; forums can upload/customize their own (Google Drive doc import, "copy this month's agenda into the next tab" pattern Colton described).
6. **Automated reminders (non-AI, rule-based).** 48-hour pre-meeting check-in, 24-hour five-percent nudge, one-week-out presenter reminder, all driven off the calendar/roster data, no AI needed for these, they're just scheduled pushes off known dates.
7. **Free tier.** Resources, reminders, best-practice content in Colton's voice, no login required, this is what stays free forever and is the top-of-funnel.

## 5. Phase 2: Tier 2, AI-augmented

Everything here has a real per-forum marginal cost or a real integration decision, so it ships after Tier 1 proves the base product works and after the AI integration question (Section 6) is answered.

1. **Live meeting AI capture.** Turned on by a forum at will, captures logistics-only segments (not full transcription of the whole four hours) to auto-update the parking lot, decisions log, and calendar.
2. **Voice-to-debrief.** Moderator records a voice memo (on the drive home, per Colton's example) and the app generates the formal decisions/debrief email, ready to send or edit.
3. **Five percent OCR.** Photograph a handwritten five-percent reflection, it's saved as text, with a per-member choice of forum-visible vs private-only.
4. **Forum health insights.** Longitudinal pattern detection off the data Tier 1 already collects (parking lot depletion, "you haven't run a planned deep dive in 3 sessions," chronic time overruns in one block). This one is cheap: it's just analysis of structured data already in the database, not a live-audio AI feature, so it can actually ship in Phase 1.5 ahead of the audio features.

## 6. The AI integration decision (the one Colton flagged as unresolved)

He asked directly: route Tier 2 through each forum's **own** Claude/ChatGPT API key, or run Forum Playbook's own centralized AI service and eat the cost. Recommendation: **bring-your-own-key (BYOK), with a small centralized fallback for the cheap stuff.**

**Why BYOK for the expensive stuff (live audio capture, voice-to-debrief):**
- Live audio transcription is the one feature with real, recurring, hard-to-predict marginal cost per forum, per meeting. A forum meets ~monthly for 3-4 hours; even logistics-only capture (not the full session) is real minutes of audio per month, times every paying forum. At centralized-service pricing this erodes the $20/month margin fast and scales against Colton, not with him, the more successful the product gets, the worse the unit economics get.
- Most of the target buyer (a forum moderator, EO/YPO-adjacent, business owner) already has or can trivially get a Claude or ChatGPT subscription. Colton himself is the proof case.
- BYOK means Forum Playbook never touches, stores, or gets billed for the sensitive content of a live forum meeting (arguably the most personal audio a member records all month). That's a real trust/liability win to put in the marketing, not just a cost dodge, "we never see or store your forum conversations, your own AI key does the listening."
- Technically: this is a solved pattern now (bring-your-own-API-key is now table stakes across consumer AI tooling in 2026). The app stores the key encrypted on-device or in the forum's account record, calls Claude/OpenAI directly from the client or via a thin pass-through proxy that never logs the payload, forwards audio/text, gets structured output back.

**Why NOT fully centralized:** it inverts the incentive. Every forum that turns on AI features makes the product less profitable, not more, and Colton would be forced to either raise price on the AI tier or throttle usage, both bad for a product whose entire pitch is "get back to meaningful connection, not mechanics."

**Where centralized still makes sense (cheap, low-volume, structured-data-only):**
- Forum health insights (Section 5.4): this is pattern detection over data already in D1 (timer overrun logs, parking lot counts), not audio, cheap enough (a few thousand tokens per forum per month) to run centrally and just absorb as a cost of the base subscription.
- Five-percent OCR: image-to-text on a handwritten note is cheap and infrequent (one photo per member per meeting), also fine to centralize.

**Practical building block:** ship a "Connect your AI" screen in Phase 2 (paste/OAuth a Claude or OpenAI key, scoped read-only to that provider's API, never Forum Playbook's own key), gate the audio-capture and voice-debrief features behind having one connected. No connected key means those two features are simply greyed out with a one-line "connect your AI to unlock this," everything else in Tier 2 (insights, OCR) works regardless.

## 7. Real-time sync architecture (the shared timer, technical)

The synced-timer feature ("prop up as many phones as you want, they're all on the same timer") is a genuinely different technical requirement from anything else Colton has shipped on this stack so far. The forum14/wilcoxsonhouse arcade pattern (Pages Functions + D1 + KV) is request/response, fine for leaderboards, too slow and too polling-heavy for a countdown clock multiple people are staring at in the same room expecting sub-second agreement.

**Recommendation: one Cloudflare Durable Object per active forum session.** A session (a specific meeting, today's Forum 14 gathering) gets one Durable Object instance that holds authoritative timer/agenda state and pushes it to every connected device over WebSocket. Any client's start/pause/add-time action goes to the Durable Object, which broadcasts the new state to all sockets in that session, this is the standard "shared live state small group" pattern Durable Objects exist for, and it composes cleanly with the existing D1 database (the Durable Object owns live session state, D1 owns durable history: parking lot, past meetings, roster). No new vendor, same Cloudflare account, same billing relationship Colton already has (Workers Paid is already active on the account per the automation registry, so this doesn't trip a new spend decision).

## 8. Account and forum data model

Entities (names are placeholders, not final schema, but the shape is the recommendation):

- **Forum** — id, name, brand/roster code, subscription status, plan (free/paid), created date, calendar id, template id (default or custom).
- **Member** — id, forum_id (a member can belong to more than one forum), name, email, role within that forum (moderator/timekeeper/member), notification preferences.
- **Subscription** — forum_id, plan, price paid ($20 web / whatever the App Store math nets out to per Section 9), billing source (web vs App Store), status, renewal date. One subscription per forum, not per member, matching the "unit of sale is the forum" decision Colton was explicit about.
- **Session** — a specific meeting instance: forum_id, date, agenda_template_id, current block/segment (live, owned by the Durable Object while active, snapshotted to D1 when the session ends), attendee list.
- **ParkingLotItem** — forum_id, topic, type (IQ/EQ), source (submitted by / pulled from a reflection), status (open/used), used_in_session_id once pulled.
- **Reflection** — forum_id, member_id, session_id, content (text or OCR'd image), visibility (forum-wide or private).
- **Decision** — forum_id, session_id, text, category (logistics/retreat/membership/etc), auto-pushed to the debrief email and to the calendar if it implies a date.
- **AgendaTemplate** — forum_id (null for the default global template), block structure (matches Section 3's table), segment timings, prompt strings per segment.
- **CalendarSync** — forum_id, provider (Google/Apple), sync token, last pushed decision id.
- **AIConnection** — member_id or forum_id (decide which, see Decision D2), provider (Claude/OpenAI), encrypted key reference, scopes, connected date. Never logged, never proxied through a store that retains payloads.

## 9. Payment model (this changes Colton's stated plan, in his favor)

Colton's plan on the recording: $20/month via the website, $25/month via the App Store, "the $5 delta covers Apple's platform fee." **That was true until May 2025 and no longer is, for US users.** As of the US court ruling that took effect then, Apple is required to let US apps link out to an external purchase flow with **zero Apple commission and no special entitlement required**, StoreKit's external-purchase-link path is optional infrastructure, not mandatory, for the US storefront specifically. (Sources below.)

**What this means practically:** if every purchase is routed through an external link that opens the website checkout in Safari, Colton keeps 100% of $20/month regardless of whether the tap started inside the app or on the site, no $25 tier needed at all for US users. The only reason to still offer native in-app purchase (Apple's own StoreKit checkout, Apple Pay, no leaving the app) is pure user convenience, and if he offers that path too, that's where the traditional 15-30% Apple cut still applies and a higher in-app price is genuinely justified.

**Recommendation:** ship one price, $20/month per forum, via an external link inside the app (small Apple-required disclosure sheet, "you're leaving the app to subscribe," then opens Safari to forumplaybook.com's checkout). Skip native in-app purchase entirely for v1, it adds App Store review complexity and Apple's cut for zero benefit at this stage. Revisit native IAP later only if conversion data shows the "leaving the app" friction is actually costing signups.

**App Store submission strategy, Phase 1:**
- Free download, resource/timer/agenda functionality unlocked immediately (matches the existing free-app framing).
- Paid forum features gated behind a forum login (roster code + name, the pattern already proven on wilcoxsonhouse/forum14), with the external-link subscribe button behind that gate.
- Apple's app review for external-purchase-link apps is a known, common path now (RevenueCat and others document it, see sources), not exotic, but it does require: the on-device disclosure sheet, the link opening only in the system browser (not an in-app webview), and 15-day transaction reporting to Apple even though no fee is owed. Build that reporting hook into the checkout flow from day one so it isn't a Phase 2 retrofit.

Sources: [Apple Developer: External Purchase Link entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.storekit.external-purchase-link), [RevenueCat: App-to-web purchase guidelines](https://www.revenuecat.com/blog/engineering/app-to-web-purchase-guidelines), [Stora: External Purchase Links implementation guide, 2026](https://stora.sh/blog/2026-05-16-apple-app-store-external-purchase-links-implementation-guide)

## 10. Build sequencing

**Phase 0 (now, no build):** Colton records the "Hey, I'm Colton, I built this" intro video, and marks up Section 3's taxonomy draft. Both unblock everything downstream and cost him ~30 minutes combined, not a build task.

**Phase 1 (Tier 1 baseline):**
1. Stand up the Cloudflare backend: D1 schema from Section 8, one Durable Object class for live sessions, roster-code login reusing the arcade pattern.
2. Wire forum-timer-ios to talk to that backend instead of running standalone, add the multi-device sync (Section 7).
3. Build the Agenda Engine UI on top of the existing timer app's screens.
4. Build Parking Lot + Calendar Hub screens.
5. Ship rule-based reminders (no AI).
6. Stand up the $20/month external-link checkout on forumplaybook.com, wire the disclosure sheet + Apple transaction reporting.
7. Submit to App Store.

**Phase 1.5:** Forum health insights (cheap, structured-data-only AI, no BYOK needed yet).

**Phase 2:** AI Connection screen (BYOK), live audio capture, voice-to-debrief, five-percent OCR.

## 11. Risks

- **Scope creep off a driving-and-thinking-out-loud brain dump.** This recording is a full product vision, not a locked spec. The taxonomy in Section 3 and the phase boundaries in Section 10 are this brief's attempt to draw a buildable Phase 1 line through it, Colton should push back on anything that doesn't match how Forum 14 actually runs.
- **Durable Objects is new infrastructure for this account.** Everything else Colton has shipped on Cloudflare is Pages + Functions + D1/KV. Durable Objects is a different primitive (still Cloudflare, still the same account/billing) and is the one piece of this brief that isn't just "reuse the arcade pattern."
- **BYOK adds an onboarding step Tier 1 doesn't have.** A forum moderator has to go get and paste an API key to unlock Tier 2. That's a real adoption cliff worth user-testing before assuming it's fine, per Colton's audience (business owners, EO-adjacent) it's probably fine, but it should be validated, not assumed.

## 12. Open decisions for Colton

COLTON DECISION 8-19-A: Is the product name "Forum Playbook" (existing brand, what he says on the recording) or a distinct new name/brand split from the free resource site? OPTIONS: (1) Forum Playbook, one brand, free resources plus paid OS, RECOMMEND, matches what he says on tape and reuses all existing brand equity and the App Store listing that already exists. (2) A new distinct name for the paid OS product, resource site stays separate. Say "D1 same" or "D1 new name: ___".

COLTON DECISION 8-19-B: Should the AI Connection (BYOK key) live on the Member or the Forum? OPTIONS: (1) Per-member, RECOMMEND, matches "individuals most likely have their own subscriptions to Claude or ChatGPT" from the recording, and means one member's key doesn't have to cover the whole forum's usage. (2) Per-forum, one shared key the moderator provides. Say "D2 member" or "D2 forum".

COLTON DECISION 8-19-C: Native in-app purchase in addition to the external-link $20 checkout, or skip it for v1 per Section 9's recommendation? RECOMMEND skip for v1. Say "D3 skip" or "D3 add IAP".

COLTON ACTION 8-19-A: Record the "Hey, I'm Colton, I built this" intro video whenever convenient, no deadline, it unblocks the website's "Who Built This" section and the App Store listing copy.

COLTON ACTION 8-19-B: Read Section 3's forum taxonomy draft and mark up anything that doesn't match how Forum 14 actually runs (timing, roles, whether Timekeeper is always the Moderator). This was his own action item from the recording; the draft exists so he's editing, not starting blank.
