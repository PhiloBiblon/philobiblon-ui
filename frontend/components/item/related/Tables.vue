<template>
  <div>
    <item-related-table
      v-for="(item, index) in relatedTables[table]"
      :key="index"
      :item-id="itemId"
      :table="table"
      :related-table="item.refTable"
      :property="item.property"
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
          { refTable: 'cnum', property: 'P8' },
          { refTable: 'cnum', property: 'P750' },
          { refTable: 'bioid', property: 'P750' },
          { refTable: 'copid', property: 'P839' },
          { refTable: 'copid', property: 'P750' },
          { refTable: 'geoid', property: 'P740' },
          { refTable: 'insid', property: 'copid' },
          { refTable: 'manid', property: 'P750' },
          { refTable: 'texid', property: 'P750' }
        ],
        texid: [
          { refTable: 'cnum', property: 'P590' },
          { refTable: 'manid', property: 'P9' },
          { refTable: 'texid', property: 'P740' }
        ],
        bibid: [
          { refTable: 'cnum', property: 'P12' },
          { refTable: 'bibid', property: 'P12' },
          { refTable: 'bioid', property: 'P12' },
          { refTable: 'copid', property: 'P12' },
          { refTable: 'geoid', property: 'P12' },
          { refTable: 'insid', property: 'P12' },
          { refTable: 'libid', property: 'P12' },
          { refTable: 'manid', property: 'P12' },
          { refTable: 'subid', property: 'P12' },
          { refTable: 'texid', property: 'P12' }
        ],
        bioid: [
          { refTable: 'cnum', property: 'P21' },
          { refTable: 'cnum', property: 'P703' },
          { refTable: 'bibid', property: 'P703' },
          { refTable: 'bioid', property: 'P703' },
          { refTable: 'copid', property: 'P703' },
          { refTable: 'geoid', property: 'P703' },
          { refTable: 'insid', property: 'P703' },
          { refTable: 'libid', property: 'P703' },
          { refTable: 'manid', property: 'P703' },
          { refTable: 'texid', property: 'P703' }
        ],
        copid: [
          { refTable: 'copid', property: 'P750' },
        ],
        geoid: [
          
        ]
      }
    }
  }
}
</script>
