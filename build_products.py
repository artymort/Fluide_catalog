import csv
import json
import re
from pathlib import Path

from product_image_map import PRODUCT_IMAGE_FILES

SOURCE = Path("Цены FLUIDE - Лист1.csv")
OUTPUT = Path("products.json")
SECTION_TYPES = {
    "Парфюм для дома": ("home-fragrance", "Парфюм для дома"),
    "Крем": ("body-cream", "Крем для тела"),
    "Мыло": ("hand-soap", "Мыло"),
    "Свечи": ("candle", "Свечи"),
    "Аромадиффузоры": ("diffuser", "Аромадиффузоры"),
    "Твердый парфюм": ("solid-perfume", "Твёрдый парфюм"),
    "Автопарфюм": ("car-fragrance", "Автопарфюм"),
    "Спрей для волос": ("hair-spray", "Спрей для волос"),
}
AVAILABLE_DIFFUSERS = {
    "Аромадиффузор Манго 100 мл",
    "Аромадиффузор Black Pepper 100 мл",
    "Аромадиффузор Cashmere 100 мл",
    "Аромадиффузор La Sultan 100 мл",
}
DISPLAY_NAMES = {
    "Аромадиффузор Манго 100 мл": "Аромадиффузор Mango & Bergamot 100 мл",
    "Аромадиффузор Black Pepper 100 мл": "Аромадиффузор Black Papper 100 мл",
}

rows = list(csv.reader(SOURCE.read_text(encoding="utf-8-sig").splitlines()))
current_type = None
products = []
seen = set()
source_product_index = 0
for row in rows[1:]:
    name, price = row[0].strip(), row[2].strip()
    if name in SECTION_TYPES and not price:
        current_type = SECTION_TYPES[name]
        continue
    if name == "Пакеты":
        current_type = None
        continue
    if not current_type or not name or not price or name in seen:
        continue
    seen.add(name)
    source_product_index += 1
    product_type, type_label = current_type
    if product_type == "diffuser" and name not in AVAILABLE_DIFFUSERS:
        continue
    display_name = DISPLAY_NAMES.get(name, name)
    match = re.search(r"(\d+)\s*мл", display_name)
    product = {"id": f"product-{source_product_index:02d}", "kind": "product",
               "name": display_name, "title": display_name, "productType": product_type,
               "typeLabel": type_label, "volume": f"{match.group(1)} мл" if match else "",
               "price": int(price)}
    image_entry = PRODUCT_IMAGE_FILES.get(display_name)
    if image_entry:
        image_stem, _ = image_entry
        product["image"] = f"images/products/{image_stem}.webp"
        product["thumbnail"] = f"images/products/thumbs/{image_stem}.webp"
    products.append(product)

OUTPUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Создан {OUTPUT}: {len(products)} товаров")
