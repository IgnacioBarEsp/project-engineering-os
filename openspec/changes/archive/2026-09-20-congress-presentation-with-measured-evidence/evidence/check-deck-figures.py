# Ninguna cifra del mazo puede faltar en el guion. Es la regla que el propio guion declara -«si una cifra no
# esta en esa tabla, no entra en una diapositiva»- aplicada al archivo que se va a proyectar.
#
# Hace falta porque build-deck.mjs transcribe el texto del guion a mano: no lo lee. Esta comprobacion es lo
# que impide que esa transcripcion se separe del guion, que es la fuente comprobada por verify-deck-figures.mjs.
# Comprueba las diapositivas y tambien las notas de orador, porque las notas se dicen en voz alta.
#
#   python check-deck-figures.py <mazo.pptx> <guion.md> <salida.json>
import sys, zipfile, re, json, html, hashlib
from datetime import datetime, timezone

deck_path, guion_path, out_path = sys.argv[1:4]

with open(guion_path, encoding="utf-8") as handle:
    guion = handle.read()

# Una cifra es un numero suelto, no los digitos de dentro de una palabra: `d744c47` es un commit, no un 744.
NUMBER = re.compile(r"(?<![0-9A-Za-z])\d+(?:[.,]\d+)*(?![0-9A-Za-z])")
guion_numbers = set(NUMBER.findall(guion))

z = zipfile.ZipFile(deck_path)


def parts(folder, stem):
    names = [n for n in z.namelist() if re.match(rf"ppt/{folder}/{stem}\d+\.xml$", n)]
    return sorted(names, key=lambda n: int(re.search(r"(\d+)\.xml$", n).group(1)))


def text_of(name):
    xml = z.read(name).decode("utf-8")
    # Los campos automaticos (el numero de diapositiva en las notas) no son cifras que nadie haya escrito.
    xml = re.sub(r"<a:fld\b.*?</a:fld>", "", xml, flags=re.S)
    return " ".join(html.unescape(t) for t in re.findall(r"<a:t>(.*?)</a:t>", xml, re.S))


problems = []
checked = 0
slides = parts("slides", "slide")
for kind, names in (("diapositiva", slides), ("notas", parts("notesSlides", "notesSlide"))):
    for name in names:
        index = int(re.search(r"(\d+)\.xml$", name).group(1))
        text = text_of(name)
        for number in NUMBER.findall(text):
            checked += 1
            if number in guion_numbers:
                continue
            at = text.find(number)
            snippet = text[max(0, at - 40):at + 40].strip()
            problems.append(f"{kind} {index}: la cifra {number} no esta en el guion - «{snippet}»")

with open(deck_path, "rb") as handle:
    digest = hashlib.sha256(handle.read()).hexdigest()

record = {
    "schemaVersion": 1,
    "date": datetime.now(timezone.utc).isoformat(),
    "deck": {"file": deck_path.replace("\\", "/").split("/")[-1], "slides": len(slides), "sha256": digest},
    "guion": guion_path.replace("\\", "/").split("/")[-1],
    "rule": "toda cifra que aparezca en una diapositiva o en sus notas tiene que estar en el guion",
    "problems": problems,
    "summary": {"numbersChecked": checked, "problems": len(problems), "verdict": "FAIL" if problems else "PASS"},
}
with open(out_path, "w", encoding="utf-8") as handle:
    json.dump(record, handle, ensure_ascii=False, indent=2)
    handle.write("\n")

print(f"diapositivas: {len(slides)}")
print(f"cifras comprobadas: {checked}")
print(f"problemas: {len(problems)}")
for problem in problems:
    print(" -", problem.encode("ascii", "replace").decode("ascii"))
sys.exit(1 if problems else 0)
