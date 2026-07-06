import json
import re
import sys
from pathlib import Path

from openpyxl import load_workbook


sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "Новый Список ароматов FLUIDE (1).xlsx"
OUTPUT = ROOT / "fragrances.json"
IMAGES = ROOT / "images" / "fragrances"

FAMILY_KEYWORDS = {
    "Цветочные": [
        "роза", "жасмин", "пион", "ирис", "фиал", "ландыш", "тубероз",
        "магноли", "орхиде", "лаванд", "цветок", "османтус", "герань", "нероли",
    ],
    "Фруктовые": [
        "яблок", "груш", "персик", "абрикос", "слив", "виш", "череш", "ананас",
        "манго", "маракуй", "ягод", "смород", "малин", "клубник", "гранат", "дын",
        "арбуз", "инжир", "личи",
    ],
    "Цитрусовые": [
        "бергамот", "лимон", "мандарин", "апельсин", "грейпфрут", "лайм",
        "цитрус", "юдзу", "помело",
    ],
    "Древесные": [
        "кедр", "сандал", "древес", "ветивер", "пачули", "уд", "мох", "кипарис", "гуаяк",
    ],
    "Сладкие": [
        "ваниль", "карамел", "шоколад", "какао", "мед", "пралине", "сахар", "зефир",
        "бобы тонка", "корица",
    ],
    "Свежие": [
        "морск", "водн", "озон", "акват", "свеж", "зелен", "мята", "лед", "огур", "чай",
    ],
    "Пряные и восточные": [
        "перец", "имбир", "кардамон", "шафран", "гвоздик", "мускат", "табак", "кожа",
        "ладан", "амбра", "мускус",
    ],
}


def split_notes(raw):
    groups = {"top": [], "middle": [], "base": [], "main": []}
    if not raw:
        return groups

    labels = {
        "верхние": "top",
        "средние": "middle",
        "базовые": "base",
        "основные": "main",
    }
    for line in str(raw).replace("\r", "").split("\n"):
        if ":" not in line:
            continue
        label, values = line.split(":", 1)
        key = labels.get(label.strip().lower())
        if not key:
            continue
        groups[key] = [item.strip() for item in values.split(",") if item.strip()]
    return groups


def detect_families(raw):
    text = str(raw or "").lower()
    families = [
        family
        for family, keywords in FAMILY_KEYWORDS.items()
        if any(keyword in text for keyword in keywords)
    ]
    return families or ["Другие"]


def clean_title(value):
    title = re.sub(r"^FLUIDE\s+", "", str(value or ""), flags=re.IGNORECASE)
    title = re.sub(r"\s+30\s*мл$", "", title, flags=re.IGNORECASE)
    return title.strip()


workbook = load_workbook(SOURCE, read_only=True, data_only=True)
sheet = workbook.active
fragrances = []

for row in sheet.iter_rows(min_row=2, values_only=True):
    if not row[0]:
        continue
    number = str(row[0]).strip().zfill(3)
    notes_raw = str(row[9] or "").strip()
    oil_percent = int(row[3]) if row[3] is not None else None
    image_path = IMAGES / f"{number}.webp"
    fragrances.append(
        {
            "id": number,
            "name": str(row[1] or "").strip(),
            "title": clean_title(row[1]),
            "original": str(row[2] or "").strip(),
            "oilPercent": oil_percent,
            "gender": str(row[5] or "").strip().lower(),
            "category": str(row[6] or "").strip(),
            "concentration": str(row[8] or "").strip(),
            "notes": split_notes(notes_raw),
            "notesRaw": notes_raw,
            "families": detect_families(notes_raw),
            **({"image": f"images/fragrances/{number}.webp"} if image_path.exists() else {}),
        }
    )

OUTPUT.write_text(json.dumps(fragrances, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Создан {OUTPUT.name}: {len(fragrances)} ароматов")
