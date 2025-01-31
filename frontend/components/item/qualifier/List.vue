<template>
  <div>
    <item-qualifier-value
      v-for="(qualifier, index) in values"
      :claim="claim"
      :value="qualifier"
      :key="index + '-' + values.length"
      @delete-qualifier="deleteQualifier($event)"
    />
  </div>
</template>

<script>
export default {
  props: {
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
  methods: {
    deleteQualifier (data) {
      const findIndex = this.values.findIndex(item => item.hash === data.hash)

      if (findIndex !== -1) {
        this.values.splice(findIndex, 1)
      }

      if (!this.values.length) {
        this.$emit('delete-qualifier', data)
      }
    }
  },
  mounted () {
    this.values = [...this.qualifiers]
  }
}
</script>
