<template>
  <search-base
    table="texid"
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
          text: this.$i18n.t('menu.item.search.item.texid.label'),
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
          author: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.author.label',
            hint: 'search.form.texid.author.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                  SELECT ?item ?label {
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P21 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?label ?analytic_item {
                    ?analytic_item wdt:P476 ?analytic_item_pbid .
                    FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?table_item .
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?analytic_item wdt:P34 ?label
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
            label: 'search.form.texid.title.label',
            hint: 'search.form.texid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                  SELECT ?item ?label {
                    ?item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?item wdt:P11 ?label .
                  }
                } UNION {
                  SELECT ?label ?analytic_item {
                    ?analytic_item wdt:P476 ?analytic_pbid .
                    FILTER regex(?analytic_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?item .
                    ?item wdt:P476 ?item_pbid .
                    FILTER regex(?item_pbid, '(.*) {{table}} ') .
                    ?analytic_item wdt:P11 ?label
                  }
                }
              }
              ORDER BY ?label
              `
            }
          },
          incipit: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.incipit.label',
            hint: 'search.form.texid.incipit.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                    SELECT ?item ?label {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '(.*) {{table}} ') .
                    ?item p:P543 ?statement .
                    ?statement pq:P70 ?label
                  }
                } UNION {
                  SELECT ?analytic_item ?label {
                    ?analytic_item wdt:P476 ?analytic_pbid .
                    FILTER regex(?analytic_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?item .
                    ?item wdt:P476 ?item_pbid .
                    FILTER regex(?item_pbid, '(.*) {{table}} ') .
                    ?analytic_item p:P543 ?statement .
                    ?statement pq:P70 ?label
                  }
                }
              }
              ORDER BY ?label
              `
            }
          },
          explicit: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.explicit.label',
            hint: 'search.form.texid.explicit.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                    SELECT ?item ?label {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '(.*) {{table}} ') .
                    ?item p:P543 ?statement .
                    ?statement pq:P602 ?label
                  }
                } UNION {
                  SELECT ?analytic_item ?label {
                    ?analytic_item wdt:P476 ?analytic_pbid .
                    FILTER regex(?analytic_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?item .
                    ?item wdt:P476 ?item_pbid .
                    FILTER regex(?item_pbid, '(.*) {{table}} ') .
                    ?analytic_item p:P543 ?statement .
                    ?statement pq:P602 ?label
                  }
                }
              }
              ORDER BY ?label
              `
            }
          },
          associated_person: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.associated_person.label',
            hint: 'search.form.common.personal_name.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                  SELECT ?item ?label {
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P703 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?analytic_item {
                    ?analytic_item wdt:P476 ?analytic_item_pbid .
                    FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?table_item .
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?analytic_item wdt:P703 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
              `
            }
          },
          place_composition: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.place_composition.label',
            hint: 'search.form.common.place.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT ?item ?geo {
                ?table_item wdt:P476 ?table_item_pbid .
                FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                ?table_item p:P137 ?history_statement .
                ?history_statement pq:P47 ?item .
                ?item wdt:P476 ?item_pbid .
                FILTER regex(?item_pbid, '(.*) geoid ') .
                {{langFilter}}
              }
              `
            }
          },
          date_composition: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.date_composition.label',
            hint: 'search.form.texid.date_composition.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          type: {
            active: true,
            section: 'advanced',
            label: 'search.form.texid.type.label',
            hint: 'search.form.texid.type.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label {
                ?table_item wdt:P476 ?table_item_pbid .
                FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                ?table_item p:P121 ?statement .
                ?statement pq:P700 ?item
                {{langFilter}}
              }
              `
            }
          },
          language: {
            active: true,
            section: 'advanced',
            label: 'search.form.texid.language.label',
            hint: 'search.form.texid.language.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item ?label ?analytic_item {
                {
                  SELECT ?item ?label {
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P18 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?analytic_item {
                    ?analytic_item wdt:P476 ?analytic_pbid .
                    FILTER regex(?analytic_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?table_item .
                    ?table_item wdt:P476 ?table_item_pbid .
                    FILTER regex(?table_item_pbid, '(.*) {{table}} ') .
                    ?analytic_item wdt:P18 ?item
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
              `
            }
          },
          poetic_form: {
            active: true,
            section: 'advanced',
            label: 'search.form.texid.poetic_form.label',
            hint: 'search.form.texid.poetic_form.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?analytic_item {
                {
                  SELECT ?label {
                    ?item wdt:P476 ?item_pbid .
                    FILTER regex(?item_pbid, '(.*) {{table}} ') .
                    ?item wdt:P781 ?label
                  }
                } UNION {
                  SELECT ?label ?analytic_item {
                    ?analytic_item wdt:P476 ?analytic_item_pbid .
                    FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                    ?analytic_item wdt:P590 ?item .
                    ?item wdt:P476 ?item_pbid .
                    FILTER regex(?item_pbid, '(.*) {{table}} ') .
                    ?analytic_item wdt:P781 ?label
                  }
                }
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

<style scoped>
.search {
  width: 100% !important
}
</style>
