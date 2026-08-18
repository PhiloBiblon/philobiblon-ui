/**
 * Search form definition for the bibid table.
 * Pure data (labels are i18n keys, autocomplete.query are SPARQL templates
 * filled by query.templates.js filterQuery), importable from Nuxt and Node
 * (scripts/seed-cache uses it to generate every autocomplete query).
 */
import { SUBJECT_PROPERTIES } from '../query.templates.js'

export default function createForm () {
  return {
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
              SELECT DISTINCT ?item ?label ?aliases ?desc ?lang ?db ?bg
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                {{bitagapGroupFilter}}
                {
                  ?item rdfs:label ?labelObj .
                  {{langFilter}}
                }
                UNION
                {
                  ?item skos:altLabel ?aliasObj .
                  {{aliasLangFilter}}
                }
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                ?item wdt:P1137 ?label .
                {{bitagapGroupFilter}}
                {{descLangFilter}}
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?label ?db ?bg
              WHERE { 
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db ?bg WHERE {
                {
                  SELECT DISTINCT ?target_item ?db ?bg WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?label ?db ?bg WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db ?bg WHERE {
                {
                  SELECT DISTINCT ?target_item ?db ?bg WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db ?bg WHERE {
                {
                  SELECT DISTINCT ?target_item ?db ?bg WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                    ${SUBJECT_PROPERTIES.map(p => `{ ?item wdt:${p} ?target_item }`).join('\n                    UNION ')}
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
