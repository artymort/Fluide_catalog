import sys
from pathlib import Path

from PIL import Image

from product_image_map import PRODUCT_IMAGE_FILES


sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "image_products"
OUTPUT = ROOT / "images" / "products"
THUMBS = OUTPUT / "thumbs"
FULL_SIZE = (1200, 1200)
THUMB_CANVAS = (480, 360)
THUMB_OBJECT = (400, 310)


def cropped_rgba(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    alpha_box = image.getchannel("A").getbbox()
    return image.crop(alpha_box) if alpha_box else image


def save_full(image: Image.Image, destination: Path) -> None:
    full = image.copy()
    full.thumbnail(FULL_SIZE, Image.Resampling.LANCZOS)
    full.save(destination, "WEBP", quality=90, method=6, exact=True)


def save_thumb(image: Image.Image, destination: Path) -> None:
    thumb = image.copy()
    thumb.thumbnail(THUMB_OBJECT, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", THUMB_CANVAS, (0, 0, 0, 0))
    position = ((THUMB_CANVAS[0] - thumb.width) // 2, (THUMB_CANVAS[1] - thumb.height) // 2)
    canvas.alpha_composite(thumb, position)
    canvas.save(destination, "WEBP", quality=84, method=6, exact=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)
    unique_images = {value for value in PRODUCT_IMAGE_FILES.values()}

    for index, (stem, source_name) in enumerate(sorted(unique_images), start=1):
        source = SOURCE / source_name
        if not source.exists():
            raise FileNotFoundError(f"Не найдено изображение: {source}")
        image = cropped_rgba(source)
        save_full(image, OUTPUT / f"{stem}.webp")
        save_thumb(image, THUMBS / f"{stem}.webp")
        image.close()
        print(f"[{index}/{len(unique_images)}] {source_name} -> {stem}.webp")


if __name__ == "__main__":
    main()
