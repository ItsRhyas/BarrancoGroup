"""Render del flujo de una petición para Mairin.

Genera docs/request-flow.dot y docs/request-flow.png usando Graphviz (dot).
Requiere el binario dot en PATH o graphviz de Python.
"""

from pathlib import Path

try:
    from graphviz import Source  # type: ignore
    HAS_GRAPHVIZ = True
except ImportError:
    HAS_GRAPHVIZ = False

DOT = r"""
digraph RequestFlow {
  rankdir=TB;
  nodesep=0.35;
  ranksep=0.5;
  graph [fontname="Segoe UI", bgcolor="white"];
  node  [fontname="Segoe UI", shape=box, style="rounded,filled", fontsize=12, margin="0.22,0.14"];
  edge  [fontname="Segoe UI", color="#4a5568", arrowsize=0.9];

  controller [label="Controller\n(recibe y responde HTTP)", fillcolor="#ebf4ff", color="#2b6cb0", fontcolor="#1a365d"];
  service    [label="Service\n(lógica de negocio)", fillcolor="#e6fffa", color="#2f855a", fontcolor="#234e52"];
  prisma     [label="Prisma\n(acceso a datos / ORM)", fillcolor="#faf5ff", color="#805ad5", fontcolor="#44337a"];
  postgres   [label="PostgreSQL\n(almacenamiento persistente)", fillcolor="#fffaf0", color="#dd6b20", fontcolor="#7b341e"];

  controller -> service;
  service -> prisma;
  prisma -> postgres;
}
"""


def main() -> None:
    out_dir = Path(__file__).resolve().parent.parent / "docs"
    out_dir.mkdir(exist_ok=True)
    dot_path = out_dir / "request-flow.dot"
    png_path = out_dir / "request-flow.png"

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
