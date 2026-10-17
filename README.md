# Axiom 0.4

A church presentation workspace with a web app and a desktop shell using the same interface. Website: https://axiom-theta-one.vercel.app · Source: https://github.com/JasKay/Axiom.

## Worship platform (0.4)

The public website now lives at `/`, shared church planning at `/workspace.html`, and the offline presentation studio at `/studio.html`. Includes timed service plans, templates, username accounts, church roles, invitations, live team comments, private files, and Congregation Connect with QR links, scriptures, local notes, and prayer requests. AI preparation runs locally in the browser after an optional model download; no paid API or card is required. Hosting and storage use free tiers with usage limits.

See [platform architecture, setup, and limits](docs/WORSHIP-PLATFORM.md). Use `npm run dev` for the full-stack local preview; configure the environment and run both documented migrations for cloud features. The original device-local studio remains usable without accounts. The sections below describe its existing presentation capabilities.

## Run the website locally

Install Node.js 24 or later. In this project root:

```
npm ci
npm test
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. `npm test` also builds the app. For build-only use, run `npm run build`.

## Publish on Vercel

Push this project root to a GitHub repository, then import that repository in Vercel. vercel.json selects the static preset, `npm run build`, and dist/ as the output folder. No secret keys or environment variables are needed. Keep package-lock.json committed.

## What this release includes

- Multiple named services with create, rename, duplicate and delete controls.
- Running order with drag/drop and accessible move buttons.
- Reusable searchable content library with type filtering.
- Custom text pages, plus text overlays and references over an image or video.
- Page creation, editing, duplicate, delete and reorder.
- Lyrics split by blank lines, with up to four lines per page.
- Image and video uploads. MP4 with H.264/AAC is recommended.
- PDF and .pptx imports, one document page per image slide.
- Bible JSON import, passage/keyword search and selected verse slides.
- Private preparation preview and separate live output.
- Cross-item Next/Previous, blackout, clear/restore text, video play/pause/restart, mute and looping.
- Undo/redo, automatic device-local saving and full workspace JSON backup including web media.
- Installable PWA shell and offline cached application files. Use online once and let installation finish before rehearsing offline. PowerPoint font substitutes may differ offline.
- Electron desktop shell with an external output window placed on the first connected non-primary display.

## Use during a service

Choose or create a service. Add pages, songs, media or documents. Selecting an item/page only changes your private preview. Edit the page, click Save page, then Go Live when ready. The live screen keeps showing its existing snapshot while you prepare something else.

In a browser: allow popups, click Open live screen, set your operating system to extended displays, and move the output window onto the projector. Press F in the output window for fullscreen. The browser version does not automatically choose a physical display. Left/Right on the operator screen advances the live service, B toggles blackout, Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z redoes. Shortcuts pause while typing or using a dialog.

On a supported browser, Install app opens the website in its own app window. On iPhone use Share → Add to Home Screen. Installation availability depends on the browser and secure HTTPS hosting.

## Imports and limits

PDF/PPTX pages are flattened to images. They can be reordered and given text overlays, but their original text/shapes are not individually editable. PowerPoint animation and embedded media are not imported as live media. Fonts, complex charts and SmartArt may differ. Export PowerPoint to PDF first for the closest visual match. Legacy .ppt needs conversion to .pptx or PDF. Rehearse imported decks before presenting.

Files are processed locally in the browser. The PowerPoint renderer may request Google Fonts substitutes. It does not upload your presentation to a conversion server.

Limits: 100 MB per image/video, 60 MB per document, 150 pages per document, 15 MB per Bible JSON, 200 MB for a workspace backup import. Browser storage capacity and mobile memory vary. Large document imports can take time.

Bible schema: `{"translation":"Name","verses":[{"book":"John","chapter":3,"verse":16,"text":"Verse text"}]}`. KJV passage lookup is available online through bible-api.com. NIV, NLT, TPT and MSG appear in the translation selector, but need an authorized imported file or licensed provider connection. No copyrighted full translation is bundled. Import a translation you have permission to store/display. Book names match the imported file; references support one chapter at a time.

Services reference the same library item, so editing that item affects its use in other services. Duplicate an item to make an independent version. Removing an item from a service keeps it in the library. Library deletion requires removing its service references first. Undo can restore deletes during the current session.

## Saving and backups

IndexedDB saves the workspace on this browser/device, not a cloud account. Clearing site data removes it. Undo history lasts only for the current session. Export workspace includes embedded media and documents as a JSON backup. Importing replaces the current workspace, with Undo available immediately. Very large backups are memory-intensive. Save after editing and wait for the saved indicator before closing.

Browser video autoplay/audio can require interaction in the output window. Native video controls appear there when autoplay is blocked. Audio uses the selected computer audio device. Clear text keeps video timing and playback state when the same live page stays visible. Blackout stops video playback and restoring it starts the current video again.

## Desktop app

After `npm ci` and `npm run build` in the project root:

```
cd desktop
npm install
npm start
```

The desktop shell loads desktop/app/, generated from the same web build. Electron uses a local secure custom scheme, isolated sandboxed renderers, and blocks external page navigation/new windows. It places the output on the first external display when connected. Without one, output opens as a normal window. F toggles fullscreen and Esc exits it. The desktop workspace is separate from the browser workspace; export/import to transfer it.

Desktop downloads are published through GitHub Releases: Mac Intel and Apple Silicon DMGs, plus a Windows x64 portable ZIP. These early packages are unsigned and not notarized; operating systems may warn or block launch. Production signing/notarization and automatic updates are not configured. Windows packages are built but must be rehearsed on Windows hardware.

## Validation

`npm test` runs parsing/state tests, DOM integration for the operator workflow, and actual PDF/PPTX-to-canvas fixture rendering with a check for visible page marks. Syntax checks pass. Physical projector positioning, browser install prompts, service-worker offline behaviour, desktop startup and real video/audio codecs still require a rehearsal on your target hardware. Desktop and mobile layouts were inspected in Chrome. A generated H.264/AAC MP4 was tested in the actual audience window, including play, pause, restart and clear-text continuity.

This is a first release of the defined core workflow. It does not yet include stage/confidence displays, collaboration/cloud accounts, streaming outputs, automatic speech-triggered verses, CCLI integrations, live PowerPoint animations or multiple independent output channels.


## 0.3 update

Axiom has a new visual identity and responsive studio layout. Download desktop opens platform-specific desktop downloads. Browser installation is no longer offered. The original browser storage name is preserved to retain existing services.

The audience content security policy now permits embedded video data. The private preview has native video controls, the operator live monitor plays muted, and the audience output offers a Play button only when autoplay permission is required. Unsupported formats show an error instead. Codec support still depends on platform/browser; H.264/AAC MP4 is the tested format.

## Bible connections

See [licensed Bible setup](docs/BIBLE-INTEGRATION.md). No API key or licensed NIV/NLT/TPT/MSG text ships with the app. Imported translations can coexist and remain available offline. Online KJV requires a network connection; saved presentation slides remain local. Licensed API.Bible content is search-preview only until presentation, export and offline rights are implemented and approved.


## Church-first accounts

A Pastor or Program team member registers their church and its first AxiomLead account together. Church leadership creates role-specific invitation codes so other leaders, Tech teams and congregation members join the same church. Code holders receive the assigned experience automatically. Codes expire after seven days, have a configurable use limit and can be revoked.

Apply the workspace schema, including `db/005_church_join_codes.sql` and `db/006_service_activity.sql`, before deploying this account flow. See [church experiences and signup testing](docs/AUDIENCE_EXPERIENCES.md) for access rules and isolated integration-test instructions. Existing accounts and church memberships are retained.

Standalone desktop downloads are available publicly from the homepage’s Download Axiom Pro section. They link directly to the Mac Apple Silicon, Mac Intel and Windows release files in `web/downloads.json`; no account or church invitation is required. Church accounts remain required for team collaboration. The displayed desktop version identifies the currently published installer release independently of web-source updates.
