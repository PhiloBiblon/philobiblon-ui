export default {
  common: {
    loading: 'Carregant..'
  },
  menu: {
    item: {
      welcome: {
        label: 'Benvingut'
      },
      search: {
        label: 'Cercar',
        item: {
          work: {
            label: 'Obra'
          },
          library: {
            label: 'Biblioteca'
          },
          institution: {
            label: 'Institució'
          },
          person: {
            label: 'Persona'
          },
          reference: {
            label: 'Referència'
          },
          msed: {
            label: 'MsEd'
          }
        }
      }
    }
  },
  auth: {
    login: {
      label: 'Iniciar sessió',
      success: 'Benvingut {name}!'
    },
    logout: {
      label: 'Tancar sessió',
      success: 'Fins la propera!'
    }
  },
  welcome: {
    title: 'Benvingut'
  },
  search: {
    form: {
      common: {
        group: {
          label: 'Base de dades bibliogràfica'
        },
        group_all: {
          label: 'Tots'
        },
        simple_search: {
          label: 'Cerca simple',
          hint: 'Utilitzeu aquest camp per cercar informació que no es pugui localitzar als camps amb nom. Per exemple, a <b>MsEd</b>, informació codicològica; o, a WORK, escriviu “trad*” a <b>Cerca senzilla</b> per produir una llista d\'obres que s\'han traduït de la seva llengua original.'
        },
        subject: {
          label: 'Matèria',
          hint: 'Keep in mind when searching in Subject that its use is not uniform in all search pages nor in the three bibliographies.<br/>Search using a complete heading or any word contained in any heading (e.g. a place name). For technical reasons, only one subject heading can be searched at a time. Searches for two different subject headings or for words from two different subject headings will return zero results. In BITAGAP, for example, search for “milagres” or for “mariologia” but not for “milagres” and “mariologia”.'
        },
        place: {
          label: 'Lloc',
          hint: 'Place names appear on several search pages: WORK - <b>Place of composition</b>; PERSON - <b>Associated place</b>; LIBRARY - <b>City</b>; REFERENCE - <b>Place of publication</b>; MSED - <b>City</b>.'
        },
        date: {
          label: 'Data',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.'
        },
        personal_name: {
          label: 'Nom personal',
          hint: 'To search for a personal name as the <b>Author</b> of a text in WORK, use any form of the name, original, translated, or a variant. For example, search for “Benedictus”, “Bento”, “Benet”, or “Benito.”<br/>On all other search pages and in all other fields, such as (associated) persons, authors of secondary references, previous owners, translators, patrons, copyists, publishers, that is, for any personal name searched in any field other than that of Author in WORK, use the modern version of the name.<br/>Tip: To identify the modern form of a name, search in PERSON for any form in <b>Name</b>, original, translated, pseudonym, etc.'
        },
        search_type: {
          all_words: 'Totes les paraules',
          any_word: 'Qualsevol paraula'
        }
      },
      work: {
        author: {
          label: 'Autor',
          hint: 'To search for a personal name as the <b>Author</b> of a text in WORK, use any form of the name, original, translated, or a variant. For example, search for “Benedictus”, “Bento”, “Benet”, or “Benito.”<br/>On all other search pages and in all other fields, such as (associated) persons, authors of secondary references, previous owners, translators, patrons, copyists, publishers, that is, for any personal name searched in any field other than that of Author in WORK, use the modern version of the name.<br/>Tip: To identify the modern form of a name, search in PERSON for any form in <b>Name</b>, original, translated, pseudonym, etc.'
        },
        title: {
          label: 'Títol',
          hint: 'Search for prose works using the modern form of the title or, for a translated work, the original or the translated title. For a broad search, the former (e.g., “vida”) will generally return more works than the latter (“vita”). All searches return works according to any of their known titles. You may also use (any part of) a date to search in this field. For individual poetic texts, see <b>Incipit/Explicit</b> below unless the poem has a commonly-used title, e.g., in BITAGAP, Poema da Batalha do Salado. Songbook titles (e.g., Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles) can also be searched in this field.'
        },
        incipit: {
          label: 'Incipit',
          hint: 'This important search field may aid in the identification of a text.<br/>For every work, there is (a) a master record (with a unique <b>texid</b>) and (b) a series of records for every known surviving copy of the work (each with a unique <b>cnum</b>). For the former, incipits/explicits have been modernized; for the latter, incipits/explicits are reproduced paleographically or semi-paleographically, depending on the bibliography (with or without suppression marks, resolved or unresolved abbreviations, misspellings, etc.) as found in the manuscript or printed edition or as transcribed in a secondary source. A search in this field should return a list of works based on both the modernized incipits/explicits as well as the original ones. When trying to identify a text, repeat the search using variants of the less common words. In some case, particularly for texts with a large number of copies and no modern edition, incipits and explicits have been recorded only in the copy records. This is particularly the case for BETA.<br/>To locate a poetic text, in <b>Incipit</b> search for any word or words appearing in the first line.'
        },
        explicit: {
          label: 'Explicit',
          hint: 'This important search field may aid in the identification of a text.<br/>For every work, there is (a) a master record (with a unique <b>texid</b>) and (b) a series of records for every known surviving copy of the work (each with a unique <b>cnum</b>). For the former, incipits/explicits have been modernized; for the latter, incipits/explicits are reproduced paleographically or semi-paleographically, depending on the bibliography (with or without suppression marks, resolved or unresolved abbreviations, misspellings, etc.) as found in the manuscript or printed edition or as transcribed in a secondary source. A search in this field should return a list of works based on both the modernized incipits/explicits as well as the original ones. When trying to identify a text, repeat the search using variants of the less common words. In some case, particularly for texts with a large number of copies and no modern edition, incipits and explicits have been recorded only in the copy records. This is particularly the case for BETA.<br/>To locate a poetic text, in <b>Incipit</b> search for any word or words appearing in the first line.'
        },
        associated_person: {
          label: 'Persona relacionada'
        },
        place_composition: {
          label: 'Lloc de composició'
        },
        date_composition: {
          label: 'Data de composició'
        }
      },
      library: {
        city: {
          label: 'Ciutat',
          hint: 'Search by the name of the city in its native language (e.g., New York, Firenze, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by any of the library\'s formal or commonly used names (e.g. in BETA, search for Real Biblioteca, Biblioteca de Palacio, or simply Palacio).'
        },
        shelfmark: {
          label: 'Signatura',
          hint: 'Search by the current or any former shelfmark, including those of previous owners. This returns a list of libraries holding manuscripts or printings with that shelfmark. Shelfmarks are not case-sensitive.'
        }
      },
      institution: {
        city: {
          label: 'Ciutat',
          hint: 'Busquis el nom de la ciutat en la llengua original (v.g. London, New York, llevat d\'aquells que van pertànyer a la Corona d\'Aragó i tradicionalment als estudis de catalanística s\'esmenten pel seu nom català (v.g. Sogorb, Morvedre o Saragossa) o transliterat, si és el cas, v.g., Sankt Peterburg.'
        },
        institution_type: {
          label: 'Tipus d\'institució',
          hint: 'Search by type of institution'
        },
        institution: {
          label: 'Institució',
          hint: 'Search by any of the institution\'s formal or commonly used names (e.g. in BETA, search for Universidad Complutense, Universidad de Madrid, or Universidad Central).'
        }
      },
      person: {
        name: {
          label: 'Nom'
        },
        title: {
          label: 'Títol',
          hint: 'This refers to a title conferred on an individual (by king, noble; Church; for a particular period, hereditary, or for life). You may also search any place to which the conferred title is attached (e.g., in BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Data',
          hint: 'Search for date of birth, death, conferral of a title, or other milestone event.'
        },
        associated_place: {
          label: 'Lloc relacionat',
          hint: 'Search for place (in the modern form) of birth, death, residence, or other milestone event.'
        },
        profession: {
          label: 'Orde religiós o militar / Professió',
          hint: 'For religious orders search by the standard sigla, e.g., OSB, OFM, SJ, Ocist. For professions see the list in the related help pages. Note that identification of professions is sporadic in all three bibliographies.<br/>NOTE: The Associated Persons section of each record must be treated with caution, especially for those individuals with numerous relationships. The database program is designed to establish a reciprocal link between two records automatically. Thus when the record of "Juana la Loca" (BETA bioid 7208) was linked to that of Fernando V (bioid 1104) as his daughter, his record was automatically updated to show him as her father. Unfortunately, due to programming errors this automatic updating process sometimes established erroneous links with other records. Over time these errors will be eliminated. We request the collaboration of our users to help us identify them.'
        }
      },
      reference: {
        author: {
          label: 'Autor',
          hint: 'Search by any form or portion of the name of the <b>author</b> (of a monograph or article).'
        },
        title: {
          label: 'Títol',
          hint: ' Search by monograph or article title (whole or partial, most distinctive words).'
        },
        date: {
          label: 'Data',
          hint: 'Search by year of publication.'
        },
        volume: {
          label: 'Revista / volum col·lectiu',
          hint: 'Search by title of the journal (print or electronic) or collected volume (acts or proceedings of congresses, homage volumes, etc.).'
        },
        place_publication: {
          label: 'Lloc d\'edició',
          hint: 'Search by name of the city of publication in its native language.'
        },
        publisher: {
          label: 'Editor',
          hint: 'Search by publisher (e.g., “University of California Press”).'
        },
        series: {
          label: 'Serie / Col·lecció',
          hint: 'Search by series (e.g., in BITAGAP, “Subsídios para a história da arte”).'
        },
        associated_person: {
          label: 'Persona relacionada',
          hint: 'Search for any individual associated with the work <b>other than the author</b> (e.g., author of prologue, coordinator, editor, or director of series or collection, etc.).'
        }
      },
      msed: {
        city: {
          label: 'Ciutat'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by the current or former name of the library that holds the manuscript or printed edition.'
        },
        shelfmark: {
          label: 'Signatura',
          hint: 'Search for a current or former shelfmark in the holding library as well as for the shelfmark of a previous owner. Searches are not case-sensitive, e.g., “Inc. 1484” or “inc. 1484.”'
        },
        date: {
          label: 'Data',
          hint: 'You can search for complete or partial dates. A search for “1325“, for example, returns manuscripts copied on any day of that year as well as undated manuscripts which, based on internal or external evidence, have been dated to include the year 1325 (e.g. 1325; 1325 a quo, 1325 ad quem; 1301? - 1325?; 1290? - 1325?; etc.).'
        },
        place_production: {
          label: 'Lloc de producció',
          hint: 'Search by the name of a city or place in its modern form.'
        },
        scribe_printer: {
          label: 'Copista / impressor',
          hint: 'Search for a scribe using any form of the name. For a printer, use the name in its original form (e.g., in BITAGAP, “Hermann von Kempen” rather than “Hermão de Campos”). To learn the original form of a printer\'s name, search first in PERSON.'
        },
        publisher_patron: {
          label: 'Editor / mecenes',
          hint: 'For a printed edition, search for the person who sponsored it using the modern form of the name. For a manuscript, search for the modern form of the name of the patron for whom it was copied.'
        },
        previous_owner: {
          label: 'Antic posseïdor',
          hint: 'Search for any person or institution that has owned the object by a person\'s name or title, by the name of a monastery, museum, auction house, etc.'
        },
        associated_person: {
          label: 'Persona relacionada',
          hint: ' Search using any form of the name. A search returns the name of a binder, illuminator, annotator, etc.'
        }
      }
    },
    button: {
      search: 'Cercar',
      back: 'Enrera',
      clear: 'Reinicia'
    },
    results: {
      results: 'Resultats',
      sort_by: 'Ordenar per:',
      sort_option: {
        name: 'Nom',
        id: 'ID'
      },
      not_found: 'No s\'han trobat resultats.'
    }
  },
  item: {
    invalid_id: 'Identificador invàlid.',
    not_found: 'No trobat.',
    back: 'Torna'
  }
}
