// Mazo del congreso del 24 de septiembre de 2026. La generación de diseños de Canva no está habilitada en el
// equipo del mantenedor, así que el mazo se entrega como archivo importable.
//
// El texto de cada diapositiva está transcrito del guion versionado en docs/presentations/2026-09-24-congreso.md:
// este generador **no lee** el guion. Quien ata las dos cosas es check-deck-figures.py, que comprueba que
// ninguna cifra del mazo falte en el guion.
//
//   node build-deck.mjs [repositorio]   (por defecto, el directorio actual; escribe el .pptx en él)
import pptxgen from 'pptxgenjs';
import path from 'node:path';

const REPO = path.resolve(process.argv[2] ?? process.cwd());
const img = (relative) => path.join(REPO, relative);

const INK = '13131C';
const PAPER = 'FFFFFF';
const SOFT = 'F4F4F7';
const MUTED = '5A5A6E';
const ACCENT = '6C5CE7';
const WARN = 'D14343';
const ON_DARK = 'F2F2F5';
const HEAD = 'Cambria';
const BODY = 'Calibri';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 pulgadas
pres.author = 'Ignacio Barboza Espinoza';
pres.title = 'Dale a tu IA un buen punto de partida';

const W = 13.333; // el ancho real de LAYOUT_WIDE, el mismo que comprueba check-geometry.py
const M = 0.8; // margen lateral

// Un punto violeta antes de cada encabezado: el único motivo repetido del mazo.
const dot = (slide, x, y) => slide.addShape(pres.ShapeType.ellipse,
  { x, y, w: 0.14, h: 0.14, fill: { color: ACCENT }, line: { color: ACCENT } });

const titleOn = (slide, text, { dark = false, y = 0.95 } = {}) => {
  slide.addText(text, {
    x: M, y, w: W - M * 2, h: 0.8, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 38, bold: true, color: dark ? PAPER : INK,
  });
};

const kicker = (slide, text, { dark = false } = {}) => {
  dot(slide, M, 0.62);
  slide.addText(text, {
    x: M + 0.26, y: 0.50, w: W - M * 2 - 0.3, h: 0.36, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 13, bold: true, color: dark ? ACCENT : ACCENT, charSpacing: 1.2,
  });
};

const bullets = (slide, items, opts = {}) => {
  const runs = items.map((text, index) => ({
    text, options: { bullet: true, breakLine: index !== items.length - 1 },
  }));
  slide.addText(runs, {
    x: opts.x ?? M, y: opts.y ?? 2.1, w: opts.w ?? (W - M * 2), h: opts.h ?? 3.6,
    isTextBox: true, margin: 0, fontFace: BODY, fontSize: opts.fontSize ?? 16,
    color: opts.color ?? INK, paraSpaceAfter: opts.paraSpaceAfter ?? 10, lineSpacing: opts.lineSpacing ?? 24,
  });
};

const card = (slide, { x, y, w, h, fill = SOFT }) => slide.addShape(pres.ShapeType.roundRect, {
  x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill },
});

const dark = () => {
  const slide = pres.addSlide();
  slide.background = { color: INK };
  return slide;
};
const light = () => {
  const slide = pres.addSlide();
  slide.background = { color: PAPER };
  return slide;
};

// 1 — Portada
{
  const s = dark();
  s.addText('Dale a tu IA', { x: M, y: 2.0, w: 9.5, h: 1.0, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 54, bold: true, color: PAPER });
  s.addText('un buen punto de partida.', { x: M, y: 2.95, w: 10.5, h: 1.0, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 54, bold: true, color: ACCENT });
  s.addText('Qué aprendimos midiendo nuestro propio trabajo con IA', { x: M, y: 4.25, w: 10.5, h: 0.5, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 19, color: ON_DARK });
  s.addText('Ignacio Barboza Espinoza  ·  24 de septiembre de 2026', { x: M, y: 6.3, w: 10.5, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: MUTED });
  s.addNotes('Vengo a contar qué aprendimos midiendo nuestro propio trabajo con IA. Incluida la parte en la que nos salió mal.');
}

