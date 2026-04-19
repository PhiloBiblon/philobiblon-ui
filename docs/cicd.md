# CI/CD — GitHub Actions + GHCR

## Workflows

### `staging.yml` — triggers: push to `master`, manual

1. Builds `philobiblon-ui-backend` and `philobiblon-ui-frontend` images (with layer cache via GitHub Actions cache).
2. Pushes to GHCR with two tags each: `main-{7-char SHA}` and `main-latest`.
3. Deploys to the staging server via SSH using `docker-compose.ui-dev.yaml`.
4. Deletes old image versions, keeping the 5 most recent. Tags matching `^v` (production releases) are never deleted.

### `production.yml` — triggers: push of a `v*` tag (e.g. `v1.2.3`), manual

1. Builds both images and pushes with tags `v1.2.3` and `latest`.
2. Deploys to the production server via SSH using `docker-compose.ui-fact.yaml`.

## Deploy sequence

Both environments follow the same sequence on the server:

```bash
docker compose -f docker-compose.ui-<env>.yaml pull
docker compose -f docker-compose.ui-<env>.yaml up -d
docker image prune -f
```

| Environment | Compose file |
|---|---|
| Staging | `docker-compose.ui-dev.yaml` |
| Production | `docker-compose.ui-fact.yaml` |

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
- `docker-compose.ui-dev.yaml` (staging) or `docker-compose.ui-fact.yaml` (production)
- `.env` with the runtime environment variables

The server user must be in the `docker` group (or have equivalent permission to run `docker compose`).

## GHCR image names

```
ghcr.io/philobiblon/philobiblon-ui-backend
ghcr.io/philobiblon/philobiblon-ui-frontend
```

Images in a public repository on GHCR are free to pull without authentication.
