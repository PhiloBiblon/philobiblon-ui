export default {
  common: {
    label: 'Etiqueta',
    property: 'Propiedade',
    properties: 'Propriedades',
    per_page: 'por página',
    value: 'Valor',
    no_data: 'Nenhum dado disponível',
    loading: 'Carregando..',
    language: 'Linguagem',
    amount: 'Montante',
    unit: 'Unidade',
    date: 'Data',
    calendar: 'Calendário',
    advanced_search: 'Busca avançada',
    from: 'De',
    to: 'para',
    add: 'adicionar',
    add_reference: 'adicionar referência',
    add_value: 'agregar valor',
    add_qualifier: 'adicionar qualificador',
    add_claim: 'adicionar declaração',
    save: 'salvar',
    remove: 'remover',
    cancel: 'Cancelar',
    create: 'Criar',
    items: 'unid'
  },
  menu: {
    item: {
      welcome: {
        label: 'Bem-vindo'
      },
      search: {
        label: 'Pesquisar',
        item: {
          texid: {
            label: 'Obra'
          },
          libid: {
            label: 'Biblioteca'
          },
          insid: {
            label: 'Instituição'
          },
          bioid: {
            label: 'Pessoa'
          },
          bibid: {
            label: 'Referência'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Geografia'
          },
          subid: {
            label: 'Assunto'
          },
          cnum: {
            label: 'cnum'
          },
          copid: {
            label: 'copid'
          }
        }
      },
      create: {
        label: 'Criar',
        item: {
          texid: {
            label: 'Obra'
          },
          libid: {
            label: 'Biblioteca'
          },
          insid: {
            label: 'Instituição'
          },
          bioid: {
            label: 'Pessoa'
          },
          bibid: {
            label: 'Referência'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Geografia'
          },
          subid: {
            label: 'Assunto'
          },
          cnum: {
            label: 'Testemunho textual'
          },
          copid: {
            label: 'Cópia adicional'
          }
        }
      }
    }
  },
  auth: {
    login: {
      label: 'Conecte-se',
      success: 'Login realizado com sucesso!'
    },
    logout: {
      label: 'Sair',
      success: 'Até a próxima!'
    }
  },
  welcome: {
    title: 'Bem-vindo'
  },
  search: {
    form: {
      common: {
        find_text: 'Encontrar texto',
        section: {
          advanced: 'Busca avançada',
          external_description: 'Descrição externa'
        },
        group: {
          label: 'Banco de dados'
        },
        group_all: {
          label: 'Todos'
        },
        bitagap_group: {
          label: 'Subgrupo',
          options: {
            all: 'Tudo',
            original: 'Original',
            cartas: 'Cartas'
          }
        },
        simple_search: {
          label: 'Pesquisa simples',
          hint: 'Utilize este campo para pesquisar informações não localizadas em campos nomeados. Por exemplo, em <b>MsEd</b>, informação codiológica; ou, em WORK, digite “trad*” em <b>Simples pesquisa</b> para produzir uma lista de trabalhos que foram traduzidos da sua linguagem original.'
        },
        q_number: {
          label: 'Número Q',
          hint: 'O número Q da wikibase.'
        },
        philobiblon_id: {
          label: 'PhiloBiblon ID',
          hint: 'Introduza apenas o número de identificação do PhiloBiblon.'
        },
        subject: {
          label: 'Assunto',
          hint: 'Tenha em mente ao pesquisar em Assunto que a sua utilização não é uniforme em todas as páginas de pesquisa nem nas três bibliografias. <br/>Pesquisar utilizando um título completo ou qualquer palavra contida em qualquer título (por exemplo, um nome de lugar). Por razões técnicas, apenas um título pode ser pesquisado de cada vez. A pesquisa por dois títulos de assuntos diferentes ou por palavras de dois títulos de assuntos diferentes irá devolver os resultados zero. No BITAGAP, por exemplo, pesquise “milagres” ou por “mariologia”, mas não por “milagres” e “mariologia”.'
        },
        place: {
          label: 'Lugar',
          hint: 'Os nomes dos lugares aparecem em várias páginas de pesquisa: TRABALHO - <b>Lugar de composição</b>; PERSON - <b>Loca-associação</b>; BIBLIOTECA - <b>Cidade</b>; REFERÊNCIA - <b>Lugar de publicação</b>; MSED - <b>Cidade</b>.'
        },
        date: {
          label: 'Data',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.',
          error: {
            invalid_date: 'Data inválida. Utilize o formato AAAA-MM-DD',
            invalid_year: 'O ano deve estar entre 0 e 2125'
          }
        },
        personal_name: {
          label: 'Nome pessoal',
          hint: 'Para procurar um nome pessoal como <b>Autor</b> de um texto em TRABALHO, utilize qualquer forma de nome, original, traduzido ou uma variante. Por exemplo, pesquise por “Benedictus”, “Bento”, “Benet” ou “Benito.”<br/>Em todas as outras páginas de pesquisa e em todos os outros campos, como pessoas (associadas), autores de referências secundárias, anteriores proprietários, tradutores, patronos, copistas, editores, isto é, para qualquer nome pessoal pesquisado em qualquer campo que não seja o do Autor em WORK, utilize a versão moderna do nome. <br/>Dica: para identificar a forma moderna de um nome, pesquise em PERSON para qualquer formulário em <b>Name</b>, original, traduzido, pseudónimo, etc.'
        },
        search_type: {
          all_words: 'Todas as palavras ',
          any_word: 'Qualquer palavra'
        }
      },
      texid: {
        author: {
          label: 'Autor',
          hint: 'Para procurar um nome pessoal como <b>Autor</b> de um texto em TRABALHO, utilize qualquer forma de nome, original, traduzido ou uma variante. Por exemplo, pesquise por “Benedictus”, “Bento”, “Benet” ou “Benito.”<br/>Em todas as outras páginas de pesquisa e em todos os outros campos, como pessoas (associadas), autores de referências secundárias, anteriores proprietários, tradutores, patronos, copistas, editores, isto é, para qualquer nome pessoal pesquisado em qualquer campo que não seja o do Autor em WORK, utilize a versão moderna do nome. <br/>Dica: para identificar a forma moderna de um nome, pesquise em PERSON para qualquer formulário em <b>Name</b>, original, traduzido, pseudónimo, etc.'
        },
        title: {
          label: 'Título',
          hint: 'Procure trabalhos em prosa utilizando a forma moderna do título ou, por um trabalho traduzido, o título original ou traduzido. Para uma pesquisa ampla, o primeiro (e.g., “vida”) irá geralmente devolver mais obras do que as últimas (“vita”). Todas as pesquisas de regresso funcionam de acordo com qualquer um dos seus títulos conhecidos. Também pode utilizar (qualquer parte de) uma data para pesquisar neste campo. Para textos poéticos individuais, ver <b>Incipit/Explicit</b> abaixo, a menos que o poema tenha um título comummente utilizado, por exemplo, no BITAGAP, Poema da Batalha do Salado. Os títulos de Songbook (por exemplo, Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles) também podem ser pesquisados ​​neste campo.'
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
          label: 'Pessoa associada',
          hint: ''
        },
        place_composition: {
          label: 'Local de composição',
          hint: ''
        },
        date_composition: {
          label: 'Data de composição',
          hint: 'Pesquise por aaaa e/ou mm e/ou dd. Uma pesquisa aqui pode devolver a data de composição, confirmação, revisão, tradução, promulgação, etc.'
        },
        type: {
          label: 'Tipo',
          hint: ''
        },
        language: {
          label: 'Linguagem',
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
          hint: 'Pesquise pelo nome da cidade na sua língua nativa (por exemplo, Nova Iorque, Firenze, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Pesquise por qualquer um dos nomes formais ou comummente utilizados da biblioteca (por exemplo, no BETA, pesquise por Real Biblioteca, Biblioteca de Palacio ou simplesmente Palacio).'
        },
        call_number: {
          label: 'Posição de stock',
          hint: ''
        }
      },
      insid: {
        city: {
          label: 'Cidade',
          hint: 'Pesquise pelo nome da cidade na sua língua nativa (isto é New York, Firenze, etc.).'
        },
        institution_type: {
          label: 'Tipo de instituição',
          hint: 'Pesquisar por tipo de instituição.'
        },
        institution: {
          label: 'Instituição',
          hint: 'Pesquise por qualquer um dos nomes formais ou comummente utilizados da instituição (por exemplo, na BETA, pesquise por Universidad Comlutense, Universidad de Madrid ou Universidad Central).'
        }
      },
      bioid: {
        name: {
          label: 'Nome',
          hint: ''
        },
        title: {
          label: 'Título',
          hint: 'Este refere-se a um título conferido a um indivíduo (por rei, nobre; Igreja; por um determinado período, hereditária ou para a vida). Também pode pesquisar qualquer lugar ao qual o título conferido esteja anexado (por exemplo, em BITAGAP, Bispo Oronese, Rei Castela Leão).'
        },
        date: {
          label: 'Data',
          hint: 'Procure data de nascimento, morte, conferência de título ou outro evento de marcos.'
        },
        associated_place: {
          label: 'Local associado',
          hint: 'Procure lugar (na forma moderna) de nascimento, morte, residência ou outro evento de marcos.'
        },
        religious_order: {
          label: 'Ordem religiosa ou militar',
          hint: 'Para as ordens religiosas, pesquise pela sigla padrão, por exemplo, OSB, OFM, SJ, Ocista. Note-se que a identificação de profissões é esporádica em todas as três bibliografias. <br/>NOTA: A secção de Pessoas Associadas de cada registo deve ser tratada com cautela, especialmente para os indivíduos com numerosas relações. O programa de base de dados foi concebido para estabelecer uma ligação recíproca entre dois registos automaticamente. Assim, quando o registo de "Juana la Loca" (BETA bioid 7208) estava ligado ao de Fernando V (bióide 1104) como sua filha, o seu registo foi automaticamente atualizado para lhe mostrar como seu pai. Infelizmente, devido a erros de programação, este processo de atualização automática por vezes estabeleceu ligações erradas com outros registos. Com o tempo, estes erros serão eliminados. Solicitamos a colaboração dos nossos utilizadores para nos ajudar a identificá-los.'
        },
        profession: {
          label: 'Profissão, comércio ou ocupação',
          hint: 'Para profissões, consulte a lista nas páginas de ajuda relacionadas.'
        },
        religion: {
          label: 'Religião',
          hint: ''
        }
      },
      bibid: {
        author: {
          label: 'Autor/Criador',
          hint: 'Pesquisar por qualquer forma ou parte do nome do <b>autor</b> (de uma monografia ou artigo) e para qualquer indivíduo associado à obra <b>a não o autor</b> (por exemplo, autor de prólogo, coordenador, editor ou diretor de séries ou coleções, etc.).'
        },
        title: {
          label: 'Título',
          hint: 'Pesquisar por monografia ou título do artigo (palavras ataques ou parciais e distintas).'
        },
        date: {
          label: 'Data',
          hint: 'Pesquisar por ano de publicação.'
        },
        volume: {
          label: 'Revista / volume colectivo',
          hint: 'Pesquisar por título da revista (impressa ou eletrónica) ou volume recolhido (atos ou procedimentos de congressos, volumes de homenagem, etc.).'
        },
        place_publication: {
          label: 'Local de publicação',
          hint: 'Pesquisa por nome da cidade de publicação na sua língua nativa.'
        },
        publisher: {
          label: 'Editor',
          hint: 'Pesquisar por editor (e.g., “University of California Press”).'
        },
        series: {
          label: 'Colecção / série',
          hint: 'Pesquisar por série (por exemplo, em BITAGAP, “Subsídios para a historia da arte”).'
        },
        locations: {
          label: 'Locais',
          hint: ''
        },
        international_standard_number: {
          label: 'Número padrão internacional (ISBN, ISSN)',
          hint: ''
        },
        type: {
          label: 'Tipo',
          hint: ''
        }
      },
      manid: {
        city: {
          label: 'Cidade'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by the current or former name of the library that holds the manuscript or printed edition.'
        },
        date_of_artifact: {
          label: 'Data do objeto',
          hint: ''
        },
        date_of_publication: {
          label: 'Data de publicação',
          hint: ''
        },
        place_production: {
          label: 'Local de produção',
          hint: 'Search by the name of a city or place in its modern form.'
        },
        scribe_printer: {
          label: 'Copista / impressor',
          hint: 'Search for a scribe using any form of the name. For a printer, use the name in its original form (e.g., in BITAGAP, “Hermann von Kempen” rather than “Hermão de Campos”). To learn the original form of a printer\'s name, search first in PERSON.'
        },
        publisher_patron: {
          label: 'Editor / patrono',
          hint: 'For a printed edition, search for the person who sponsored it using the modern form of the name. For a manuscript, search for the modern form of the name of the patron for whom it was copied.'
        },
        previous_owner: {
          label: 'Antigo proprietário',
          hint: 'Search for any person or institution that has owned the object by a person\'s name or title, by the name of a monastery, museum, auction house, etc.'
        },
        associated_person: {
          label: 'Pessoa associada',
          hint: ' Search using any form of the name. A search returns the name of a binder, illuminator, annotator, etc.'
        },
        call_number: {
          label: 'Posição de stock',
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
          label: 'Superfície de escrita',
          hint: ''
        },
        format: {
          label: 'Formatar',
          hint: ''
        },
        binding: {
          label: 'Encadernação',
          hint: ''
        },
        collation: {
          label: 'Agrupamento',
          hint: ''
        },
        hand: {
          label: 'Mão',
          hint: ''
        },
        font: {
          label: 'Fonte',
          hint: ''
        },
        watermark: {
          label: 'Marca d\'água',
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
          label: 'Classe',
          hint: ''
        }
      },
      subid: {
        subject: {
          label: 'Assuntos',
          hint: ''
        }
      }
    },
    button: {
      search: 'Pesquisar',
      back: 'De volta',
      clear: 'Reiniciar'
    },
    results: {
      results: 'Resultados',
      sort_by: 'Organizar por:',
      sort_option: {
        name: 'Nome',
        id: 'ID'
      },
      not_found: 'Nenhum resultado encontrado.'
    }
  },
  item: {
    label: 'Artigo',
    title: 'Título',
    description: 'Descrição',
    back: 'Volte',
    identifiers: 'Identificadores',
    related_items: 'Itens relacionados',
    notes: 'Notas',
    messages: {
      invalid_id: 'Identificador non válido.',
      not_found: 'Non atopado.',
      invalid_url: 'Por favor preencha um URL válido!'
    },
    create: {
      button: {
        text: 'Criar elemento',
        enabled: 'Criar um novo item'
      },
      calculating_new_pbid: 'Calculando o novo ID PhiloBiblon ..'
    },
    related: {
      manid: {
        related_ms_ed: 'Ms/Ed relacionados',
        manuscript_edition: 'Edição do manuscrito',
        text: 'Texto'
      },
      texid: {
        uniform_title: 'Testimónios textuais',
        related_uniform_titles: 'Testimónios textuais relacionados'
      },
      bibid: {
        related_bibliography: 'Bibliografia relacionada'
      },
      bioid: {
        subject_references: 'Referências de assunto',
        authors: 'Autores',
        commentary: 'Comentário',
        financed_by: 'Financiado por',
        former_owners: 'Antigos proprietários',
        handwritten_by: 'Escrito à mão por',
        milestones: 'Conquistas',
        owner: 'Proprietário',
        printed_by: 'Impresso por',
        related_individuals: 'Indivíduos relacionados',
        translator: 'Tradutor'
      },
      copid: {
        related_copies: 'Cópias relacionadas'
      },
      geoid: {
        career_statement: 'Declaração de carreira',
        first_known_date: 'Primeira data conhecida',
        former_owners: 'Antigos proprietários',
        from_place: 'Do local mencionado',
        history: 'História',
        itinerary: 'Itinerário',
        last_known_date: 'Última data conhecida',
        location: 'Localização',
        milestones: 'Conquistas',
        owner: 'Proprietário',
        place_of_birth: 'Local de nascimento',
        place_of_death: 'Local da morte',
        place_of_publication: 'Local de publicação',
        related_places: 'Lugares relacionados',
        religious_background: 'Contexto religioso',
        religious_order: 'Ordem religiosa',
        subject_references: 'Referências de assunto'
      },
      insid: {
        authors: 'Autores',
        financed_by: 'Financiado por',
        former_owners: 'Antigos proprietários',
        handwritten_by: 'Escrito à mão por',
        milestones: 'Conquistas',
        owner: 'Proprietário',
        printed_by: 'Impresso por',
        related_institutions: 'Instituições relacionadas',
        subject_references: 'Referências de assunto'
      },
      libid: {
        related_libraries: 'Bibliotecas relacionadas',
        present_holding: 'Posse atual'
      },
      subid: {
        subject_references: 'Referências de assunto'
      }
    }
  },
  privacyPolicy: {
    label: 'Política de Privacidade',
    tooltip: 'Estamos a utilizar cookies estritamente necessários — Estes cookies são essenciais para que possa navegar no site e utilizar as suas funcionalidades, como o acesso a áreas seguras do site ou lembre-se do idioma selecionado.',
    consent: {
      title: 'Data collected on the basis of consent',
      desc: 'Mediante o seu pedido e manifestação de consentimento, recolhemos os seguintes dados com a finalidade de lhe prestar serviços. Os seus dados não são utilizados para quaisquer outros fins nem partilhados com terceiros. É removido mediante a retirada do seu consentimento ou o seu pedido para terminar esses serviços.'
    },
    comments: {
      title: 'Comentários',
      subtitle: 'Nome, endereço de e-mail, conteúdo do comentário',
      subtitleDesc: 'estes dados são recolhidos quando deixa um comentário e apresentados no Site.',
      desc: 'Se deixar um comentário no Site, o seu nome e endereço de e-mail também serão guardados nos cookies. São para sua comodidade, para que não tenha de preencher novamente os seus dados ao deixar outro comentário. Estes cookies serão guardados no seu computador até que os apague.'
    },
    userAgent: {
      subtitle: 'String do agente de utilizador do IP e do browser',
      subtitleDesc: 'estes dados são recolhidos quando deixa um comentário.'
    },
    retentionPeriod: {
      subtitle: 'Período de retenção',
      subtitleDesc: 'os dados acima mencionados são retidos indefinidamente para que possamos reconhecer e aprovar quaisquer comentários de acompanhamento automaticamente, em vez de os manter numa fila de moderação.'
    },
    legitimateInterest: {
      title: 'Dados recolhidos com base em interesse legítimo',
      desc: 'Com base nos nossos interesses legítimos, recolhemos os seguintes dados para efeitos de funcionamento deste site. Os seus dados não são utilizados para quaisquer outros fins nem partilhados com terceiros. É removido mediante sua solicitação.'
    },
    statistics: {
      title: 'Estatisticas',
      desc: 'O site utiliza uma versão mínima do Google Analytics, um serviço que transmite os dados de tráfego do site para os servidores da Google nos Estados Unidos e nos permite perceber tendências para melhorar a experiência do utilizador no nosso site. Esta compilação mínima processa dados pessoais como: o ID de utilizador único definido pelo Google Analytics, a data e hora, o título da página que está a ser visualizada, o URL da página que está a ser visualizada, o URL da página que foi visualizada antes do página atual, a resolução do ecrã, a hora no fuso horário local, os ficheiros que foram clicados e descarregados, as ligações clicadas para um domínio externo, o tipo de dispositivo e o país, região e cidade. <br/> <br/>Pode cancelar este rastreio a qualquer momento, ativando a definição “Não rastrear” no seu navegador.'
    },
    embedContent: {
      title: 'Conteúdo incorporado de outros sites',
      desc: 'Os artigos no Site podem incluir conteúdo incorporado (por exemplo, vídeos, gráficos, etc.). O conteúdo incorporado de outros sites comporta-se exatamente da mesma forma como se o visitante tivesse visitado o outro site. <br/> <br/>\n' +
        'Estes sites podem recolher dados sobre si, utilizar cookies, incorporar um rastreio adicional de terceiros e monitorizar a sua interação com esse conteúdo incorporado, incluindo rastrear a sua interação com o conteúdo incorporado se tiver uma conta e estiver ligado a esse site.'
    },
    rights: {
      title: 'Os seus direitos relativos aos seus dados',
      desc: 'Se deixou comentários no Site, pode solicitar a receção de um ficheiro exportado dos dados pessoais que mantemos sobre si, incluindo quaisquer dados que nos tenha fornecido. Pode também solicitar que retifiquemos ou apaguemos quaisquer dados pessoais que tenhamos sobre si. Por favor envie o seu pedido para <a href="mailto:legal@gdpr.eu">legal@gdpr.eu</a>',
      data: '• O direito de retirar o consentimento <br/>\n' +
        '• O direito de acesso<br/>\n' +
        '• O direito ao apagamento<br/>\n' +
        '• O direito à retificação<br/>\n' +
        '• O direito à portabilidade dos dados<br/>\n' +
        '• O direito de oposição<br/>\n' +
        '• Notificação de violações de dados<br/>\n' +
        '• O direito de apresentar uma queixa a uma autoridade de supervisão'
    }
  },
  messages: {
    error: {
      something_went_wrong: 'Algo correu mal!',
      session: {
        expired: 'Sessão expirada'
      },
      inputs: {
        label: 'Please fill label',
        fill: 'Por favor preencha as entradas',
        description: 'Please fill description',
        initial_claims: 'Claims are still loading',
        claim_value_missing: 'Please fill in the claim value for "{propertyLabel}"',
        qualifier_key_missing: 'A qualifier property is missing in the claim "{claimLabel}" for "{propertyLabel}"',
        qualifier_value_missing: 'Some qualifier(s) value are missing in the claim "{claimLabel}" for "{propertyLabel}"'
      },
      modification: {
        failed: 'O rótulo e a descrição do código do idioma en não podem ter o mesmo valor.'
      },
      creation: {
        pbid_already_exists: 'O PhiloBiblon ID "{pbid}" já existe em {item}.'
      }
    },
    success: {
      updated: 'Atualizado com sucesso'
    }
  },
  wiki: {
    search: {
      placeholder: 'Pesquisar em PhiloBiblon'
    }
  }
}
