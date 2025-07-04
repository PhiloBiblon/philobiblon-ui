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
            type: 'text',
            value: '',
            visible: true,
            disabled: false
          },
          city: {
            active: true,
            section: 'primary',
            label: 'search.form.insid.city.label',
            hint: 'search.form.insid.city.hint',
            type: 'autocomplete',
            value: {},
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
                ORDER BY STR(?label)
                `
            }
          },
          institution_type: {
            active: true,
            section: 'primary',
            label: 'search.form.insid.institution_type.label',
            hint: 'search.form.insid.institution_type.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT ?item ?label
              WHERE { 
                ?item wdt:P994 ?pbid .
                {{langFilter}}
                FILTER regex(?pbid, 'INSTITUTIONS\\\\*(CLASS|TYPE)\\\\*') .
              }
              ORDER BY STR(?label)
              `
            }
          },
          institution: {
            active: true,
            section: 'primary',
            label: 'search.form.insid.institution.label',
            hint: 'search.form.insid.institution.hint',
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
                    FILTER regex(?pbid, '(.*) {{table}} ') .
                    ?item wdt:P34 ?label .
                    BIND('P34' AS ?property)
                  }
                } UNION {
                  SELECT ?label ?property
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
