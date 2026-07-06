import sys
from pathlib import Path

from PIL import Image


sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "images" / "fragrances"
OUTPUT = SOURCE / "thumbs"
CANVAS_SIZE = (480, 360)
OBJECT_SIZE = (400, 310)


OUTPUT.mkdir(parents=True, exist_ok=True)
sources = sorted(path for path in SOURCE.glob("*.webp") if path.is_file())

for index, source in enumerate(sources, start=1):
    with Image.open(source) as image:
        image = image.convert("RGBA")
        alpha_box = image.getchannel("A").getbbox()
        if alpha_box:
            image = image.crop(alpha_box)
        image.thumbnail(OBJECT_SIZE, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
        position = ((CANVAS_SIZE[0] - image.width) // 2, (CANVAS_SIZE[1] - image.height) // 2)
        canvas.alpha_composite(image, position)
        destination = OUTPUT / source.name
        canvas.save(destination, "WEBP", quality=84, method=6, exact=True)
    print(f"[{index}/{len(sources)}] {destination.name}")

print(f"Создано миниатюр: {len(sources)}")
