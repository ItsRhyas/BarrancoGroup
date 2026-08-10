"""Render del modelo ER (2FN) de Mairin para PostgreSQL/Prisma.

Genera docs/er-model.dot y docs/er-model.png usando Graphviz (dot).
Requiere el binario dot en PATH o graphviz de Python.
"""

from pathlib import Path

try:
    from graphviz import Source  # type: ignore
    HAS_GRAPHVIZ = True
except ImportError:
    HAS_GRAPHVIZ = False

DOT = r"""
digraph MairinER {
  rankdir=LR;
  splines=ortho;
  nodesep=0.7;
  ranksep=1.2;
  graph [fontname="Segoe UI", bgcolor="white"];
  node  [fontname="Segoe UI", shape=plaintext, fontsize=11];
  edge  [fontname="Segoe UI", color="#4a5568", arrowsize=0.8];

  // ---------- Configuración de niveles ----------
  levels [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#2b6cb0" width="120"><font color="white"><b>LEVEL</b></font></td></tr>
    <tr><td align="left">PK id<br/>title<br/>narrative<br/>order<br/>active</td></tr>
  </table>>];

  scenes [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#38a169" width="120"><font color="white"><b>SCENE</b></font></td></tr>
    <tr><td align="left">PK id<br/>assetId<br/>label</td></tr>
  </table>>];

  characters [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#d69e2e" width="120"><font color="white"><b>CHARACTER</b></font></td></tr>
    <tr><td align="left">PK id<br/>assetId<br/>label</td></tr>
  </table>>];

  level_items [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#718096" width="120"><font color="white"><b>LEVEL_ITEM</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK levelId<br/>FK sceneId?<br/>FK characterId?<br/>available<br/>position</td></tr>
  </table>>];

  scene_slots [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#805ad5" width="120"><font color="white"><b>SCENE_SLOT</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK levelId<br/>label</td></tr>
  </table>>];

  character_slots [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#d53f8c" width="120"><font color="white"><b>CHARACTER_SLOT</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK sceneId<br/>anchorX<br/>anchorY</td></tr>
  </table>>];

  expected_placements [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#c53030" width="120"><font color="white"><b>EXPECTED_PLACEMENT</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK levelId<br/>slotType<br/>slotKey<br/>targetId<br/>position</td></tr>
  </table>>];

  endings [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#dd6b20" width="120"><font color="white"><b>ENDING</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK levelId<br/>type<br/>title<br/>description<br/>imageAssetId?</td></tr>
  </table>>];

  // ---------- Progreso del jugador ----------
  game_sessions [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#2f855a" width="120"><font color="white"><b>GAME_SESSION</b></font></td></tr>
    <tr><td align="left">PK id<br/>sessionToken UQ<br/>createdAt</td></tr>
  </table>>];

  attempts [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#2b6cb0" width="120"><font color="white"><b>ATTEMPT</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK sessionId<br/>FK levelId<br/>success<br/>attemptNumber<br/>completedAt</td></tr>
  </table>>];

  attempt_items [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#718096" width="120"><font color="white"><b>ATTEMPT_ITEM</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK attemptId<br/>slotType<br/>slotKey<br/>targetId<br/>position</td></tr>
  </table>>];

  // ---------- Relaciones ----------
  levels -> scene_slots   [xlabel="1..N"];
  levels -> level_items   [xlabel="1..N"];
  scenes  -> level_items  [xlabel="1..N"];
  characters -> level_items [xlabel="1..N"];
  scenes  -> character_slots [xlabel="1..N"];
  levels  -> expected_placements [xlabel="1..N"];
  levels  -> endings       [xlabel="1..N"];

  game_sessions -> attempts [xlabel="1..N"];
  levels  -> attempts      [xlabel="1..N"];
  attempts -> attempt_items [xlabel="1..N"];
}
"""


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "docs"
    out_dir.mkdir(exist_ok=True)
    dot_path = out_dir / "er-model.dot"
    png_path = out_dir / "er-model.png"

    dot_path.write_text(DOT, encoding="utf-8")

    if HAS_GRAPHVIZ:
        Source(DOT).render(str(png_path.with_suffix("")), format="png", cleanup=True)
    else:
        import shutil
        import subprocess

        dot = shutil.which("dot") or r"C:\Program Files\Graphviz\bin\dot.exe"
        subprocess.run([dot, "-Tpng", str(dot_path), "-o", str(png_path)], check=True)

    print(png_path)


if __name__ == "__main__":
    main()