// 2 — Cómo trabajamos hoy
{
  const s = light();
  kicker(s, 'EL PUNTO DE PARTIDA');
  titleOn(s, 'Cómo trabajamos hoy');
  s.addText('Un prompt. Una respuesta. A ver qué sale.', { x: M, y: 1.85, w: 7.4, h: 0.6, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 24, italic: true, color: ACCENT });
  bullets(s, [
    'Abrimos el chat, escribimos lo que queremos y copiamos lo que devuelve.',
    'Sin plan escrito, sin registro de lo decidido, sin comprobar si hizo lo que pedimos.',
    'Funciona sorprendentemente bien… hasta que deja de funcionar.',
  ], { y: 2.7, w: 7.6 });
  card(s, { x: 8.9, y: 1.85, w: 3.6, h: 3.4 });
  s.addText('“A ver qué sale”', { x: 9.2, y: 3.1, w: 3.0, h: 0.9, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 26, bold: true, color: INK, align: 'center' });
  s.addNotes('Abrimos el chat, escribimos lo que queremos, copiamos lo que devuelve. Sin plan escrito, sin registro de lo que se decidió y sin comprobar si hizo lo que pedimos. Funciona sorprendentemente bien, hasta que deja de funcionar.');
}

// 3 — Qué sale mal
{
  const s = light();
  kicker(s, 'EL PROBLEMA');
  titleOn(s, 'Qué sale mal');
  const items = [
    ['Se inventa cosas', 'Rellena huecos con algo verosímil.'],
    ['Se desvía del objetivo', 'Resuelve otra cosa parecida.'],
    ['No se puede comprobar', 'Lo aceptamos o lo rehacemos entero.'],
    ['Hay que rehacerlo', 'Y volvemos a empezar.'],
  ];
  items.forEach(([head, sub], index) => {
    const x = M + (index % 2) * 6.1;
    const y = 2.1 + Math.floor(index / 2) * 1.9;
    card(s, { x, y, w: 5.6, h: 1.55, fill: index === 2 ? INK : SOFT });
    s.addText(head, { x: x + 0.35, y: y + 0.28, w: 5.0, h: 0.4, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 20, bold: true, color: index === 2 ? PAPER : INK });
    s.addText(sub, { x: x + 0.35, y: y + 0.78, w: 5.0, h: 0.5, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: index === 2 ? ON_DARK : MUTED });
  });
  s.addText('El que más caro sale es el tercero.', { x: M, y: 6.1, w: 11.7, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 15, italic: true, color: ACCENT });
  s.addNotes('Cuatro problemas que todos reconocemos. El que más caro sale no es que se invente cosas: es que no podemos comprobar si lo que hizo está bien, así que lo aceptamos o lo rehacemos entero.');
}

// 4 — La pregunta
{
  const s = dark();
  kicker(s, 'LA PREGUNTA', { dark: true });
  s.addText('¿Y si el problema no es el modelo,\nsino el sitio donde lo ponemos a trabajar?', {
    x: M, y: 2.4, w: 11.4, h: 2.0, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 36, bold: true, color: PAPER, lineSpacing: 46,
  });
  bullets(s, [
    'Le pedimos que trabaje en una carpeta que no conoce.',
    'Sin reglas escritas y sin manera de verificar nada.',
    'A una persona nueva tampoco le saldría bien.',
  ], { y: 4.8, h: 1.9, w: 11.4, color: ON_DARK, fontSize: 16 });
  s.addNotes('Le pedimos a un modelo que trabaje en una carpeta que no conoce, sin reglas escritas, sin manera de verificar nada. A una persona nueva tampoco le saldría bien.');
}

