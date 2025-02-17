<template>
  <v-btn
    small
    color="primary"
    class="mr-4"
    elevation="2"
    @click="proposeToAdmin"
    :disabled="propose?.approved"
  >
    {{ $t('common.propose_changes') }}
  </v-btn>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    propose () {
      return this.$store.getters['admin/getPropose']
    }
  },
  async mounted () {
    await this.getPropose()
  },
  methods: {
    async getPropose () {
      const payload = {
        params: {
          item_id: this.item.id,
          fingerprint: this.$fingerprint.localToken
        }
      }

      await this.$store.dispatch('admin/getPropose', payload)
    },
    async proposeToAdmin () {
      const payload = {
        item_id: this.item.id,
        fingerprint: this.$fingerprint.localToken
      }

      await this.$store.dispatch('admin/propose', payload).then((res) => {
        console.log(res)
      }).catch((err) => {
        this.$notification.error(err)
      })
    }
  }
}
</script>
