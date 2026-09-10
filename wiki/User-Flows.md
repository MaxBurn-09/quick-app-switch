# User flows

These are the product paths as implemented in route components.

## Sign in / sign up

```mermaid
flowchart TD
  Land["/"] --> Auth["/auth"]
  Land -->|already signed in| Home["/home"]
  Auth --> Email{"Campus email?"}
  Email -->|no| Toast["Toast: @mdu.edu.in only"]
  Email -->|sign up| SU[signUp + full_name metadata]
  Email -->|sign in| SI[signInWithPassword]
  SU -->|no session| Confirm[Check email / resend]
  SU -->|session| Home
  SI --> Home
  Auth --> Google[lovable.auth.signInWithOAuth google]
  Google --> HD["hd = mdu.edu.in"]
  HD --> Session[supabase.auth.setSession]
  Session --> Check{isCampusEmail?}
  Check -->|no| Out[signOut + error]
  Check -->|yes| Home
```

Password sign-up stores `full_name` in user metadata. The Postgres trigger `handle_new_user` then creates `profiles` and a `student` row in `user_roles`.

Google uses Lovable Cloud Auth with `hd: CAMPUS_DOMAIN` and `prompt: select_account`. After tokens are applied, the client still verifies `isCampusEmail`.

## Authenticated session

Every `_authenticated` navigation re-checks the user. Non-campus sessions are signed out immediately.

## Event registration

```mermaid
flowchart TD
  List["/events"] --> Detail["/events/$id"]
  Home["/home featured or upcoming"] --> Detail
  Detail --> Cap{"max_participants reached?"}
  Cap -->|yes and not registered| Blocked[Join disabled]
  Cap -->|no or already in| Toggle[Register / leave]
  Toggle -->|insert event_registrations| In[You're registered]
  Toggle -->|delete own row| Out[Registration cancelled]
  In --> QC[Invalidate registrations]
  Out --> QC
```

Capacity is computed in the UI (`eventRegs.length >= max_participants`). The unique constraint `(event_id, user_id)` prevents double registration at the DB.

## Community

```mermaid
flowchart TD
  Compose[Compose body] --> InsertPost[posts.insert author_id + body]
  InsertPost --> Feed[Visible posts where removed = false]
  Feed --> Like[Toggle post_likes]
  Feed --> Comment[post_comments.insert]
  Feed --> Report[reports.insert reason]
  Feed --> DeleteOwn[posts.delete if author]
  Report --> Admin["Admin Moderation tab"]
  Admin --> Keep["posts.removed = false + report resolved approved"]
  Admin --> Hide["posts.removed = true + report resolved deleted"]
```

Removed posts are hidden from the community list. RLS still lets the author or an admin SELECT them.

## Admin workspace

`/admin` is reachable from the sidebar for admins. Non-admins see an “ADMIN ONLY” message (the route itself is not server-blocked beyond membership).

Tabs:

| Tab | Who | Actions |
| --- | --- | --- |
| Dashboard | club_admin, super_admin | `admin_stats` RPC, calendar of events + attendee counts |
| Events | same | Insert event (title, date, location, category, capacity, featured, …); delete event |
| Announcements | same | Insert notice with priority `normal` / `urgent` |
| Moderation | same | Open vs handled reports; approve keep or delete post; required admin note |
| Admin team | **super_admin only** | UI tab is filtered; RLS allows super admins to INSERT roles and DELETE others’ roles |
| My profile | same | Update own `profiles` row; list events they created |

## Campus AI

```mermaid
sequenceDiagram
  participant U as Student
  participant P as /assistant
  participant Q as React Query
  participant SF as askAssistant
  participant G as Lovable AI gateway

  U->>P: Question
  P->>Q: events + announcements
  P->>P: Build context string (8 events, 5 notices)
  P->>SF: POST messages + context
  SF->>G: openai/gpt-5.6-sol via LOVABLE_API_KEY
  G-->>SF: output_text
  SF-->>P: reply
  P-->>U: Assistant bubble
```

Chat is **not stored** in Postgres. Context is assembled client-side from already-fetched campus data.

## Profile and sign out

Students edit `full_name`, `student_id`, `department`, `year`, `bio`, and comma-separated `interests`. Sign out calls `supabase.auth.signOut` and navigates to `/auth`.
