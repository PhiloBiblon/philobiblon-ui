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
            type: 'text',
            value: '',
            visible: true,
            disabled: false
          },
          type: {
            active: true,
            section: 'primary',
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
              ORDER BY STR(?label)
              `
            }
          },
          class: {
            active: true,
            section: 'primary',
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
