<template>
  <search-base
    table="insid"
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
          text: this.$i18n.t('menu.item.search.item.insid.label'),
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
        city: {
          active: true,
          primary: true,
          label: 'search.form.insid.city.label',
          hint: 'search.form.insid.city.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
              `
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '(.*) geoid ') .
                {{langFilter}}
                ?table wdt:P297 ?item . 
                ?table wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ')
              }
              ORDER BY ?label
              `
          }
        },
        institution_type: {
          active: true,
          primary: true,
          label: 'search.form.insid.institution_type.label',
          hint: 'search.form.insid.institution_type.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT ?item ?label
            WHERE { 
              ?item wdt:P994 ?pbid .
              {{langFilter}}
              FILTER regex(?pbid, 'INSTITUTIONS\\\\*CLASS\\\\*') .
            }
            ORDER BY ?label
            `
          }
        },
        institution: {
          active: true,
          primary: true,
          label: 'search.form.insid.institution.label',
          hint: 'search.form.insid.institution.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?item ?label ?property {
              {
                SELECT ?item ?label
                WHERE { 
                  ?item wdt:P476 ?pbid .
                  FILTER regex(?pbid, '(.*) {{table}} ') .
                  ?item wdt:P34 ?label .
                }
              } UNION {
                SELECT ?item ?label
                WHERE { 
                  ?item wdt:P476 ?pbid .
                  FILTER regex(?pbid, '(.*) {{table}} ') .
                  {{langFilter}}
                }
              }
            }
            ORDER BY ?label
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
