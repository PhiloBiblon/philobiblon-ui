/**
 * Search form definition for the texid table.
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
                UNION
                {
                  ?item wdt:P11 ?label .
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
            label: 'search.form.texid.author.label',
            hint: 'search.form.texid.author.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?analytic_item ?label ?desc ?lang ?db {
                {
                  {
                    SELECT DISTINCT ?target_item ?db {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?item wdt:P21 ?target_item .
                    }
                  }
                  {{targetItemLangGroupPattern}}
                }
                UNION
                {
                  {  
                    SELECT DISTINCT ?analytic_item ?db {
                      ?analytic_item wdt:P476 ?analytic_item_pbid .
                      FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                      ?analytic_item wdt:P590 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?analytic_item wdt:P34 ?labelObj
                    }
                  }
                  OPTIONAL {
                    ?analytic_item wdt:P34 ?labelObj  
                    {{langFilter}}
                  }
                  {{analyticItemDescLangFilter}}
                }
              }
              `
            }
          },
          title: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.title.label',
            hint: 'search.form.texid.title.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?db {
                {
                  ?item wdt:P476 ?table_item_pbid .
                  FILTER regex(?table_item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?table_item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?item wdt:P11 ?label .
                } UNION {
                  ?analytic_item wdt:P476 ?analytic_pbid .
                  FILTER regex(?analytic_pbid, '(.*) cnum ') .
                  ?analytic_item wdt:P590 ?item .
                  ?item wdt:P476 ?item_pbid .
                  FILTER regex(?item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?analytic_item wdt:P11 ?label
                }
              }
              `
            }
          },
          incipit: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.incipit.label',
            hint: 'search.form.texid.incipit.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?db {
                {
                  ?item wdt:P476 ?pbid .
                  FILTER regex(?pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?item p:P543 ?statement .
                  ?statement pq:P70 ?label
                } UNION {
                  ?analytic_item wdt:P476 ?analytic_pbid .
                  FILTER regex(?analytic_pbid, '(.*) cnum ') .
                  ?analytic_item wdt:P590 ?item .
                  ?item wdt:P476 ?item_pbid .
                  FILTER regex(?item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?analytic_item p:P543 ?statement .
                  ?statement pq:P70 ?label
                }
              }
              `
            }
          },
          explicit: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.explicit.label',
            hint: 'search.form.texid.explicit.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?db {
                {
                  ?item wdt:P476 ?pbid .
                  FILTER regex(?pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?item p:P543 ?statement .
                  ?statement pq:P602 ?label
                } UNION {
                  ?analytic_item wdt:P476 ?analytic_pbid .
                  FILTER regex(?analytic_pbid, '(.*) cnum ') .
                  ?analytic_item wdt:P590 ?item .
                  ?item wdt:P476 ?item_pbid .
                  FILTER regex(?item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?analytic_item p:P543 ?statement .
                  ?statement pq:P602 ?label
                }
              }
              `
            }
          },
          associated_person: {
            active: true,
            section: 'primary',
            label: 'search.form.texid.associated_person.label',
            hint: 'search.form.common.personal_name.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db {
                {
                  SELECT ?target_item ?label ?db {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?item wdt:P703 ?target_item .
                    }
                    UNION
                    {
                      ?analytic_item wdt:P476 ?analytic_item_pbid .
                      FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                      ?analytic_item wdt:P590 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?analytic_item wdt:P703 ?target_item .
                    }
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
            label: 'search.form.texid.place_composition.label',
            hint: 'search.form.common.place.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?lang ?db {
                {
                  SELECT DISTINCT ?target_item ?db WHERE {
                    ?item wdt:P476 ?pbid .
                    FILTER regex(?pbid, '{{database}} {{table}} ') .
                    BIND(STRBEFORE(?pbid, ' ') AS ?db) .
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
            label: 'search.form.texid.date_composition.label',
            hint: 'search.form.texid.date_composition.hint',
            type: 'date',
            value: {},
            visible: true,
            disabled: false
          },
          type: {
            active: true,
            section: 'advanced',
            label: 'search.form.texid.type.label',
            hint: 'search.form.texid.type.hint',
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
            label: 'search.form.texid.language.label',
            hint: 'search.form.texid.language.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?target_item ?label ?desc ?lang ?db {
                {
                  SELECT DISTINCT ?target_item ?db {
                    {
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?item wdt:P18 ?target_item .
                    }
                    UNION
                    {
                      ?analytic_item wdt:P476 ?analytic_pbid .
                      FILTER regex(?analytic_pbid, '(.*) cnum ') .
                      ?analytic_item wdt:P590 ?item .
                      ?item wdt:P476 ?pbid .
                      FILTER regex(?pbid, '{{database}} {{table}} ') .
                      BIND(STRBEFORE(?pbid, ' ') AS ?db) .
                      {{bitagapGroupFilter}}
                      ?analytic_item wdt:P18 ?target_item .
                    }
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
            label: 'search.form.texid.poetic_form.label',
            hint: 'search.form.texid.poetic_form.hint',
            type: 'autocomplete',
            value: {},
            visible: true,
            disabled: false,
            autocomplete: {
              query:
              `
              SELECT DISTINCT ?label ?db {
                {
                  ?item wdt:P476 ?item_pbid .
                  FILTER regex(?item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?item wdt:P781 ?label
                } UNION {
                  ?analytic_item wdt:P476 ?analytic_item_pbid .
                  FILTER regex(?analytic_item_pbid, '(.*) cnum ') .
                  ?analytic_item wdt:P590 ?item .
                  ?item wdt:P476 ?item_pbid .
                  FILTER regex(?item_pbid, '{{database}} {{table}} ') .
                  BIND(STRBEFORE(?item_pbid, ' ') AS ?db) .
                  {{bitagapGroupFilter}}
                  ?analytic_item wdt:P781 ?label
                }
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
