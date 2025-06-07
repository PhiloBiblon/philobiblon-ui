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

  replaceDiacritics (field) {
    return `replace(replace(replace(replace(replace(lcase(${field}), '[áàâäãåā]', 'a', 'i'), '[éèêëē]', 'e', 'i'), '[íìîïī]', 'i', 'i'), '[óòôöõō]', 'o', 'i'), '[úùûüū]', 'u', 'i')`
  }

  generateFilterByWord (filterField, filterValue) {
    const filterFieldWithoutDiacritics = this.replaceDiacritics(`?${filterField}`)
    return `contains(${filterFieldWithoutDiacritics}, '${filterValue}')`
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
    const filterFields = ['label', 'desc', 'alias']
    const filterValues = this.normalize(form.input.simple_search.value).split(' ')
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
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        ?item wdt:P297 wd:${form.input.city.value.item} .\n
        `
    }
    if (form.input.institution && form.input.institution.value) {
      if (form.input.institution.value.property === 'label') {
        filters +=
        `
        FILTER(str(?label) = "${form.input.institution.value.label}") . \n
        `
      } else {
        filters +=
        `
        ?item wdt:P34 ?value_institution .\n
        FILTER(STR(?value_institution) = "${form.input.institution.value.label}") . \n
        `
      }
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    if (form.input.institution_type && form.input.institution_type.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P2 ?institution_class .
        }
        OPTIONAL {
          ?item p:P2 ?institution_type_stat .
          ?institution_type_stat pq:P319 ?institution_type .
        }
        FILTER (?institution_class = wd:${form.input.institution_type.value.item} || ?institution_type = wd:${form.input.institution_type.value.item})
        `
    }

    return filters
  }

  addWorkFilters (form) {
    let addAnalyticJoin = false
    let filters = ''
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item p:P121 ?type_statement .
        ?type_statement pq:P700 wd:${form.input.type.value.item} .
        `
    }
    if (form.input.author && form.input.author.value) {
      if (!form.input.author.value.analytic_item) {
        filters +=
          `
          ?item wdt:P21 wd:${form.input.author.value.item} .
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P34 ?author .
          FILTER (STR(?author) = "${form.input.author.value.label}")
          `
      }
    }
    if (form.input.title && form.input.title.value) {
      if (!form.input.title.value.analytic_item) {
        filters +=
          `
          ?item wdt:P11 ?title.
          FILTER (STR(?title) = "${form.input.title.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P11 ?title .
          FILTER (STR(?title) = "${form.input.title.value.label}")
          `
      }
    }
    if (form.input.incipit && form.input.incipit.value) {
      if (!form.input.incipit.value.analytic_item) {
        filters +=
          `
          ?item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
          FILTER (STR(?incipit) = "${form.input.incipit.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item p:P543 ?incipit_statement .
          ?incipit_statement pq:P70 ?incipit
          FILTER (STR(?incipit) = "${form.input.incipit.value.label}")
          `
      }
    }
    if (form.input.explicit && form.input.explicit.value) {
      if (!form.input.explicit.value.analytic_item) {
        filters +=
          `
          ?item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
          FILTER (STR(?explicit) = "${form.input.explicit.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item p:P543 ?explicit_statement .
          ?explicit_statement pq:P602 ?explicit
          FILTER (STR(?explicit) = "${form.input.explicit.value.label}")
          `
      }
    }
    if (form.input.language && form.input.language.value) {
      if (!form.input.language.value.analytic_item) {
        filters +=
          `
          ?item wdt:P18 wd:${form.input.language.value.item} .
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P18 wd:${form.input.language.value.item} .
          `
      }
    }
    if (form.input.poetic_form && form.input.poetic_form.value) {
      if (!form.input.poetic_form.value.analytic_item) {
        filters +=
          `
          ?item wdt:P781 ?poetic_form
          FILTER (STR(?poetic_form) = "${form.input.poetic_form.value.label}")
          `
      } else {
        addAnalyticJoin = true
        filters +=
          `
          ?analytic_item wdt:P781 ?poetic_form .
          FILTER (STR(?poetic_form) = "${form.input.poetic_form.value.label}")
          `
      }
    }
    if (form.input.associated_person && form.input.associated_person.value) {
      if (!form.input.associated_person.value.analytic_item) {
        filters +=
          `
          ?item wdt:P703 wd:${form.input.associated_person.value.item} .
          `
      } else {
        filters +=
          `
          ?analytic_item wdt:P703 wd:${form.input.associated_person.value.item} .
          `
      }
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .
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
        ?item p:P137 ?history .
        `
      if (form.input.date_composition.value.begin) {
        filters +=
          `
          OPTIONAL { ?history pq:P49 ?begin_date }
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
          OPTIONAL { ?history pq:P50 ?end_date }
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

  addPersonFilters (form) {
    let filters = ''
    if (form.input.name && form.input.name.value) {
      if (form.input.name.value.property === 'label') {
        filters +=
          `
          FILTER(str(?label) = "${form.input.name.value.label}") . \n
          `
      } else {
        filters +=
          `
          ?item wdt:P34 ?value_name .\n
          FILTER(STR(?value_name) = "${form.input.name.value.label}") . \n
          `
      }
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        ?item wdt:P171 wd:${form.input.title.value.item} .\n
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
      if (form.input.associated_place.value.property === 'P47') {
        filters +=
          `
          ?item wdt:${form.input.associated_place.value.property} wd:${form.input.associated_place.value.item} .\n
          `
      } else {
        filters +=
          `
          ?item p:${form.input.associated_place.value.property} ?associated_place_prop .\n
          ?associated_place_prop pq:P47 wd:${form.input.associated_place.value.item} .\n
          `
      }
    }
    if (form.input.religion && form.input.religion.value) {
      filters +=
        `
        ?item wdt:P172 wd:${form.input.religion.value.item} .\n
        `
    }
    if (form.input.religious_order && form.input.religious_order.value) {
      filters +=
        `
        ?item wdt:P746 wd:${form.input.religious_order.value.item} .\n
        `
    }
    if (form.input.profession && form.input.profession.value) {
      filters +=
        `
        ?item wdt:P165 wd:${form.input.profession.value.item} .\n
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    return filters
  }

  addLibraryFilters (form) {
    let filters = ''
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P47 ?item_lib_loc
        }
        OPTIONAL {
          ?item wdt:P243 ?item_topic_loc .
          ?item_topic_loc wdt:P476 ?geo_pbid .
          FILTER regex(?geo_pbid, '(.*) geoid ') .
        }
        FILTER(?item_lib_loc = wd:${form.input.city.value.item} || ?item_topic_loc = wd:${form.input.city.value.item})
        `
    }
    if (form.input.library && form.input.library.value) {
      if (form.input.library.value.property === 'label') {
        filters +=
        `
        FILTER(str(?label) = "${form.input.library.value.label}") . \n
        `
      } else {
        filters +=
        `
        ?item wdt:P34 ?value_library .\n
        FILTER(STR(?value_library) = "${form.input.library.value.label}") . \n
        `
      }
    }
    if (form.input.call_number && form.input.call_number.value) {
      filters +=
      `
      ?item wdt:P10 ?value_call_number .\n
      FILTER(STR(?value_call_number) = "${form.input.call_number.value.label}") . \n
      `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    return filters
  }

  addReferenceFilters (form) {
    let filters = ''
    if (form.input.author && form.input.author.value) {
      filters +=
        `
        ?item wdt:${form.input.author.value.property} ?value_author .\n
        FILTER(STR(?value_author) = "${form.input.author.value.label}") . \n
        `
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        ?item wdt:P11 ?value_title .\n
        FILTER(str(?value_title) = "${form.input.title.value.label}") . \n
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
          OPTIONAL { ?item pq:P49 ?begin_date }
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
          OPTIONAL { ?item pq:P50 ?end_date }
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
        if (completeRange) {
          filters +=
            `
            FILTER(BOUND(?begin_date) || BOUND(?end_date))
            `
        }
      }
    }
    if (form.input.volume && form.input.volume.value) {
      filters +=
        `
        ?item wdt:P1137 ?value_volume .\n
        FILTER(str(?value_volume) = "${form.input.volume.value.label}") . \n
        `
    }
    if (form.input.place_publication && form.input.place_publication.value) {
      filters +=
        `
        ?item wdt:P1141 ?value_place_publication .\n
        FILTER(str(?value_place_publication) = "${form.input.place_publication.value.label}") . \n
        `
    }
    if (form.input.publisher && form.input.publisher.value) {
      filters +=
        `
        ?item wdt:P1140 ?value_publisher .\n
        FILTER(str(?value_publisher) = "${form.input.publisher.value.label}") . \n
        `
    }
    if (form.input.series && form.input.series.value) {
      filters +=
        `
        ?item wdt:P1139 ?value_series .\n
        FILTER(str(?value_series) = "${form.input.series.value.label}") . \n
        `
    }
    if (form.input.locations && form.input.locations.value) {
      filters +=
        `
        ?item wdt:P329 wd:${form.input.locations.value.item} .\n
        `
    }
    if (form.input.international_standard_number && form.input.international_standard_number.value) {
      filters +=
        `
        OPTIONAL { ?item wdt:P605 ?value_isn_p605 } .\n
        OPTIONAL { ?item wdt:P606 ?value_isn_p606 } .\n
        OPTIONAL { ?item wdt:P634 ?value_isn_p634 } .\n
        OPTIONAL { ?item wdt:P743 ?value_isn_p743 } .\n
        FILTER(str(?value_isn_p605) = "${form.input.international_standard_number.value.label}"
          || str(?value_isn_p606) = "${form.input.international_standard_number.value.label}"
          || str(?value_isn_p634) = "${form.input.international_standard_number.value.label}"
          || str(?value_isn_p743) = "${form.input.international_standard_number.value.label}") . \n
        `
    }
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.item} .\n
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    return filters
  }

  addGeographyFilters (form) {
    let filters = ''
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.item} .\n
        `
    }
    if (form.input.class && form.input.class.value) {
      filters +=
        `
        ?item p:P2 ?class_statement .
        ?class_statement pq:P700 wd:${form.input.class.value.item} .
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    return filters
  }

  addSubjectFilters (form) {
    let filters = ''
    if (form.input.headings && form.input.headings.value) {
      if (form.input.headings.value.property === 'label') {
        filters +=
          `
          FILTER(str(?label) = "${form.input.headings.value.label}") . \n
          `
      } else {
        filters +=
          `
          ?item wdt:P1031 ?value_heading .\n
          FILTER(STR(?value_heading) = "${form.input.headings.value.label}") . \n
          `
      }
    }
    return filters
  }

  addManuscriptFilters (form) {
    let filters = ''
    if (form.input.city && form.input.city.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P329 ?item_lib .
          ?item_lib wdt:P47 ?item_lib_loc
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P329 ?copid_item_lib .
          ?copid_item_lib wdt:P47 ?copid_item_lib_loc
        }
        FILTER(?item_lib_loc = wd:${form.input.city.value.item} || ?copid_item_lib_loc = wd:${form.input.city.value.item})
        `
    }
    if (form.input.library && form.input.library.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P329 ?item_lib .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P329 ?copid_item_lib .
        }
        FILTER (?item_lib = wd:${form.input.library.value.item} || ?copid_item_lib = wd:${form.input.library.value.item})
        `
    }
    if (form.input.title && form.input.title.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P5 ?item_title .
        }
        OPTIONAL {
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item .
          ?cnum_item wdt:P5 ?cnum_item_title .
        }
        FILTER (?item_title = "${form.input.title.value.label}" || ?cnum_item_title = "${form.input.title.value.label}")
        `
    }
    if (form.input.call_number && form.input.call_number.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P10 ?item_p10_label .
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P10 ?copid_item_p10_label .
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item
        }
        OPTIONAL {
          ?item wdt:P30 ?item_p30_label .
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P30 ?copid_item_p30_label .
          ?cnum_item wdt:P476 ?cnum_pbid .
          FILTER regex(?cnum_pbid, '(.*) cnum ') .
          ?cnum_item wdt:P8 ?item
        }
        FILTER (?item_p10_label = "${form.input.call_number.value.label}" || ?copid_item_p10_label = "${form.input.call_number.value.label}"
          || ?item_p30_label = "${form.input.call_number.value.label}" || ?copid_item_p30_label = "${form.input.call_number.value.label}"
        )
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
    if (form.input.place_production && form.input.place_production.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P47 ?item_place .
        }
        OPTIONAL {
          ?item wdt:P241 ?item_place_production .
        }
        FILTER (?item_place = wd:${form.input.place_production.value.item} || ?item_place_production = wd:${form.input.place_production.value.item})
        `
    }
    if (form.input.scribe_printer && form.input.scribe_printer.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P25 ?item_scribe .
        }
        OPTIONAL {
          ?item wdt:P207 ?item_printer .
        }
        FILTER (?item_scribe = wd:${form.input.scribe_printer.value.item} || ?item_printer = wd:${form.input.scribe_printer.value.item})
        `
    }
    if (form.input.publisher_patron && form.input.publisher_patron.value) {
      filters +=
        `
        ?item wdt:P67 wd:${form.input.publisher_patron.value.item}
        `
    }
    if (form.input.previous_owner && form.input.previous_owner.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P229 ?item_prev_owner .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P229 ?copid_item_prev_owner .
        }
        FILTER (?item_prev_owner = wd:${form.input.previous_owner.value.item} || ?copid_item_prev_owner = wd:${form.input.previous_owner.value.item})
        `
    }
    if (form.input.associated_person && form.input.associated_person.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P703 ?item_aso_person .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P703 ?copid_item_aso_person .
        }
        FILTER (?item_aso_person = wd:${form.input.associated_person.value.item} || ?copid_item_aso_person = wd:${form.input.associated_person.value.item})
        `
    }
    if (form.input.type && form.input.type.value) {
      filters +=
        `
        ?item wdt:P2 wd:${form.input.type.value.item}
        `
    }
    if (form.input.writing_surface && form.input.writing_surface.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P480 ?item_writing_surf .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P480 ?copid_item_writing_surf .
        }
        FILTER (?item_writing_surf = wd:${form.input.writing_surface.value.item} || ?copid_item_writing_surf = wd:${form.input.writing_surface.value.item})
        `
    }
    if (form.input.format && form.input.format.value) {
      filters +=
        `
        ?item wdt:P93 wd:${form.input.format.value.item}
        `
    }
    if (form.input.binding && form.input.binding.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P800 ?item_binding .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P800 ?copid_item_binding .
        }
        FILTER (?item_binding = "${form.input.binding.value.label}" || ?copid_item_binding = "${form.input.binding.value.label}")
        `
    }
    if (form.input.collation && form.input.collation.value) {
      filters +=
        `
        ?item wdt:P704 ?item_collation .
        FILTER(str(?item_collation) = "${form.input.collation.value.label}")
        `
    }
    if (form.input.hand && form.input.hand.value) {
      filters +=
        `
        ?item wdt:P747 wd:${form.input.hand.value.item}
        `
    }
    if (form.input.font && form.input.font.value) {
      filters +=
        `
        ?item wdt:P748 wd:${form.input.font.value.item}
        `
    }
    if (form.input.watermark && form.input.watermark.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P749 ?item_watermark .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P749 ?copid_item_watermark .
        }
        FILTER (?item_watermark = wd:${form.input.watermark.value.item} || ?copid_item_watermark = wd:${form.input.watermark.value.item})
        `
    }
    if (form.input.graphic_feature && form.input.graphic_feature.value) {
      filters +=
        `
        OPTIONAL {
          ?item wdt:P801 ?item_graphic_feature .
        }
        OPTIONAL {
          ?copid_item wdt:P476 ?copid_pbid .
          FILTER regex(?copid_pbid, '(.*) copid ') .
          ?copid_item wdt:P839 ?item .
          ?copid_item wdt:P801 ?copid_item_graphic_feature .
        }
        FILTER (?item_graphic_feature = wd:${form.input.graphic_feature.value.item} || ?copid_item_graphic_feature = wd:${form.input.graphic_feature.value.item})
        `
    }
    if (form.input.physical_feature && form.input.physical_feature.value) {
      filters +=
        `
        ?item wdt:P778 wd:${form.input.physical_feature.value.item}
        `
    }
    if (form.input.music && form.input.music.value) {
      filters +=
        `
        ?item wdt:P790 wd:${form.input.music.value.item}
        `
    }
    if (form.input.subject && form.input.subject.value) {
      filters +=
        `
        ?item wdt:P243 wd:${form.input.subject.value.item} .\n
        `
    }
    return filters
  }

  generateQuery (table, baseQueryFunction, form) {
    let filters = ''
    const group = form.input.group.value === 'ALL' ? '(.*)' : form.input.group.value
    filters = `FILTER regex(?pbid, '${group} ${table} ') .\n`
    if (form.input.simple_search && form.input.simple_search.value) {
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
    const sortBy = this.$store.state.queryStatus.sortBy === 'id' ? 'xsd:integer(?pbidn)' : this.replaceDiacritics('xsd:string(?label)')
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

  allItemsQuery (text, lang) {
    const SEARCH_QUERY =
      `
      SELECT DISTINCT ?item ?label ?pbid
      WHERE {
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
