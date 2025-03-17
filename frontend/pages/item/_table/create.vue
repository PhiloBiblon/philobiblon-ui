<template>
  <item-create
    v-if="table"
    :database="database"
    :table="table"
  />
</template>

<script>
export default {
  data () {
    return {
      table: ''
    }
  },
  mounted () {
    this.database = this.$route.query.database
    this.table = this.$route.params.table
    this.$store.commit('breadcrumb/setItems', this.getBreadcrumbItems(this.table))
  },
  methods: {
    getBreadcrumbItems (table) {
      return [
        {
          text: this.$i18n.t('common.create'),
          disabled: true
        },
        {
          text: this.$i18n.t('menu.item.search.item.' + table + '.label'),
          disabled: true
        },
        {
          text: this.$i18n.t('item.label'),
          disabled: true
        }
      ]
    }
  }
}
</script>
