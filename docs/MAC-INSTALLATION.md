# Opening Axiom on a Mac

The current public Mac releases are unsigned and not notarized. Apple's warning means it cannot verify the downloaded app; do not describe the release as Apple-verified.

1. Download the matching Apple Silicon or Intel DMG from the official Axiom GitHub release linked on the website.
2. Drag Axiom into Applications, eject the DMG and try opening Axiom from Applications once.
3. If macOS reports an unverified developer, open **System Settings → Privacy & Security**, scroll to Security, choose **Open Anyway**, then confirm Open. Only do this for a release you obtained from the official source and trust.

Apple documents this per-app exception at https://support.apple.com/en-gb/102445. Do not disable Gatekeeper globally or bypass an alert that says the app contains known malware. Managed church Macs may require their administrator's approval.

Camera and microphone permissions are separate. Allow Axiom under Privacy & Security → Camera/Microphone when you choose to use those features. Close other software using a capture card if the device cannot be opened.

## Signed releases when membership is available

Developer ID signing and notarization need an Apple Developer Program membership and a Developer ID Application certificate. Import that certificate as a base64 `.p12` GitHub Actions secret `MAC_CSC_LINK`, with its password in `MAC_CSC_KEY_PASSWORD`. Set `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` as Actions secrets. Never commit certificates, private keys or passwords. Bracket's Stripe account does not provide Apple signing credentials.

The Mac release workflow enables `AXIOM_MAC_SIGNED_RELEASE=true` only when the certificate secret exists. The desktop builder then requires code signing, hardened runtime, and notarization. Verify each app with `codesign --verify --deep --strict`, `xcrun stapler validate`, and `spctl --assess --type exec`. Keep the unsigned installation note until a notarized release has actually passed these checks.
