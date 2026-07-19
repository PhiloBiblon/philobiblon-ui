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
 *   --tables bioid,geoid   Tables (default: all 8)
 *   --bitagap-groups ALL   BITAGAP subgroups (default: ALL; non-ALL values emit the
 *                          BITAGAP-baked ORIG/CARTAS query texts)
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

function parseArgs (argv) {
  const args = { tables: TABLES, bitagapGroups: ['ALL'], global: true, onlyGlobal: false, out: null }
  for (let i = 2; i < argv.length; i++) {
    const next = () => argv[++i]
    switch (argv[i]) {
      case '--tables': args.tables = next().split(','); break
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
  // One lang-free query covers all UI languages: the backend pivots the projected
  // ?lang into per-language columns and the request's lang param picks one.
  add('global', GLOBAL_SEARCH_VARS, globalSearchQuery(prefix))
}

if (!args.onlyGlobal) {
  for (const table of args.tables) {
    const { default: createForm } = await import(`../../frontend/service/search-forms/${table}.js`)
    const form = createForm()
    for (const [field, def] of Object.entries(form.input)) {
      if (def.type !== 'autocomplete' || !def.autocomplete?.query) {
        continue
      }
      for (const bitagapGroup of args.bitagapGroups) {
        // Queries are database-free (the group travels as a request param); only a
        // BITAGAP subgroup produces a distinct, BITAGAP-baked text.
        // Same hint format as AutocompleteField, so seeded and organic entries match.
        add(`${table}.${field}`, 'label,aliases',
          filterQuery(def.autocomplete.query, bitagapGroup !== 'ALL' ? 'BITAGAP' : 'ALL', bitagapGroup, table, prefix))
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
