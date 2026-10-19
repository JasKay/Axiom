# Windows publisher trust

The current Axiom EXE is unsigned. A successful download can still prompt a browser or Windows warning. This is distinct from updater download, checksum or installation errors.

Production distribution needs a verified signing identity: either a supported public-trust code signing certificate or Microsoft Artifact Signing. Choose and enroll the publisher before enabling signing in CI. Never commit certificates or account credentials.

For the installed electron-builder 26 configuration, configure the selected signing provider under `win.signtoolOptions` or `win.azureSignOptions`, set `forceCodeSigning: true`, and remove the current `win.verifyUpdateCodeSignature: false` when moving to signed releases. Pin the expected publisher for the updater. Provide credentials only through CI secrets or an approved secure signing service. Avoid mixing v27 configuration keys into the v26 project.

Verify every app and installer with `Get-AuthenticodeSignature`: status must be Valid and the signer must match the expected publisher. Retain timestamping and run the real installed-upgrade checks before publication. Signing establishes the publisher; it does not promise that SmartScreen reputation warnings immediately disappear.

References:
- https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation
- https://www.electron.build/v26/docs/features/code-signing/code-signing-win/
