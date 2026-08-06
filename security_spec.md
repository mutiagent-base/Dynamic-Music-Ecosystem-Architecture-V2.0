# Security Specification & Test Suite

## Data Invariants
1. `users/{userId}`: A user document can only be read or written by the authentic owner matching `request.auth.uid`.
2. `songs/{songId}`: A song document must have `userId` matching `request.auth.uid` on create. Read, update, and delete operations are restricted to the document owner.
3. `presets/{presetId}`: A custom preset must have `userId` matching `request.auth.uid` on create. Read, update, and delete operations are restricted to the owner.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read**: Attempting to read `/songs/{songId}` without authentication -> PERMISSION_DENIED.
2. **Identity Spoofing**: Attempting to create a song with `userId: "other_user_123"` when authenticated as `user_abc` -> PERMISSION_DENIED.
3. **Impersonation in Users Collection**: Attempting to write to `/users/user_xyz` when authenticated as `user_abc` -> PERMISSION_DENIED.
4. **Cross-User Modification**: Attempting to update a song owned by `user_xyz` as `user_abc` -> PERMISSION_DENIED.
5. **Cross-User Deletion**: Attempting to delete a song owned by `user_xyz` as `user_abc` -> PERMISSION_DENIED.
6. **Excessive String Payload**: Creating a song title exceeding 100 chars -> PERMISSION_DENIED.
7. **Invalid Type Injection**: Passing a boolean instead of a string for `stylePrompt` -> PERMISSION_DENIED.
8. **Ghost Field / Shadow Update**: Updating a song document with an unapproved key `isVerified: true` -> PERMISSION_DENIED.
9. **Unauthenticated Write**: Attempting to write to `/presets/{presetId}` without auth -> PERMISSION_DENIED.
10. **Path Variable ID Exhaustion**: Target operation with an invalid ID containing junk characters > 128 chars -> PERMISSION_DENIED.
11. **Spoofed Email Access**: Attempting access with `request.auth.token.email_verified == false` -> PERMISSION_DENIED.
12. **Blanket Query Scraping**: Listing songs without filtering `userId == request.auth.uid` -> PERMISSION_DENIED.

## Test Runner (firestore.rules.test.ts)
Verified against security invariants. All 12 test assertions enforce PERMISSION_DENIED on unauthorized or malformed requests.
