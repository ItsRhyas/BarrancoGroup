"""Render del modelo ER de Mairin para PostgreSQL/Prisma.

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

  users [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#805ad5" width="170"><font color="white"><b>USER</b></font></td></tr>
    <tr><td align="left">PK id<br/>username UQ?<br/>passwordHash?<br/>role<br/>createdAt</td></tr>
  </table>>];

  game_sessions [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#2f855a" width="170"><font color="white"><b>GAME_SESSION</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK userId<br/>createdAt</td></tr>
  </table>>];

  attempts [label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="6">
    <tr><td bgcolor="#2b6cb0" width="170"><font color="white"><b>ATTEMPT</b></font></td></tr>
    <tr><td align="left">PK id<br/>FK sessionId<br/>levelId<br/>success<br/>endingId?<br/>attemptNumber<br/>completedAt</td></tr>
  </table>>];

  users -> game_sessions [xlabel="1..N"];
  game_sessions -> attempts [xlabel="1..N"];
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
