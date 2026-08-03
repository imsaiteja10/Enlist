# Spartans Interview System — Documentation

## Overview

A web-based interview pipeline management system to replace the current Google Sheets workflow. Built for TEC Spartans to manage candidate intake, assignment, scheduling, and results across batch-based recruitment drives.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Frontend + API in one codebase |
| Database | PostgreSQL (self-managed on OCI) | Already on OCI, free on A1 Flex |
| Auth | Custom JWT (email + password) | Built from scratch as required |
| Scheduling | Cal.com (self-hosted) | Free, open source, full API + webhooks |
| Hosting | OCI A1 Flex (ARM) | Always free — 4 OCPU, 24 GB RAM, 200 GB |
| CDN / DNS | Cloudflare | Free SSL, DDoS, custom subdomain |
| Reverse proxy | Nginx | Route subdomains to services |
| Process manager | PM2 | Keep Node processes alive |

---

## Infrastructure

```
Cloudflare (DNS + SSL + CDN)
        │
        ├── interviews.yourdomain.com  ──►  OCI A1 Flex  ──►  Nginx  ──►  Next.js  (port 3000)
        └── cal.yourdomain.com         ──►  OCI A1 Flex  ──►  Nginx  ──►  Cal.com  (port 3001)

                    OCI A1 Flex (single instance)
                    ├── Nginx (reverse proxy + SSL termination)
                    ├── Next.js app               (PM2, port 3000)
                    ├── Cal.com                   (Docker, port 3001)
                    └── PostgreSQL                (port 5432, local only)
                          ├── spartans_interview  (app database)
                          └── cal_com             (Cal.com database)
```

---

## Roles & Permissions

| Action | Interviewer | Interview Lead | Super Admin |
|---|---|---|---|
| View own assigned candidates | ✓ | ✓ | ✓ |
| View all candidates (all batches) | — | ✓ | ✓ |
| Add candidates (one-by-one or Excel) | — | ✓ | ✓ |
| Create / manage batches | — | ✓ | ✓ |
| Assign candidates to others | — | ✓ | ✓ |
| Self-assign candidates | — | ✓ | ✓ |
| Reassign interviewer on a candidate | — | ✓ | ✓ |
| Update status (Awaiting response → onwards) | ✓ | ✓ | ✓ |
| Update status (Unassigned / Assigned) | ✗ | ✓ | ✓ |
| Override any candidate status | — | ✓ | ✓ |
| Approve / reject pending users | — | — | ✓ |
| Assign / change user roles | — | — | ✓ |
| Customize fields and statuses | — | — | ✓ |

---

## Interview Statuses

Default statuses (all customizable in Settings):

| # | Status | Reason required |
|---|---|---|
| 1 | Unassigned | — |
| 2 | Assigned | — |
| 3 | Awaiting response | — |
| 4 | Interview scheduled | — |
| 5 | Accepted | ✓ |
| 6 | Rejected | ✓ |
| 7 | Into consideration | ✓ |
| 8 | Missed interview | ✓ |
| 9 | Didn't join | ✓ |

---

## Database Schema

### `users`
```sql
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'pending'
                      CHECK (role IN ('superadmin', 'interview_lead', 'interviewer', 'pending')),
  cal_access_token    TEXT,
  cal_refresh_token   TEXT,
  cal_event_type_id   TEXT,
  cal_event_type_url  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### `batches`
```sql
CREATE TABLE batches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  batch_number   INTEGER UNIQUE NOT NULL,
  is_current     BOOLEAN DEFAULT FALSE,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Only one batch can be current at a time
CREATE UNIQUE INDEX one_current_batch ON batches (is_current) WHERE is_current = TRUE;
```

### `field_definitions`
```sql
CREATE TABLE field_definitions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label          TEXT NOT NULL,
  field_key      TEXT UNIQUE NOT NULL,
  field_type     TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'textarea', 'dropdown')),
  is_required    BOOLEAN DEFAULT FALSE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### `status_definitions`
