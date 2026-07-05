#!/usr/bin/env node
/**
 * Generates the list of SPARQL queries the frontend can send to POST /api/search,
 * for seeding the backend DB cache. Imports the real frontend form definitions and
 * template functions so the generated queries are byte-identical to what the app
 * sends — the cache is keyed by the exact query text.
 *
 * Usage:
 *   API_BASE_URL=https://host/path node generate-queries.mjs [options]
 *
 * Options:
 *   --langs ca,es          Languages (default: ca,es,en,gl,pt)
 *   --tables bioid,geoid   Tables (default: all 8)
 *   --groups ALL,BETA      Databases (default: ALL — seed the full cartesian only deliberately)
 *   --bitagap-groups ALL   BITAGAP subgroups (default: ALL)
 *   --only-global          Only the global-search queries
 *   --no-global            Skip the global-search queries
 *   --out queries.json     Output file (default: stdout)
 *
 * The SPARQL prefix is fetched from <API_BASE_URL>/api/config to guarantee parity
 * with the target backend (override with SPARQL_QUERY_PREFIX env if needed).
 */
import { writeFileSync } from 'node:fs'
import { filterQuery, globalSearchQuery, GLOBAL_SEARCH_VARS } from '../../frontend/service/query.templates.js'

const TABLES = ['bibid', 'bioid', 'geoid', 'insid', 'libid', 'manid', 'subid', 'texid']
const LANGS = ['ca', 'es', 'en', 'gl', 'pt']

function parseArgs (argv) {
  const args = { langs: LANGS, tables: TABLES, groups: ['ALL'], bitagapGroups: ['ALL'], global: true, onlyGlobal: false, out: null }
  for (let i = 2; i < argv.length; i++) {
    const next = () => argv[++i]
    switch (argv[i]) {
      case '--langs': args.langs = next().split(','); break
      case '--tables': args.tables = next().split(','); break
      case '--groups': args.groups = next().split(','); break
      case '--bitagap-groups': args.bitagapGroups = next().split(','); break
      case '--only-global': args.onlyGlobal = true; break
      case '--no-global': args.global = false; break
      case '--out': args.out = next(); break
      default: console.error(`Unknown option: ${argv[i]}`); process.exit(1)
    }
  }
  return args
}

async function fetchPrefix () {
  if (process.env.SPARQL_QUERY_PREFIX) {
    return process.env.SPARQL_QUERY_PREFIX
  }
  const base = process.env.API_BASE_URL
  if (!base) {
    console.error('Set API_BASE_URL (its /api/config provides the SPARQL prefix) or SPARQL_QUERY_PREFIX.')
    process.exit(1)
  }
  const url = `${base.replace(/\/$/, '')}/api/config`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Could not fetch ${url}: ${res.status}`)
    process.exit(1)
  }
  return (await res.json()).sparqlQueryPrefix
}

const args = parseArgs(process.argv)
const prefix = await fetchPrefix()

const entries = []
const seen = new Set()

function add (hint, searchVars, sparql) {
  const key = `${searchVars}\n${sparql}`
  if (!seen.has(key)) {
    seen.add(key)
    entries.push({ hint, searchVars, sparql })
  }
}

if (args.global || args.onlyGlobal) {
  for (const lang of args.langs) {
    add(`global.${lang}`, GLOBAL_SEARCH_VARS, globalSearchQuery(lang, prefix))
  }
}

if (!args.onlyGlobal) {
  for (const table of args.tables) {
    const { default: createForm } = await import(`../../frontend/service/search-forms/${table}.js`)
    const form = createForm()
    for (const [field, def] of Object.entries(form.input)) {
      if (def.type !== 'autocomplete' || !def.autocomplete?.query) {
        continue
      }
      for (const lang of args.langs) {
        for (const group of args.groups) {
          for (const bitagapGroup of args.bitagapGroups) {
            // Same hint format as AutocompleteField, so seeded and organic entries match.
            add(`${table}.${field}`, 'label',
              filterQuery(def.autocomplete.query, group, bitagapGroup, table, lang, prefix))
          }
        }
      }
    }
  }
}

const output = JSON.stringify(entries, null, 2)
if (args.out) {
  writeFileSync(args.out, output)
  console.error(`${entries.length} unique queries written to ${args.out}`)
} else {
  console.log(output)
  console.error(`${entries.length} unique queries`)
}
