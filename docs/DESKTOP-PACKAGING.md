# Desktop package size

The Pro desktop build retains the redesigned interface and the same Electron runtime. Its asset copy is now separate from the complete web build.

`scripts/desktop-assets.cjs` excludes the Lead-only text-generation worker and ONNX runtimes, the unused presentation screenshot, and HTML entry points outside Pro and live output. The full website keeps these files. Pro's scripture assistant uses `sermon-engine.js`, which remains bundled.

PDF rendering, character maps, fonts and decoders, PowerPoint rendering, image/video handling, the bundled UI font, native updates, and local workspace storage remain in the desktop package. These changes do not introduce new first-use downloads for presentation or imports.

## Measured comparison

The comparison builds the same redesigned app twice with the same locked dependencies and Electron version. The baseline uses the complete website-copy policy from `badbc29f81dfda72afc1425cf46b17db9c90824e`; the optimized build uses the Pro asset filter. Both are packaged on the same runner.

The app assets decreased from 96.3 MB to 9.1 MB. Sizes below use decimal MB, and installed sizes count unpacked application files rather than user presentations or caches.

| Package | Before | After | Reduction |
|---|---:|---:|---:|
| Windows installer | 127.3 MB | 113.5 MB | 10.84% |
| Windows portable ZIP | 176.6 MB | 155.9 MB | 11.73% |
| Apple Silicon DMG | 152.9 MB | 131.3 MB | 14.11% |
| Intel DMG | 156.4 MB | 134.9 MB | 13.78% |
| Windows installed app | 481.2 MB | 393.9 MB | 18.14% |
| Apple Silicon installed app | 397.8 MB | 310.5 MB | 21.94% |
| Intel installed app | 400.9 MB | 313.6 MB | 21.78% |

Build and feature results: https://github.com/JasKay/Axiom/actions/runs/39863952927

Both platform jobs passed. Windows ran 69 tests with no failures; Mac ran 68 with one platform-specific skip. The optimized native packages passed PDF/PowerPoint, image/video, live output, scripture matching, scrolling, persistence, recovery and team checks. The installed Windows updater also passed its upgrade, restart and saved-service checks. These are review artifacts, not a newly published desktop release.

## Verification and future changes

`tests/desktop-assets.test.cjs` checks that the desktop filter retains offline import components and leaves the web source intact. The native checks exercise imports, output, video playback, scripture matching, persistence, team features, and panel layout in the resulting packages.

For another size comparison, push a branch under `desktop-size/` or dispatch the **Desktop size and feature verification** workflow. `scripts/measure-desktop.cjs` records exact before/after bytes in a JSON artifact and the workflow summary. Smaller installers are uploaded after native verification; this workflow does not publish a release.

New desktop HTML entry points must be added to `desktopPages`. If generative text preparation is added to Pro later, include the worker and its required runtimes explicitly rather than copying every web runtime into the installer.

## Operator desk v0.4.22

The operator layout retains the same desktop asset filter and introduces no additional runtime dependencies. Packaged-source verification now also hashes `pro-desk.js` and `pro-desk.css`.

Native validation: https://github.com/JasKay/Axiom/actions/runs/39883065517

Release verification and installers: https://github.com/JasKay/Axiom/actions/runs/39883380365 and https://github.com/JasKay/Axiom/releases/tag/v0.4.22

The native checks cover resizable panes, both themes, fixed Preview/Public during editing, reusable playlists, service and presentation actions, long-list canvas and dock scrolling, PDF/PowerPoint imports, image/video output, private Bible detection, persisted workspaces, recovery, shared messages/files and installed Windows upgrade/restart.