// 5 — Qué es un entorno preparado
{
  const s = light();
  kicker(s, 'LA PROPUESTA');
  titleOn(s, 'Qué es un entorno preparado');
  const cols = [
    ['La carpeta ordenada', 'Los materiales donde se esperan.'],
    ['Las reglas escritas', 'Lo que damos por acordado, escrito.'],
    ['Las comprobaciones listas', 'Comprobar sin leerlo y confiar.'],
  ];
  cols.forEach(([head, sub], index) => {
    const x = M + index * 4.0;
    card(s, { x, y: 2.0, w: 3.6, h: 1.9 });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: 2.28, w: 0.42, h: 0.42, fill: { color: ACCENT }, line: { color: ACCENT } });
    s.addText(String(index + 1), { x: x + 0.3, y: 2.3, w: 0.42, h: 0.38, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, bold: true, color: PAPER, align: 'center' });
    s.addText(head, { x: x + 0.3, y: 2.85, w: 3.0, h: 0.4, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 17, bold: true, color: INK });
    s.addText(sub, { x: x + 0.3, y: 3.28, w: 3.0, h: 0.5, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13, color: MUTED });
  });
  s.addImage({ path: img('docs/assets/companion/paso-3-vision.png'), x: M, y: 4.2, w: 6.4, h: 2.35 });
  s.addText('Companion 0.3.2, commit d744c47', { x: M, y: 6.6, w: 6.4, h: 0.3, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 10, color: MUTED });
  s.addText('Tres cosas, ninguna exótica. Aquí, la pantalla donde se escribe qué se quiere lograr: eso es “las reglas escritas”.', {
    x: 7.6, y: 4.6, w: 4.9, h: 1.6, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 15, color: INK, lineSpacing: 24,
  });
  s.addNotes('Tres cosas, ninguna exótica. Que los materiales estén donde se espera. Que lo que damos por acordado esté escrito. Y que exista una forma de comprobar el resultado que no sea leerlo y confiar.');
}

// 6-12 — Conceptos
const concepts = [
  ['CONTEXTO Y RAG', 'Contexto y RAG',
    'Darle un repositorio entero a un modelo es como darle una biblioteca y pedirle una cita.',
    'Buscar la frase exacta y decir en qué archivo y en qué línea está, en vez de entregar todo el archivo.',
    '«¿En qué rango asigna Kubernetes un NodePort?» La respuesta buena no es el documento: es «30000-32767, en service.md».',
    'Preguntamos en qué rango de puertos asigna Kubernetes un NodePort por omisión. La respuesta buena no es el documento: es el valor y dónde está. Esa es, literalmente, una de las veinte preguntas que nuestro propio producto no supo responder: volvemos a ella en la diapositiva 17.'],
  ['SDD', 'Escribir qué tiene que pasar, antes',
    'Si no dijimos qué esperábamos, cualquier resultado parece aceptable.',
    'Escribir qué tiene que ocurrir antes de hacerlo, para poder comprobarlo después.',
    '«Al terminar el asistente, los dos botones se pueden pulsar» se puede comprobar. «Mejorar la interfaz» no.',
    'Si no dijimos qué esperábamos, cualquier resultado parece aceptable. Escribirlo antes es lo que permite comprobarlo después.'],
  ['HARNESS', 'El programa alrededor del modelo',
    'El modelo solo habla. Alguien tiene que darle herramientas, límites y memoria.',
    'El programa que lo rodea: qué puede ejecutar, hasta dónde llega y qué recuerda.',
    'El nuestro abre la aplicación de verdad, recorre las pantallas y mide dónde cae cada clic.',
    'El modelo solo habla. El harness es lo que le da herramientas, límites y memoria.'],
  ['LOOPS', 'Piensa, actúa, comprueba',
    'Un solo intento rara vez acierta, y repetir sin comprobar es dar vueltas.',
    'El ciclo que repite. Y, sobre todo, quién decide cuándo parar.',
    'El nuestro para cuando la comprobación pasa, no cuando el agente cree que terminó.',
    'Un solo intento rara vez acierta. Lo que importa del ciclo es quién decide cuándo parar.'],
  ['REVISIÓN ADVERSARIAL', 'Alguien que intenta romperlo',
    'Pedirle a alguien que confirme que está bien casi siempre devuelve «está bien».',
    'Alguien que intenta romperlo, no confirmarlo. Y que no participó en hacerlo.',
    'Una revisión encontró en nuestra documentación un texto que afirmaba una cosa mientras la captura de al lado la desmentía. Llevaba semanas publicado.',
    'Pedir confirmación devuelve confirmación. Hizo falta alguien cuyo trabajo era buscar la contradicción: la encontró en nuestra propia documentación, publicada desde hacía semanas.'],
  ['DEUDA', 'Lo que se anota en vez de olvidarse',
    '«Esto luego lo arreglo» no sobrevive a la semana.',
    'Lo que se deja escrito y con dueño, en vez de olvidado.',
    'Midiendo encontramos un defecto del empaquetador que no tocaba arreglar ahí. No se arregló de pasada: se anotó.',
    'Esto luego lo arreglo no sobrevive a la semana. Lo que encontramos de paso se anota, con dueño, en vez de arreglarse por su cuenta.'],
  ['SKILLS Y MCP', 'Capacidades y enchufes',
    'Un modelo sin herramientas solo puede escribir texto sobre el trabajo, no hacerlo.',
    'Las skills son formas de trabajar que el agente aprende y reutiliza; MCP es el enchufe a herramientas de verdad.',
    'Con eso, el agente no describe la aplicación: la abre, la recorre y mide.',
    'Sin herramientas, un modelo solo escribe texto sobre el trabajo. Con ellas, lo hace y se le puede comprobar.'],
];

