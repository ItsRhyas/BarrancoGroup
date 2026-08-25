import { PrismaClient } from "../apps/backend/src/generated/prisma/client";

const prisma = new PrismaClient();

interface LevelSeed {
  id: string;
  title: string;
  narrative: string;
  order: number;
  sceneSlots: { id: string; label: string }[];
  scenes: {
    id: string;
    assetId: string;
    label: string;
    characterSlots: { id: string; anchorX: number; anchorY: number }[];
  }[];
  characters: { id: string; assetId: string; label: string }[];
  expected: {
    scenes: Record<string, string>;
    characters: Record<string, string>;
    correctEndingId: string;
  };
  endings: {
    id: string;
    type: "correct" | "incorrect";
    title: string;
    description: string;
    imageAssetId?: string;
  }[];
}

const levels: LevelSeed[] = [
  {
    id: "level-1",
    title: "El saludo de Mairin",
    narrative: "Mairin llega al aula. Reconstruye la escena colocando el salón y los personajes que muestran respeto.",
    order: 1,
    sceneSlots: [{ id: "slot-scene-1", label: "Aula" }],
    scenes: [
      {
        id: "scene:classroom",
        assetId: "scene:classroom",
        label: "Aula",
        characterSlots: [
          { id: "char-slot-1", anchorX: 25, anchorY: 55 },
          { id: "char-slot-2", anchorX: 75, anchorY: 55 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:teacher", assetId: "char:teacher", label: "Maestro" },
      { id: "char:peer", assetId: "char:peer", label: "Compañero" },
    ],
    expected: {
      scenes: { "slot-scene-1": "scene:classroom" },
      characters: { "char-slot-1": "char:mairin", "char-slot-2": "char:teacher" },
      correctEndingId: "ending:correct-1",
    },
    endings: [
      { id: "ending:correct-1", type: "correct", title: "¡Muy bien!", description: "Mairin saludó al maestro con respeto. El aula se llenó de armonía y todos aprendieron juntos.", imageAssetId: "ending:correct-1" },
      { id: "ending:incorrect-1", type: "incorrect", title: "Inténtalo de nuevo", description: "La escena no refleja respeto. Piensa en quién debería estar junto a Mairin en el aula.", imageAssetId: "ending:incorrect-1" },
    ],
  },
  {
    id: "level-2",
    title: "Un juego para todos",
    narrative: "En el parque, Mairin quiere que todos puedan jugar. Coloca la escena y los personajes que muestran equidad.",
    order: 2,
    sceneSlots: [
      { id: "slot-scene-2", label: "Parque" },
      { id: "slot-scene-2b", label: "Patio de juegos" },
    ],
    scenes: [
      {
        id: "scene:park",
        assetId: "scene:park",
        label: "Parque",
        characterSlots: [
          { id: "char-slot-a", anchorX: 20, anchorY: 60 },
          { id: "char-slot-b", anchorX: 50, anchorY: 60 },
          { id: "char-slot-c", anchorX: 80, anchorY: 60 },
        ],
      },
      {
        id: "scene:playground",
        assetId: "scene:playground",
        label: "Patio de juegos",
        characterSlots: [
          { id: "ch2-playground-a", anchorX: 25, anchorY: 55 },
          { id: "ch2-playground-b", anchorX: 75, anchorY: 55 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:friend-wheelchair", assetId: "char:friend-wheelchair", label: "Amigo con silla" },
      { id: "char:friend-bench", assetId: "char:friend-bench", label: "Amigo en la banca" },
      { id: "char:friend-standing", assetId: "char:friend-standing", label: "Amigo de pie" },
    ],
    expected: {
      scenes: { "slot-scene-2": "scene:park", "slot-scene-2b": "scene:playground" },
      characters: {
        "ch2-playground-a": "char:mairin",
        "ch2-playground-b": "char:friend-standing",
        "char-slot-a": "char:mairin",
        "char-slot-b": "char:friend-wheelchair",
        "char-slot-c": "char:friend-bench",
      },
      correctEndingId: "ending:correct-2",
    },
    endings: [
      { id: "ending:correct-2", type: "correct", title: "¡Equidad en acción!", description: "Mairin adaptó el juego para que su amigo con silla de ruedas también participara. Jugar juntos es más divertido cuando todos tienen lugar.", imageAssetId: "ending:correct-2" },
      { id: "ending:incorrect-2", type: "incorrect", title: "Inténtalo de nuevo", description: "La escena no muestra equidad. Recuerda: todos merecen participar, incluso si necesitamos adaptar el juego.", imageAssetId: "ending:incorrect-2" },
    ],
  },
  {
    id: "level-3",
    title: "Capítulo 3",
    narrative: "Mairin aprende que compartir con quienes nos rodea hace más fuertes los lazos familiares.",
    order: 3,
    sceneSlots: [
      { id: "slot-scene-3a", label: "Casa" },
      { id: "slot-scene-3b", label: "Calle" },
    ],
    scenes: [
      {
        id: "scene:home",
        assetId: "scene:home",
        label: "Casa",
        characterSlots: [
          { id: "ch3-home-a", anchorX: 30, anchorY: 60 },
          { id: "ch3-home-b", anchorX: 70, anchorY: 60 },
        ],
      },
      {
        id: "scene:street",
        assetId: "scene:street",
        label: "Calle",
        characterSlots: [
          { id: "ch3-street-a", anchorX: 25, anchorY: 55 },
          { id: "ch3-street-b", anchorX: 75, anchorY: 55 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:ch3-parent", assetId: "char:ch3-parent", label: "Papá" },
      { id: "char:ch3-sibling", assetId: "char:ch3-sibling", label: "Hermano" },
      { id: "char:ch3-friend", assetId: "char:ch3-friend", label: "Amiga" },
    ],
    expected: {
      scenes: { "slot-scene-3a": "scene:home", "slot-scene-3b": "scene:street" },
      characters: {
        "ch3-home-a": "char:ch3-parent",
        "ch3-home-b": "char:mairin",
        "ch3-street-a": "char:ch3-sibling",
        "ch3-street-b": "char:ch3-friend",
      },
      correctEndingId: "ending:correct-3",
    },
    endings: [
      { id: "ending:correct-3", type: "correct", title: "¡Buena elección!", description: "Mairin compartió con su familia y amigos. Todos se sintieron incluidos.", imageAssetId: "ending:correct-3" },
      { id: "ending:incorrect-3", type: "incorrect", title: "Inténtalo de nuevo", description: "La escena no muestra inclusión familiar. Piensa en quién debería acompañar a Mairin.", imageAssetId: "ending:incorrect-3" },
    ],
  },
  {
    id: "level-4",
    title: "Capítulo 4",
    narrative: "Mairin recorre el barrio y descubre que cada persona tiene un papel importante en la comunidad.",
    order: 4,
    sceneSlots: [
      { id: "slot-scene-4a", label: "Mercado" },
      { id: "slot-scene-4b", label: "Tienda" },
      { id: "slot-scene-4c", label: "Plaza" },
    ],
    scenes: [
      {
        id: "scene:market",
        assetId: "scene:market",
        label: "Mercado",
        characterSlots: [
          { id: "ch4-market-a", anchorX: 20, anchorY: 60 },
          { id: "ch4-market-b", anchorX: 80, anchorY: 60 },
        ],
      },
      {
        id: "scene:shop",
        assetId: "scene:shop",
        label: "Tienda",
        characterSlots: [
          { id: "ch4-shop-a", anchorX: 35, anchorY: 55 },
          { id: "ch4-shop-b", anchorX: 65, anchorY: 55 },
        ],
      },
      {
        id: "scene:plaza",
        assetId: "scene:plaza",
        label: "Plaza",
        characterSlots: [
          { id: "ch4-plaza-a", anchorX: 30, anchorY: 60 },
          { id: "ch4-plaza-b", anchorX: 70, anchorY: 60 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:ch4-vendor", assetId: "char:ch4-vendor", label: "Vendedor" },
      { id: "char:ch4-neighbor", assetId: "char:ch4-neighbor", label: "Vecina" },
    ],
    expected: {
      scenes: { "slot-scene-4a": "scene:market", "slot-scene-4b": "scene:shop", "slot-scene-4c": "scene:plaza" },
      characters: {
        "ch4-market-a": "char:ch4-vendor",
        "ch4-market-b": "char:mairin",
        "ch4-plaza-a": "char:ch4-vendor",
        "ch4-plaza-b": "char:ch4-neighbor",
        "ch4-shop-a": "char:ch4-neighbor",
        "ch4-shop-b": "char:mairin",
      },
      correctEndingId: "ending:correct-4",
    },
    endings: [
      { id: "ending:correct-4", type: "correct", title: "¡Comunidad unida!", description: "Mairin conoció a sus vecinos y valoró el trabajo de todos en el barrio.", imageAssetId: "ending:correct-4" },
      { id: "ending:incorrect-4", type: "incorrect", title: "Inténtalo de nuevo", description: "La escena no refleja respeto por la comunidad. ¿Quiénes hacen parte del barrio?", imageAssetId: "ending:incorrect-4" },
    ],
  },
  {
    id: "level-5",
    title: "Capítulo 5",
    narrative: "Mairin descubre que escuchar a quienes tienen más experiencia nos ayuda a tomar mejores decisiones.",
    order: 5,
    sceneSlots: [
      { id: "slot-scene-5a", label: "Jardín" },
      { id: "slot-scene-5b", label: "Cuarto" },
      { id: "slot-scene-5c", label: "Escenario" },
    ],
    scenes: [
      {
        id: "scene:garden",
        assetId: "scene:garden",
        label: "Jardín",
        characterSlots: [
          { id: "ch5-garden-a", anchorX: 25, anchorY: 55 },
          { id: "ch5-garden-b", anchorX: 75, anchorY: 55 },
        ],
      },
      {
        id: "scene:room",
        assetId: "scene:room",
        label: "Cuarto",
        characterSlots: [
          { id: "ch5-room-a", anchorX: 40, anchorY: 60 },
          { id: "ch5-room-b", anchorX: 60, anchorY: 60 },
        ],
      },
      {
        id: "scene:stage",
        assetId: "scene:stage",
        label: "Escenario",
        characterSlots: [
          { id: "ch5-stage-a", anchorX: 30, anchorY: 55 },
          { id: "ch5-stage-b", anchorX: 70, anchorY: 55 },
        ],
      },
    ],
    characters: [
      { id: "char:mairin", assetId: "char:mairin", label: "Mairin" },
      { id: "char:ch5-grandparent", assetId: "char:ch5-grandparent", label: "Abuelo" },
    ],
    expected: {
      scenes: { "slot-scene-5a": "scene:garden", "slot-scene-5b": "scene:room", "slot-scene-5c": "scene:stage" },
      characters: {
        "ch5-garden-a": "char:mairin",
        "ch5-garden-b": "char:ch5-grandparent",
        "ch5-room-a": "char:mairin",
        "ch5-room-b": "char:ch5-grandparent",
        "ch5-stage-a": "char:mairin",
        "ch5-stage-b": "char:ch5-grandparent",
      },
      correctEndingId: "ending:correct-5",
    },
    endings: [
      { id: "ending:correct-5", type: "correct", title: "¡Valores en acción!", description: "Mairin honró la sabiduría de su abuelo y compartió sus enseñanzas con otros.", imageAssetId: "ending:correct-5" },
      { id: "ending:incorrect-5", type: "incorrect", title: "Inténtalo de nuevo", description: "La escena no muestra respeto por las personas mayores. ¿Quién acompaña a Mairin?", imageAssetId: "ending:incorrect-5" },
    ],
  },
];

async function seedLevel(level: LevelSeed, order: number) {
  const upserted = await prisma.level.upsert({
    where: { id: level.id },
    update: { title: level.title, narrative: level.narrative, order, active: true },
    create: { id: level.id, title: level.title, narrative: level.narrative, order, active: true },
  });

  for (const scene of level.scenes) {
    const upsertedScene = await prisma.scene.upsert({
      where: { id: scene.id },
      update: { assetId: scene.assetId, label: scene.label },
      create: { id: scene.id, assetId: scene.assetId, label: scene.label },
    });

    for (const slot of scene.characterSlots) {
      await prisma.characterSlot.upsert({
        where: { id: slot.id },
        update: { anchorX: slot.anchorX, anchorY: slot.anchorY },
        create: { id: slot.id, sceneId: upsertedScene.id, anchorX: slot.anchorX, anchorY: slot.anchorY },
      });
    }
  }

  for (const character of level.characters) {
    await prisma.character.upsert({
      where: { id: character.id },
      update: { assetId: character.assetId, label: character.label },
      create: { id: character.id, assetId: character.assetId, label: character.label },
    });
  }

  for (const slot of level.sceneSlots) {
    await prisma.sceneSlot.upsert({
      where: { id: slot.id },
      update: { label: slot.label },
      create: { id: slot.id, levelId: upserted.id, label: slot.label },
    });
  }

  const sceneIds = level.scenes.map((s) => s.id);
  const charIds = level.characters.map((c) => c.id);

  for (const sceneId of sceneIds) {
    await prisma.levelItem.upsert({
      where: { id: `${level.id}-${sceneId}` },
      update: { available: true, position: 0 },
      create: { id: `${level.id}-${sceneId}`, levelId: upserted.id, sceneId, available: true, position: 0 },
    });
  }

  for (const charId of charIds) {
    await prisma.levelItem.upsert({
      where: { id: `${level.id}-${charId}` },
      update: { available: true, position: 0 },
      create: { id: `${level.id}-${charId}`, levelId: upserted.id, characterId: charId, available: true, position: 0 },
    });
  }

  const expectedEntries = [
    ...Object.entries(level.expected.scenes).map(([slotKey, targetId], i) => ({
      levelId: upserted.id,
      slotType: "SCENE" as const,
      slotKey,
      targetId,
      position: i,
    })),
    ...Object.entries(level.expected.characters).map(([slotKey, targetId], i) => ({
      levelId: upserted.id,
      slotType: "CHARACTER" as const,
      slotKey,
      targetId,
      position: i,
    })),
  ];

  for (const ep of expectedEntries) {
    const id = `${ep.levelId}-${ep.slotType}-${ep.slotKey}`;
    await prisma.expectedPlacement.upsert({
      where: { id },
      update: { targetId: ep.targetId, position: ep.position },
      create: { id, ...ep },
    });
  }

  for (const ending of level.endings) {
    await prisma.ending.upsert({
      where: { id: ending.id },
      update: { type: ending.type, title: ending.title, description: ending.description, imageAssetId: ending.imageAssetId },
      create: { id: ending.id, levelId: upserted.id, type: ending.type, title: ending.title, description: ending.description, imageAssetId: ending.imageAssetId },
    });
  }

  return upserted;
}

async function main() {
  console.log("Seeding database...");

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const result = await seedLevel(level, level.order);
    console.log(`  Seeded: ${result.id} - ${result.title}`);
  }

  console.log(`Seeded ${levels.length} levels.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
