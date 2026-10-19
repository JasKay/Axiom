# Mac signing and notarization

The existing DMGs are unsigned and unnotarized. They can trigger Apple's warning. A new version number alone does not resolve this.

1. Enroll the publisher in the Apple Developer Program: https://developer.apple.com/programs/enroll/
2. Create a **Developer ID Application** signing certificate. Export it with its private key as a password-protected P12.
3. Store `CSC_LINK` and `CSC_KEY_PASSWORD` through a secure CI secret manager. Never commit certificates or passwords.
4. Configure notarization credentials through the same secret manager: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`.
5. Build from `desktop` with `electron-builder --config electron-builder.signed.cjs --mac --arm64 --x64 --publish never`. Do not set `CSC_IDENTITY_AUTO_DISCOVERY=false` for this build.

The signed configuration requires signing and notarization and fails rather than quietly producing an unsigned app. It is opt-in until the publisher's membership and credentials are ready. The existing release workflow still produces unsigned Mac DMGs.

Before replacing public Mac downloads, run `codesign --verify --deep --strict --verbose=2` and `xcrun stapler validate` on each built Axiom.app, then `spctl --assess --type execute --verbose=4`. Check both Intel and Apple Silicon builds. Publish only after signing, notarization and the normal native feature tests pass.

References: https://www.electron.build/v26/docs/mac/ and https://developer.apple.com/developer-id/
