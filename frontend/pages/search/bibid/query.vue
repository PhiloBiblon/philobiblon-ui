<template>
  <search-base
    table="bibid"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script>
export default {
  data () {
    return {
      breadcrumb_items: [
        {
          text: this.$i18n.t('menu.item.search.label'),
          disabled: true
        },
        {
          text: this.$i18n.t('menu.item.search.item.bibid.label'),
          disabled: true
        }
      ],
      form: {
        section: [
          'primary',
          'advanced'
        ],
        input: {
          group: {
            permanent: true,
            value: 'ALL',
            disabled: false
          },
          bitagap_group: {
            permanent: true,
            value: 'ALL',
            disabled: false
          },
          simple_search: {
            active: true,
            section: 'primary',
            label: 'search.form.common.simple_search.label',
            hint: 'search.form.common.simple_search.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT (?textString AS ?label) ?textString ?item
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER CONTAINS(?pbid, " {{table}} ") .
                {
                  ?item rdfs:label ?textString .
                }
                UNION
                {
                  ?item skos:altLabel ?textString .
                }
              }
              ORDER BY LCASE(?textString)
              `,
              allowFreeText: true
            }
          },
          author: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.author.label',
            hint: 'search.form.bibid.author.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?property {
                {
                      SELECT DISTINCT ?label ?property
                      WHERE { 
                        ?item wdt:P476 ?pbid .
                        BIND ( wdt:P1134 as ?property)
                        ?item ?property ?label .
                        FILTER regex(?pbid, '(.*) {{table}} ')
                      }
                } UNION {
                      SELECT DISTINCT ?label ?property
                      WHERE { 
                        ?item wdt:P476 ?pbid .
                        BIND ( wdt:P1136 as ?property)
                        ?item ?property ?label . 
                        FILTER regex(?pbid, '(.*) {{table}} ')
                      }
                }
              }
              ORDER BY ?label
              `
            }
          },
          title: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.title.label',
            hint: 'search.form.bibid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) {{table}} ') .
                ?item wdt:P11 ?label .
              }
              ORDER BY ?label
              `
            }
          },
          date: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.date.label',
            hint: 'search.form.bibid.date.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          volume: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.volume.label',
            hint: 'search.form.bibid.volume.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) {{table}} ') .
                ?item wdt:P1137 ?label .
              }
              ORDER BY ?label
              `
            }
          },
          place_publication: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.place_publication.label',
            hint: 'search.form.bibid.place_publication.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) {{table}} ') .
                ?item wdt:P1141 ?label .
              }
              ORDER BY ?label
              `
            }
          },
          publisher: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.publisher.label',
            hint: 'search.form.bibid.publisher.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) {{table}} ') .
                ?item wdt:P1140 ?label .
              }
              ORDER BY ?label
              `
            }
          },
          series: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.series.label',
            hint: 'search.form.bibid.series.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) {{table}} ') .
                ?item wdt:P1139 ?label .
              }
              ORDER BY ?label
              `
            }
          },
          locations: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.locations.label',
            hint: 'search.form.bibid.locations.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P329 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
              `
            }
          },
          international_standard_number: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.international_standard_number.label',
            hint: 'search.form.bibid.international_standard_number.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label {
                {
                  SELECT DISTINCT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P605 ?label .
                  }
                } UNION {
                  SELECT DISTINCT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P606 ?label .
                  }
                } UNION {
                  SELECT DISTINCT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P743 ?label .
                  }
                } UNION {
                  SELECT DISTINCT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P634 ?label .
                  }
                }
              }
              ORDER BY ?label
              `
            }
          },
          type: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.type.label',
            hint: 'search.form.bibid.type.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P2 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
              `
            }
          },
          subject: {
            active: true,
            section: 'advanced',
            label: 'search.form.common.subject.label',
            hint: 'search.form.common.subject.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table wdt:P476 ?table_pbid .
                BIND ( wdt:P243 as ?property)
                ?table ?property ?item . 
                {{langFilter}}
                FILTER regex(?table_pbid, '(.*) {{table}} ')
              }
              ORDER BY STR(?label)
              `
            }
          },
          search_type: {
            permanent: true,
            value: true,
            disabled: false
          }
        }
      }
    }
  }
}
</script>
