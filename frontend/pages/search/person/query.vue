<template>
  <query-base
    table="bioid"
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
          text: this.$i18n.t('menu.item.search.item.person.label'),
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
        name: {
          active: false,
          label: 'search.form.person.name.label',
          hint: 'search.form.common.personal_name.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        title: {
          active: false,
          label: 'search.form.person.title.label',
          hint: 'search.form.person.title.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        date: {
          active: false,
          label: 'search.form.person.date.label',
          hint: 'search.form.person.date.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        associated_place: {
          active: false,
          label: 'search.form.person.associated_place.label',
          hint: 'search.form.person.associated_place.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        profession: {
          active: false,
          label: 'search.form.person.profession.label',
          hint: 'search.form.person.profession.hint',
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
