import argparse
import io
import re
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove


sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / "FLUIDE matched images"
DEFAULT_OUTPUT = ROOT / "images" / "fragrances"


def output_name(source: Path) -> str:
    match = re.search(r"\bFLUIDE\s+(\d+)\b", source.stem, re.IGNORECASE)
    if not match:
        raise ValueError(f"Не найден номер аромата в имени файла: {source.name}")
    return f"{match.group(1).zfill(3)}.webp"


def process_image(source: Path, destination: Path, session, max_size: int, quality: int) -> None:
    cutout_bytes = remove(source.read_bytes(), session=session)
    with Image.open(io.BytesIO(cutout_bytes)) as image:
        image = image.convert("RGBA")
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=quality, method=6, exact=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Удаляет фон и готовит WebP-файлы ароматов для сайта.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--model", default="birefnet-general")
    parser.add_argument("--max-size", type=int, default=1200)
    parser.add_argument("--quality", type=int, default=90)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    sources = sorted(path for path in args.source.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    if args.limit:
        sources = sources[: args.limit]
    session = new_session(args.model)

    for index, source in enumerate(sources, start=1):
        destination = args.output / output_name(source)
        if destination.exists() and not args.overwrite:
            print(f"[{index}/{len(sources)}] пропуск: {destination.name}")
            continue
        process_image(source, destination, session, args.max_size, args.quality)
        print(f"[{index}/{len(sources)}] {source.name} -> {destination.name}")


if __name__ == "__main__":
    main()
