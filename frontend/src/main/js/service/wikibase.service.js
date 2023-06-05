import { QueryService } from '~/service/query.service'
import { OAuthService } from '~/service/oauth.service'

const PROPERTY_FORMATTER_URL = 'P236'
const PROPERTY_NOTES = 'P817'

const COMMONS_WIKIMEDIA_URL_ENDPOINT = 'https://en.wikipedia.org/w/api.php?action=query&titles=File:$file&prop=imageinfo&iiprop=url&format=json&origin=*'

const PBID_PATTERN = /(?<group>.*) (?<tableid>.*) (?<num>\d+)/
const QITEM_PATTERN = /^Q\d+/

export class WikibaseService {
  constructor (app, store) {
    const WBK = require('wikibase-sdk')
    this.$config = app.$config
    this.wbk = WBK({
      instance: this.$config.wikibaseApiUrl,
      sparqlEndpoint: this.$config.sparqlEndpoint
    })
    this.wbEdit = require('wikibase-edit')({
      instance: this.$config.apiBaseUrl
    })
    this.$store = store
    this.$query = new QueryService(store, this.$config)
    this.$oauth = new OAuthService(store, this.$config)
  }

  getWbk () {
    return this.wbk
  }

  getWbEdit () {
    return this.wbEdit
  }

  getPBIDPattern () {
    return PBID_PATTERN
  }

  getQItemPattern () {
    return QITEM_PATTERN
  }

  getEntity (id, lang) {
    const url = this.wbk.getEntities({
      ids: [id],
      language: [lang, 'en']
    })

    const entityHash = this.hashCode(`${id}-${lang}`)
    const entry = this.getResultsFromCache(entityHash)
    if (entry) {
      return new Promise((resolve, reject) => {
        return resolve(entry.value)
      })
    }

    return fetch(url)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then((data) => {
        const entity = data.entities[id]
        this.$store.commit('queryCache/addEntry', { key: entityHash, value: entity })
        return entity
      })
  }

  getEntityFromPBID (pbid) {
    return this.runSparqlQuery(this.$query.entityFromPBIDQuery(pbid), true)
      .then((results) => {
        if (results && results.length > 0) {
          return results[0]
        } else {
          return null
        }
      })
  }

  getWbValue (property, datatype, datavalue, lang) {
    if (datatype === 'external-id') {
      return this.getEntity(property, lang).then((entity) => {
        if (entity.claims && PROPERTY_FORMATTER_URL in entity.claims) {
          const url = entity.claims[PROPERTY_FORMATTER_URL][0].mainsnak.datavalue.value.replace('$1', datavalue)
          return { value: datavalue, url, type: 'external-id' }
        } else {
          return { value: datavalue, type: 'text' }
        }
      })
    } else if (datatype === 'wikibase-item') {
      return this.getEntity(datavalue.id, lang).then((entity) => {
        const text = this.getValueByLang(entity.labels)
        if (this.isEntityFromPB(entity)) {
          return {
            value: text,
            type: 'item',
            item: datavalue.id,
            pbid: this.getPBID(entity)
          }
        } else {
          return { value: text, type: 'text' }
        }
      })
    } else if (datatype === 'string') {
      return { value: datavalue, type: 'text' }
    } else if (datatype === 'monolingualtext') {
      return { value: datavalue.text, language: datavalue.language, type: 'text-lang' }
    } else if (datatype === 'time') {
      let isJulian = null
      if (datavalue.calendarmodel === 'http://www.wikidata.org/entity/Q1985727') {
        isJulian = false
      } else if (datavalue.calendarmodel === 'http://www.wikidata.org/entity/Q1985786') {
        isJulian = true
      }
      return { value: this.wbk.wikibaseTimeToSimpleDay(datavalue), calendar: (isJulian ? 'Julian' : 'Gregorian'), type: 'time' }
    } else if (datatype === 'commonsMedia') {
      return fetch(COMMONS_WIKIMEDIA_URL_ENDPOINT.replace('$file', datavalue))
        .then(response => response.json())
        .then((data) => {
          const imageinfo = data.query.pages[-1].imageinfo[0]
          return { descriptionurl: imageinfo.descriptionurl, url: imageinfo.url, type: 'image' }
        })
    } else if (datatype === 'url' && property === PROPERTY_NOTES) {
      const notesApiUrl = datavalue.replace('/wiki/', '/w/api.php?action=parse&page=') + '&prop=wikitext&formatversion=2&format=json&origin=*'
      return fetch(notesApiUrl)
        .then(response => response.json())
        .then((data) => { return { value: data.parse.wikitext, type: 'html' } })
    } else {
      return { value: datavalue, type: datatype }
    }
  }

  isEntityFromPB (entity) {
    const pbIdValue = this.getPBID(entity)
    if (pbIdValue) {
      if (pbIdValue.includes('insid') ||
        pbIdValue.includes('libid') ||
        pbIdValue.includes('manid') ||
        pbIdValue.includes('bioid') ||
        pbIdValue.includes('bibid') ||
        pbIdValue.includes('texid')
      ) {
        return true
      }
    }
    return false
  }

  getPBID (entity) {
    if (entity.claims.P476) {
      return entity.claims.P476[0].mainsnak.datavalue.value
    } else {
      return null
    }
  }

  getValueByLang (obj, lang) {
    if (obj[lang]) {
      return obj[lang].value
    } else if (obj.en) {
      return obj.en.value
    } else {
      return ''
    }
  }

  runSparqlQuery (query, minimize = false) {
    if (process.env.debug) {
      // eslint-disable-next-line no-console
      console.log(query)
    }

    const queryHash = this.hashCode(query)
    const entry = this.getResultsFromCache(queryHash)
    if (entry) {
      return new Promise((resolve, reject) => {
        return resolve(entry.value)
      })
    }

    const url = this.wbk.sparqlQuery(query)
    return fetch(url)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then(results => this.wbk.simplify.sparqlResults(results, { minimize }))
      .then((simplifiedResults) => {
        this.$store.commit('queryCache/addEntry', { key: queryHash, value: simplifiedResults })
        return simplifiedResults
      })
  }

  getResultsFromCache (hash) {
    const entry = this.$store.state.queryCache.cache[hash]
    if (entry) {
      if (process.env.debug) {
        // eslint-disable-next-line no-console
        console.log('cache hit')
      }
      return entry
    }
    return null
  }

  /**
  * Returns a hash code from a string
  * @param  {String} str The string to hash.
  * @return {Number}    A 32bit integer
  * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  */
  hashCode (str) {
    let hash = 0
    for (let i = 0, len = str.length; i < len; i++) {
      const chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 // Convert to 32bit integer
    }
    return hash
  }
}
