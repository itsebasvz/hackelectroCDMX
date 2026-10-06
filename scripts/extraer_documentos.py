#!/usr/bin/env python3
"""Extrae los cuatro PDF locales a Markdown paginado sin dependencias de Python.

Requiere pdfinfo y pdftotext (Poppler). No modifica los originales ni usa red.
Las transcripciones visuales revisadas se conservan en docs/transcripciones-visuales.
"""

from datetime import date
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import subprocess
import unicodedata
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DEST = DOCS / "fuentes"
ORIGINALS = DOCS / "originales"
CONFIG = {
    "problematica electro hackaton.pdf": (
        "problematica-electro-hackaton.md", "Electro Hackathon CDMX — Problemáticas", 10
    ),
    "PIM-2019-2024_.pdf": (
        "pim-2019-2024.md", "Programa Integral de Movilidad de la Ciudad de México 2019–2024", 118
    ),
    "transporte.pdf": (
        "reglamento-transporte-2003.md", "Reglamento de Transporte del Distrito Federal (2003)", 33
    ),
    "Introduccion Electromovilidad.pdf": (
        "introduccion-electromovilidad.md", "Introducción Electromovilidad — Presentación completa de EMA", 60
    ),
}


def normalized_name(name):
    return "".join(c for c in unicodedata.normalize("NFD", name)
                   if unicodedata.category(c) != "Mn")


def run(*args):
    return subprocess.check_output(args, text=True, encoding="utf-8")


def page_label(text):
    lines = [re.sub(r"\s+", " ", s).strip() for s in text.splitlines() if s.strip()]
    lines = [s for s in lines if s not in {
        "Programa Integral de Movilidad 2019-2024",
        "ASAMBLEA LEGISLATIVA DEL DISTRITO FEDERAL, III LEGISLATURA",
    } and not s.isdigit() and "DEPARTAMENTO DE ADMINISTRACION" not in s]
    label = " / ".join(lines[:2])[:130] or "Sin texto extraíble"
    return label.replace("|", "\\|").replace("[", "(").replace("]", ")")


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    records = []
    for expected, (filename, title, expected_pages) in CONFIG.items():
        matches = [p for p in ORIGINALS.glob("*.pdf") if normalized_name(p.name) == expected]
        if len(matches) != 1:
            raise RuntimeError(f"Se esperaba un PDF para {expected}: {matches}")
        source = matches[0]
        metadata = run("pdfinfo", str(source))
        count = int(re.search(r"^Pages:\s+(\d+)", metadata, re.M).group(1))
        if count != expected_pages:
            raise RuntimeError(f"{source.name}: cambió el número de páginas; revisar índices y notas")
        raw = run("pdftotext", "-layout", str(source), "-")
        pages = raw.split("\f")
        if pages and not pages[-1].strip():
            pages.pop()
        if len(pages) != count:
            raise RuntimeError(f"{source.name}: páginas extraídas {len(pages)} != {count}")
        original_sha = sha256(source.read_bytes()).hexdigest()
        link = quote(os.path.relpath(source, DEST)) + "#page="
        parts = [f"# {title}\n",
                 f"Fuente: [{source.name}]({link}1).\n",
                 f"Páginas: {count}. SHA-256 del original: `{original_sha}`.\n",
                 "Extracción con `pdftotext -layout`. Los bloques de texto conservan columnas, "
                 "tablas, cortes de línea y erratas de origen; no son una reinterpretación. "
                 "Las imágenes y gráficos siguen disponibles en el PDF. "
                 "Las páginas reconstruidas visualmente se identifican de forma explícita.\n",
                 "Las referencias usan **página del archivo PDF**, contando la portada. "
                 "En el PIM la página impresa es una menos a partir de la segunda página.\n",
                 "## Índice por página\n",
                 "| Página PDF | Inicio del contenido |\n| --- | --- |"]
        overrides = {}
        for number, page in enumerate(pages, 1):
            prefix = {"pim-2019-2024.md": "pim", "introduccion-electromovilidad.md": "introduccion"}.get(filename)
            if prefix:
                manual = DOCS / "transcripciones-visuales" / f"{prefix}-{number:03d}.md"
                if manual.exists():
                    overrides[number] = manual.read_text(encoding="utf-8").strip()
            label = page_label(overrides.get(number, page))
            parts.append(f"| [{number}](#pagina-pdf-{number:03d}) | {label} |")
        # Índice de artículos para consultar el reglamento sin recorrer todas las páginas.
        if filename == "reglamento-transporte-2003.md":
            parts += ["\n## Índice de artículos\n", "| Artículo | Página PDF |\n| --- | --- |"]
            found = {}
            for number, page in enumerate(pages, 1):
                for article in re.findall(r"(?m)^\s*Art[íi]culo\s+(\d+)", page):
                    found.setdefault(int(article), number)
            if set(found) != set(range(1, 107)):
                raise RuntimeError("No se detectaron los 106 artículos del reglamento")
            parts += [f"| {a} | [{p}](#pagina-pdf-{p:03d}) |" for a, p in sorted(found.items())]
        for number, page in enumerate(pages, 1):
            parts += [f'\n<a id="pagina-pdf-{number:03d}"></a>\n',
                      f"## Página PDF {number}\n", f"[Ver original]({link}{number})\n"]
            if number in overrides:
                parts += ["**Transcripción visual revisada del PDF:** se usa para recuperar elementos "
                          "gráficos, texto no extraíble o resolver diferencias entre la capa textual "
                          "y lo que muestra la página.\n", overrides[number]]
            elif page.strip():
                controls = [c for c in page if ord(c) < 32 and c not in "\n\r\t"]
                if controls:
                    raise RuntimeError(f"{source.name}, página {number}: requiere revisión visual")
                parts += ["```text\n" + "\n".join(s.rstrip() for s in page.strip("\n").splitlines()) + "\n```"]
            else:
                parts.append("No hay texto extraíble en esta página; consultar la imagen del PDF.")
        target = DEST / filename
        target.write_text("\n".join(parts) + "\n", encoding="utf-8")
        records.append({"archivo": str(source.relative_to(ROOT)), "tipo": "pdf", "paginas": count,
                        "sha256": original_sha, "markdown": str(target.relative_to(ROOT)),
                        "paginas_con_transcripcion_visual": list(overrides),
                        "paginas_sin_texto_extraible": [n for n,p in enumerate(pages, 1) if not p.strip()]})
        print(f"{source.name}: {count} páginas → {target.relative_to(ROOT)}")
    (DOCS / "inventario.json").write_text(json.dumps({
        "fecha_extraccion": date.today().isoformat(),
        "alcance": "4 PDF originales, 221 páginas; presentación completa como fuente activa; sin verificación externa",
        "fuentes": records,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
