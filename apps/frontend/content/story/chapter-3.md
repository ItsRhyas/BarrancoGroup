---
id: level-3
title: "Capítulo 3"
order: 3
sceneSlots:
  - id: slot-scene-3a
    label: Casa
  - id: slot-scene-3b
    label: Calle
scenes:
  - id: scene:home
    assetId: scene:home
    label: Casa
    characterSlots:
      - id: ch3-home-a
        anchorX: 30
        anchorY: 60
      - id: ch3-home-b
        anchorX: 70
        anchorY: 60
  - id: scene:street
    assetId: scene:street
    label: Calle
    characterSlots:
      - id: ch3-street-a
        anchorX: 25
        anchorY: 55
      - id: ch3-street-b
        anchorX: 75
        anchorY: 55
characters:
  - id: char:mairin
    assetId: char:mairin
    label: Mairin
  - id: char:ch3-parent
    assetId: char:ch3-parent
    label: Papá
  - id: char:ch3-sibling
    assetId: char:ch3-sibling
    label: Hermano
  - id: char:ch3-friend
    assetId: char:ch3-friend
    label: Amiga
expected:
  scenes:
    slot-scene-3a: scene:home
    slot-scene-3b: scene:street
  characters:
    ch3-home-a: char:ch3-parent
    ch3-home-b: char:mairin
    ch3-street-a: char:ch3-sibling
    ch3-street-b: char:ch3-friend
  correctEndingId: ending:correct-3
endings:
  - id: ending:correct-3
    type: correct
    title: "¡Buena elección!"
    description: "Mairin compartió con su familia y amigos. Todos se sintieron incluidos."
    imageAssetId: ending:correct-3
  - id: ending:incorrect-3
    type: incorrect
    title: "Inténtalo de nuevo"
    description: "La escena no muestra inclusión familiar. Piensa en quién debería acompañar a Mairin."
    imageAssetId: ending:incorrect-3
---

Mairin aprende que compartir con quienes nos rodea hace más fuertes los lazos familiares.
