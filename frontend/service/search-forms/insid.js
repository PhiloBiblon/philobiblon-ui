/**
 * Search form definition for the insid table.
 * Pure data (labels are i18n keys, autocomplete.query are SPARQL templates
 * filled by query.templates.js filterQuery), importable from Nuxt and Node
 * (scripts/seed-cache uses it to generate every autocomplete query).
 */
import { SUBJECT_PROPERTIES } from '../query.templates.js'

export default function createForm () {
  return {
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
              SELECT DISTINCT ?item (STR(?labelObj) AS ?label) ?desc ?lang ?db ?bg WHERE {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                {{bitagapGroupFilter}}
                {
                  ?item wdt:P34 ?labelObj .
                }
                UNION
                {
                  ?item rdfs:label ?labelObj .
                }
                UNION
                {
                  ?item skos:altLabel ?labelObj .
                }
                {{langFilterWithoutBind}}
                {{descLangFilter}}
              }
              `
            }
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
                SELECT DISTINCT ?target_item ?label ?desc ?lang ?db ?bg WHERE {
                  {
                    SELECT DISTINCT ?target_item ?db ?bg WHERE {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ')
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
              SELECT DISTINCT ?item ?label ?desc ?lang WHERE {
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
