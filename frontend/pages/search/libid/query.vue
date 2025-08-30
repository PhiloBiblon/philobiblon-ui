<template>
  <search-base
    table="libid"
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
          text: this.$i18n.t('menu.item.search.item.libid.label'),
          disabled: true
        }
      ],
      form: {
        section: [
          'primary'
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
              SELECT (STR(?labelObj) AS ?label) ?item
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {
                  ?item rdfs:label ?labelObj .
                  {{langFilter}}
                }
                UNION
                {
                  ?item skos:altLabel ?labelObj .
                  {{langFilter}}
                }
              }
              `,
              allowFreeText: true
            }
          },
          q_number: {
            active: true,
            section: 'primary',
            label: 'search.form.common.q_number.label',
            hint: 'search.form.common.q_number.hint',
            type: 'text',
            value: '',
            visible: true,
            disabled: false
          },
          philobiblon_id: {
            active: true,
            section: 'primary',
            label: 'search.form.common.philobiblon_id.label',
            hint: 'search.form.common.philobiblon_id.hint',
            type: 'text',
            value: '',
            visible: true,
            disabled: false
          },
          city: {
            active: true,
            section: 'primary',
            label: 'search.form.libid.city.label',
            hint: 'search.form.libid.city.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item (STR(?labelObj) AS ?label)
                  WHERE {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '{{database}} {{table}} ')
                    ?table_item wdt:P47 ?item .
                    ?item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item (STR(?labelObj) AS ?label)
                  WHERE {
                    ?table_item wdt:P476 ?table_pbid .
                    ?table_item wdt:P243 ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ')
                    FILTER regex(?table_pbid, '{{database}} libid ')
                    ?item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                }
              }
              `
            }
          },
          library: {
            active: true,
            section: 'primary',
            label: 'search.form.libid.library.label',
            hint: 'search.form.libid.library.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?property {
                {
                  SELECT (STR(?labelObj) AS ?label) ?property
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    ?item wdt:P34 ?labelObj .
                    {{langFilter}}
                    BIND('P34' AS ?property)
                  }
                } UNION {
                  SELECT (STR(?labelObj) AS ?label) ?property
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    ?item rdfs:label ?labelObj .
                    {{langFilter}}
                    BIND('label' AS ?property)
                  }
                }
              }
              `
            }
          },
          call_number: {
            active: true,
            section: 'primary',
            label: 'search.form.libid.call_number.label',
            hint: 'search.form.libid.call_number.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE {
                ?manid wdt:P476 ?manid_pbid .
                FILTER regex(?manid_pbid, '(.*) manid ')
                ?manid wdt:P329 ?item .
                ?item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '{{database}} {{table}} ')
                ?manid p:P329 ?library .
                { ?library pq:P10 ?label }
                UNION
                { ?library pq:P30 ?label }
              }
              `
            }
          },
          subject: {
            active: true,
            section: 'primary',
            label: 'search.form.common.subject.label',
            hint: 'search.form.common.subject.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item (STR(?labelObj) AS ?label)
              WHERE {
                ?table wdt:P476 ?table_pbid .
                BIND ( wdt:P243 as ?property)
                ?table ?property ?item .
                ?item rdfs:label ?labelObj .
                {{langFilter}}
                FILTER regex(?table_pbid, '{{database}} {{table}} ')
              }
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
