export default {
  common: {
    no_data: 'No hi ha dades disponibles',
    loading: 'Carregant..',
    language: 'Idioma',
    calendar: 'Calendari',
    advanced_search: 'Cerca avançada',
    from: 'Des de',
    to: 'a'
  },
  menu: {
    item: {
      welcome: {
        label: 'Benvingut'
      },
      search: {
        label: 'Cercar',
        item: {
          texid: {
            label: 'Obra'
          },
          libid: {
            label: 'Biblioteca'
          },
          insid: {
            label: 'Institució'
          },
          bioid: {
            label: 'Persona'
          },
          bibid: {
            label: 'Referència'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Geogràfia'
          },
          subid: {
            label: 'Assumpte'
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
          hint: 'Quan cerqueu a Subjecte, tingueu en compte que el seu ús no és uniforme a totes les pàgines de cerca ni a les tres bibliografies.<br/>Cerqueu utilitzant un encapçalament complet o qualsevol paraula continguda en qualsevol encapçalament (p. ex., un nom de lloc). Per motius tècnics, només es pot cercar un encapçalament de matèria alhora. Les cerques de dos encapçalaments de matèries diferents o de paraules de dos encapçalaments de matèries diferents no retornaran resultats. Al BITAGAP, per exemple, cerqueu “milagres” o “mariologia”, però no “milagres” i “mariologia”.'
        },
        place: {
          label: 'Lloc',
          hint: 'Els noms de llocs apareixen a diverses pàgines de cerca: TREBALL - <b>Lloc de composició</b>; PERSONA - <b>Lloc associat</b>; BIBLIOTECA - <b>Ciutat</b>; REFERÈNCIA - <b>Lloc de publicació</b>; MSED - <b>Ciutat</b>.'
        },
        date: {
          label: 'Data',
          hint: 'In fields that include dates, search by any combination of year (yyyy) and/or month (mm) and/or day (dd). A search returns dates as yyyy-mm-dd (1379-01-31 is January 31, 1379). Search using this format or more simply, the year: “1379” returns all texts written in 1379; “1379 01” or “01 1379” returns all texts written on the first of each month of 1379 and on any day of January of 1379. Note: Year dates frequently form part of titles in WORK and can be used to search for the same.'
        },
        personal_name: {
          label: 'Nom personal',
          hint: 'Per cercar un nom personal com a <b>Autor</b> d\'un text a WORK, utilitzeu qualsevol forma del nom, original, traduït o variant. Per exemple, cerqueu "Benedictus", "Bento", "Benet" o "Benito".<br/>A totes les altres pàgines de cerca i en tots els altres camps, com ara persones (associades), autors de referències secundàries, anteriors propietaris, traductors, mecenes, copistes, editors, és a dir, per a qualsevol nom personal cercat en qualsevol camp que no sigui el d\'Author in WORK, utilitzeu la versió moderna del nom.<br/>Consell: per identificar la forma moderna d\'un nom. nom, cerca en PERSONA qualsevol forma de <b>Nom</b>, original, traduït, pseudònim, etc.'
        },
        search_type: {
          all_words: 'Totes les paraules',
          any_word: 'Qualsevol paraula'
        }
      },
      texid: {
        author: {
          label: 'Autor',
          hint: 'Per cercar un nom personal com a <b>Autor</b> d\'un text a WORK, utilitzeu qualsevol forma del nom, original, traduït o variant. Per exemple, cerqueu "Benedictus", "Bento", "Benet" o "Benito".<br/>A totes les altres pàgines de cerca i en tots els altres camps, com ara persones (associades), autors de referències secundàries, anteriors propietaris, traductors, mecenes, copistes, editors, és a dir, per a qualsevol nom personal cercat en qualsevol camp que no sigui el d\'Author in WORK, utilitzeu la versió moderna del nom.<br/>Consell: per identificar la forma moderna d\'un nom. nom, cerca en PERSONA qualsevol forma de <b>Nom</b>, original, traduït, pseudònim, etc.'
        },
        title: {
          label: 'Títol',
          hint: 'Cerca obres en prosa utilitzant la forma moderna del títol o, per a una obra traduïda, l\'original o el títol traduït. Per a una cerca àmplia, la primera (p. ex., "vida") generalment retornarà més obres que la segona ("vita"). Totes les cerques retornen obres segons qualsevol dels seus títols coneguts. També podeu utilitzar (qualsevol part de) una data per cercar en aquest camp. Per a textos poètics individuals, vegeu <b>Incipit/Explicit</b> a continuació, tret que el poema tingui un títol d\'ús habitual, per exemple, a BITAGAP, Poema da Batalha do Salado. També es poden cercar títols de cançoners (p. ex., Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles) en aquest camp.'
        },
        incipit: {
          label: 'Incipit',
          hint: 'Aquest important camp de cerca pot ajudar a identificar un text.<br/>Per a cada obra, hi ha (a) un registre mestre (amb un <b>tèxid</b> únic) i (b) una sèrie de registres per a cada còpia supervivent coneguda de l\'obra (cadascun amb un <b>cnum</b> únic). Per als primers, s\'han modernitzat els íncipits/explícits; per a aquests últims, els incipits/explícits es reprodueixen paleogràficament o semipaleogràficament, segons la bibliografia (amb o sense marques de supressió, abreviatures resoltes o no resoltes, faltes d\'ortografia, etc.) tal com es troba al manuscrit o a l\'edició impresa o com es transcriu en una secundària. font. Una cerca en aquest camp hauria de retornar una llista d\'obres basada tant en els incipits/explícits modernitzats com en els originals. Quan intenteu identificar un text, repetiu la cerca utilitzant variants de les paraules menys habituals. En alguns casos, especialment per a textos amb un gran nombre de còpies i sense edició moderna, només s\'han registrat incipits i explícits als registres de còpia. Aquest és especialment el cas de BETA.<br/>Per localitzar un text poètic, a <b>Incipit</b> cerca qualsevol paraula o paraules que apareguin a la primera línia.'
        },
        explicit: {
          label: 'Explicit',
          hint: 'Aquest important camp de cerca pot ajudar a identificar un text.<br/>Per a cada obra, hi ha (a) un registre mestre (amb un <b>tèxid</b> únic) i (b) una sèrie de registres per a cada còpia supervivent coneguda de l\'obra (cadascun amb un <b>cnum</b> únic). Per als primers, s\'han modernitzat els íncipits/explícits; per a aquests últims, els incipits/explícits es reprodueixen paleogràficament o semipaleogràficament, segons la bibliografia (amb o sense marques de supressió, abreviatures resoltes o no resoltes, faltes d\'ortografia, etc.) tal com es troba al manuscrit o a l\'edició impresa o com es transcriu en una secundària. font. Una cerca en aquest camp hauria de retornar una llista d\'obres basada tant en els incipits/explícits modernitzats com en els originals. Quan intenteu identificar un text, repetiu la cerca utilitzant variants de les paraules menys habituals. En alguns casos, especialment per a textos amb un gran nombre de còpies i sense edició moderna, només s\'han registrat incipits i explícits als registres de còpia. Aquest és especialment el cas de BETA.<br/>Per localitzar un text poètic, a <b>Incipit</b> cerca qualsevol paraula o paraules que apareguin a la primera línia.'
        },
        associated_person: {
          label: 'Persona relacionada',
          hint: ''
        },
        place_composition: {
          label: 'Lloc de composició',
          hint: ''
        },
        date_composition: {
          label: 'Data de composició',
          hint: 'Cerca aaaa i/o mm i/o dd. Una cerca aquí pot retornar la data de composició, confirmació, revisió, traducció, promulgació, etc.'
        },
        type: {
          label: 'Tipus',
          hint: ''
        },
        language: {
          label: 'Idioma',
          hint: ''
        },
        poetic_form: {
          label: 'Forma poètica',
          hint: ''
        }
      },
      libid: {
        city: {
          label: 'Ciutat',
          hint: 'Cerca pel nom de la ciutat en la seva llengua materna (p. ex., Nova York, Florència, etc.).'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Cerca per qualsevol dels noms formals o d\'ús habitual de la biblioteca (p. ex., en BETA, cerca Real Biblioteca, Biblioteca de Palacio o simplement Palacio).'
        },
        call_number: {
          label: 'Número d\'inventari',
          hint: ''
        }
      },
      insid: {
        city: {
          label: 'Ciutat',
          hint: 'Busquis el nom de la ciutat en la llengua original (v.g. London, New York, llevat d\'aquells que van pertànyer a la Corona d\'Aragó i tradicionalment als estudis de catalanística s\'esmenten pel seu nom català (v.g. Sogorb, Morvedre o Saragossa) o transliterat, si és el cas, v.g., Sankt Peterburg.'
        },
        institution_type: {
          label: 'Tipus d\'institució',
          hint: 'Cerca per tipus d\'institució.'
        },
        institution: {
          label: 'Institució',
          hint: 'Cerqueu per qualsevol dels noms formals o d\'ús habitual de la institució (p. ex., a BETA, cerqueu Universidad Complutense, Universidad de Madrid o Universidad Central).'
        }
      },
      bioid: {
        name: {
          label: 'Nom'
        },
        title: {
          label: 'Títol',
          hint: 'Es refereix a un títol conferit a un individu (pel rei, noble; Església; per a un període determinat, hereditari o de per vida). També podeu cercar qualsevol lloc al qual s\'adjunta el títol conferit (p. ex., a BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Data',
          hint: 'Cerqueu la data de naixement, la mort, l\'adjudicació d\'un títol o un altre esdeveniment important.'
        },
        associated_place: {
          label: 'Lloc relacionat',
          hint: 'Cerqueu el lloc (en la forma moderna) de naixement, mort, residència o un altre esdeveniment important.'
        },
        religious_order: {
          label: 'Ordre religiós o militar',
          hint: 'Per a les ordres religioses, cerqueu per la sigla estàndard, per exemple, OSB, OFM, SJ, Ocist. Tingueu en compte que la identificació de professions és esporàdica a les tres bibliografies.<br/>NOTA: la secció Persones associades de cada registre s\'ha de tractar amb precaució, especialment per a aquells individus amb nombroses relacions. El programa de base de dades està dissenyat per establir un enllaç recíproc entre dos registres automàticament. Així, quan el registre de "Juana la Loca" (bioide BETA 7208) es va vincular al de Fernando V (bioide 1104) com a filla seva, el seu registre es va actualitzar automàticament per mostrar-lo com el seu pare. Malauradament, a causa d\'errors de programació, aquest procés d\'actualització automàtica de vegades va establir enllaços erronis amb altres registres. Amb el temps, aquests errors s\'eliminaran. Demanem la col·laboració dels nostres usuaris per ajudar-nos a identificar-los.'
        },
        profession: {
          label: 'Professió, ofici o ocupació',
          hint: 'Per a professions, consulteu la llista a les pàgines d\'ajuda relacionades.'
        },
        religion: {
          label: 'Religió',
          hint: ''
        }
      },
      bibid: {
        author: {
          label: 'Autor/Creador',
          hint: 'Cerca per qualsevol forma o part del nom de l\'<b>autor</b> (d\'una monografia o d\'un article) i per qualsevol persona associada a l\'obra <b>que no sigui l\'autor</b> (p. ex., autor de pròleg, coordinador, editor o director de sèrie o col·lecció, etc.).'
        },
        title: {
          label: 'Títol',
          hint: 'Cerca per monografia o títol de l\'article (senceres o parcials, paraules més distintives).'
        },
        date: {
          label: 'Data',
          hint: 'Cerca per any de publicació.'
        },
        volume: {
          label: 'Revista / volum col·lectiu',
          hint: 'Cerca per títol de la revista (impresa o electrònica) o volum recopilat (actes o actes de congressos, volums d\'homenatge, etc.).'
        },
        place_publication: {
          label: 'Lloc d\'edició',
          hint: 'Cerca pel nom de la ciutat de publicació en la seva llengua materna.'
        },
        publisher: {
          label: 'Editor',
          hint: 'Cerca per editor (p. ex., "University of California Press").'
        },
        series: {
          label: 'Serie / Col·lecció',
          hint: 'Cerca per sèries (p. ex., a BITAGAP, “Subsídios para a história da arte”).'
        },
        locations: {
          label: 'Localitzacions',
          hint: ''
        },
        international_standard_number: {
          label: 'Número estàndard internacional (ISBN, ISSN)',
          hint: ''
        },
        type: {
          label: 'Tipus',
          hint: ''
        }
      },
      manid: {
        city: {
          label: 'Ciutat'
        },
        library: {
          label: 'Biblioteca',
          hint: 'Search by the current or former name of the library that holds the manuscript or printed edition.'
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
        },
        call_number: {
          label: 'Número d\'inventari',
          hint: ''
        },
        title: {
          label: 'Títol',
          hint: ''
        },
        type: {
          label: 'Tipus',
          hint: ''
        },
        writing_surface: {
          label: 'Superfície d\'escriptura',
          hint: ''
        },
        format: {
          label: 'Format',
          hint: ''
        },
        binding: {
          label: 'Enquadernació',
          hint: ''
        },
        collation: {
          label: 'Col·lació',
          hint: ''
        },
        hand: {
          label: 'Mà',
          hint: ''
        },
        font: {
          label: 'Tipus de lletra',
          hint: ''
        },
        watermark: {
          label: 'Filigrana',
          hint: ''
        },
        graphic_feature: {
          label: 'Característica gràfica',
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
          label: 'Tipus'
        },
        class: {
          label: 'Classe'
        }
      },
      subid: {
        headings: {
          label: 'Encapçalaments'
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
    title: 'Títol',
    description: 'Descripció',
    back: 'Torna',
    messages: {
      invalid_id: 'Identificador invàlid.',
      not_found: 'No trobat.',
      invalid_url: 'Si us plau, ompliu un URL vàlid!'
    }
  },
  privacyPolicy: {
    label: 'Política de privacitat',
    tooltip: 'Utilitzem galetes estrictament necessàries: aquestes cookies són essencials perquè navegueu pel lloc web i utilitzeu les seves funcions, com ara accedir a àrees segures del lloc o recordar l\'idioma escollit.',
    consent: {
      title: 'Dades recollides sobre la base del consentiment',
      desc: 'A la vostra sol·licitud i expressió de consentiment, recollim les dades següents amb la finalitat de proporcionar-vos serveis. Les vostres dades no s\'utilitzen per a cap altra finalitat ni es comparteixen amb tercers. S\'elimina quan retireu el vostre consentiment o la vostra sol·licitud de rescissió d\'aquests serveis.'
    },
    comments: {
      title: 'Comentaris',
      subtitle: 'Nom, adreça de correu electrònic, contingut del comentari',
      subtitleDesc: 'aquestes dades es recullen quan deixeu un comentari i es mostren al lloc web.',
      desc: 'Si deixeu un comentari al lloc web, el vostre nom i adreça de correu electrònic també es desaran a les galetes. Aquestes són per a la teva comoditat perquè no hagis d\'omplir les teves dades de nou quan deixis un altre comentari. Aquestes galetes es desaran al vostre ordinador fins que les suprimiu.'
    },
    userAgent: {
      subtitle: 'IP i cadena d\'agent d\'usuari del navegador',
      subtitleDesc: 'aquestes dades es recullen quan deixeu un comentari.'
    },
    retentionPeriod: {
      subtitle: 'Període de retenció',
      subtitleDesc: 'les dades esmentades es conserven indefinidament perquè puguem reconèixer i aprovar qualsevol comentari de seguiment automàticament en lloc de mantenir-los en una cua de moderació.'
    },
    legitimateInterest: {
      title: 'Dades recollides sobre la base d\'un interès legítim',
      desc: 'Basant-nos en els nostres interessos legítims, recopilem les dades següents amb la finalitat d\'executar aquest lloc web. Les vostres dades no s\'utilitzen per a cap altra finalitat ni es comparteixen amb tercers. S\'elimina a petició vostra.'
    },
    statistics: {
      title: 'Estadístiques',
      desc: 'El lloc web utilitza una versió mínima de Google Analytics, un servei que transmet dades de trànsit del lloc web als servidors de Google als Estats Units i ens permet notar tendències per millorar l\'experiència de l\'usuari al nostre lloc web. Aquesta compilació mínima processa dades personals com ara: l\'identificador d\'usuari únic establert per Google Analytics, la data i l\'hora, el títol de la pàgina que es visualitza, l\'URL de la pàgina que es visualitza, l\'URL de la pàgina que es va veure abans de la pàgina actual, la resolució de la pantalla, l\'hora a la zona horària local, els fitxers en què s\'ha fet clic i s\'ha baixat, els enllaços als quals s\'ha fet clic a un domini extern, el tipus de dispositiu i el país, la regió i la ciutat. <br/> <br/>Podeu desactivar aquest seguiment en qualsevol moment activant la configuració "No rastrejar" al vostre navegador.'
    },
    embedContent: {
      title: 'Contingut incrustat d\'altres llocs web',
      desc: 'Els articles del lloc web poden incloure contingut incrustat (per exemple, vídeos, gràfics, etc.). El contingut incrustat d\'altres llocs web es comporta exactament de la mateixa manera que si el visitant hagués visitat l\'altre lloc web. <br/> <br/>\n' +
        'Aquests llocs web poden recopilar dades sobre vostè, utilitzar galetes, incrustar un seguiment addicional de tercers i supervisar la seva interacció amb aquest contingut incrustat, inclòs el seguiment de la seva interacció amb el contingut incrustat si teniu un compte i heu iniciat sessió en aquest lloc web.'
    },
    rights: {
      title: 'Els teus drets sobre les teves dades',
      desc: 'Si heu deixat comentaris al lloc web, podeu sol·licitar rebre un fitxer exportat de les dades personals que tenim sobre vosaltres, incloses les dades que ens hàgiu proporcionat. També podeu sol·licitar que rectifiquem o esborrem qualsevol dada personal que tinguem sobre vostè. Envieu la vostra sol·licitud a <a href="mailto:legal@gdpr.eu">legal@gdpr.eu</a>',
      data: '• Dret a retirar el consentiment <br/>\n' +
        '• El dret d\'accés<br/>\n' +
        '• Dret a supressió<br/>\n' +
        '• Dret de rectificació<br/>\n' +
        '• Dret a la portabilitat de les dades<br/>\n' +
        '• Dret d\'oposició<br/>\n' +
        '• Notificació de violacions de dades<br/>\n' +
        '• Dret a presentar una reclamació davant una autoritat de control'
    }
  },
  messages: {
    error: {
      session: {
        expired: 'Sessió expirada'
      },
      inputs: {
        fill: 'Si us plau, ompliu les entrades'
      },
      modification: {
        failed: 'L\'etiqueta i la descripció del codi d\'idioma en no poden tenir el mateix valor.'
      }
    },
    success: {
      updated: "S'ha actualitzat correctament"
    }
  },
  wiki: {
    search: {
      placeholder: 'Cercar en PhiloBiblon'
    }
  }
}
