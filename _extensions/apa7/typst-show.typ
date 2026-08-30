#show: doc => academic(
$if(title)$
  title: [$title$],
$endif$
$if(subtitle)$
  subtitle: [$subtitle$],
$endif$
$if(by-author)$
  authors: (
$for(by-author)$
$if(it.name.literal)$
    ( name: [$it.name.literal$],
      affiliation: [$for(it.affiliations)$$it.name$$sep$, $endfor$],
      email: [$it.email$] ),
$endif$
$endfor$
    ),
$endif$
$if(institution)$
  institution: [$institution$],
$endif$
$if(carnet)$
  carnet: [$carnet$],
$endif$
$if(docente)$
  docente: [$docente$],
$endif$
$if(date)$
  date: [$date$],
$endif$
$if(lang)$
  lang: "$lang$",
$endif$
$if(mainfont)$
  font: "$mainfont$",
$elseif(brand.typography.base.family)$
  font: $brand.typography.base.family$,
$endif$
$if(fontsize)$
  fontsize: $fontsize$,
$endif$
$if(cover)$
  cover: "$cover$",
$endif$
$if(cover-image)$
  cover-image: "$cover-image$",
$endif$
$if(logo-image)$
  logo-image: "$logo-image$",
$endif$
$if(running-head)$
  running-head: [$running-head$],
$endif$
$if(section-numbering)$
  sectionnumbering: "$section-numbering$",
$endif$
$if(toc)$
  toc: $toc$,
$endif$
$if(toc-title)$
  toc_title: [$toc-title$],
$endif$
$if(toc-indent)$
  toc_indent: $toc-indent$,
$endif$
$if(toc-depth)$
  toc_depth: $toc-depth$,
$endif$
  doc,
)