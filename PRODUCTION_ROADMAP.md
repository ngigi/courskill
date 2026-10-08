# Courskills production roadmap

## Phase 1 — Foundation (this build)
- Next.js/TypeScript application
- Supabase Auth integration
- PostgreSQL LMS schema
- RLS policies
- Student dashboard and Forex Academy routes
- Progress API
- Server-side assessment grading foundation
- Admin/instructor CMS surfaces
- Simulator/journal database model
- Market provider adapter

## Phase 2 — LMS operations
- Full admin CRUD for programmes/modules/lessons
- Rich lesson editor
- Video/PDF storage and signed URLs
- Enrollment workflow
- Progress aggregation from lesson events
- Instructor assignment grading
- Discussion/community layer
- Search and learner notifications

## Phase 3 — Credentialing
- Completion rules engine
- Certificate PDF generation
- Unique certificate IDs
- Public `/verify/[certificateNumber]` endpoint
- Revocation/audit trail

## Phase 4 — Forex simulation
- Licensed read-only market-data provider
- Historical replay mode
- Tick/bar ingestion and caching
- Server-side position/risk engine
- Spread/slippage/fees model
- Open/close orders, stop loss and take profit
- Performance analytics
- No broker execution in the LMS by default

## Phase 5 — Production hardening
- Automated tests + CI
- Rate limiting
- Error monitoring
- Backups and recovery
- Audit logs
- MFA/password recovery
- Security review and penetration testing
- Accessibility and performance testing
- Privacy/terms/financial-education disclosures


## ALX programme catalogue integration

The database now supports external catalogue provenance through `track`, `source_provider`, `source_programme_name`, and `source_url`. A seed file, `db/seed-alx-catalogue.sql`, adds the current ALX programme names used as catalogue references: AI & Career Essentials, Data Analytics, Data Science, Content Creation, Graphic Design, Founder Academy, Freelancer Academy, Virtual Assistant, Professional Foundations, AWS Cloud Computing, Back-End Web Development, Front-End Web Development, Salesforce Administrator, and Intro to Software Engineering.

These records are intentionally unpublished by default. Courskills should create its own curriculum, assessments, media, projects, and certification requirements, or obtain the necessary licences/permissions, rather than copying ALX proprietary course content.

## Career architecture implementation

Implemented in the schema:
- `tracks` for career-level grouping.
- `programmes` as credential-bearing, stackable learning pathways.
- `courses` as teachable units within a programme.
- `modules` and `lessons` beneath courses.
- `programme_prerequisites` for foundation-first progression.
- `programme_relations` for complementary/recommended pathways.
- `course_progress` plus `lesson_progress` for granular progress.
- `portfolio_projects` for evidence attached to a programme/course.
- `certificates` tied to a programme, allowing multiple credentials per learner account.
- Forex Academy remains a dedicated first-class programme in the Financial Markets track.
