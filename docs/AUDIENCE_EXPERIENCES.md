# Connected Axiom experiences

Church invitations assign both an audience and an editing role. Existing owners and staff default to AxiomLead; existing viewers migrate to AxiomU. Owners can change other members' groups in People & invitations.

- AxiomLead: service planning, private study notes, drag or arrow reordering, team communication and publication. Send to Tech creates an explicit snapshot of the running order, its referenced slide content and production notes.
- Axiom Pro: receives those snapshots and service files, acknowledges handoffs, exchanges comments, and imports plans into the existing offline presentation engine. New handoffs also appear inside the studio.
- AxiomU: published summaries, highlights, scriptures, church notes and HTTPS social links. Personal notes stay in the current browser. Guest service links remain available without accounts.

Server endpoints enforce audience membership. Tech never receives private study notes; members receive no staff workspace, files or comments. Web studio access requires Tech membership while online. Prepared Tech browsers retain offline presentation access. The standalone desktop presentation engine remains usable locally without a cloud account; desktop installers must be rebuilt separately to ship these source updates.

Apply db/004_audience_experiences.sql through npm run migrate before deployment. No paid service or new provider is introduced.

A Pastor or Program team member registers a church with their own account. Registration creates the church, owner membership in AxiomLead, and initial service workspace before returning a session. Signup without a church code cannot request Tech or congregation access.

Church owners and leadership administrators generate invitation codes for AxiomLead (editor), Axiom Pro (editor), or AxiomU (viewer). Codes expire after seven days, allow 1–500 accounts (25 by default), and can be revoked. Registration automatically creates one invitation link for each of the three workspaces. Church owners and leadership administrators can return to People & invitations to copy these links, create replacements, and see expiry and usage. Only code hashes are stored; new codes can be reconstructed server-side from the authentication secret and their random IDs for authorized leadership. Older randomly-generated codes remain valid but cannot be recovered; create a new link if needed. Rotating BETTER_AUTH_SECRET also requires generating new recoverable links; already-shared codes continue to validate against their stored hashes until revoked or expired. Codes grant access to anyone holding them, so share them privately with the intended team.

Joining signup validates the code before creating an account, then locks and consumes its use while inserting membership. The church and audience come from the server invitation, never a submitted role. If membership setup fails after Better Auth creates a user, the new account is removed before a session cookie is returned. Concurrent signups cannot exceed the code's use limit. Existing signed-in accounts can use a code only if unassigned or already in that church; code retries never downgrade or reassign existing members. Existing username-targeted invitation links remain supported. Assigned accounts cannot create another church or switch their own experience.

Apply `db/005_church_join_codes.sql` before deploying these changes (`npm run migrate`). Existing churches, accounts and memberships are retained. The migration and feature have not been applied to production automatically.

Test the actual API and SQL using an isolated local database: set `AXIOM_DATABASE_URL`, `BETTER_AUTH_SECRET` and `AXIOM_SIGNUP_TEST_URL`, apply both schema migrations, start the local API, then run `npm run test:signup`. The signup integration suite refuses non-local API/database hosts and removes only its own fixtures.

AxiomLead Workspace has three navigation items: Service plans, Previous services, and People & invitations. Each service has Agenda, Notes, Members, and Files & discussion tabs. Service notes are included in explicit Tech handoffs; private study notes stay in a collapsed section and are never sent. Selecting text in service notes can create a member-highlight draft, available only to owners/administrators. Drafts require an explicit Publish action to update member content. Saving a draft never silently updates an existing publication.

Previous services are grouped by their scheduled date. Search and reopen them, or reuse a plan as an independent service with a new date, new content IDs, draft approval status, and public-sharing fields cleared. Original services and old template data are retained. The Templates and Worship Assistant pages, sidebar footer, repeated role explanations and empty prayer-request panel have been removed from AxiomLead. Invitations, team access, files and comments remain available with compact secondary controls.

Signup asks whether to register a church as Pastor / Program or join with a church code. No experience picker or owner experience switcher is offered. Axiom Pro uses the shared service-desk tabs and a matching studio stylesheet (pro.css).

## Named workspaces and invitation links

- AxiomLead Workspace: `axiomlead.html` (the older `pastor-program.html` link remains supported).
- Axiom Pro Workspace: `tech-media.html` (Axiom Pro).
- AxiomU Workspace: `members.html` (AxiomU).

The build emits these three entry pages from the shared workspace shell. The invitation page looks up the actual church and workspace from the code before signup, and invited users do not see the church-registration selector. Server membership determines access. Workspace-specific sign-in checks the assigned audience before issuing session cookies; rejected sign-ins remove the newly created session. Workspace-specific signup checks that the invitation audience matches the entry page. Existing sessions opening another workspace see an access message and a link to their assigned workspace. Existing members following a different team's invitation are rejected without changing their group or consuming a code use.

Members receive only published congregation content; no Tech handoffs, staff files, invitation links or leadership notes are returned. Members opening a Tech URL see an access message, and the studio guard blocks operator scripts from loading. The invitation-information endpoint exposes only the church name, workspace name and description to holders of a valid, active code.

## Unified Axiom Pro workspace

`tech-media.html` now contains the presentation engine and team tools in one page. `studio.html` remains a compatible entry and canonicalizes to the same workspace; generic workspace access routes Tech there after role verification. Operator scripts still load only after Tech membership is verified online. Offline access requires a previously verified Tech device.

