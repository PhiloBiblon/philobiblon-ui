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
          text: this.$i18n.t('menu.item.search.item.geoid.label'),
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
          label: 'search.form.geoid.author.label',
          hint: 'search.form.geoid.author.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        title: {
          active: false,
          label: 'search.form.geoid.title.label',
          hint: 'search.form.geoid.title.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        incipit: {
          active: false,
          label: 'search.form.geoid.incipit.label',
          hint: 'search.form.geoid.incipit.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        explicit: {
          active: false,
          label: 'search.form.geoid.explicit.label',
          hint: 'search.form.geoid.explicit.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        associated_person: {
          active: false,
          label: 'search.form.geoid.associated_person.label',
          hint: 'search.form.common.personal_name.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        place_composition: {
          active: false,
          label: 'search.form.geoid.place_composition.label',
          hint: 'search.form.common.place.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        date_composition: {
          active: false,
          label: 'search.form.geoid.date_composition.label',
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
