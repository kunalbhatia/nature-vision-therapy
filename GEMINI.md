# Project Workflow & Conventions

## Git Workflow
To maintain a clean and linear history, prefer the following methods when merging changes:

- **Squash and Merge:** In the GitHub PR UI, choose "Squash and merge". This combines all your branch commits into one single commit on `main`.
- **Rebase and Merge:** This moves your branch commits to the tip of `main` and applies them one by one without a merge commit.
- **Local Rebase:** Before pushing, you can run `git rebase main` on your feature branch to "straighten" your local history.

## Coding Standards
- **Fullscreen for Activities:** All game and exercise components should implement fullscreen support on start using a `containerRef` and `requestFullscreen()`.
- **Vercel Hobby Plan Compliance:** Consolidate serverless functions in the `api/` directory (e.g., using an `auth.ts` dispatcher) to stay under the 12-function limit.
