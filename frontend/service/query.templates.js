/**
 * Pure SPARQL template functions, free of any Nuxt/Pinia dependency so they can be
 * imported both by the app (via QueryService, which injects the configured prefix)
 * and by Node tooling (scripts/seed-cache) that must generate byte-identical queries
 * to the ones the frontend sends — the backend cache is keyed by the exact query text.
 */

const BITAGAP_DB = 'BITAGAP'
const CARTAS_TEXT = '[Cartas de]'

export function fillTemplate (template, replacements) {
  return template.replace(/{{(\w+)}}/g, (match, p1) => replacements[p1] || '')
}

export function addPrefixes (query, sparqlQueryPrefix) {
  if (sparqlQueryPrefix) {
    return `${sparqlQueryPrefix.replaceAll('\\n', '\n')} ${query}`
  } else {
    return query
  }
}

// Lang-aware queries fetch every UI language at once and project a ?lang var; the
// backend pivots the per-language rows into columns and the request's lang param picks
// which one is searched/displayed (with fallback to en done backend-side).
// Templates bind real labels to ?labelObj and alternative labels to ?aliasObj: only
// ?label is used as the displayed text, while ?aliases only feeds the search text
// (searchVars label,aliases), so an altLabel never becomes an item's visible label.
// The label and alias filters are separate fragments placed inside their own UNION
// branches: a shared expression over COALESCE(?labelObj, ?aliasObj) blocks the
// endpoint's filter pushdown and times out on the big tables.
export function generateSearchLangFiltersWithoutBind () {
  return `FILTER (lang(?labelObj) IN ('ca', 'es', 'en', 'gl', 'pt')) .
      BIND(lang(?labelObj) AS ?lang) .`
}

export function generateSearchLangFilters () {
  return `
      ${generateSearchLangFiltersWithoutBind()}
      BIND(STR(?labelObj) AS ?label) .
      `
}

export function generateAliasLangFiltersWithoutBind () {
  return `FILTER (lang(?aliasObj) IN ('ca', 'es', 'en', 'gl', 'pt')) .
      BIND(lang(?aliasObj) AS ?lang) .`
}

export function generateAliasLangFilters () {
  return `
      ${generateAliasLangFiltersWithoutBind()}
      BIND(STR(?aliasObj) AS ?aliases) .
      `
}

export function generateDescLangFilter (itemName) {
  // Self-contained: binds the desc's own language and joins on (?item, ?lang)
  // compatibility. A correlated FILTER (lang(?desc) = ?lang) referencing the outer
  // ?lang forces a catastrophic left-join plan on the endpoint.
  return `OPTIONAL {
        ?${itemName} schema:description ?descObj .
        FILTER (lang(?descObj) IN ('ca', 'es', 'en', 'gl', 'pt')) .
        BIND(lang(?descObj) AS ?lang) .
        BIND(STR(?descObj) AS ?desc) .
      }`
}

export function generateDescLangFilters (itemName) {
  return generateDescLangFilter(itemName)
}

export function generateSearchLangGroupPattern (itemName) {
  // the sameAs condition is used for redirections (one item is redirected to another one)
  return `
      OPTIONAL {
        {
          ?${itemName} rdfs:label ?labelObj .
        }
        UNION
        {
          ?${itemName} owl:sameAs ?real_target .
          ?real_target rdfs:label ?labelObj .
        }
        ${generateSearchLangFilters()}
      }
      ${generateDescLangFilters(itemName)}
      `
}

// BITAGAP subgroup membership (ORIG/CARTAS): instead of baking a constraining join +
// FILTER into the text when a subgroup is selected, every query computes each source
// record's membership as a reserved ?bg var inside a self-contained OPTIONAL (it
// re-matches the related subject labels it needs, so placement only requires the
// source var to be bound). The backend collects the values into the row's
// bitagap_groups column and the request's bitagapGroup param filters at search time.
function bitagapMembershipBind (labelVar) {
  return `BIND(IF(CONTAINS(STR(?${labelVar}), "${CARTAS_TEXT}"), 'CARTAS', 'ORIG') AS ?bg) .`
}

// The membership is computed inside a DISTINCT subquery so the endpoint materializes
// the (item, bg) table once and hash-joins it, instead of re-running the topic/label
// join per outer solution — the nested-loop form 500s on the bigger tables.
function generateBitagapGroupSubjectTopicFilters () {
  return `
        OPTIONAL {
          {
            SELECT DISTINCT ?item ?bg WHERE {
              ?item wdt:P243 ?related_topic_item .
              ?related_topic_item wdt:P476 ?related_topic_item_pbid .
              FILTER regex(?related_topic_item_pbid, '${BITAGAP_DB} subid ') .
              ?related_topic_item rdfs:label ?related_topic_item_label .
              ${bitagapMembershipBind('related_topic_item_label')}
            }
          }
        }
        `
}

export function generateBitagapGroupInstitutionFilters () {
  return `
        OPTIONAL {
          {
            SELECT DISTINCT ?item ?bg WHERE {
              ?related_work_item wdt:P476 ?related_work_item_pbid .
              FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
              ?related_work_item wdt:P243 ?topic_item .
              ?topic_item rdfs:label ?topic_item_label .
              ?related_work_item wdt:P243 ?item .
              ${bitagapMembershipBind('topic_item_label')}
            }
          }
        }
        `
}

export function generateBitagapGroupWorkFilters () {
  // Unlike the old constraining filter, membership is restricted to BITAGAP subid
  // subjects (like every other table): ORIG/CARTAS only ever means BITAGAP topics,
  // and the unconstrained join over every P243 subject label is prohibitively
  // expensive on the full texid table.
  return generateBitagapGroupSubjectTopicFilters()
}

