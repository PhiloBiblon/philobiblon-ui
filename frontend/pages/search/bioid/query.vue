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
          simple_search: {
            active: true,
            section: 'primary',
            label: 'search.form.common.simple_search.label',
            hint: 'search.form.common.simple_search.hint',
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
            value: '',
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
                    FILTER regex(?pbid, '(.*) {{table}} ') .
                    ?item wdt:P34 ?label .
                    BIND('P34' AS ?property)
                  }
                } UNION {
                  SELECT DISTINCT ?label ?property
                  WHERE { 
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '(.*) {{table}} ') .
                    {{langFilter}}
                    BIND('label' AS ?property)
                  }
                }
              }
              ORDER BY STR(?label)
              `
            }
          },
          title: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.title.label',
            hint: 'search.form.bioid.title.hint',
            type: 'autocomplete',
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P171 ?item .
                {{langFilter}}
              }
              ORDER BY ?label
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
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT * {
                {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item p:P137 ?table_item_prop .
                    ?table_item_prop pq:P47 ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P137 AS ?property)
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item p:P165 ?table_item_prop .
                    ?table_item_prop pq:P47 ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P165 AS ?property)
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item p:P746 ?table_item_prop .
                    ?table_item_prop pq:P47 ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P746 AS ?property)
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item p:P172 ?table_item_prop .
                    ?table_item_prop pq:P47 ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P172 AS ?property)
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item ?property ?item .
                    ?item wdt:P476 ?geo_pbid .
                    FILTER regex(?geo_pbid, '(.*) geoid ') .
                    BIND(wdt:P47 AS ?property)
                    {{langFilter}}
                  }
                }      
              }
              ORDER BY ?label
              `
            }
          },
          religion: {
            active: true,
            section: 'advanced',
            label: 'search.form.bioid.religion.label',
            hint: 'search.form.bioid.religion.hint',
            type: 'autocomplete',
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P172 ?item .
                {{langFilter}}
              }
              ORDER BY ?label
              `
            }
          },
          religious_order: {
            active: true,
            section: 'advanced',
            label: 'search.form.bioid.religious_order.label',
            hint: 'search.form.bioid.religious_order.hint',
            type: 'autocomplete',
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P746 ?item .
                {{langFilter}}
              }
              ORDER BY ?label
              `
            }
          },
          profession: {
            active: true,
            section: 'primary',
            label: 'search.form.bioid.profession.label',
            hint: 'search.form.bioid.profession.hint',
            type: 'autocomplete',
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P165 ?item .
                {{langFilter}}
              }
              ORDER BY ?label
              `
            }
          },
          subject: {
            active: true,
            section: 'advanced',
            label: 'search.form.common.subject.label',
            hint: 'search.form.common.subject.hint',
            type: 'autocomplete',
            value: '',
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table wdt:P476 ?table_pbid .
                ?table ?property ?item . 
                {{langFilter}}
                FILTER regex(?table_pbid, '(.*) {{table}} ')
                BIND ( wdt:P243 as ?property)
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
