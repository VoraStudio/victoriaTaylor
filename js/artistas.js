/* ----- INICI ARXIUS ARTISTES ----- */

const artistas = {
    'cristina-montero': {
        id: 'cristina-montero',
        nombre: 'Cristina Montero',
        rol: {
            es: 'Artista plástica y arquitecta',
            ca: 'Artista plàstica i arquitecta',
            en: 'Visual artist and architect'
        },
        cardImg: '../img/artistes/2024-vallviva.avif',
        heroImg: '../img/artistes/cristinaMontero.avif',
        instagram: 'https://www.instagram.com/cristinamonteroart/',
        bio: {
            es: [
                'Artista y arquitecta con una formación diversa. Realizó el Bachillerato Tecnológico en el Instituto Montsacopa, en Olot, entre 2010 y 2012. Posteriormente, cursó el grado y máster en Arquitectura en la Universidad de Girona, de 2012 a 2018.',
                'En 2019 asistió a clases de escultura en arcilla en el Morean Arts Center, en Florida, seguido por un curso de escultura en vidrio. Entre 2020 y 2023 se formó en microfusión y joyería artística en la Escola d\'Expressió d\'Olot.',
                'Desde los seis años ha asistido a clases particulares de dibujo y pintura con diversos artistas. En 2015 inició su trayectoria en el mundo de la escultura, combinándola con sus estudios de arquitectura. A partir de 2016 se adentró en el ámbito laboral de la arquitectura y en 2017 presentó al público su primera colección de esculturas titulada "Reality, Sense, Emotions".',
                'En octubre de 2019 expuso la colección "Unitat" en su propia galería-estudio de escultura y arquitectura, ubicada en Olot. En julio de 2023, continuando con la fusión entre la figura humana y la naturaleza, presentó la colección "Fotosíntesi". Actualmente, compagina sus dos grandes pasiones: la arquitectura y la escultura.'
            ],
            ca: [
                'Artista i arquitecta amb una formació diversa. Va realitzar el Batxillerat Tecnològic a l\'Institut Montsacopa, a Olot, entre 2010 i 2012. Posteriorment, va cursar el grau i màster en Arquitectura a la Universitat de Girona, de 2012 a 2018.',
                'El 2019 va assistir a classes d\'escultura en argila al Morean Arts Center, a Florida, seguit per un curs d\'escultura en vidre. Entre 2020 i 2023 es va formar en microfusió i joieria artística a l\'Escola d\'Expressió d\'Olot.',
                'Des dels sis anys ha assistit a classes particulars de dibuix i pintura amb diversos artistes. El 2015 va iniciar la seva trajectòria en el món de l\'escultura, combinant-la amb els seus estudis en arquitectura. A partir de 2016 es va endinsar en l\'àmbit laboral de l\'arquitectura i 2017 va presentar al públic la seva primera col·lecció d\'escultures titulada "Reality, Sense, Emotions".',
                'L\'octubre de 2019 va exhibir la col·lecció "Unitat" a la seva pròpia galeria-estudi d\'escultura i arquitectura, ubicada a Olot. El juliol de 2023, continuant amb la fusió entre la figura humana i la naturalesa, va presentar la col·lecció "Fotosíntesi". Actualment, compagina les seves dues grans passions: l\'arquitectura i l\'escultura.'
            ],
            en: [
                'Artist and architect with a diverse background. She completed the Technological Baccalaureate at Institut Montsacopa, in Olot, between 2010 and 2012. She later studied for a degree and master\'s in Architecture at the University of Girona, from 2012 to 2018.',
                'In 2019 she attended clay sculpture classes at the Morean Arts Center, in Florida, followed by a glass sculpture course. Between 2020 and 2023 she trained in microcasting and art jewellery at the Escola d\'Expressió d\'Olot.',
                'Since the age of six she has attended private drawing and painting classes with various artists. In 2015 she began her career in the world of sculpture, combining it with her architecture studies. From 2016 onwards she entered the professional field of architecture, and in 2017 she presented her first sculpture collection to the public, titled "Reality, Sense, Emotions".',
                'In October 2019 she exhibited the "Unitat" collection in her own sculpture and architecture gallery-studio, located in Olot. In July 2023, continuing the fusion between the human figure and nature, she presented the "Fotosíntesi" collection. She currently combines her two great passions: architecture and sculpture.'
            ]
        },
        logros: [
            {
                año: '2024',
                textos: {
                    es: [
                        'Miembro del jurado en el concurso "LA BATALLA DE LES FLORS" — Centro de Iniciativas Turísticas de Olot',
                        'Exposición de la escultura "FLORACIÓ" — Festival VALLVIVA'
                    ],
                    ca: [
                        'Membre del jurat al concurs "LA BATALLA DE LES FLORS" — Centre d\'Iniciatives Turístiques d\'Olot',
                        'Exposició de l\'escultura "FLORACIÓ" — Festival VALLVIVA'
                    ],
                    en: [
                        'Jury member at the "LA BATALLA DE LES FLORS" competition — Olot Tourist Initiatives Centre',
                        'Exhibition of the "FLORACIÓ" sculpture — VALLVIVA Festival'
                    ]
                }
            },
            {
                año: '2023',
                textos: {
                    es: [
                        'Exposición de la escultura "FORTUNA I DESTÍ" — Festival VALLVIVA',
                        'Presentación de la colección "Fotosíntesi"'
                    ],
                    ca: [
                        'Exposició de l\'escultura "FORTUNA I DESTÍ" — Festival VALLVIVA',
                        'Presentació de la col·lecció "Fotosíntesi"'
                    ],
                    en: [
                        'Exhibition of the "FORTUNA I DESTÍ" sculpture — VALLVIVA Festival',
                        'Presentation of the "Fotosíntesi" collection'
                    ]
                }
            },
            {
                año: '2022',
                textos: {
                    es: [
                        'Exposición de la escultura "IL·LUSIÓ" — Festival VALLVIVA'
                    ],
                    ca: [
                        'Exposició de l\'escultura "IL·LUSIÓ" — Festival VALLVIVA'
                    ],
                    en: [
                        'Exhibition of the "IL·LUSIÓ" sculpture — VALLVIVA Festival'
                    ]
                }
            },
            {
                año: '2020',
                textos: {
                    es: [
                        'Espai HVNGARI — Andorra',
                        'Món d\'Harmonia — Barcelona',
                        'Àmbit Sant Lluc — Olot',
                        'Claustro de la Mercè — Girona',
                        'Jardines de la Riba — Vall de Bianya'
                    ],
                    ca: [
                        'Espai HVNGARI — Andorra',
                        'Món d\'Harmonia — Barcelona',
                        'Àmbit Sant Lluc — Olot',
                        'Claustre de la Mercè — Girona',
                        'Jardins de la Riba — Vall de Bianya'
                    ],
                    en: [
                        'Espai HVNGARI — Andorra',
                        'Món d\'Harmonia — Barcelona',
                        'Àmbit Sant Lluc — Olot',
                        'Claustre de la Mercè — Girona',
                        'Jardins de la Riba — Vall de Bianya'
                    ]
                }
            },
            {
                año: '2019',
                textos: {
                    es: [
                        'Exposición de la colección "Unitat" — Galería-estudio, Olot',
                        'Àmbit Sant Lluc — Olot'
                    ],
                    ca: [
                        'Exposició de la col·lecció "Unitat" — Galeria-estudi, Olot',
                        'Àmbit Sant Lluc — Olot'
                    ],
                    en: [
                        'Exhibition of the "Unitat" collection — Gallery-studio, Olot',
                        'Àmbit Sant Lluc — Olot'
                    ]
                }
            },
            {
                año: '2018',
                textos: {
                    es: [
                        'Art Karlsruhe Rheinstetten — Alemania'
                    ],
                    ca: [
                        'Art Karlsruhe Rheinstetten — Alemanya'
                    ],
                    en: [
                        'Art Karlsruhe Rheinstetten — Germany'
                    ]
                }
            }
        ],
        obras: [
            { img: '../img/artistes/contemplativa2-cristinamontero.avif', titulo: { es: 'Contemplativa', ca: 'Contemplativa', en: 'Contemplativa' } },
            { img: '../img/artistes/tornantaorigen-cristinamontero.avif', titulo: { es: 'Volviendo al origen', ca: 'Tornant a l\'origen', en: 'Returning to the Origin' } },
            { img: '../img/artistes/2024-vallviva.avif', titulo: { es: 'Floración', ca: 'Floració', en: 'Blooming' } },
            { img: '../img/artistes/alexandra-leftgreen-cristinamontero.avif', titulo: { es: 'Alexandra', ca: 'Alexandra', en: 'Alexandra' } },
            { img: '../img/artistes/fang-cristinamontero2.avif', titulo: { es: 'Barro', ca: 'Fang', en: 'Mud' } },
            { img: '../img/artistes/laforcainterior-cristinamontero-2.avif', titulo: { es: 'Fuerza interior', ca: 'Força interior', en: 'Inner Strength' } },
            { img: '../img/artistes/alzina-g-cristinamontero-1.avif', titulo: { es: 'Alzina', ca: 'Alzina', en: 'Alzina' } },
            { img: '../img/artistes/cristinamontero2.avif', titulo: { es: 'Sin título', ca: 'Sense títol', en: 'Untitled' } }
        ]
    },

    'iol-baques': {
        id: 'iol-baques',
        nombre: 'IOL Baqués',
        rol: {
            es: 'Artista abstracta',
            ca: 'Artista abstracta',
            en: 'Abstract artist'
        },
        cardImg: '../img/artistes/iol-baques-1.avif',
        heroImg: '../img/artistes/iol.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'Iol Baqués es una artista abstracta establecida en el Empordà. Su obra explora la relación entre materia, color y luz a través de texturas y capas pictóricas que evocan el mar, la roca, los campos y la atmósfera mediterránea.',
                'Cada una de sus piezas es única y está concebida para transformar los espacios en experiencias visuales y sensoriales. Su trabajo dialoga con la naturaleza y la memoria del paisaje, creando composiciones que invitan a la calma y la contemplación.',
                'Iol colabora tanto con coleccionistas particulares como con profesionales del interiorismo que buscan obras singulares y atemporales. Su enfoque combina sensibilidad estética y versatilidad, adaptándose a las necesidades de cada proyecto con un estilo propio y reconocible.'
            ],
            ca: [
                'Iol Baqués és una artista abstracta establerta a l\'Empordà. La seva obra explora la relació entre matèria, color i llum a través de textures i capes pictòriques que evoquen el mar, la roca, els camps i l\'atmosfera mediterrània.',
                'Cada una de les seves peces és única i està concebuda per transformar els espais en experiències visuals i sensorials. El seu treball dialoga amb la natura i la memòria del paisatge, creant composicions que conviden a la calma i la contemplació.',
                'Iol col·labora tant amb col·leccionistes particulars com amb professionals del interiorisme que busquen obres singulars i atemporals. El seu enfocament combina sensibilitat estètica i versatilitat, adaptant-se a les necessitats de cada projecte amb un estil propi i recognoscible.'
            ],
            en: [
                'Iol Baqués is an abstract artist based in the Empordà. Her work explores the relationship between matter, colour and light through textures and pictorial layers that evoke the sea, rock, fields and the Mediterranean atmosphere.',
                'Each of her pieces is unique and conceived to transform spaces into visual and sensory experiences. Her work dialogues with nature and the memory of the landscape, creating compositions that invite calm and contemplation.',
                'Iol collaborates with both private collectors and interior design professionals seeking unique and timeless works. Her approach combines aesthetic sensitivity and versatility, adapting to the needs of each project with a distinctive and recognisable style.'
            ]
        },
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
        rol: {
            es: 'Artista de expresionismo abstracto',
            ca: 'Artista d\'expressionisme abstracte',
            en: 'Abstract expressionist artist'
        },
        cardImg: '../img/artistes/juda-4.avif',
        heroImg: '../img/artistes/juda.avif',
        bgPosition: 'center 10%',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'Después de completar sus estudios en Artes y Oficios en 1991, comenzó su carrera como decorador y pintor de interiores, una vocación que mantuvo hasta 2017.',
                'Durante aquellos años, se especializó en técnicas decorativas de alta complejidad, trabajando con estucos y diversos revestimientos en espacios de alta decoración, viviendas y hoteles por toda España. Este trabajo meticuloso le permitió desarrollar una comprensión profunda de los materiales y las técnicas, así como cultivar una sensibilidad estética que más tarde influiría en su obra artística.',
                'La vasta experiencia acumulada en el campo de la decoración interior se traduce hoy en sus piezas de expresionismo abstracto. Sus obras, ricas en emociones y vivencias personales, reflejan un viaje interior que busca expresar lo intangible a través del arte.',
                'Actualmente, tiene su estudio en Palau Sator, un lugar que describe como ideal para encontrar el silencio y la paz necesarios para la creación artística. Su obra ha captado la atención de coleccionistas de todo el mundo y actualmente forma parte de diversas colecciones particulares en varios países.'
            ],
            ca: [
                'Després de completar els seus estudis en Arts i Oficis el 1991, va començar la seva carrera com a decorador i pintor d\'interiors, una vocació que va mantenir fins al 2017.',
                'Durant aquells anys, es va especialitzar en tècniques decoratives d\'alta complexitat, treballant amb estucs i diversos revestiments en espais d\'alta decoració, habitatges i hotels a tota Espanya. Aquest treball meticulós li va permetre desenvolupar una comprensió profunda dels materials i les tècniques, així com conrear una sensibilitat estètica que més tard influiria en la seva obra artística.',
                'La vasta experiència acumulada en el camp de la decoració interior es tradueix avui en les seves peces d\'expressionisme abstracte. Les seves obres, riques en emocions i vivències personals, reflecteixen un viatge interior que busca expressar allò intangible a través de l\'art.',
                'Actualment, té el seu estudi a Palau Sator, un lloc que descriu com ideal per trobar el silenci i la pau necessaris per a la creació artística. La seva obra ha captat l\'atenció de col·leccionistes d\'arreu del món i actualment forma part de diverses col·leccions particulars en diversos països.'
            ],
            en: [
                'After completing his studies in Arts and Crafts in 1991, he began his career as a decorator and interior painter, a vocation he maintained until 2017.',
                'During those years, he specialised in highly complex decorative techniques, working with stuccos and various coatings in high-end interiors, homes and hotels throughout Spain. This meticulous work allowed him to develop a deep understanding of materials and techniques, as well as cultivate an aesthetic sensibility that would later influence his artistic work.',
                'The vast experience accumulated in the field of interior decoration is reflected today in his abstract expressionist pieces. His works, rich in emotions and personal experiences, reflect an inner journey that seeks to express the intangible through art.',
                'He currently has his studio in Palau Sator, a place he describes as ideal for finding the silence and peace necessary for artistic creation. His work has caught the attention of collectors around the world and is currently part of several private collections in various countries.'
            ]
        },
        logros: [
            {
                año: '2025',
                textos: {
                    es: ['Exposición en la galería ESPAI BARRI VELL — Girona'],
                    ca: ['Exposició a la galeria ESPAI BARRI VELL — Girona'],
                    en: ['Exhibition at ESPAI BARRI VELL gallery — Girona']
                }
            },
            {
                año: '2024',
                textos: {
                    es: [
                        'Exposición en el Edificio LA FARINERA — Girona',
                        'Inclusión en el fondo de arte de Cruz Roja en Barcelona'
                    ],
                    ca: [
                        'Exposició a l\'Edifici LA FARINERA — Girona',
                        'Inclusió al fons d\'art de Creu Roja a Barcelona'
                    ],
                    en: [
                        'Exhibition at LA FARINERA Building — Girona',
                        'Inclusion in the Red Cross art collection in Barcelona'
                    ]
                }
            },
            {
                año: '2023',
                textos: {
                    es: [
                        'Museo LEONARDO DA VINCI — Milán',
                        'Participación en RECICLART — Sitges'
                    ],
                    ca: [
                        'Museu LEONARDO DA VINCI — Milà',
                        'Participació a RECICLART — Sitges'
                    ],
                    en: [
                        'LEONARDO DA VINCI Museum — Milan',
                        'Participation in RECICLART — Sitges'
                    ]
                }
            },
            {
                año: '2022',
                textos: {
                    es: ['Galardonado en ART MARBELLA'],
                    ca: ['Guardonat a ART MARBELLA'],
                    en: ['Awarded at ART MARBELLA']
                }
            },
            {
                año: '2021',
                textos: {
                    es: ['Participación en ART DUBAI'],
                    ca: ['Participació a ART DUBAI'],
                    en: ['Participation in ART DUBAI']
                }
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
        rol: {
            es: 'Artista plástico contemporáneo',
            ca: 'Artista plàstic contemporani',
            en: 'Contemporary visual artist'
        },
        cardImg: '../img/artistes/muha3.avif',
        heroImg: '../img/artistes/muhamed.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'Nacido en 1989 cerca de Marrakech, en Marruecos, Mohammed Er Rabehy encontró su camino en Cataluña estableciéndose en 2008 en Olot.',
                'Su obra refleja una profunda conexión con la naturaleza, inspirada en la geografía volcánica de la Garrotxa con una paleta de colores y formas abstractas que fusiona las influencias de su tierra natal, Marruecos, con la fuerza telúrica de la región catalana.',
                'Prefiere trabajar con papeles reciclados o hechos a mano, sobre los que aplica capas de color y texturas que evocan paisajes y fenómenos naturales. Su arte es una síntesis de dos geografías distantes, Marruecos y Cataluña, que en sus lienzos se hermanan y cobran nueva vida.'
            ],
            ca: [
                'Nascut el 1989 prop de Marrakech, al Marroc, Mohammed Er Rabehy va trobar el seu camí a Catalunya establint-se el 2008 a Olot.',
                'La seva obra reflecteix una profunda connexió amb la natura, inspirada en la geografia volcànica de la Garrotxa amb una paleta de colors i formes abstractes que fusiona les influències de la seva terra natal, el Marroc, amb la força tel·lúrica de la regió catalana.',
                'Prefereix treballar amb papers reciclats o fets a mà, sobre els quals aplica capes de color i textures que evoquen paisatges i fenòmens naturals. El seu art és una síntesi de dues geografies distants, el Marroc i Catalunya, que als seus llenços s\'agermanen i cobren nova vida.'
            ],
            en: [
                'Born in 1989 near Marrakech, Morocco, Mohammed Er Rabehy found his path in Catalonia by settling in Olot in 2008.',
                'His work reflects a profound connection with nature, inspired by the volcanic geography of La Garrotxa with a palette of colours and abstract forms that fuse the influences of his homeland, Morocco, with the telluric force of the Catalan region.',
                'He prefers to work with recycled or handmade papers, on which he applies layers of colour and textures that evoke landscapes and natural phenomena. His art is a synthesis of two distant geographies, Morocco and Catalonia, which come together and take on new life on his canvases.'
            ]
        },
        logros: [
            {
                año: '2024',
                textos: {
                    es: [
                        'Subdelegación del Gobierno — Girona',
                        'Centro Cívico ONYAR — Girona',
                        'Centro Cívico SANT NARCÍS — Girona'
                    ],
                    ca: [
                        'Subdelegació del Govern — Girona',
                        'Centre Cívic ONYAR — Girona',
                        'Centre Cívic SANT NARCÍS — Girona'
                    ],
                    en: [
                        'Government Sub-delegation — Girona',
                        'ONYAR Civic Centre — Girona',
                        'SANT NARCÍS Civic Centre — Girona'
                    ]
                }
            },
            {
                año: '2023',
                textos: {
                    es: ['Centro Cívico TER — Girona'],
                    ca: ['Centre Cívic TER — Girona'],
                    en: ['TER Civic Centre — Girona']
                }
            },
            {
                año: '2022',
                textos: {
                    es: [
                        'Festival Internacional Art i Gavarres — Celrà',
                        'Exposición colectiva "Cápsula de arte emergente" — Bescanó'
                    ],
                    ca: [
                        'Festival Art i Gavarres Internacional — Celrà',
                        'Exposició col·lectiva "Càpsula d\'art emergent" — Bescanó'
                    ],
                    en: [
                        'International Art i Gavarres Festival — Celrà',
                        'Group exhibition "Emerging Art Capsule" — Bescanó'
                    ]
                }
            },
            {
                año: '2021',
                textos: {
                    es: ['Museo Etnográfico — Ripoll'],
                    ca: ['Museu Etnogràfic — Ripoll'],
                    en: ['Ethnographic Museum — Ripoll']
                }
            },
            {
                año: '2020',
                textos: {
                    es: [
                        'Amigos del Museo de Arte — Girona',
                        'Palau de l\'Abadia — Sant Joan de les Abadesses'
                    ],
                    ca: [
                        'Amics del Museu d\'Art — Girona',
                        'Palau de l\'Abadia — Sant Joan de les Abadesses'
                    ],
                    en: [
                        'Friends of the Art Museum — Girona',
                        'Palau de l\'Abadia — Sant Joan de les Abadesses'
                    ]
                }
            },
            {
                año: '2019',
                textos: {
                    es: [
                        'Museo de la Garrotxa — Olot',
                        'Galería Abartium — Vic',
                        'Hotel Picasso — Torroella de Montgrí',
                        'Castillo de Montesquiu — Barcelona'
                    ],
                    ca: [
                        'Museu de la Garrotxa — Olot',
                        'Galeria Abartium — Vic',
                        'Hotel Picasso — Torroella de Montgrí',
                        'Castell de Montesquiu — Barcelona'
                    ],
                    en: [
                        'Museum of La Garrotxa — Olot',
                        'Abartium Gallery — Vic',
                        'Hotel Picasso — Torroella de Montgrí',
                        'Montesquiu Castle — Barcelona'
                    ]
                }
            },
            {
                año: '2018',
                textos: {
                    es: [
                        'Cafè Art Fontanella — Olot',
                        'Espai Jove — Girona'
                    ],
                    ca: [
                        'Cafè Art Fontanella — Olot',
                        'Espai Jove — Girona'
                    ],
                    en: [
                        'Cafè Art Fontanella — Olot',
                        'Espai Jove — Girona'
                    ]
                }
            },
            {
                año: '2017',
                textos: {
                    es: [
                        'El Racó de la Font — Olot',
                        'Galería Les Voltes — Olot'
                    ],
                    ca: [
                        'El Racó de la Font — Olot',
                        'Galeria Les Voltes — Olot'
                    ],
                    en: [
                        'El Racó de la Font — Olot',
                        'Les Voltes Gallery — Olot'
                    ]
                }
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
        rol: {
            es: 'Artista plástica y docente',
            ca: 'Artista plàstica i docent',
            en: 'Visual artist and teacher'
        },
        cardImg: '../img/artistes/rosa2.avif',
        heroImg: '../img/artistes/rosa.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'Rosa Martín, artista plástica y docente, reside en la Garrotxa (Olot). Comenzó su formación artística en la Escuela de Bellas Artes de Olot y más tarde se licenció en pintura por la Facultad de Bellas Artes de Barcelona.',
                'Una parte significativa de su carrera profesional ha estado dedicada a la docencia, tanto en diversos centros educativos como en su propio taller de arte. Su actividad docente se ha complementado con su desarrollo creativo personal, que inició con el estudio del movimiento y las secuencias de imágenes.',
                'Sin dejar de lado el dibujo y la pintura, ha incorporado el grabado y la escultura a su obra. En su trabajo más reciente, las escrituras arcaicas y los signos se han convertido en el punto de partida y en el hilo conductor de su producción artística.'
            ],
            ca: [
                'Rosa Martín, artista plàstica i docent, resideix a la Garrotxa (Olot). Va començar la seva formació artística a l\'Escola de Belles Arts d\'Olot i més tard es va llicenciar en pintura per la Facultat de Belles Arts de Barcelona.',
                'Una part significativa de la seva carrera professional ha estat dedicada a la docència, tant en diversos centres educatius com al seu propi taller d\'art. La seva activitat docent s\'ha complementat amb el seu desenvolupament creatiu personal, que va iniciar amb l\'estudi del moviment i les seqüències d\'imatges.',
                'Sense deixar de banda el dibuix i la pintura, ha incorporat el gravat i l\'escultura a la seva obra. En el seu treball més recent, les escriptures arcaiques i els signes s\'han convertit en el punt de partida i en el fil conductor de la seva producció artística.'
            ],
            en: [
                'Rosa Martín, visual artist and teacher, lives in La Garrotxa (Olot). She began her artistic training at the Escola de Belles Arts d\'Olot and later graduated in painting from the Facultat de Belles Arts de Barcelona.',
                'A significant part of her professional career has been dedicated to teaching, both in various educational centres and in her own art workshop. Her teaching activity has been complemented by her personal creative development, which began with the study of movement and image sequences.',
                'Without abandoning drawing and painting, she has incorporated engraving and sculpture into her work. In her most recent work, archaic writings and signs have become the starting point and the guiding thread of her artistic production.'
            ]
        },
        logros: [
            {
                año: '2019',
                textos: {
                    es: [
                        '"Pedra sobre pedra" — Àmbit Espai d\'Art, Olot',
                        'Lluèrnia — Olot'
                    ],
                    ca: [
                        '"Pedra sobre pedra" — Àmbit Espai d\'Art, Olot',
                        'Lluèrnia — Olot'
                    ],
                    en: [
                        '"Pedra sobre pedra" — Àmbit Espai d\'Art, Olot',
                        'Lluèrnia — Olot'
                    ]
                }
            },
            {
                año: '2018',
                textos: {
                    es: ['"Les mans que miren, les mans que pensen" — Àmbit Espai d\'Art, Olot'],
                    ca: ['"Les mans que miren, les mans que pensen" — Àmbit Espai d\'Art, Olot'],
                    en: ['"Les mans que miren, les mans que pensen" — Àmbit Espai d\'Art, Olot']
                }
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
        rol: {
            es: 'Colaboración artística entre un artesano del hierro y un experimentador',
            ca: 'Col·laboració artística entre un artesà del ferro i un experimentador',
            en: 'Artistic collaboration between an iron craftsman and an experimenter'
        },
        cardImg: '../img/artistes/hubo.avif',
        heroImg: '../img/artistes/hubo.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'Bajo el pseudónimo de HUBO, se esconde una colaboración inusual y magnética entre un artesano del hierro y un apasionado por el ensayo de nuevas formas de expresión artística.',
                'El deseo de explorar los límites entre la estructura y la expresión libre, entre el hierro y el color, las texturas, tonalidades y volúmenes, configuran a veces formas no tan lejanas de la escultura, anhelando siempre el difícil equilibrio entre el concepto y la abstracción.',
                'La obra de HUBO destaca por un uso audaz del color, la riqueza táctil de las superficies y la profundidad casi geológica por superposiciones de texturas. Cada creación es un diálogo entre la permanencia del hierro y la fugacidad del gesto pictórico, entre el desbarajuste y lo esperado.',
                'Fieles a su espíritu original —artesanía, materia y emoción—, los creadores de HUBO prefieren que las obras hablen por sí mismas, dejando al espectador la libertad de sumergirse en su universo sensorial.'
            ],
            ca: [
                'Sota el pseudònim de HUBO, s\'amaga una col·laboració inusual i magnètica entre un artesà del ferro i un apassionat per l\'assaig de noves formes d\'expressió artística.',
                'El desig d\'explorar els límits entre l\'estructura i l\'expressió lliure, entre el ferro i el color, les textures, tonalitats i volums, configuren a vegades formes no tan llunyanes de l\'escultura, anhelant sempre el difícil equilibri entre el concepte i l\'abstracció.',
                'L\'obra de HUBO destaca per un ús audaç del color, la riquesa tàctil de les superfícies i la profunditat quasi geològica per superposicions de textures. Cada creació és un diàleg entre la permanència del ferro i la fugacitat del gest pictòric, entre el desgavell i l\'esperat.',
                'Fidels al seu esperit original —artesania, matèria i emoció—, els creadors de HUBO prefereixen que les obres parlin per si mateixes, deixant a l\'espectador la llibertat de submergir-se en el seu univers sensorial.'
            ],
            en: [
                'Under the pseudonym HUBO lies an unusual and magnetic collaboration between an iron craftsman and someone passionate about experimenting with new forms of artistic expression.',
                'The desire to explore the boundaries between structure and free expression, between iron and colour, textures, tones and volumes, sometimes configure forms not far removed from sculpture, always yearning for the difficult balance between concept and abstraction.',
                'HUBO\'s work stands out for its bold use of colour, the tactile richness of its surfaces and the almost geological depth created by overlapping textures. Each creation is a dialogue between the permanence of iron and the fleetingness of the pictorial gesture, between disorder and the expected.',
                'Faithful to their original spirit —craftsmanship, matter and emotion—, the creators of HUBO prefer the works to speak for themselves, leaving the viewer free to immerse themselves in their sensory universe.'
            ]
        },
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
        rol: {
            es: 'Artista plástico contemporáneo',
            ca: 'Artista plàstic contemporani',
            en: 'Contemporary visual artist'
        },
        cardImg: '../img/artistes/thorne-1.avif',
        heroImg: '../img/artistes/thorne-1.avif',
        instagram: 'https://www.instagram.com/victoriataylor.art/',
        bio: {
            es: [
                'David Thorne es el pseudónimo de un artista plástico contemporáneo cuya identidad real permanece en el anonimato. Compagina su actividad profesional con una intensa y selecta producción artística.',
                'Divide su vida entre Londres y la costa catalana, cerca de Barcelona, lo que le permite nutrirse de la energía creativa del mar Mediterráneo y del cosmopolitismo de la capital inglesa, así como del contraste cultural que las caracteriza.',
                'Su obra gira en torno a un único icono: la pajarita de papel, reinterpretada en esculturas de diversos tamaños, materiales y técnicas. Para Thorne, la pajarita es mucho más que una figura; es un lenguaje visual propio, una firma tridimensional reconocible al instante.',
                'Cada pieza combina un equilibrio entre la pureza formal y la experimentación cromática, transmitiendo carácter, emoción y un toque lúdico que contrasta con la aparente sencillez de la silueta.',
                'Su decisión de mantener el anonimato responde tanto a un deseo de preservar su vida privada como a la intención de añadir un halo de misterio que potencie la interpretación libre de su obra, capaz de transformar un gesto cotidiano —el plegado de una pajarita de papel— en un símbolo icónico y atemporal.'
            ],
            ca: [
                'David Thorne és el pseudònim d\'un artista plàstic contemporani la identitat real del qual roman en l\'anonimat. Compagina la seva activitat professional amb una intensa i selecta producció artística.',
                'Divideix la seva vida entre Londres i la costa catalana, prop de Barcelona, cosa que li permet nodrir-se de l\'energia creativa del mar Mediterrani i del cosmopolitisme de la capital anglesa, així com del contrast cultural que les caracteritza.',
                'La seva obra gira al voltant d\'un únic icona: la pajarita de paper, reinterpretada en escultures de diverses mides, materials i tècniques. Per a Thorne, la pajarita és molt més que una figura; és un llenguatge visual propi, una signatura tridimensional reconeixible a l\'instant.',
                'Cada peça combina un equilibri entre la puresa formal i l\'experimentació cromàtica, transmetent caràcter, emoció i un toc lúdic que contrasta amb l\'aparent senzillesa de la silueta.',
                'La seva decisió de mantenir l\'anonimat respon tant a un desig de preservar la seva vida privada com a la intenció d\'afegir un halo de misteri que potenciï la interpretació lliure de la seva obra, capaç de transformar un gest quotidià —el plegat d\'una pajarita de paper— en un símbol icònic i atemporal.'
            ],
            en: [
                'David Thorne is the pseudonym of a contemporary visual artist whose real identity remains anonymous. He combines his professional activity with an intense and selective artistic production.',
                'He divides his life between London and the Catalan coast, near Barcelona, which allows him to draw on the creative energy of the Mediterranean Sea and the cosmopolitanism of the English capital, as well as the cultural contrast that characterises them.',
                'His work revolves around a single icon: the paper bow tie, reinterpreted in sculptures of various sizes, materials and techniques. For Thorne, the bow tie is much more than a figure; it is its own visual language, a three-dimensional signature instantly recognisable.',
                'Each piece combines a balance between formal purity and chromatic experimentation, conveying character, emotion and a playful touch that contrasts with the apparent simplicity of the silhouette.',
                'His decision to remain anonymous responds both to a desire to preserve his private life and to the intention of adding an aura of mystery that enhances the free interpretation of his work, capable of transforming an everyday gesture —folding a paper bow tie— into an iconic and timeless symbol.'
            ]
        },
        logros: [],
        obras: [
            { img: '../img/artistes/thorne-2.avif', titulo: { es: 'Graffitti is in the air', ca: 'Graffitti is in the air', en: 'Graffitti is in the air' } },
            { img: '../img/artistes/thorne-3.avif', titulo: { es: 'Carbon Fever', ca: 'Carbon Fever', en: 'Carbon Fever' } },
            { img: '../img/artistes/thorne-1.avif', titulo: { es: 'Red Passion', ca: 'Red Passion', en: 'Red Passion' } }
        ]
    }
};
