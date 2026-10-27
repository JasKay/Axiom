# Public product website and isolated presentation demo

The marketing site remains static HTML/CSS/JavaScript. No framework, authentication system or checkout was added.

- `/` is `web/index.html`, the product homepage.
- `/features` rewrites to the generated feature guide.
- `/demo` rewrites to the marketing-framed live demonstration.
- `/app` rewrites to the existing `workspace.html` entry point. Existing authentication, audience routing and membership checks remain in place.
- Existing `studio.html`, `tech-media.html`, Leader/U pages and API paths are retained.

`build.cjs` invokes `scripts/marketing-pages.cjs`. It reuses the homepage head/navigation/footer around the templates in `scripts/templates`. It also derives `demo-studio.html` and `demo-output.html` from the actual application pages. `scripts/dev.cjs` implements the same route aliases locally. Vercel redirects trailing slashes to keep relative asset paths predictable. A sitemap contains the three public marketing routes.

The demo loads `demo-bootstrap.js` before the normal application scripts. It activates only on the two generated sample filenames. The application store uses a separate session-storage project; UI preferences are namespaced into session storage instead of modifying personal local storage. The sample does not open the personal IndexedDB project. Its BroadcastChannel and output-window name are separate from personal presentations and unique to the demo browser tab. Reset prevents pending save handlers from restoring the discarded sample.

The demo cannot fetch church API or Blob upload endpoints; its static lookups omit credentials. It has no church membership context and does not poll real conversations. This is a usability isolation boundary, not a replacement for server authorization: API membership checks remain the security boundary. Real church login is still available through `/app` outside the sample. JavaScript and browser file support are necessary to explore the editor. Temporary browser storage has a smaller capacity than the desktop application.

The demo is the real editor and import/rendering engine, with a sample welcome, worship text, WEB Bible passage and closing. It supports local file selection, editing, preview and separate audience output. The marketing product image and Bible image are screenshots from this editor and its actual audience window. They do not imply church-team demo connectivity. No testimonials, customer statistics or unlicensed stock assets were introduced.

`State.scriptureSlide` creates the new Scripture reading layout without rewriting verse wording or footer metadata. `renderSlide` gives this layout distinct reference, passage and translation elements. Operator previews use the same proportional type scale as audience output. Existing authored slides keep their appearance; the Scripture reading preset can be applied to existing text slides from Backgrounds.

The /pricing page publishes the approved US$9.99/month church subscription. Its live availability is checked against /api/billing?action=config. Registration preserves subscription intent and Account settings opens the hosted Stripe checkout. Available planning, connected workspaces and Bible editions are distinguished from beta speech assistance and planned storage upgrades/licensed editions. Support links point to the existing repository documentation and issues; nonexistent legal/contact pages are not fabricated.

Validation includes the full Node test suite, browser checks of all public routes at nine widths, working navigation/downloads/images, real PDF/PPTX/image/video imports, editing/undo/reload/output, and demo isolation from a seeded personal project, preferences and output channel. Native packaged application checks gate the desktop release.