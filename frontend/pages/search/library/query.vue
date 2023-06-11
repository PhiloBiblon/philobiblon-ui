<template>
  <query-base
    table="libid"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script>
export default {
  data () {
    return {
      breadcrumb_items: [
        {
          text: this.$i18n.t('menu.item.search.label'),
          disabled: true
        },
        {
          text: this.$i18n.t('menu.item.search.item.library.label'),
          disabled: true
        }
      ],
      form: {
        group: {
          permanent: true,
          value: 'ALL',
          disabled: false
        },
        simple_search: {
          active: true,
          label: 'search.form.common.simple_search.label',
          hint: 'search.form.common.simple_search.hint',
          value: '',
          type: 'text',
          visible: true,
          disabled: false
        },
        city: {
          active: false,
          label: 'search.form.library.city.label',
          hint: 'search.form.library.city.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        library: {
          active: false,
          label: 'search.form.library.library.label',
          hint: 'search.form.library.library.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        shelfmark: {
          active: false,
          label: 'search.form.library.shelfmark.label',
          hint: 'search.form.library.shelfmark.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        subject: {
          active: false,
          label: 'search.form.common.subject.label',
          hint: 'search.form.common.subject.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        search_type: {
          permanent: true,
          value: true,
          disabled: false
        }
      }
    }
  }
}
</script>
