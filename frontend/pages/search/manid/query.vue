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
              SELECT (?textString AS ?label) ?textString ?item
              WHERE {
                ?item wdt:P476 ?pbid .
                FILTER CONTAINS(?pbid, " {{table}} ") .
                {
                  ?item rdfs:label ?textString .
                }
                UNION
                {
                  ?item skos:altLabel ?textString .
                }
              }
              ORDER BY LCASE(?textString)
              `,
              allowFreeText: true
            }
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P329 ?lib_item .
                    ?lib_item wdt:P47 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P329 ?lib_item .
                    ?lib_item wdt:P47 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P329 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P329 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?label {
                {
                  SELECT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P10 ?label . 
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?table_item
                  }
                } UNION {
                  SELECT ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P10 ?label .
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?table_item
                  }
                } UNION {
                  SELECT ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P30 ?label . 
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?table_item
                  }
                } UNION {
                  SELECT ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P30 ?label .
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?table_item
                  }
                }
              }
              ORDER BY ?label
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P47 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P241 ?item .
                    {{langFilter}}
                  }
                }
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P25 ?item .
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?property {
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P207 ?item .
                    {{langFilter}}
                  }
                }
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P67 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P229 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P229 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P703 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P703 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P5 ?label . 
                  }
                } UNION {
                  SELECT ?label ?cnum_item
                  WHERE { 
                    ?cnum_item wdt:P476 ?cnum_pbid .
                    FILTER regex(?cnum_pbid, '(.*) cnum ') .
                    ?cnum_item wdt:P8 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?cnum_item wdt:P5 ?label .
                  }
                }
              }
              ORDER BY ?label
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P2 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table wdt:P476 ?table_pbid .
                BIND ( wdt:P243 as ?property)
                ?table ?property ?item . 
                {{langFilter}}
                FILTER regex(?table_pbid, '(.*) {{table}} ')
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P480 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P480 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P93 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P800 ?label . 
                  }
                } UNION {
                  SELECT ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P800 ?label .
                  }
                }
              }
              ORDER BY ?label
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
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P704 ?label .
              }
              ORDER BY ?label
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P747 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P748 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P749 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P749 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label {
                {
                  SELECT ?item ?label
                  WHERE { 
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .
                    ?table_item wdt:P801 ?item . 
                    {{langFilter}}
                  }
                } UNION {
                  SELECT ?item ?label ?copid_item
                  WHERE { 
                    ?copid_item wdt:P476 ?copid_pbid .
                    FILTER regex(?copid_pbid, '(.*) copid ') .
                    ?copid_item wdt:P839 ?table_item .
                    ?table_item wdt:P476 ?table_pbid .
                    FILTER regex(?table_pbid, '(.*) {{table}} ') .      
                    ?copid_item wdt:P801 ?item .
                    {{langFilter}}
                  }
                }
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P778 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
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
              SELECT DISTINCT ?item ?label
              WHERE { 
                ?table_item wdt:P476 ?table_pbid .
                FILTER regex(?table_pbid, '(.*) {{table}} ') .
                ?table_item wdt:P790 ?item .
                {{langFilter}}
              }
              ORDER BY STR(?label)
              `
            }
          }
        }
      }
    }
  }
}
</script>
