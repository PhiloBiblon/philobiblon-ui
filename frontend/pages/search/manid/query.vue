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
        group: {
          permanent: true,
          value: 'ALL',
          disabled: false
        },
        simple_search: {
          active: true,
          primary: true,
          label: 'search.form.common.simple_search.label',
          hint: 'search.form.common.simple_search.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        city: {
          active: true,
          primary: true,
          label: 'search.form.msed.city.label',
          hint: 'search.form.msed.city.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        library: {
          active: true,
          primary: true,
          label: 'search.form.msed.library.label',
          hint: 'search.form.msed.library.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        title: {
          active: true,
          primary: false,
          label: 'search.form.msed.title.label',
          hint: 'search.form.msed.title.hint',
          type: 'autocomplete',
          value: '',
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
        call_number: {
          active: true,
          primary: true,
          label: 'search.form.msed.call_number.label',
          hint: 'search.form.msed.call_number.hint',
          type: 'autocomplete',
          value: '',
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
        date: {
          active: true,
          primary: true,
          label: 'search.form.msed.date.label',
          hint: 'search.form.msed.date.hint',
          type: 'date',
          value: {},
          visible: true,
          disabled: false
        },
        place_production: {
          active: true,
          primary: true,
          label: 'search.form.msed.place_production.label',
          hint: 'search.form.msed.place_production.hint',
          type: 'autocomplete',
          value: '',
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
                  ?table_item p:P442 ?type_of_event .
                  ?type_of_event ?property ?item .
                  BIND(pq:P47 as ?property)
                  {{langFilter}}
                }
              } UNION {
                SELECT ?item ?label ?property {
                  ?table_item wdt:P476 ?table_pbid .
                  FILTER regex(?table_pbid, '(.*) {{table}} ') .
                  ?table_item p:P442 ?type_of_event .
                  ?type_of_event ?property ?item .
                  BIND(pq:P241 as ?property)
                  {{langFilter}}
                }
              }
            }
            `
          }
        },
        scribe_printer: {
          active: true,
          primary: true,
          label: 'search.form.msed.scribe_printer.label',
          hint: 'search.form.msed.scribe_printer.hint',
          type: 'autocomplete',
          value: '',
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
                  ?table_item p:P442 ?type_of_event .
                  ?type_of_event ?property ?item .
                  BIND(pq:P25 as ?property)
                  {{langFilter}}
                }
              } UNION {
                SELECT ?item ?label ?property {
                  ?table_item wdt:P476 ?table_pbid .
                  FILTER regex(?table_pbid, '(.*) {{table}} ') .
                  ?table_item p:P442 ?type_of_event .
                  ?type_of_event ?property ?item .
                  BIND(pq:P207 as ?property)
                  {{langFilter}}
                }
              }
            }
            `
          }
        },
        publisher_patron: {
          active: true,
          primary: true,
          label: 'search.form.msed.publisher_patron.label',
          hint: 'search.form.msed.publisher_patron.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        previous_owner: {
          active: true,
          primary: true,
          label: 'search.form.msed.previous_owner.label',
          hint: 'search.form.msed.previous_owner.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
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
            ORDER BY ?label
            `
          }
        },
        associated_person: {
          active: true,
          primary: true,
          label: 'search.form.msed.associated_person.label',
          hint: 'search.form.msed.associated_person.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
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
            ORDER BY ?label
            `
          }
        },
        type: {
          active: true,
          primary: false,
          label: 'search.form.msed.type.label',
          hint: 'search.form.msed.type.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        writing_surface: {
          active: true,
          primary: false,
          label: 'search.form.msed.writing_surface.label',
          hint: 'search.form.msed.writing_surface.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
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
            ORDER BY ?label
            `
          }
        },
        format: {
          active: true,
          primary: false,
          label: 'search.form.msed.format.label',
          hint: 'search.form.msed.format.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        binding: {
          active: true,
          primary: false,
          label: 'search.form.msed.binding.label',
          hint: 'search.form.msed.binding.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
              {
                SELECT ?item ?label
                WHERE { 
                  ?table_item wdt:P476 ?table_pbid .
                  FILTER regex(?table_pbid, '(.*) {{table}} ') .
                  ?table_item wdt:P800 ?item . 
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
                  ?copid_item wdt:P800 ?item .
                  {{langFilter}}
                }
              }
            }
            ORDER BY ?label
            `
          }
        },
        collation: {
          active: true,
          primary: false,
          label: 'search.form.msed.collation.label',
          hint: 'search.form.msed.collation.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?item ?label
            WHERE { 
              ?table_item wdt:P476 ?table_pbid .
              FILTER regex(?table_pbid, '(.*) {{table}} ') .
              ?table_item wdt:P704 ?item .
              {{langFilter}}
            }
            ORDER BY ?label
            `
          }
        },
        hand: {
          active: true,
          primary: false,
          label: 'search.form.msed.hand.label',
          hint: 'search.form.msed.hand.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        font: {
          active: true,
          primary: false,
          label: 'search.form.msed.font.label',
          hint: 'search.form.msed.font.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        watermark: {
          active: true,
          primary: false,
          label: 'search.form.msed.watermark.label',
          hint: 'search.form.msed.watermark.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
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
            ORDER BY ?label
            `
          }
        },
        graphic_feature: {
          active: true,
          primary: false,
          label: 'search.form.msed.graphic_feature.label',
          hint: 'search.form.msed.graphic_feature.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT ?label {
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
            ORDER BY ?label
            `
          }
        },
        physical_feature: {
          active: true,
          primary: false,
          label: 'search.form.msed.physical_feature.label',
          hint: 'search.form.msed.physical_feature.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        music: {
          active: true,
          primary: false,
          label: 'search.form.msed.music.label',
          hint: 'search.form.msed.music.hint',
          type: 'autocomplete',
          value: '',
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
            ORDER BY ?label
            `
          }
        },
        subject: {
          active: false,
          primary: false,
          label: 'search.form.common.subject.label',
          hint: 'search.form.common.subject.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false,
          autocomplete: {
            query:
            `
            SELECT DISTINCT * {
              {
                    SELECT ?item ?label ?property
                    WHERE { 
                      ?table wdt:P476 ?table_pbid .
                      ?table ?property ?item . 
                      ?item wdt:P476 ?subject_pbid .
                      # {{langFilter}}
                      FILTER regex(?subject_pbid, '(.*) subid ')
                      FILTER regex(?table_pbid, '(.*) {{table}} ')
                      BIND ( wdt:P422 as ?property)
                    }
              } UNION {
                    SELECT ?item ?label ?property
                    WHERE { 
                      ?table wdt:P476 ?table_pbid .
                      ?table ?property ?item . 
                      ?item wdt:P476 ?subject_pbid .
                      # {{langFilter}}
                      FILTER regex(?subject_pbid, '(.*) insid ')
                      FILTER regex(?table_pbid, '(.*) {{table}} ')
                      BIND ( wdt:P232 as ?property)
                    }
              } UNION {
                    SELECT ?item ?label ?property
                    WHERE { 
                      ?table wdt:P476 ?table_pbid .
                      ?table ?property ?item . 
                      ?item wdt:P476 ?subject_pbid .
                      # {{langFilter}}
                      FILTER regex(?subject_pbid, '(.*) bioid ')
                      FILTER regex(?table_pbid, '(.*) {{table}} ')
                      BIND ( wdt:P703 as ?property)
                    }
              } UNION {
                    SELECT ?item ?label ?property
                    WHERE { 
                      ?table wdt:P476 ?table_pbid .
                      ?table ?property ?item . 
                      ?item wdt:P476 ?geo_pbid .
                      # {{langFilter}}
                      FILTER regex(?geo_pbid, '(.*) geoid ')
                      FILTER regex(?table_pbid, '(.*) {{table}} ')
                      BIND ( wdt:P47 as ?property)
                    }
              }
            }
            ORDER BY ?label
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
</script>
