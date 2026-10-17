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

Backgrounds include built-in gradients and a local image library. PNG, JPEG and WebP uploads under 10 MB are resized to fit 1920×1080 and embedded as JPEG, with up to 20 images in the library. Backgrounds apply to a selected text page or all text pages in the current service. They persist with the project and render in previews, live output and prepared offline services. Background changes do not alter the current live screen until Go Live is pressed. Export/import remain available under Tools; the only installation action is Download desktop.

## Shared service navigation

Apply `db/006_service_activity.sql` with the workspace migrations before deploying this version. Church members share a service directory containing only service IDs, names, dates, archive flags, availability and last-worked timestamps. Leadership changes and edits to linked Tech copies update activity. Private notes, agendas and presentation content continue to follow audience permissions; members cannot alter activity. The picker offers Last worked on and role-specific navigation. Unshared service content remains unavailable. Standalone local Tech drafts are device-local until linked to a church plan.

## Production team workflow

Pro navigation includes SVG icons. Church services live in the sidebar; device-only drafts are under a collapsed section. Download desktop, Tools (undo/redo, backup import/export, shortcuts), save status and the signed-in account appear at the bottom. Only Open live screen remains in the top-right controls. Presentation and Content Library each support Thumbnails, Full page and List views, remembered separately on the device.

New or resent agendas show an Agenda received notice in Presentation and an agenda attachment in the matching Messages thread. Review agenda opens the shared agenda and notes immediately. Read indicators are stored per service and account on the device. Preparing an updated service remains explicit and confirms replacement of an existing local copy. Receiving or reviewing an agenda never overwrites Tech preparation automatically.
