# Contributing to PhiloBiblon UI

Thanks for contributing. This document covers the git workflow, branch naming, and commit message conventions used in this repo. For environment setup, architecture, and the full CI/CD pipeline, see the links at the bottom — this file only covers the contribution process itself.

## Workflow

We use a lightweight GitHub Flow:

1. **Branch off `master`.** `master` is always deployable — every merge auto-deploys to staging (see [docs/README.md](docs/README.md#development-workflow)), so keep it clean.
2. **Open a Pull Request** against `master` as soon as your change is ready for feedback.
3. **CodeRabbit runs automatically** on every PR as an automated first-pass review. Address its comments.
4. **At least one approved human review is required** before a PR can be merged — branch protection blocks merging otherwise.
5. **Merge via squash-merge.** All commits on your branch are squashed into a single commit on `master`, titled after the PR title (e.g. `feat(frontend): add P799 with P106 date and comma separator for UNI items`). Individual commits on your branch don't need to be perfect, but **write your PR title as a good Conventional Commit message** (see below) — squash-merge makes it the permanent history on `master`.

What happens after merge (staging deploy, second review, production tagging) is documented in [docs/README.md's Development Workflow section](docs/README.md#development-workflow) — this file only covers getting your PR merged.

## Branch naming

Use a short, descriptive branch name prefixed with a short category (for example `feature/`, `fix/`, `chore/`, or `docs/`):

```
category/short-description
```

Examples: `feature/date-filter`, `fix/manid-item-creation`, `chore/update-dependencies`, `docs/contributing-guide`.

This is a recommended convention going forward, not something currently enforced by tooling.

## Commit messages: Conventional Commits

We're adopting [Conventional Commits](https://www.conventionalcommits.org/) for new commit messages and PR titles. This is a **new convention** — existing history on `master` is a mix of conforming and non-conforming messages — but please follow it going forward, especially for your **PR title**, since squash-merge makes it the permanent commit message on `master`.

Format: `type(scope): short summary`

| Type | Use for |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, whitespace, etc. (no code behavior change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Other changes that don't modify src or test files |

Scope is typically `frontend` or `backend` (omit it if the change spans both or is repo-wide).

Examples:

```
feat(frontend): add date range filter to manuscript search
fix(backend): correct OAuth token refresh timing
docs: add CONTRIBUTING.md with git workflow and commit conventions
```

## Setup and technical documentation

- [docs/README.md](docs/README.md) — documentation index, architecture overview, and full development-to-production pipeline
- [docs/frontend/setup.md](docs/frontend/setup.md) — frontend setup
- [docs/backend/setup.md](docs/backend/setup.md) — backend setup
- [docs/cicd.md](docs/cicd.md) — CI/CD workflows and deployment
- [AGENTS.md](AGENTS.md) — deeper technical/architecture reference (written for AI coding agents, but useful background for any contributor)
