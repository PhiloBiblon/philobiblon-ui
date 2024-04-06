<template>
  <search-base
    table="insid"
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
          text: this.$i18n.t('menu.item.search.item.insid.label'),
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
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        city: {
          active: true,
          label: 'search.form.insid.city.label',
          hint: 'search.form.insid.city.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false
        },
        institution_type: {
          active: true,
          label: 'search.form.insid.institution_type.label',
          hint: 'search.form.insid.institution_type.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false
        },
        institution: {
          active: true,
          label: 'search.form.insid.institution.label',
          hint: 'search.form.insid.institution.hint',
          type: 'autocomplete',
          value: '',
          visible: true,
          disabled: false
        },
        subject: {
          active: true,
          label: 'search.form.common.subject.label',
          hint: 'search.form.common.subject.hint',
          type: 'autocomplete',
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
