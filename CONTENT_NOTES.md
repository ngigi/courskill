# Courskills Course Notes

`db/seed-course-notes.sql` is the learner-note content layer for the current career architecture.

## Coverage

- 20 programmes with course containers
- 110 modules
- 330 learner-note lessons
- Forex Academy remains a first-class Courskills programme
- Forex Academy core pathway: 12 modules / 36 lessons
- Forex Academy capstone: 3 modules / 9 lessons

## Content policy

All notes in this seed are original Courskills-authored instructional material. ALX-referenced programme names and provenance are retained as catalogue metadata only; no ALX proprietary lessons, assessments, media, branding, or other protected curriculum are reproduced.

## Install order

1. `db/schema.sql`
2. `db/seed-career-architecture.sql`
3. `db/seed-course-notes.sql`

The note seed is designed to be re-run safely: modules are inserted only when the course/module combination is absent, and lessons are upserted by their module-local slug.
