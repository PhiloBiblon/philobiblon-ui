// Manifest of every QuickSearch filter known to the frontend — the single source of truth for
// which filters exist; the backend never hardcodes one. Read at deploy time (see
// scripts/print-quicksearch-register-commands.mjs) to register/refresh each filter's backend
// index via POST /api/search/quick/register.
//
// Deliberately has zero Nuxt-specific imports (unlike query.service.js) so it can be loaded by a
// plain Node script during CI, without needing Nuxt's build-time alias resolution.
//
// Each queryTemplate keeps the literal "${lang}" placeholder unresolved — the backend substitutes
// it itself once per configured language every time it (re)loads a filter's index. No SPARQL
// prefixes here either: the backend prepends its own configured prefixes for every filter it loads.
export const quickSearchFilters = [
  {
    filterId: 'global',
    queryTemplate: `SELECT ?item ?pbid ?label ?alias ?desc WHERE {
  ?item wdt:P476 ?pbid .
  FILTER (REGEX(?pbid, '(.*) bibid ') || REGEX(?pbid, '(.*) bioid ') || REGEX(?pbid, '(.*) geoid ')
    || REGEX(?pbid, '(.*) insid ') || REGEX(?pbid, '(.*) libid ') || REGEX(?pbid, '(.*) manid ')
    || REGEX(?pbid, '(.*) subid ') || REGEX(?pbid, '(.*) texid ')) .
  OPTIONAL { ?item rdfs:label ?label FILTER langMatches(lang(?label), '\${lang}') }
  OPTIONAL { ?item skos:altLabel ?alias FILTER langMatches(lang(?alias), '\${lang}') }
  OPTIONAL { ?item schema:description ?desc FILTER langMatches(lang(?desc), '\${lang}') }
}`
  }
]
