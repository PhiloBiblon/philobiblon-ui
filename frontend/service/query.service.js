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
        ?item wdt:P297 wd:${form.city.value.item} .\n
        `
    }
    if (form.institution && form.institution.value) {
      filters +=
        `
        VALUES ?item {  wd:${form.institution.value.item}  } .\n
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
        ?item wdt:P2 wd:${form.institution_type.value.item} .\n
        `
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
