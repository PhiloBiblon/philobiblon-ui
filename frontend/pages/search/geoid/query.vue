<template>
  <search-base
    table="geoid"
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
          text: this.$i18n.t('menu.item.search.item.geoid.label'),
          disabled: true
        }
      ],
      form: {
        group: {
          permanent: true,
          value: 'ALL',
          disabled: false
        },
        simple_search: {
          active: true,
          primary: true,
          label: 'search.form.common.simple_search.label',
          hint: 'search.form.common.simple_search.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        type: {
          active: true,
          primary: true,
          label: 'search.form.geoid.type.label',
          hint: 'search.form.geoid.type.hint',
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
              ?table_item wdt:P2 ?item .
              {{langFilter}}
            }
            ORDER BY ?label
            `
          }
        },
        class: {
          active: true,
          primary: true,
          label: 'search.form.geoid.class.label',
          hint: 'search.form.geoid.class.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT ?item ?label {
              ?table_item wdt:P476 ?table_item_pbid .
              FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
              ?table_item p:P2 ?statement .
              ?statement pq:P700 ?item
              {{langFilter}}
            }
            `
          }
        },
        subject: {
          active: true,
          primary: false,
          label: 'search.form.common.subject.label',
          hint: 'search.form.common.subject.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT * {
              {
                SELECT ?item ?label ?property
                WHERE { 
                  ?table wdt:P476 ?table_pbid .
                  ?table ?property ?item . 
                  ?item wdt:P476 ?subject_pbid .
                  {{langFilter}}
                  FILTER regex(?subject_pbid, '(.*) subid ')
                  FILTER regex(?table_pbid, '(.*) {{table}} ')
                  BIND ( wdt:P422 as ?property)
                }
              } UNION {
                SELECT ?item ?label ?property
                WHERE { 
                  ?table wdt:P476 ?table_pbid .
                  ?table ?property ?item . 
                  ?item wdt:P476 ?subject_pbid .
                  {{langFilter}}
                  FILTER regex(?subject_pbid, '(.*) insid ')
                  FILTER regex(?table_pbid, '(.*) {{table}} ')
                  BIND ( wdt:P232 as ?property)
                }
              } UNION {
                SELECT ?item ?label ?property
                WHERE { 
                  ?table wdt:P476 ?table_pbid .
                  ?table ?property ?item . 
                  ?item wdt:P476 ?subject_pbid .
                  {{langFilter}}
                  FILTER regex(?subject_pbid, '(.*) bioid ')
                  FILTER regex(?table_pbid, '(.*) {{table}} ')
                  BIND ( wdt:P703 as ?property)
                }
              }
            }
            ORDER BY ?label
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
</script>
