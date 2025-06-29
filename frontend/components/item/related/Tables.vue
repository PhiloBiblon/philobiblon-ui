<template>
  <div>
    <item-related-table
      v-for="(refs, index) in relatedTables[table]"
      :key="index"
      :item-id="itemId"
      :table="table"
      :references="refs"
    />
  </div>
</template>

<script>
export default {
  props: {
    itemId: {
      type: String,
      default: null
    },
    table: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      relatedTables: {
        manid: [
          {
            label: 'item.related.manid.related_ms_ed',
            refTables: [
              { refTable: 'bioid', property: 'P750' },
              { refTable: 'cnum', property: 'P750' },
              { refTable: 'copid', property: 'P750' },
              { refTable: 'geoid', property: 'P740' },
              { refTable: 'insid', property: 'P750' },
              { refTable: 'manid', property: 'P750' },
              { refTable: 'texid', property: 'P750' }
            ]
          },
          {
            label: 'item.related.manid.manuscript_edition',
            refTables: [
              { refTable: 'cnum', property: 'P8' }
            ]
          },
          {
            label: 'item.related.manid.text',
            refTables: [
              { refTable: 'copid', property: 'P839' }
            ]
          }
        ],
        texid: [
          {
            label: 'item.related.texid.uniform_title',
            refTables: [
              { refTable: 'cnum', property: 'P590' }
            ]
          },
          {
            label: 'item.related.texid.related_uniform_titles',
            refTables: [
              { refTable: 'manid', property: 'P9' },
              { refTable: 'texid', property: 'P740' },
              { refTable: 'cnum', property: 'P740' }
            ]
          }
        ],
        bibid: [
          {
            label: 'item.related.bibid.related_bibliography',
            refTables: [
              { refTable: 'bibid', property: 'P12' },
              { refTable: 'bioid', property: 'P12' },
              { refTable: 'cnum', property: 'P12' },
              { refTable: 'copid', property: 'P12' },
              { refTable: 'geoid', property: 'P12' },
              { refTable: 'insid', property: 'P12' },
              { refTable: 'libid', property: 'P12' },
              { refTable: 'manid', property: 'P12' },
              { refTable: 'subid', property: 'P12' },
              { refTable: 'texid', property: 'P12' }
            ]
          }
        ],
        bioid: [
          {
            label: 'item.related.bioid.subject_references',
            refTables: [
              { refTable: 'bibid', property: 'P243' },
              { refTable: 'bioid', property: 'P243' },
              { refTable: 'copid', property: 'P243' },
              { refTable: 'copid', property: 'P243' },
              { refTable: 'geoid', property: 'P243' },
              { refTable: 'geoid', property: 'P243' },
              { refTable: 'insid', property: 'P243' },
              { refTable: 'libid', property: 'P243' },
              { refTable: 'manid', property: 'P243' },
              { refTable: 'texid', property: 'P243' }
            ]
          },
          {
            label: 'item.related.bioid.authors',
            refTables: [
              { refTable: 'texid', property: 'P21' }
            ]
          },
          {
            label: 'item.related.bioid.commentary',
            refTables: [
              { refTable: 'cnum', property: 'P11', qualifier: 'P21' }
            ]
          },
          {
            label: 'item.related.bioid.financed_by',
            refTables: [
              { refTable: 'manid', property: 'P67' }
            ]
          },
          {
            label: 'item.related.bioid.former_owners',
            refTables: [
              { refTable: 'copid', property: 'P229' },
              { refTable: 'copid', property: 'P229', qualifier: 'P703' }
            ]
          },
          {
            label: 'item.related.bioid.handwritten_by',
            refTables: [
              { refTable: 'manid', property: 'P25' }
            ]
          },
          {
            label: 'item.related.bioid.milestones',
            refTables: [
              { refTable: 'manid', property: 'P536', qualifier: 'P25' },
              { refTable: 'manid', property: 'P222', qualifier: 'P207' }
            ]
          },
          {
            label: 'item.related.bioid.owner',
            refTables: [
              { refTable: 'manid', property: 'P229' }
            ]
          },
          {
            label: 'item.related.bioid.printed_by',
            refTables: [
              { refTable: 'manid', property: 'P207' }
            ]
          },
          {
            label: 'item.related.bioid.related_individuals',
            refTables: [
              { refTable: 'bioid', property: 'P703' },
              { refTable: 'cnum', property: 'P703' },
              { refTable: 'copid', property: 'P703' },
              { refTable: 'manid', property: 'P703' },
              { refTable: 'texid', property: 'P703' }
            ]
          },
          {
            label: 'item.related.bioid.translator',
            refTables: [
              { refTable: 'texid', property: 'P24' }
            ]
          }
        ],
        copid: [
          {
            label: 'item.related.copid.related_copies',
            refTables: [
              { refTable: 'copid', property: 'P750' }
            ]
          }
        ],
        geoid: [
          {
            label: 'item.related.geoid.career_statement',
            refTables: [
              { refTable: 'bioid', property: 'P165', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.first_known_date',
            refTables: [
              { refTable: 'bioid', property: 'P291', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.former_owners',
            refTables: [
              { refTable: 'copid', property: 'P229', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.from_place',
            refTables: [
              { refTable: 'bioid', property: 'P295', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.history',
            refTables: [
              { refTable: 'copid', property: 'P137', qualifier: 'P47' },
              { refTable: 'manid', property: 'P137', qualifier: 'P47' },
              { refTable: 'texid', property: 'P137', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.itinerary',
            refTables: [
              { refTable: 'bioid', property: 'P296', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.last_known_date',
            refTables: [
              { refTable: 'bioid', property: 'P292', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.location',
            refTables: [
              { refTable: 'manid', property: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.milestones',
            refTables: [
              { refTable: 'bioid', property: 'P137', qualifier: 'P47' },
              { refTable: 'insid', property: 'P137', qualifier: 'P47' },
              { refTable: 'manid', property: 'P536', qualifier: 'P47' },
              { refTable: 'manid', property: 'P222', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.owner',
            refTables: [
              { refTable: 'manid', property: 'P229', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.place_of_birth',
            refTables: [
              { refTable: 'bioid', property: 'P82', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.place_of_death',
            refTables: [
              { refTable: 'bioid', property: 'P168', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.place_of_publication',
            refTables: [
              { refTable: 'manid', property: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.related_places',
            refTables: [
              { refTable: 'geoid', property: 'P297' },
              { refTable: 'geoid', property: 'P493' },
              { refTable: 'insid', property: 'P297', qualifier: 'P47' },
              { refTable: 'libid', property: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.religious_background',
            refTables: [
              { refTable: 'bioid', property: 'P172', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.religious_order',
            refTables: [
              { refTable: 'bioid', property: 'P746', qualifier: 'P47' }
            ]
          },
          {
            label: 'item.related.geoid.subject_references',
            refTables: [
              { refTable: 'bibid', property: 'P243' },
              { refTable: 'bioid', property: 'P243' },
              { refTable: 'copid', property: 'P243' },
              { refTable: 'geoid', property: 'P243' },
              { refTable: 'insid', property: 'P243' },
              { refTable: 'libid', property: 'P243' },
              { refTable: 'manid', property: 'P243' },
              { refTable: 'texid', property: 'P243' }
            ]
          }
        ],
        insid: [
          {
            label: 'item.related.insid.authors',
            refTables: [
              { refTable: 'texid', property: 'P232' }
            ]
          },
          {
            label: 'item.related.insid.financed_by',
            refTables: [
              { refTable: 'manid', property: 'P67' }
            ]
          },
          {
            label: 'item.related.insid.former_owners',
            refTables: [
              { refTable: 'copid', property: 'P229', qualifier: 'P232' }
            ]
          },
          {
            label: 'item.related.insid.handwritten_by',
            refTables: [
              { refTable: 'manid', property: 'P25' }
            ]
          },
          {
            label: 'item.related.insid.milestones',
            refTables: [
              { refTable: 'manid', property: 'P536', qualifier: 'P25' },
              { refTable: 'manid', property: 'P222', qualifier: 'P207' }
            ]
          },
          {
            label: 'item.related.insid.owner',
            refTables: [
              { refTable: 'manid', property: 'P229' }
            ]
          },
          {
            label: 'item.related.insid.printed_by',
            refTables: [
              { refTable: 'manid', property: 'P207' }
            ]
          },
          {
            label: 'item.related.insid.related_institutions',
            refTables: [
              { refTable: 'bioid', property: 'P232' },
              { refTable: 'insid', property: 'P232' },
              { refTable: 'libid', property: 'P232' }
            ]
          },
          {
            label: 'item.related.insid.subject_references',
            refTables: [
              { refTable: 'bibid', property: 'P243' },
              { refTable: 'bioid', property: 'P243' },
              { refTable: 'copid', property: 'P243' },
              { refTable: 'geoid', property: 'P243' },
              { refTable: 'insid', property: 'P243' },
              { refTable: 'libid', property: 'P243' },
              { refTable: 'manid', property: 'P243' },
              { refTable: 'texid', property: 'P243' }
            ]
          }
        ],
        libid: [
          {
            label: 'item.related.libid.related_libraries',
            refTables: [
              { refTable: 'bibid', property: 'P329' }
            ]
          },
          {
            label: 'item.related.libid.present_holding',
            refTables: [
              { refTable: 'manid', property: 'P329' }
            ]
          }
        ],
        subid: [
          {
            label: 'item.related.subid.subject_references',
            refTables: [
              { refTable: 'bibid', property: 'P243' },
              { refTable: 'bioid', property: 'P243' },
              { refTable: 'cnum', property: 'P243' },
              { refTable: 'insid', property: 'P243' },
              { refTable: 'libid', property: 'P243' },
              { refTable: 'manid', property: 'P243' },
              { refTable: 'texid', property: 'P243' }
            ]
          }
        ]
      }
    }
  }
}
</script>
