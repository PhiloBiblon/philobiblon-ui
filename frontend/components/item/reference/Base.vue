<template>
  <v-expansion-panels class="ma-2 pa-2 bg-gray none-z-index">
    <v-expansion-panel class="bg-gray">
      <v-expansion-panel-header class="bg-gray header">
        <p class="text-subtitle-2 mb-0">
          {{ header }}
        </p>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="bg-gray">
        <item-reference-list
          v-for="reference in references"
          :key="`${reference.hash}-${references.length}`"
          :claim="claim"
          :value="reference"
          @delete-reference="deleteReference($event)"
        />
        <item-reference-create
          v-if="isUserLogged"
          class="mt-5"
          :claim="claim"
          @create-reference="createReference($event)"
        />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  props: {
    claim: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      headers: [],
      references: []
    }
  },
  computed: {
    isUserLogged () {
      return this.$store.state.auth.isLogged
    },
    header () {
      return `${this.referenceCount} reference${this.referenceCount === 1 ? '' : 's'}`
    },
    referenceCount () {
      return Object.keys(this.references || {}).length
    }
  },
  mounted () {
    this.references = this.claim.references ?? []
  },
  methods: {
    createReference (reference) {
      this.references.push(reference)
    },
    deleteReference (data) {
      const findIndex = this.references.findIndex(item => item.hash === data.hash)

      if (findIndex !== -1) {
        this.references.splice(findIndex, 1)
      }
    }
  }
}
</script>

<style scoped>
.bg-gray {
  background-color: #ECEFF1;
}

.none-z-index {
  z-index: unset;
}

.header {
  padding: 0;
  align-items: center;
}

::v-deep .v-expansion-panel-content__wrap {
  padding: 0 8px 0 8px;
}
</style>
