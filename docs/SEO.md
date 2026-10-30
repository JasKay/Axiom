# Free search setup for Axiom

The public website is built from web/index.html and scripts/templates. scripts/seo-pages.cjs defines eight indexable pages, their canonical URLs, social metadata and structured data. The build creates sitemap.xml. Workspaces, congregation service pages, projection output and demo frames are noindex; only the public marketing pages are in the sitemap. No analytics, paid tools or SEO subscription were added.

## Connect Google Search Console

1. Sign in at https://search.google.com/search-console/welcome with the Google account that should own this property.
2. Add a **URL-prefix** property for **https://www.useaxiom.org/**. A Domain property would require DNS ownership; the URL-prefix option supports an HTML tag on the primary website domain.
3. Choose **HTML tag** under the verification methods. Copy only the content value from the google-site-verification meta tag into the google field in scripts/search-verification.json. This token is public verification data, not a password.
4. Rebuild and deploy. The builder adds the tag to public page headers. Keep the tag after verification.
5. Click Verify in Search Console. In Sitemaps, submit **sitemap.xml**.
6. Use URL Inspection for the homepage and the three audience pages. Check Page indexing, then Performance for search queries, impressions and clicks. Google may need time to crawl and report data; a sitemap does not guarantee indexing or rankings.

Google's instructions: https://support.google.com/webmasters/answer/9008080 and https://support.google.com/webmasters/answer/34592

## Maintain the pages

- Describe released features and actual pricing. Do not add fabricated reviews, ratings or claims to structured data.
- Give each public page a distinct title, description and main heading. Link new useful pages from existing public pages.
- Add a new public page to scripts/seo-pages.cjs and vercel.json rewrites/redirects. Keep clean canonical URLs in the sitemap; do not add app or service-link URLs.
- Do not block workspace HTML in robots.txt: crawlers need to read its noindex instruction. Authentication remains the access control.
- Run npm test before deployment. The SEO tests check metadata, structured data, crawlable links, sitemap coverage, private page exclusions and routing.
