<template>
  <search-base
    table="cnum"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const breadcrumb_items = [
  { title: t('menu.item.search.label'), disabled: true },
  { title: t('menu.item.search.item.cnum.label'), disabled: true }
]

const form = {
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
    witness_of: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.witness_of.label',
      hint: 'search.form.cnum.witness_of.hint',
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
              ?item wdt:P590 ?target_item .
              ?target_item wdt:P476 ?target_pbid .
              FILTER regex(?target_pbid, '(.*) texid ') .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    part_of: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.part_of.label',
      hint: 'search.form.cnum.part_of.hint',
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
              ?item wdt:P8 ?target_item .
              ?target_item wdt:P476 ?target_pbid .
              FILTER regex(?target_pbid, '(.*) manid ') .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    author: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.author.label',
      hint: 'search.form.cnum.author.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?target_item ?label ?desc {
          {
            SELECT DISTINCT ?target_item {
              ?item wdt:P476 ?pbid .
              FILTER regex(?pbid, '{{database}} {{table}} ') .
              {{bitagapGroupFilter}}
              ?item wdt:P21 ?target_item .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    incipit: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.incipit.label',
      hint: 'search.form.cnum.incipit.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?label {
          ?item wdt:P476 ?pbid .
          FILTER regex(?pbid, '{{database}} {{table}} ') .
          {{bitagapGroupFilter}}
          ?item p:P543 ?statement .
          ?statement pq:P70 ?label .
        }
        `
      }
    },
    explicit: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.explicit.label',
      hint: 'search.form.cnum.explicit.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?label {
          ?item wdt:P476 ?pbid .
          FILTER regex(?pbid, '{{database}} {{table}} ') .
          {{bitagapGroupFilter}}
          ?item p:P543 ?statement .
          ?statement pq:P602 ?label .
        }
        `
      }
    },
    associated_person: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.associated_person.label',
      hint: 'search.form.common.personal_name.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?target_item ?label ?desc {
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
    place_composition: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.place_composition.label',
      hint: 'search.form.common.place.hint',
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
              ?item wdt:P476 ?pbid .
              FILTER regex(?pbid, '{{database}} {{table}} ') .
              {{bitagapGroupFilter}}
              ?item p:P137 ?history_statement .
              ?history_statement pq:P47 ?target_item .
              ?target_item wdt:P476 ?target_item_pbid .
              FILTER regex(?target_item_pbid, '(.*) geoid ') .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    date_composition: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.date_composition.label',
      hint: 'search.form.cnum.date_composition.hint',
      type: 'date',
      value: {},
      visible: true,
      disabled: false
    },
    library: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.library.label',
      hint: 'search.form.cnum.library.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P329 ?target_item .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    city: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.city.label',
      hint: 'search.form.cnum.city.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P329 ?lib_item .
              ?lib_item wdt:P47 ?target_item .
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
      label: 'search.form.cnum.call_number.label',
      hint: 'search.form.cnum.call_number.hint',
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
          ?item wdt:P8 ?manid_item .
          ?manid_item p:P329 ?library_stmt .
          {
            ?library_stmt pq:P10 ?label .
          }
          UNION
          {
            ?library_stmt pq:P30 ?label .
          }
        }
        `
      }
    },
    collection: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.collection.label',
      hint: 'search.form.cnum.collection.hint',
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
          ?item wdt:P8 ?manid_item .
          ?manid_item p:P329 ?library_stmt .
          ?library_stmt pq:P1054 ?label .
        }
        `
      }
    },
    place_production: {
      active: true,
      section: 'primary',
      label: 'search.form.cnum.place_production.label',
      hint: 'search.form.cnum.place_production.hint',
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
              ?item wdt:P8 ?manid_item .
              {
                ?manid_item wdt:P47 ?target_item .
              }
              UNION
              {
                ?manid_item wdt:P241 ?target_item .
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
      label: 'search.form.cnum.scribe_printer.label',
      hint: 'search.form.cnum.scribe_printer.hint',
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
              ?item wdt:P8 ?manid_item .
              {
                ?manid_item wdt:P25 ?target_item .
              }
              UNION
              {
                ?manid_item wdt:P207 ?target_item .
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
      label: 'search.form.cnum.publisher_patron.label',
      hint: 'search.form.cnum.publisher_patron.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P67 ?target_item .
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
      label: 'search.form.cnum.previous_owner.label',
      hint: 'search.form.cnum.previous_owner.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P229 ?target_item .
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
      label: 'search.form.cnum.writing_surface.label',
      hint: 'search.form.cnum.writing_surface.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P480 ?target_item .
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
      label: 'search.form.cnum.binding.label',
      hint: 'search.form.cnum.binding.hint',
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
          ?item wdt:P8 ?manid_item .
          ?manid_item wdt:P800 ?label .
        }
        `
      }
    },
    watermark: {
      active: true,
      section: 'external_description',
      label: 'search.form.cnum.watermark.label',
      hint: 'search.form.cnum.watermark.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P749 ?target_item .
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
      label: 'search.form.cnum.graphic_feature.label',
      hint: 'search.form.cnum.graphic_feature.hint',
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
              ?item wdt:P8 ?manid_item .
              ?manid_item wdt:P801 ?target_item .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    type: {
      active: true,
      section: 'advanced',
      label: 'search.form.cnum.type.label',
      hint: 'search.form.cnum.type.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?target_item ?label ?desc {
          {
            SELECT DISTINCT ?target_item WHERE {
              ?item wdt:P476 ?pbid .
              FILTER regex(?pbid, '{{database}} {{table}} ') .
              {{bitagapGroupFilter}}
              ?item p:P121 ?statement .
              ?statement pq:P700 ?target_item .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    language: {
      active: true,
      section: 'advanced',
      label: 'search.form.cnum.language.label',
      hint: 'search.form.cnum.language.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?target_item ?label ?desc {
          {
            SELECT DISTINCT ?target_item WHERE {
              ?item wdt:P476 ?pbid .
              FILTER regex(?pbid, '{{database}} {{table}} ') .
              {{bitagapGroupFilter}}
              ?item wdt:P18 ?target_item .
            }
          }
          {{targetItemLangGroupPattern}}
        }
        `
      }
    },
    poetic_form: {
      active: true,
      section: 'advanced',
      label: 'search.form.cnum.poetic_form.label',
      hint: 'search.form.cnum.poetic_form.hint',
      type: 'autocomplete',
      value: {},
      visible: true,
      disabled: false,
      autocomplete: {
        query:
        `
        SELECT DISTINCT ?label {
          ?item wdt:P476 ?item_pbid .
          FILTER regex(?item_pbid, '{{database}} {{table}} ') .
          {{bitagapGroupFilter}}
          ?item wdt:P781 ?label .
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
</script>
