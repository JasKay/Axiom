# Connected services: Leader and Pro

## Ownership and approval

Leader is the Program team's service plan. Pro is Tech's preparation and presentation workspace. AxiomU receives only the explicitly published member content. Sending a plan to Tech does not publish it to members or put anything on air.

The current approval boundary is the authorized team member explicitly choosing **Send to Tech**. This does not enforce a separate approver role or require every agenda item to have Approved status. If that workflow is needed, implement explicit approval and revision records before treating it as enforced approval.

## Working interaction

1. The Program team prepares a service and explicitly sends its agenda. Private leadership notes remain excluded from the Tech snapshot.
2. Pro receives the shared plan in Messages and automatically creates a local service with its agenda items. It does not switch the selected service or change Program. Each service receives separate library identities so reusing a Leader item in another service cannot overwrite Tech's prepared copy.
3. Shared name, date, start time, scripture references and service notes synchronize on newly sent revisions through the existing church/service ID link. Renaming does not create a second Pro service. Presentation revision and shared-detail revision remain separate; prepared slides, decks, Tech notes and live output are retained. Unsent Leader drafts do not synchronize to Tech.

4. Messages, shared directions and file notifications stay attached to the shared service ID. Both teams can reply and share files.
5. Later agenda revisions appear in the conversation for review. Tech uses **Prepare service** to accept the updated Main presentation. Tech-only decks and preparation notes are retained. The on-air snapshot remains unchanged until Tech explicitly presents another slide.
6. Documents and media download only when requested. Downloading a shared file does not automatically insert it into a slide or replace an on-air background.

An ideal next step is a revision comparison and conflict-aware merge: untouched fields can update automatically; Tech edits and removed activities need review. Automatically replacing an existing Main presentation is not a safe substitute for that merge.

## Standalone and Shared workspaces

Pro's workspace switch preserves the same local project. Standalone shows local services and pauses new shared communication. Shared shows local services plus downloaded services for the authorized current church. Existing local services are not uploaded or converted automatically. Shared services keep their original church/service link.

Connecting or resuming an existing Tech session can happen without reloading the presentation engine. Mode switches save current work and remember local/shared selections independently. Program is unchanged. Downloaded shared services can be selected offline, and an online reconnect revalidates membership. Switching churches changes which shared services are visible; it does not delete saved data from the other church. This is an application workflow, not a new subscription or paid-plan gate.

The message selector shows service names, dates and unread counts. Other-service unread buttons open that conversation without changing the selected presentation. Message/file cards include the originating service label. Draft replies remain per service during mode changes; changing the authenticated account clears the in-memory conversation drafts. Late responses from a previous connection cannot replace the current conversation.

## Transfer efficiency

- Authenticated workspace and file-list requests support ETag revalidation. Membership checks still run before returning 304. A changed message, plan, file list or role changes the response fingerprint. Unchanged bodies are not retransmitted. This reduces transfer, not database-query cost.
- Cached response bodies are scoped to the signed-in account and church. Returned values are cloned so unsaved UI edits cannot mutate a cached server snapshot. Up to four workspace and file-list snapshots are retained per client.
- Pro's routine refresh interval is 30 seconds while live notifications are arriving, with a 10-second fallback when notifications are stale. Event notifications still trigger immediate refresh. Leader also retains its existing retry/fallback behavior.
- Downloaded files up to 8 MiB are reused in memory for the current session, with a 32 MiB least-recently-used limit. Simultaneous downloads share one request. Account changes clear cached bytes. Larger downloads are not retained by this cache.
- File bytes are not included in conversation refreshes. Files use immutable upload identities; a replacement upload gets a new ID.

## Still needed for durable offline and heavy transfers

- A service download package with persistent, account-scoped media cache, storage limits and a clear readiness checklist.
- Resumable transfers with progress, cancellation and retry; range support and integrity checks for partial downloads.
- Offline message drafts/outbox with idempotency keys and explicit Queued/Sent/Failed status.
- Revision/delta endpoints and paginated history, so changing one message does not require returning the full changed workspace.
- Explicit activity-linked comments and structured Seen/Preparing/Ready acknowledgements. Current acknowledgements are ordinary messages.
- Quotas, retention and a measured usage budget. Low bandwidth does not mean unlimited zero-cost cloud storage or transfer.

## Storage configuration

Shared records and messages use the existing database; uploaded file bytes use private Vercel Blob. The server needs a valid `BLOB_READ_WRITE_TOKEN` or a connected `BLOB_STORE_ID` with usable Vercel OIDC credentials. A store ID alone on an unconfigured local server is insufficient. Secrets must remain server-side.

The isolated demonstration uses its own local byte store and adapter; it neither requires Blob credentials nor proves production Blob is configured. Image upload and download have been tested in both directions against that local adapter. Production Blob access could not be inspected because the connected Vercel session lacked team access.

Reference: https://vercel.com/docs/vercel-blob/using-blob-sdk
