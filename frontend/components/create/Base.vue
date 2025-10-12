<template>
  <div>
    <v-form v-if="showGroups" ref="search_form">
      <v-container>
        <v-row dense>
          <v-col cols="7">
            <v-radio-group
              v-model="database"
              row
            >
              <template #label>
                {{ $t('search.form.common.group.label') }}
              </template>
              <v-radio
                v-for="group in groups"
                :key="'g-'+group"
                class="group-option"
                :label="group"
                :value="group"
              />
            </v-radio-group>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <item-create
      :key="database"
      :table="table"
      :database="database"
    />
  </div>
</template>

<script>
export default {
  props: {
    table: {
      type: String,
      default: null
    },
    breadcrumbItems: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      database: 'BETA',
      showGroups: false,
      groups: [
        'BETA',
        'BITAGAP',
        'BITECA'
      ]
    }
  },
  watch: {
    '$route.query.database': {
      immediate: true,
      handler (val) {
        if (this.groups.includes(val)) {
          this.database = val
          this.showGroups = false
        } else {
          this.showGroups = true
        }
      }
    }
  },
  created () {
    this.$store.commit('breadcrumb/setItems', this.breadcrumbItems)
    this.$store.commit('breadcrumb/setClass', 'large-font-breadcrumb')
    this.$store.commit('breadcrumb/setDatabase', this.database)
    this.$store.commit('breadcrumb/setTable', this.table)
  },

  destroyed () {
    this.$store.commit('breadcrumb/setClass', '')
  }
}
</script>

<style scoped>
.group-option {
  padding-right: 30px;
}
</style>
