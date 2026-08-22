---
id: level-5
title: "Capítulo 5"
order: 5
sceneSlots:
  - id: slot-scene-5a
    label: Jardín
  - id: slot-scene-5b
    label: Cuarto
  - id: slot-scene-5c
    label: Escenario
scenes:
  - id: scene:garden
    assetId: scene:garden
    label: Jardín
    characterSlots:
      - id: ch5-garden-a
        anchorX: 25
        anchorY: 55
      - id: ch5-garden-b
        anchorX: 75
        anchorY: 55
  - id: scene:room
    assetId: scene:room
    label: Cuarto
    characterSlots:
      - id: ch5-room-a
        anchorX: 40
        anchorY: 60
      - id: ch5-room-b
        anchorX: 60
        anchorY: 60
  - id: scene:stage
    assetId: scene:stage
    label: Escenario
    characterSlots:
      - id: ch5-stage-a
        anchorX: 30
        anchorY: 55
      - id: ch5-stage-b
        anchorX: 70
        anchorY: 55
characters:
  - id: char:mairin
    assetId: char:mairin
    label: Mairin
  - id: char:ch5-grandparent
    assetId: char:ch5-grandparent
    label: Abuelo
expected:
  scenes:
    slot-scene-5a: scene:garden
    slot-scene-5b: scene:room
    slot-scene-5c: scene:stage
  characters:
    ch5-garden-a: char:mairin
    ch5-garden-b: char:ch5-grandparent
    ch5-room-a: char:mairin
    ch5-room-b: char:ch5-grandparent
    ch5-stage-a: char:mairin
    ch5-stage-b: char:ch5-grandparent
  correctEndingId: ending:correct-5
endings:
  - id: ending:correct-5
    type: correct
    title: "¡Valores en acción!"
    description: "Mairin honró la sabiduría de su abuelo y compartió sus enseñanzas con otros."
    imageAssetId: ending:correct-5
  - id: ending:incorrect-5
    type: incorrect
    title: "Inténtalo de nuevo"
    description: "La escena no muestra respeto por las personas mayores. ¿Quién acompaña a Mairin?"
    imageAssetId: ending:incorrect-5
---

Mairin descubre que escuchar a quienes tienen más experiencia nos ayuda a tomar mejores decisiones.
