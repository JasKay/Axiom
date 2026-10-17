# Axiom desktop

Version 0.4.1 packages the current Axiom Pro interface and includes optional update notifications. Standalone presentation needs no sign-up.

Build from the repository root with `npm ci` and `npm run build`, then run `npm ci --prefix desktop`.

- Develop: `npm start --prefix desktop`
- Mac DMGs: `npm run package --prefix desktop -- --mac --x64 --arm64`
- Windows installer and portable ZIP: `npm run package --prefix desktop -- --win --x64`
- Verify exact packaged source: `node desktop/verify-package.cjs`
- Test the native packaged app: `node desktop/smoke.cjs`

Push a matching version tag (for example `v0.4.1`) to run `.github/workflows/desktop-release.yml`. It builds on Windows and macOS, checks packaged file hashes and source commit, runs each native app with a 200-slide presentation, and publishes only after both platforms pass. All four files and SHA256SUMS are attached to the release. Homepage downloads should be changed only after those assets are published.

The sidebar shows the running desktop version and Check for updates. The main process checks the latest stable public GitHub release, with the public website download manifest as a fallback, and accepts only the exact official platform installer URL. Checks also run after startup; a newer version shows a notice without interrupting presentation. Download update opens that installer in the browser. Users choose when to close Axiom and run it. Version 0.3.0 users must download 0.4.1 once to get this feature.

The app ID, product name, user-data location and `presenter://app` origin stay unchanged, preserving saved services and media. Installer updates do not delete app data. Export/Import under Tools remains available for backups and transfers. Standalone local storage is separate from church cloud workspaces.

Packages are unsigned; Mac DMGs are not notarized. Operating systems may ask the user to verify the app. Native smoke tests do not replace rehearsal on physical projectors or verify OS trust dialogs. `release/` and `app/` are generated and must not be committed. Never commit signing keys or credentials.

Desktop saves use `workspace.json` in the existing Axiom app data directory. The previous snapshot is retained as `workspace.json.previous`. Older IndexedDB data is read for migration and left intact. Recovery archives the original file before starting fresh. Native feature validation runs before publishing installers.
