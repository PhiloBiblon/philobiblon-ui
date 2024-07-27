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
          value: '',
          type: 'text',
          visible: true,
          disabled: false
        },
        city: {
          active: true,
          primary: true,
          label: 'search.form.libid.city.label',
          hint: 'search.form.libid.city.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?item ?label
            WHERE { 
              ?item wdt:P476 ?table_pbid .
              FILTER regex(?table_pbid, '(.*) {{table}} ')
              ?item wdt:P111 ?label . 
            }
            ORDER BY ?label
            `
          }
        },
        library: {
          active: true,
          primary: true,
          label: 'search.form.libid.library.label',
          hint: 'search.form.libid.library.hint',
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
            ORDER BY ?label
            `
          }
        },
        call_number: {
          active: false,
          primary: true,
          label: 'search.form.libid.call_number.label',
          hint: 'search.form.libid.call_number.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            `
          }
        },
        subject: {
          active: true,
          primary: true,
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
                  FILTER regex(?subject_pbid, '(.*) bioid ')
                  FILTER regex(?table_pbid, '(.*) {{table}} ')
                  BIND ( wdt:P703 as ?property)
                }
              } UNION {
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
                  FILTER regex(?subject_pbid, '(.*) geoid ')
                  FILTER regex(?table_pbid, '(.*) {{table}} ')
                  BIND ( wdt:P47 as ?property)
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
