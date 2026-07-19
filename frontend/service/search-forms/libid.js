/**
 * Search form definition for the libid table.
 * Pure data (labels are i18n keys, autocomplete.query are SPARQL templates
 * filled by query.templates.js filterQuery), importable from Nuxt and Node
 * (scripts/seed-cache uses it to generate every autocomplete query).
 */
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
          city: {
            active: true,
            section: 'primary',
            label: 'search.form.libid.city.label',
            hint: 'search.form.libid.city.hint',
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
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                    {{bitagapGroupFilter}}
                    {
                      ?item wdt:P47 ?target_item .
                    } UNION {
                      ?item wdt:P243 ?target_item .
                      ?target_item wdt:P476 ?geo_pbid .
                      FILTER regex(?geo_pbid, '(.*) geoid ')
                    }
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
            label: 'search.form.libid.library.label',
            hint: 'search.form.libid.library.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?item (?labelObj AS ?label) ?desc ?lang ?db {
                ?item wdt:P476 ?pbid .
                FILTER regex(?pbid, '{{database}} {{table}} ') .
                BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
          call_number: {
            active: true,
            section: 'primary',
            label: 'search.form.libid.call_number.label',
            hint: 'search.form.libid.call_number.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?db
              WHERE {
                ?manid wdt:P476 ?manid_pbid .
                FILTER regex(?manid_pbid, '(.*) manid ')
                ?manid wdt:P329 ?item .
                ?item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '{{database}} {{table}} ')
                BIND(STRBEFORE(?table_pbid, ' ') AS ?db) .
                {{bitagapGroupFilter}}
                ?manid p:P329 ?library .
                { ?library pq:P10 ?label }
                UNION
                { ?library pq:P30 ?label }
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
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db WHERE {
                {
                  SELECT DISTINCT ?target_item ?db WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ')
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                    {{bitagapGroupSubjectFilter}}
                    VALUES ?property { wdt:P97 wdt:P121 wdt:P122 wdt:P243 wdt:P304 wdt:P422 wdt:P452 wdt:P608 wdt:P1031 wdt:P1094 wdt:P1278 }
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