concepts.forEach(([eyebrow, title, problem, oneLine, example, notes], index) => {
  const s = light();
  const rightCard = index % 2 === 0;
  kicker(s, eyebrow);
  titleOn(s, title);
  const textX = rightCard ? M : 6.6;
  const cardX = rightCard ? 6.9 : M;
  s.addText(oneLine, { x: textX, y: 2.15, w: 5.6, h: 2.0, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 22, color: INK, lineSpacing: 32 });
  card(s, { x: cardX, y: 2.0, w: 5.6, h: 3.9 });
  s.addText('EL PROBLEMA', { x: cardX + 0.4, y: 2.35, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 11, bold: true, color: ACCENT, charSpacing: 1.2 });
  s.addText(problem, { x: cardX + 0.4, y: 2.7, w: 4.8, h: 1.2, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: INK, lineSpacing: 21 });
  s.addText('EL EJEMPLO', { x: cardX + 0.4, y: 4.1, w: 4.8, h: 0.3, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 11, bold: true, color: ACCENT, charSpacing: 1.2 });
  s.addText(example, { x: cardX + 0.4, y: 4.45, w: 4.8, h: 1.3, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: INK, lineSpacing: 21 });
  s.addNotes(notes);
});

// 13 — Demo A
{
  const s = light();
  kicker(s, 'DEMO A · EJECUCIÓN REAL');
  titleOn(s, 'La tarea con un prompt suelto');
  s.addText('«…el gate de Definition of Ready rechaza issues escritos en español correcto: frases como “El rollback conserva el historial”… Arréglalo.»', { x: M, y: 1.85, w: 11.7, h: 0.72, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 19, italic: true, color: ACCENT, lineSpacing: 27 });
  // El párrafo literal ocupa dos líneas, así que aquí las cifras bajan: con la y compartida quedaban pegadas.
  const stats = [['8 min 44 s', 'de reloj'], ['2', 'archivos'], ['111 / 14', 'líneas +/–'], ['19 / 19', 'marcadores']];
  stats.forEach(([big, small], index) => {
    const x = M + index * 2.95;
    s.addText(big, { x, y: 2.85, w: 2.7, h: 0.8, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 34, bold: true, color: INK });
    s.addText(small, { x, y: 3.65, w: 2.7, h: 0.35, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13, color: MUTED });
  });
  card(s, { x: M, y: 4.3, w: 11.7, h: 1.9 });
  bullets(s, [
    'Escribió pruebas por su cuenta, aunque nadie se lo pidió.',
    '33 de 34 frases legítimas pasan, y los 19 marcadores de verdad siguen rechazados.',
  ], { x: M + 0.4, y: 4.6, w: 10.9, h: 1.3, fontSize: 15 });
  s.addNotes('La misma tarea para las dos vías. Esta es la del prompt suelto: sin issue, sin spec, sin criterios escritos. Aun así escribió pruebas por su cuenta.');
}

