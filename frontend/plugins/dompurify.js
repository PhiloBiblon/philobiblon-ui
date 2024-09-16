import DOMPurify from 'dompurify'

export default ({ app }, inject) => {
  inject('sanitize', (content) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'img', 'br', 'p', 'h1', 'ul', 'li', 'table', 'tbody', 'tr', 'td'],
      ALLOWED_ATTR: ['id', 'href', 'src', 'alt', 'class', 'name']
    })
  })
}
