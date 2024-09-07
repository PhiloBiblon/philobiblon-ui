export default {
  common: {
    no_data: 'No hay datos disponibles',
    loading: 'Cargando..',
    language: 'Idioma',
    calendar: 'Calendario',
    advanced_search: 'Búsqueda avanzada',
    from: 'De',
    to: 'a'
  },
  menu: {
    item: {
      welcome: {
        label: 'Bienvenido'
      },
      search: {
        label: 'Buscar',
        item: {
          texid: {
            label: 'Obra'
          },
          libid: {
            label: 'Biblioteca'
          },
          insid: {
            label: 'Institución'
          },
          bioid: {
            label: 'Persona'
          },
          bibid: {
            label: 'Referencia'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Geografía'
          },
          subid: {
            label: 'Asunto'
          },
          cnum: {
            label: 'cnum'
          },
          copid: {
            label: 'copid'
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
      texid: {
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
          label: 'Persona asociada',
          hint: ''
        },
        place_composition: {
          label: 'Lugar de composición',
          hint: ''
        },
        date_composition: {
          label: 'Fecha de composición',
          hint: ''
        },
        type: {
          label: 'Tipo',
          hint: ''
        },
        language: {
          label: 'Idioma',
          hint: ''
        },
        poetic_form: {
          label: 'Forma poética',
          hint: ''
        }
      },
      libid: {
        city: {
          label: 'Ciudad',
          hint: 'Search by the name of the city in its native language (e.g., New York, Firenze, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by any of the library\'s formal or commonly used names (e.g. in BETA, search for Real Biblioteca, Biblioteca de Palacio, or simply Palacio).'
        },
        call_number: {
          label: 'Signatura',
          hint: ''
        }
      },
      insid: {
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
      bioid: {
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
        religious_order: {
          label: 'Orden religiosa o militar',
          hint: 'For religious orders search by the standard sigla, e.g., OSB, OFM, SJ, Ocist. Note that identification of professions is sporadic in all three bibliographies.<br/>NOTE: The Associated Persons section of each record must be treated with caution, especially for those individuals with numerous relationships. The database program is designed to establish a reciprocal link between two records automatically. Thus when the record of "Juana la Loca" (BETA bioid 7208) was linked to that of Fernando V (bioid 1104) as his daughter, his record was automatically updated to show him as her father. Unfortunately, due to programming errors this automatic updating process sometimes established erroneous links with other records. Over time these errors will be eliminated. We request the collaboration of our users to help us identify them.'
        },
        profession: {
          label: 'Profesión, oficio u ocupación',
          hint: 'For professions see the list in the related help pages.'
        },
        religion: {
          label: 'Religión',
          hint: ''
        }
      },
      bibid: {
        author: {
          label: 'Autor/Creador',
          hint: 'Search by any form or portion of the name of the <b>author</b> (of a monograph or article) and for any individual associated with the work <b>other than the author</b> (e.g., author of prologue, coordinator, editor, or director of series or collection, etc.).'
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
        locations: {
          label: 'Localizaciones',
          hint: ''
        },
        international_standard_number: {
          label: 'Número estándar internacional (ISBN, ISSN)',
          hint: ''
        },
        type: {
          label: 'Tipo',
          hint: ''
        }
      },
      manid: {
        city: {
          label: 'Ciudad'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by the current or former name of the library that holds the manuscript or printed edition.'
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
    title: 'Título',
    description: 'Descripción',
    invalid_id: 'Identificador inválido.',
    not_found: 'No encontrado.',
    back: 'Ir atrás'
  },
  privacyPolicy: {
    label: 'Política de privacidad',
    tooltip: 'Usamos cookies estrictamente necesarias: estas cookies son esenciales para que usted pueda navegar por el sitio web y utilizar sus funciones, como acceder a áreas seguras del sitio o recordar el idioma seleccionado.',
    consent: {
      title: 'Datos recopilados sobre la base del consentimiento',
      desc: 'Si lo solicita y da su consentimiento, recopilamos los siguientes datos con el fin de brindarle nuestros servicios. Sus datos no se utilizan para ningún otro fin ni se comparten con terceros. Se eliminan si retira su consentimiento o solicita la finalización de estos servicios.'
    },
    comments: {
      title: 'Comentarios',
      subtitle: 'Nombre, dirección de correo electrónico, contenido del comentario',
      subtitleDesc: 'Estos datos se recopilan cuando usted deja un comentario y se muestran en el sitio web.',
      desc: 'Si dejas un comentario en el Sitio Web, tu nombre y dirección de correo electrónico también se guardarán en cookies. Esto es para tu comodidad, para que no tengas que volver a rellenar tus datos cuando dejes otro comentario. Estas cookies se guardarán en tu ordenador hasta que las elimines.'
    },
    userAgent: {
      subtitle: 'Cadena de agente de usuario de IP y navegador',
      subtitleDesc: 'Estos datos se recopilan cuando dejas un comentario.'
    },
    retentionPeriod: {
      subtitle: 'Periodo de conservación',
      subtitleDesc: 'Los datos antes mencionados se conservan indefinidamente para que podamos reconocer y aprobar automáticamente los comentarios posteriores en lugar de mantenerlos en una cola de moderación.'
    },
    legitimateInterest: {
      title: 'Datos recopilados en base a un interés legítimo',
      desc: 'En base a nuestros intereses legítimos, recopilamos los siguientes datos con el fin de gestionar este sitio web. Sus datos no se utilizan para ningún otro fin ni se comparten con terceros. Se eliminan si usted lo solicita.'
    },
    statistics: {
      title: 'Estadísticas',
      desc: 'El sitio web utiliza una versión mínima de Google Analytics, un servicio que transmite datos de tráfico del sitio web a los servidores de Google en los Estados Unidos y nos permite observar tendencias para mejorar la experiencia del usuario en nuestro sitio web. Esta versión mínima procesa datos personales como: el ID de usuario único establecido por Google Analytics, la fecha y la hora, el título de la página que se está visualizando, la URL de la página que se está visualizando, la URL de la página que se vio antes de la página actual, la resolución de la pantalla, la hora en la zona horaria local, los archivos en los que se hizo clic y se descargaron, los enlaces en los que se hizo clic a un dominio externo, el tipo de dispositivo y el país, la región y la ciudad. <br/> <br/>Puede optar por no participar en este seguimiento en cualquier momento activando la configuración "No rastrear" en su navegador.'
    },
    embedContent: {
      title: 'Contenido incrustado de otros sitios web',
      desc: 'Los artículos del sitio web pueden incluir contenido incrustado (por ejemplo, videos, gráficos, etc.). El contenido incrustado de otros sitios web se comporta exactamente de la misma manera que si el visitante hubiera visitado el otro sitio web. <br/> <br/>\n' +
        'Estos sitios web pueden recopilar datos sobre usted, utilizar cookies, incorporar un seguimiento adicional de terceros y supervisar su interacción con ese contenido incrustado, incluido el seguimiento de su interacción con el contenido incrustado si tiene una cuenta y ha iniciado sesión en ese sitio web.'
    },
    rights: {
      title: 'Sus derechos en relación con sus datos',
      desc: 'Si ha dejado comentarios en el sitio web, puede solicitar recibir un archivo exportado de los datos personales que tenemos sobre usted, incluidos los datos que nos haya proporcionado. También puede solicitar que rectifiquemos o borremos los datos personales que tengamos sobre usted. Envíe su solicitud a <a href="mailto:legal@gdpr.eu">legal@gdpr.eu</a>',
      data: '• El derecho a retirar el consentimiento<br/>\n' +
        '• El derecho de acceso<br/>\n' +
        '• El derecho de supresión<br/>\n' +
        '• El derecho de rectificación<br/>\n' +
        '• El derecho a la portabilidad de los datos<br/>\n' +
        '• El derecho a oponerse<br/>\n' +
        '• Notificación de violaciones de datos<br/>\n' +
        '• El derecho a presentar una reclamación ante una autoridad de control'
    }
  }
}