```sql
CREATE TABLE status_definitions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label            TEXT NOT NULL,
  status_key       TEXT UNIQUE NOT NULL,
  requires_reason  BOOLEAN DEFAULT FALSE,
  display_order    INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### `candidates`
```sql
CREATE TABLE candidates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,
  status_key   TEXT NOT NULL DEFAULT 'unassigned'
               REFERENCES status_definitions(status_key),
  fields       JSONB NOT NULL DEFAULT '{}',
  -- fields stores dynamic field values, e.g.:
  -- { "first_name": "Anurag", "last_name": "Gond", "email": "...", "mobile": "...", ... }
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidates_batch    ON candidates(batch_id);
CREATE INDEX idx_candidates_assignee ON candidates(assigned_to);
CREATE INDEX idx_candidates_status   ON candidates(status_key);
CREATE INDEX idx_candidates_email    ON candidates((fields->>'email'));
```

### `status_history`
```sql
CREATE TABLE status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  from_status   TEXT,
  to_status     TEXT NOT NULL,
  reason        TEXT,
  changed_by    UUID REFERENCES users(id),
  changed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_candidate ON status_history(candidate_id);
```

### `cal_bookings`
```sql
CREATE TABLE cal_bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id        UUID REFERENCES candidates(id) ON DELETE SET NULL,
  interviewer_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_uid         TEXT UNIQUE NOT NULL,
  scheduled_at        TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming', 'completed', 'cancelled', 'rescheduled')),
  cal_webhook_payload JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Default Seed Data

### Default field definitions
```sql
INSERT INTO field_definitions (label, field_key, field_type, is_required, display_order) VALUES
  ('First name',              'first_name',  'text',     TRUE,  1),
  ('Last name',               'last_name',   'text',     TRUE,  2),
  ('Email',                   'email',       'text',     TRUE,  3),
  ('Mobile number',           'mobile',      'number',   TRUE,  4),
  ('College name',            'college',     'text',     TRUE,  5),
  ('Course',                  'course',      'text',     FALSE, 6),
  ('City',                    'city',        'text',     FALSE, 7),
  ('Why join Spartans?',      'why_join',    'textarea', FALSE, 8);
```

### Default status definitions
```sql
INSERT INTO status_definitions (label, status_key, requires_reason, display_order) VALUES
  ('Unassigned',           'unassigned',          FALSE, 1),
  ('Assigned',             'assigned',            FALSE, 2),
  ('Awaiting response',    'awaiting_response',   FALSE, 3),
  ('Interview scheduled',  'interview_scheduled', FALSE, 4),
  ('Accepted',             'accepted',            TRUE,  5),
  ('Rejected',             'rejected',            TRUE,  6),
  ('Into consideration',   'into_consideration',  TRUE,  7),
  ('Missed interview',     'missed_interview',    TRUE,  8),
  ('Didn''t join',         'didnt_join',          TRUE,  9);
```

---

## Project Structure

