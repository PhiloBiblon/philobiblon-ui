# PhiloBiblon UI - Technical Documentation

Welcome to the technical documentation for the PhiloBiblon UI project. This documentation is designed to help new developers understand the architecture, codebase structure, and key technical decisions.

## Project Overview

PhiloBiblon UI is a modern web application for querying and editing items in a Wikibase instance. It consists of two main modules:

- **Frontend**: A Nuxt.js (Vue 2) single-page application with client-side rendering
- **Backend**: A Spring Boot middleware service handling OAuth authentication and API proxying

## Architecture Diagram

```
                                                 ┌─────────────────────┐
                               ┌────────────────▶│    Wikibase API     │◀────┐
                               │                 └─────────────────────┘     │
                               │                                             │
                               │ (read)                               (write)│
                               │                                             │
┌─────────────┐         ┌──────────────┐         ┌─────────────┐             │
│   Browser   │────────▶│   Frontend   │────────▶│   Backend   │─────────────┘
│             │◀────────│   (Nuxt.js)  │◀────────│(Spring Boot)│─────────────┐
└─────────────┘         └──────────────┘         └─────────────┘             │
                               │                                             │
                               │ (direct)                            (cached)│
                               │                                             │
                               │                 ┌─────────────────────┐     │
                               └────────────────▶│   SPARQL Endpoint   │◀────┘
                                                 └─────────────────────┘
```

**Architecture Summary**:
- **Wikibase API**: Frontend reads directly, Backend writes with OAuth
- **SPARQL Endpoint**: Frontend queries directly, Backend queries with caching

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
- **Nuxt.js 2** - Vue.js framework with SSR/SPA capabilities
- **Vuetify** - Material Design component library
- **Vuex** - State management
- **wikibase-sdk** - Wikibase query utilities
- **wikibase-edit** - Wikibase editing library

### Backend
- **Spring Boot 3** - Java application framework
- **ScribeJava** - OAuth 1.0a library
- **Caffeine** - High-performance caching
- **Apache Jena** - SPARQL processing

## Development Workflow

1. **Make changes** in your local environment
2. **Test locally** using the development servers
3. **Create a Pull Request** with your changes
4. **Code review** by team members
5. **Merge** after approval

## Getting Help

- Check the relevant documentation section for your area of work
- Review existing code for patterns and examples
- Ask questions in team channels
