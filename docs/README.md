# PhiloBiblon UI - Technical Documentation

Welcome to the technical documentation for the PhiloBiblon UI project. This documentation is designed to help new developers understand the architecture, codebase structure, and key technical decisions.

## Project Overview

PhiloBiblon UI is a modern web application for querying and editing items in a Wikibase instance. It consists of two main modules:

- **Frontend**: A Nuxt 3 (Vue 3) single-page application with client-side rendering, using Vuetify 4 and Pinia
- **Backend**: A Spring Boot 4 middleware service handling OAuth authentication and API proxying

## Architecture Diagram

General overview:

```mermaid
flowchart LR
    Browser["Browser"]
    Frontend["Frontend\n(Nuxt 3)"]
    Backend["Backend\n(Spring Boot 4)"]
    Wikibase["Wikibase API"]
    SPARQL["SPARQL Endpoint"]

    Browser <--> Frontend
    Frontend <--> Backend
    Backend -- "read / write (proxy)" --> Wikibase
    Backend -- "cached / pass-through" --> SPARQL
```

All traffic from the browser passes through an **nginx reverse proxy** running inside Docker Compose. nginx routes requests matching `/(api|w|./w)/` to the backend, and everything else to the frontend (static SPA files). This means the browser always talks to a single origin, avoiding CORS issues. The `/w/` and `./w/` patterns cover Wikibase API and OAuth paths that the backend proxies.

**Item reads** (fetching Wikibase entities, UI config wiki pages) and **item writes** (edits) both go through the backend `/w/**` proxy, never directly from the browser to Wikibase. Writes are signed with OAuth 1.0a using a server-side consumer secret that is never exposed to the browser. Routing reads through the backend also avoids FactGrid's reputation check, which redirects some browsers to a `/rep-pow-challenge` page without CORS headers and breaks direct `fetch` calls.

**SPARQL queries** use a two-level cache: the frontend holds an in-memory Pinia cache (2-min TTL, 100 entries) for repeated queries within the same browser session, and the backend holds a DB-backed result cache (H2: `cached_query` registry + `cached_query_row` materialized rows, refreshed nightly, shared across all users and surviving restarts). Search/autocomplete queries always go through the backend cache; see [backend/caching.md](backend/caching.md). Other queries (result grids, counts, related items) are forwarded by `POST /api/sparql`, a pass-through to the SPARQL endpoint that is not cached on the backend.

More detailed:

```mermaid
graph TB
    User["Browser / User"]

    subgraph Docker["Docker Compose"]
        Nginx["nginx\n(reverse proxy)"]

        subgraph FE["Frontend — Nuxt 3 / Vue 3 / Vuetify 4"]
            Pages["Pages\nindex · search/* · item/* · create/* · wiki/*\noauth_callback"]
            Store["Pinia Store\nauth · breadcrumb\nitemCache · queryCache · queryStatus"]
            Services["Services\nquery.service · wikibase.service\noauth.service · notification.service"]
            Pages <--> Store
            Pages <--> Services
        end

        subgraph BE["Backend — Spring Boot 4 / Java 21"]
            ConfigCtrl["ConfigController\n/api/config"]
            OAuthCtrl["OAuthController\n/api/oauth/*"]
            SearchCtrl["SearchController\n/api/search"]
            ProxyCtrl["ProxyController\n/w/**"]
            SparqlCtrl["SparqlController\n/api/sparql"]

            CacheSvc["SparqlCacheService"]
            QuickSvc["QuickSearchService\n(transitional alias)"]
            OAuthSvc["WikibaseOAuthService"]

            Cache[("H2 DB\ncached_query · cached_query_row\nnightly refresh")]

            SearchCtrl --> CacheSvc
            SearchCtrl --> QuickSvc
            OAuthCtrl --> OAuthSvc
            CacheSvc <--> Cache
        end
    end

    subgraph External["External Systems"]
        Wikibase["Wikibase\n(API + OAuth)"]
        SPARQL["SPARQL Endpoint"]
    end

    User <--> Nginx
    Nginx -- "/" --> FE
    Nginx -- "/(api|w|./w)/" --> BE

    Services -- "item read/edit" --> ProxyCtrl
    Services -- "result grids / counts" --> SparqlCtrl
    Services -- "search / autocomplete" --> SearchCtrl
    Services -- "OAuth flow" --> OAuthCtrl
    Services -- "config" --> ConfigCtrl

    CacheSvc --> SPARQL
    QuickSvc --> SPARQL
    SparqlCtrl --> SPARQL
    ProxyCtrl --> Wikibase
    OAuthSvc --> Wikibase
```

