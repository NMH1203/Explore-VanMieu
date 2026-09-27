# Account journeys and rewards

GET /api/rewards requires the session cookie. On first access the server assigns
five distinct locations, sampled without replacement, and persists the assignment
in reward_journeys. Reloading, changing browsers, dates or signing in again does
not reroll targets. Accounts may have overlapping selections.

The response contains target_ids, completed_ids, completed, claimed, claimed_at,
and theme. A completed point requires both an unlocked UserHistory record and
a verified GPS/image CheckinLog belonging to this account. Manually unlocked
content alone does not qualify for a reward.

POST /api/rewards/claim accepts no user or target identifiers. It derives the
account from authentication and checks all five targets server-side. Incomplete
journeys return 409; successful and repeated claims return the persisted status.
reward_claims.user_id is the primary key, preventing duplicate rewards even
under simultaneous requests. This is a digital heritage reward receipt, not a
physical gift redemption or inventory system.

The vermilion theme unlocks at five verified points, independent of whether the
claim button has been pressed. Home, Passport, detail stamps and camera target
suggestions consume this shared response. Frontend daily random selection has
been removed. The older /api/target single-location endpoint remains for legacy
clients; it is not used for rewards or current journey UI.

Tables are created non-destructively at application startup. Restart the backend
after deploying this revision. No existing visit history is removed.
