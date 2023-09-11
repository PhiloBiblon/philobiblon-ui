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
  - __frontend__: A VUE application (including nuxt) using client side rendering.
  - __backend__: A Java application (Spring Boot) with two main purposes:
    - Authentication with Wikibase via OAuth 1.0.
    - Proxy to wikibase-edit library in frontend in order to edit items in the Wikibase.

![philobiblon-ui drawio](https://github.com/faulhaber/PhiloBiblon/assets/13070879/6f08b49c-ed99-4145-b01f-b9663b93278d)

## Build

Steps to build the modules:

1. Set `.env` file which defines the environment variables depending on the platform where we are installing (currently, `.env.local` for local development; `.env.pbuidev` for sandbox).
```
ln -s .env.pbuidev .env
```  
2. Build backend container.
```
cd backend
mvn clean install
```  
3. Build frontend container.
```
docker-compose --env-file .env build
```  
4. First time only, get `Let's Encrypt` ssl certificates to enable the `https` protocol.
```
init-letsencrypt.sh
```

The last step already starts all modules for PhiloBiblon UI.

## Run

Start the PhiloBiblon UI:

```
docker-compose --env-file .env up -d
```

Stop the PhiloBiblon UI:

```
docker-compose --env-file .env stop
```

## Configuration

The configuration is centralized in the `env file`, where we can find all the environment variables:
- __frontend__
  - FRONTEND_DOMAIN: Public DNS domain.
  - FRONTEND_HTTP_PORT: Public port for frontend.
  - FRONTEND_HTTPS_PORT: Public port for backend.
  - LETSENCRYPT_USER: Let's Encrypt user mail.
  - API_BASE_URL: URL for public backend API.
- __backend__
  - WIKIBASE_BASE_URL: Wikibase base url (i.e, without any request URI)
  - WIKIBASE_API_URL: Wikibase API url.
  - WIKIBASE_INDEX_URL: Wikibase index url.
  - WIKIBASE_NICE_URL_BASE: Wikibase nice url (used for OAuth communication)
  - SPARQL_BASE_URL: SPARQL base url (i.e, without any request URI)
  - SPARQL_ENDPOINT: SPARQL endpoint url.
  - SPARQL_QUERY_PREFIX: SPARQL prefix to use in queries.
  - OAUTH_CONSUMER_KEY: OAuth consumer key generated in Wikibase (we need to register an OAuth consume:, similar that [we did for QS](https://github.com/PhiloBiblon/philobiblon-to-wikibase/blob/master/philobiblon-sandbox/pbuidev/qs/README.md)).
  - OAUTH_CONSUMER_SECRET: OAuth consumer secret generated in Wikibase.
  - OAUTH_CALLBACK_URL: OAuth callback url.
  - ALLOWED_ORIGINS: Allowed origins to access the backend module (for public instances use directly *).

`backend` variables are exposed to the `frontend` via the backend endpoint: `${API_BASE_URL}/api/config`.
