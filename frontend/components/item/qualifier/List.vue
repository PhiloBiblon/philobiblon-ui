<template>
  <div>
    <item-qualifier-value
      v-for="(qualifier, index) in values"
      :key="index + '-' + values.length"
      :database="database"
      :claim="claim"
      :value="qualifier"
      @delete-qualifier="deleteQualifier($event)"
    />
  </div>
</template>

<script>
export default {
  props: {
    database: {
      type: String,
      default: null
    },
    claim: {
      type: Object,
      default: null
    },
    qualifiers: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      values: []
    }
  },
  mounted () {
    this.values = [...this.qualifiers]
  },
  methods: {
    deleteQualifier (data) {
      const findIndex = this.values.findIndex(item => item.hash === data.hash)

      if (findIndex !== -1) {
        this.values.splice(findIndex, 1)
      }

      this.$emit('delete-qualifier', data)
    }
  }
}
</script>
