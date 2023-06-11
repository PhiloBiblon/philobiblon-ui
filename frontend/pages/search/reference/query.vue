<template>
  <query-base
    table="bibid"
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
          text: this.$i18n.t('menu.item.search.item.reference.label'),
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
          label: 'search.form.reference.author.label',
          hint: 'search.form.reference.author.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        title: {
          active: false,
          label: 'search.form.reference.title.label',
          hint: 'search.form.reference.title.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        date: {
          active: false,
          label: 'search.form.reference.date.label',
          hint: 'search.form.reference.date.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        volume: {
          active: false,
          label: 'search.form.reference.volume.label',
          hint: 'search.form.reference.volume.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        place_publication: {
          active: false,
          label: 'search.form.reference.place_publication.label',
          hint: 'search.form.reference.place_publication.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        publisher: {
          active: false,
          label: 'search.form.reference.publisher.label',
          hint: 'search.form.reference.publisher.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        series: {
          active: false,
          label: 'search.form.reference.series.label',
          hint: 'search.form.reference.series.hint',
          type: 'text',
          value: '',
          visible: true,
          disabled: false
        },
        associated_person: {
          active: false,
          label: 'search.form.reference.associated_person.label',
          hint: 'search.form.reference.associated_person.hint',
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
