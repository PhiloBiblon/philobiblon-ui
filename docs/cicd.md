# CI/CD — GitHub Actions + GHCR

## Workflows

### `staging.yml` — triggers: push to `master`, manual

1. Builds `philobiblon-ui-backend`, `philobiblon-ui-frontend`, and `philobiblon-ui-quicksearch-registrar` images (with layer cache via GitHub Actions cache).
2. Pushes to GHCR with two tags each: `main-{7-char SHA}` and `main-latest`.
3. Deploys to the staging server via SSH using `docker-compose.ui-dev.yml`.
4. Deletes old image versions, keeping the 5 most recent. Tags matching `^v` (production releases) are never deleted.

### `production.yml` — triggers: push of a `v*` tag (e.g. `v1.2.3`), manual

1. Builds all three images and pushes with tags `v1.2.3` and `latest`.
2. Deploys to the production server via SSH using `docker-compose.ui-fact.yml`.

### QuickSearch filter registration

`philobiblon-ui-quicksearch-registrar` is a small image (built from `frontend/Dockerfile`'s `quicksearch-registrar` target) whose only job is to register/refresh the QuickSearch filter templates (`frontend/service/quickSearchFilters.js`) against the backend's internal-only `/api/search/quick/register` endpoint. It's **on-demand only** — tagged with the `manual` compose profile, so it never starts as part of `up`/`up -d` and is not triggered by the deploy pipeline at all. Run it by hand whenever a filter is added or its template changes:

```bash
docker compose -f docker-compose.ui-<env>.yml --profile manual run --rm quicksearch-registrar
```

Querying a `filterId` that was never registered isn't an error: the backend returns an empty result set with an "index loading" state (same as a filter that's still loading its first index), so the UI degrades gracefully — it just never gets QuickSearch results for that filter until someone runs the command above.

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
- Staging: `ghcr.io/philobiblon/philobiblon-ui-{backend,frontend,quicksearch-registrar}:main-latest`
- Production: `ghcr.io/philobiblon/philobiblon-ui-{backend,frontend,quicksearch-registrar}:latest`

## GitHub Environments

Secrets and variables are managed per environment at **Settings → Environments**.
Create two environments: `staging` and `production`, each with:

### Variables (`vars.*`) — visible, non-sensitive

| Variable | Description |
|---|---|
| `BASE_URL` | Frontend base path (e.g. `/` or `/ui/`) — baked into the image at build time |
| `API_BASE_URL` | Backend API URL (e.g. `https://example.com/api/`) — baked into the image at build time |
| `DEPLOY_PATH` | Absolute path to the project on the server |

### Secrets (`secrets.*`) — encrypted

| Secret | Description |
|---|---|
| `SSH_HOST` | Hostname or IP of the server |
| `SSH_USER` | SSH username |
| `SSH_KEY` | Private SSH key (RSA or Ed25519) |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no manual setup needed.

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

### Required service block: `quicksearch-registrar`

Each server-side compose file must define a `quicksearch-registrar` service alongside `backend`/`frontend`, referencing the matching GHCR image and tag for that environment, tagged with the `manual` profile so it's never started by a plain `up -d`:

```yaml
quicksearch-registrar:
    image: ghcr.io/philobiblon/philobiblon-ui-quicksearch-registrar:main-latest   # :latest on production
    profiles:
        - manual
    restart: "no"
    depends_on:
        - backend
    environment:
        - BACKEND_URL=http://backend:8080
```

This is a one-time manual addition (the file isn't checked into this repository). Once added, register/refresh filters on that server with `docker compose -f docker-compose.ui-<env>.yml --profile manual run --rm quicksearch-registrar`, run by hand whenever needed — see "QuickSearch filter registration" above.

## GHCR image names

```
ghcr.io/philobiblon/philobiblon-ui-backend
ghcr.io/philobiblon/philobiblon-ui-frontend
ghcr.io/philobiblon/philobiblon-ui-quicksearch-registrar
```

Images in a public repository on GHCR are free to pull without authentication.
