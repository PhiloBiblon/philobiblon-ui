# CI/CD — GitHub Actions + GHCR

## Workflows

### `staging.yml` — triggers: push to `master` touching `backend/`, `frontend/` or the workflow file itself, manual

Pushes that only touch other paths (docs, wiki pages, agent config…) don't produce a deployable change — the images are built solely from `backend/` and `frontend/` — so no run is triggered and, consequently, no deploy notification is posted either.

Deploy only — all notifications live in `staging-deploy-notify.yml` (see below).

1. Builds `philobiblon-ui-backend` and `philobiblon-ui-frontend` images (with layer cache via GitHub Actions cache).
2. Pushes to GHCR with two tags each: `main-{7-char SHA}` and `main-latest`.
3. Deploys to the staging server via SSH using `docker-compose.ui-dev.yml`.
4. Deletes old image versions, keeping the 5 most recent. Tags matching `^v` (production releases) are never deleted.

### `staging-deploy-notify.yml` — triggers: `workflow_run` (fires when `staging.yml` completes on `master`)

Posts the deploy notifications (success and failure). This is a **separate workflow**, not jobs inside `staging.yml`, both for separation of concerns (`staging.yml` deploys, this one notifies) and because `anthropics/claude-code-action@v1` (used here to write the deploy summary) does not support running under a `push`-triggered job — it only supports `issues`, `issue_comment`, `pull_request*`, `workflow_dispatch`, `repository_dispatch`, `schedule` and `workflow_run` events.

1. Checks the conclusions of the `build-and-push` and `deploy` jobs of that `staging.yml` run directly via the Actions API (independent of `cleanup`'s outcome, so a `cleanup`-only failure doesn't suppress the success notification), and looks up the pull request associated with the deployed commit (`find-pr` job).
2. **Both succeeded** (`notify-success` job): if a PR was found, posts a comment on it mentioning the GitHub author(s) of any issue(s) the PR references (`#123`-style patterns in its title/body), or `vars.DEPLOY_NOTIFY_SUCCESS_GITHUB_DEFAULT_USER` if none are linked — GitHub emails those users via its normal @mention notification, so no SMTP setup is needed. The comment states the staging URL (`https://philobiblon.cog.berkeley.edu/ui-dev/`) and the deployed version (recomputed the same way `staging.yml` builds it: `frontend/nuxt.config.ts`'s `version` plus the commit's short SHA), followed by an English summary and a "Suggested test plan" written by Claude from the PR's title, body, comments and reviews, plus the description/comments of the linked issue(s). Comments from the `coderabbitai` bot are ignored. If the Claude step itself fails, a bare fallback comment (still mentioning the right user(s), the URL and the version) is posted instead, so a successful deploy is never silently unnotified. If no PR was found, nothing is posted.
3. **Either failed** (`notify-failure` job): posts a failure comment mentioning `vars.DEPLOY_NOTIFY_FAILURE_GITHUB_USER`, with the failed job(s) and a link to the failed `staging.yml` run — on the PR if one was found, otherwise as a comment on the commit itself. No Claude involved, so this path stays simple and reliable.

### `production.yml` — triggers: push of a `v*` tag (e.g. `v1.2.3`), manual

1. Builds both images and pushes with tags `v1.2.3` and `latest`.
2. Deploys to the production server via SSH using `docker-compose.ui-fact.yml`.

### `patufet.yml` / `patufet-mention.yml` — triggers: issue and PR labels, PR pushes, `@claude` mentions

