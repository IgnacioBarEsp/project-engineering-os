# Comprobacion geometrica del mazo: ninguna forma fuera de la diapositiva, margenes minimos y solapes
# entre cajas de texto. No sustituye a mirar las diapositivas, pero atrapa el defecto mas comun.
import sys, zipfile, re
from xml.dom import minidom

EMU = 914400.0
W, H = 13.333, 7.5
MARGIN = 0.5  # pulgadas: el margen minimo que pide el guion de diseno

deck = sys.argv[1]
z = zipfile.ZipFile(deck)
slides = sorted((n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                key=lambda n: int(re.search(r"(\d+)", n).group(1)))

problems = []
for index, name in enumerate(slides, start=1):
    doc = minidom.parseString(z.read(name))
    boxes = []
    for tag in ("p:sp", "p:pic", "p:graphicFrame"):
        for node in doc.getElementsByTagName(tag):
            offs = node.getElementsByTagName("a:off")
            exts = node.getElementsByTagName("a:ext")
            if not offs or not exts:
                continue
            x = int(offs[0].getAttribute("x")) / EMU
            y = int(offs[0].getAttribute("y")) / EMU
            w = int(exts[0].getAttribute("cx")) / EMU
            h = int(exts[0].getAttribute("cy")) / EMU
            text = "".join(t.firstChild.nodeValue for t in node.getElementsByTagName("a:t") if t.firstChild)
            # El texto entero decide si la forma se ve; los 40 primeros caracteres solo sirven para el mensaje.
            boxes.append((tag, x, y, w, h, text[:40], text))

    for tag, x, y, w, h, text, _full in boxes:
        if x < -0.01 or y < -0.01 or x + w > W + 0.01 or y + h > H + 0.01:
            problems.append(f"slide {index}: {tag} fuera de la diapositiva en ({x:.2f},{y:.2f}) {w:.2f}x{h:.2f} «{text}»")
        elif x < MARGIN or y < MARGIN or x + w > W - MARGIN or y + h > H - MARGIN:
            problems.append(f"slide {index}: {tag} a menos de {MARGIN}\" del borde en ({x:.2f},{y:.2f}) {w:.2f}x{h:.2f} «{text}»")

    # Solape: dos textos encima uno de otro es un defecto visible, y una imagen encima de un texto tambien.
    # Filtrar por "tiene texto" dejaba fuera imagenes y tablas, que es donde ese defecto pasa inadvertido.
    visible = [b for b in boxes if b[0] != "p:sp" or b[6].strip()]
    for i in range(len(visible)):
        for j in range(i + 1, len(visible)):
            atag, ax, ay, aw, ah, atext, _a = visible[i]
            btag, bx, by, bw, bh, btext, _b = visible[j]
            at = atext.strip() or atag
            bt = btext.strip() or btag
            ox = min(ax + aw, bx + bw) - max(ax, bx)
            oy = min(ay + ah, by + bh) - max(ay, by)
            if ox > 0.05 and oy > 0.05:
                problems.append(f"slide {index}: solapan «{at}» y «{bt}» ({ox:.2f}\" x {oy:.2f}\")")

print(f"diapositivas: {len(slides)}")
print(f"problemas: {len(problems)}")
for problem in problems:
    print(" -", problem)
sys.exit(1 if problems else 0)
