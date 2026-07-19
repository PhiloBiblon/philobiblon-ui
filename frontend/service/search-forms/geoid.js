/**
 * Search form definition for the geoid table.
 * Pure data (labels are i18n keys, autocomplete.query are SPARQL templates
 * filled by query.templates.js filterQuery), importable from Nuxt and Node
 * (scripts/seed-cache uses it to generate every autocomplete query).
 */
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
              SELECT DISTINCT ?item ?label ?aliases ?desc ?lang ?db
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
          type: {
            active: true,
            section: 'primary',
            label: 'search.form.geoid.type.label',
            hint: 'search.form.geoid.type.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db WHERE {
                {
                  SELECT DISTINCT ?target_item ?db WHERE {
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
          class: {
            active: true,
            section: 'primary',
            label: 'search.form.geoid.class.label',
            hint: 'search.form.geoid.class.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db {
                {
                  SELECT DISTINCT ?target_item ?db WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                    ?item wdt:P3 ?target_item .
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
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db WHERE {
                {
                  SELECT DISTINCT ?target_item ?db WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                    VALUES ?property { wdt:P97 wdt:P121 wdt:P122 wdt:P243 wdt:P304 wdt:P422 wdt:P452 wdt:P608 wdt:P1031 wdt:P1094 wdt:P1278 }
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
