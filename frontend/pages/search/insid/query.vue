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
              SELECT DISTINCT ?item ?label ?desc
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                {
                  ?item rdfs:label ?labelObj .
                }
                UNION
                {
                  ?item skos:altLabel ?labelObj .
                }
                {{langFilter}}
                {{descLangFilter}}
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
                SELECT DISTINCT ?target_item ?label ?desc WHERE {
                  {
                    SELECT DISTINCT ?target_item WHERE {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ')
                      ?item wdt:P297 ?target_item .
                      ?target_item wdt:P476 ?target_pbid .
                      FILTER regex(?target_pbid, '(.*) geoid ') .
                      {{bitagapGroupFilter}}
                    }
                  }
                  {{targetItemLangGroupPattern}}
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
              SELECT DISTINCT ?item ?label ?desc WHERE {
                {
                  SELECT DISTINCT ?item WHERE {
                    ?item wdt:P994 ?pbid .
                    FILTER regex(?pbid, 'INSTITUTIONS\\\\*(CLASS|TYPE)\\\\*') .
                  }
                }
                {{itemLangGroupPattern}}
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
              SELECT DISTINCT ?item (STR(?labelObj) AS ?label) ?desc {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                {
                  ?item wdt:P34 ?labelObj .
                } UNION {
                  ?item rdfs:label ?labelObj .
                }
                {{langFilterWithoutBind}}
                {{descLangFilter}}
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
              SELECT DISTINCT ?target_item ?label ?desc WHERE {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    {{bitagapGroupSubjectFilter}}
                    BIND ( wdt:P243 as ?property)
                    ?item ?property ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
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
