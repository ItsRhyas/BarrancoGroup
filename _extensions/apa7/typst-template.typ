// Typst Academic (APA 7) — Quarto custom format template.
// Implements the hard rules of the typst-academic skill:
// Times New Roman/Liberation Serif 12pt, lang "es", justified 1em leading,
// 1.27cm first-line indent, no colors, full-bleed institutional cover,
// APA 7 heading hierarchy, running head, margins, 0.4pt tables,
// references on a separate page, and {PLACEHOLDER} contract.

#let academic(
  title: none,
  subtitle: none,
  authors: (),
  institution: none,
  carnet: none,
  docente: none,
  date: none,
  lang: "es",
  font: "Times New Roman",
  fontsize: 12pt,
  cover: "image",
  cover-image: "portada.png",
  logo-image: "logo.png",
  running-head: none,
  sectionnumbering: none,
  toc: false,
  toc_title: none,
  toc_depth: none,
  toc_indent: 1.5em,
  doc,
) = {
  // Document metadata for PDF accessibility
  set document(title: title)
  set document(
    author: authors.map(author => content-to-string(author.name)).join(", ", last: " & "),
  ) if authors != () and authors != none

  // Base typography — APA 7
  set text(lang: lang, font: font, size: fontsize)
  set par(
    justify: true,
    leading: 1em,
    first-line-indent: 1.27cm,
  )
  set heading(numbering: sectionnumbering)

  // No colors: force black text everywhere
  show text: set text(fill: black)

  // APA 7 heading hierarchy
  show heading.where(level: 1): set text(weight: "bold")
  show heading.where(level: 1): set align(center)
  show heading.where(level: 2): set text(weight: "bold")
  show heading.where(level: 3): set text(weight: "bold", style: "italic")
  show heading: set par(first-line-indent: 0cm)
  show heading: set block(above: 24pt, below: 12pt)

  // Tables: thin stroke 0.4pt with clear header row
  set table(inset: 6pt, stroke: 0.4pt)
  show table.header: set text(weight: "bold")

  // Running head for the body
  let rh = if running-head != none {
    running-head
  } else if title != none {
    title
  } else {
    none
  }

  // ===== Cover page =====
  if cover == "image" {
    page(
      background: image(cover-image, fit: "cover"),
      margin: 0pt,
      numbering: none,
      header: none,
      footer: none,
    )[
      #place(center + horizon, image(logo-image, width: 60%))
      #place(bottom + left, pad(left: 2.54cm, bottom: 2cm)[
        #set text(weight: "bold", size: 20pt)
        #if title != none [#title]
        #if subtitle != none [\ #text(size: 14pt, weight: "regular")[#subtitle]]
      ])
    ]
    counter(page).update(1)
  } else if cover == "text" {
    page(
      margin: (top: 2.5cm, bottom: 2.5cm, left: 2.8cm, right: 2.8cm),
      numbering: none,
      header: none,
      footer: none,
    )[
      #v(30%)
      #align(center)[
        #text(size: 18pt, weight: "bold")[#if title != none [#title]]
        #if subtitle != none [\ #text(size: 14pt)[#subtitle]]
      ]
      #v(24pt)
      #if institution != none [#align(center)[#institution]]
      #v(24pt)
      #align(center)[
        #for author in authors [#author.name #linebreak()]
        #if carnet != none [#carnet #linebreak()]
        #if docente != none [Docente: #docente #linebreak()]
        #if date != none [#date]
      ]
    ]
    counter(page).update(1)
  }

  // ===== Body pages =====
  set page(
    margin: (top: 2.5cm, bottom: 2.5cm, left: 2.8cm, right: 2.8cm),
    numbering: "1",
    header: if rh != none {
      align(right, text(size: 9pt, style: "italic")[#rh])
    } else {
      none
    },
  )

  // References always start on a new page
  show bibliography: it => [#pagebreak() #it]

  // Table of contents
  if toc {
    block(above: 0em, below: 2em)[
      #outline(
        title: if toc_title == none { auto } else { toc_title },
        depth: toc_depth,
        indent: toc_indent,
      );
    ]
  }

  doc
}

#set table(
  inset: 6pt,
  stroke: 0.4pt,
)
