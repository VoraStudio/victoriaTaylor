/* ----- INICI ARXIUS ARTISTES ----- */

const artistas = {
    'cristina-montero': {
        id: 'cristina-montero',
        nombre: 'Cristina Montero',
        rol: 'Artista plàstica i arquitecta',
        cardImg: '../img/artistes/2024-vallviva.avif',
        heroImg: '../img/artistes/cristinaMontero.avif',
        instagram: 'https://www.instagram.com/cristinamonteroart/',
        bio: [
            'Artista i arquitecta amb una formació diversa. Va realitzar el Batxillerat Tecnològic a l\'Institut Montsacopa, a Olot, entre 2010 i 2012. Posteriorment, va cursar el grau i màster en Arquitectura a la Universitat de Girona, de 2012 a 2018.',
            'El 2019 va assistir a classes d\'escultura en argila al Morean Arts Center, a Florida, seguit per un curs d\'escultura en vidre. Entre 2020 i 2023 es va formar en microfusió i joieria artística a l\'Escola d\'Expressió d\'Olot.',
            'Des dels sis anys ha assistit a classes particulars de dibuix i pintura amb diversos artistes. El 2015 va iniciar la seva trajectòria en el món de l\'escultura, combinant-la amb els seus estudis en arquitectura. A partir de 2016 es va endinsar en l\'àmbit laboral de l\'arquitectura i el 2017 va presentar al públic la seva primera col·lecció d\'escultures titulada "Reality, Sense, Emotions".',
            'L\'octubre de 2019 va exhibir la col·lecció "Unitat" a la seva pròpia galeria-estudi d\'escultura i arquitectura, ubicada a Olot. El juliol de 2023, continuant amb la fusió entre la figura humana i la naturalesa, va presentar la col·lecció "Fotosíntesi". Actualment, compagina les seves dues grans passions: l\'arquitectura i l\'escultura.'
        ],
        logros: [
            {
                año: '2024',
                textos: [
                    'Membre del jurat al concurs "LA BATALLA DE LES FLORS" — Centre d\'Iniciatives Turístiques d\'Olot',
                    'Exposició de l\'escultura "FLORACIÓ" — Festival VALLVIVA'
                ]
            },
            {
                año: '2023',
                textos: [
                    'Exposició de l\'escultura "FORTUNA I DESTÍ" — Festival VALLVIVA',
                    'Presentació de la col·lecció "Fotosíntesi"'
                ]
            },
            {
                año: '2022',
                textos: [
                    'Exposició de l\'escultura "IL·LUSIÓ" — Festival VALLVIVA'
                ]
            },
            {
                año: '2020',
                textos: [
                    'Espai HVNGARI — Andorra',
                    'Món d\'Harmonia — Barcelona',
                    'Àmbit Sant Lluc — Olot',
                    'Claustre de la Mercè — Girona',
                    'Jardins de la Riba — Vall de Bianya'
                ]
            },
            {
                año: '2019',
                textos: [
                    'Exposició de la col·lecció "Unitat" — Galeria-estudi, Olot',
                    'Àmbit Sant Lluc — Olot'
                ]
            },
            {
                año: '2018',
                textos: [
                    'Art Karlsruhe Rheinstetten — Alemanya'
                ]
            }
        ],
        obras: [
            { img: '../img/artistes/contemplativa2-cristinamontero.avif', titulo: 'Contemplativa' },
            { img: '../img/artistes/tornantaorigen-cristinamontero.avif', titulo: 'Tornant a l\'origen' },
            { img: '../img/artistes/2024-vallviva.avif', titulo: 'Floració' },
            { img: '../img/artistes/alexandra-leftgreen-cristinamontero.avif', titulo: 'Alexandra' },
            { img: '../img/artistes/fang-cristinamontero2.avif', titulo: 'Fang' },
            { img: '../img/artistes/laforcainterior-cristinamontero-2.avif', titulo: 'Força interior' },
            { img: '../img/artistes/alzina-g-cristinamontero-1.avif', titulo: 'Alzina' },
            { img: '../img/artistes/cristinamontero2.avif', titulo: 'Sense títol' }
        ]
    },

    'iol-baques': {
        id: 'iol-baques',
        nombre: 'IOL Baqués',
        rol: 'Artista abstracta',
        cardImg: '../img/artistes/iol-baques-1.avif',
        heroImg: '../img/artistes/iol.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'Iol Baqués és una artista abstracta establerta a l\'Empordà. La seva obra explora la relació entre matèria, color i llum a través de textures i capes pictòriques que evoquen el mar, la roca, els camps i l\'atmosfera mediterrània.',
            'Cada una de les seves peces és única i està concebuda per transformar els espais en experiències visuals i sensorials. El seu treball dialoga amb la natura i la memòria del paisatge, creant composicions que conviden a la calma i la contemplació.',
            'Iol col·labora tant amb col·leccionistes particulars com amb professionals del interiorisme que busquen obres singulars i atemporals. El seu enfocament combina sensibilitat estètica i versatilitat, adaptant-se a les necessitats de cada projecte amb un estil propi i recognoscible.'
        ],
        logros: [],
        obras: [
            { img: '../img/artistes/iol-baques-3.avif' },
            { img: '../img/artistes/iol-baques-5.avif' },
            { img: '../img/artistes/iol-baques-6.avif' },
            { img: '../img/artistes/iol-baques-9.avif' }
        ]
    },

    'juda-munoz': {
        id: 'juda-munoz',
        nombre: 'Judà Muñoz',
        rol: 'Artista d\'expressionisme abstracte',
        cardImg: '../img/artistes/juda-4.avif',
        heroImg: '../img/artistes/juda.avif',
        bgPosition: 'center 10%',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'Després de completar els seus estudis en Arts i Oficis el 1991, va començar la seva carrera com a decorador i pintor d\'interiors, una vocació que va mantenir fins al 2017.',
            'Durant aquells anys, es va especialitzar en tècniques decoratives d\'alta complexitat, treballant amb estucs i diversos revestiments en espais d\'alta decoració, habitatges i hotels a tota Espanya. Aquest treball meticulós li va permetre desenvolupar una comprensió profunda dels materials i les tècniques, així com conrear una sensibilitat estètica que més tard influiria en la seva obra artística.',
            'La vasta experiència acumulada en el camp de la decoració interior es tradueix avui en les seves peces d\'expressionisme abstracte. Les seves obres, riques en emocions i vivències personals, reflecteixen un viatge interior que busca expressar allò intangible a través de l\'art.',
            'Actualment, té el seu estudi a Palau Sator, un lloc que descriu com ideal per trobar el silenci i la pau necessaris per a la creació artística. La seva obra ha captat l\'atenció de col·leccionistes d\'arreu del món i actualment forma part de diverses col·leccions particulars en diversos països.'
        ],
        logros: [
            {
                año: '2025',
                textos: [
                    'Exposició a la galeria ESPAI BARRI VELL — Girona'
                ]
            },
            {
                año: '2024',
                textos: [
                    'Exposició a l\'Edifici LA FARINERA — Girona',
                    'Inclusió al fons d\'art de Creu Roja a Barcelona'
                ]
            },
            {
                año: '2023',
                textos: [
                    'Museu LEONARDO DA VINCI — Milà',
                    'Participació a RECICLART — Sitges'
                ]
            },
            {
                año: '2022',
                textos: [
                    'Guardonat a ART MARBELLA'
                ]
            },
            {
                año: '2021',
                textos: [
                    'Participació a ART DUBAI'
                ]
            }
        ],
        obras: [
            { img: '../img/artistes/juda-1.avif' },
            { img: '../img/artistes/juda-2.avif' },
            { img: '../img/artistes/juda-3.avif' },
            { img: '../img/artistes/juda-5.avif' },
            { img: '../img/artistes/juda-6.avif' }
        ]
    },

    'mohammed-er-rabehy': {
        id: 'mohammed-er-rabehy',
        nombre: 'Mohammed Er Rabehy',
        rol: 'Artista plàstic contemporani',
        cardImg: '../img/artistes/muha3.avif',
        heroImg: '../img/artistes/muhamed.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'Nascut el 1989 prop de Marrakech, al Marroc, Mohammed Er Rabehy va trobar el seu camí a Catalunya establint-se el 2008 a Olot.',
            'La seva obra reflecteix una profunda connexió amb la natura, inspirada en la geografia volcànica de la Garrotxa amb una paleta de colors i formes abstractes que fusiona les influències de la seva terra natal, el Marroc, amb la força tel·lúrica de la regió catalana.',
            'Prefereix treballar amb papers reciclats o fets a mà, sobre els quals aplica capes de color i textures que evoquen paisatges i fenòmens naturals. El seu art és una síntesi de dues geografies distants, el Marroc i Catalunya, que als seus llenços s\'agermanen i cobren nova vida.'
        ],
        logros: [
            {
                año: '2024',
                textos: [
                    'Subdelegació del Govern — Girona',
                    'Centre Cívic ONYAR — Girona',
                    'Centre Cívic SANT NARCÍS — Girona'
                ]
            },
            {
                año: '2023',
                textos: [
                    'Centre Cívic TER — Girona'
                ]
            },
            {
                año: '2022',
                textos: [
                    'Festival Art i Gavarres Internacional — Celrà',
                    'Exposició col·lectiva "Càpsula d\'art emergent" — Bescanó'
                ]
            },
            {
                año: '2021',
                textos: [
                    'Museu Etnogràfic — Ripoll'
                ]
            },
            {
                año: '2020',
                textos: [
                    'Amics del Museu d\'Art — Girona',
                    'Palau de l\'Abadia — Sant Joan de les Abadesses'
                ]
            },
            {
                año: '2019',
                textos: [
                    'Museu de la Garrotxa — Olot',
                    'Galeria Abartium — Vic',
                    'Hotel Picasso — Torroella de Montgrí',
                    'Castell de Montesquiu — Barcelona'
                ]
            },
            {
                año: '2018',
                textos: [
                    'Cafè Art Fontanella — Olot',
                    'Espai Jove — Girona'
                ]
            },
            {
                año: '2017',
                textos: [
                    'El Racó de la Font — Olot',
                    'Galeria Les Voltes — Olot'
                ]
            }
        ],
        obras: [
            { img: '../img/artistes/muha1.avif' },
            { img: '../img/artistes/muha2.avif' },
            { img: '../img/artistes/muha3.avif' },
            { img: '../img/artistes/muha4.avif' },
            { img: '../img/artistes/muha5.avif' },
            { img: '../img/artistes/muha6.avif' }
        ]
    },

    'rosa-martin': {
        id: 'rosa-martin',
        nombre: 'Rosa Martín',
        rol: 'Artista plàstica i docent',
        cardImg: '../img/artistes/rosa2.avif',
        heroImg: '../img/artistes/rosa.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'Rosa Martín, artista plàstica i docent, resideix a la Garrotxa (Olot). Va començar la seva formació artística a l\'Escola de Belles Arts d\'Olot i més tard es va llicenciar en pintura per la Facultat de Belles Arts de Barcelona.',
            'Una part significativa de la seva carrera professional ha estat dedicada a la docència, tant en diversos centres educatius com al seu propi taller d\'art. La seva activitat docent s\'ha complementat amb el seu desenvolupament creatiu personal, que va iniciar amb l\'estudi del moviment i les seqüències d\'imatges.',
            'Sense deixar de banda el dibuix i la pintura, ha incorporat el gravat i l\'escultura a la seva obra. En el seu treball més recent, les escriptures arcaiques i els signes s\'han convertit en el punt de partida i en el fil conductor de la seva producció artística.'
        ],
        logros: [
            {
                año: '2019',
                textos: [
                    '"Pedra sobre pedra" — Àmbit Espai d\'Art, Olot',
                    'Lluèrnia — Olot'
                ]
            },
            {
                año: '2018',
                textos: [
                    '"Les mans que miren, les mans que pensen" — Àmbit Espai d\'Art, Olot'
                ]
            }
        ],
        obras: [
            { img: '../img/artistes/rosa1.avif' },
            { img: '../img/artistes/rosa2.avif' },
            { img: '../img/artistes/rosa3.avif' },
            { img: '../img/artistes/rosa4.avif' },
            { img: '../img/artistes/rosa5.avif' },
            { img: '../img/artistes/rosa6.avif' }
        ]
    },

    'hubo': {
        id: 'hubo',
        nombre: 'HUBO',
        rol: 'Col·laboració artística entre un artesà del ferro i un experimentador',
        cardImg: '../img/artistes/hubo.avif',
        heroImg: '../img/artistes/hubo.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'Sota el pseudònim de HUBO, s\'amaga una col·laboració inusual i magnètica entre un artesà del ferro i un apassionat per l\'assaig de noves formes d\'expressió artística.',
            'El desig d\'explorar els límits entre l\'estructura i l\'expressió lliure, entre el ferro i el color, les textures, tonalitats i volums, configuren a vegades formes no tan llunyanes de l\'escultura, anhelant sempre el difícil equilibri entre el concepte i l\'abstracció.',
            'L\'obra de HUBO destaca per un ús audaç del color, la riquesa tàctil de les superfícies i la profunditat quasi geològica per superposicions de textures. Cada creació és un diàleg entre la permanència del ferro i la fugacitat del gest pictòric, entre el desgavell i l\'esperat.',
            'Fidels al seu esperit original —artesania, matèria i emoció—, els creadors de HUBO prefereixen que les obres parlin per si mateixes, deixant a l\'espectador la llibertat de submergir-se en el seu univers sensorial.'
        ],
        logros: [],
        obras: [
            { img: '../img/artistes/hubo1.avif' },
            { img: '../img/artistes/hubo2.avif' },
            { img: '../img/artistes/hubo3.avif' },
            { img: '../img/artistes/hubo4.avif' },
            { img: '../img/artistes/hubo5.avif' },
            { img: '../img/artistes/hubo6.avif' }
        ]
    },

    'david-thorne': {
        id: 'david-thorne',
        nombre: 'David Thorne',
        rol: 'Artista plàstic contemporani',
        cardImg: '../img/artistes/thorne-1.avif',
        heroImg: '../img/artistes/thorne-1.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: [
            'David Thorne és el pseudònim d\'un artista plàstic contemporani la identitat real del qual roman en l\'anonimat. Compagina la seva activitat professional amb una intensa i selecta producció artística.',
            'Divideix la seva vida entre Londres i la costa catalana, prop de Barcelona, cosa que li permet nodrir-se de l\'energia creativa del mar Mediterrani i del cosmopolitisme de la capital anglesa, així com del contrast cultural que les caracteritza.',
            'La seva obra gira al voltant d\'un únic icona: la pajarita de paper, reinterpretada en escultures de diverses mides, materials i tècniques. Per a Thorne, la pajarita és molt més que una figura; és un llenguatge visual propi, una signatura tridimensional reconeixible a l\'instant.',
            'Cada peça combina un equilibri entre la puresa formal i l\'experimentació cromàtica, transmetent caràcter, emoció i un toc lúdic que contrasta amb l\'aparent senzillesa de la silueta.',
            'La seva decisió de mantenir l\'anonimat respon tant a un desig de preservar la seva vida privada com a la intenció d\'afegir un halo de misteri que potencïi la interpretació lliure de la seva obra, capaç de transformar un gest quotidià —el plegat d\'una pajarita de paper— en un símbol icònic i atemporal.'
        ],
        logros: [],
        obras: [
            { img: '../img/artistes/thorne-2.avif', titulo: 'Graffitti is in the air' },
            { img: '../img/artistes/thorne-3.avif', titulo: 'Carbon Fever' },
            { img: '../img/artistes/thorne-1.avif', titulo: 'Red Passion' }
        ]
    }
};
