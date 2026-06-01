export default {
  common: {
    label: 'Étiquette',
    property: 'Propriété',
    properties: 'Propriétés',
    per_page: 'par page',
    value: 'Valeur',
    no_data: 'Aucune donnée disponible',
    loading: 'Chargement..',
    language: 'Langue',
    language_selector: 'Sélectionner la langue',
    amount: 'Montant',
    unit: 'Unité',
    date: 'Date',
    calendar: 'Calendrier',
    from: 'De',
    to: 'à',
    add: 'ajouter',
    add_reference: 'ajouter une référence',
    add_value: 'ajouter une valeur',
    add_qualifier: 'ajouter un qualificatif',
    add_claim: 'ajouter une déclaration',
    save: 'enregistrer',
    remove: 'supprimer',
    cancel: 'Annuler',
    create: 'Créer',
    items: 'éléments'
  },
  menu: {
    item: {
      welcome: {
        label: 'Accueil'
      },
      search: {
        label: 'Rechercher',
        item: {
          texid: {
            label: 'Œuvre'
          },
          libid: {
            label: 'Bibliothèque'
          },
          insid: {
            label: 'Institution'
          },
          bioid: {
            label: 'Personne'
          },
          bibid: {
            label: 'Référence'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Géographie'
          },
          subid: {
            label: 'Sujet'
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
        label: 'Créer',
        item: {
          texid: {
            label: 'Œuvre'
          },
          libid: {
            label: 'Bibliothèque'
          },
          insid: {
            label: 'Institution'
          },
          bioid: {
            label: 'Personne'
          },
          bibid: {
            label: 'Référence'
          },
          manid: {
            label: 'MsEd'
          },
          geoid: {
            label: 'Géographie'
          },
          subid: {
            label: 'Sujet'
          },
          cnum: {
            label: 'Témoignage textuel'
          },
          copid: {
            label: 'Copie supplémentaire'
          }
        }
      }
    }
  },
  auth: {
    login: {
      label: 'Connexion',
      success: 'Bienvenue {name} !'
    },
    logout: {
      label: 'Déconnexion',
      success: 'À la prochaine !'
    }
  },
  welcome: {
    title: 'Bienvenue'
  },
  search: {
    form: {
      common: {
        find_text: 'Rechercher du texte',
        section: {
          advanced: 'Recherche avancée',
          external_description: 'Description externe'
        },
        group: {
          label: 'Base de données'
        },
        group_all: {
          label: 'Tout'
        },
        bitagap_group: {
          label: 'Sous-groupe',
          options: {
            all: 'Omnia',
            original: 'Original',
            cartas: 'Lettres'
          }
        },
        simple_search: {
          label: 'Recherche simple',
          hint: 'Utilisez ce champ pour rechercher des informations non localisables dans les champs nommés. Par exemple, dans <b>MsEd</b>, des informations codicologiques ; ou, dans WORK, tapez "trad*" dans <b>Recherche simple</b> pour obtenir une liste des œuvres qui ont été traduites depuis leur langue d\'origine.'
        },
        q_number: {
          label: 'Numéro Q',
          hint: 'Le numéro Q de Wikibase.'
        },
        philobiblon_id: {
          label: 'Identifiant PhiloBiblon',
          hint: 'Indiquez uniquement le numéro d\'identifiant PhiloBiblon.'
        },
        subject: {
          label: 'Sujet',
          hint: 'N\'oubliez pas que lors d\'une recherche dans Sujet, son utilisation n\'est pas uniforme sur toutes les pages de recherche ni dans les trois bibliographies.<br/>Recherchez en utilisant un titre complet ou tout mot contenu dans un titre (par ex. un nom de lieu). Pour des raisons techniques, un seul intitulé de sujet peut être recherché à la fois. Les recherches portant sur deux intitulés différents ou sur des mots provenant de deux intitulés différents renverront zéro résultat. Dans BITAGAP, par exemple, recherchez "milagres" ou "mariologia" mais pas "milagres" et "mariologia".'
        },
        place: {
          label: 'Lieu',
          hint: 'Les noms de lieux apparaissent sur plusieurs pages de recherche : WORK - <b>Lieu de composition</b> ; PERSON - <b>Lieu associé</b> ; LIBRARY - <b>Ville</b> ; REFERENCE - <b>Lieu de publication</b> ; MSED - <b>Ville</b>.'
        },
        date: {
          label: 'Date',
          hint: 'Dans les champs qui comprennent des dates, recherchez par toute combinaison d\'année (aaaa) et/ou de mois (mm) et/ou de jour (jj). Une recherche renvoie les dates au format aaaa-mm-jj (1379-01-31 correspond au 31 janvier 1379). Recherchez en utilisant ce format ou, plus simplement, l\'année : "1379" renvoie tous les textes écrits en 1379 ; "1379 01" ou "01 1379" renvoie tous les textes écrits le premier de chaque mois de 1379 et n\'importe quel jour de janvier 1379. Remarque : les dates en année font souvent partie des titres dans WORK et peuvent être utilisées pour les rechercher.',
          error: {
            invalid_date: 'Date invalide. Utilisez le format AAAA-MM-JJ',
            invalid_year: 'L\'année doit être comprise entre 0 et 2125'
          }
        },
        personal_name: {
          label: 'Nom de personne',
          hint: 'Pour rechercher un nom de personne en tant qu\'<b>Auteur</b> d\'un texte dans WORK, utilisez n\'importe quelle forme du nom, originale, traduite ou variante. Par exemple, recherchez "Benedictus", "Bento", "Benet" ou "Benito."<br/>Sur toutes les autres pages de recherche et dans tous les autres champs, tels que (personnes associées), auteurs de références secondaires, anciens propriétaires, traducteurs, mécènes, copistes, éditeurs, c\'est-à-dire pour tout nom de personne recherché dans un autre champ que celui d\'Auteur dans WORK, utilisez la forme moderne du nom.<br/>Conseil : pour identifier la forme moderne d\'un nom, recherchez dans PERSON n\'importe quelle forme dans <b>Nom</b>, originale, traduite, pseudonyme, etc.'
        },
        search_type: {
          all_words: 'Tous les mots',
          any_word: 'N\'importe quel mot'
        }
      },
      texid: {
        author: {
          label: 'Auteur',
          hint: 'Pour rechercher un nom de personne en tant qu\'<b>Auteur</b> d\'un texte dans WORK, utilisez n\'importe quelle forme du nom, originale, traduite ou variante. Par exemple, recherchez "Benedictus", "Bento", "Benet" ou "Benito."<br/>Sur toutes les autres pages de recherche et dans tous les autres champs, tels que (personnes associées), auteurs de références secondaires, anciens propriétaires, traducteurs, mécènes, copistes, éditeurs, c\'est-à-dire pour tout nom de personne recherché dans un autre champ que celui d\'Auteur dans WORK, utilisez la forme moderne du nom.<br/>Conseil : pour identifier la forme moderne d\'un nom, recherchez dans PERSON n\'importe quelle forme dans <b>Nom</b>, originale, traduite, pseudonyme, etc.'
        },
        title: {
          label: 'Titre',
          hint: 'Recherchez des œuvres en prose en utilisant la forme moderne du titre ou, pour une œuvre traduite, le titre original ou traduit. Pour une recherche large, le premier (par ex. "vida") renverra généralement plus d\'œuvres que le second ("vita"). Toutes les recherches renvoient des œuvres selon l\'un de leurs titres connus. Vous pouvez également utiliser (une partie d\') une date pour rechercher dans ce champ. Pour des textes poétiques individuels, voir <b>Incipit/Explicit</b> ci-dessous, à moins que le poème n\'ait un titre couramment utilisé, par ex. dans BITAGAP, Poema da Batalha do Salado. Les titres de recueils de chansons (par ex. Cancioneiro da Ajuda, Cancionero de Estúñiga, Cançoner dels Masdovelles) peuvent également être recherchés dans ce champ.'
        },
        incipit: {
          label: 'Incipit',
          hint: 'Ce champ de recherche important peut aider à l\'identification d\'un texte.<br/>Pour chaque œuvre, il y a (a) une fiche maître (avec un <b>texid</b> unique) et (b) une série de fiches pour chaque copie connue et conservée de l\'œuvre (chacune avec un <b>cnum</b> unique). Pour la première, les incipits/explicits ont été modernisés ; pour les secondes, les incipits/explicits sont reproduits paléographiquement ou semi-paléographiquement, selon la bibliographie (avec ou sans marques de suppression, abréviations résolues ou non, fautes d\'orthographe, etc.) tels qu\'ils figurent dans le manuscrit ou l\'édition imprimée ou tels qu\'ils sont transcrits dans une source secondaire. Une recherche dans ce champ devrait renvoyer une liste d\'œuvres basée à la fois sur les incipits/explicits modernisés et sur les originaux. Lorsque vous essayez d\'identifier un texte, répétez la recherche en utilisant des variantes des mots les moins courants. Dans certains cas, notamment pour les textes ayant un grand nombre de copies et sans édition moderne, les incipits et explicits n\'ont été enregistrés que dans les fiches de copies. C\'est particulièrement le cas pour BETA.<br/>Pour localiser un texte poétique, recherchez dans <b>Incipit</b> n\'importe quel mot ou groupe de mots apparaissant dans le premier vers.'
        },
        explicit: {
          label: 'Explicit',
          hint: 'Ce champ de recherche important peut aider à l\'identification d\'un texte.<br/>Pour chaque œuvre, il y a (a) une fiche maître (avec un <b>texid</b> unique) et (b) une série de fiches pour chaque copie connue et conservée de l\'œuvre (chacune avec un <b>cnum</b> unique). Pour la première, les incipits/explicits ont été modernisés ; pour les secondes, les incipits/explicits sont reproduits paléographiquement ou semi-paléographiquement, selon la bibliographie (avec ou sans marques de suppression, abréviations résolues ou non, fautes d\'orthographe, etc.) tels qu\'ils figurent dans le manuscrit ou l\'édition imprimée ou tels qu\'ils sont transcrits dans une source secondaire. Une recherche dans ce champ devrait renvoyer une liste d\'œuvres basée à la fois sur les incipits/explicits modernisés et sur les originaux. Lorsque vous essayez d\'identifier un texte, répétez la recherche en utilisant des variantes des mots les moins courants. Dans certains cas, notamment pour les textes ayant un grand nombre de copies et sans édition moderne, les incipits et explicits n\'ont été enregistrés que dans les fiches de copies. C\'est particulièrement le cas pour BETA.<br/>Pour localiser un texte poétique, recherchez dans <b>Incipit</b> n\'importe quel mot ou groupe de mots apparaissant dans le premier vers.'
        },
        associated_person: {
          label: 'Personne associée',
          hint: ''
        },
        place_composition: {
          label: 'Lieu de composition',
          hint: ''
        },
        date_composition: {
          label: 'Date de composition',
          hint: 'Recherchez par aaaa et/ou mm et/ou jj. Une recherche ici peut renvoyer la date de composition, de confirmation, de révision, de traduction, de promulgation, etc.'
        },
        type: {
          label: 'Type',
          hint: ''
        },
        language: {
          label: 'Langue',
          hint: ''
        },
        poetic_form: {
          label: 'Forme poétique',
          hint: ''
        }
      },
      libid: {
        city: {
          label: 'Ville',
          hint: 'Recherchez par le nom de la ville dans sa langue native (par ex. New York, Firenze, etc.).'
        },
        library: {
          label: 'Bibliothèque',
          hint: 'Recherchez par l\'un des noms formels ou couramment utilisés de la bibliothèque (par ex. dans BETA, recherchez Real Biblioteca, Biblioteca de Palacio ou simplement Palacio).'
        },
        call_number: {
          label: 'Position d\'inventaire',
          hint: ''
        }
      },
      insid: {
        city: {
          label: 'Ville',
          hint: 'Recherchez par le nom de la ville dans sa langue native (par ex. New York, Firenze, etc.).'
        },
        institution_type: {
          label: 'Type d\'institution',
          hint: 'Recherchez par type d\'institution.'
        },
        institution: {
          label: 'Institution',
          hint: 'Recherchez par l\'un des noms formels ou couramment utilisés de l\'institution (par ex. dans BETA, recherchez Universidad Complutense, Universidad de Madrid ou Universidad Central).'
        }
      },
      bioid: {
        name: {
          label: 'Nom',
          hint: ''
        },
        title: {
          label: 'Titre',
          hint: 'Il s\'agit d\'un titre conféré à un individu (par un roi, un noble ; l\'Église ; pour une période particulière, héréditaire ou viager). Vous pouvez également rechercher tout lieu auquel le titre conféré est attaché (par ex. dans BITAGAP, Bispo Ourense, Rei Castela Leão).'
        },
        date: {
          label: 'Date',
          hint: 'Recherchez la date de naissance, de décès, de conférence d\'un titre ou d\'un autre événement marquant.'
        },
        associated_place: {
          label: 'Lieu associé',
          hint: 'Recherchez le lieu (sous sa forme moderne) de naissance, de décès, de résidence ou d\'un autre événement marquant.'
        },
        religious_order: {
          label: 'Ordre religieux ou militaire',
          hint: 'Pour les ordres religieux, recherchez par les sigles standard, par ex. OSB, OFM, SJ, Ocist. Notez que l\'identification des professions est sporadique dans les trois bibliographies.<br/>REMARQUE : La section Personnes associées de chaque fiche doit être traitée avec prudence, notamment pour les individus ayant de nombreuses relations. Le programme de base de données est conçu pour établir automatiquement un lien réciproque entre deux fiches. Ainsi, lorsque la fiche de "Juana la Loca" (BETA bioid 7208) a été liée à celle de Fernando V (bioid 1104) en tant que sa fille, sa fiche a été automatiquement mise à jour pour le montrer comme son père. Malheureusement, en raison d\'erreurs de programmation, ce processus de mise à jour automatique a parfois établi des liens erronés avec d\'autres fiches. Ces erreurs seront progressivement corrigées. Nous sollicitons la collaboration de nos utilisateurs pour nous aider à les identifier.'
        },
        profession: {
          label: 'Profession, métier ou occupation',
          hint: 'Pour les professions, voir la liste dans les pages d\'aide associées.'
        },
        religion: {
          label: 'Religion',
          hint: ''
        },
        related_institution: {
          label: 'Institution liée',
          hint: 'Recherchez des personnes associées à une institution spécifique.'
        }
      },
      bibid: {
        author: {
          label: 'Auteur/Créateur',
          hint: 'Recherchez par toute forme ou partie du nom de l\'<b>auteur</b> (d\'une monographie ou d\'un article) et pour tout individu associé à l\'œuvre <b>autre que l\'auteur</b> (par ex. auteur du prologue, coordinateur, éditeur, ou directeur de série ou de collection, etc.).'
        },
        title: {
          label: 'Titre',
          hint: 'Recherchez par titre de monographie ou d\'article (en entier ou en partie, mots les plus distinctifs).'
        },
        date: {
          label: 'Date',
          hint: 'Recherchez par année de publication.'
        },
        volume: {
          label: 'Revue / volume collectif',
          hint: 'Recherchez par titre de la revue (imprimée ou électronique) ou du volume collectif (actes ou comptes rendus de congrès, volumes d\'hommage, etc.).'
        },
        place_publication: {
          label: 'Lieu de publication',
          hint: 'Recherchez par le nom de la ville de publication dans sa langue native.'
        },
        publisher: {
          label: 'Éditeur',
          hint: 'Recherchez par éditeur (par ex. "University of California Press").'
        },
        series: {
          label: 'Série',
          hint: 'Recherchez par série (par ex. dans BITAGAP, "Subsídios para a história da arte").'
        },
        locations: {
          label: 'Localisation des exemplaires',
          hint: ''
        },
        international_standard_number: {
          label: 'Numéro international normalisé (ISBN, ISSN)',
          hint: ''
        },
        type: {
          label: 'Type',
          hint: ''
        }
      },
      manid: {
        city: {
          label: 'Ville',
          hint: ''
        },
        library: {
          label: 'Bibliothèque',
          hint: 'Recherchez par le nom actuel ou ancien de la bibliothèque qui détient le manuscrit ou l\'édition imprimée.'
        },

        collection: {
          label: 'Collection',
          hint: ''
        },

        date_of_artifact: {
          label: 'Date de l\'artefact',
          hint: ''
        },
        date_of_publication: {
          label: 'Date de publication',
          hint: ''
        },
        place_production: {
          label: 'Lieu de production',
          hint: 'Recherchez par le nom d\'une ville ou d\'un lieu sous sa forme moderne.'
        },
        scribe_printer: {
          label: 'Copiste / imprimeur',
          hint: 'Recherchez un copiste en utilisant n\'importe quelle forme du nom. Pour un imprimeur, utilisez le nom sous sa forme originale (par ex. dans BITAGAP, "Hermann von Kempen" plutôt que "Hermão de Campos"). Pour connaître la forme originale du nom d\'un imprimeur, recherchez d\'abord dans PERSON.'
        },
        publisher_patron: {
          label: 'Éditeur / mécène',
          hint: 'Pour une édition imprimée, recherchez la personne qui l\'a financée en utilisant la forme moderne du nom. Pour un manuscrit, recherchez la forme moderne du nom du mécène pour lequel il a été copié.'
        },
        previous_owner: {
          label: 'Ancien propriétaire',
          hint: 'Recherchez toute personne ou institution ayant possédé l\'objet par le nom ou le titre d\'une personne, par le nom d\'un monastère, d\'un musée, d\'une maison de vente aux enchères, etc.'
        },
        associated_person: {
          label: 'Personne associée',
          hint: 'Recherchez en utilisant n\'importe quelle forme du nom. Une recherche renvoie le nom d\'un relieur, enlumineur, annotateur, etc.'
        },
        call_number: {
          label: 'Position d\'inventaire',
          hint: ''
        },
        title: {
          label: 'Titre',
          hint: ''
        },
        type: {
          label: 'Type',
          hint: ''
        },
        writing_surface: {
          label: 'Surface d\'écriture',
          hint: ''
        },
        format: {
          label: 'Format',
          hint: ''
        },
        binding: {
          label: 'Reliure',
          hint: ''
        },
        collation: {
          label: 'Collation',
          hint: ''
        },
        hand: {
          label: 'Main',
          hint: ''
        },
        font: {
          label: 'Police',
          hint: ''
        },
        watermark: {
          label: 'Filigrane',
          hint: ''
        },
        graphic_feature: {
          label: 'Caractéristique graphique',
          hint: ''
        },
        physical_feature: {
          label: 'Caractéristique physique',
          hint: ''
        },
        music: {
          label: 'Musique',
          hint: ''
        }
      },
      geoid: {
        type: {
          label: 'Type',
          hint: ''
        },
        class: {
          label: 'Classe',
          hint: ''
        }
      },
      subid: {
        subject: {
          label: 'Sujet',
          hint: ''
        }
      }
    },
    button: {
      search: 'Rechercher',
      back: 'Retour',
      clear: 'Effacer',
      create_item: 'Créer un nouvel élément'
    },
    results: {
      results: 'Résultats',
      sort_by: 'Trier par :',
      sort_option: {
        name: 'Nom',
        id: 'ID',
        date: 'Date'
      },
      not_found: 'Aucun résultat trouvé.'
    }
  },
  item: {
    label: 'Élément',
    title: 'Titre',
    description: 'Description',
    back: 'Retour',
    identifiers: 'Identifiants',
    related_items: 'Éléments liés',
    notes: 'Notes',
    messages: {
      invalid_id: 'Identifiant invalide.',
      not_found: 'Non trouvé.',
      invalid_url: 'Veuillez renseigner une URL valide !'
    },
    create: {
      button: {
        text: 'Créer un élément',
        enabled: 'Créer un nouvel élément'
      },
      calculating_new_pbid: 'Calcul du nouvel identifiant PhiloBiblon ..'
    },
    related: {
      manid: {
        related_ms_ed: 'Ms/Éd liés',
        manuscript_edition: 'Édition manuscrite',
        text: 'Texte'
      },
      texid: {
        uniform_title: 'Témoignages textuels',
        related_uniform_titles: 'Témoignages textuels liés'
      },
      bibid: {
        related_bibliography: 'Bibliographie liée'
      },
      bioid: {
        subject_references: 'Références thématiques',
        authors: 'Auteurs',
        commentary: 'Commentaire',
        financed_by: 'Financé par',
        former_owners: 'Anciens propriétaires',
        handwritten_by: 'Copié par',
        milestones: 'Jalons',
        owner: 'Propriétaire',
        printed_by: 'Imprimé par',
        related_individuals: 'Individus liés',
        translator: 'Traducteur'
      },
      copid: {
        related_copies: 'Copies liées'
      },
      geoid: {
        career_statement: 'Déclaration de carrière',
        first_known_date: 'Première date connue',
        former_owners: 'Anciens propriétaires',
        from_place: 'Lieu d\'origine mentionné',
        history: 'Histoire',
        itinerary: 'Itinéraire',
        last_known_date: 'Dernière date connue',
        location: 'Localisation',
        milestones: 'Jalons',
        owner: 'Propriétaire',
        place_of_birth: 'Lieu de naissance',
        place_of_death: 'Lieu de décès',
        place_of_publication: 'Lieu de publication',
        related_places: 'Lieux liés',
        religious_background: 'Contexte religieux',
        religious_order: 'Ordre religieux',
        subject_references: 'Références thématiques'
      },
      insid: {
        authors: 'Auteurs',
        financed_by: 'Financé par',
        former_owners: 'Anciens propriétaires',
        handwritten_by: 'Copié par',
        milestones: 'Jalons',
        owner: 'Propriétaire',
        printed_by: 'Imprimé par',
        related_individuals: 'Individus liés',
        related_institutions: 'Institutions liées',
        work_context: 'Contexte de l\'œuvre',
        subject_references: 'Références thématiques'
      },
      libid: {
        related_libraries: 'Bibliothèques liées',
        present_holding: 'Fonds actuel'
      },
      subid: {
        subject_references: 'Références thématiques'
      }
    }
  },
  privacyPolicy: {
    label: 'Politique de confidentialité',
    tooltip: 'Nous utilisons des cookies strictement nécessaires — Ces cookies sont essentiels pour vous permettre de naviguer sur le site web et d\'utiliser ses fonctionnalités, comme l\'accès aux zones sécurisées du site ou la mémorisation de la langue sélectionnée.',
    consent: {
      title: 'Données collectées sur la base du consentement',
      desc: 'Sur votre demande et expression de consentement, nous collectons les données suivantes dans le but de vous fournir des services. Vos données ne sont utilisées à aucune autre fin ni partagées avec des tiers. Elles sont supprimées sur votre retrait de consentement ou votre demande de résiliation de ces services.'
    },
    comments: {
      title: 'Commentaires',
      subtitle: 'Nom, adresse e-mail, contenu du commentaire',
      subtitleDesc: 'ces données sont collectées lorsque vous laissez un commentaire et affichées sur le site web.',
      desc: 'Si vous laissez un commentaire sur le site web, votre nom et votre adresse e-mail seront également enregistrés dans des cookies. Ceux-ci sont pour votre commodité afin que vous n\'ayez pas à remplir à nouveau vos coordonnées lorsque vous laissez un autre commentaire. Ces cookies seront enregistrés sur votre ordinateur jusqu\'à ce que vous les supprimiez.'
    },
    userAgent: {
      subtitle: 'IP et chaîne d\'agent utilisateur du navigateur',
      subtitleDesc: 'ces données sont collectées lorsque vous laissez un commentaire.'
    },
    retentionPeriod: {
      subtitle: 'Période de conservation',
      subtitleDesc: 'les données susmentionnées sont conservées indéfiniment afin que nous puissions reconnaître et approuver automatiquement tout commentaire de suivi au lieu de les mettre en file d\'attente de modération.'
    },
    legitimateInterest: {
      title: 'Données collectées sur la base de l\'intérêt légitime',
      desc: 'Sur la base de nos intérêts légitimes, nous collectons les données suivantes dans le but de gérer ce site web. Vos données ne sont utilisées à aucune autre fin ni partagées avec des tiers. Elles sont supprimées sur votre demande.'
    },
    statistics: {
      title: 'Statistiques',
      desc: 'Le site web utilise une version minimale de Google Analytics, un service qui transmet les données de trafic du site web aux serveurs de Google aux États-Unis et nous permet de détecter des tendances pour améliorer l\'expérience utilisateur sur notre site web. Cette version minimale traite des données personnelles telles que : l\'ID utilisateur unique défini par Google Analytics, la date et l\'heure, le titre de la page consultée, l\'URL de la page consultée, l\'URL de la page consultée avant la page actuelle, la résolution de l\'écran, l\'heure dans le fuseau horaire local, les fichiers cliqués et téléchargés, les liens cliqués vers un domaine extérieur, le type d\'appareil, et le pays, la région et la ville. <br/> <br/>Vous pouvez vous désabonner de ce suivi à tout moment en activant le paramètre "Ne pas me pister" dans votre navigateur.'
    },
    embedContent: {
      title: 'Contenu intégré provenant d\'autres sites web',
      desc: 'Les articles du site web peuvent inclure du contenu intégré (par ex. des vidéos, des graphiques, etc.). Le contenu intégré provenant d\'autres sites web se comporte exactement comme si le visiteur avait visité l\'autre site web. <br/> <br/>\nCes sites web peuvent collecter des données sur vous, utiliser des cookies, intégrer un suivi tiers supplémentaire et surveiller votre interaction avec ce contenu intégré, notamment en traçant votre interaction avec le contenu intégré si vous avez un compte et êtes connecté à ce site web.'
    },
    rights: {
      title: 'Vos droits concernant vos données',
      desc: 'Si vous avez laissé des commentaires sur le site web, vous pouvez demander à recevoir un fichier exporté des données personnelles que nous détenons à votre sujet, y compris toutes les données que vous nous avez fournies. Vous pouvez également demander que nous rectifiions ou effacions toutes les données personnelles que nous détenons à votre sujet. Veuillez envoyer votre demande à <a href="mailto:legal{\'@\'}gdpr.eu">legal{\'@\'}gdpr.eu</a>',
      data: '• Le droit de retirer son consentement <br/>\n• Le droit d\'accès<br/>\n• Le droit à l\'effacement<br/>\n• Le droit de rectification<br/>\n• Le droit à la portabilité des données<br/>\n• Le droit d\'opposition<br/>\n• Notification des violations de données<br/>\n• Le droit d\'introduire une réclamation auprès d\'une autorité de contrôle'
    }
  },
  messages: {
    error: {
      something_went_wrong: 'Une erreur s\'est produite !',
      wikibase_slow: 'Wikibase est sous forte charge. Veuillez réessayer dans quelques instants.',
      wikibase_unreachable: 'Impossible de se connecter à Wikibase. Veuillez réessayer.',
      session: {
        expired: 'Session expirée'
      },
      inputs: {
        label: 'Veuillez renseigner l\'étiquette',
        fill: 'Veuillez renseigner les champs',
        description: 'Veuillez renseigner la description',
        initial_claims: 'Les déclarations sont encore en cours de chargement',
        claim_value_missing: 'Veuillez renseigner la valeur de la déclaration pour "{propertyLabel}"',
        qualifier_key_missing: 'Une propriété de qualificatif est manquante dans la déclaration "{claimLabel}" pour "{propertyLabel}"',
        qualifier_value_missing: 'Des valeurs de qualificatif sont manquantes dans la déclaration "{claimLabel}" pour "{propertyLabel}"'
      },
      creation: {
        pbid_already_exists: 'L\'identifiant PhiloBiblon "{pbid}" existe déjà dans {item}.'
      }
    },
    success: {
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès'
    }
  },
  wiki: {
    search: {
      placeholder: 'Rechercher dans PhiloBiblon'
    }
  },
  footer: {
    citation: 'Volume 2025, Numéro 1 (Janvier) ISSN 1096-6609'
  }
}
