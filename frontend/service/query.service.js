const BITAGAP_DB = 'BITAGAP'
const CARTAS_TEXT = '[Cartas de]'
const BITAGAP_GROUP_CARTAS = 'CARTAS'
const BITAGAP_GROUP_ORIGINAL = 'ORIG'
export class QueryService {
  constructor (store, config) {
    this.$store = store
    this.$config = config
  }

  // convert values to lowercase without diacritical
  normalize (str) {
    return str
      .split('')
      .map((chr) => {
        chr = chr.toLowerCase()
        if (chr !== 'ñ' && chr !== 'ç') {
          return chr.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
        } else {
          return chr
        }
      })
      .join('')
  }

  addPrefixes (query) {
    if (this.$config.sparqlQueryPrefix) {
      return `${this.$config.sparqlQueryPrefix.replaceAll('\\n', '\n')} ${query}`
    } else {
      return query
    }
  }

  generateSearchLangFiltersWithoutBind (lang) {
    return "FILTER (lang(?labelObj) IN ('ca', 'es', 'en', 'gl', 'pt')) ."
  }

  generateSearchLangFilters (lang) {
    return `
      ${this.generateSearchLangFiltersWithoutBind(lang)}
      BIND(STR(?labelObj) AS ?label) .
      `
  }

  generateSearchLangGroupPattern (itemName, lang) {
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
        ${this.generateSearchLangFilters(lang)}
      }
      ${this.generateDescLangFilters(itemName, lang)}
      `
  }

  generateLangFilter (lang) {
    return `OPTIONAL { ?item rdfs:label ?label FILTER langMatches(lang(?label), '${lang}') }.`
  }

  generateLangFilters (lang) {
    let langFilters = this.generateLangFilter(lang)
    // fallback to en if selected lang has no label
    if (lang !== 'en') {
      langFilters += '\n' + this.generateLangFilter('en')
    }
    return langFilters
  }

  generateDescLangFilter (itemName, lang) {
    return `OPTIONAL { ?${itemName} schema:description ?desc FILTER langMatches(lang(?desc), '${lang}') }.`
  }

  generateDescLangFilters (itemName, lang) {
    let langFilters = this.generateDescLangFilter(itemName, lang)
    // fallback to en if selected lang has no label
    if (lang !== 'en') {
      langFilters += '\n' + this.generateDescLangFilter(itemName, 'en')
    }

    return langFilters
  }

  replaceDiacritics (field) {
    return `replace(replace(replace(replace(replace(lcase(${field}), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i')`
  }

  generateFilterByWord (filterField, filterValue) {
    const filterFieldWithoutDiacritics = this.replaceDiacritics(`?${filterField}`)
    return `contains(${filterFieldWithoutDiacritics}, '${filterValue}')`
  }

  sanitizeSparqlString (input) {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
  }

  generateFilterByWords (form, filterField, filterValues) {
    let wordsFilter = null
    for (const filterValue of filterValues) {
      if (wordsFilter) {
        wordsFilter += (form.input.search_type.value ? ' && ' : ' || ')
      } else {
        wordsFilter = '('
      }
      wordsFilter += this.generateFilterByWord(filterField, filterValue)
    }
    wordsFilter += ')'
    return wordsFilter
  }

  generateFilterSimpleSearch (form) {
    if (form.input.simple_search.value.item) {
      return `FILTER(?item = wd:${form.input.simple_search.value.item})`
    } else {
      // Free text search
      const filterFields = ['label', 'alias']
      const filterValues = this.normalize(form.input.simple_search.value.textString).split(' ')
      let filters = null
      for (const filterField of filterFields) {
        if (filters) {
          filters += ' || ' + this.generateFilterByWords(form, filterField, filterValues)
        } else {
          filters = this.generateFilterByWords(form, filterField, filterValues)
        }
      }
      const SIMPLE_SEARCH_FILTER =
        `
          OPTIONAL { ?item skos:altLabel ?alias }
          FILTER (${filters})
        `
      return SIMPLE_SEARCH_FILTER
    }
  }

  generateBitagapGroupInstitutionFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?related_work_item wdt:P476 ?related_work_item_pbid .
        FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
        ?related_work_item wdt:P243 ?topic_item .
        ?topic_item rdfs:label ?topic_item_label .
        ?related_work_item wdt:P243 ?item .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?topic_item_label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?topic_item_label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupWorkFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?item wdt:P243 ?subjectItem .
        ?subjectItem rdfs:label ?labelSubjectItem .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?labelSubjectItem), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?labelSubjectItem), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupPersonFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?related_work_item wdt:P476 ?related_work_item_pbid .
        FILTER regex(?related_work_item_pbid, '${BITAGAP_DB} texid ') .
        ?related_work_item wdt:P243 ?topic_item .
        ?topic_item rdfs:label ?topic_item_label .
        ?related_work_item wdt:P703 ?item .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?topic_item_label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?topic_item_label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupReferenceFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?item wdt:P243 ?related_topic_item .
        ?related_topic_item wdt:P476 ?related_topic_item_pbid .
        FILTER regex(?related_topic_item_pbid, '${BITAGAP_DB} subid ') .
        ?related_topic_item rdfs:label ?related_topic_item_label .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupGeographyFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?item wdt:P243 ?related_topic_item .
        ?related_topic_item wdt:P476 ?related_topic_item_pbid .
        FILTER regex(?related_topic_item_pbid, '${BITAGAP_DB} subid ') .
        ?related_topic_item rdfs:label ?related_topic_item_label .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupSubjectFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
          FILTER(!CONTAINS(STR(?label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
          FILTER(CONTAINS(STR(?label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupManuscriptFilters (bitagapGroup) {
    let filters = ''
    if (bitagapGroup && bitagapGroup !== 'ALL') {
      filters +=
        `
        ?item wdt:P243 ?related_topic_item .
        ?related_topic_item wdt:P476 ?related_topic_item_pbid .
        FILTER regex(?related_topic_item_pbid, '${BITAGAP_DB} subid ') .
        ?related_topic_item rdfs:label ?related_topic_item_label .
        `
      if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
        filters +=
          `
            FILTER(!CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
        filters +=
          `
            FILTER(CONTAINS(STR(?related_topic_item_label), "${CARTAS_TEXT}"))
          `
      }
    }
    return filters
  }

  generateBitagapGroupFiltersForSubject (bitagapGroup) {
    let filters = ''
    if (bitagapGroup === BITAGAP_GROUP_ORIGINAL) {
      filters +=
        `
          FILTER(!CONTAINS(?label, "${CARTAS_TEXT}"))
        `
    } else if (bitagapGroup === BITAGAP_GROUP_CARTAS) {
      filters +=
        `
          FILTER(CONTAINS(?label, "${CARTAS_TEXT}"))
        `
    }
    return filters
  }

  generateBitagapGroupFilters (database, bitagapGroup, table) {
    if (database === BITAGAP_DB) {
      switch (table) {
        case 'insid':
          return this.generateBitagapGroupInstitutionFilters(bitagapGroup)
        case 'texid':
          return this.generateBitagapGroupWorkFilters(bitagapGroup)
        case 'libid':
          return ''
        case 'bioid':
          return this.generateBitagapGroupPersonFilters(bitagapGroup)
        case 'bibid':
          return this.generateBitagapGroupReferenceFilters(bitagapGroup)
        case 'geoid':
          return this.generateBitagapGroupGeographyFilters(bitagapGroup)
        case 'subid':
          return this.generateBitagapGroupSubjectFilters(bitagapGroup)
        case 'manid':
          return this.generateBitagapGroupManuscriptFilters(bitagapGroup)
      }
    }
    return ''
  }

  addInstitutionFilters (form) {
    let filters = this.generateBitagapGroupInstitutionFilters(form.input.bitagap_group?.value)
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        ?item wdt:P297 wd:${form.input.city.value.target_item} .
        `
    }
    if (form.input.institution && form.input.institution.value) {
      filters +=
        `
        FILTER(?item = wd:${form.input.institution.value.item})
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    if (form.input.institution_type && form.input.institution_type.value) {
      filters +=
        `
        {
          ?item wdt:P2 ?institution_type .
        }
        UNION
        {
          ?item p:P2 ?institution_type_stat .
          ?institution_type_stat pq:P319 ?institution_type .
        }
        FILTER (?institution_type = wd:${form.input.institution_type.value.item})
        `
    }

    return filters
  }

  getAnalyticJoin () {
    return `
      ?analytic_item wdt:P476 ?analytic_item_pbid .
      FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
      ?analytic_item wdt:P590 ?item .
      `
  }

  addWorkFilters (form) {
    let filters = this.generateBitagapGroupWorkFilters(form.input.bitagap_group?.value)
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item p:P121 ?type_statement .
        ?type_statement pq:P700 wd:${form.input.type.value.target_item} .
        `
    }
    if (form.input.author && form.input.author.value) {
      if (!form.input.author.value.analytic_item) {
        filters +=
          `
          ?item wdt:P21 wd:${form.input.author.value.target_item} .
          `
      } else {
        filters +=
          `
          ${this.getAnalyticJoin()}
          ?analytic_item wdt:P34 ?author .
          FILTER (STR(?author) = "${this.sanitizeSparqlString(form.input.author.value.label)}")
          `
      }
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        {
          ?item wdt:P11 ?title.
        }
        UNION
        {
          ${this.getAnalyticJoin()}
          ?analytic_item wdt:P11 ?title .
        }
        FILTER (?title = "${this.sanitizeSparqlString(form.input.title.value.label)}")
        `
    }
    if (form.input.incipit && form.input.incipit.value) {
      filters +=
        `
        {
          ?item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
        }
        UNION
        {
          ${this.getAnalyticJoin()}
          ?analytic_item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
        }
        FILTER (?incipit = "${this.sanitizeSparqlString(form.input.incipit.value.label)}")
        `
    }
    if (form.input.explicit && form.input.explicit.value) {
      filters +=
        `
        {
          ?item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
        }
        UNION
        {
          ${this.getAnalyticJoin()}
          ?analytic_item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
        }
        FILTER (?explicit = "${this.sanitizeSparqlString(form.input.explicit.value.label)}")
        `
    }
    if (form.input.language && form.input.language.value) {
      filters +=
        `
        {
          ?item wdt:P18 wd:${form.input.language.value.target_item} .
        }
        UNION
        {
          ${this.getAnalyticJoin()}
          ?analytic_item wdt:P18 wd:${form.input.language.value.target_item} .
        }
        `
    }
    if (form.input.poetic_form && form.input.poetic_form.value) {
      filters +=
        `
        {
          ?item wdt:P781 ?poetic_form
        }
        UNION
        {
          ${this.getAnalyticJoin()}
          ?analytic_item wdt:P781 ?poetic_form .
        }
        FILTER (?poetic_form = "${this.sanitizeSparqlString(form.input.poetic_form.value.label)}")
        `
    }
    if (form.input.associated_person && form.input.associated_person.value) {
      if (!form.input.associated_person.value.analytic_item) {
        filters +=
          `
          ?item wdt:P703 wd:${form.input.associated_person.value.target_item} .
          `
      } else {
        filters +=
          `
          ${this.getAnalyticJoin()}
          ?analytic_item wdt:P703 wd:${form.input.associated_person.value.target_item} .
          `
      }
    }
    if (form.input.place_composition && form.input.place_composition.value) {
      filters +=
        `
        ?item p:P137 ?history .
        ?history pq:P47 wd:${form.input.place_composition.value.target_item} .
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    if (form.input.date_composition.value &&
      (form.input.date_composition.value.begin || form.input.date_composition.value.end)) {
      let completeRange = false
      if (form.input.date_composition.value.begin && form.input.date_composition.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P412 ?date_of_creation .
        `
      if (form.input.date_composition.value.begin) {
        filters +=
          `
          OPTIONAL { ?item wdt:P412 ?begin_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date) || ?begin_date >= '${form.input.date_composition.value.begin}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?begin_date) || ?begin_date <= '${form.input.date_composition.value.end}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?begin_date >= '${form.input.date_composition.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.input.date_composition.value.end) {
        filters +=
          `
          OPTIONAL { ?date_of_creation pq:P291 ?end_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date) || ?end_date <= '${form.input.date_composition.value.end}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?end_date) || ?end_date >= '${form.input.date_composition.value.begin}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?end_date <= '${form.input.date_composition.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (completeRange) {
        filters +=
        `
        FILTER(BOUND(?begin_date) || BOUND(?end_date))
        `
      }
    }
    return filters
  }

  addPersonFilters (form) {
    let filters = this.generateBitagapGroupPersonFilters(form.input.bitagap_group?.value)
    if (form.input.name && form.input.name.value) {
      filters +=
        `
        FILTER(?item = wd:${form.input.name.value.item}) .
        `
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        VALUES ?prop_title { wdt:P171 wdt:P165 }
        ?item ?prop_title wd:${form.input.title.value.target_item} .
        `
    }
    if (form.input.date.value &&
      (form.input.date.value.begin || form.input.date.value.end)) {
      let completeRange = false
      if (form.input.date.value.begin && form.input.date.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P137 ?history .
        `
      if (form.input.date.value.begin) {
        filters +=
          `
          OPTIONAL { ?history pq:P49 ?begin_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date) || ?begin_date >= '${form.input.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?begin_date) || ?begin_date <= '${form.input.date.value.end}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?begin_date >= '${form.input.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.input.date.value.end) {
        filters +=
          `
          OPTIONAL { ?history pq:P50 ?end_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date) || ?end_date <= '${form.input.date.value.end}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?end_date) || ?end_date >= '${form.input.date.value.begin}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?end_date <= '${form.input.date.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (completeRange) {
        filters +=
        `
        FILTER(BOUND(?begin_date) || BOUND(?end_date))
        `
      }
    }
    if (form.input.associated_place && form.input.associated_place.value) {
      filters +=
        `
        {
          ?item wdt:P47 wd:${form.input.associated_place.value.target_item} .
        }
        UNION
        {
          VALUES ?property { p:P137 p:P165 p:P746 p:P172 }
          ?item ?property ?associated_place_prop .
          ?associated_place_prop pq:P47 wd:${form.input.associated_place.value.target_item} .
        }
        `
    }
    if (form.input.religion && form.input.religion.value) {
      filters +=
        `
        ?item wdt:P172 wd:${form.input.religion.value.target_item} .
        `
    }
    if (form.input.religious_order && form.input.religious_order.value) {
      filters +=
        `
        ?item wdt:P746 wd:${form.input.religious_order.value.target_item} .
        `
    }
    if (form.input.profession && form.input.profession.value) {
      filters +=
        `
        ?item wdt:P165 wd:${form.input.profession.value.target_item} .
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    return filters
  }

  addLibraryFilters (form) {
    let filters = ''
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        {
          ?item wdt:P47 ?item_city
        }
        UNION
        {
          ?item wdt:P243 ?item_city .
          ?item_city wdt:P476 ?geo_pbid .
          FILTER regex(?geo_pbid, '(.*) geoid ') .
        }
        FILTER(?item_city = wd:${form.input.city.value.target_item})
        `
    }
    if (form.input.library && form.input.library.value) {
      filters +=
        `
        FILTER(?item = wd:${form.input.library.value.item})
        `
    }
    if (form.input.call_number && form.input.call_number.value) {
      filters +=
      `
      ?manid_item wdt:P476 ?manid_pbid .
      FILTER regex(?manid_pbid, '(.*) manid ')
      ?manid_item wdt:P329 ?item .
      ?manid_item p:P329 ?library .
      { ?library pq:P10 ?value_call_number }
      UNION
      { ?library pq:P30 ?value_call_number }
      FILTER(?value_call_number = "${this.sanitizeSparqlString(form.input.call_number.value.label)}") . 
      `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    return filters
  }

  addReferenceFilters (form) {
    let filters = this.generateBitagapGroupReferenceFilters(form.input.bitagap_group?.value)
    if (form.input.author && form.input.author.value) {
      filters +=
        `
        VALUES ?prop_author { wdt:P1134 wdt:P1136 }
        ?item ?prop_author ?value_author .
        FILTER(?value_author = "${this.sanitizeSparqlString(form.input.author.value.label)}") . 
        `
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        ?item wdt:P11 ?value_title .
        FILTER(?value_title = "${this.sanitizeSparqlString(form.input.title.value.label)}") . 
        `
    }
    if (form.input.date.value &&
      (form.input.date.value.begin || form.input.date.value.end)) {
      let completeRange = false
      if (form.input.date.value.begin && form.input.date.value.end) {
        completeRange = true
      }
      if (form.input.date.value.begin) {
        filters +=
          `
          OPTIONAL { ?item wdt:P49 ?begin_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date) || ?begin_date >= '${form.input.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?begin_date) || ?begin_date <= '${form.input.date.value.end}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?begin_date >= '${form.input.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
    }
    if (form.input.volume && form.input.volume.value) {
      filters +=
        `
        ?item wdt:P1137 ?value_volume .
        FILTER(?value_volume = "${this.sanitizeSparqlString(form.input.volume.value.label)}") . 
        `
    }
    if (form.input.place_publication && form.input.place_publication.value) {
      filters +=
        `
        ?item wdt:P1141 ?value_place_publication .
        FILTER(?value_place_publication = "${this.sanitizeSparqlString(form.input.place_publication.value.label)}") . 
        `
    }
    if (form.input.publisher && form.input.publisher.value) {
      filters +=
        `
        ?item wdt:P1140 ?value_publisher .
        FILTER(?value_publisher = "${this.sanitizeSparqlString(form.input.publisher.value.label)}") . 
        `
    }
    if (form.input.series && form.input.series.value) {
      filters +=
        `
        ?item wdt:P1139 ?value_series .
        FILTER(?value_series = "${this.sanitizeSparqlString(form.input.series.value.label)}") . 
        `
    }
    if (form.input.locations && form.input.locations.value) {
      filters +=
        `
        ?item wdt:P329 wd:${form.input.locations.value.target_item} .
        `
    }
    if (form.input.international_standard_number && form.input.international_standard_number.value) {
      filters +=
        `
        VALUES ?prop_isn { wdt:P605 wdt:P606 wdt:P743 wdt:P634 }
        ?item ?prop_isn ?value_isn .
        FILTER(?value_isn = "${this.sanitizeSparqlString(form.input.international_standard_number.value.label)}") .
        `
    }
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.target_item} .
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    return filters
  }

  addGeographyFilters (form) {
    let filters = this.generateBitagapGroupGeographyFilters(form.input.bitagap_group?.value)
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.target_item} .
        `
    }
    if (form.input.class && form.input.class.value) {
      filters +=
        `
        ?item wdt:P3 wd:${form.input.class.value.target_item} .
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    return filters
  }

  addSubjectFilters (form) {
    let filters = this.generateBitagapGroupSubjectFilters(form.input.bitagap_group?.value)
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        FILTER(?item = wd:${form.input.subject.value.item})
        `
    }
    return filters
  }

  addManuscriptFilters (form) {
    let filters = this.generateBitagapGroupManuscriptFilters(form.input.bitagap_group?.value)
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        {
          ?item wdt:P329 ?item_lib .
          ?item_lib wdt:P47 ?item_city
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P329 ?copid_item_lib .
          ?copid_item_lib wdt:P47 ?item_city
        }
        FILTER(?item_city = wd:${form.input.city.value.target_item})
        `
    }
    if (form.input.library && form.input.library.value) {
      filters +=
        `
        {
          ?item wdt:P329 ?item_lib .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P329 ?item_lib .
        }
        FILTER (?item_lib = wd:${form.input.library.value.target_item})
        `
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        {
          ?item wdt:P5 ?item_title .
        }
        UNION
        {
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item .
          ?cnum_item wdt:P5 ?item_title .
        }
        FILTER (?item_title = "${this.sanitizeSparqlString(form.input.title.value.label)}")
        `
    }
    if (form.input.call_number && form.input.call_number.value) {
      filters +=
        `
        {
          ?item p:P329 ?library_stmt .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item p:P329 ?library_stmt .
        }
        {
          ?library_stmt pq:P10 ?call_number_label
        }
        UNION
        {
          ?library_stmt pq:P30 ?call_number_label
        }
        ?cnum_item wdt:P476 ?cnum_pbid .
        FILTER regex(?cnum_pbid, '(.*) cnum ') .
        ?cnum_item wdt:P8 ?item .
        FILTER (?call_number_label = "${this.sanitizeSparqlString(form.input.call_number.value.label)}")
        `
    }
    if (form.input.date_of_artifact.value &&
      (form.input.date_of_artifact.value.begin || form.input.date_of_artifact.value.end)) {
      let completeRange = false
      if (form.input.date_of_artifact.value.begin && form.input.date_of_artifact.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P536 ?date_of_artifact .
        `
      if (form.input.date_of_artifact.value.begin) {
        filters +=
          `
          OPTIONAL { ?item wdt:P536 ?begin_date_artifact }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date_artifact) || ?begin_date_artifact >= '${form.input.date_of_artifact.value.begin}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?begin_date_artifact) || ?begin_date_artifact <= '${form.input.date_of_artifact.value.end}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?begin_date_artifact >= '${form.input.date_of_artifact.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.input.date_of_artifact.value.end) {
        filters +=
          `
          OPTIONAL { ?date_of_artifact pq:P291 ?end_date_artifact }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date_artifact) || ?end_date_artifact <= '${form.input.date_of_artifact.value.end}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?end_date_artifact) || ?end_date_artifact >= '${form.input.date_of_artifact.value.begin}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?end_date_artifact <= '${form.input.date_of_artifact.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (completeRange) {
        filters +=
        `
        FILTER(BOUND(?begin_date_artifact) || BOUND(?end_date_artifact))
        `
      }
    }
    if (form.input.date_of_publication.value &&
      (form.input.date_of_publication.value.begin || form.input.date_of_publication.value.end)) {
      let completeRange = false
      if (form.input.date_of_publication.value.begin && form.input.date_of_publication.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P222 ?date_of_publication .
        `
      if (form.input.date_of_publication.value.begin) {
        filters +=
          `
          OPTIONAL { ?item wdt:P222 ?begin_date_publication }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date_publication) || ?begin_date_publication >= '${form.input.date_of_publication.value.begin}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?begin_date_publication) || ?begin_date_publication <= '${form.input.date_of_publication.value.end}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?begin_date_publication >= '${form.input.date_of_publication.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.input.date_of_publication.value.end) {
        filters +=
          `
          OPTIONAL { ?date_of_publication pq:P291 ?end_date_publication }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date_publication) || ?end_date_publication <= '${form.input.date_of_publication.value.end}T00:00:00Z'^^xsd:dateTime)
            FILTER(!BOUND(?end_date_publication) || ?end_date_publication >= '${form.input.date_of_publication.value.begin}T00:00:00Z'^^xsd:dateTime )
            `
        } else {
          filters +=
            `
            FILTER(?end_date_publication <= '${form.input.date_of_publication.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (completeRange) {
        filters +=
        `
        FILTER(BOUND(?begin_date_publication) || BOUND(?end_date_publication))
        `
      }
    }
    if (form.input.place_production && form.input.place_production.value) {
      filters +=
        `
        {
          ?item wdt:P47 ?item_place_production .
        }
        UNION
        {
          ?item wdt:P241 ?item_place_production .
        }
        FILTER (?item_place_production = wd:${form.input.place_production.value.target_item})
        `
    }
    if (form.input.scribe_printer && form.input.scribe_printer.value) {
      filters +=
        `
        {
          ?item wdt:P25 ?item_scribe .
        }
        UNION
        {
          ?item wdt:P207 ?item_scribe .
        }
        FILTER (?item_scribe = wd:${form.input.scribe_printer.value.target_item})
        `
    }
    if (form.input.publisher_patron && form.input.publisher_patron.value) {
      filters +=
        `
        ?item wdt:P67 wd:${form.input.publisher_patron.value.target_item}
        `
    }
    if (form.input.previous_owner && form.input.previous_owner.value) {
      filters +=
        `
        {
          ?item wdt:P229 ?item_prev_owner .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P229 ?item_prev_owner .
        }
        FILTER (?item_prev_owner = wd:${form.input.previous_owner.value.target_item})
        `
    }
    if (form.input.associated_person && form.input.associated_person.value) {
      filters +=
        `
        {
          ?item wdt:P703 ?item_aso_person .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P703 ?item_aso_person .
        }
        FILTER (?item_aso_person = wd:${form.input.associated_person.value.target_item})
        `
    }
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.target_item}
        `
    }
    if (form.input.writing_surface && form.input.writing_surface.value) {
      filters +=
        `
        {
          ?item wdt:P480 ?item_writing_surf .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P480 ?item_writing_surf .
        }
        FILTER (?item_writing_surf = wd:${form.input.writing_surface.value.target_item})
        `
    }
    if (form.input.format && form.input.format.value) {
      filters +=
        `
        ?item wdt:P93 wd:${form.input.format.value.target_item}
        `
    }
    if (form.input.binding && form.input.binding.value) {
      filters +=
        `
        {
          ?item wdt:P800 ?item_binding .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P800 ?item_binding .
        }
        FILTER (?item_binding = "${this.sanitizeSparqlString(form.input.binding.value.label)}")
        `
    }
    if (form.input.collation && form.input.collation.value) {
      filters +=
        `
        ?item wdt:P704 ?item_collation .
        FILTER(?item_collation = "${this.sanitizeSparqlString(form.input.collation.value.label)}")
        `
    }
    if (form.input.hand && form.input.hand.value) {
      filters +=
        `
        ?item wdt:P747 wd:${form.input.hand.value.target_item}
        `
    }
    if (form.input.font && form.input.font.value) {
      filters +=
        `
        ?item wdt:P748 wd:${form.input.font.value.target_item}
        `
    }
    if (form.input.watermark && form.input.watermark.value) {
      filters +=
        `
        {
          ?item wdt:P749 ?item_watermark .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P749 ?item_watermark .
        }
        FILTER (?item_watermark = wd:${form.input.watermark.value.target_item})
        `
    }
    if (form.input.graphic_feature && form.input.graphic_feature.value) {
      filters +=
        `
        {
          ?item wdt:P801 ?item_graphic_feature .
        }
        UNION
        {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P801 ?item_graphic_feature .
        }
        FILTER (?item_graphic_feature = wd:${form.input.graphic_feature.value.target_item})
        `
    }
    if (form.input.physical_feature && form.input.physical_feature.value) {
      filters +=
        `
        ?item wdt:P778 wd:${form.input.physical_feature.value.target_item}
        `
    }
    if (form.input.music && form.input.music.value) {
      filters +=
        `
        ?item wdt:P790 wd:${form.input.music.value.target_item}
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.target_item} .
        `
    }
    return filters
  }

  generateQuery (table, baseQueryFunction, form, lang) {
    let filters = ''
    const group = form.input.group.value === 'ALL' ? '(.*)' : form.input.group.value
    if (form.input.simple_search && form.input.simple_search.value) {
      filters += this.generateFilterSimpleSearch(form)
    }
    if (form.input.q_number.value) {
      filters += `FILTER(?item = wd:${form.input.q_number.value}) .`
    }
    if (form.input.philobiblon_id.value) {
      filters += `FILTER regex(?pbid, '${group} ${table} ${form.input.philobiblon_id.value}') . `
    } else {
      filters += `FILTER regex(?pbid, '${group} ${table} ') .`
    }
    switch (table) {
      case 'insid':
        filters += this.addInstitutionFilters(form)
        break
      case 'texid':
        filters += this.addWorkFilters(form)
        break
      case 'libid':
        filters += this.addLibraryFilters(form)
        break
      case 'bioid':
        filters += this.addPersonFilters(form)
        break
      case 'bibid':
        filters += this.addReferenceFilters(form)
        break
      case 'geoid':
        filters += this.addGeographyFilters(form)
        break
      case 'subid':
        filters += this.addSubjectFilters(form)
        break
      case 'manid':
        filters += this.addManuscriptFilters(form)
        break
    }
    if (filters.includes('STR(?label)')) {
      filters += `?item rdfs:label ?labelObj ${this.generateSearchLangFilters(lang)}`
    }
    return this.addPrefixes(baseQueryFunction({ filters }))
  }

  countQuery (table, form, lang) {
    const COUNT_QUERY = $ =>
      `SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE {
        {
          SELECT ?item {
            ?item wdt:P476 ?pbid .
            ${$.filters}
            ${this.generateLangFilters(lang)}
          }
        }
      }`
    return this.generateQuery(table, COUNT_QUERY, form)
  }

  getSortClause () {
    const sortBy = this.$store.state.queryStatus.sortBy === 'id' ? 'xsd:integer(?pbidn)' : this.replaceDiacritics('xsd:string(?label)')
    return this.$store.state.queryStatus.isSortDescending ? `DESC(${sortBy})` : sortBy
  }

  itemsQuery (table, form, lang, resultsPerPage) {
    const SEARCH_QUERY = $ =>
      `SELECT DISTINCT ?item ?label ?desc ?pbids WHERE {
        {
          SELECT DISTINCT ?item (GROUP_CONCAT(DISTINCT ?pbid; separator=", ") AS ?pbids) {
            ?item wdt:P476 ?pbid .
            ${$.filters}
          }
          GROUP BY ?item
        }
        ${this.generateLangFilters(lang)}
        ${this.generateDescLangFilters('item', lang)}
      }
      ORDER BY ${this.getSortClause()}
      OFFSET ${(this.$store.state.queryStatus.currentPage - 1) * resultsPerPage}
      LIMIT ${resultsPerPage}`
    return this.generateQuery(table, SEARCH_QUERY, form, lang)
  }

  fillTemplate (template, replacements) {
    return template.replace(/{{(\w+)}}/g, (match, p1) => replacements[p1] || '')
  }

  filterQuery (query, database, bitagapGroup, table, lang) {
    if (database === 'ALL') {
      database = '(.*)'
    }
    const replacements = {
      database,
      table,
      langFilter: this.generateSearchLangFilters(lang),
      langFilterWithoutBind: this.generateSearchLangFiltersWithoutBind(lang),
      itemLangGroupPattern: this.generateSearchLangGroupPattern('item', lang),
      targetItemLangGroupPattern: this.generateSearchLangGroupPattern('target_item', lang),
      descLangFilter: this.generateDescLangFilters('item', lang),
      analyticItemDescLangFilter: this.generateDescLangFilters('analytic_item', lang),
      bitagapGroupFilter: this.generateBitagapGroupFilters(database, bitagapGroup, table),
      bitagapGroupSubjectFilter: this.generateBitagapGroupFiltersForSubject(bitagapGroup)
    }
    return this.addPrefixes(this.fillTemplate(query, replacements))
  }

  entityFromPBIDQuery (pbid) {
    return this.addPrefixes(`SELECT ?item WHERE { ?item wdt:P476 '${pbid}'. }`)
  }

  allItemsQuery (text, lang) {
    const SEARCH_QUERY =
      `
      SELECT DISTINCT ?item ?label ?pbid WHERE {
        ?item wdt:P476 ?pbid .
        ${this.generateLangFilters(lang)}
        FILTER (REGEX(?pbid, '(.*) bibid ') || REGEX(?pbid, '(.*) bioid ') || REGEX(?pbid, '(.*) geoid ')
          || REGEX(?pbid, '(.*) insid ') || REGEX(?pbid, '(.*) libid ') || REGEX(?pbid, '(.*) manid ')
          || REGEX(?pbid, '(.*) subid ') || REGEX(?pbid, '(.*) texid ')).
        OPTIONAL { ?item skos:altLabel ?alias }
        OPTIONAL { ?item schema:description ?desc }
        FILTER ((contains(replace(replace(replace(replace(replace(lcase(?label), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i'), '${text}'))
          || (contains(replace(replace(replace(replace(replace(lcase(?desc), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i'), '${text}'))
          || (contains(replace(replace(replace(replace(replace(lcase(?alias), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i'), '${text}')))
      }
      OFFSET 0
      LIMIT 10
      `
    return this.addPrefixes(SEARCH_QUERY)
  }

  getRefTableCondition (pbid, refTable) {
    const commonCondition = `
          ?item wdt:P476 ?item_pbid .
          FILTER regex(?item_pbid, '(.*) ${refTable.refTable} ') .`
    if (refTable.qualifier) {
      return `
          ${commonCondition}
          ?item p:${refTable.property} ?related_prop .
          ?related_prop pq:${refTable.qualifier} wd:${pbid} .
        `
    } else {
      return `
          ${commonCondition}
          ?item wdt:${refTable.property} wd:${pbid} .
        `
    }
  }

  getRefTableConditions (pbid, refTables) {
    let conditions = ''
    for (const refTable of refTables) {
      conditions += `${conditions === '' ? '{' : ' UNION {'}${this.getRefTableCondition(pbid, refTable)}}`
    }
    return conditions
  }

  getRelatedItems (pbid, refTables, currentPage, resultsPerPage) {
    const query =
      `
      SELECT ?item ?item_pbid
      WHERE {
        ${this.getRefTableConditions(pbid, refTables)}
        BIND(REPLACE(?item_pbid, ".* ([0-9]+)$", "$1") AS ?item_number)
        BIND(REPLACE(?item_pbid, " \\\\S+$", "") AS ?item_type)
      }
      ORDER BY ?item_type xsd:integer(?item_number) ?item_pbid
      OFFSET ${(currentPage - 1) * resultsPerPage}
      LIMIT ${resultsPerPage}
      `
    return this.addPrefixes(query)
  }

  getRelatedItemsCount (pbid, refTables) {
    const query =
      `
      SELECT (COUNT(?item) AS ?total)
      WHERE {
        ${this.getRefTableConditions(pbid, refTables)}
        BIND(REPLACE(?item_pbid, ".* ([0-9]+)$", "$1") AS ?item_number)
        BIND(REPLACE(?item_pbid, " \\\\S+$", "") AS ?item_type)
      }
      `
    return this.addPrefixes(query)
  }

  getTableLastItem (database, table) {
    const query =
      `
      SELECT ?item ?item_pbid ?item_number
      WHERE {
        ?item wdt:P476 ?item_pbid .
        FILTER regex(?item_pbid, '${database} ${table} ') .
        BIND(REPLACE(?item_pbid, ".* ([0-9]+)$", "$1") AS ?item_number)
      }
      ORDER BY DESC(xsd:integer(?item_number))
      LIMIT 1
      `
    return this.addPrefixes(query)
  }
}
