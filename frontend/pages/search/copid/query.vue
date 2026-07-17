<template>
  <search-base
    table="copid"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const breadcrumb_items = [
  { title: t('menu.item.search.label'), disabled: true },
  { title: t('menu.item.search.item.copid.label'), disabled: true }
]

const form = {
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
          edition: {
            active: true,
            section: 'primary',
            label: 'search.form.copid.edition.label',
            hint: 'search.form.copid.edition.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P839 ?target_item .
                    ?target_item wdt:P476 ?target_pbid .
                    FILTER regex(?target_pbid, '(.*) manid ') .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          library: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.library.label',
            hint: 'search.form.manid.library.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P329 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          collection: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.collection.label',
            hint: 'search.form.manid.collection.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              allowFreeText: true,
              query:
              `
              SELECT DISTINCT ?label WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                {{bitagapGroupFilter}}
                ?item p:P329 ?library_stmt .
                ?library_stmt pq:P1054 ?label .
              }
              `
            }
          },
          call_number: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.call_number.label',
            hint: 'search.form.manid.call_number.hint',
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
                ?item p:P329 ?library_stmt .
                {
                  ?library_stmt pq:P10 ?label
                }
                UNION
                {
                  ?library_stmt pq:P30 ?label
                }
              }
              `
            }
          },
          previous_owner: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.previous_owner.label',
            hint: 'search.form.manid.previous_owner.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P229 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          associated_person: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.associated_person.label',
            hint: 'search.form.manid.associated_person.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P703 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          writing_surface: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.writing_surface.label',
            hint: 'search.form.manid.writing_surface.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P480 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          binding: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.binding.label',
            hint: 'search.form.manid.binding.hint',
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
                ?item wdt:P800 ?label .
              }
              `
            }
          },
          watermark: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.watermark.label',
            hint: 'search.form.manid.watermark.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P749 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          graphic_feature: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.graphic_feature.label',
            hint: 'search.form.manid.graphic_feature.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P801 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
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
                    VALUES ?property { wdt:P97 wdt:P121 wdt:P122 wdt:P243 wdt:P304 wdt:P452 wdt:P608 wdt:P1094 wdt:P1278 }
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
</script>

<style scoped>
.search {
  width: 100% !important
}
</style>
