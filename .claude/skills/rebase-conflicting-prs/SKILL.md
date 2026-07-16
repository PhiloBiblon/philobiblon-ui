---
name: rebase-conflicting-prs
description: Find every open PR assigned to or review-requested from the current user that has merge conflicts with master, rebase each one, force-push the update, and comment to request a fresh review from @claude and from the author. Use when the user wants to clear out PRs stuck on conflicts, review PRs that need rebase, or bulk-rebase their conflicting PR queue.
---

## Process

### 1. Find candidate PRs

Same two queries as the `review-queue` skill (the repo is resolved from `git remote -v`):

```
gh pr list --state open --search "review-requested:@me" --limit 200 --json number,title,url,author,headRefName,headRepositoryOwner,mergeable,mergeStateStatus
gh pr list --state open --assignee "@me" --limit 200 --json number,title,url,author,headRefName,headRepositoryOwner,mergeable,mergeStateStatus
```

Merge and dedupe by PR `number`.

Filter down to PRs where `mergeable` is `CONFLICTING`, or `mergeStateStatus` is `DIRTY`. For any PR whose `mergeable` is still `UNKNOWN` (GitHub computes it lazily), re-fetch once with `gh pr view <number> --json mergeable` and re-check before deciding it doesn't qualify.

### 2. Empty case

If nothing matches, report "no conflicting PRs" and stop — don't proceed to confirmation or the loop.

### 3. Confirm the batch

List the matching PRs (number, title, author, branch) and get the user's confirmation once for the whole batch before touching anything. This step rebases and force-pushes PR branches other people may have checked out locally — get sign-off up front, not per PR.

### 4. Per PR

Work through the confirmed list in order. For each PR:

1. **Check out the branch.** `git status` first — the working tree must be clean; if not, stop and ask the user (stash/commit), never discard uncommitted work silently. Then run `gh pr checkout <number>` to check out the PR's branch — for same-repo PRs this tracks `origin`; for fork PRs (`headRepositoryOwner` differs from this repo's owner) it creates and tracks a remote pointing at the fork, so the push step below automatically goes to the right place.
2. **Rebase.** Invoke the `rebase` skill with this branch onto `master`. That skill invokes `resolving-merge-conflicts` for any hunks and runs the project's checks (`yarn lint` in `frontend/`, `./mvnw test` in `backend/`, per `AGENTS.md`, for whatever the rebased commits touch).
3. **Push.** `git push --force-with-lease` (no explicit remote — resolves to the tracking remote `gh pr checkout` set up: the fork's remote for fork PRs, `origin` otherwise). If the push is rejected (e.g. the fork owner hasn't enabled "Allow edits from maintainers"), don't retry against `origin` — report and skip like any other per-PR failure.
4. **Request review.** `gh pr comment <number> --body "@claude review this PR"`.
5. **Notify the author.** `gh pr comment <number> --body "@<author-login> I've applied a rebase and triggered a new review. Could you please check and test again?"` — always in English, regardless of the conversation's language.

A PR whose rebase fails partway (unresolvable conflict, broken checks, rejected push) should be reported and skipped, not force-pushed in a broken state — continue with the rest of the batch. If the failure leaves the repo mid-rebase (an unresolvable conflict `resolving-merge-conflicts` couldn't clear), run `git rebase --abort` and confirm `git status` is clean before checking out the next PR — `resolving-merge-conflicts`'s own contract never aborts on your behalf, but this skill's batch loop overrides that for the unattended case, since leaving one PR mid-rebase would break every checkout after it. A clean rebase that only fails checks doesn't need an abort — just skip the push/comment steps for that PR.

### 5. Return

After the last PR, check out the branch the user started on (typically `master`) so the working tree isn't left sitting on a PR branch.

### 6. Report

Summarize per PR: whether it had conflicts and in which files, whether checks passed after rebase, and that both comments were posted. Flag any PR that was skipped and why.
