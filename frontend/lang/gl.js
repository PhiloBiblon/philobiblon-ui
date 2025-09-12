export default {
  common: {
    label: 'Etiqueta',
    property: 'Propiedade',
    properties: 'Propiedades',
    per_page: 'por páxina',
    value: 'Valor',
    no_data: 'Non hai datos dispoñibles',
    loading: 'Cargando..',
    language: 'Lingua',
    amount: 'Cantidade',
    unit: 'Unidade',
    date: 'Data',
    calendar: 'Calendario',
    from: 'Dende',
    to: 'a',
    add: 'engadir',
    add_reference: 'engadir referencia',
    add_value: 'valor engadido',
    add_qualifier: 'engadir cualificativo',
    add_claim: 'engadir declaración',
    cancel: 'cancelar',
    create: 'Crear',
    items: 'elementos'
  },
  menu: {
    item: {
      welcome: {
        label: 'Benvido'
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
            label: 'Persoa'
          },
          bibid: {
            label: 'Referencia'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Xeografía'
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
      },
      crete: {
        label: 'Crear',
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
            label: 'Persoa'
          },
          bibid: {
            label: 'Referencia'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Xeografía'
          },
          subid: {
            label: 'Asunto'
          },
          cnum: {
            label: 'Testimonio textual'
          },
          copid: {
            label: 'Copia adicional'
          }
        }
      }
    }
  },
  auth: {
    login: {
      label: 'Iniciar sesión',
      success: 'Inicio de sesión exitoso!'
    },
    logout: {
      label: 'Pechar sesión',
      success: 'Ata a próxima vez!'
    }
  },
  welcome: {
    title: 'Benvido'
  },
  search: {
    form: {
      common: {
        find_text: 'Busca texto',
        section: {
          advanced: 'Busca avanzada',
          external_description: 'Descrición externa'
        },
        group: {
          label: 'Base de datos'
        },
        group_all: {
          label: 'Todos'
        },
        bitagap_group: {
          label: 'Subgrupo',
          options: {
            all: 'Todo',
            original: 'Orixinal',
            cartas: 'Letras'
          }
        },
        simple_search: {
          label: 'Busca simple',
          hint: 'Use este campo para buscar información non localizable en campos con nome. Por exemplo, en <b>MsEd</b>, información codicolóxica; ou, en WORK, escriba “trad*” en <b>Busca sinxela</b> para producir unha lista de obras que foron traducidas desde o seu idioma orixinal.'
        },
        q_number: {
          label: 'Número Q',
          hint: 'O número Q de wikibase.'
        },
        philobiblon_id: {
          label: 'PhiloBiblon ID',
          hint: 'Introduza só o número de identificación de PhiloBiblon.'
        },
        subject: {
          label: 'Tema',
          hint: 'Ten en conta ao buscar en Asunto que o seu uso non é uniforme en todas as páxinas de busca nin nas tres bibliografías.<br/>Busca usando un título completo ou calquera palabra contida en calquera título (por exemplo, un nome de lugar). Por razóns técnicas, só se pode buscar un título de materia á vez. As buscas de dous títulos de materia diferentes ou de palabras de dous títulos de materias devolverán cero resultados. En BITAGAP, por exemplo, busca “milagres” ou “mariologia”, pero non “milagres” e “mariologia”.'
        },
        place: {
          label: 'Lugar',
          hint: 'Os nomes dos lugares aparecen en varias páxinas de busca: WORK - <b>Lugar de composición</b>; PERSOA - <b>Lugar asociado</b>; BIBLIOTECA - <b>Cidade</b>; REFERENCIA - <b>Lugar de publicación</b>; MSED - <b>Cidade</b>.'
        },
        date: {
          label: 'Data',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.',
          error: {
            invalid_date: 'Data non válida. Usar o formato AAAA-MM-DD',
            invalid_year: 'O ano debe estar entre 0 e 2125'
          }
        },
        personal_name: {
          label: 'Nome persoal',
          hint: 'Para buscar un nome persoal como <b>Autor</b> dun texto en WORK, utiliza calquera forma do nome, orixinal, traducido ou variante. Por exemplo, busque "Benedictus", "Bento", "Benet" ou "Benito".<br/>En todas as outras páxinas de busca e en todos os demais campos, como persoas (asociadas), autores de referencias secundarias, anteriores propietarios, tradutores, mecenas, copistas, editores, é dicir, para calquera nome persoal buscado en calquera campo que non sexa o de Autor en WORK, use a versión moderna do nome.<br/>Consello: para identificar a forma moderna dun nome. nome, busca en PERSOA calquera forma en <b>Nome</b>, orixinal, traducido, pseudónimo, etc.'
        },
        search_type: {
          all_words: 'Todas as palabras',
          any_word: 'Calquera palabra'
        }
      },
      texid: {
        author: {
          label: 'Autor',
          hint: 'Para buscar un nome persoal como <b>Autor</b> dun texto en WORK, utiliza calquera forma do nome, orixinal, traducido ou variante. Por exemplo, busque "Benedictus", "Bento", "Benet" ou "Benito".<br/>En todas as outras páxinas de busca e en todos os demais campos, como persoas (asociadas), autores de referencias secundarias, anteriores propietarios, tradutores, mecenas, copistas, editores, é dicir, para calquera nome persoal buscado en calquera campo que non sexa o de Autor en WORK, use a versión moderna do nome.<br/>Consello: para identificar a forma moderna dun nome. nome, busca en PERSOA calquera forma en <b>Nome</b>, orixinal, traducido, pseudónimo, etc.'
        },
        title: {
          label: 'Título',
          hint: 'Busca obras en prosa utilizando a forma moderna do título ou, para unha obra traducida, o orixinal ou o título traducido. Para unha busca ampla, a primeira (por exemplo, "vida") devolverá xeralmente máis obras que a segunda ("vita"). Todas as buscas devolven obras segundo calquera dos seus títulos coñecidos. Tamén podes usar (calquera parte de) unha data para buscar neste campo. Para textos poéticos individuais, consulte <b>Incipit/Explicit</b> a continuación a menos que o poema teña un título de uso habitual, por exemplo, en BITAGAP, Poema da Batalha do Salado. Tamén se poden buscar neste campo os títulos dos cancioneiros (por exemplo, Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles).'
        },
        incipit: {
          label: 'Incipit',
          hint: 'Este importante campo de busca pode axudar na identificación dun texto.<br/>Para cada traballo, hai (a) un rexistro mestre (cun ​​<b>texid</b> único) e (b) unha serie de rexistros por cada copia supervivente coñecida da obra (cada unha cun <b>cnum</b> único). Para os primeiros modernizáronse os incipits/explícitos; para estes últimos, os incipits/explícitos reprodúcense paleográfica ou semipaleográficamente, dependendo da bibliografía (con ou sen marcas de supresión, abreviaturas resoltas ou non resoltas, faltas de ortografía, etc.) tal e como se atopa no manuscrito ou na edición impresa ou como se transcribe nun secundario. fonte. Unha busca neste campo debería devolver unha lista de obras baseada tanto nos incipits/explícitos modernizados como nos orixinais. Cando intente identificar un texto, repita a busca utilizando variantes das palabras menos habituais. Nalgúns casos, especialmente para textos con gran número de copias e sen edición moderna, só se rexistraron incipits e explícitos nos rexistros de copias. Este é particularmente o caso de BETA.<br/>Para localizar un texto poético, en <b>Incipit</b> busca calquera palabra ou palabras que aparezan na primeira liña.'
        },
        explicit: {
          label: 'Explicit',
          hint: 'Este importante campo de busca pode axudar na identificación dun texto.<br/>Para cada traballo, hai (a) un rexistro mestre (cun ​​<b>texid</b> único) e (b) unha serie de rexistros por cada copia supervivente coñecida da obra (cada unha cun <b>cnum</b> único). Para os primeiros modernizáronse os incipits/explícitos; para estes últimos, os incipits/explícitos reprodúcense paleográfica ou semipaleográficamente, dependendo da bibliografía (con ou sen marcas de supresión, abreviaturas resoltas ou non resoltas, faltas de ortografía, etc.) tal e como se atopa no manuscrito ou na edición impresa ou como se transcribe nun secundario. fonte. Unha busca neste campo debería devolver unha lista de obras baseada tanto nos incipits/explícitos modernizados como nos orixinais. Cando intente identificar un texto, repita a busca utilizando variantes das palabras menos habituais. Nalgúns casos, especialmente para textos con gran número de copias e sen edición moderna, só se rexistraron incipits e explícitos nos rexistros de copias. Este é particularmente o caso de BETA.<br/>Para localizar un texto poético, en <b>Incipit</b> busca calquera palabra ou palabras que aparezan na primeira liña.'
        },
        associated_person: {
          label: 'Persoa asociada',
          hint: ''
        },
        place_composition: {
          label: 'Lugar de composición',
          hint: ''
        },
        date_composition: {
          label: 'Data de composición',
          hint: 'Busca aaaa e/ou mm e/ou dd. Unha busca aquí pode devolver a data de composición, confirmación, revisión, tradución, promulgación, etc.'
        },
        type: {
          label: 'Tipo',
          hint: ''
        },
        language: {
          label: 'Lingua',
          hint: ''
        },
        poetic_form: {
          label: 'Forma poética',
          hint: ''
        }
      },
      libid: {
        city: {
          label: 'Cidade',
          hint: 'Busca polo nome da cidade na súa lingua nativa (por exemplo, Nova York, Florencia, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Busca por calquera dos nomes formais ou de uso habitual da biblioteca (por exemplo, en BETA, busca Real Biblioteca, Biblioteca de Palacio ou simplemente Palacio).'
        },
        call_number: {
          label: 'Posición de inventario',
          hint: ''
        }
      },
      insid: {
        city: {
          label: 'Cidade',
          hint: 'Busque polo nome da cidade na súa lingua nativa (isto é, New York, Firenze etc.).'
        },
        institution_type: {
          label: 'Tipo de institución',
          hint: 'Busca por tipo de institución.'
        },
        institution: {
          label: 'Institución',
          hint: 'Busca por calquera dos nomes formais ou de uso habitual da institución (por exemplo, en BETA, busca Universidade Complutense, Universidade de Madrid ou Universidade Central).'
        }
      },
      bioid: {
        name: {
          label: 'Nome',
          hint: ''
        },
        title: {
          label: 'Título',
          hint: 'Isto refírese a un título conferido a un individuo (polo rei, nobre; Igrexa; por un período determinado, hereditario ou de por vida). Tamén se pode buscar en calquera lugar ao que estea adxunto o título conferido (por exemplo, en BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Data',
          hint: 'Busca a data de nacemento, a morte, a concesión dun título ou outro evento histórico.'
        },
        associated_place: {
          label: 'Lugar asociado',
          hint: 'Busca o lugar (na forma moderna) de nacemento, morte, residencia ou outro evento histórico.'
        },
        religious_order: {
          label: 'Orde relixosa ou militar',
          hint: 'Para as ordes relixiosas busca pola sigla estándar, por exemplo, OSB, OFM, SJ, Ocist. Teña en conta que a identificación de profesións é esporádica nas tres bibliografías.<br/>NOTA: a sección de Persoas Asociadas de cada rexistro debe tratarse con precaución, especialmente para aqueles individuos con numerosas relacións. O programa de base de datos está deseñado para establecer un vínculo recíproco entre dous rexistros automaticamente. Así, cando o rexistro de "Juana la Loca" (BETA bioide 7208) foi vinculado ao de Fernando V (bioide 1104) como a súa filla, o seu rexistro actualizouse automaticamente para mostrarlle como o seu pai. Desafortunadamente, debido a erros de programación este proceso de actualización automática estableceu en ocasións ligazóns erróneas con outros rexistros. Co paso do tempo estes erros eliminaranse. Solicitamos a colaboración dos nosos usuarios para que nos axuden a identificalos.'
        },
        profession: {
          label: 'Profesión, oficio u ocupación',
          hint: 'Para profesións consulte a lista nas páxinas de axuda relacionadas.'
        },
        religion: {
          label: 'Relixión',
          hint: ''
        }
      },
      bibid: {
        author: {
          label: 'Autor/Creador',
          hint: 'Busca por calquera forma ou parte do nome do <b>autor</b> (dunha monografía ou artigo) e calquera persoa asociada coa obra <b>que non sexa o autor</b> (por exemplo, o autor de prólogo, coordinador, editor ou director de serie ou colección, etc.).'
        },
        title: {
          label: 'Título',
          hint: 'Busca por monografía ou título do artigo (enteiras ou parciais, palabras máis distintivas).'
        },
        date: {
          label: 'Data',
          hint: 'Busca por ano de publicación.'
        },
        volume: {
          label: 'Revista / volume colectivo',
          hint: 'Busca por título da revista (impresa ou electrónica) ou volume recollido (actas ou actas de congresos, volumes de homenaxe, etc.).'
        },
        place_publication: {
          label: 'Lugar de publicación',
          hint: 'Busca polo nome da cidade de publicación na súa lingua nativa.'
        },
        publisher: {
          label: 'Editor',
          hint: 'Busca por editor (por exemplo, "University of California Press").'
        },
        series: {
          label: 'Colección / serie',
          hint: 'Busca por serie (p. ex., en BITAGAP, “Subsídios para a história da arte”).'
        },
        locations: {
          label: 'Localizacións',
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
          label: 'Cidade',
          hint: ''
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by the current or former name of the library that holds the manuscript or printed edition.'
        },
        date_of_artifact: {
          label: 'Data do obxecto',
          hint: ''
        },
        date_of_publication: {
          label: 'Data de publicación',
          hint: ''
        },
        place_production: {
          label: 'Lugar de produción',
          hint: 'Search by the name of a city or place in its modern form.'
        },
        scribe_printer: {
          label: 'Copista / impresor',
          hint: 'Search for a scribe using any form of the name. For a printer, use the name in its original form (e.g., in BITAGAP, “Hermann von Kempen” rather than “Hermão de Campos”). To learn the original form of a printer\'s name, search first in PERSON.'
        },
        publisher_patron: {
          label: 'Editor / mecenas',
          hint: 'For a printed edition, search for the person who sponsored it using the modern form of the name. For a manuscript, search for the modern form of the name of the patron for whom it was copied.'
        },
        previous_owner: {
          label: 'Antigo propietario',
          hint: 'Search for any person or institution that has owned the object by a person\'s name or title, by the name of a monastery, museum, auction house, etc.'
        },
        associated_person: {
          label: 'Persoa asociada',
          hint: ' Search using any form of the name. A search returns the name of a binder, illuminator, annotator, etc.'
        },
        call_number: {
          label: 'Posición de inventario',
          hint: ''
        },
        title: {
          label: 'Título',
          hint: ''
        },
        type: {
          label: 'Tipo',
          hint: ''
        },
        writing_surface: {
          label: 'Superficie de escritura',
          hint: ''
        },
        format: {
          label: 'Formato',
          hint: ''
        },
        binding: {
          label: 'Encadernación',
          hint: ''
        },
        collation: {
          label: 'Cotexo',
          hint: ''
        },
        hand: {
          label: 'Man',
          hint: ''
        },
        font: {
          label: 'Tipo de letra',
          hint: ''
        },
        watermark: {
          label: 'Marca de auga',
          hint: ''
        },
        graphic_feature: {
          label: 'Característica gráfica',
          hint: ''
        },
        physical_feature: {
          label: 'Característica física',
          hint: ''
        },
        music: {
          label: 'Música',
          hint: ''
        }
      },
      geoid: {
        type: {
          label: 'Tipo',
          hint: ''
        },
        class: {
          label: 'Clase',
          hint: ''
        }
      },
      subid: {
        headings: {
          label: 'Materia',
          hint: ''
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
        name: 'Nome',
        id: 'ID'
      },
      not_found: 'Non se atoparon resultados.'
    }
  },
  item: {
    label: 'Elemento',
    title: 'Título',
    description: 'Descrición',
    back: 'Volve',
    identifiers: 'Identificadores',
    related_items: 'Elementos relacionados',
    notes: 'Notas',
    messages: {
      invalid_id: 'Identificador non válido.',
      not_found: 'Non atopado.',
      invalid_url: 'Enche un URL válido!'
    },
    create: {
      button: {
        text: 'Crear elemento',
        enabled: 'Crea un novo elemento'
      },
      calculating_new_pbid: 'Calculando o novo ID de PhiloBiblon ..'
    },
    related: {
      manid: {
        related_ms_ed: 'Ms/Ed relacionados',
        manuscript_edition: 'Edición manuscrita',
        text: 'Texto'
      },
      texid: {
        uniform_title: 'Testemuños textuais',
        related_uniform_titles: 'Testemuños textuais relacionados'
      },
      bibid: {
        related_bibliography: 'Bibliografía relacionada'
      },
      bioid: {
        subject_references: 'Referencias temáticas',
        authors: 'Autores',
        commentary: 'Comentario',
        financed_by: 'Financiado por',
        former_owners: 'Antigos propietarios',
        handwritten_by: 'Escrito a man por',
        milestones: 'Fitos',
        owner: 'Propietario',
        printed_by: 'Impreso por',
        related_individuals: 'Individuos relacionados',
        translator: 'Tradutor'
      },
      copid: {
        related_copies: 'Copias relacionadas'
      },
      geoid: {
        career_statement: 'Declaración de carreira',
        first_known_date: 'Primeira data coñecida',
        former_owners: 'Antigos propietarios',
        from_place: 'Do lugar mencionado',
        history: 'Historia',
        itinerary: 'Itinerario',
        last_known_date: 'Última data coñecida',
        location: 'Localización',
        milestones: 'Fitos',
        owner: 'Propietario',
        place_of_birth: 'Lugar de nacemento',
        place_of_death: 'Lugar da morte',
        place_of_publication: 'Lugar de publicación',
        related_places: 'Lugares relacionados',
        religious_background: 'Antecedentes relixiosos',
        religious_order: 'Orde relixiosa',
        subject_references: 'Referencias temáticas'
      },
      insid: {
        authors: 'Autores',
        financed_by: 'Financiado por',
        former_owners: 'Antigos propietarios',
        handwritten_by: 'Escrito a man por',
        milestones: 'Fitos',
        owner: 'Propietario',
        printed_by: 'Impreso por',
        related_institutions: 'Institucións relacionadas',
        subject_references: 'Referencias temáticas'
      },
      libid: {
        related_libraries: 'Bibliotecas relacionadas',
        present_holding: 'Tenencia actual'
      },
      subid: {
        subject_references: 'Referencias temáticas'
      }
    }
  },
  privacyPolicy: {
    label: 'Política de Privacidade',
    tooltip: 'Estamos a usar cookies estrictamente necesarias: estas cookies son esenciais para que navegues polo sitio web e utilices as súas funcións, como acceder a áreas seguras do sitio ou lembrar o idioma seleccionado.',
    consent: {
      title: 'Datos recollidos en base ao consentimento',
      desc: 'Tras a súa solicitude e expresión de consentimento, recollemos os seguintes datos co fin de proporcionarlle servizos. Os teus datos non se usan para ningún outro propósito nin se comparten con terceiros. Elimínase tras a súa retirada do consentimento ou a súa solicitude para finalizar estes servizos.'
    },
    comments: {
      title: 'Comentarios',
      subtitle: 'Nome, enderezo de correo electrónico, contido do comentario',
      subtitleDesc: 'estes datos recóllense cando deixa un comentario e aparecen no sitio web.',
      desc: 'Se deixas un comentario no sitio web, o teu nome e enderezo de correo electrónico tamén se gardarán en cookies. Son para a túa comodidade para que non teñas que volver a encher os teus datos cando deixes outro comentario. Estas cookies gardaranse no teu ordenador ata que as elimines.'
    },
    userAgent: {
      subtitle: 'IP e cadea de axente de usuario do navegador',
      subtitleDesc: 'estes datos recóllense cando deixas un comentario.'
    },
    retentionPeriod: {
      subtitle: 'Período de retención',
      subtitleDesc: 'os datos mencionados consérvanse indefinidamente para que poidamos recoñecer e aprobar calquera comentario de seguimento automaticamente en lugar de mantelos nunha cola de moderación.'
    },
    legitimateInterest: {
      title: 'Datos recollidos en base ao interese lexítimo',
      desc: 'En función dos nosos intereses lexítimos, recompilamos os seguintes datos co propósito de executar este sitio web. Os teus datos non se usan para ningún outro propósito nin se comparten con terceiros. Elimínase cando o solicites.'
    },
    statistics: {
      title: 'Estatísticas',
      desc: 'O sitio web utiliza unha versión mínima de Google Analytics, un servizo que transmite datos de tráfico do sitio web aos servidores de Google nos Estados Unidos e que nos permite observar tendencias para mellorar a experiencia do usuario no noso sitio web. Esta compilación mínima procesa datos persoais como: o ID de usuario único definido por Google Analytics, a data e a hora, o título da páxina que se está a ver, o URL da páxina que se está a ver, o URL da páxina que se viu antes da páxina actual, a resolución da pantalla, a hora na zona horaria local, os ficheiros nos que se fixo clic e se descargaron, as ligazóns nos que se fixo clic a un dominio externo, o tipo de dispositivo e o país, rexión e cidade. <br/> <br/>Podes desactivar este seguimento en calquera momento activando a opción "Non rastrexar" no teu navegador.'
    },
    embedContent: {
      title: 'Contido incorporado doutros sitios web',
      desc: 'Os artigos do sitio web poden incluír contido incorporado (por exemplo, vídeos, gráficos, etc.). O contido incrustado doutros sitios web compórtase exactamente do mesmo xeito que se o visitante visitara o outro sitio web. <br/> <br/>\n' +
        'Estes sitios web poden recoller datos sobre ti, usar cookies, incorporar seguimento adicional de terceiros e supervisar a túa interacción con ese contido incrustado, incluído o rastrexo da túa interacción co contido incrustado se tes unha conta e iniciaches sesión nese sitio web.'
    },
    rights: {
      title: 'Os teus dereitos sobre os teus datos',
      desc: 'Se deixou comentarios no sitio web, pode solicitar recibir un ficheiro exportado dos datos persoais que temos sobre vostede, incluídos os datos que nos proporcionou. Tamén pode solicitar que rectifiquemos ou borremos os datos persoais que teñamos sobre vostede. Envía a túa solicitude a <a href="mailto:legal@gdpr.eu">legal@gdpr.eu</a>',
      data: '• Dereito a retirar o consentimento <br/>\n' +
        '• O dereito de acceso<br/>\n' +
        '• Dereito á supresión<br/>\n' +
        '• Dereito de rectificación<br/>\n' +
        '• Dereito á portabilidade dos datos<br/>\n' +
        '• Dereito de oposición<br/>\n' +
        '• Notificación de violacións de datos<br/>\n' +
        '• Dereito a presentar unha reclamación ante unha autoridade de control'
    }
  },
  messages: {
    error: {
      something_went_wrong: 'Algo salió mal!',
      session: {
        expired: 'A sesión caducou'
      },
      inputs: {
        label: 'Please fill label',
        fill: 'Por favor, enche as entradas',
        description: 'Please fill description',
        initial_claims: 'Claims are still loading',
        claim_value_missing: 'Please fill in the claim value for "{propertyLabel}"',
        qualifier_key_missing: 'A qualifier property is missing in the claim "{claimLabel}" for "{propertyLabel}"',
        qualifier_value_missing: 'Some qualifier(s) value are missing in the claim "{claimLabel}" for "{propertyLabel}"'
      },
      modification: {
        failed: 'A etiqueta e a descrición do código de idioma gl non poden ter o mesmo valor.'
      },
      creation: {
        pbid_already_exists: 'O PhiloBiblon ID "{pbid}" xa existe en {item}.'
      }
    },
    success: {
      updated: 'Actualizouse correctamente'
    }
  },
  wiki: {
    search: {
      placeholder: 'Busca en PhiloBiblon'
    }
  }
}