// 14 — Demo B
{
  const s = light();
  kicker(s, 'DEMO B · EJECUCIÓN REAL');
  titleOn(s, 'La misma tarea con el flujo');
  s.addText('Petición → issue → preparación → change → tareas → evidencia → revisión → deuda → archivo', {
    x: M, y: 1.85, w: 11.7, h: 0.5, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: ACCENT,
  });
  const stats = [['31 min 3 s', 'de reloj'], ['28', 'archivos'], ['1822 / 4', 'líneas +/–'], ['18 / 19', 'marcadores']];
  stats.forEach(([big, small], index) => {
    const x = M + index * 2.95;
    s.addText(big, { x, y: 2.6, w: 2.7, h: 0.8, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 34, bold: true, color: INK });
    s.addText(small, { x, y: 3.4, w: 2.7, h: 0.35, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13, color: MUTED });
  });
  card(s, { x: M, y: 4.3, w: 11.7, h: 1.9 });
  bullets(s, [
    'Con issue, spec, medición repetible y assessment de deuda.',
    '34 de 34 frases legítimas, y 18 de 19 marcadores.',
  ], { x: M + 0.4, y: 4.6, w: 10.9, h: 1.3, fontSize: 15 });
  s.addNotes('La misma tarea, por el flujo completo. Tres veces y media más lenta, y con veintiséis archivos más, casi todos de evidencia.');
}

// 15 — Qué salió distinto
{
  const s = light();
  kicker(s, 'LADO A LADO');
  titleOn(s, 'Qué salió distinto');
  const rows = [
    [{ text: '', options: { fill: { color: PAPER } } }, { text: 'Prompt suelto', options: { bold: true } }, { text: 'Flujo completo', options: { bold: true } }, { text: 'Sin arreglar', options: { bold: true } }],
    ['Frases correctas que pasan', '33 de 34', '34 de 34', '2 de 34'],
    ['Marcadores de verdad rechazados', '19 de 19', '18 de 19', '16 de 19'],
    ['Tiempo', '8 min', '31 min', '—'],
    ['Archivos tocados', '2', '28', '—'],
  ];
  s.addTable(rows, {
    x: M, y: 1.95, w: 11.7, colW: [4.5, 2.4, 2.4, 2.4], border: { type: 'solid', color: 'E4E4EA', pt: 1 },
    fontFace: BODY, fontSize: 15, color: INK, rowH: 0.52, valign: 'middle', margin: 8,
  });
  card(s, { x: M, y: 5.05, w: 11.7, h: 1.45, fill: INK });
  s.addText('Ninguna de las dos lo resolvió del todo, y fallan en cosas distintas.', {
    x: M + 0.4, y: 5.25, w: 10.9, h: 0.45, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 20, bold: true, color: PAPER,
  });
  s.addText('Las dos encontraron, sin que nadie se lo pidiera, un fallo que nadie había visto: la búsqueda de palabras no reconoce la «í» acentuada.', {
    x: M + 0.4, y: 5.75, w: 10.9, h: 0.6, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: ON_DARK,
  });
  s.addNotes('La tercera columna es la clave: sin ella las dos vías parecen buenas y no se ve de dónde partían. Y la conclusión no es que gane una: es que ninguna lo resolvió del todo.');
}

// 16 — Qué medimos
{
  const s = light();
  kicker(s, 'LA MEDICIÓN');
  titleOn(s, 'Qué medimos');
  s.addText('Diez preguntas con respuesta conocida sobre 6812 bytes de notas, PDF y Word.', {
    x: M, y: 1.85, w: 11.7, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 15, color: MUTED,
  });
  const rows = [
    [{ text: 'Método', options: { bold: true } }, { text: 'Devolvió la respuesta', options: { bold: true } }],
    ['Abrir todo el corpus', '8 de 10'],
    ['Buscar literal, grep', '8 de 10'],
    [{ text: 'Contexto preparado', options: { bold: true } }, { text: '10 de 10', options: { bold: true, color: ACCENT } }],
  ];
  s.addTable(rows, {
    x: M, y: 2.5, w: 7.2, colW: [4.4, 2.8], border: { type: 'solid', color: 'E4E4EA', pt: 1 },
    fontFace: BODY, fontSize: 16, color: INK, rowH: 0.56, valign: 'middle', margin: 8,
  });
  card(s, { x: 8.5, y: 2.5, w: 4.0, h: 2.24 });
  s.addText('Aquí ganamos.', { x: 8.85, y: 2.8, w: 3.4, h: 0.4, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 20, bold: true, color: INK });
  s.addText('Dos preguntas más, y además decimos en qué página y párrafo está la respuesta.', {
    x: 8.85, y: 3.25, w: 3.4, h: 1.2, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: MUTED, lineSpacing: 20,
  });
  s.addText('Pero este corpus cabe en un correo electrónico.', {
    x: M, y: 5.3, w: 11.7, h: 0.5, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 22, italic: true, color: ACCENT,
  });
  s.addNotes('Aquí ganamos: dos preguntas más y un localizador de pasaje. Pero conviene decir en voz alta el tamaño del corpus, porque la siguiente diapositiva lo desmonta.');
}

