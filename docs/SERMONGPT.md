# SermonGPT starter beta

This web release uses browser speech recognition plus a deterministic phrase/reference matcher. It does **not** call an LLM or claim whole-Bible semantic retrieval. Coverage: spoken references for 66 books, including numbered books and basic English spoken chapter/verse numbers, plus 40 familiar passage/paraphrase groups. Arbitrary paraphrases can be missed, and token overlap can suggest incorrect passages. Always review.

Open SermonGPT → Start listening (supported browsers), or expand “Type a phrase or try an example”. Suggestions do not affect the live screen. Review verse fetches KJV from bible-api.com; only the subsequent Go Live action adds passage pages to the service and presents the first verse. Next advances the remaining verses. Dismiss hides a suggestion for this session; Clear session resets that history and stops listening.

The browser chooses the default microphone; configure a mixer/interface as the system input. English (en-GB) only. Sessions stop at 15 minutes, when leaving the panel, when the page becomes hidden, or on a permission/network error. Browser recognition can send audio to its own provider. Axiom does not record audio or persist transcripts. The transcript is held in page memory; selected scripture slides persist in the normal workspace. Verse references are sent to bible-api.com only when Review is clicked.

No API keys, paid account or billing are configured. There is no claim of offline speech recognition or universal browser support; manual input remains available. Desktop 0.3.0 binaries predate this web feature.

Before selling a full AI tier: connect a server-side transcription/retrieval provider, authenticated accounts and entitlements, durable usage quotas, billing, and provider privacy disclosures. Use a licensed corpus and return verified references/text, not model-written scripture. Measure paraphrase retrieval and false positives on recorded sermons with consent before considering automatic projection.

Validation: automated reference/paraphrase/negative tests, operator review gate, permission errors and session clearing; real browser KJV fetch and responsive layout checks. Live microphone transcription needs rehearsal with the actual browser, microphone and church audio setup.
