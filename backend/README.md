# PhiloBiblon UI - Backend

This module is a Spring Boot application that acts as a middleware for the PhiloBiblon UI.

## Features

- **Authentication Proxy**: Handles OAuth 1.0 authentication flow with Wikibase.
- **API Proxy**: Forwards requests to the wikibase-edit library.
- **SPARQL Cache**: Improves performance by caching SPARQL query results.

## Prerequisites

- Java 17 or higher
- Maven (wrapper included)

## Configuration

The application is configured using environment variables. You can set these in your IDE or export them in your shell before running the application.

| Variable | Description |
|----------|-------------|
| `WIKIBASE_BASE_URL` | Base URL of the Wikibase instance |
| `WIKIBASE_API_URL` | URL for the Wikibase API |
| `WIKIBASE_INDEX_URL` | URL for the Wikibase index |
| `WIKIBASE_NICE_URL_BASE` | Nice URL base for the Wikibase (used for OAuth) |
| `SPARQL_BASE_URL` | Base URL for the SPARQL service |
| `SPARQL_ENDPOINT` | Full SPARQL endpoint URL |
| `SPARQL_QUERY_PREFIX` | Default prefixes for SPARQL queries |
| `OAUTH_CONSUMER_KEY` | OAuth consumer key from Wikibase |
| `OAUTH_CONSUMER_SECRET` | OAuth consumer secret from Wikibase |
| `OAUTH_CALLBACK_URL` | Callback URL for OAuth flow |
| `ALLOWED_ORIGINS` | CORS allowed origins (e.g., `http://localhost:3000`) |

## Running Locally

To run the application locally using the Maven wrapper:

```bash
./mvnw spring-boot:run
```

make sure to set the environment variables properly before running the command, e.g.:

```bash
export ALLOWED_ORIGINS=http://localhost:3000
./mvnw spring-boot:run
```

## Build

To build the executable JAR:

```bash
./mvnw clean package
```

The artifact will be generated in the `target/` directory.