**Architecture Summary**:
- **nginx**: reverse proxy that routes `/(api|w|./w)/` to the backend and `/` to the frontend
- **Frontend (Nuxt 3)**: SPA served as static files; routes Wikibase reads/writes and SPARQL through the backend
- **Backend (Spring Boot 4)**: OAuth 1.0a proxy for writes, DB-backed SPARQL result cache serving the search API
- **Wikibase API**: reads and writes are proxied through the backend (writes are signed with OAuth)
- **SPARQL Endpoint**: search/autocomplete queries are served from the backend's DB cache (materialized rows, nightly refresh); the result grids go through `POST /api/sparql` (pass-through) with a short-lived frontend cache (2 min)

## Documentation Structure

### Frontend Documentation
- [Setup Guide](frontend/setup.md) - Getting started with the frontend
- [Architecture](frontend/architecture.md) - Nuxt.js structure and configuration
- [State Management](frontend/state-management.md) - Vuex store modules
- [Services](frontend/services.md) - API and business logic services
- [Components](frontend/components.md) - Component architecture

### Backend Documentation
- [Setup Guide](backend/setup.md) - Getting started with the backend
- [Architecture](backend/architecture.md) - Spring Boot structure
- [Security & OAuth](backend/security.md) - Authentication and authorization
- [Caching](backend/caching.md) - SPARQL query caching

### Operations
- [CI/CD](cicd.md) - GitHub Actions workflows, GHCR image registry, and deploy secrets

## Quick Start

### Running with Docker
```bash
docker compose up --build -d
```

### Running Locally (Development)

**Frontend:**
```bash
cd frontend
yarn install
export API_BASE_URL=https://philobiblon.cog.berkeley.edu/ui-dev/
yarn dev
```

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

## Key Technologies

### Frontend
- **Nuxt 3** - Vue.js framework (SSR disabled, SPA mode)
- **Vue 3** - Composition API
- **Vuetify 4** - Material Design component library
- **Pinia** - State management
- **wikibase-sdk** - Wikibase query utilities
- **wikibase-edit** - Wikibase editing library

### Backend
- **Spring Boot 4 / Java 21** - Java application framework
- **ScribeJava** - OAuth 1.0a library
- **Spring Data JPA + H2** - persistence for the SPARQL result cache
- **Apache Jena** - SPARQL processing

## Development Workflow

> Branch naming and commit message conventions are documented in [CONTRIBUTING.md](../CONTRIBUTING.md).

```mermaid
flowchart LR
    A[🧑‍💻 Code changes] --> B[🤖 Automated review\nCodeRabbit]
    B -->|Auto-fix| A
    B --> C[📋 JM review]
    C -->|Changes needed| A
    C -->|Approved| D[🔀 Merge PR]
    D --> E[🚀 Auto-published\nto staging]
    E --> F[👤 Charles review]
    F -->|Changes needed| A
    F -->|Approved| G[🏷️ New version tag]
    G --> H[🌐 Auto-published\nto production]

    style B fill:#f5a623,color:#000
    style E fill:#27ae60,color:#fff
    style H fill:#8e44ad,color:#fff
```

1. **Code changes** — develop locally and open a Pull Request against `master`.
2. **Automated review** — CodeRabbit analyses the PR and may push auto-fixes directly to the branch.
3. **JM review** — Josep Maria reviews the PR; requests changes or approves.
4. **Merge PR** — merging to `master` triggers the staging CI/CD pipeline automatically.
5. **Staging** — the new build is deployed to the staging server within minutes.
6. **Charles review** — Charles tests the changes on staging; requests changes or approves.
7. **New version tag** — pushing a `v*` tag (e.g. `v1.2.3`) triggers the production pipeline.
8. **Production** — the tagged build is deployed to the production server automatically.

See [CI/CD](cicd.md) for details on the GitHub Actions workflows and deploy secrets.

## Getting Help

- Check the relevant documentation section for your area of work
- Review existing code for patterns and examples
- Ask questions in team channels