// 17 — Y qué salió mal
{
  const s = dark();
  kicker(s, 'EL RESULTADO ADVERSO', { dark: true });
  s.addText('0 de 20', { x: M, y: 1.5, w: 6.0, h: 1.9, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 96, bold: true, color: WARN });
  s.addText('Sobre kubernetes/website y python/cpython, con veinte preguntas congeladas antes de medir.', {
    x: M, y: 3.45, w: 6.0, h: 1.0, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 15, color: ON_DARK, lineSpacing: 22,
  });
  card(s, { x: 7.1, y: 1.5, w: 5.4, h: 4.6, fill: '1F1F2C' });
  // Las tres formas de buscar, no dos: sin la primera fila, la diapositiva no enseña que la vía más tonta
  // de todas también las devolvió todas, que es la mitad del resultado adverso.
  const facts = [
    ['Abrir todo el corpus', '20 de 20'],
    ['Buscar literal, grep', '20 de 20'],
    ['Contexto preparado', '0 de 20'],
  ];
  facts.forEach(([label, value], index) => {
    const y = 1.9 + index * 0.72;
    s.addText(label, { x: 7.5, y, w: 2.9, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: ON_DARK });
    s.addText(value, { x: 10.7, y: y - 0.06, w: 1.5, h: 0.45, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 20, bold: true, color: index === 2 ? WARN : PAPER, align: 'right' });
  });
  s.addText('La causa está medida: indexó 45 de 2654 fuentes en Kubernetes y 42 de 2753 en CPython, y se quedó sin presupuesto.', {
    x: 7.5, y: 3.95, w: 4.6, h: 1.0, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: ON_DARK, lineSpacing: 21,
  });
  s.addText('Lo medimos otra vez cuatro días antes de esta charla, con la versión publicada de hoy: sigue en 0 de 20.', {
    x: 7.5, y: 5.05, w: 4.6, h: 1.0, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, bold: true, color: PAPER, lineSpacing: 21,
  });
  s.addText('Está publicado en nuestra página de evidencia, al lado del número bueno.', {
    x: M, y: 6.3, w: 11.7, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, italic: true, color: MUTED,
  });
  s.addNotes('Nuestro producto no devolvió ni una sola de las veinte respuestas, y encima fue más lento. Lo podríamos no haber contado. Está publicado.');
}

// 18 — Qué aprendimos
{
  const s = light();
  kicker(s, 'LO QUE APRENDIMOS');
  titleOn(s, 'Tres cosas');
  const lessons = [
    ['El número bueno no predecía nada.', 'Si solo hubiéramos medido en el corpus pequeño, estaríamos vendiendo algo que no funciona donde importa.'],
    ['Comprobar de verdad cambia el resultado.', 'Un arnés certificó nuestra aplicación con cero hallazgos. Su versión corregida encontró 66 problemas distintos sobre la misma aplicación, repetidos en 23 combinaciones: 360 renglones. Entre ellos, siete controles que no se podían pulsar.'],
    ['La revisión adversarial funciona cuando duele.', 'Encuentra lo que llevamos semanas mirando sin ver, y justo donde más incómodo resulta.'],
  ];
  lessons.forEach(([head, sub], index) => {
    const y = 2.0 + index * 1.55;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: index === 1 ? ACCENT : SOFT }, line: { color: index === 1 ? ACCENT : SOFT } });
    s.addText(String(index + 1), { x: M, y: y + 0.09, w: 0.5, h: 0.42, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 18, bold: true, color: index === 1 ? PAPER : INK, align: 'center' });
    s.addText(head, { x: M + 0.8, y, w: 10.9, h: 0.45, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 21, bold: true, color: INK });
    s.addText(sub, { x: M + 0.8, y: y + 0.5, w: 10.9, h: 0.8, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: MUTED, lineSpacing: 20 });
  });
  s.addNotes('Tres cosas. El número bueno del corpus pequeño no predecía nada. Comprobar de verdad cambia el resultado: el mismo arnés, corregido, encontró 66 problemas distintos donde antes no veía ninguno, y en seis de los siete controles inalcanzables lo que los tapaba era la barra de acciones. Y la revisión adversarial funciona justamente cuando encuentra algo que duele.');
}

