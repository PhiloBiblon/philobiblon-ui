/**
 * Pure SPARQL template functions, free of any Nuxt/Pinia dependency so they can be
 * imported both by the app (via QueryService, which injects the configured prefix)
 * and by Node tooling (scripts/seed-cache) that must generate byte-identical queries
 * to the ones the frontend sends — the backend cache is keyed by the exact query text.
 */

const BITAGAP_DB = 'BITAGAP'
const CARTAS_TEXT = '[Cartas de]'
const BITAGAP_GROUP_CARTAS = 'CARTAS'
const BITAGAP_GROUP_ORIGINAL = 'ORIG'

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

export function generateDescLangFilter (itemName) {
  // The desc rides the label row's language; when ?lang is unbound the filter
  // errors out and the desc simply stays unbound.
  return `OPTIONAL { ?${itemName} schema:description ?desc FILTER (lang(?desc) = ?lang) }.`
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

function bitagapGroupFilter (bitagapGroup, labelVar) {
  if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
    return `
          FILTER(!CONTAINS(STR(?${labelVar}), "${CARTAS_TEXT}"))
          `
  } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
    return `
          FILTER(CONTAINS(STR(?${labelVar}), "${CARTAS_TEXT}"))
          `
  }
  return ''
}

function generateBitagapGroupSubjectTopicFilters (bitagapGroup) {
  if (!bitagapGroup || bitagapGroup === 'ALL') { return '' }
  return `
        ?item wdt:P243 ?related_topic_item .
        ?related_topic_item wdt:P476 ?related_topic_item_pbid .
        FILTER regex(?related_topic_item_pbid, '${BITAGAP_DB} subid ') .
        ?related_topic_item rdfs:label ?related_topic_item_label .
        ${bitagapGroupFilter(bitagapGroup, 'related_topic_item_label')}
        `
}

export function generateBitagapGroupInstitutionFilters (bitagapGroup) {
  if (!bitagapGroup || bitagapGroup === 'ALL') { return '' }
  return `
        ?related_work_item wdt:P476 ?related_work_item_pbid .
        FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
        ?related_work_item wdt:P243 ?topic_item .
        ?topic_item rdfs:label ?topic_item_label .
        ?related_work_item wdt:P243 ?item .
        ${bitagapGroupFilter(bitagapGroup, 'topic_item_label')}
        `
}

export function generateBitagapGroupWorkFilters (bitagapGroup) {
  if (!bitagapGroup || bitagapGroup === 'ALL') { return '' }
  return `
        ?item wdt:P243 ?subjectItem .
        ?subjectItem rdfs:label ?labelSubjectItem .
        ${bitagapGroupFilter(bitagapGroup, 'labelSubjectItem')}
        `
}

export function generateBitagapGroupPersonFilters (bitagapGroup) {
  if (!bitagapGroup || bitagapGroup === 'ALL') { return '' }
  return `
        ?related_work_item wdt:P476 ?related_work_item_pbid .
        FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
        ?related_work_item wdt:P243 ?topic_item .
        ?topic_item rdfs:label ?topic_item_label .
        ?related_work_item wdt:P703 ?item .
        ${bitagapGroupFilter(bitagapGroup, 'topic_item_label')}
        `
}

export function generateBitagapGroupReferenceFilters (bitagapGroup) {
  return generateBitagapGroupSubjectTopicFilters(bitagapGroup)
}

export function generateBitagapGroupGeographyFilters (bitagapGroup) {
  return generateBitagapGroupSubjectTopicFilters(bitagapGroup)
}

export function generateBitagapGroupSubjectFilters (bitagapGroup) {
  if (!bitagapGroup || bitagapGroup === 'ALL') { return '' }
  return bitagapGroupFilter(bitagapGroup, 'label')
}

export function generateBitagapGroupManuscriptFilters (bitagapGroup) {
  return generateBitagapGroupSubjectTopicFilters(bitagapGroup)
}

export function generateBitagapGroupCnumFilters (bitagapGroup) {
  return generateBitagapGroupSubjectTopicFilters(bitagapGroup)
}

