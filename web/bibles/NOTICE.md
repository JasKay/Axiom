# Axiom offline Bible library — 0.4.34

Eight complete 66-book English editions are bundled from eBible.org's verse-per-line XML archives. Source URLs, XML SHA-256 checksums, compressed-asset checksums, verse counts and rights notices are recorded in ../bible-editions.js. Retrieved 26 October 2026.

| Edition | Source rights notice |
| --- | --- |
| World English Bible (WEB) | https://ebible.org/engwebp/copyright.htm |
| World English Bible British Edition (WEBBE) | https://ebible.org/engwebpb/copyright.htm |
| American Standard Version, 1901 (ASV) | https://ebible.org/eng-asv/copyright.htm |
| Berean Standard Bible (BSB) | https://ebible.org/engbsb/copyright.htm |
| Majority Standard Bible (MSB) | https://ebible.org/engmsb/copyright.htm |
| Bible in Basic English (BBE) | https://ebible.org/engBBE/copyright.htm |
| Darby Translation (DBY) | https://ebible.org/engDBY/copyright.htm |
| Young's Literal Translation (YLT) | https://ebible.org/engylt/copyright.htm |

These source texts are public domain. World English Bible names are trademarks: preserve official wording when using those names. The Berean publisher explicitly permits free and commercial use: https://berean.bible/terms.htm. For BBE, CrossWire published the original publisher's worldwide out-of-copyright confirmation: https://www.crosswire.org/pipermail/sword-devel/2020-March/047665.html.

Only Bible text is included, not publisher artwork or study material. Conversion decodes XML text and trims surrounding whitespace. Chapter and verse numbers are retained, including gaps where an edition omits a verse. Verse-zero titles and books outside the 66-book canon are excluded; no verse wording is rewritten. The application displays the selected edition and source attribution. Axiom does not claim exclusive rights in these public-domain texts.

To reproduce: obtain each catalogue source archive, extract it into artifacts/bible-sources/<source-id>/ and run `node scripts/import-bibles.cjs artifacts/bible-sources`. Compare generated source XML and pack checksums. No passage API is scraped to obtain complete Bibles.

The compressed packs add approximately 9.6 MB in total. The desktop installer includes all eight, and searches need no internet service. The web service worker includes the packs after app installation/caching; an initial browser visit still needs connectivity. Packs are loaded on demand, checked against SHA-256, and at most two expanded editions remain in memory. They are not copied into user projects, church messages or backups.

Standalone offers offline WEB and the pre-existing online KJV lookup. Connected church workspaces offer seven additional offline editions. This product packaging charges for application features and does not restrict anyone's independent rights to obtain or redistribute the underlying public-domain texts. Current workspace access follows verified church membership; subscription billing is not enabled.

## KJV and copyrighted editions

A complete local-development KJV conversion is retained outside the distributable source tree. It is NOT included in this release. Its source is https://ebible.org/Scriptures/eng-kjv_vpl.zip (archive SHA-256 00d2b622b528b42604c23fddf21fe707a1c79d0b5b2ea480c4b96359b0c9eac3). The source flags UK Crown printing/publication rights: https://ebible.org/eng-kjv/copyright.htm. UK software-distribution permission has not been confirmed. Existing online KJV lookup and authorized user import remain available; this is not a claim of worldwide KJV distribution clearance.

NIV, NLT, TPT, MSG, ESV and NKJV are not included or advertised as licensed. The existing server-only licensed-provider search preview does not grant presentation or offline redistribution rights. User-imported files remain the user's responsibility.