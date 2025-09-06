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
                SELECT DISTINCT ?target_item ?label
                WHERE {
                  ?target_item wdt:P476 ?target_pbid .
                  FILTER regex(?target_pbid, '(.*) geoid ') .
                  ?target_item rdfs:label ?labelObj .
                  {{langFilter}}
                  ?item wdt:P297 ?target_item .
                  ?item wdt:P476 ?pbid .
                  FILTER regex(?pbid, '{{database}} {{table}} ')
                  {{bitagapGroupFilter}}
                }
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
                ?item rdfs:label ?labelObj .
                {{langFilter}}
                FILTER regex(?pbid, 'INSTITUTIONS\\\\*(CLASS|TYPE)\\\\*') .
              }
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
                }
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
