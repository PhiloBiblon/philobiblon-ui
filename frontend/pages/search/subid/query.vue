<template>
  <search-base
    table="subid"
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
          text: this.$i18n.t('menu.item.search.item.subid.label'),
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
          headings: {
            active: true,
            section: 'primary',
            label: 'search.form.subid.headings.label',
            hint: 'search.form.subid.headings.hint',
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
                    ?item wdt:P1031 ?label .
                    BIND('P1031' AS ?property)
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
