# Bible translations in Axiom

KJV online passage lookup uses https://bible-api.com with an explicit `translation=kjv` request. It does not download an entire Bible. The service has rate limits and no availability guarantee. Authorized JSON imports remain the offline option. Check translation rights in the territories where you distribute or display content; KJV should not be described as universally public domain (UK rights differ).

NIV, NLT and MSG are advertised by API.Bible. TPT availability has not been verified; it needs an authorized source and must not silently use another translation.

## Prepared server adapter

Create an API.Bible account and select the editions you have permission to access. Verify their IDs using `GET https://rest.api.bible/v1/bibles?language=eng` with an `api-key` header. Configure these **server-side Vercel environment variables**, then redeploy:

- `API_BIBLE_KEY`
- `API_BIBLE_NIV_ID`
- `API_BIBLE_NLT_ID`
- `API_BIBLE_MSG_ID`
- `API_BIBLE_TPT_ID` only if that licensed edition is actually supplied to your account.

The `/api/bible` adapter uses the current `rest.api.bible/v1` search endpoint, limits results, returns copyright and FUMS tokens, and keeps secrets off the client. The browser reports actual preview views using the documented FUMS v3 endpoint. Queries go to the provider; FUMS sends anonymous device/session identifiers when licensed text is displayed. No FUMS call is made for KJV or a local JSON import.

**This prepares licensed search previews, not permission to distribute translations.** Adding API.Bible text to saved/exported/offline presentation slides is disabled. Complete the applicable presentation/offline licence and a reference-only slide implementation with expiry/refresh (current terms require refreshing stored API content within 30 days) before enabling that workflow. Full translations must not be copied into the app from random download sources. Authorized local JSON imports are provided by the user and are separate from this adapter.

Sources: [API.Bible documentation](https://docs.api.bible/), [search](https://docs.api.bible/guides/search/), [fair use tracking](https://docs.api.bible/guides/fair-use/), [terms](https://api.bible/terms-and-conditions), [KJV lookup service](https://bible-api.com).
