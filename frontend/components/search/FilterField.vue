<template>
  <v-col
    v-if="(item.active && !item.permanent && item.visible)"
    cols="4"
  >
    <search-util-text-field
      v-if="item.type === 'text'"
      v-model="item.value"
      :label="$t(item.label)"
      :hint="$t(item.hint)"
      :disabled="item.disabled"
    />
    <search-util-autocomplete-field
      v-if="item.type === 'autocomplete'"
      :id="'auto-'+name"
      v-model="item.value"
      :label="$t(item.label)"
      :hint="$t(item.hint)"
      :disabled="item.disabled"
      :table="table"
      :autocomplete="item.autocomplete"
      @click.stop
    />
  </v-col>
</template>

<script>
export default {

  props: {
    table: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      default: null
    },
    formKey: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      item: {}
    }
  },

  created () {
    this.item = this.form[this.formKey]
  }
}
