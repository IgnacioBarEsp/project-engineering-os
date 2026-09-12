// One definition per term, in one place, because the interface and the help screen must not drift apart.
// A term that survives in the interface is a term that has to be explained where it appears: the person
// who downloads the application has not read this repository, and the vocabulary of whoever wrote it is
// not a shared language. `short` is what a person reads in a hurry; `detail` is what they read when the
// short answer was not enough. Neither may claim anything the application has not demonstrated.
export const GLOSSARY = [
  { id: 'contexto', term: 'Contexto',
    short: 'Un resumen de tu carpeta que tu IA puede leer: qué archivos hay, qué contienen y de dónde salió cada frase.',
    detail: 'Se arma en este equipo leyendo tus archivos. No es una copia de tus documentos: guarda fragmentos y la ubicación de cada uno, para que una respuesta se pueda rastrear hasta el archivo del que salió.' },
  { id: 'fuente', term: 'Fuente',
    short: 'Uno de tus archivos, cuando ya forma parte del contexto.',
    detail: 'Un archivo que quedó fuera del contexto sigue en tu carpeta, pero no se puede citar. La pantalla de contexto dice cuáles entraron y cuáles no.' },
  { id: 'cita', term: 'Cita',
    short: 'El nombre del archivo y el lugar exacto de donde salió una frase: una línea, una página o un párrafo.',
    detail: 'Sirve para comprobar por tu cuenta. Que una IA muestre una cita no significa que la conclusión sea correcta: significa que puedes ir a verla.' },
  { id: 'inventario', term: 'Inventario',
    short: 'La lista de los archivos que se encontraron en tu carpeta, con su tamaño y su tipo.',
    detail: 'Incluye los archivos que no se pudieron leer, con el motivo. No guarda el contenido completo.' },
  { id: 'perfil', term: 'Perfil',
    short: 'El tipo de trabajo que vas a hacer: documentos, software, un juego en Unity, contenido creativo u otro.',
    detail: 'Cambia qué se prepara y cómo se explica, no qué te deja hacer. Puedes corregir la recomendación antes de que se aplique nada.' },
  { id: 'receta', term: 'Receta',
    short: 'Un recorrido corto para pedirle a tu IA un resultado concreto y comprobar si está bien.',
    detail: 'Dice cuándo usarla, qué necesitas a mano, los pasos, cómo revisar el resultado y cuándo detenerse. Está escrita para que tu IA la siga.' },
  { id: 'exclusion', term: 'Exclusión',
    short: 'Un archivo o una carpeta que decides dejar fuera del contexto.',
    detail: 'El archivo no se toca ni se mueve: simplemente no entra en el resumen que tu IA puede leer, así que tampoco se puede citar.' },
  { id: 'mapa-de-codigo', term: 'Mapa de código',
    short: 'Un índice de las funciones y clases de tu proyecto, para encontrar dónde está algo antes de cambiarlo.',
    detail: 'Solo para proyectos de software o de Unity, y solo si lo pides. Si el código cambia, el mapa queda desactualizado y la aplicación lo dice en lugar de seguir respondiendo con él.' },
  { id: 'openspec', term: 'OpenSpec',
    short: 'Una herramienta que guarda por escrito qué va a cambiar en un proyecto de software antes de cambiarlo.',
    detail: 'Se descarga solo para proyectos de software o de Unity. Copiar sus archivos no demuestra que funcione: la aplicación comprueba aparte que sus comandos respondan.' },
  { id: 'sdd', term: 'SDD',
    short: 'Trabajar escribiendo primero qué se espera y después el código, en lugar de al revés.',
    detail: 'Del inglés «spec-driven development». Es el método que OpenSpec ordena; no es obligatorio para usar esta aplicación.' },
  { id: 'ingenieria', term: 'Entorno de ingeniería',
    short: 'Las herramientas de desarrollo que un proyecto de software necesita: Node, Git y npm.',
    detail: 'Se descargan revisadas y con su huella comprobada, en una carpeta propia de la aplicación. No se instala nada en el resto de tu sistema y no se descarga ningún modelo de IA.' },
  { id: 'agente', term: 'IA con acceso a archivos',
    short: 'Una IA instalada en tu equipo que puede abrir tu carpeta, a diferencia de un chat en el navegador.',
    detail: 'Abrir la carpeta en esa aplicación es todo lo que esta aplicación puede hacer y comprobar. Que se abra no demuestra que la IA haya leído tu proyecto.' },
  { id: 'firma', term: 'Firma',
    short: 'El sello con el que quien publica un programa demuestra que ese archivo es suyo y nadie lo alteró.',
    detail: 'Esta aplicación solo abre programas cuya firma pudo comprobar. Si no puede, lo dice y no lo abre, incluso si el programa está instalado.' },
  { id: 'recuperacion', term: 'Recuperación',
    short: 'Continuar o deshacer una preparación que quedó a medias.',
    detail: 'Antes de recuperar se comprueban los archivos. Si los editaste después, la operación se detiene para no perder tu edición.' },
  { id: 'presupuesto', term: 'Presupuesto de contexto',
    short: 'El máximo de texto que una receta entrega a tu IA de una vez, medido en bytes.',
    detail: 'Es un límite de tamaño de archivo, no una medición de lo que tu IA cobra o consume. No son tokens medidos.' },
  { id: 'token', term: 'Token',
    short: 'La unidad en la que las IA miden el texto que leen y escriben, y con la que suelen cobrar.',
    detail: 'Esta aplicación no mide tokens. Cuando una pantalla habla de bytes, está hablando del tamaño del texto, no de lo que cuesta.' },
  { id: 'deuda', term: 'Deuda técnica',
    short: 'Un problema conocido que se deja anotado en lugar de arreglarse en el momento.',
    detail: 'Aparece en las recetas de software porque forma parte del método: anotarla es lo que evita que se olvide.' },
  { id: 'revision-adversarial', term: 'Revisión adversarial',
    short: 'Revisar un trabajo buscando activamente en qué falla, en vez de confirmar que está bien.',
    detail: 'Aparece en las recetas de software. Quien revisa intenta romper el resultado; si no lo consigue, eso es la evidencia.' },
];

export const byId = new Map(GLOSSARY.map(entry => [entry.id, entry]));

// A term on screen is a control, not decoration: it can be reached and activated with the keyboard, it
// says out loud that it opens a definition, and it renders the same word the reader was already reading.
export function makeTerm(el, open) {
  return (id, text) => {
    const entry = byId.get(id);
    if (!entry) throw Error(`Término sin definición: ${id}`);
    return el('button', { type: 'button', class: 'term', 'data-term': id,
      title: entry.short, onClick: () => open(id) },
      text ?? entry.term, el('span', { class: 'sr-only', text: ' — ver qué significa' }));
  };
}
