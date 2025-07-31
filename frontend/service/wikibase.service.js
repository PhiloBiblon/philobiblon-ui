import { QueryService } from '~/service/query.service'
import { OAuthService } from '~/service/oauth.service'

export class WikibaseService {
  static PROPERTY_PBID = 'P476'
  static PROPERTY_FORMATTER_URL = 'P236'
  static PROPERTY_NOTES = 'P817'
  static COMMONS_WIKIMEDIA_URL_ENDPOINT =
    'https://en.wikipedia.org/w/api.php?action=query&titles=File:$file&prop=imageinfo&iiprop=url&format=json&origin=*'

  static PBID_PATTERN = /(?<group>.*) (?<tableid>.*) (?<num>\d+)/
  static QITEM_PATTERN = /^Q\d+/
  static PITEM_PATTERN = /^P\d+/

  static ORDER_PROPS_WIKI_PAGE = 'Ui_SortedProperties'
  static ORDER_PROPS_WIKI_PAGE_FOR_NEW_ITEM = 'Ui_SortedProperties_NewItem'

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
    this.$notification = app.$notification
    this.$i18n = app.i18n
    this.sparqlBackendEndpoint = this.joinUrl(this.$config.apiBaseUrl, 'api/sparql/query')
  }

  getWbk () {
    return this.wbk
  }

  getWbEdit () {
    return this.wbEdit
  }

  getPBIDPattern () {
    return this.constructor.PBID_PATTERN
  }

  getQItemPattern () {
    return this.constructor.QITEM_PATTERN
  }

  getPItemPattern () {
    return this.constructor.PITEM_PATTERN
  }

  getQItemUrl (itemId) {
    return this.$config.wikibaseBaseUrl + '/wiki/Item:' + itemId
  }

  // Transform wiki text to an object with first-level keys as statements and second-level keys as qualifiers
  transformSortedPropertiesWikiText (inputText) {
    const result = {}

    try {
      const sections = inputText.split(/====(.+?)====/).filter(Boolean)

      for (let i = 0; i < sections.length; i += 2) {
        const sectionName = sections[i].trim().toLowerCase().split(' ')[0]
        const sectionContent = sections[i + 1].trim()

        const properties = {}
        const lines = sectionContent.split('\n')

        let currentProperty = null

        for (const line of lines) {
          try {
            if (line.startsWith('*')) {
              const [, property] = line.match(/\* ?(\S+)/)
              currentProperty = property.trim()
              if (this.getPItemPattern().test(currentProperty)) {
                if (!(currentProperty in properties)) {
                  properties[currentProperty] = []
                }
              } else {
                // eslint-disable-next-line no-console
                console.error(`Invalid property ${currentProperty} in section ${sectionName}: ${line}`)
                currentProperty = null
              }
            } else if (/^:: ?qualifier/.test(line)) {
              let [, qualifier] = line.match(/:: ?qualifier (\S+)/)
              qualifier = qualifier.trim()
              if (this.getPItemPattern().test(qualifier)) {
                if (currentProperty && !properties[currentProperty].includes(qualifier)) {
                  properties[currentProperty].push(qualifier)
                }
              } else {
                // eslint-disable-next-line no-console
                console.error(`Invalid qualifier ${qualifier} for property ${currentProperty} in section ${sectionName}: ${line}`)
              }
            } else {
              // eslint-disable-next-line no-console
              console.warn(`Ignored line: ${line}`)
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error in line '${line}': ${error}`)
          }
        }

        result[sectionName] = properties
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }

    if (process.env.debug) {
      // eslint-disable-next-line no-console
      console.log(result)
    }

    return result
  }

  async getClaimsOrderForNewItem (table) {
    return this.getClaimsOrder(table, true)
  }

  async getClaimsOrder (table, new_item=false) {
    const pageName = new_item ? this.constructor.ORDER_PROPS_WIKI_PAGE_FOR_NEW_ITEM : this.constructor.ORDER_PROPS_WIKI_PAGE
    const url = `${this.$config.wikibaseApiUrl}?action=parse&page=${pageName}&prop=wikitext&formatversion=2&format=json&origin=*`
    const data = await this.wbFetcher(url)
    if (data.error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching ui sorted page: ${data.error}`)
      return null
    } else {
      const fullOrder = this.transformSortedPropertiesWikiText(data.parse.wikitext)
      if (table in fullOrder) {
        return fullOrder[table]
      } else {
        // eslint-disable-next-line no-console
        console.error(`Table ${table} not found in ui sorted page.`)
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

  getEntities (ids, lang) {
    const url = this.wbk.getEntities({
      ids,
      language: [lang, 'en']
    })
    return this.wbFetcher(url)
      .then((data) => {
        return data.entities
      })
  }

  getEntityLabel (id, lang) {
    const cachedValue = this.$store.state.itemCache.cache[this.getLabelCacheKey(id, lang)]
    if (cachedValue) {
      return cachedValue
    } else {
      return this.getEntity(id, lang)
        .then((entity) => {
          let propertyLabel = this.getLabelFromP34(entity, id, lang)
          if (!propertyLabel) {
            propertyLabel = this.getValueByLang(
              entity.labels,
              lang
            )
          }
          this.$store.commit('itemCache/addEntry', {
            key: this.getLabelCacheKey(),
            value: propertyLabel
          })
          return propertyLabel
        })
    }
  }

  getLabelCacheKey (id, lang) {
    return id + '_' + lang
  }

  getLabelFromP34 (entity, id, lang) {
    if (entity.claims?.P34) {
      const customLabel = entity.claims.P34
        .map(claim => claim.mainsnak?.datavalue)
        .find(datavalue => datavalue?.value?.language === lang)
        ?.value?.text
      if (customLabel) {
        return {
          item: id,
          value: customLabel,
          language: lang
        }
      }
    }
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
        if (entity.claims && this.constructor.PROPERTY_FORMATTER_URL in entity.claims) {
          const url = entity.claims[this.constructor.PROPERTY_FORMATTER_URL][0]
            .mainsnak.datavalue.value.replace('$1', encodeURIComponent(datavalue))
          return { value: datavalue, url, type: 'external-id' }
        } else {
          return { value: datavalue, type: 'text' }
        }
      })
    } else if (datatype === 'wikibase-item') {
      if (datavalue) {
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
      } else {
        return {
          property,
          value: '',
          language: null,
          type: 'entity',
          item: null
        }
      }
    } else if (datatype === 'string') {
      return { value: datavalue, type: 'text' }
    } else if (datatype === 'monolingualtext') {
      return {
        value: datavalue?.text,
        language: datavalue?.language,
        type: 'text-lang',
        showLanguage: true
      }
    } else if (datatype === 'time') {
      let isJulian = false
      if (datavalue?.calendarmodel === 'http://www.wikidata.org/entity/Q1985727') {
        isJulian = false
      } else if (datavalue?.calendarmodel === 'http://www.wikidata.org/entity/Q1985786') {
        isJulian = true
      }
      return {
        value: (datavalue === null) ? null : this.wbk.wikibaseTimeToSimpleDay(datavalue),
        calendar: isJulian ? 'Julian' : 'Gregorian',
        type: 'time'
      }
    } else if (datatype === 'commonsMedia') {
      if (datavalue) {
        return fetch(this.constructor.COMMONS_WIKIMEDIA_URL_ENDPOINT.replace('$file', datavalue))
          .then(response => response.json())
          .then((data) => {
            const imageinfo = data.query.pages[-1].imageinfo[0]
            return {
              descriptionurl: imageinfo.descriptionurl,
              url: imageinfo.url,
              type: 'image'
            }
          })
      } else {
        return {
          descriptionurl: '',
          url: '',
          type: 'image'
        }
      }
    } else if (datatype === 'url' && property === this.constructor.PROPERTY_NOTES) {
      if (!datavalue) {
        return {
          type: 'url',
          value: null
        }
      }

      const notesApiUrl =
        datavalue.replace('/wiki/', '/w/api.php?action=parse&page=') +
        '&prop=wikitext&formatversion=2&format=json&origin=*'
      return this.wbFetcher(notesApiUrl)
        .then((data) => {
          return { title: data.parse.title, value: data.parse.wikitext, type: 'html' }
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
        pbIdValue.includes('cnum') ||
        pbIdValue.includes('subid')
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

  runSparqlQuery (query, minimize = false, useBackendCache = false, useInternalCache = true) {
    if (useBackendCache) {
      useInternalCache = false
    }

    if (process.env.debug) {
      // eslint-disable-next-line no-console
      console.log(`run sparlql query:\n${query}\ninternal cache: ${useInternalCache}\nbackend cache: ${useBackendCache}`)
    }

    let queryHash = null
    if (useInternalCache) {
      queryHash = this.hashCode(query)
      const entry = this.getResultsFromCache(queryHash)
      if (entry) {
        return new Promise((resolve, reject) => {
          return resolve(entry.value)
        })
      }
    }

    const urlParts = this.wbk.sparqlQuery(query).split('?')
    let url = urlParts[0]
    const sparql = urlParts[1]

    if (useBackendCache) {
      url = this.sparqlBackendEndpoint
    }

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
        if (useInternalCache) {
          this.$store.commit('queryCache/addEntry', {
            key: queryHash,
            value: simplifiedResults
          })
        }
        return simplifiedResults
      })
      .catch((error) => {
        this.$notification.error(error)
        throw error
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

  async searchEntityByName (search, language, uselang, type) {
    try {
      const searchOptions = {
        search,
        uselang,
        language,
        type
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

  async getRelatedItems (pbid, refTables, currentPage, resultsPerPage) {
    return await this.runSparqlQuery(
      this.$query.getRelatedItems(pbid, refTables, currentPage, resultsPerPage),
      true
    ).then((results) => {
      return results
    }).catch(() => {
      return []
    })
  }

  async getTableLastItem (database, table) {
    return await this.runSparqlQuery(
      this.$query.getTableLastItem(database, table),
      true,
      false
    ).then((results) => {
      return results
    }).catch(() => {
      return []
    })
  }

  joinUrl (baseUrl, path) {
    if (!baseUrl || !path) {
      return ''
    }

    if (!baseUrl.endsWith('/')) {
      baseUrl += '/'
    }

    if (path.startsWith('/')) {
      path = path.substring(1)
    }

    return new URL(path, baseUrl).toString()
  }

  getRelatedTable (entity) {
    const pbid = this.getPBID(entity)
    const {
      groups: { tableid }
    } = this.getPBIDPattern().exec(pbid)
    return tableid
  }

  async getCsrfToken () {
    try {
      const csrfResponse = await fetch(
        `${this.$config.apiBaseUrl}/w/api.php?action=query&meta=tokens&type=csrf&format=json`,
        {
          method: 'GET',
          headers: this.$store.getters['auth/getAuthHeaders']
        }
      )
      const csrfData = await csrfResponse.json()
      const csrfToken = csrfData?.query?.tokens?.csrftoken

      if (!csrfToken) {
        throw new Error('Failed to fetch CSRF token')
      }

      return csrfToken
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch CSRF token', error)
      return error
    }
  }

  async updateDiscussionPage (title, text) {
    try {
      const csrfToken = await this.getCsrfToken()

      const response = await fetch(
        `${this.$config.apiBaseUrl}/w/api.php?action=edit&format=json`,
        {
          method: 'POST',
          headers: {
            ...this.$store.getters['auth/getAuthHeaders'],
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            title,
            text,
            token: csrfToken
          })
        }
      )

      return await response.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating discussion page:', error)
    }
  }
}
