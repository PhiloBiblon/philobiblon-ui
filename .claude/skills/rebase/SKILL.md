---
name: rebase
description: Rebase a PR branch onto the latest master (or another target branch), resolving any conflicts via the resolving-merge-conflicts skill. Use when the user asks to rebase a branch, update a PR branch on top of master, or fix a branch reported as behind master (e.g. by review-queue).
---

1. **Check starting state.** `git status` to make sure the working tree is clean. If there are uncommitted changes, stop and ask the user (stash/commit) — never discard changes silently.

2. **Resolve the branches.** Source branch = the one the user names (typically an existing PR branch), or the current branch if none is given; if it doesn't exist locally, fetch/checkout it from origin. Target branch = the one the user names, defaulting to `master`. `git fetch origin` so `origin/<target>` and the source branch are current.

3. **Run the rebase.** `git rebase origin/<target>` (normally `origin/master`). Never `git rebase -i`, and never skip hooks (`--no-verify`).

4. **On conflicts:** invoke the `resolving-merge-conflicts` skill to resolve each hunk — it handles understanding original intent, resolving without inventing behaviour, and never `--abort`, running `git rebase --continue` until the whole rebase completes.

5. **Verify.** Once the rebase finishes cleanly, run this project's checks for whatever areas the rebased commits touch (`yarn lint` in `frontend/` for frontend changes, `./mvnw test` in `backend/` for backend changes — see `AGENTS.md`). Fix anything the rebase broke.

6. **Report, don't push.** Summarize what was rebased and that the local branch has now diverged from its remote counterpart. Do **not** force-push automatically — ask the user to confirm before running `git push --force-with-lease`.
