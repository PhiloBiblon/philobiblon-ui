<template>
  <create-base
    :table="table"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script>
export default {
  data () {
    return {
      table: '',
      breadcrumb_items: []
    }
  },
  created () {
    this.table = this.$route.params.table
    this.breadcrumb_items = this.getBreadcrumbItems(this.table)
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
