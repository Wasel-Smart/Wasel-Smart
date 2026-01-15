PR: Code-splitting, withNavigation HOC extraction, and Firebase hardening

Summary
- Extracted and typed `withNavigation` HOC to `src/utils/withNavigation.tsx` and added a utils barrel at `src/utils/index.ts`.
- Implemented React.lazy + Suspense for several heavy route components to reduce initial bundle size and improve load performance.
- Hardened Firebase initialization in `src/firebase.ts` with safer checks for messaging, analytics, and VAPID key validation.
- Re-exported duplicate `src/src/firebase.ts` as a deprecation shim to avoid duplicate initialization.
- Added a basic unit test scaffold for `withNavigation` at `src/__tests__/withNavigation.test.tsx`.
- Wrapped the application in `React.StrictMode` in `src/main.tsx`.

Files changed (high-level)
- Modified: src/AppRouter.tsx (lazy-loading, Suspense, removed duplicate blocks, fixed /cancel-trip usage)
- Modified: src/main.tsx (React.StrictMode)
- Modified: src/firebase.ts (robust init)
- Modified: src/src/firebase.ts (re-export shim)
- Added: src/utils/withNavigation.tsx (typed HOC)
- Added: src/utils/index.ts (barrel)
- Added: src/__tests__/withNavigation.test.tsx (test)
- Added: PR_DESCRIPTION.md (this file)

Notes for reviewers
- Many routes were converted to lazy imports. Verify that server-side imports (if any) are not affected.
- I added a basic Jest test; CI config will follow if you want automated checks.
- There is now a single source-of-truth for Firebase at `src/firebase.ts`.

Suggested git commands to create branch and commit:

```bash
git checkout -b chore/code-splitting-withnavigation-firebase
git add .
git commit -m "chore: extract withNavigation, lazy-load routes, harden firebase"
git push origin HEAD
```
