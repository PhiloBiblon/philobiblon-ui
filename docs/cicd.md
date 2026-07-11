# CI/CD — GitHub Actions + GHCR

## Workflows

### `staging.yml` — triggers: push to `master`, manual

1. Looks up the pull request associated with the pushed commit (`find-pr` job), if any.
2. Builds `philobiblon-ui-backend` and `philobiblon-ui-frontend` images (with layer cache via GitHub Actions cache).
3. Pushes to GHCR with two tags each: `main-{7-char SHA}` and `main-latest`.
4. Deploys to the staging server via SSH using `docker-compose.ui-dev.yml`.
5. On success, if a PR was found, posts a comment on it (`notify-success` job) mentioning the GitHub author(s) of any issue(s) the PR references (`#123`-style patterns in its title/body), or `vars.DEPLOY_NOTIFY_SUCCESS_GITHUB_DEFAULT_USER` if none are linked — GitHub emails those users via its normal @mention notification, so no SMTP setup is needed. The comment body is an English summary and test plan written by Claude (`anthropics/claude-code-action@v1`) from the PR's title, body, comments and reviews, plus the description/comments of the linked issue(s). Comments from the `coderabbitai` bot are ignored. Skipped entirely if there was no associated PR.
6. On failure of the build or deploy step, posts a failure comment instead (`notify-failure` job) mentioning `vars.DEPLOY_NOTIFY_FAILURE_GITHUB_USER`, with the failed job(s) and a link to the workflow run — on the PR if one was found, otherwise as a comment on the commit itself. Runs even when `notify-success` is skipped.
7. Deletes old image versions, keeping the 5 most recent. Tags matching `^v` (production releases) are never deleted.

### `production.yml` — triggers: push of a `v*` tag (e.g. `v1.2.3`), manual

1. Builds both images and pushes with tags `v1.2.3` and `latest`.
2. Deploys to the production server via SSH using `docker-compose.ui-fact.yml`.

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
| `DEPLOY_NOTIFY_SUCCESS_GITHUB_DEFAULT_USER` | GitHub login mentioned in the PR comment on a successful staging deploy when the PR references no issue — staging only |
| `DEPLOY_NOTIFY_FAILURE_GITHUB_USER` | GitHub login mentioned in the PR/commit comment on a failed staging deploy — staging only |

### Secrets (`secrets.*`) — encrypted

| Secret | Description |
|---|---|
| `SSH_HOST` | Hostname or IP of the server |
| `SSH_USER` | SSH username |
| `SSH_KEY` | Private SSH key (RSA or Ed25519) |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no manual setup needed.
`CLAUDE_CODE_OAUTH_TOKEN` is a repository-level secret (not per-environment), also used by `claude.yml` and `claude-code-review.yml`.

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
