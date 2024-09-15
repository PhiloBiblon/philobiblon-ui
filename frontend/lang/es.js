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
          hint: 'Tenga en cuenta que al buscar por tema, su uso no es uniforme en todas las páginas de búsqueda ni en las tres bibliografías.<br/>Busque utilizando un encabezamiento completo o cualquier palabra contenida en cualquier encabezamiento (por ejemplo, el nombre de un lugar). Por razones técnicas, solo se puede buscar un encabezamiento de materia a la vez. Las búsquedas de dos encabezamientos de materia diferentes o de palabras de dos encabezamientos de materia diferentes no arrojarán ningún resultado. En BITAGAP, por ejemplo, busque “milagres” o “mariologia”, pero no “milagres” y “mariologia”.'
        },
        place: {
          label: 'Lugar',
          hint: 'Los nombres de lugares aparecen en varias páginas de búsqueda: OBRA - <b>Lugar de composición</b>; PERSONA - <b>Lugar asociado</b>; BIBLIOTECA - <b>Ciudad</b>; REFERENCIA - <b>Lugar de publicación</b>; MSED - <b>Ciudad</b>.'
        },
        date: {
          label: 'Fecha',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.'
        },
        personal_name: {
          label: 'Nombre personal',
          hint: 'Para buscar un nombre personal como el <b>Autor</b> de un texto en OBRA, utilice cualquier forma del nombre, original, traducido o una variante. Por ejemplo, busque “Benedictus”, “Bento”, “Benet” o “Benito”.<br/>En todas las demás páginas de búsqueda y en todos los demás campos, como personas (asociadas), autores de referencias secundarias, propietarios anteriores, traductores, mecenas, copistas, editores, es decir, para cualquier nombre personal buscado en cualquier campo que no sea el de Autor en OBRA, utilice la versión moderna del nombre.<br/>Sugerencia: Para identificar la forma moderna de un nombre, busque en PERSONA cualquier forma en <b>Nombre</b>, original, traducido, seudónimo, etc.'
        },
        search_type: {
          all_words: 'Todas las palabras',
          any_word: 'Cualquier palabra'
        }
      },
      texid: {
        author: {
          label: 'Autor',
          hint: 'Para buscar un nombre personal como el <b>Autor</b> de un texto en OBRA, utilice cualquier forma del nombre, original, traducido o una variante. Por ejemplo, busque “Benedictus”, “Bento”, “Benet” o “Benito”.<br/>En todas las demás páginas de búsqueda y en todos los demás campos, como personas (asociadas), autores de referencias secundarias, propietarios anteriores, traductores, mecenas, copistas, editores, es decir, para cualquier nombre personal buscado en cualquier campo que no sea el de Autor en OBRA, utilice la versión moderna del nombre.<br/>Sugerencia: Para identificar la forma moderna de un nombre, busque en PERSONA cualquier forma en <b>Nombre</b>, original, traducido, seudónimo, etc.'
        },
        title: {
          label: 'Título',
          hint: 'Busque obras en prosa utilizando la forma moderna del título o, para una obra traducida, el título original o traducido. Para una búsqueda amplia, el primero (p. ej., “vida”) generalmente arrojará más obras que el segundo (“vita”). Todas las búsquedas arrojan obras según cualquiera de sus títulos conocidos. También puede utilizar (cualquier parte de) una fecha para buscar en este campo. Para textos poéticos individuales, consulte <b>Incipit/Explicit</b> a continuación, a menos que el poema tenga un título de uso común, p. ej., en BITAGAP, Poema da Batalha do Salado. Los títulos de cancioneros (p. ej., Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles) también se pueden buscar en este campo.'
        },
        incipit: {
          label: 'Incipit',
          hint: 'Este importante campo de búsqueda puede ayudar a identificar un texto.<br/>Para cada obra, hay (a) un registro maestro (con un <b>texid</b> único) y (b) una serie de registros para cada copia conocida que sobrevive de la obra (cada una con un <b>cnum</b> único). Para el primero, los incipits/explícitos se han modernizado; para el segundo, los incipits/explícitos se reproducen paleográficamente o semipaleográficamente, dependiendo de la bibliografía (con o sin marcas de supresión, abreviaturas resueltas o no resueltas, errores ortográficos, etc.) tal como se encuentran en el manuscrito o la edición impresa o tal como se transcriben en una fuente secundaria. Una búsqueda en este campo debe devolver una lista de obras basada tanto en los incipits/explícitos modernizados como en los originales. Cuando intente identificar un texto, repita la búsqueda utilizando variantes de las palabras menos comunes. En algunos casos, en particular en el caso de textos con un gran número de copias y sin edición moderna, los íncipits y los explícitos se han registrado solo en los registros de copias. Este es particularmente el caso de BETA.<br/>Para localizar un texto poético, en <b>Incipit</b> busque cualquier palabra o palabras que aparezcan en la primera línea.'
        },
        explicit: {
          label: 'Explicit',
          hint: 'Este importante campo de búsqueda puede ayudar a identificar un texto.<br/>Para cada obra, hay (a) un registro maestro (con un <b>texid</b> único) y (b) una serie de registros para cada copia conocida que sobrevive de la obra (cada una con un <b>cnum</b> único). Para el primero, los incipits/explícitos se han modernizado; para el segundo, los incipits/explícitos se reproducen paleográficamente o semipaleográficamente, dependiendo de la bibliografía (con o sin marcas de supresión, abreviaturas resueltas o no resueltas, errores ortográficos, etc.) tal como se encuentran en el manuscrito o la edición impresa o tal como se transcriben en una fuente secundaria. Una búsqueda en este campo debe devolver una lista de obras basada tanto en los incipits/explícitos modernizados como en los originales. Cuando intente identificar un texto, repita la búsqueda utilizando variantes de las palabras menos comunes. En algunos casos, en particular en el caso de textos con un gran número de copias y sin edición moderna, los íncipits y los explícitos se han registrado solo en los registros de copias. Este es particularmente el caso de BETA.<br/>Para localizar un texto poético, en <b>Incipit</b> busque cualquier palabra o palabras que aparezcan en la primera línea.'
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
          hint: 'Busque por aaaa y/o mm y/o dd. Una búsqueda aquí podría devolver la fecha de composición, confirmación, revisión, traducción, promulgación, etc.'
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
          hint: 'Busque por el nombre de la ciudad en su idioma nativo (por ejemplo, Nueva York, Florencia, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Busque por cualquiera de los nombres formales o comúnmente utilizados de la biblioteca (por ejemplo, en BETA, busque Real Biblioteca, Biblioteca de Palacio o simplemente Palacio).'
        },
        call_number: {
          label: 'Número de llamada',
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
          hint: 'Búsqueda por tipo de institución.'
        },
        institution: {
          label: 'Institución',
          hint: 'Busque por cualquiera de los nombres formales o comúnmente utilizados de la institución (por ejemplo, en BETA, busque Universidad Complutense, Universidad de Madrid o Universidad Central).'
        }
      },
      bioid: {
        name: {
          label: 'Nombre'
        },
        title: {
          label: 'Título',
          hint: 'Se refiere a un título conferido a un individuo (por un rey, un noble, la Iglesia, por un período determinado, hereditario o vitalicio). También puede buscar en cualquier lugar al que esté asociado el título conferido (por ejemplo, en BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Fecha',
          hint: 'Busque fecha de nacimiento, muerte, concesión de un título u otro evento importante.'
        },
        associated_place: {
          label: 'Lugar asociado',
          hint: 'Busque lugar (en la forma moderna) de nacimiento, muerte, residencia u otro evento importante.'
        },
        religious_order: {
          label: 'Orden religiosa o militar',
          hint: 'Para las órdenes religiosas, busque por la sigla estándar, por ejemplo, OSB, OFM, SJ, Ocist. Nótese que la identificación de profesiones es esporádica en las tres bibliografías.<br/>NOTA: La sección de Personas Asociadas de cada registro debe tratarse con cautela, especialmente para aquellos individuos con numerosas relaciones. El programa de la base de datos está diseñado para establecer un enlace recíproco entre dos registros de forma automática. Así, cuando el registro de "Juana la Loca" (BETA bioid 7208) se vinculó al de Fernando V (bioid 1104) como su hija, su registro se actualizó automáticamente para mostrarlo como su padre. Desafortunadamente, debido a errores de programación, este proceso de actualización automática a veces estableció enlaces erróneos con otros registros. Con el tiempo, estos errores se eliminarán. Solicitamos la colaboración de nuestros usuarios para ayudarnos a identificarlos.'
        },
        profession: {
          label: 'Profesión, oficio u ocupación',
          hint: 'Para las profesiones consulte la lista en las páginas de ayuda relacionadas.'
        },
        religion: {
          label: 'Religión',
          hint: ''
        }
      },
      bibid: {
        author: {
          label: 'Autor/Creador',
          hint: 'Busque por cualquier forma o porción del nombre del <b>autor</b> (de una monografía o artículo) y por cualquier individuo asociado con la obra <b>que no sea el autor</b> (por ejemplo, autor del prólogo, coordinador, editor o director de la serie o colección, etc.).'
        },
        title: {
          label: 'Título',
          hint: 'Búsqueda por título de monografía o artículo (total o parcial, palabras más distintivas).'
        },
        date: {
          label: 'Fecha',
          hint: 'Búsqueda por año de publicación.'
        },
        volume: {
          label: 'Revista / volumen colectivo',
          hint: 'Búsqueda por título de la revista (impresa o electrónica) o volumen recopilado (actas o procedimientos de congresos, volúmenes homenaje, etc.).'
        },
        place_publication: {
          label: 'Lugar de impresión',
          hint: 'Búsqueda por nombre de la ciudad de publicación en su idioma nativo.'
        },
        publisher: {
          label: 'Editorial',
          hint: 'Búsqueda por editor (por ejemplo, “University of California Press”).'
        },
        series: {
          label: 'Serie / Colección',
          hint: 'Búsqueda por series (p. ej., en BITAGAP, “Subsídios para a história da arte”).'
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
    title: 'Título',
    description: 'Descripción',
    back: 'Ir atrás',
    messages: {
      invalid_id: 'Identificador inválido.',
      not_found: 'No encontrado.',
      invalid_url: '¡Por favor rellene una URL válida!'
    }
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
  },
  messages: {
    error: {
      session: {
        expired: 'Sesión expirada'
      },
      inputs: {
        fill: 'Por favor, rellene los campos'
      },
      modification: {
        failed: 'La etiqueta y la descripción del código de idioma en no pueden tener el mismo valor.'
      }
    },
    success: {
      updated: 'Actualizada con éxito'
    }
  },
  wiki: {
    search: {
      placeholder: 'Buscar en PhiloBiblon'
    }
  }
}
