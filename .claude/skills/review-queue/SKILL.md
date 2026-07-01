---
name: review-queue
description: List open PRs in philobiblon-ui where the user is requested as a reviewer or is the assignee, showing whether each branch is up to date with master or needs a rebase. Read-only — does not review anything itself. Use when the user asks what they need to review or wants to check their review queue.
---

Lists the PRs waiting on the current user, so they can decide what to review and in what order. This skill is purely informational: it never reviews anything itself. Once the user picks a PR, run the `review` skill against it manually.

## Process

### 1. Fetch both PR sets

The repo is resolved automatically from `git remote -v`, same as `docs/agents/issue-tracker.md`.

GitHub's search syntax doesn't support a clean OR between `review-requested` and `assignee`, so run two separate queries:

```
gh pr list --state open --search "review-requested:@me" --json number,title,url,author,updatedAt,mergeStateStatus,isDraft,headRefName,reviewDecision,statusCheckRollup
gh pr list --state open --assignee "@me" --json number,title,url,author,updatedAt,mergeStateStatus,isDraft,headRefName,reviewDecision,statusCheckRollup
```

### 2. Merge and dedupe

Combine both result sets by PR `number`. For each PR, track why it showed up: `Review requested`, `Assignee`, or `Both` if it appeared in both lists.

### 3. Empty case

If the merged list is empty, report "no PRs pending" and stop — don't produce an empty table.

### 4. Interpret `mergeStateStatus`

Map each PR's `mergeStateStatus` to a short branch-status label:

- `CLEAN` → up to date with master, ready to review.
- `BEHIND` → needs a rebase/merge with master before reviewing.
- `DIRTY` → conflicts.
- `UNSTABLE` → CI/checks failing.
- `BLOCKED` → blocked — see step 4b for the specific reason.
- Anything else → show the raw value as-is.

`mergeStateStatus` only ever holds one value, so a `BLOCKED` PR can *also* be behind master — that fact is hidden unless you check separately (step 4c).

### 4b. Diagnose the `BLOCKED` reason

For any PR whose `mergeStateStatus` is `BLOCKED`, use `reviewDecision` and `statusCheckRollup` (already fetched in step 1) to say why:

- `reviewDecision: REVIEW_REQUIRED` and all `statusCheckRollup` entries `SUCCESS` → "awaiting review"
- `reviewDecision: CHANGES_REQUESTED` → "changes requested"
- Any `statusCheckRollup` entry with state other than `SUCCESS` (e.g. `PENDING`, `FAILURE`, `ERROR`) → "checks pending/failing" (name the check if only one is non-passing)
- If both apply, mention both, e.g. "awaiting review; 1 check pending"

### 4c. Check whether the branch is actually rebased

Don't rely on `mergeStateStatus` for this — `BLOCKED` doesn't tell you if the branch is also behind master. For each PR, compare its `headRefName` against `master` directly:

```
gh api "repos/<owner>/<repo>/compare/master...<headRefName>" --jq '{ahead_by, behind_by}'
```

URL-encode the branch name (e.g. `#` → `%23`, non-ASCII characters) or the API returns a `404`. `behind_by: 0` means the branch is rebased/up to date with master; `behind_by > 0` means it needs a rebase or merge — report the count.

### 4d. Surface the CodeRabbit check state

CodeRabbit doesn't leave a formal PR review (`reviews` stays empty) — it posts an automated summary as an issue comment and reports its own progress as a check in `statusCheckRollup` (entry with `context: "CodeRabbit"`). Pull that entry out separately from the generic blocked-reason bucket in step 4b:

- No entry with `context: "CodeRabbit"` → "not run"
- `state: SUCCESS` → "done"
- `state: PENDING`/`IN_PROGRESS` → "in progress"
- `state: FAILURE`/`ERROR` → "failed"

### 5. Present the table

Sort by `updatedAt` ascending (oldest first — these have usually been waiting longest). Columns: PR number, title, author, reason (Review requested / Assignee / Both), days since last update, branch status (from step 4), blocked reason (from step 4b, blank if not blocked), rebased? (from step 4c), CodeRabbit (from step 4d).

### 6. Stop there

Don't call the `review` skill automatically for any PR — the user picks which one to review and does that themselves.