export function generateBitagapGroupFiltersForSubject (bitagapGroup) {
  if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
    return `
          FILTER(!CONTAINS(?label, "${CARTAS_TEXT}"))
        `
  } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
    return `
          FILTER(CONTAINS(?label, "${CARTAS_TEXT}"))
        `
  }
  return ''
}

export function generateBitagapGroupFilters (database, bitagapGroup, table) {
  if (database === BITAGAP_DB) {
    switch (table) {
      case 'insid':
        return generateBitagapGroupInstitutionFilters(bitagapGroup)
      case 'texid':
        return generateBitagapGroupWorkFilters(bitagapGroup)
      case 'libid':
        return ''
      case 'bioid':
        return generateBitagapGroupPersonFilters(bitagapGroup)
      case 'bibid':
        return generateBitagapGroupReferenceFilters(bitagapGroup)
      case 'geoid':
        return generateBitagapGroupGeographyFilters(bitagapGroup)
      case 'subid':
        return generateBitagapGroupSubjectFilters(bitagapGroup)
      case 'manid':
        return generateBitagapGroupManuscriptFilters(bitagapGroup)
      case 'cnum':
        return generateBitagapGroupCnumFilters(bitagapGroup)
    }
  }
  return ''
}

export function filterQuery (query, database, bitagapGroup, table, sparqlQueryPrefix) {
  if (database === 'ALL') {
    database = '(.*)'
  }
  const replacements = {
    database,
    table,
    langFilter: generateSearchLangFilters(),
    langFilterWithoutBind: generateSearchLangFiltersWithoutBind(),
    itemLangGroupPattern: generateSearchLangGroupPattern('item'),
    targetItemLangGroupPattern: generateSearchLangGroupPattern('target_item'),
    descLangFilter: generateDescLangFilters('item'),
    analyticItemDescLangFilter: generateDescLangFilters('analytic_item'),
    bitagapGroupFilter: generateBitagapGroupFilters(database, bitagapGroup, table),
    bitagapGroupSubjectFilter: generateBitagapGroupFiltersForSubject(bitagapGroup)
  }
  return addPrefixes(fillTemplate(query, replacements), sparqlQueryPrefix)
}

/**
 * Global search over the 8 PhiloBiblon tables, served by the backend cache
 * (POST /api/search v=2 with searchVars label,aliases,pbid,item). Fetches every UI
 * language at once, one result row per (item, pbid, lang); the backend pivots the
 * languages into columns of one cached row per item. The outer OPTIONAL keeps items
 * without any label/alias/desc (their ?lang is unbound; the backend falls back to pbid).
 */
export function globalSearchQuery (sparqlQueryPrefix) {
  const query =
  `
  SELECT ?item ?pbid ?lang (SAMPLE(?label_) AS ?label)
         (GROUP_CONCAT(DISTINCT ?alias; separator=' | ') AS ?aliases)
         (SAMPLE(?desc_) AS ?desc)
  WHERE {
    ?item wdt:P476 ?pbid .
    FILTER (REGEX(?pbid, '(.*) bibid ') || REGEX(?pbid, '(.*) bioid ') || REGEX(?pbid, '(.*) geoid ')
      || REGEX(?pbid, '(.*) insid ') || REGEX(?pbid, '(.*) libid ') || REGEX(?pbid, '(.*) manid ')
      || REGEX(?pbid, '(.*) subid ') || REGEX(?pbid, '(.*) texid ')) .
    OPTIONAL {
      { ?item rdfs:label ?label_ } UNION { ?item skos:altLabel ?alias } UNION { ?item schema:description ?desc_ }
      BIND(lang(COALESCE(?label_, ?alias, ?desc_)) AS ?lang)
      FILTER (?lang IN ('ca', 'es', 'en', 'gl', 'pt'))
    }
  }
  GROUP BY ?item ?pbid ?lang
  `
  return addPrefixes(query, sparqlQueryPrefix)
}

/** searchVars for globalSearchQuery: matches by label, alias, pbid and Q-number, like the old quick search. */
export const GLOBAL_SEARCH_VARS = 'label,aliases,pbid,item'
