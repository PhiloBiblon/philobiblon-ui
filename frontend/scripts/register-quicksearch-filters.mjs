#!/usr/bin/env node
// Registers/refreshes every QuickSearch filter with the backend's internal-only
// /api/search/quick/register endpoint. Run once per deploy as a one-shot docker-compose service
// (see docker-compose.yml's quicksearch-registrar service) — never exposed externally, and never
// run by end-user browsers. Always exits 0: a failed registration just means that filter isn't
// queryable until the next deploy retries it, not a deploy failure.
//
// Filters come from two sources:
// - ../service/quickSearchFilters.js: filters that aren't tied to a single table (e.g. 'global').
// - Each pages/search/<table>/query.vue: the `simple_search` field's `autocomplete.query` is
//   auto-converted to a quickSearch template by replacing frontend placeholders ({{langFilter}},
//   {{database}}, etc.) with their quickSearch equivalents (using ${lang} as the per-language
//   token). discoverPageFilters() below extracts those by parsing the <script setup> block and
//   executing it with Nuxt-only composables (currently just useI18n) stubbed out, since this
//   script runs as plain Node with no Nuxt/Vue runtime available.
import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { quickSearchFilters } from '../service/quickSearchFilters.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080'
const MAX_ATTEMPTS = 10
const RETRY_DELAY_MS = 10000

const SEARCH_PAGES_DIR = fileURLToPath(new URL('../pages/search/', import.meta.url))

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function discoverPageFilters () {
  const filters = []
  for (const table of readdirSync(SEARCH_PAGES_DIR)) {
    const queryFile = path.join(SEARCH_PAGES_DIR, table, 'query.vue')
    if (!existsSync(queryFile)) {
      continue
    }
    for (const filter of await extractQuickSearchFilters(queryFile)) {
      filters.push(filter)
    }
  }
  return filters
}

// Converts the frontend SPARQL placeholder syntax used in autocomplete.query into a
// quickSearch queryTemplate: replaces {{placeholders}} with ${lang}-based equivalents,
// adds ?pbid to SELECT, and removes group-specific filters (index covers all groups).
function toQuickSearchTemplate (query, table) {
  return query
    .replace(/SELECT DISTINCT \?item\b/, 'SELECT DISTINCT ?item ?pbid')
    .replace(/\{\{database\}\} \{\{table\}\}/g, `(.*) ${table}`)
    .replace(/\{\{database\}\}/g, '(.*)')
    .replace(/\{\{table\}\}/g, table)
    .replace(/\{\{langFilter\}\}/g, "FILTER langMatches(lang(?labelObj), '${lang}') . BIND(STR(?labelObj) AS ?label) .")
    .replace(/\{\{langFilterWithoutBind\}\}/g, "FILTER langMatches(lang(?labelObj), '${lang}') .")
    .replace(/\{\{descLangFilter\}\}/g, "OPTIONAL { ?item schema:description ?desc FILTER langMatches(lang(?desc), '${lang}') } .")
    .replace(/\{\{analyticItemDescLangFilter\}\}/g, "OPTIONAL { ?analytic_item schema:description ?desc FILTER langMatches(lang(?desc), '${lang}') } .")
    .replace(/\{\{bitagapGroupFilter\}\}/g, '')
    .replace(/\{\{bitagapGroupSubjectFilter\}\}/g, '')
}

async function extractQuickSearchFilters (queryFile) {
  const { descriptor } = parseSFC(readFileSync(queryFile, 'utf-8'))
  if (!descriptor.scriptSetup) {
    return []
  }
  // useI18n() requires an active Vue app context; stub it since only the literal SPARQL strings
  // inside `form` matter here, not translated labels.
  const script = descriptor.scriptSetup.content
    .replace("import { useI18n } from 'vue-i18n'", 'const useI18n = () => ({ t: (key) => key })')
  const tmpFile = path.join(tmpdir(), `quicksearch-discover-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`)
  writeFileSync(tmpFile, `${script}\nexport { form }`)
  try {
    const { form } = await import(pathToFileURL(tmpFile).href)
    const table = path.basename(path.dirname(queryFile))
    const filters = []
    for (const [fieldName, field] of Object.entries(form.input)) {
      if (fieldName === 'simple_search' && field.autocomplete?.query) {
        filters.push({
          filterId: `${table}_simple_search`,
          queryTemplate: toQuickSearchTemplate(field.autocomplete.query, table)
        })
      }
    }
    return filters
  } finally {
    rmSync(tmpFile)
  }
}

async function registerFilter (filterId, queryTemplate) {
  const body = new URLSearchParams({ filterId, queryTemplate })
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search/quick/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      if (response.ok) {
        const result = await response.json()
        console.log(`Registered QuickSearch filter '${filterId}': ${result.result}`)
        return
      }
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} for filter '${filterId}' failed with status ${response.status}`)
    } catch (error) {
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} for filter '${filterId}' failed: ${error.message}`)
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS)
    }
  }
  console.warn(`WARN: giving up registering QuickSearch filter '${filterId}' after ${MAX_ATTEMPTS} attempts`)
}

const filters = [...quickSearchFilters, ...await discoverPageFilters()]
for (const { filterId, queryTemplate } of filters) {
  await registerFilter(filterId, queryTemplate)
}

console.log(`QuickSearch filter registration finished (${filters.length} filter(s))`)
