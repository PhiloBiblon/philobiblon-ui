<template>
  <search-base
    table="bioid"
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
          text: this.$i18n.t('menu.item.search.item.bioid.label'),
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
              SELECT DISTINCT ?label ?item
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
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
          name: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.name.label',
            hint: 'search.form.common.personal_name.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?property {
                {
                  SELECT ?label ?property
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P34 ?labelObj .
                    {{langFilter}}
                    BIND('P34' AS ?property)
                  }
                } UNION {
                  SELECT ?label ?property
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item rdfs:label ?labelObj .
                    {{langFilter}}
                    BIND('label' AS ?property)
                  }
                } UNION {
                  SELECT DISTINCT ?label ?property
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item skos:altLabel ?labelObj .
                    {{langFilter}}
                    BIND('alias' AS ?property)
                  }
                }
              }
              `
            }
          },
          title: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.title.label',
            hint: 'search.form.bioid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?property
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                {
                  BIND(wdt:P171 AS ?property)
                  ?item ?property ?target_item .
                  ?target_item rdfs:label ?labelObj .
                  {{langFilter}}
                } UNION {
                  BIND(wdt:P173 AS ?property)
                  ?item ?property ?label .
                }
              }
              `
            }
          },
          date: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.date.label',
            hint: 'search.form.bioid.date.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          associated_place: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.associated_place.label',
            hint: 'search.form.bioid.associated_place.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT * {
                {
                  SELECT ?target_item ?label ?property {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item p:P137 ?item_prop .
                    ?item_prop pq:P47 ?target_item .
                    ?target_item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P137 AS ?property)
                    ?target_item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?target_item ?label ?property {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item p:P165 ?item_prop .
                    ?item_prop pq:P47 ?target_item .
                    ?target_item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P165 AS ?property)
                    ?target_item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?target_item ?label ?property {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item p:P746 ?item_prop .
                    ?item_prop pq:P47 ?target_item .
                    ?target_item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P746 AS ?property)
                    ?target_item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?target_item ?label ?property {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item p:P172 ?item_prop .
                    ?item_prop pq:P47 ?target_item .
                    ?target_item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P172 AS ?property)
                    ?target_item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?target_item ?label ?property {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    BIND(wdt:P47 AS ?property)
                    ?item ?property ?target_item .
                    ?target_item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    ?target_item rdfs:label ?labelObj .
                    {{langFilter}}
                  }
                }
              }
              `
            }
          },
          religion: {
            active: true,
            section: 'advanced',
            label: 'search.form.bioid.religion.label',
            hint: 'search.form.bioid.religion.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                ?item wdt:P172 ?target_item .
                ?target_item rdfs:label ?labelObj .
                {{langFilter}}
              }
              `
            }
          },
          religious_order: {
            active: true,
            section: 'advanced',
            label: 'search.form.bioid.religious_order.label',
            hint: 'search.form.bioid.religious_order.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                ?item wdt:P746 ?target_item .
                ?target_item rdfs:label ?labelObj .
                {{langFilter}}
              }
              `
            }
          },
          profession: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.profession.label',
            hint: 'search.form.bioid.profession.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                ?item wdt:P165 ?target_item .
                ?target_item rdfs:label ?labelObj .
                {{langFilter}}
              }
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
              SELECT DISTINCT ?target_item ?label
              WHERE {
                ?item wdt:P476 ?pbid .
                BIND ( wdt:P243 as ?property)
                ?item ?property ?target_item .
                ?target_item rdfs:label ?labelObj .
                {{langFilter}}
                FILTER regex(?pbid, '{{database}} {{table}} ')
                {{bitagapGroupSubjectFilter}}
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
