export class QueryService {
  constructor (store, config) {
    this.$store = store
    this.$config = config
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
    if (lang !== 'en') {
      langFilters += '\n' + this.generateLangFilter('en')
    }
    // fallback to en if selected lang has no label
    return langFilters
  }

  generateFilterByWord (filterField, filterValue) {
    return `contains(lcase(replace(replace(replace(replace(replace(?${filterField}, '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i')), '${filterValue}')`
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
    const filterFields = ['itemLabel', 'desc', 'ps', 'ps_Label', 'pq', 'pq_Label']
    // convert values to lowercase without diacritical accents
    const filterValues = form.simple_search.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036F]/g, '').split(' ')
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
        ?item ?p ?statement .
        OPTIONAL { ?item rdfs:label ?itemLabel }

        OPTIONAL { ?item schema:description ?desc }
        ?statement ?ps ?ps_ .
        OPTIONAL { ?ps_ rdfs:label ?ps_Label }

        ?wd wikibase:claim ?p .
        ?wd wikibase:statementProperty ?ps .

        OPTIONAL {
          ?statement ?pq ?pq_ .
          ?wdpq wikibase:qualifier ?pq .
          OPTIONAL { ?pq_ rdfs:label ?pq_Label }
        }
        
        FILTER (${filters})
      `
    return SIMPLE_SEARCH_FILTER
  }

  generateQuery (table, baseQueryFunction, form) {
    let filters = ''
    const group = form.group.value === 'ALL' ? '(.*)' : form.group.value
    filters = `FILTER regex(?pbid, '${group} ${table} ') .\n`
    if (form.simple_search && form.simple_search.value) {
      filters += this.generateFilterSimpleSearch(form)
    }
    if (form.city && form.city.value) {
      filters +=
        `
        ?item wdt:P47 wd:${form.city.value} .\n
        `
    }
    if (form.institution && form.institution.value) {
      filters +=
        `
        VALUES ?item {  wd:${form.institution.value}  } .\n
        `
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
        ?item wdt:P2 wd:${form.institution_type.value} .\n
        `
    }
    return this.addPrefixes(baseQueryFunction({ filters }))
  }

  countQuery (table, form) {
    const COUNT_QUERY = $ =>
      `SELECT (COUNT(DISTINCT ?item) AS ?count)
      WHERE { 
        ?item wdt:P476 ?pbid .
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

  citiesQuery (table, lang) {
    return this.addPrefixes(
      `
        SELECT DISTINCT ?item ?label
        WHERE { 
          ?item wdt:P476 ?pbid .
          FILTER regex(?pbid, '(.*) geoid ') .
          ${this.generateLangFilters(lang)}
          ?table wdt:P47 ?item . 
          ?table wdt:P476 ?table_pbid .
          FILTER regex(?table_pbid, '(.*) ${table} ')
        }
        ORDER BY ?label
      `)
  }

  subjectsQuery (table, lang) {
    return this.addPrefixes(
      `
        SELECT * {
        {
          SELECT DISTINCT ?item ?label ?property
          WHERE { 
            ?table wdt:P476 ?table_pbid .
            ?table ?property ?item . 
            ?item wdt:P476 ?subject_pbid .
            ${this.generateLangFilters(lang)}
            FILTER regex(?subject_pbid, '(.*) bioid ')
            FILTER regex(?table_pbid, '(.*) ${table} ')
            BIND ( wdt:P703 as ?property)
          }
        } UNION {
          SELECT DISTINCT ?item ?label ?property
          WHERE { 
            ?table wdt:P476 ?table_pbid .
            ?table ?property ?item . 
            ?item wdt:P476 ?subject_pbid .
            ${this.generateLangFilters(lang)}
            FILTER regex(?subject_pbid, '(.*) subid ')
            FILTER regex(?table_pbid, '(.*) ${table} ')
            BIND ( wdt:P422 as ?property)
          }
        }
      }
      ORDER BY ?label
    `)
  }

  institutionTypesQuery (table, lang) {
    return this.addPrefixes(
      `
        SELECT ?item ?label
        WHERE { 
          ?item wdt:P476 ?pbid .
          ${this.generateLangFilters(lang)}
          FILTER regex(?pbid, 'INSTITUTIONS\\\\*CLASS\\\\*') .
        }
        ORDER BY ?label
      `)
  }

  institutionQuery (table, lang) {
    return this.addPrefixes(
      `
        SELECT DISTINCT ?item ?label
        WHERE { 
          ?item wdt:P476 ?pbid .
          FILTER regex(?pbid, '(.*) insid ') .
          ${this.generateLangFilters(lang)}
        }
        ORDER BY ?label
      `)
  }

  entityFromPBIDQuery (pbid) {
    return this.addPrefixes(`SELECT ?item WHERE { ?item wdt:P476 '${pbid}'. }`)
  }
}
