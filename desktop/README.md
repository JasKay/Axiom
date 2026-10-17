# Axiom desktop

Version 0.4.2 packages the current Axiom Pro interface and includes optional update notifications. Standalone presentation needs no sign-up.

Build from the repository root with `npm ci` and `npm run build`, then run `npm ci --prefix desktop`.

- Develop: `npm start --prefix desktop`
- Mac DMGs: `npm run package --prefix desktop -- --mac --x64 --arm64`
- Windows installer and portable ZIP: `npm run package --prefix desktop -- --win --x64`
- Verify exact packaged source: `node desktop/verify-package.cjs`
- Test the native packaged app: `node desktop/smoke.cjs`

Push a matching version tag (for example `v0.4.2`) to run `.github/workflows/desktop-release.yml`. It builds on Windows and macOS, checks packaged file hashes and source commit, runs each native app with a 200-slide presentation, and publishes only after both platforms pass. All four files and SHA256SUMS are attached to the release. Homepage downloads should be changed only after those assets are published.

The sidebar shows the running version and Check for updates. Windows uses electron-updater with the public JasKay/Axiom GitHub release feed. Update and restart downloads and checks the SHA-512 metadata, flushes the workspace, runs the NSIS installer and restarts. autoDownload and autoInstallOnAppQuit are disabled. Open live output requires confirmation. Packages remain unsigned; Authenticode verification is disabled until a signing identity is configured, while download checksum verification stays enabled. Release assets include latest.yml and the installer blockmap. Mac retains the official DMG download flow.

Versions 0.4.1 and earlier need one installer update to gain this capability. The installed Windows upgrade test builds a baseline in an isolated directory and verifies download, installation, restart and preserved workspace against the release installer.

The app ID, product name, user-data location and `presenter://app` origin stay unchanged, preserving saved services and media. Installer updates do not delete app data. Export/Import under Tools remains available for backups and transfers. Standalone local storage is separate from church cloud workspaces.

Packages are unsigned; Mac DMGs are not notarized. Operating systems may ask the user to verify the app. Native smoke tests do not replace rehearsal on physical projectors or verify OS trust dialogs. `release/` and `app/` are generated and must not be committed. Never commit signing keys or credentials.

Desktop saves use `workspace.json` in the existing Axiom app data directory. The previous snapshot is retained as `workspace.json.previous`. Older IndexedDB data is read for migration and left intact. Recovery archives the original file before starting fresh. Native feature validation runs before publishing installers.