Autonomous issue → PR → review → fix → e2e flow from [patufet](https://github.com/jmformenti/patufet), pinned to `@v1`. The callers only hold project settings; the jobs run in patufet's reusable workflows.

| Event | Job | What it does |
|---|---|---|
| `ready-to-implement` added to an issue | `implement` | Implements the approved plan on `agent/issue-<n>`, runs `test-command` (backend tests, frontend lint + `yarn generate`) and opens a PR |
| PR opened / pushed (non-draft) | `review` | Reviews the PR and labels it `pass`, `warning` or `fail` |
| `warning` or `fail` added to a PR | `fix-review` | Applies the review, pushes (which re-runs `review`); after 10 cycles labels `needs-human-review` and mentions the reviewer |
| `pass` added to a PR | `e2e` | Serves the PR's frontend on the runner and tests it live, read-only (see below). On failure it relabels the PR `fail`, which starts `fix-review`; on success it mentions the reviewer |
| `@claude` in an issue, comment or review | `patufet-mention` | Answers the mention |

These labels are triggers, not just tags: adding `ready-to-implement`, `warning` or `fail` by hand starts an agent that pushes code, and adding `pass` starts the e2e run. `ready-to-implement` is only added by a human after approving the plan (`/plan-issue <n>` from Claude Code). `in-progress`, `to-refine`, `blocked`, `pass` and `needs-human-review` are set by the flow. Project-specific instructions for the agents live in `.github/patufet/*.md`.

**e2e scope.** FactGrid sends low-reputation IPs (GitHub runners included) to a PoW challenge page, so a backend started on the runner cannot reach it. `.github/patufet/e2e-up.sh` therefore builds only the PR's frontend (`yarn generate`), serves it on `localhost:3000` and points it at the staging backend (`https://philobiblon.cog.berkeley.edu/ui-local`). Consequences: backend changes in the PR are not exercised; there is no login, so only read-only flows are tested; each run sends a few searches to staging and FactGrid; if staging is down the job fails before testing, without a verdict and without touching labels. What the tester always checks, and the known console noise to ignore, is in `.github/patufet/e2e.md`.

A PR that edits `patufet.yml` gets no automatic review (the action refuses a workflow that differs from the default branch's copy): review and merge it by hand.

## Deploy sequence

Both environments follow the same sequence on the server:

```bash
docker compose -f docker-compose.ui-<env>.yml pull
docker compose -f docker-compose.ui-<env>.yml up -d
docker image prune -f
```

| Environment | Compose file |
|---|---|
| Staging | `docker-compose.ui-dev.yml` |
| Production | `docker-compose.ui-fact.yml` |

The compose files on the server must reference the GHCR images directly:
- Staging: `ghcr.io/philobiblon/philobiblon-ui-{backend,frontend}:main-latest`
- Production: `ghcr.io/philobiblon/philobiblon-ui-{backend,frontend}:latest`

## GitHub Environments

Secrets and variables are managed per environment at **Settings → Environments**.
Create two environments: `staging` and `production`, each with:

### Variables (`vars.*`) — visible, non-sensitive

| Variable | Description |
|---|---|
| `BASE_URL` | Frontend base path (e.g. `/` or `/ui/`) — baked into the image at build time |
| `API_BASE_URL` | Backend API URL (e.g. `https://example.com/api/`) — baked into the image at build time |
| `DEPLOY_PATH` | Absolute path to the project on the server |
| `WIKIBASE_NEW_ITEM_PAGE` | Optional override for the wiki page driving new-item property ordering — baked into the image at build time. Defaults to `Ui_SortedProperties_NewItem` when unset; only staging sets this (production intentionally always uses the default) |
| `DEPLOY_NOTIFY_SUCCESS_GITHUB_DEFAULT_USER` | GitHub login mentioned in the PR comment on a successful staging deploy when the PR references no issue — staging only |
| `DEPLOY_NOTIFY_FAILURE_GITHUB_USER` | GitHub login mentioned in the PR/commit comment on a failed staging deploy — staging only |

### Secrets (`secrets.*`) — encrypted

| Secret | Description |
|---|---|
| `SSH_HOST` | Hostname or IP of the server |
| `SSH_USER` | SSH username |
| `SSH_KEY` | Private SSH key (RSA or Ed25519) |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no manual setup needed.
`CLAUDE_CODE_OAUTH_TOKEN` is a repository-level secret (not per-environment), also used by `staging-deploy-notify.yml` and the patufet workflows (`patufet.yml`, `patufet-mention.yml`).

## Testing pipelines manually

Both workflows support `workflow_dispatch`, which allows triggering them manually without a push or tag:

1. Go to **Actions** in the GitHub repository
2. Select the workflow (`Staging` or `Production`)
3. Click **Run workflow** and select the branch

## Server prerequisites

The deploy path on each server must contain:
- `docker-compose.ui-dev.yml` (staging) or `docker-compose.ui-fact.yml` (production)
- `.env` with the runtime environment variables

The server user must be in the `docker` group (or have equivalent permission to run `docker compose`).

## GHCR image names

```
ghcr.io/philobiblon/philobiblon-ui-backend
ghcr.io/philobiblon/philobiblon-ui-frontend
```

Images in a public repository on GHCR are free to pull without authentication.