The sidebar contains Presentation, Content Library, Messages and AxiomAI BETA. Bible and Backgrounds open as compact dialogs from the Presentation toolbar. Shared plans are accessible from Presentation and include shared agenda, Tech notes, file downloads, acknowledgement and an explicit Prepare service action. Preparing a service saves the current local project first, then installs the selected shared snapshot without leaving the page; replacing an existing copy still requires confirmation. Local edits are never replaced by background polling. Message drafts survive refreshes and service switching within the page. Unread indicators are tracked per service on the device.

Backgrounds include built-in gradients and a local image library. PNG, JPEG and WebP uploads under 10 MB are resized to fit 1920×1080 and embedded as JPEG, with up to 20 images in the library. Backgrounds apply to a selected text page or all text pages in the current service. They persist with the project and render in previews, live output and prepared offline services. Background changes do not alter the current live screen until Go Live is pressed. The interface has no Tools or workspace backup controls. Download desktop is available on the website; app updates remain explicit in the desktop sidebar.

## Shared service navigation

Apply `db/006_service_activity.sql` with the workspace migrations before deploying this version. Church members share a service directory containing only service IDs, names, dates, archive flags, availability and last-worked timestamps. Leadership changes and edits to linked Tech copies update activity. Private notes, agendas and presentation content continue to follow audience permissions; members cannot alter activity. The picker offers Last worked on and role-specific navigation. Unshared service content remains unavailable. Standalone local Tech drafts are device-local until linked to a church plan.

## Production team workflow

Pro navigation includes SVG icons. Beneath Presentation, a compact service picker selects the church plan or device-only service, and a bounded, independently scrolling list opens its presentation decks. Saved status, desktop downloads or app updates, and the signed-in account appear at the bottom. Tools, Undo/Redo buttons and backup controls are removed. Only Open live screen remains in the top-right controls. Presentation and Content Library each support Thumbnails, Full page and List views, remembered separately on the device.

New or resent agendas show an Agenda received notice in Presentation and an agenda attachment in the matching Messages thread. Review agenda opens the shared agenda and notes immediately. Read indicators are stored per service and account on the device. Preparing an updated service remains explicit and confirms replacement of an existing local copy. Receiving or reviewing an agenda never overwrites Tech preparation automatically.

## Long desktop presentations

At desktop widths (900px and above), the slide grid and running order have their own scroll areas. The toolbar, slide frame, Private preview and Live output remain in place. Preview and output monitors share the fixed right column even at the desktop app's minimum window size. Thumbnail mode fits roughly five visible rows at typical desktop sizes, reducing the number of rows at very small windows to keep thumbnails usable. Full page and List views keep the same independent scrolling. Dragging a slide moves it within its item, preserves slide IDs and the live output cursor, and supports undo. Dragging near the grid edge scrolls the grid.

Verified with 200 slides at 1440×1000, 1280×800, 1024×768 and 900×650 in all three view modes, including selection of the last page, reordering and undo.

## Meeting presentations and the service hub (0.4.9)

A local service is the meeting folder; optional decks group its existing entries. Older services acquire Main presentation without changing slide/entry IDs. The library remains one reusable collection and its destination controls choose the meeting and deck. Library imports do not automatically attach to a meeting. Deck selection does not change live output, and live navigation stays in the deck originally sent live. Local archive/restore changes device organisation only; church archive status is still managed by AxiomLead.

Tech service hubs scope agenda, Lead notes, shared files, message drafts and discussion to the selected church service ID. Creating a device-only meeting clears the previous church thread; team messages need a service shared from AxiomLead. Tech preparation notes are saved locally with the meeting and are not automatically published to members. Congregation content still comes only from leadership publication. New deck metadata is saved automatically with the local workspace.

Desktop update checks remain quiet and explicit. A feature notice offers a summary and a Later option that suppresses the notice for that version for seven days; manual Check for updates remains available. Web Pro checks the build-generated app-release.json and offers Save & reload with the same quiet dismissal. Active live output requires confirmation, workspace saves must succeed, and no update or reload happens automatically.

## Service follow-up (web 0.4.10)

Apply db/007_member_notes.sql with npm run migrate before deploying. Optional congregation signup accepts an enabled public service token and always assigns viewer/u in that church; it never grants staff permissions. Published service links expose only enabled public snapshots and their church's published history.

AxiomU account notes use member-notes: reads and writes are scoped to the authenticated user and church, and writes require a published service. Leadership and Tech cannot read these private notes. Guest notes stay on the device until the guest creates an account from that service, when their draft is imported. Failed account saves retain a pending local draft for retry.

Lead and Pro share live event notifications with reconnects. Pro retains its three-second refresh and Lead has a ten-second fallback for interrupted streams. People & invitations refreshes when opened and lists every membership, including Tech and congregation. An invitation link alone is not a membership.

Validation: npm test; npm run test:integration (disposable records and cleanup); real browser signup, guest draft import, account-note reload, public history, team visibility, mobile drawer and bidirectional live messaging; native Electron team fixture. Public desktop installers remain version 0.4.9 until a separately validated desktop release.

## Media inspection

Presentation thumbnails keep a readable minimum size instead of fitting five rows into every window. The library places media above destination selectors. Image, video and document cards open a large preview with page navigation and an explicit Add to presentation action; previewing does not send anything live. Private Preview and Live Output stay together in the fixed monitor column.

## Collapsible navigation

Lead and Pro have a header control to collapse and reopen the sidebar. The preference is stored separately for Pro and the church web workspace and survives reloads. Collapsing frees content width without changing the active service, deck or live output. Lead retains its mobile Menu drawer. Library content remains reusable across services and decks.
