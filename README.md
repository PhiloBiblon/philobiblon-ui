# PhiloBiblon UI

New user interface for PhiloBiblon.

Main features:
 - User friendly interface to query Wikibase PhiloBiblon items via SPARQL.
 - Show Wikibase PhiloBiblon items via Wikibase API.
 - User friendly interface to edit Wikibase PhiloBiblon items.
 - OAuth integration with Wikibase.
 - Show Wikibase pages directly as web pages.
 - Deployable via docker-compose.

## Modules

PhiloBiblon UI has two main modules:
  - __frontend__: A VUE application (including Nuxt and Vuetify) using client side rendering.
  - __backend__: A Java application (Spring Boot) with the following features:
    - Authentication with Wikibase via OAuth 1.0.
    - Proxy to wikibase-edit library in frontend in order to edit items in the Wikibase.
    - Improve performance as a cache for SPARQL queries.

<img width="535" height="115" alt="253979975-6f08b49c-ed99-4145-b01f-b9663b93278d drawio" src="https://github.com/user-attachments/assets/4222019f-803f-43df-9aac-a71dffce1823" />


## Build

Steps to build the modules:

1. Set `.env` file which defines the environment variables depending on the platform where we are installing.
```
ln -s .env.template .env
```  
2. Build application.
```
docker compose build
```  


## Run

Start the PhiloBiblon UI:

```
docker compose up -d
```

To build and run with a single command:

```
docker compose up --build -d
```

Stop the PhiloBiblon UI:

```
docker compose stop
```

Remove installation:

```
docker compose down -v
```

## Configuration

The configuration is centralized in the `env file`, where we can find all the environment variables:
- __frontend__
  - FRONTEND_DOMAIN: Public DNS domain.
  - FRONTEND_HTTP_PORT: Public port for frontend.
  - API_BASE_URL: URL for public backend API.
- __backend__
  - WIKIBASE_BASE_URL: Wikibase base url (i.e, without any request URI)
  - WIKIBASE_API_URL: Wikibase API url.
  - WIKIBASE_INDEX_URL: Wikibase index url.
  - WIKIBASE_NICE_URL_BASE: Wikibase nice url (used for OAuth communication)
  - SPARQL_BASE_URL: SPARQL base url (i.e, without any request URI)
  - SPARQL_ENDPOINT: SPARQL endpoint url.
  - SPARQL_QUERY_PREFIX: SPARQL prefix to use in queries.
  - OAUTH_CONSUMER_KEY: OAuth consumer key generated in Wikibase (similar that [we did for QS](https://github.com/PhiloBiblon/philobiblon-to-wikibase/blob/master/philobiblon-sandbox/pbuidev/qs/README.md)).
  - OAUTH_CONSUMER_SECRET: OAuth consumer secret generated in Wikibase.
  - OAUTH_CALLBACK_URL: OAuth callback url.
  - ALLOWED_ORIGINS: Allowed origins to access the backend module (for public instances use directly *).

`backend` variables are exposed to the `frontend` via the backend endpoint: `${API_BASE_URL}/api/config`.
