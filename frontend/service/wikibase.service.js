import { QueryService } from '~/service/query.service'
import { OAuthService } from '~/service/oauth.service'

const PROPERTY_FORMATTER_URL = 'P236'
const PROPERTY_NOTES = 'P817'

const COMMONS_WIKIMEDIA_URL_ENDPOINT =
  'https://en.wikipedia.org/w/api.php?action=query&titles=File:$file&prop=imageinfo&iiprop=url&format=json&origin=*'

const PBID_PATTERN = /(?<group>.*) (?<tableid>.*) (?<num>\d+)/
const QITEM_PATTERN = /^Q\d+/

const ORDER_PROPS_WIKI_PAGE = 'Ui_SortedProperties'

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
    this.$oauth = new OAuthService(store, app)
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

  // Transform wiki text to an object with first-level keys as statements and second-level keys as qualifiers
  transformSortedPropertiesWikiText (inputText) {
    const sections = inputText.split(/==== (.+?) ====/).filter(Boolean)

    const result = {}

    for (let i = 0; i < sections.length; i += 2) {
      const sectionName = sections[i].trim().toLowerCase()
      const sectionContent = sections[i + 1].trim()

      const properties = {}
      const lines = sectionContent.split('\n')

      let currentProperty = null
      let currentQualifiers = []

      for (const line of lines) {
        // to debug
        // console.log(line)
        if (line.startsWith('* ')) {
          if (currentProperty) {
            properties[currentProperty] = currentQualifiers
            currentQualifiers = []
          }

          const [, property, ...qualifiers] = line
            .match(/\* (\S+)(?::.*)?/)
            .filter(Boolean)

          currentProperty = property.trim()
          currentQualifiers = qualifiers.map(q => q.trim())
        } else if (line.startsWith(':: qualifier')) {
          const [, qualifier] = line.match(/:: qualifier (\S+)/)
          currentQualifiers.push(qualifier.trim())
        }
      }

      if (currentProperty) {
        properties[currentProperty] = currentQualifiers
      }

      result[sectionName] = properties
    }

    return result
  }

  async getClaimsOrder (table) {
    const url = `${this.$config.wikibaseApiUrl}?action=parse&page=${ORDER_PROPS_WIKI_PAGE}&prop=wikitext&formatversion=2&format=json&origin=*`
    const data = await this.wbFetcher(url)
    if (data.error) {
      return null
    } else {
      const fullOrder = this.transformSortedPropertiesWikiText(data.parse.wikitext)
      if (table in fullOrder) {
        return fullOrder[table]
      } else {
        return null
      }
    }
  }

  getEntity (id, lang) {
    const url = this.wbk.getEntities({
      ids: [id],
      language: [lang, 'en']
    })
    return this.wbFetcher(url)
      .then((data) => {
        return data.entities[id]
      })
  }

  wbFetcher (url) {
    const urlHash = this.hashCode(url)
    const entry = this.getResultsFromCache(urlHash)
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
        this.$store.commit('queryCache/addEntry', {
          key: urlHash,
          value: data
        })
        return data
      })
  }

  getEntityFromPBID (pbid) {
    return this.runSparqlQuery(
      this.$query.entityFromPBIDQuery(pbid),
      true
    ).then((results) => {
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
          const url = entity.claims[
            PROPERTY_FORMATTER_URL
          ][0].mainsnak.datavalue.value.replace('$1', datavalue)
          return { value: datavalue, url, type: 'external-id' }
        } else {
          return { value: datavalue, type: 'text' }
        }
      })
    } else if (datatype === 'wikibase-item') {
      return this.getEntity(datavalue.id, lang).then((entity) => {
        const label = this.getValueByLang(entity.labels, lang)
        if (this.isEntityFromPB(entity)) {
          return {
            property,
            value: label.value,
            language: label.language,
            type: 'entity',
            item: datavalue.id,
            pbid: this.getPBID(entity)
          }
        } else {
          return {
            property,
            value: label.value,
            language: label.language,
            type: 'entity',
            item: datavalue.id
          }
        }
      })
    } else if (datatype === 'string') {
      return { value: datavalue, type: 'text' }
    } else if (datatype === 'monolingualtext') {
      return {
        value: datavalue.text,
        language: datavalue.language,
        type: 'text-lang',
        showLanguage: true
      }
    } else if (datatype === 'time') {
      let isJulian = null
      if (
        datavalue.calendarmodel === 'http://www.wikidata.org/entity/Q1985727'
      ) {
        isJulian = false
      } else if (
        datavalue.calendarmodel === 'http://www.wikidata.org/entity/Q1985786'
      ) {
        isJulian = true
      }
      return {
        value: this.wbk.wikibaseTimeToSimpleDay(datavalue),
        calendar: isJulian ? 'Julian' : 'Gregorian',
        type: 'time'
      }
    } else if (datatype === 'commonsMedia') {
      return fetch(COMMONS_WIKIMEDIA_URL_ENDPOINT.replace('$file', datavalue))
        .then(response => response.json())
        .then((data) => {
          const imageinfo = data.query.pages[-1].imageinfo[0]
          return {
            descriptionurl: imageinfo.descriptionurl,
            url: imageinfo.url,
            type: 'image'
          }
        })
    } else if (datatype === 'url' && property === PROPERTY_NOTES) {
      const notesApiUrl =
        datavalue.replace('/wiki/', '/w/api.php?action=parse&page=') +
        '&prop=wikitext&formatversion=2&format=json&origin=*'
      return this.wbFetcher(notesApiUrl)
        .then((data) => {
          return { value: data.parse.wikitext, type: 'html' }
        })
    } else {
      return { value: datavalue, type: datatype }
    }
  }

  isEntityFromPB (entity) {
    const pbIdValue = this.getPBID(entity)
    if (pbIdValue) {
      if (
        pbIdValue.includes('insid') ||
        pbIdValue.includes('libid') ||
        pbIdValue.includes('manid') ||
        pbIdValue.includes('bioid') ||
        pbIdValue.includes('bibid') ||
        pbIdValue.includes('texid') ||
        pbIdValue.includes('geoid') ||
        pbIdValue.includes('cnum')
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
      return {
        value: obj[lang].value,
        language: lang
      }
    } else if (obj.en) {
      return {
        value: obj.en.value,
        language: 'en'
      }
    } else if (obj.es) {
      return {
        value: obj.es.value,
        language: 'es'
      }
    } else if (Object.keys(obj).length > 0) {
      const defaultLang = Object.keys(obj)[0]
      return {
        value: obj[defaultLang].value,
        language: defaultLang
      }
    } else {
      return {
        value: '',
        language: lang
      }
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

    const [url, sparql] = this.wbk.sparqlQuery(query).split('?')

    const options = {
      method: 'POST',
      body: sparql,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }

    return fetch(url, options)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then(results => this.wbk.simplify.sparqlResults(results, { minimize }))
      .then((simplifiedResults) => {
        this.$store.commit('queryCache/addEntry', {
          key: queryHash,
          value: simplifiedResults
        })
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

  async searchEntityByName (search, language, uselang) {
    try {
      const searchOptions = {
        search,
        uselang,
        language
      }

      const url = await this.getWbk().searchEntities(searchOptions)

      const response = await fetch(url)
      const result = await response.json()

      return result.search
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during search:', error)
    }
  }
}
