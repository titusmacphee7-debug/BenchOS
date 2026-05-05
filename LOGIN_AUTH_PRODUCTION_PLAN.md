# BenchOS Login + Auth0 Production Plan

## Summary

BenchOS is moving to an Auth0-only production auth model and a more premium, minimal login page.

Locked decisions:

- Auth provider: Auth0 only.
- Supabase removal: remove Supabase auth/sync/package/docs references in this pass.
- Signup: open Auth0 signup through Universal Login.
- Login design: minimal premium, not dense or generic.
- Data direction: Auth0 identity plus future server-verified, user-scoped database access, preferably Netlify Database.

## 1. Current App/Auth State

- Framework: Vite + React + TypeScript + React Router SPA.
- Package manager: npm.
- Auth0 is installed through `@auth0/auth0-react`.
- Auth0 is partially wired through `BenchAuth0Provider`, `benchAuth0Context`, and `auth0Config`.
- Mandatory route gating exists in `src/app/routes.tsx`.
- Login UI still includes Supabase email/password, reset password, magic link, Supabase sync copy, and fallback behavior.
- Supabase remains in package dependencies, auth service, client config, sync services, migrations, tests, docs, and env docs.
- Core user data still uses Dexie/IndexedDB.
- Automatic personal sample data is disabled by default.
- Netlify deploy is a static SPA with `netlify.toml`, `dist` publish, SPA fallback, and security headers.

## 2. Current Login Page Problems

- The login page has too much empty dark space and weak product storytelling.
- Auth0 is primary, but Supabase fields make the card feel generic and confusing.
- Email/password and magic-link UI imply BenchOS is handling credentials.
- The current page lacks a polished command-center preview.
- Mobile stacks a sparse intro above a form-heavy card.

## 3. Desired Production Behavior

- First visit to `appbenchos.com` shows login.
- Unauthenticated users cannot access dashboard or app routes.
- Auth0 is the only production login, signup, and logout provider.
- Successful Auth0 login opens onboarding or the app.
- Logout uses Auth0 logout and returns to login.
- Expired or invalid session returns to login.
- No Supabase auth fallback.
- No Local Mode.
- No Titus auto-login or fallback identity.
- No automatic personal demo data.
- New users start empty unless they later opt into starter/sample data.

## 4. Auth0-Only Login Plan

- Login card has one primary CTA: `Continue with Auth0`.
- Signup uses Auth0 Universal Login with `screen_hint: signup`.
- Remove visible email/password, reset password, verification, and magic-link controls.
- Keep only Auth0 public frontend config:
  - `VITE_AUTH0_DOMAIN`
  - `VITE_AUTH0_CLIENT_ID`
- Keep `VITE_AUTH0_AUDIENCE` as a future API access option only.
- Route guard should be fed only by Auth0 session state.
- Logout should call Auth0 logout with `returnTo` set to the app origin.
- Auth loading state should show a compact secure-session loader.

## 5. Supabase Removal Plan

Remove now:

- Supabase Auth UI and copy.
- Supabase email/password login functions.
- Supabase magic-link and resend verification.
- Supabase password reset route/UI.
- Supabase auth env requirements from docs and `.env.example`.
- Supabase provider/session fallback in production auth state.
- Supabase sync status copy in Account/TopBar.
- `@supabase/supabase-js` dependency once imports are gone.
- Supabase client/auth/sync files once no imports remain.
- Supabase setup docs and migrations.

Replace with Auth0:

- Session identity.
- Login/signup/logout.
- User ID source.

Prepare for Netlify Database/API layer:

- App data persistence.
- User-scoped tools, projects, materials, wishlist, mastery, XP.
- Server-side token verification before database access.

## 6. Database/User Scoping Plan

