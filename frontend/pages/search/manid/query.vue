<template>
  <search-base
    table="manid"
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
          text: this.$i18n.t('menu.item.search.item.manid.label'),
          disabled: true
        }
      ],
      form: {
        section: [
          'primary',
          'external_description',
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
          city: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.city.label',
            hint: 'search.form.manid.city.hint',
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
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P329 ?lib_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER CONTAINS(STR(?copid_pbid), "copid") .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P329 ?lib_item .
                    }
                    ?lib_item wdt:P47 ?target_item .
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
              SELECT DISTINCT ?target_item ?label WHERE {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P329 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER CONTAINS(STR(?copid_pbid), "copid") .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P329 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
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
                {
                  {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item p:P329 ?library_stmt .
                  }
                  UNION
                  {
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?item .
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?copid_item p:P329 ?library_stmt .
                  }
                  {
                    ?library_stmt pq:P10 ?label
                  }
                  UNION
                  {
                    ?library_stmt pq:P30 ?label
                  }
                  ?cnum_item wdt:P476 ?cnum_pbid .
                  FILTER regex(?cnum_pbid, '(.*) cnum ') .
                  ?cnum_item wdt:P8 ?item .
                }
              }
              `
            }
          },
          date_of_artifact: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.date_of_artifact.label',
            hint: 'search.form.manid.date_of_artifact.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          date_of_publication: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.date_of_publication.label',
            hint: 'search.form.manid.date_of_publication.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          place_production: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.place_production.label',
            hint: 'search.form.manid.place_production.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT DISTINCT ?target_item {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P47 ?target_item .
                    }
                    UNION
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P241 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          scribe_printer: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.scribe_printer.label',
            hint: 'search.form.manid.scribe_printer.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT DISTINCT ?target_item  {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P25 ?target_item .
                    }
                    UNION
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P207 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          publisher_patron: {
            active: true,
            section: 'primary',
            label: 'search.form.manid.publisher_patron.label',
            hint: 'search.form.manid.publisher_patron.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P67 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
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
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P229 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER regex(?copid_pbid, '(.*) copid ') .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P229 ?target_item .
                    }
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
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT DISTINCT ?target_item ?label WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P703 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER regex(?copid_pbid, '(.*) copid ') .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P703 ?target_item .
                    }
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
          },
          title: {
            active: true,
            section: 'advanced',
            label: 'search.form.manid.title.label',
            hint: 'search.form.manid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label {
                {
                  SELECT ?label
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P5 ?label .
                  }
                } UNION {
                  SELECT ?label ?cnum_item
                  WHERE {
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?item .
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?cnum_item wdt:P5 ?label .
                  }
                }
              }
              `
            }
          },
          type: {
            active: true,
            section: 'advanced',
            label: 'search.form.manid.type.label',
            hint: 'search.form.manid.type.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P2 ?target_item .
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
          writing_surface: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.writing_surface.label',
            hint: 'search.form.manid.writing_surface.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT ?target_item ?label WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P480 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER regex(?copid_pbid, '(.*) copid ') .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?table_pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P480 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          format: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.format.label',
            hint: 'search.form.manid.format.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P93 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          binding: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.binding.label',
            hint: 'search.form.manid.binding.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label {
                {
                  SELECT ?label
                  WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?item wdt:P800 ?label .
                  }
                } UNION {
                  SELECT ?label ?copid_item
                  WHERE {
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?item .
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    {{bitagapGroupFilter}}
                    ?copid_item wdt:P800 ?label .
                  }
                }
              }
              `
            }
          },
          collation: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.collation.label',
            hint: 'search.form.manid.collation.hint',
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
                {{bitagapGroupFilter}}
                ?item wdt:P704 ?label .
              }
              `
            }
          },
          hand: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.hand.label',
            hint: 'search.form.manid.hand.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P747 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          font: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.font.label',
            hint: 'search.form.manid.font.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P748 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          watermark: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.watermark.label',
            hint: 'search.form.manid.watermark.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT DISTINCT ?target_item WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P749 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER regex(?copid_pbid, '(.*) copid ') .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P749 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          graphic_feature: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.graphic_feature.label',
            hint: 'search.form.manid.graphic_feature.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label {
                {
                  SELECT ?target_item ?label WHERE {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?item wdt:P801 ?target_item .
                    }
                    UNION
                    {
                      ?copid_item wdt:P476 ?copid_pbid .
                      FILTER regex(?copid_pbid, '(.*) copid ') .
                      ?copid_item wdt:P839 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      {{bitagapGroupFilter}}
                      ?copid_item wdt:P801 ?target_item .
                    }
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          physical_feature: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.physical_feature.label',
            hint: 'search.form.manid.physical_feature.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P778 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          },
          music: {
            active: true,
            section: 'external_description',
            label: 'search.form.manid.music.label',
            hint: 'search.form.manid.music.hint',
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
                    {{bitagapGroupFilter}}
                    ?item wdt:P790 ?target_item .
                  }
                }
                {{targetItemLangGroupPattern}}
              }
              `
            }
          }
        }
      }
    }
  }
}
</script>