```
spartans-interview/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                  # Sidebar + topbar shell
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── batches/
│   │   │   │   ├── page.tsx                # All batches list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Batch detail + candidate table
│   │   │   ├── my-candidates/
│   │   │   │   └── page.tsx                # Interviewer's assigned candidates
│   │   │   ├── users/
│   │   │   │   └── page.tsx                # User management (superadmin only)
│   │   │   └── settings/
│   │   │       └── page.tsx                # Fields + statuses config (superadmin only)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── signup/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── batches/
│   │       │   ├── route.ts                # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts            # GET, PATCH, DELETE
│   │       │       └── candidates/
│   │       │           └── route.ts        # GET candidates in batch (with filters)
│   │       ├── candidates/
│   │       │   ├── route.ts                # GET list, POST create
│   │       │   ├── import/route.ts         # POST bulk Excel import
│   │       │   └── [id]/
│   │       │       ├── route.ts            # GET, PATCH (fields, assign)
│   │       │       └── status/route.ts     # PATCH status + reason
│   │       ├── users/
│   │       │   ├── route.ts                # GET all users
│   │       │   └── [id]/
│   │       │       └── role/route.ts       # PATCH role
│   │       ├── settings/
│   │       │   ├── fields/
│   │       │   │   ├── route.ts            # GET, POST
│   │       │   │   └── [id]/route.ts       # PATCH, DELETE
│   │       │   └── statuses/
│   │       │       ├── route.ts            # GET, POST
│   │       │       └── [id]/route.ts       # PATCH, DELETE
│   │       ├── cal/
│   │       │   ├── connect/route.ts        # GET — start OAuth flow
│   │       │   ├── callback/route.ts       # GET — OAuth callback, save token
│   │       │   ├── event-types/route.ts    # GET — list user's Cal event types
│   │       │   └── disconnect/route.ts     # POST — remove Cal connection
│   │       ├── webhooks/
│   │       │   └── cal/route.ts            # POST — Cal.com booking webhook
│   │       └── dashboard/route.ts          # GET — aggregated dashboard stats
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx                   # Status dot + label
│   │   │   ├── Table.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── dashboard/
│   │   │   ├── CurrentBatchCard.tsx        # Large current batch card
│   │   │   ├── PreviousBatchCard.tsx
│   │   │   └── InterviewerProgressTable.tsx
│   │   ├── batches/
│   │   │   ├── BatchCard.tsx
│   │   │   ├── BatchDetailHeader.tsx
│   │   │   └── InterviewerBreakdown.tsx    # Who is doing what in this batch
│   │   └── candidates/
│   │       ├── CandidateTable.tsx
│   │       ├── CandidateRow.tsx            # Inline reason display for decided statuses
│   │       ├── AddCandidateModal.tsx
│   │       ├── StatusUpdateModal.tsx       # Status change + reason field
│   │       └── AssignInterviewerModal.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                    # pg Pool connection
│   │   │   └── queries/
│   │   │       ├── candidates.ts
│   │   │       ├── batches.ts
│   │   │       ├── users.ts
│   │   │       └── settings.ts
│   │   ├── auth/
│   │   │   ├── session.ts                  # JWT sign / verify
│   │   │   └── middleware.ts               # Route guard + role check
│   │   ├── cal/
│   │   │   ├── client.ts                   # Cal.com REST API wrapper
│   │   │   └── webhook.ts                  # Booking match + status update logic
│   │   └── utils/
│   │       ├── whatsapp.ts                 # wa.me link generator
│   │       └── excel.ts                    # xlsx parse for bulk import
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCandidates.ts
│   │   └── useBatches.ts
│   │
│   └── types/
│       ├── index.ts                        # Shared TypeScript types
│       └── database.ts                     # DB row types
│
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_seed_fields.sql
│   └── 003_seed_statuses.sql
│
├── public/
│   ├── manifest.json                       # PWA manifest
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── .env.example
├── .env.local                              # Never commit this
├── next.config.ts
├── package.json
└── DOCS.md
```

---

## API Reference

### Auth

| Method | Route | Role | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account (lands in pending) |
| POST | `/api/auth/login` | Public | Returns JWT |
| POST | `/api/auth/logout` | Any | Clears session |
| GET | `/api/auth/me` | Any | Current user info |

### Batches

| Method | Route | Role | Description |
|---|---|---|---|
| GET | `/api/batches` | Lead+ | List all batches with stats |
| POST | `/api/batches` | Lead+ | Create batch |
| PATCH | `/api/batches/:id` | Lead+ | Rename, set as current |
| GET | `/api/batches/:id/candidates` | Lead+ | Candidates in batch with filters |

### Candidates

| Method | Route | Role | Description |
|---|---|---|---|
| GET | `/api/candidates` | Lead+ | List with filters (batch, status, assignee) |
| POST | `/api/candidates` | Lead+ | Create single candidate |
| POST | `/api/candidates/import` | Lead+ | Bulk import from Excel |
| GET | `/api/candidates/:id` | Any* | Get candidate (*own assigned only for interviewer) |
| PATCH | `/api/candidates/:id` | Lead+ | Update fields, reassign interviewer |
| PATCH | `/api/candidates/:id/status` | Any* | Update status + reason (*restricted by role) |

