import argparse
import io
import re
import sys
from pathlib import Path

from PIL import Image


sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / "FLUIDE matched images"
DEFAULT_OUTPUT = ROOT / "images" / "fragrances"


def output_name(source: Path) -> str:
    match = re.search(r"\bFLUIDE\s+(\d+)\b", source.stem, re.IGNORECASE)
    if not match:
        match = re.match(r"\s*(\d+)\b", source.stem)
    if not match:
        raise ValueError(f"Не найден номер аромата в имени файла: {source.name}")
    return f"{match.group(1).zfill(3)}.webp"


def process_image(source: Path, destination: Path, session, remove_function, max_size: int, quality: int) -> None:
    image_source = io.BytesIO(remove_function(source.read_bytes(), session=session)) if session else source
    with Image.open(image_source) as image:
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
    parser.add_argument("--ids", nargs="*", help="Номера ароматов для точечной пересборки")
    parser.add_argument("--already-cutout", action="store_true", help="Сохранить готовую прозрачность без повторного удаления фона")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    sources = sorted(path for path in args.source.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    requested_ids = {
        value.strip().zfill(3)
        for argument in (args.ids or [])
        for value in argument.split(",")
        if value.strip()
    }
    if requested_ids:
        sources = [path for path in sources if Path(output_name(path)).stem in requested_ids]
    if args.limit:
        sources = sources[: args.limit]
    session = None
    remove_function = None
    if not args.already_cutout:
        from rembg import new_session, remove

        session = new_session(args.model)
        remove_function = remove

    for index, source in enumerate(sources, start=1):
        destination = args.output / output_name(source)
        if destination.exists() and not args.overwrite:
            print(f"[{index}/{len(sources)}] пропуск: {destination.name}")
            continue
        process_image(source, destination, session, remove_function, args.max_size, args.quality)
        print(f"[{index}/{len(sources)}] {source.name} -> {destination.name}")


if __name__ == "__main__":
    main()
