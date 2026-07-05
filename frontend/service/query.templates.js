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

export function generateSearchLangFiltersWithoutBind () {
  return "FILTER (lang(?labelObj) IN ('ca', 'es', 'en', 'gl', 'pt')) ."
}

export function generateSearchLangFilters (lang) {
  return `
      ${generateSearchLangFiltersWithoutBind(lang)}
      BIND(STR(?labelObj) AS ?label) .
      `
}

export function generateDescLangFilter (itemName, lang) {
  return `OPTIONAL { ?${itemName} schema:description ?desc FILTER langMatches(lang(?desc), '${lang}') }.`
}

export function generateDescLangFilters (itemName, lang) {
  let langFilters = generateDescLangFilter(itemName, lang)
  // fallback to en if selected lang has no label
  if (lang !== 'en') {
    langFilters += '\n' + generateDescLangFilter(itemName, 'en')
  }

  return langFilters
}

export function generateSearchLangGroupPattern (itemName, lang) {
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
        ${generateSearchLangFilters(lang)}
      }
      ${generateDescLangFilters(itemName, lang)}
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
    }
  }
  return ''
}

export function filterQuery (query, database, bitagapGroup, table, lang, sparqlQueryPrefix) {
  if (database === 'ALL') {
    database = '(.*)'
  }
  const replacements = {
    database,
    table,
    langFilter: generateSearchLangFilters(lang),
    langFilterWithoutBind: generateSearchLangFiltersWithoutBind(lang),
    itemLangGroupPattern: generateSearchLangGroupPattern('item', lang),
    targetItemLangGroupPattern: generateSearchLangGroupPattern('target_item', lang),
    descLangFilter: generateDescLangFilters('item', lang),
    analyticItemDescLangFilter: generateDescLangFilters('analytic_item', lang),
    bitagapGroupFilter: generateBitagapGroupFilters(database, bitagapGroup, table),
    bitagapGroupSubjectFilter: generateBitagapGroupFiltersForSubject(bitagapGroup)
  }
  return addPrefixes(fillTemplate(query, replacements), sparqlQueryPrefix)
}

/**
 * Global search over the 8 PhiloBiblon tables, served by the backend cache
 * (POST /api/search v=2 with searchVars label,aliases,pbid,item). Aliases are
 * collapsed per (item, pbid) so each result row maps to one cached row.
 */
export function globalSearchQuery (lang, sparqlQueryPrefix) {
  const query =
  `
  SELECT ?item ?pbid (SAMPLE(?label_) AS ?label)
         (GROUP_CONCAT(DISTINCT ?alias; separator=' | ') AS ?aliases)
         (SAMPLE(?desc_) AS ?desc)
  WHERE {
    ?item wdt:P476 ?pbid .
    FILTER (REGEX(?pbid, '(.*) bibid ') || REGEX(?pbid, '(.*) bioid ') || REGEX(?pbid, '(.*) geoid ')
      || REGEX(?pbid, '(.*) insid ') || REGEX(?pbid, '(.*) libid ') || REGEX(?pbid, '(.*) manid ')
      || REGEX(?pbid, '(.*) subid ') || REGEX(?pbid, '(.*) texid ')) .
    OPTIONAL { ?item rdfs:label ?label_ FILTER langMatches(lang(?label_), '${lang}') }
    OPTIONAL { ?item skos:altLabel ?alias FILTER langMatches(lang(?alias), '${lang}') }
    OPTIONAL { ?item schema:description ?desc_ FILTER langMatches(lang(?desc_), '${lang}') }
  }
  GROUP BY ?item ?pbid
  `
  return addPrefixes(query, sparqlQueryPrefix)
}

/** searchVars for globalSearchQuery: matches by label, alias, pbid and Q-number, like the old quick search. */
export const GLOBAL_SEARCH_VARS = 'label,aliases,pbid,item'