// 19 — Lo que estoy proponiendo
{
  const s = light();
  kicker(s, 'EL PROYECTO');
  titleOn(s, 'Lo que estoy proponiendo');
  s.addText('No vengo a venderos una solución terminada.', { x: M, y: 1.85, w: 11.7, h: 0.45, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 24, bold: true, color: ACCENT });
  s.addImage({ path: img('docs/assets/companion-current-home.png'), x: M, y: 2.45, w: 5.5, h: 2.02 });
  s.addImage({ path: img('docs/assets/companion/proyecto-listo-activacion.png'), x: M, y: 4.6, w: 5.5, h: 2.02 });
  s.addText('Companion 0.3.2, commit d744c47', { x: M, y: 6.68, w: 5.5, h: 0.3, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 10, color: MUTED });
  const points = [
    ['Lo que hay', 'Una aplicación para Windows, un núcleo que hace lo mismo desde la terminal, y una página donde publicamos lo que medimos.'],
    ['Comprobado', 'Los seis pasos documentados para empezar funcionan de principio a fin. El diagnóstico de un proyecto nuevo: 29 comprobaciones, ningún fallo.'],
    ['Lo que falta', 'La recuperación en repositorios grandes no funciona. Está medido y publicado.'],
    ['Por qué lo abro', 'El objetivo no es tener un producto: es que preparar el entorno se note de verdad en el trabajo de cualquiera que use IA.'],
  ];
  points.forEach(([head, sub], index) => {
    const y = 2.45 + index * 1.12;
    s.addText(head, { x: 6.9, y, w: 5.6, h: 0.32, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 12, bold: true, color: ACCENT, charSpacing: 1.1 });
    s.addText(sub, { x: 6.9, y: y + 0.32, w: 5.6, h: 0.7, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13, color: INK, lineSpacing: 18 });
  });
  s.addNotes('Quiero ser claro: no vengo a vender una solución terminada, vengo a proponer un proyecto abierto, enseñar en qué punto está e invitar a construirlo. Incluida la parte que no funciona.');
}

// 20 — Qué os podéis llevar
{
  const s = dark();
  kicker(s, 'EL CIERRE', { dark: true });
  s.addText('Prepara el entorno antes\nde pedirle nada al modelo.', {
    x: M, y: 1.25, w: 11.4, h: 1.5, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 34, bold: true, color: PAPER, lineSpacing: 44,
  });
  const takeaways = [
    'Escribid qué esperáis antes de pedirlo. Si no, cualquier resultado parece bueno.',
    'Poned una comprobación que pueda fallar. Una que nunca falla no está comprobando nada.',
    'Medid vuestro propio trabajo y publicad lo que salga. Nosotros salimos 0 de 20 y lo contamos aquí.',
  ];
  takeaways.forEach((text, index) => {
    const y = 3.1 + index * 0.82;
    s.addText(String(index + 1), { x: M, y, w: 0.4, h: 0.4, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 19, bold: true, color: ACCENT });
    s.addText(text, { x: M + 0.55, y: y + 0.03, w: 11.0, h: 0.6, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 16, color: ON_DARK });
  });
  card(s, { x: M, y: 5.75, w: 11.4, h: 1.0, fill: '1F1F2C' });
  s.addText('Y una cuarta, si os apetece: venid a construirlo. Es abierto y está a medias.', {
    x: M + 0.4, y: 6.0, w: 10.6, h: 0.5, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 18, bold: true, color: PAPER,
  });
  s.addNotes('Tres cosas que se pueden llevar hoy sin instalar nada nuestro, y una invitación: el proyecto es abierto y se nota que está a medias.');
}

