# Axiom desktop

Build the web workspace from the repository root, then run `npm ci` in this folder.

- Develop: `npm start`
- Mac DMGs: `npm run package -- --mac --x64 --arm64`
- Windows portable ZIP: `npm run package -- --win --x64`

Downloads contain the entire local app, PDF/PPTX import libraries, local workspace saving, and external live-output window support. Online Bible lookups still need a network connection; imported Bible files and saved service content work offline. Desktop storage is separate from web storage. Use Export/Import workspace to transfer a service.

Packages are unsigned and Macs are not notarized. Windows launch and physical external-screen placement require target-device rehearsal. No automatic updater is configured. Configure signing certificates before treating these as a frictionless public distribution.

`release/` and `app/` are generated. Icons and packaging configuration are source files. Never commit signing keys or credentials.
