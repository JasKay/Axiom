# Axiom worship platform — implementation notes

Axiom 0.4 separates the public website (`/`) from the shared planning workspace (`/workspace.html`) and the original device-local presentation studio (`/studio.html`). The desktop build still opens the studio, and the original `church-presenter` IndexedDB database remains intact.

## Free, no-card architecture

- **Hosting:** the existing Vercel Hobby project. No paid plan upgrade was made.
- **Database:** the provisioned Neon `axiom-workspace` database uses the Free plan. `AXIOM_` environment names preserve the project's pre-existing database configuration.
- **Accounts:** Better Auth runs inside Axiom's Vercel functions, with username/password authentication, HTTP-only cookies, a seven-day session lifetime, database-backed rate limits, and revocation when passwords change. There is no external identity subscription or custom-domain requirement. Usernames are immutable and globally unique. Better Auth requires an internal email column; it stores a generated `username@users.axiom.invalid` identifier, never a real email address. Email sign-in, email reset, social sign-in, and unrestricted account endpoints are not exposed.
- **AI:** SmolLM2 135M runs through Transformers.js and ONNX Runtime in a browser worker. The first opt-in download is approximately 200 MB. There is no inference API, API key, card requirement, or server inference charge. Draft quality and speed reflect the small model and the user's device. Generated outlines and slides stay editable and must be explicitly added to a plan. The model uses Apache 2.0 licensing: https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX .
- **Files:** a private Vercel Blob store connected to the existing project. Files require authenticated church membership; uploaded files are downloaded as attachments and cannot be executed as same-origin pages.

Free hosted services have usage limits and may pause when allowances are exhausted. Axiom does not automatically purchase capacity or switch to paid plans. Device-local presentations continue independently. No unlimited-service guarantee is implied.

## Planning and collaboration

Services retain the existing version-2 library and running-order format. Entries gain type, duration, responsibility, preparation status, private notes, and an explicit congregation-sharing preference. Services gain a date, church-local start time, private notes, and public announcements. Templates embed independent snapshots so removing library content later does not destroy a saved template.

Cloud planning uses a versioned JSONB workspace aggregate to preserve compatibility with the presentation engine. Every update locks the workspace row and compares the supplied revision. Stale edits receive HTTP 409. The browser retains failed drafts in IndexedDB and offers download, retry, or reloading the shared version. Comments, memberships, invitations, files, public services, and prayers use separate relational tables. Foreign keys scope records to a church.

The owner manages membership roles. Owners and administrators approve content, publish services, and create invitations. Editors prepare plans and content; changes to approved material must return to Draft or Ready before they can be saved. Viewers read and comment. Backend checks enforce these rules independently of disabled UI controls.

Invitations contain a random one-use secret, expire after seven days, and are bound to a username. Only a SHA-256 hash is stored. The owner shares the link themselves; Axiom does not send email. New members can register that username before accepting. Keep account passwords in a password manager: there is no email recovery service. Signed-in users can change their password and revoke other sessions.

Server-sent events notify online clients about workspace revisions, comments, and membership counts. Streams reconnect, and edited forms are not silently replaced. This is coordinated editing with conflict detection, rather than character-level simultaneous document merging.

## Presentation and congregation handoff

Prepare to present downloads the selected shared service into the original local studio. Existing local services remain. The downloaded service has stable namespaced IDs and retains cloud-source metadata. Replacing a previously downloaded item requires confirmation. Shared files are downloaded separately and imported through the existing image, video, PDF, or PPTX importer.

Only opted-in, approved **scripture and announcement text** enters a congregation snapshot. Team responsibilities, preparation notes, comments, media files, and unapproved material are excluded. Public announcements are administrator-controlled. Public links use random 192-bit tokens and can be disabled. Guest notes use localStorage on the guest's device and are never submitted. Prayer requests require consent and are visible only to owners and administrators; anonymous requests are supported and submissions are rate-limited.

When a downloaded shared service is projected while online and signed in, only approved public slides can synchronise to Congregation Connect. The server resolves slide IDs against its approved snapshot. Blackout, clear-text, or an unshared slide clears the congregation's live passage. Local projection never waits for the network.

## Offline behavior

The service worker preserves cached studio code and document renderers. Optional AI runtime files are cached only after use, and model caches survive application updates. Online account APIs, files, and congregation endpoints are excluded from service-worker caching. Cloud editing needs a connection; download a service before presenting offline. Rehearse imports, video playback, microphone support, and physical projector placement on the actual presentation hardware.

## Setup and checks

Use Node.js 24. Run `npm ci`, `npm run migrate`, `node --env-file=.env.local scripts/migrate-auth.cjs`, and `npm run dev`. The development server serves both static files and the same Vercel API handlers at http://127.0.0.1:4173 . Environment variables are documented in `.env.example`; never commit `.env.local`.

`npm test` builds and runs presentation, document-rendering, Bible, scripture-assistant, state, and planning/security tests. `npm run test:integration` uses disposable records in the provisioned database to test tenant isolation, permissions, version conflicts, invitations, public sharing, and private prayer requests. The test deletes only its own generated church records. CI runs the build and regression suite without cloud secrets.

## Operational limits

Cloud workspace bodies are limited to 3 MB; keep large presentation media in the offline studio or private file storage. Each workspace allows up to 100 services and 1,000 library items, and up to 20 reusable templates. Guest notes and local services can be lost if browser storage is cleared; export backups. Account password recovery, automatic invitation emails, CCLI licensing, and physical-hardware verification are not included in this release.