// 21 — Qué no medimos
{
  const s = light();
  kicker(s, 'LOS LÍMITES');
  titleOn(s, 'Qué no medimos');
  s.addText('Y por lo tanto, qué no afirmamos.', { x: M, y: 1.8, w: 11.7, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 15, color: MUTED });
  const limits = [
    ['Consumo de tokens', 'No se midió, y no se estima a partir de bytes.'],
    ['Calidad de respuesta', 'Evaluarla con el mismo agente que la produjo sería juez y parte.'],
    ['Alucinaciones', 'El método no las observa.'],
    ['Comparación con otros productos', 'No se hizo.'],
    ['Ahorro de tiempo o dinero', 'No hay ninguno demostrado.'],
    ['La comparación de las dos vías', 'Mide una tarea, y nada más. Además, las dos partían con la misma información previa sobre el defecto.'],
  ];
  limits.forEach(([head, sub], index) => {
    const x = M + (index % 2) * 6.1;
    const y = 2.4 + Math.floor(index / 2) * 1.4;
    s.addText(head, { x, y, w: 5.6, h: 0.35, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 17, bold: true, color: INK });
    s.addText(sub, { x, y: y + 0.38, w: 5.6, h: 0.75, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13, color: MUTED, lineSpacing: 19 });
  });
  s.addNotes('Esta diapositiva es para el final o para preguntas. Lo que no se midió, no se afirma.');
}

// 22 — De dónde sale cada cifra
// El spec delta pide que el material público declare de dónde sale cada cifra. El guion lo hacía y el archivo
// que se proyecta no, así que la regla no llegaba a la sala.
{
  const s = light();
  kicker(s, 'PROCEDENCIA');
  titleOn(s, 'De dónde sale cada cifra');
  s.addText('Ninguna cifra de esta charla se escribió de memoria. Cada una sale de un registro de este repositorio.', {
    x: M, y: 1.88, w: 11.7, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14, color: MUTED,
  });
  const header = ['Diapositiva', 'Registro'].map((text) => ({
    text, options: { bold: true, fill: { color: SOFT }, color: INK },
  }));
  const rows = [
    ['6, 17 · las veinte preguntas y su resultado', 'run-02/kubernetes-website.json y cpython.json'],
    ['13, 14, 15 · las dos vías, sus tiempos y sus cifras', 'flow-comparison/evaluation.json, timing.json, resultado.md'],
    ['16 · el microcorpus', 'docs/companion/EVIDENCE.md'],
    ['18 · el contraste del arnés', 'after/harness-contrast.json y harness-contrast-detail.json'],
    ['19 · capturas y arranque documentado', 'docs/companion/SCREENSHOTS.md, after/documented-start.json'],
  ];
  s.addTable([header, ...rows], {
    x: M, y: 2.35, w: 11.7, colW: [5.9, 5.8], rowH: 0.5, valign: 'middle',
    fontFace: BODY, fontSize: 12, color: INK, margin: [0, 0.12, 0, 0.12],
    border: { type: 'solid', color: 'E4E4EA', pt: 1 },
  });
  card(s, { x: M, y: 5.6, w: 11.7, h: 1.0, fill: INK });
  s.addText('Si una cifra no está en esta tabla, no está en una diapositiva.', {
    x: M + 0.4, y: 5.93, w: 10.9, h: 0.45, isTextBox: true, margin: 0, fontFace: HEAD, fontSize: 18, bold: true, color: PAPER,
  });
  s.addNotes('Esta es la regla que no se rompe. Si alguien pregunta por una cifra, sale de uno de estos registros y está publicado.');
}

const out = path.join(process.cwd(), 'congreso-2026-09-24.pptx');
await pres.writeFile({ fileName: out });
console.log('escrito:', out);
