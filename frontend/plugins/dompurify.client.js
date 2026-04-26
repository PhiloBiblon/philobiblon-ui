import DOMPurify from 'dompurify'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      sanitize: content => DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'img', 'br', 'p', 'h1', 'h2', 'ul', 'li', 'table', 'tbody', 'tr', 'td', 'blockquote'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style']
      })
    }
  }
})