### Users

| Method | Route | Role | Description |
|---|---|---|---|
| GET | `/api/users` | Superadmin | List all users |
| PATCH | `/api/users/:id/role` | Superadmin | Approve / change role |

### Settings

| Method | Route | Role | Description |
|---|---|---|---|
| GET | `/api/settings/fields` | Any | List field definitions |
| POST | `/api/settings/fields` | Superadmin | Add field |
| PATCH | `/api/settings/fields/:id` | Superadmin | Edit / reorder / toggle required |
| DELETE | `/api/settings/fields/:id` | Superadmin | Remove field |
| GET | `/api/settings/statuses` | Any | List status definitions |
| POST | `/api/settings/statuses` | Superadmin | Add status |
| PATCH | `/api/settings/statuses/:id` | Superadmin | Edit / reorder / toggle reason |
| DELETE | `/api/settings/statuses/:id` | Superadmin | Remove status |

### Cal.com

| Method | Route | Role | Description |
|---|---|---|---|
| GET | `/api/cal/connect` | Any | Redirect to Cal.com OAuth |
| GET | `/api/cal/callback` | Any | Handle OAuth callback, save token |
| GET | `/api/cal/event-types` | Any | List interviewer's Cal event types |
| POST | `/api/cal/disconnect` | Any | Remove Cal.com connection |
| POST | `/api/webhooks/cal` | — | Cal.com booking webhook (public, HMAC verified) |

---

## Cal.com Integration

### How it works

```
Interviewer connects Cal.com once
        └── OAuth → token saved to users table

Admin opens candidate card
        └── "Copy Calendly link" → copies interviewer's event type URL
                                    with candidate email pre-filled as query param

Interviewer shares link via WhatsApp (existing manual step)

Candidate books a slot on Cal.com
        └── Cal.com fires webhook → POST /api/webhooks/cal
                └── Verify HMAC signature
                └── Extract invitee email from payload
                └── Lookup candidate by fields->>'email'
                └── Update candidate status → 'interview_scheduled'
                └── Save booking to cal_bookings table (with scheduled_at)
                └── Candidate row now shows scheduled date/time automatically

After scheduled_at passes
        └── Background job (cron via PM2) checks cal_bookings
                └── Sends in-app notification to interviewer:
                    "Interview with [Name] was scheduled for [time] — log the result"
```

### Setting up Cal.com OAuth

1. In your self-hosted Cal.com admin, go to Settings → Developer → OAuth Apps
2. Create a new OAuth app:
   - Redirect URI: `https://interviews.yourdomain.com/api/cal/callback`
   - Scopes: `READ_BOOKING`, `READ_EVENT_TYPE`, `READ_PROFILE`
3. Copy Client ID and Client Secret to your `.env`

### Webhook setup

In Cal.com: Settings → Webhooks → Add webhook
- URL: `https://interviews.yourdomain.com/api/webhooks/cal`
- Events to subscribe: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`
- Copy the webhook secret to your `.env`

### Webhook handler logic (`lib/cal/webhook.ts`)

```typescript
// Verify signature
const signature = req.headers['x-cal-signature'];
const expected = hmac(CAL_WEBHOOK_SECRET, rawBody);
if (signature !== expected) return 401;

// Match candidate
const inviteeEmail = payload.payload.responses?.email?.value;
const candidate = await db.query(
  `SELECT * FROM candidates WHERE fields->>'email' = $1`, [inviteeEmail]
);

// Update status
await db.query(
  `UPDATE candidates SET status_key = 'interview_scheduled', updated_at = NOW() WHERE id = $1`,
  [candidate.id]
);

// Save booking
await db.query(
  `INSERT INTO cal_bookings (candidate_id, interviewer_id, booking_uid, scheduled_at, cal_webhook_payload)
   VALUES ($1, $2, $3, $4, $5)`,
  [candidate.id, interviewerId, payload.uid, payload.startTime, payload]
);
```

---

## WhatsApp Integration

No API needed. Every phone number generates a direct link:

```typescript
// lib/utils/whatsapp.ts
export function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${number}`;
}
```

