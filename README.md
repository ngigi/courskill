# Courskills Production LMS Foundation

This replaces the original single-file prototype with a production-oriented Next.js + Supabase/PostgreSQL foundation.

## Architecture
- Next.js App Router + TypeScript
- Supabase Auth for registration/login/session management
- PostgreSQL schema with Row Level Security (RLS)
- Role model: student / instructor / admin
- Programme → modules → lessons → assessments/assignments
- Persistent enrollments and lesson progress
- Server-side API route foundation for progress and market data
- Forex journal and simulated-account data model
- Certificate data model with unique verification IDs
- Market provider adapter (`lib/market.ts`) so a live provider can be added without rewriting the simulator UI

## Run locally
1. Create a Supabase project.
2. Run `db/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL/key values.
4. Install dependencies: `npm install`
5. Start: `npm run dev`
6. Open http://localhost:3000

## Production hardening still required before launch
- Replace demo market provider with a licensed/live market-data provider.
- Move assessment grading entirely to trusted server code; never expose correct answers to the browser.
- Add server-side enrollment/role guards to every admin/instructor mutation route.
- Add email verification, password reset and optional MFA.
- Add instructor review workflow for assignments/capstones.
- Add certificate PDF generation and public verification endpoint.
- Add audit logging, rate limiting, CSRF/session protections as appropriate, backups and monitoring.
- Add payment/subscription integration if programmes are paid.
- Add object storage for course videos, PDFs and submissions.
- Add automated tests and CI/CD before production release.

## Forex safety model
The simulator is educational and uses fictional capital. No broker order execution is implemented. Risk limits should be enforced server-side, and any live-data integration should be read-only until a separate, explicit brokerage architecture is designed.


### Seed the ALX-referenced catalogue

After applying `db/schema.sql`, run `db/seed-alx-catalogue.sql` in Supabase SQL Editor. The records are unpublished by default and are stored as Courskills catalogue references.

### Seed the course notes

After `db/seed-career-architecture.sql`, run `db/seed-course-notes.sql`. This populates the current course catalogue with original Courskills learner notes at the Module → Lesson level. The seed contains 110 modules and 330 learner-note lessons across the career pathways and Forex Academy. ALX-referenced programme records remain unpublished until Courskills-owned curriculum is reviewed and approved.

## Career architecture

Courskills uses a stackable learning model:

**Career Tracks → Programmes → Courses → Modules → Lessons**

A learner has one account and can enrol in multiple programmes. Programme prerequisites and complementary relationships support progression from Professional Foundations into a specialization, then into adjacent programmes. Portfolio projects can be attached to programmes/courses, and certificates are issued per completed programme.

Forex Academy is a first-class Courskills programme under the Financial Markets track. It is intentionally separate from the career-specialization catalogue and retains its own dashboard, simulator, trading journal, assessments, assignments and credential flow.

The ALX-referenced records contain programme names and provenance metadata only. Courskills must author or license the actual curriculum, assessments, media, projects and certification requirements before publishing those programmes.

## Courskills pricing policy

Courskills has exactly two billable actions:

- **Course enrollment:** KES 1,200 via M-Pesa for Kenyan learners or $10 USD by card.
- **Certificate issuance:** KES 1,200 via M-Pesa for Kenyan learners or $10 USD by card.

There are **no other charges**: no subscription fee, registration fee, assessment fee, simulator fee, trading-journal fee, portfolio fee, platform fee, or programme-level fee.

The database enforces the two fixed prices through `pricing_rules` and a payment validation trigger. Course access is created only after a successful `course_enrollment` payment, and certificate issuance requires a successful `certificate` payment plus programme completion.

Payment collection supports Stripe card payments at $10 USD and Safaricom Daraja M-Pesa STK Push at KES 1,200 for Kenyan learners. Stripe uses `PAYMENT_PROVIDER_SECRET` and `PAYMENT_WEBHOOK_SECRET`; M-Pesa uses the `MPESA_*` environment variables. Never put secrets in GitHub. The database enforces the fixed price per payment method.
