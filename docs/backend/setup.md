# Backend Setup Guide

This guide will help you set up the PhiloBiblon UI backend for local development.

## Prerequisites

- **Java**: JDK 17 or later
- **Maven**: 3.6+ (or use the included Maven Wrapper)
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PhiloBiblon/philobiblon-ui.git
cd philobiblon-ui/backend
```

### 2. Verify Java Version

```bash
java -version
# Should show version 17 or higher
```

## Configuration

The backend requires several environment variables to connect to Wikibase and configure OAuth.

### Required Environment Variables

Create a `.env` file or export these variables:

```bash
# Wikibase URLs
export WIKIBASE_BASE_URL=https://wikibase.example.org
export WIKIBASE_API_URL=https://wikibase.example.org/w/api.php
export WIKIBASE_INDEX_URL=https://wikibase.example.org/w/index.php
export WIKIBASE_NICE_URL_BASE=https://wikibase.example.org/wiki/

# SPARQL Endpoint
export SPARQL_BASE_URL=https://query.example.org
export SPARQL_ENDPOINT=https://query.example.org/sparql
export SPARQL_QUERY_PREFIX="PREFIX wd: <https://wikibase.example.org/entity/>\\nPREFIX wdt: <https://wikibase.example.org/prop/direct/>"

# OAuth Configuration
export OAUTH_CONSUMER_KEY=your_consumer_key_here
export OAUTH_CONSUMER_SECRET=your_consumer_secret_here
export OAUTH_CALLBACK_URL=http://localhost:3000/login

# CORS
export ALLOWED_ORIGINS=http://localhost:3000
```

### Development Configuration

For development, you can use `application-dev.properties`:

```properties
# src/main/resources/application-dev.properties
spring.profiles.active=dev
logging.level.io.github.philobiblon=DEBUG
```

Run with dev profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Running the Backend

### Using Maven Wrapper (Recommended)

```bash
./mvnw spring-boot:run
```

The application will start on `http://localhost:8080`.

### Using Installed Maven

```bash
mvn spring-boot:run
```

### Building JAR

To create an executable JAR:

```bash
./mvnw clean package
java -jar target/backend-1.0.4.jar
```

## Verifying the Installation

### 1. Health Check

```bash
curl http://localhost:8080/api/config
```

Should return JSON with configuration:

```json
{
  "wikibaseBaseUrl": "https://wikibase.example.org",
  "wikibaseApiUrl": "https://wikibase.example.org/w/api.php",
  ...
}
```

### 2. SPARQL Cache Info

```bash
curl http://localhost:8080/api/sparql/cacheinfo
```

Should return cache statistics:

```json
{
  "size": 0,
  "hitCount": 0,
  "missCount": 0
}
```

## Obtaining OAuth Credentials

To get OAuth consumer key and secret from Wikibase:

1. Log in to your Wikibase instance as an admin
2. Navigate to `Special:OAuthConsumerRegistration`
3. Click "Propose a new consumer"
4. Fill in the form:
   - **Application name**: PhiloBiblon UI
   - **OAuth callback URL**: `http://localhost:3000/login` (for dev)
   - **Grants**: Check "Edit existing pages" and "Create, edit, and move pages"
5. Submit and note the **Consumer token** (key) and **Consumer secret**

## Common Commands

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run` | Start development server |
| `./mvnw clean package` | Build JAR file |
| `./mvnw test` | Run tests |
| `./mvnw clean` | Clean build artifacts |

## Troubleshooting

### Port Already in Use

Change the port in `application.properties`:

```properties
server.port=8081
```

Or via environment variable:

```bash
SERVER_PORT=8081 ./mvnw spring-boot:run
```

### OAuth Errors

**"Could not resolve placeholder 'OAUTH_CONSUMER_KEY'"**

Ensure all environment variables are set before starting the application.

**"Session expired" errors**

The backend uses a `TimedMap` to store tokens. They expire after 60 minutes. Users need to log in again.

### CORS Issues

If the frontend can't connect:

1. Verify `ALLOWED_ORIGINS` includes the frontend URL
2. Check browser console for CORS errors
3. Ensure the backend is running and accessible

### Connection to Wikibase Failed

Verify:
1. `WIKIBASE_API_URL` is correct and accessible
2. Network connectivity to Wikibase
3. OAuth credentials are valid

Check logs:

```bash
./mvnw spring-boot:run | grep ERROR
```

## Development Workflow

1. **Make changes** to Java files
2. **Stop** the running application (Ctrl+C)
3. **Restart**: `./mvnw spring-boot:run`
4. **Test** your changes

For faster development, use Spring Boot DevTools (already included in `pom.xml`):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

This enables automatic restart on file changes.

## Next Steps

- [Architecture](architecture.md) - Understand the Spring Boot structure
- [Security](security.md) - Learn about OAuth and proxying
- [Caching](caching.md) - Understand SPARQL caching
