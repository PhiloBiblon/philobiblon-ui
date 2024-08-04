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

  generateLangFilter (lang) {
    return `OPTIONAL { ?item rdfs:label ?label FILTER langMatches(lang(?label), '${lang}') }.`
  }

  generateLangFilters (lang) {
    let langFilters = this.generateLangFilter(lang)
    if (lang !== 'es') {
      langFilters += '\n' + this.generateLangFilter('es')
    }
    // fallback to en if selected lang has no label
    return langFilters
  }

  generateFilterByWord (filterField, filterValue) {
    return `contains(replace(replace(replace(replace(replace(lcase(?${filterField}), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i'), '${filterValue}')`
  }

  generateFilterByWords (form, filterField, filterValues) {
    let wordsFilter = null
    for (const filterValue of filterValues) {
      if (wordsFilter) {
        wordsFilter += (form.search_type.value ? ' && ' : ' || ')
      } else {
        wordsFilter = '('
      }
      wordsFilter += this.generateFilterByWord(filterField, filterValue)
    }
    wordsFilter += ')'
    return wordsFilter
  }

  generateFilterSimpleSearch (form) {
    const filterFields = ['label', 'desc', 'alias']
    const filterValues = this.normalize(form.simple_search.value).split(' ')
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
        OPTIONAL { ?item schema:description ?desc }
        FILTER (${filters})
      `
    return SIMPLE_SEARCH_FILTER
  }

  addInstitutionFilters (form) {
    let filters = ''
    if (form.city && form.city.value) {
      filters +=
        `
        ?item wdt:P297 wd:${form.city.value.item} .\n
        `
    }
    if (form.institution && form.institution.value) {
      if (form.institution.value.property === 'label') {
        filters +=
        `
        FILTER(str(?label) = "${form.institution.value.label}") . \n
        `
      } else {
        filters +=
        `
        ?item wdt:P34 ?value_institution .\n
        FILTER(STR(?value_institution) = "${form.institution.value.label}") . \n
        `
      }
    }
    if (form.subject && form.subject.value) {
      filters +=
        `
        ?item wdt:${form.subject.value.property} wd:${form.subject.value.item} .\n
        `
    }
    if (form.institution_type && form.institution_type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.institution_type.value.item} .\n
        `
    }
    return filters
  }

  addWorkFilters (form) {
    let addAnalyticJoin = false
    let filters = ''
    if (form.type && form.type.value) {
      filters +=
        `
        ?item p:P121 ?type_statement .
        ?type_statement pq:P700 wd:${form.type.value.item} .
        `
    }
    if (form.author && form.author.value) {
      if (!form.author.value.analytic_item) {
        filters +=
          `
          ?item wdt:P21 wd:${form.author.value.item} .
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P34 ?author .
          FILTER (STR(?author) = "${form.author.value.label}")
          `
      }
    }
    if (form.title && form.title.value) {
      if (!form.title.value.analytic_item) {
        filters +=
          `
          ?item wdt:P11 ?title.
          FILTER (STR(?title) = "${form.title.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P11 ?title .
          FILTER (STR(?title) = "${form.title.value.label}")
          `
      }
    }
    if (form.incipit && form.incipit.value) {
      if (!form.incipit.value.analytic_item) {
        filters +=
          `
          ?item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
          FILTER (STR(?incipit) = "${form.incipit.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
          FILTER (STR(?incipit) = "${form.incipit.value.label}")
          `
      }
    }
    if (form.explicit && form.explicit.value) {
      if (!form.explicit.value.analytic_item) {
        filters +=
          `
          ?item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
          FILTER (STR(?explicit) = "${form.explicit.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
          FILTER (STR(?explicit) = "${form.explicit.value.label}")
          `
      }
    }
    if (form.language && form.language.value) {
      if (!form.language.value.analytic_item) {
        filters +=
          `
          ?item wdt:P18 wd:${form.language.value.item} .
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P18 wd:${form.language.value.item} .
          `
      }
    }
    if (form.poetic_form && form.poetic_form.value) {
      if (!form.poetic_form.value.analytic_item) {
        filters +=
          `
          ?statement wdt:P781 ?poetic_form
          FILTER (STR(?poetic_form) = "${form.poetic_form.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P781 ?poetic_form .
          FILTER (STR(?poetic_form) = "${form.poetic_form.value.label}")
          `
      }
    }
    if (form.associated_person && form.associated_person.value) {
      if (!form.associated_person.value.analytic_item) {
        filters +=
          `
          ?item wdt:P703 wd:${form.associated_person.value.item} .
          `
      } else {
        filters +=
          `
          ?analytic_item wdt:P703 wd:${form.associated_person.value.item} .
          `
      }
    }
    if (form.subject && form.subject.value) {
      filters +=
        `
        ?item wdt:P422 wd:${form.subject.value.item} .
        `
    }
    if (form.date_composition.value &&
      (form.date_composition.value.begin || form.date_composition.value.end)) {
      let completeRange = false
      if (form.date_composition.value.begin && form.date_composition.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P137 ?history .
        `
      if (form.date_composition.value.begin) {
        filters +=
          `
          OPTIONAL { ?history pq:P49 ?begin_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date) || ?begin_date >= '${form.date_composition.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        } else {
          filters +=
            `
            FILTER(?begin_date >= '${form.date_composition.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.date_composition.value.end) {
        filters +=
          `
          OPTIONAL { ?history pq:P50 ?end_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date) || ?end_date <= '${form.date_composition.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        } else {
          filters +=
            `
            FILTER(?end_date <= '${form.date_composition.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
    }
    if (addAnalyticJoin) {
      filters +=
        `
        ?analytic_item wdt:P476 ?analytic_item_pbid .
        FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
        ?analytic_item wdt:P590 ?item .
        `
    }
    return filters
  }

  addLibraryFilters (form) {
    let filters = ''
    if (form.city && form.city.value) {
      filters +=
        `
        VALUES ?item { wdt:P111 wd:${form.city.value.item} } .\n
        `
    }
    if (form.library && form.library.value) {
      if (form.library.value.property === 'label') {
        filters +=
          `
          FILTER(str(?label) = '${form.library.value.label}') . \n
          `
      } else {
        filters +=
          `
          ?item wdt:P34 ?value_library .\n
          FILTER(STR(?value_library) = '${form.library.value.label}') . \n
          `
      }
    }
    if (form.subject && form.subject.value) {
      filters +=
        `
        ?item wdt:${form.subject.value.property} wd:${form.subject.value.item} .\n
        `
    }
    return filters
  }

  addPersonFilters (form) {
    let filters = ''
    if (form.name && form.name.value) {
      if (form.name.value.property === 'label') {
        filters +=
          `
          FILTER(str(?label) = "${form.name.value.label}") . \n
          `
      } else {
        filters +=
          `
          ?item wdt:P34 ?value_name .\n
          FILTER(STR(?value_name) = "${form.name.value.label}") . \n
          `
      }
    }
    if (form.title && form.title.value) {
      filters +=
        `
        ?item wdt:P171 wd:${form.title.value.item} .\n
        `
    }
    if (form.date.value &&
      (form.date.value.begin || form.date.value.end)) {
      let completeRange = false
      if (form.date.value.begin && form.date.value.end) {
        completeRange = true
      }
      filters +=
        `
        ?item p:P137 ?history .
        `
      if (form.date.value.begin) {
        filters +=
          `
          OPTIONAL { ?history pq:P49 ?begin_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?begin_date) || ?begin_date >= '${form.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        } else {
          filters +=
            `
            FILTER(?begin_date >= '${form.date.value.begin}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
      if (form.date.value.end) {
        filters +=
          `
          OPTIONAL { ?history pq:P50 ?end_date }
          `
        if (completeRange) {
          filters +=
            `
            FILTER(!BOUND(?end_date) || ?end_date <= '${form.date.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        } else {
          filters +=
            `
            FILTER(?end_date <= '${form.date.value.end}T00:00:00Z'^^xsd:dateTime)
            `
        }
      }
    }
    if (form.associated_place && form.associated_place.value) {
      if (form.associated_place.value.property === 'P47') {
        filters +=
          `
          ?item wdt:${form.associated_place.value.property} wd:${form.associated_place.value.item} .\n
          `
      } else {
        filters +=
          `
          ?item p:${form.associated_place.value.property} ?associated_place_prop .\n
          ?associated_place_prop pq:P47 wd:${form.associated_place.value.item} .\n
          `
      }
    }
    if (form.religion && form.religion.value) {
      filters +=
        `
        ?item wdt:P172 wd:${form.religion.value.item} .\n
        `
    }
    if (form.religious_order && form.religious_order.value) {
      filters +=
        `
        ?item wdt:P746 wd:${form.religious_order.value.item} .\n
        `
    }
    if (form.profession && form.profession.value) {
      filters +=
        `
        ?item wdt:P165 wd:${form.profession.value.item} .\n
        `
    }
    if (form.subject && form.subject.value) {
      filters +=
        `
        ?item wdt:${form.subject.value.property} wd:${form.subject.value.item} .\n
        `
    }
    return filters
  }

  addLibraryFilters (form) {
    let filters = ''
    if (form.city && form.city.value) {
      filters +=
      `
      ?item wdt:P111 ?value_city .\n
      FILTER(STR(?value_city) = "${form.city.value.label}") . \n
      `
    }
    if (form.library && form.library.value) {
      if (form.library.value.property === 'label') {
        filters +=
        `
        FILTER(str(?label) = "${form.library.value.label}") . \n
        `
      } else {
        filters +=
        `
        ?item wdt:P34 ?value_library .\n
        FILTER(STR(?value_library) = "${form.library.value.label}") . \n
        `
      }
    }
    if (form.call_number && form.call_number.value) {
      filters +=
      `
      ?item wdt:P10 ?value_call_number .\n
      FILTER(STR(?value_call_number) = "${form.call_number.value.label}") . \n
      `
    }
    if (form.subject && form.subject.value) {
      filters +=
        `
        ?item wdt:${form.subject.value.property} wd:${form.subject.value.item} .\n
        `
    }
    return filters
  }

  generateQuery (table, baseQueryFunction, form) {
    let filters = ''
    const group = form.group.value === 'ALL' ? '(.*)' : form.group.value
    filters = `FILTER regex(?pbid, '${group} ${table} ') .\n`
    if (form.simple_search && form.simple_search.value) {
      filters += this.generateFilterSimpleSearch(form)
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
    }
    return this.addPrefixes(baseQueryFunction({ filters }))
  }

  countQuery (table, form, lang) {
    const COUNT_QUERY = $ =>
      `SELECT (COUNT(DISTINCT ?item) AS ?count)
      WHERE { 
        ?item wdt:P476 ?pbid .
        ${this.generateLangFilters(lang)}
        ${$.filters}
      }`
    return this.generateQuery(table, COUNT_QUERY, form)
  }

  getSortClause () {
    const sortBy = this.$store.state.queryStatus.sortBy === 'id' ? 'xsd:integer(?pbidn)' : 'xsd:string(?label)'
    return this.$store.state.queryStatus.isSortDescending ? `DESC(${sortBy})` : sortBy
  }

  itemsQuery (table, form, lang, resultsPerPage) {
    const SEARCH_QUERY = $ =>
      `SELECT DISTINCT ?item ?label ?pbid
      WHERE { 
        ?item wdt:P476 ?pbid .
        ${this.generateLangFilters(lang)}
        ${$.filters}
        BIND(REPLACE(?pbid, '(.*) ${table} (.*)', '$2') AS ?pbidn)
      }
      ORDER BY ${this.getSortClause()}
      OFFSET ${(this.$store.state.queryStatus.currentPage - 1) * resultsPerPage}
      LIMIT ${resultsPerPage}`
    return this.generateQuery(table, SEARCH_QUERY, form)
  }

  fillTemplate (template, replacements) {
    return template.replace(/{{(\w+)}}/g, (match, p1) => replacements[p1] || '')
  }

  filterQuery (query, table, lang) {
    const replacements = {
      table,
      langFilter: this.generateLangFilters(lang)
    }
    return this.addPrefixes(this.fillTemplate(query, replacements))
  }

  entityFromPBIDQuery (pbid) {
    return this.addPrefixes(`SELECT ?item WHERE { ?item wdt:P476 '${pbid}'. }`)
  }
}
