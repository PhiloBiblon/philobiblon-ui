<template>
  <search-base
    table="bibid"
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
          text: this.$i18n.t('menu.item.search.item.bibid.label'),
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
              SELECT DISTINCT ?label ?item
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
          author: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.author.label',
            hint: 'search.form.bibid.author.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?property
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                VALUES ?property { wdt:P1134 wdt:P1136 }
                ?item ?property ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          title: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.title.label',
            hint: 'search.form.bibid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                ?item wdt:P11 ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          date: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.date.label',
            hint: 'search.form.bibid.date.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          volume: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.volume.label',
            hint: 'search.form.bibid.volume.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                ?item wdt:P1137 ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          place_publication: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.place_publication.label',
            hint: 'search.form.bibid.place_publication.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                ?item wdt:P1141 ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          publisher: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.publisher.label',
            hint: 'search.form.bibid.publisher.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                ?item wdt:P1140 ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          series: {
            active: true,
            section: 'primary',
            label: 'search.form.bibid.series.label',
            hint: 'search.form.bibid.series.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                ?item wdt:P1139 ?label .
                {{bitagapGroupFilter}}
              }
              `
            }
          },
          locations: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.locations.label',
            hint: 'search.form.bibid.locations.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label WHERE {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    ?item wdt:P329 ?target_item .
                    {{bitagapGroupFilter}}
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          international_standard_number: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.international_standard_number.label',
            hint: 'search.form.bibid.international_standard_number.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                VALUES ?prop { wdt:P605 wdt:P606 wdt:P743 wdt:P634 }
                ?item ?prop ?label .
              }
              `
            }
          },
          type: {
            active: true,
            section: 'advanced',
            label: 'search.form.bibid.type.label',
            hint: 'search.form.bibid.type.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label WHERE {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    ?item wdt:P2 ?target_item .
                    {{bitagapGroupFilter}}
                  }
                }
                {{targetItemLangGroupPattern}}
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
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label WHERE {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    BIND ( wdt:P243 as ?property)
                    ?item ?property ?target_item .
                    {{bitagapGroupSubjectFilter}}
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
