<template>
  <query-base
    table="texid"
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
          text: this.$i18n.t('menu.item.search.item.work.label'),
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
        author: {
          active: false,
          label: 'search.form.work.author.label',
          hint: 'search.form.work.author.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        title: {
          active: false,
          label: 'search.form.work.title.label',
          hint: 'search.form.work.title.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        incipit: {
          active: false,
          label: 'search.form.work.incipit.label',
          hint: 'search.form.work.incipit.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        explicit: {
          active: false,
          label: 'search.form.work.explicit.label',
          hint: 'search.form.work.explicit.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        associated_person: {
          active: false,
          label: 'search.form.work.associated_person.label',
          hint: 'search.form.common.personal_name.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        place_composition: {
          active: false,
          label: 'search.form.work.place_composition.label',
          hint: 'search.form.common.place.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        date_composition: {
          active: false,
          label: 'search.form.work.date_composition.label',
          hint: 'search.form.common.date.hint',
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

<style scoped>
.search {
  width: 100% !important
}
</style>
