export type Bike = {
  slug: string;
  name: string;
  family: string;
  use: string;
  image: string;
  description: string;
  sku: string;
  children: number | null;
  specs: string[][];
  source?: string | null;
  variants: string[];
};
// Public product data only. Purchase prices and supplier terms are never imported.
// Source: manufacturer product workbook 2026; Kindergarten capacity: linked official pages.
export const bikes: Bike[] = [
  {
    "slug": "flex",
    "name": "Flex",
    "family": "Flex",
    "use": "Rodina",
    "image": "flex-gallery-06",
    "description": "Priestor pre deti, nákup aj spontánnu zastávku v parku. Elektrický cargo bicykel pre spoločný každodenný život.",
    "sku": "1170",
    "children": 4,
    "specs": [
      [
        "Počet detí",
        "Až 4 detí"
      ],
      [
        "Motor",
        "250 W"
      ],
      [
        "Batéria",
        "12,8 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano · 7 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90,5 cm šírka 59,5 cm výška vzadu 50,5 cm, výška vpredu 42,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "flex",
      "flex-dog",
      "flex-kindergarten",
      "flex-box"
    ]
  },
  {
    "slug": "delight",
    "name": "Delight",
    "family": "Delight",
    "use": "Rodina",
    "image": "delight-gallery-01",
    "description": "Vezmite každodenné cesty za príležitosť byť spolu. Rodinný cargo bicykel so stredovým motorom Ananda.",
    "sku": "1160",
    "children": 4,
    "specs": [
      [
        "Počet detí",
        "Až 4 detí"
      ],
      [
        "Motor",
        "250 W, Ananda stredový motor 110 Nm"
      ],
      [
        "Batéria",
        "19,6 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano Altus · 8 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90,5 cm šírka 59,5 cm výška vzadu 50,5 cm, výška vpredu 42,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "delight",
      "delight-kindergarten",
      "delight-box",
      "delight-dog"
    ]
  },
  {
    "slug": "flex-dog",
    "name": "Flex Dog",
    "family": "Flex",
    "use": "So psom",
    "image": "flex-dog-gallery-00",
    "description": "Na spoločné výlety aj bežné cesty so štvornohým parťákom. Model z radu Flex navrhnutý na prepravu psov.",
    "sku": "1172",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W"
      ],
      [
        "Batéria",
        "12,8 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano · 7 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90,5 cm šírka 59,5 cm výška vzadu 50,5 cm, výška vpredu 42,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "flex",
      "flex-dog",
      "flex-kindergarten",
      "flex-box"
    ]
  },
  {
    "slug": "longtail",
    "name": "Longtail Varia",
    "family": "Longtail",
    "use": "Mesto",
    "image": "longtail-gallery-00",
    "description": "Predĺžená zadná časť namiesto predného boxu. Mestský cargo bicykel s možnosťami vybavenia pre pasažierov aj náklad.",
    "sku": "1280",
    "children": null,
    "specs": [],
    "source": null,
    "variants": [
      "longtail"
    ]
  },
  {
    "slug": "flex-kindergarten",
    "name": "Flex Kindergarten",
    "family": "Flex",
    "use": "Pre škôlky",
    "image": "flex-kindergarten-gallery-01",
    "description": "Flex Kindergarten má miesto až pre šesť detí na dvoch pozdĺžnych laviciach. Väčší box s prednými dvierkami pre spoločné výlety škôlok aj početnejších rodín.",
    "sku": "1173",
    "children": 6,
    "specs": [
      [
        "Počet detí",
        "Až 6 detí"
      ],
      [
        "Motor",
        "Ananda v zadnom náboji · 250 W · 45 Nm"
      ],
      [
        "Batéria",
        "12,8 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano Tourney · 7 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 91,5 cm × šírka 89 cm × výška 55 cm"
      ]
    ],
    "source": "https://cargobikeofsweden.com/en/articles/2.15.9/cargobike-flex-kindergarten",
    "variants": [
      "flex",
      "flex-dog",
      "flex-kindergarten",
      "flex-box"
    ]
  },
  {
    "slug": "delight-kindergarten",
    "name": "Delight Kindergarten",
    "family": "Delight",
    "use": "Pre škôlky",
    "image": "delight-kindergarten-gallery-01",
    "description": "Delight Kindergarten má miesto až pre šesť detí na dvoch pozdĺžnych laviciach. Väčší box s prednými dvierkami pre spoločné výlety škôlok aj početnejších rodín.",
    "sku": "1163",
    "children": 6,
    "specs": [
      [
        "Počet detí",
        "Až 6 detí"
      ],
      [
        "Motor",
        "Ananda stredový motor 110 Nm"
      ],
      [
        "Batéria",
        "19,6 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano Altus · 8 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 91,5 cm šírka 89 cm výška 55 cm"
      ]
    ],
    "source": "https://cargobikeofsweden.com/en/articles/2.15.5/cargobike-delight-kindergarten",
    "variants": [
      "delight",
      "delight-kindergarten",
      "delight-box",
      "delight-dog"
    ]
  },
  {
    "slug": "classic-kindergarten",
    "name": "Classic Kindergarten",
    "family": "Classic",
    "use": "Pre škôlky",
    "image": "classic-kindergarten-gallery-02",
    "description": "Classic Kindergarten má miesto až pre šesť detí na dvoch pozdĺžnych laviciach. Väčší box s prednými dvierkami pre spoločné výlety škôlok aj početnejších rodín.",
    "sku": "1263",
    "children": 6,
    "specs": [
      [
        "Počet detí",
        "Až 6 detí"
      ],
      [
        "Motor",
        "250 W Ananda, 45 Nm"
      ],
      [
        "Batéria",
        "13 Ah · 36 V · Li-ion"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano SiS · 6 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 91,5 cm šírka 89 cm výška 55 cm"
      ]
    ],
    "source": "https://cargobikeofsweden.com/fr/articles/2.15.562/cargobike-classic-kindergarten-velo-cargo",
    "variants": [
      "classic-kindergarten",
      "classic",
      "classic-dog",
      "classic-box"
    ]
  },
  {
    "slug": "flex-box",
    "name": "Flex Box",
    "family": "Flex",
    "use": "Náklad a podnikanie",
    "image": "flex-box-gallery-01",
    "description": "Flex Box je nákladná verzia radu Flex. Priestor pre pracovné vybavenie, zásielky aj každodenný náklad.",
    "sku": "1171",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W, 45 Nm"
      ],
      [
        "Batéria",
        "13 Ah · 36 V · Li-ion"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano SiS · 6 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90 cm šírka 59 cm výška 59 cm"
      ]
    ],
    "source": null,
    "variants": [
      "flex",
      "flex-dog",
      "flex-kindergarten",
      "flex-box"
    ]
  },
  {
    "slug": "delight-box",
    "name": "Delight Box",
    "family": "Delight",
    "use": "Náklad a podnikanie",
    "image": "delight-box-gallery-01",
    "description": "Delight Box je nákladná verzia radu Delight. Priestor pre pracovné vybavenie, zásielky aj každodenný náklad.",
    "sku": "1161",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W, Ananda stredový motor 110 Nm"
      ],
      [
        "Batéria",
        "19,6 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano Alfine · 8 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90 cm šírka 59 cm výška 59 cm"
      ]
    ],
    "source": null,
    "variants": [
      "delight",
      "delight-kindergarten",
      "delight-box",
      "delight-dog"
    ]
  },
  {
    "slug": "delight-dog",
    "name": "Delight Dog",
    "family": "Delight",
    "use": "So psom",
    "image": "delight-dog-gallery-02",
    "description": "Delight Dog je verzia radu Delight na spoločné cesty so psom. Predný box má vstup pre jednoduchšie nastupovanie.",
    "sku": "1162",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W, Ananda stredový motor 110 Nm"
      ],
      [
        "Batéria",
        "19,6 Ah · 36 V · Samsung/LG"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano Altus · 8 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 90,5 cm šírka 59,5 cm výška vzadu 50,5 cm, výška vpredu 42,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "delight",
      "delight-kindergarten",
      "delight-box",
      "delight-dog"
    ]
  },
  {
    "slug": "classic",
    "name": "Classic",
    "family": "Classic",
    "use": "Rodina",
    "image": "classic-gallery-06",
    "description": "Klasický trojkolesový cargo bicykel na rodinné cesty a každodenné presuny. S elektrickou asistenciou a predným boxom.",
    "sku": "1260",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W Ananda, 45 Nm"
      ],
      [
        "Batéria",
        "13 Ah · 36 V · Li-ion"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano SiS · 6 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 91,5 cm šírka 61,5 cm výška 49,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "classic-kindergarten",
      "classic",
      "classic-dog",
      "classic-box"
    ]
  },
  {
    "slug": "classic-dog",
    "name": "Classic Dog",
    "family": "Classic",
    "use": "So psom",
    "image": "classic-dog-gallery-00",
    "description": "Classic Dog je verzia radu Classic na spoločné cesty so psom. Predný box má vstup pre jednoduchšie nastupovanie.",
    "sku": "1262",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W Ananda, 45 Nm"
      ],
      [
        "Batéria",
        "13 Ah · 36 V · Li-ion"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano SiS · 6 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 91,5 cm šírka 61,5 cm výška 49,5 cm"
      ]
    ],
    "source": null,
    "variants": [
      "classic-kindergarten",
      "classic",
      "classic-dog",
      "classic-box"
    ]
  },
  {
    "slug": "classic-box",
    "name": "Classic Box",
    "family": "Classic",
    "use": "Náklad a podnikanie",
    "image": "classic-box-gallery-04",
    "description": "Classic Box je nákladná verzia radu Classic. Priestor pre pracovné vybavenie, zásielky aj každodenný náklad.",
    "sku": "1261",
    "children": null,
    "specs": [
      [
        "Motor",
        "250 W Ananda, 45 Nm"
      ],
      [
        "Batéria",
        "13 Ah · 36 V · Li-ion"
      ],
      [
        "Nosnosť",
        "100 kg v boxe + 100 kg jazdec"
      ],
      [
        "Prevody",
        "Shimano SiS · 6 stupňov"
      ],
      [
        "Rozmery boxu",
        "dĺžka 87 cm, šírka 59 cm, výška vzadu 59 cm, výška vpredu 55 cm"
      ]
    ],
    "source": null,
    "variants": [
      "classic-kindergarten",
      "classic",
      "classic-dog",
      "classic-box"
    ]
  },
  {
    "slug": "longlite",
    "name": "Long Lite",
    "family": "Long Lite",
    "use": "Rodina",
    "image": "longlite-gallery-01",
    "description": "Dve kolesá, predný box a priestor až pre dve deti. Long Lite spája rodinné cestovanie so stredovým motorom Ananda.",
    "sku": "1240",
    "children": 2,
    "specs": [
      [
        "Počet detí",
        "Až 2 deti"
      ],
      [
        "Motor",
        "Ananda stredový motor 110 Nm"
      ],
      [
        "Batéria",
        "19,6 Ah · 36 V · Samsung/LG"
      ],
      [
        "Prevody",
        "Shimano Altus · 8 stupňov"
      ]
    ],
    "source": null,
    "variants": [
      "longlite"
    ]
  }
];
export const featuredSlugs = ['flex', 'delight', 'flex-dog', 'longtail'];
export const site = { operator: 'Vivid Production s.r.o.', contactEmail: 'hello@vividproduction.sk' };
