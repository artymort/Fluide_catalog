SOLID_PERFUMES = [
    {
        "id": "solid-perfume-ag-thank-you-next",
        "title": "AG THANK YOU NEXT",
        "stem": "solid-perfume-ag-thank-you-next",
        "source": "solid_perfume_AG THANK YOU NEXT.png",
    },
    {
        "id": "solid-perfume-angels-share",
        "title": "ANGELS SHARE",
        "stem": "solid-perfume-angels-share",
        "source": "solid_perfume_ANGELS SHARE.png",
    },
    {
        "id": "solid-perfume-cr-aventus",
        "title": "CR AVENTUS",
        "stem": "solid-perfume-cr-aventus",
        "source": "solid_perfume_CR AVENTUS.png",
    },
    {
        "id": "solid-perfume-cr-gi-savage",
        "title": "CR. GI SAVAGE",
        "stem": "solid-perfume-cr-gi-savage",
        "source": "solid_perfume_CR. GI SAVAGE.png",
    },
    {
        "id": "solid-perfume-dalaal",
        "title": "DALAAL",
        "stem": "solid-perfume-dalaal",
        "source": "solid_perfume_DALAAL.png",
    },
    {
        "id": "solid-perfume-eros",
        "title": "EROS",
        "stem": "solid-perfume-eros",
        "source": "solid_perfume_EROS.png",
    },
    {
        "id": "solid-perfume-esc-mol-02",
        "title": "ESC MOL 02",
        "stem": "solid-perfume-esc-mol-02",
        "source": "solid_perfume_ESC MOL 02.png",
    },
    {
        "id": "solid-perfume-fleur-narcotique",
        "title": "FLEUR NARCOTIQUE",
        "stem": "solid-perfume-fleur-narcotique",
        "source": "solid_perfume_FLEUR NARCOTIQUE.png",
    },
    {
        "id": "solid-perfume-hayati",
        "title": "HAYATI",
        "stem": "solid-perfume-hayati",
        "source": "solid_perfume_HAYATI.png",
    },
    {
        "id": "solid-perfume-l-immensite",
        "title": "L’IMMENSITE",
        "stem": "solid-perfume-l-immensite",
        "source": "solid_perfume_L’IMMENSITE.png",
    },
    {
        "id": "solid-perfume-mandarine-basilic",
        "title": "MANDARINE BASILIC",
        "stem": "solid-perfume-mandarine-basilic",
        "source": "solid_perfume_mandarine_basilic.png",
    },
    {
        "id": "solid-perfume-matsukita",
        "title": "MATSUKITA",
        "stem": "solid-perfume-matsukita",
        "source": "solid_perfume_matsukita.png",
    },
    {
        "id": "solid-perfume-pr-invictus",
        "title": "PR INVICTUS",
        "stem": "solid-perfume-pr-invictus",
        "source": "solid_perfume_PR INVICTUS.png",
    },
    {
        "id": "solid-perfume-symphony",
        "title": "SYMPHONY",
        "stem": "solid-perfume-symphony",
        "source": "solid_perfume_SYMPHONY.png",
    },
    {
        "id": "solid-perfume-taj-sun-set",
        "title": "TAJ SUN SET",
        "stem": "solid-perfume-taj-sun-set",
        "source": "solid_perfume_TAJ SUN SET.png",
    },
    {
        "id": "solid-perfume-vs-so-sexy",
        "title": "VS SO SEXY",
        "stem": "solid-perfume-vs-so-sexy",
        "source": "solid_perfume_VS SO SEXY.png",
    },
]


PRODUCT_IMAGE_FILES = {
    "Парфюм для дома La Sultan 300 мл": ("perfume-home-la-sultan", "perfume_home_la_sultan.png"),
    "Парфюм для дома Citrus Rush 300 мл": ("perfume-home-citrus-rush", "perfume_home_citrus_rush.png"),
    "Парфюм для дома Sea Salt 300 мл": ("perfume-home-sea-salt", "perfume_home_sea_salt.png"),
    "Крем для тела La Sultan 300 мл": ("body-cream-la-sultan", "body_cream_la_sultan.png"),
    "Крем для тела Dream Touch 300 мл": ("body-cream-dream-touch", "body_cream_dream_touch.png"),
    "Парфюмированное мыло для рук Amber in The Garden": ("hand-soap-amber-garden", "hand_soap_garden.png"),
    "Набор из четырех свечей": ("candle-set-four", "набор из 4-х свечей.png"),
    'Набор свечей " Три Медведя"': ("candle-set-three-bears", "три медведя.png"),
    "Набор из трех свечей": ("candle-set-three", "набор из 3-х свечей.png"),
    'Набор свечей "Дух лошади"': ("candle-set-horse", "набор дух лошади.png"),
    'Аромасвеча гипс "Ракушка"': ("candle-shell", "ракушка.png"),
    "Аромасвеча в стекле балерина 50 мл": ("candle-ballerina-50", "балерина 50мл.png"),
    "Аромасвеча в стекле балерина 100 мл": ("candle-ballerina-100-200", "балерина 100 мл и 200 мл.png"),
    "Аромасвеча в стекле балерина 200 мл": ("candle-ballerina-100-200", "балерина 100 мл и 200 мл.png"),
    'Аромасвеча гипс "Грут"': ("candle-groot", "свеча грут.png"),
    "Аромадиффузор Mango & Bergamot 100 мл": ("diffuser-mango-bergamot", "diffuser_mango_bergamot.png"),
    "Аромадиффузор Black Papper 100 мл": ("diffuser-black-pepper", "diffuser_black_papper.png"),
    "Аромадиффузор Cashmere 100 мл": ("diffuser-cashmere", "diffuser_cashmere.png"),
    "Аромадиффузор La Sultan 100 мл": ("diffuser-la-sultan", "diffuser_la_sultan.png"),
    "Спрей для волос FLUIDE 200 мл": ("hair-spray-devils-intrigue", "haier_spray_Devils_intrigue.png"),
}

PRODUCT_IMAGE_FILES.update({
    item["title"]: (item["stem"], item["source"])
    for item in SOLID_PERFUMES
})
