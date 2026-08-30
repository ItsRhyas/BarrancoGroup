# APA 7 — Quarto format

Quarto custom format that renders academic documents in APA 7th edition with
an institutional cover page, `Times New Roman` 12pt, and formal academic
formatting using the Typst engine embedded in Quarto.

## Installing

Copy the `_extensions/apa7` folder into the project and declare the format in
the document front matter:

```yaml
format:
  apa7-typst: default
```

## Using

Set the document metadata in the YAML front matter, then write the body in
Markdown. Example:

```yaml
---
title: "Título del trabajo"
subtitle: "Subtítulo (opcional)"
author: "Nombre del autor"
institution: "Universidad"
carnet: "Carnet del autor"
docente: "Nombre del docente"
date: "2026-08-20"
lang: es
format:
  apa7-typst:
    cover: image            # "image" | "text" | "none"
    cover-image: "portada.png"
    logo-image: "logo.png"
    running-head: "Título corto"
bibliography: "refs.bib"
---
```

Render with:

```bash
quarto render documento.qmd
```

> **Note:** `date` must be a real ISO date (e.g. `2026-08-20`) or Pandoc
> renders `Invalid Date`. Use the `docente`, `carnet`, `institution` fields
> for the cover data.

### Cover options

| `cover` value | Behavior |
|---|---|
| `image` (default) | Full-bleed `portada.png` background, `logo.png` centered at 60% width |
| `text` | Text-only APA cover (centered title, author, institution, date) |
| `none` | No cover page; body starts immediately |

### Notes

- Requires `portada.png` and `logo.png` in the same directory as the `.qmd`
  (paths are overridable via `cover-image` and `logo-image`).
- References are always placed on a new page (`#pagebreak()` before the
  bibliography).
- `Times New Roman` 12pt (set via `mainfont` if a different font is needed).
- Body: justified, 1em leading, 1.27cm first-line indent, margins
  `top/bottom 2.5cm`, `left/right 2.8cm`.
- No colors: all text is black. APA 7 heading hierarchy (L1 bold centered,
  L2 bold left, L3 bold+italic left).
