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

rows = list(csv.reader(SOURCE.read_text(encoding="utf-8-sig").splitlines()))
current_type = None
products = []
seen = set()
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
    match = re.search(r"(\d+)\s*мл", name)
    product_type, type_label = current_type
    product = {"id": f"product-{len(products) + 1:02d}", "kind": "product",
               "name": name, "title": name, "productType": product_type,
               "typeLabel": type_label, "volume": f"{match.group(1)} мл" if match else "",
               "price": int(price)}
    image_entry = PRODUCT_IMAGE_FILES.get(name)
    if image_entry:
        image_stem, _ = image_entry
        product["image"] = f"images/products/{image_stem}.webp"
        product["thumbnail"] = f"images/products/thumbs/{image_stem}.webp"
    products.append(product)

OUTPUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Создан {OUTPUT}: {len(products)} товаров")