Clicking opens WhatsApp (mobile: app, desktop: web.whatsapp.com) directly to that person's chat.

---

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=https://interviews.yourdomain.com
NODE_ENV=production

# Database (self-managed PostgreSQL on OCI)
DATABASE_URL=postgresql://spartans:password@localhost:5432/spartans_interview

# Auth
JWT_SECRET=                          # 64+ char random string
JWT_EXPIRY=7d

# Cal.com (self-hosted instance)
CAL_BASE_URL=https://cal.yourdomain.com
CAL_CLIENT_ID=
CAL_CLIENT_SECRET=
CAL_WEBHOOK_SECRET=                  # From Cal.com webhook settings
```

---

## Deployment on OCI A1 Flex

### PostgreSQL setup

```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib

sudo -u postgres psql
CREATE USER spartans WITH PASSWORD 'your_password';
CREATE DATABASE spartans_interview OWNER spartans;
CREATE DATABASE cal_com OWNER spartans;
\q

# Run migrations
psql -U spartans -d spartans_interview -f migrations/001_initial_schema.sql
psql -U spartans -d spartans_interview -f migrations/002_seed_fields.sql
psql -U spartans -d spartans_interview -f migrations/003_seed_statuses.sql
```

### Cal.com setup

```bash
git clone https://github.com/calcom/docker && cd docker
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://spartans:password@localhost:5432/cal_com
#   NEXTAUTH_SECRET=<random>
#   NEXTAUTH_URL=https://cal.yourdomain.com
#   CALENDSO_ENCRYPTION_KEY=<random>
docker compose up -d
```

### Next.js app

```bash
git clone <your-repo>
cd spartans-interview
npm install
npm run build
pm2 start npm --name "spartans" -- start
pm2 save
pm2 startup   # auto-start on reboot
```

### Nginx config

```nginx
server {
    server_name interviews.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name cal.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/spartans /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Cloudflare setup

1. Add domain to Cloudflare
2. Add two A records pointing to your OCI public IP:
   - `interviews` → `<OCI_PUBLIC_IP>` (proxied)
   - `cal` → `<OCI_PUBLIC_IP>` (proxied)
3. SSL/TLS mode → Full
4. Done — Cloudflare handles SSL termination

### OCI security list

Open these ports in your OCI security list (VCN → Subnet → Security Lists):
- `80` TCP (HTTP — Cloudflare needs this)
- `443` TCP (HTTPS — Cloudflare)
- `22` TCP (SSH — restrict to your IP only)

PostgreSQL port `5432` stays closed to the internet (local access only).

---

## PWA Manifest (`public/manifest.json`)

```json
{
  "name": "Spartans Interview",
  "short_name": "Spartans",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B5BDB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add to `app/layout.tsx`:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

---

## Cost Summary

| Service | Cost |
|---|---|
| OCI A1 Flex (4 OCPU, 24 GB RAM, 200 GB storage) | $0 — always free |
| PostgreSQL (self-managed on A1 instance) | $0 |
| Cal.com (self-hosted on same A1 instance) | $0 |
| Cloudflare (DNS, SSL, CDN, proxy) | $0 |
| Domain (if needed) | ~$10/year |
| **Total** | **$0/month** |

---

## Build Order

1. PostgreSQL setup + run migrations
2. Auth (signup, login, JWT, role middleware)
3. Users screen (pending verification, role assignment)
4. Batches (create, list, tag current/previous)
5. Candidates (add, import, list, assign)
6. Status updates (with reason enforcement)
7. Dashboard (batch stats, interviewer progress)
8. Cal.com self-hosted setup
9. Cal.com OAuth per interviewer
10. Webhook handler + auto status update
11. Interviewer progress nudges (PM2 cron)
12. PWA manifest + mobile polish
13. Move from Vercel → OCI + Nginx + Cloudflare
