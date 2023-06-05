export default {
  common: {
    loading: 'Cargando..'
  },
  menu: {
    item: {
      welcome: {
        label: 'Bienvenido'
      },
      search: {
        label: 'Buscar',
        item: {
          work: {
            label: 'Obra'
          },
          library: {
            label: 'Biblioteca'
          },
          institution: {
            label: 'Institución'
          },
          person: {
            label: 'Persona'
          },
          reference: {
            label: 'Referencia'
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
      label: 'Iniciar sesión',
      success: 'Inicio de sesión correcto!'
    },
    logout: {
      label: 'Cerrar sesión',
      success: '¡Hasta la próxima!'
    }
  },
  welcome: {
    title: 'Bienvenido'
  },
  search: {
    form: {
      common: {
        group: {
          label: 'Base de datos bibliografica'
        },
        group_all: {
          label: 'Todos'
        },
        simple_search: {
          label: 'Búsqueda sencilla',
          hint: 'Utilice este campo para buscar información no localizable en campos con nombre. Por ejemplo, en <b>MsEd</b>, información codicológica; o, en TRABAJO, escriba "trad*" en <b>Búsqueda simple</b> para producir una lista de trabajos que han sido traducidos de su idioma original.'
        },
        subject: {
          label: 'Materia',
          hint: 'Keep in mind when searching in Subject that its use is not uniform in all search pages nor in the three bibliographies.<br/>Search using a complete heading or any word contained in any heading (e.g. a place name). For technical reasons, only one subject heading can be searched at a time. Searches for two different subject headings or for words from two different subject headings will return zero results. In BITAGAP, for example, search for “milagres” or for “mariologia” but not for “milagres” and “mariologia”.'
        },
        place: {
          label: 'Lugar',
          hint: 'Place names appear on several search pages: WORK - <b>Place of composition</b>; PERSON - <b>Associated place</b>; LIBRARY - <b>City</b>; REFERENCE - <b>Place of publication</b>; MSED - <b>City</b>.'
        },
        date: {
          label: 'Fecha',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.'
        },
        personal_name: {
          label: 'Nombre personal',
          hint: 'To search for a personal name as the <b>Author</b> of a text in WORK, use any form of the name, original, translated, or a variant. For example, search for “Benedictus”, “Bento”, “Benet”, or “Benito.”<br/>On all other search pages and in all other fields, such as (associated) persons, authors of secondary references, previous owners, translators, patrons, copyists, publishers, that is, for any personal name searched in any field other than that of Author in WORK, use the modern version of the name.<br/>Tip: To identify the modern form of a name, search in PERSON for any form in <b>Name</b>, original, translated, pseudonym, etc.'
        },
        search_type: {
          all_words: 'Todas las palabras',
          any_word: 'Cualquier palabra'
        }
      },
      work: {
        author: {
          label: 'Autor',
          hint: 'To search for a personal name as the <b>Author</b> of a text in WORK, use any form of the name, original, translated, or a variant. For example, search for “Benedictus”, “Bento”, “Benet”, or “Benito.”<br/>On all other search pages and in all other fields, such as (associated) persons, authors of secondary references, previous owners, translators, patrons, copyists, publishers, that is, for any personal name searched in any field other than that of Author in WORK, use the modern version of the name.<br/>Tip: To identify the modern form of a name, search in PERSON for any form in <b>Name</b>, original, translated, pseudonym, etc.'
        },
        title: {
          label: 'Título',
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
          label: 'Persona asociada'
        },
        place_composition: {
          label: 'Lugar de composición'
        },
        date_composition: {
          label: 'Fecha de composición'
        }
      },
      library: {
        city: {
          label: 'Ciudad',
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
          label: 'Ciudad',
          hint: 'Se refiere a la ciudad donde se ubica la biblioteca que conserva el manuscrito o impreso. Búsquese el nombre de la ciudad en su lengua nativa (v.g., London, New York) o transliterado, si viene al caso, v.g., Moskva.'
        },
        institution_type: {
          label: 'Tipo de institución',
          hint: 'Search by type of institution'
        },
        institution: {
          label: 'Institución',
          hint: 'Search by any of the institution\'s formal or commonly used names (e.g. in BETA, search for Universidad Complutense, Universidad de Madrid, or Universidad Central).'
        }
      },
      person: {
        name: {
          label: 'Nombre'
        },
        title: {
          label: 'Título',
          hint: 'This refers to a title conferred on an individual (by king, noble; Church; for a particular period, hereditary, or for life). You may also search any place to which the conferred title is attached (e.g., in BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Fecha',
          hint: 'Search for date of birth, death, conferral of a title, or other milestone event.'
        },
        associated_place: {
          label: 'Lugar asociado',
          hint: 'Search for place (in the modern form) of birth, death, residence, or other milestone event.'
        },
        profession: {
          label: 'Orden religiosa o militar / Profesión',
          hint: 'For religious orders search by the standard sigla, e.g., OSB, OFM, SJ, Ocist. For professions see the list in the related help pages. Note that identification of professions is sporadic in all three bibliographies.<br/>NOTE: The Associated Persons section of each record must be treated with caution, especially for those individuals with numerous relationships. The database program is designed to establish a reciprocal link between two records automatically. Thus when the record of "Juana la Loca" (BETA bioid 7208) was linked to that of Fernando V (bioid 1104) as his daughter, his record was automatically updated to show him as her father. Unfortunately, due to programming errors this automatic updating process sometimes established erroneous links with other records. Over time these errors will be eliminated. We request the collaboration of our users to help us identify them.'
        }
      },
      reference: {
        author: {
          label: 'Autor',
          hint: 'Search by any form or portion of the name of the <b>author</b> (of a monograph or article).'
        },
        title: {
          label: 'Título',
          hint: ' Search by monograph or article title (whole or partial, most distinctive words).'
        },
        date: {
          label: 'Fecha',
          hint: 'Search by year of publication.'
        },
        volume: {
          label: 'Revista / volumen colectivo',
          hint: 'Search by title of the journal (print or electronic) or collected volume (acts or proceedings of congresses, homage volumes, etc.).'
        },
        place_publication: {
          label: 'Lugar de impresión',
          hint: 'Search by name of the city of publication in its native language.'
        },
        publisher: {
          label: 'Editorial',
          hint: 'Search by publisher (e.g., “University of California Press”).'
        },
        series: {
          label: 'Serie / Colección',
          hint: 'Search by series (e.g., in BITAGAP, “Subsídios para a história da arte”).'
        },
        associated_person: {
          label: 'Persona asociada',
          hint: 'Search for any individual associated with the work <b>other than the author</b> (e.g., author of prologue, coordinator, editor, or director of series or collection, etc.).'
        }
      },
      msed: {
        city: {
          label: 'Ciudad'
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
          label: 'Fecha',
          hint: 'You can search for complete or partial dates. A search for “1325“, for example, returns manuscripts copied on any day of that year as well as undated manuscripts which, based on internal or external evidence, have been dated to include the year 1325 (e.g. 1325; 1325 a quo, 1325 ad quem; 1301? - 1325?; 1290? - 1325?; etc.).'
        },
        place_production: {
          label: 'Lugar de producción',
          hint: 'Search by the name of a city or place in its modern form.'
        },
        scribe_printer: {
          label: 'Copista / impresor',
          hint: 'Search for a scribe using any form of the name. For a printer, use the name in its original form (e.g., in BITAGAP, “Hermann von Kempen” rather than “Hermão de Campos”). To learn the original form of a printer\'s name, search first in PERSON.'
        },
        publisher_patron: {
          label: 'Editorial / mecenas',
          hint: 'For a printed edition, search for the person who sponsored it using the modern form of the name. For a manuscript, search for the modern form of the name of the patron for whom it was copied.'
        },
        previous_owner: {
          label: 'Antiguo posesor',
          hint: 'Search for any person or institution that has owned the object by a person\'s name or title, by the name of a monastery, museum, auction house, etc.'
        },
        associated_person: {
          label: 'Persona asociada',
          hint: ' Search using any form of the name. A search returns the name of a binder, illuminator, annotator, etc.'
        }
      }
    },
    button: {
      search: 'Buscar',
      back: 'Atrás',
      clear: 'Reinicia'
    },
    results: {
      results: 'Resultados',
      sort_by: 'Ordenar por:',
      sort_option: {
        name: 'Nom',
        id: 'ID'
      },
      not_found: 'No se ha encontrado resultados.'
    }
  },
  item: {
    invalid_id: 'Identificador inválido.',
    not_found: 'No encontrado.',
    back: 'Ir atrás'
  }
}