export function generateBitagapGroupPersonFilters () {
  return `
        OPTIONAL {
          {
            SELECT DISTINCT ?item ?bg WHERE {
              ?related_work_item wdt:P476 ?related_work_item_pbid .
              FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
              ?related_work_item wdt:P243 ?topic_item .
              ?topic_item rdfs:label ?topic_item_label .
              ?related_work_item wdt:P703 ?item .
              ${bitagapMembershipBind('topic_item_label')}
            }
          }
        }
        `
}

export function generateBitagapGroupReferenceFilters () {
  return generateBitagapGroupSubjectTopicFilters()
}

export function generateBitagapGroupGeographyFilters () {
  return generateBitagapGroupSubjectTopicFilters()
}

export function generateBitagapGroupSubjectFilters () {
  // subid rows are subjects themselves: membership from the item's own labels.
  return `
        OPTIONAL {
          ?item rdfs:label ?bg_label .
          ${bitagapMembershipBind('bg_label')}
        }
        `
}

export function generateBitagapGroupManuscriptFilters () {
  return generateBitagapGroupSubjectTopicFilters()
}

export function generateBitagapGroupCnumFilters () {
  return generateBitagapGroupSubjectTopicFilters()
}

export function generateBitagapGroupFiltersForSubject (table) {
  // The subject autocompletes list subject items directly: membership from the
  // target's own labels, computed where ?target_item is bound (inner subquery).
  if (table === 'libid') { return '' }
  return `
        OPTIONAL {
          ?target_item rdfs:label ?bg_label .
          ${bitagapMembershipBind('bg_label')}
        }
        `
}

export function generateBitagapGroupFilters (table) {
  switch (table) {
    case 'insid':
      return generateBitagapGroupInstitutionFilters()
    case 'texid':
      return generateBitagapGroupWorkFilters()
    case 'libid':
      return ''
    case 'bioid':
      return generateBitagapGroupPersonFilters()
    case 'bibid':
      return generateBitagapGroupReferenceFilters()
    case 'geoid':
      return generateBitagapGroupGeographyFilters()
    case 'subid':
      return generateBitagapGroupSubjectFilters()
    case 'manid':
      return generateBitagapGroupManuscriptFilters()
    case 'cnum':
      return generateBitagapGroupCnumFilters()
  }
  return ''
}

export function filterQuery (query, table, sparqlQueryPrefix) {
  // No dimension is baked into the query text any more: every locale, database group
  // and BITAGAP subgroup shares one cache entry per field. Templates match all
  // databases ((.*)) and project the reserved ?lang/?db/?bg vars; the request's
  // lang/group/bitagapGroup params pick what is matched at search time.
  const replacements = {
    database: '(.*)',
    table,
    langFilter: generateSearchLangFilters(),
    langFilterWithoutBind: generateSearchLangFiltersWithoutBind(),
    aliasLangFilter: generateAliasLangFilters(),
    aliasLangFilterWithoutBind: generateAliasLangFiltersWithoutBind(),
    itemLangGroupPattern: generateSearchLangGroupPattern('item'),
    targetItemLangGroupPattern: generateSearchLangGroupPattern('target_item'),
    descLangFilter: generateDescLangFilters('item'),
    analyticItemDescLangFilter: generateDescLangFilters('analytic_item'),
    bitagapGroupFilter: generateBitagapGroupFilters(table),
    bitagapGroupSubjectFilter: generateBitagapGroupFiltersForSubject(table)
  }
  return addPrefixes(fillTemplate(query, replacements), sparqlQueryPrefix)
}

/**
 * Global search over the 8 PhiloBiblon tables, served by the backend cache
 * (POST /api/search v=2 with searchVars label,aliases,pbid,item). Fetches every UI
 * language at once, one result row per (item, pbid) and label/alias/desc value; the
 * backend pivots and merges them into one cached row per item with per-language
 * columns (first label wins, aliases joined, first desc wins), so no server-side
 * aggregation is needed — a GROUP BY over the whole dataset times out on Blazegraph.
 * The outer OPTIONAL keeps items without any label/alias/desc (their ?lang is
 * unbound; the backend falls back to pbid).
 */
export function globalSearchQuery (sparqlQueryPrefix) {
  const query =
  `
  SELECT ?item ?pbid ?lang ?label ?aliases ?desc
  WHERE {
    ?item wdt:P476 ?pbid .
    FILTER (REGEX(?pbid, '(.*) bibid ') || REGEX(?pbid, '(.*) bioid ') || REGEX(?pbid, '(.*) geoid ')
      || REGEX(?pbid, '(.*) insid ') || REGEX(?pbid, '(.*) libid ') || REGEX(?pbid, '(.*) manid ')
      || REGEX(?pbid, '(.*) subid ') || REGEX(?pbid, '(.*) texid ')) .
    OPTIONAL {
      { ?item rdfs:label ?label } UNION { ?item skos:altLabel ?aliases } UNION { ?item schema:description ?desc }
      BIND(lang(COALESCE(?label, ?aliases, ?desc)) AS ?lang)
      FILTER (?lang IN ('ca', 'es', 'en', 'gl', 'pt'))
    }
  }
  `
  return addPrefixes(query, sparqlQueryPrefix)
}

/** searchVars for globalSearchQuery: matches by label, alias, pbid and Q-number, like the old quick search. */
export const GLOBAL_SEARCH_VARS = 'label,aliases,pbid,item'
