# BenchXP Guide Philosophy

BenchXP is a familiarity and readiness signal. It is not certification, licensing, professional qualification, or proof that a user can operate a tool safely in every situation.

## What Counts As Evidence

BenchXP should grow from meaningful workshop activity:

- Reading and completing guide sections.
- Completing setup and safety checklists.
- Logging controlled practice tasks.
- Logging real project use.
- Recording maintenance.
- Checking confidence after practice or project work.
- Improving after common mistakes.

BenchXP should not grow from passive browsing, opening pages, filtering lists, or adding wishlist items.

## Skill Dimensions

Tool familiarity should be explained across these dimensions:

- Safety.
- Setup.
- Control.
- Accuracy.
- Maintenance.
- Project Use.

## Familiarity Labels

BenchOS uses non-certifying labels:

- `Unfamiliar`
- `Beginner`
- `Learning`
- `Comfortable`
- `Skilled`
- `Highly Familiar`

Avoid labels such as certified, expert, professional, qualified, or licensed.

## Production Persistence

Static guide content can ship in the app. User-specific progress, evidence, confidence, mistakes, maintenance, dismissed hints, and preferences must be saved through Auth0-verified Netlify Functions backed by Netlify Database.

The browser must never receive database credentials. Server functions must derive the user from the verified Auth0 token, not from client-supplied user IDs.

## Readiness Behavior

The default readiness mode is Balanced Warnings. Guide progress can add confidence, warnings, and recommended next skills, but it should not hard-block projects by default.