- Auth0 `user.sub` is the stable authenticated identity.
- Browser code must never receive database credentials.
- Server/API layer should validate Auth0 token before reads/writes.
- Database rows should map to an internal app user row keyed to Auth0 subject.
- Every user-owned table should be scoped by authenticated app user.
- Prefer Netlify Functions plus Netlify Database for the Vite SPA.
- Keep Dexie as the current local app data layer until the database migration is explicitly implemented.
- LocalStorage may only hold harmless UI preferences.

## 7. Login Page Design Direction

Target feel: minimal premium workshop command center.

- Dark, focused, industrial, practical.
- BenchOS orange accent preserved.
- No cartoon styling.
- No clutter or fake SaaS form.
- Strong identity, one CTA, clear account-required message.

## 8. Recommended Layout

- Full-height auth shell with constrained centered content.
- Top-left BenchOS logo lockup.
- Two-column desktop layout:
  - Left: headline, subheadline, product outcomes, command preview.
  - Right: premium Auth0 login card.
- Mobile stacks logo, hero copy, preview, then login card.

## 9. Visual Elements To Add

- Subtle grid/workbench background using CSS/Tailwind.
- Soft orange radial glow behind the auth card.
- Thin orange status rail.
- Compact command preview with Tool Library, Projects, Readiness, Wishlist, and BenchXP rows.
- Small pills: `Account required`, `User-scoped data`, `No demo workspace`.
- Mini readiness meter/progress bar.

## 10. Auth UI Cleanup

Login card should show:

- Title: `Secure Workshop Access`
- Status pill: `Auth0`
- Primary button: `Continue with Auth0`
- Signup CTA: `Create account with Auth0`
- Short trust copy: Auth0 manages sign-in; BenchOS scopes data to the authenticated account.
- No email/password inputs.
- No magic link.
- No Supabase copy.
- No disabled fake inputs.
- No Local Mode.

## 11. Copywriting

- Headline: `Your workshop command center starts here.`
- Subheadline: `Sign in to manage tools, projects, readiness, wishlist decisions, and BenchXP from one secure BenchOS account.`
- CTA: `Continue with Auth0`
- Signup CTA: `Create account with Auth0`
- Security note: `Auth0 handles sign-in. BenchOS scopes workshop data to your authenticated account.`
- Empty account note: `New accounts start clean. Sample starter data can be added later only if you choose it.`

## 12. Accessibility Requirements

- Primary CTA reachable by keyboard.
- Visible orange focus ring.
- Button has clear accessible label.
- Loading state uses `role="status"` and `aria-live`.
- Dark UI contrast must remain strong.
- No icon-only controls without labels.
- Respect reduced motion.

## 13. Implementation Phases

1. Auth UI cleanup.
2. Supabase removal.
3. Mandatory route protection.
4. Login page polish.
5. Data architecture preparation docs.
6. Empty account behavior verification.
7. Accessibility/mobile pass.

## 14. Testing Plan

Manual:

- Visit `appbenchos.com` logged out.
- Verify login is required.
- Verify direct `/tool-library` redirects to login.
- Click `Continue with Auth0`.
- Complete Auth0 login.
- Verify onboarding or dashboard opens.
- Refresh and verify session remains.
- Logout and verify session ends.
- Verify no Supabase fallback appears.
- Verify no email/password/magic-link UI appears.
- Verify no Titus account appears.
- Verify no Local Mode appears.
- Verify new account starts empty.

Automated:

- `npm run lint`
- `npm run test`
- `npm run build`
- Route tests for signed-out redirect.
- Auth UI tests that Supabase fields are absent.
- Tests that Local Mode route redirects.
- Tests that default personal sample data is absent.

## 15. Risks / Human Decisions

Locked decisions:

- App is Auth0-only for production auth.
- Signup is open.
- Supabase should be fully removed, not hidden.
- Login design should be minimal premium.
- Netlify Database remains preferred app-data direction.

Remaining owner decisions:

- Is `appbenchos.com` production or public beta?
- Should optional starter data exist later?
- Should existing local data be migrated into a real account?
- Should Netlify Database be selected for production data now, or only prepared in notes during this UI/auth pass?
