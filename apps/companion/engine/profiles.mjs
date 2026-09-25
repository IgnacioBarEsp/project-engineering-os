// The one Companion taxonomy. This module is pure so the engine, desktop service and renderer can
// consume the same decisions without importing each other or consulting project-owned files.
const focus = (id, label, description, setup, method, output, stacks = undefined) => ({
  id, label, description, setup: [setup], method: [method],
  recipes: [{title: `Trabajar en ${label.toLowerCase()}`, inputs: ['Objetivo concreto', 'Materiales pertinentes'],
    steps: [method], outputs: [output], validation: [`Comprobar ${output.toLowerCase()} contra el objetivo y sus fuentes.`]}],
  ...(stacks === undefined ? {} : {stacks}),
});
const profile = (label, description, engineering, setup, method, recipe, focuses, stacks = []) => ({
  label, description, engineering, stages: engineering
    ? ['base', 'context', 'environment', 'engineering'] : ['base', 'context'],
  stacks, setup, method, recipes: [recipe], focuses,
  visionTemplate: `Describe el objetivo, los materiales, los límites y la comprobación para ${label.toLowerCase()}.`,
});

export const PROFILES = deepFreeze({
  software: profile('Software y apps', 'Vas a escribir código: una web, una app, un servicio, un juego o un script.', true,
    ['Comprueba el lenguaje, gestor y versiones que el proyecto declara antes de instalar.',
      'Conserva el gestor y los scripts existentes; no instales herramientas globales sin consultar.',
      'Ejecuta las comprobaciones del proyecto y reporta lo que no pudiste verificar.'],
    ['Define criterios observables antes de cambiar código.', 'Haz el cambio mínimo completo y prueba los casos negativos.'],
    {title:'Cambiar software con evidencia',inputs:['Necesidad','Criterios observables','Estado del repositorio'],
      steps:['Inspecciona los módulos y pruebas pertinentes.','Acuerda la spec local cuando corresponda.','Implementa y verifica el cambio.'],
      outputs:['Cambio revisable','Evidencia y recuperación'],validation:['Las pruebas observan comportamiento, no solo archivos.']},
    [
      focus('website','Página web o landing','Sitio de contenido y navegación sin servicio propio.',
        'Comprueba estructura, rutas y accesibilidad existentes antes de elegir framework.',
        'Valida navegación, legibilidad, enlaces y carga en ventanas pequeñas.','Sitio navegable'),
      focus('saas','Plataforma web / SaaS','Interfaz y servicio con datos o cuentas si el proyecto los necesita.',
        'Identifica límites entre interfaz, API, datos y autenticación antes de ampliar dependencias.',
        'Prueba permisos, errores, persistencia y el recorrido principal.','Flujo web verificado'),
      focus('mobile','Aplicación móvil','App iOS, Android o híbrida.',
        'Comprueba plataforma, SDK y permisos declarados; no instales un SDK por suposición.',
        'Prueba navegación, permisos y estados sin conexión en un dispositivo o emulador.','Recorrido móvil probado', []),
      focus('service','API o servicio','Servicio o interfaz de programación sin pantalla principal.',
        'Revisa contratos, versiones y límites del servicio antes de añadir endpoints.',
        'Prueba respuestas válidas, errores, permisos y compatibilidad.','Contrato de servicio probado'),
      focus('game','Videojuego','Proyecto de juego con Unity, Godot o Unreal.',
        'Para Unity lee ProjectSettings/ProjectVersion.txt, conserva cada .meta y no edites Library, Temp ni obj; para otros motores comprueba su manifiesto antes de abrir.',
        'Verifica compilación, consola, escena y modo de juego con el editor compatible; sin editor, deja la ejecución pendiente.','Experiencia jugable comprobada', []),
      focus('automation','Automatización, bots y scripts','Procesos repetibles con entradas y salidas explícitas.',
        'Comprueba runtime y credenciales por referencia; nunca guardes secretos en scripts.',
        'Prueba con una muestra, límites de tiempo y recuperación antes de ejecutar un lote.','Script de muestra verificado'),
      focus('prototype','Prototipo o MVP','Primer incremento para validar una hipótesis.',
        'Identifica la hipótesis crítica y reutiliza el stack ya presente.',
        'Prueba la ruta crítica y documenta qué supuesto quedó validado.','Hipótesis puesta a prueba'),
      focus('open','Aún no lo sé','El enfoque se podrá concretar después de inspeccionar la carpeta.',
        'No elijas framework ni arquitectura hasta conocer el objetivo y los archivos.',
        'Explora una ruta pequeña y registra las decisiones todavía abiertas.','Siguiente decisión explícita'),
    ], ['web-interface','typed-code','http-service']),
  research: profile('Investigación y ciencia', 'Papers, tesis de posgrado y datos, con fuentes que se puedan comprobar.', false,
    ['Trabaja con documentos y datos locales; no instales herramientas para empezar.',
      'Un PDF sin texto seleccionable necesita reconocimiento óptico: no inventes su contenido.'],
    ['Anota archivo, página o párrafo por fuente.', 'Separa método, hallazgo y límites de la evidencia.'],
    {title:'Sintetizar evidencia',inputs:['Pregunta','Criterios de inclusión','Fuentes locales'],
      steps:['Localiza fuentes pertinentes y sus localizadores.','Compara coincidencias y contradicciones.'],
      outputs:['Matriz de evidencia','Síntesis con citas'],validation:['Cada cita existe en la fuente.']},
    [
      focus('paper','Artículo o paper','Publicación con método, resultados y discusión.',
        'Comprueba convocatoria, formato de citas y corpus antes de redactar.',
        'Separa método, resultados y limitaciones con localizadores.','Artículo sustentado'),
      focus('thesis','Tesis de posgrado','Investigación extensa con pregunta y marco teórico.',
        'Delimita pregunta, diseño y fuentes primarias sin inventar bibliografía.',
        'Contrasta hipótesis, datos y conclusiones capítulo por capítulo.','Capítulo trazable'),
      focus('data','Análisis de datos','Datos, notebooks y resultados reproducibles.',
        'Revisa procedencia, esquema y permisos de los datos antes de analizarlos.',
        'Registra transformaciones, parámetros y resultados reproducibles.','Análisis reproducible'),
      focus('review','Revisión bibliográfica','Comparación de fuentes según criterios explícitos.',
        'Define búsqueda, inclusión y exclusión antes de sintetizar.',
        'Compara hallazgos sin convertir ausencia de evidencia en evidencia de ausencia.','Matriz bibliográfica'),
      focus('open','Exploración abierta','Pregunta todavía por delimitar.',
        'Haz un inventario de fuentes y preguntas sin atribuirles conclusiones.',
        'Identifica vacíos y propone la próxima búsqueda verificable.','Pregunta delimitada'),
    ]),
  studies: profile('Estudios y universidad', 'Trabajos, reportes, presentaciones y repaso para tus materias.', false,
    ['Consulta la rúbrica, plazo y formato de la entrega antes de redactar.'],
    ['Organiza el trabajo por criterios de evaluación.', 'Verifica fuentes y coherencia antes de entregarlo.'],
    {title:'Preparar una entrega académica',inputs:['Rúbrica','Materiales','Plazo'],
      steps:['Identifica criterios.','Redacta y comprueba cada sección.'],outputs:['Entrega revisable'],
      validation:['La entrega cubre la rúbrica y conserva referencias.']},
    [
      focus('course','Proyecto de asignatura','Entrega de una materia con criterios propios.',
        'Enumera los criterios de la asignatura antes de elegir estructura.',
        'Comprueba cada parte de la entrega contra su rúbrica.','Proyecto evaluable'),
      focus('thesis','Tesis o TFG','Trabajo de grado con fuentes y alcance acordados.',
        'Alinea pregunta, tutoría, formato y fuentes permitidas.',
        'Revisa la trazabilidad entre pregunta, análisis y conclusiones.','Tesis trazable'),
      focus('lab','Reporte o laboratorio','Práctica con método, mediciones y resultados.',
        'Registra instrumentos, condiciones y datos originales.',
        'Separa observación, cálculo y conclusión reproducible.','Reporte reproducible'),
      focus('presentation','Presentación','Exposición con audiencia y tiempo definidos.',
        'Aclara audiencia, duración y mensaje principal.',
        'Ensaya la secuencia y comprueba fuentes de cada dato.','Presentación ensayada'),
      focus('review','Guía de repaso','Resumen activo y comprobación de aprendizaje.',
        'Prioriza temas según programa y dudas reales.',
        'Crea preguntas de práctica y verifica respuestas contra apuntes.','Guía de repaso comprobada'),
    ]),
  content: profile('Contenido y documentación', 'Manuales, guías, libros, artículos o contenido creativo.', false,
    ['Respeta el formato y los borradores presentes; no añadas herramientas pesadas sin consultar.'],
    ['Define audiencia y propósito.', 'Revisa enlaces, ejemplos y coherencia terminológica.'],
    {title:'Publicar contenido comprobable',inputs:['Audiencia','Borradores','Formato'],
      steps:['Ordena el contenido.','Verifica ejemplos y fuentes.'],outputs:['Pieza publicable'],
      validation:['La audiencia entiende el resultado y sus límites.']},
    [
      focus('technical','Documentación técnica','Guías y contratos para usar o mantener software.',
        'Revisa la versión real del producto y sus ejemplos.',
        'Prueba comandos, enlaces y errores documentados.','Guía técnica comprobada'),
      focus('manual','Manual o guía','Instrucciones paso a paso para una tarea.',
        'Identifica a quien seguirá la guía y los requisitos previos.',
        'Recorre los pasos desde cero y corrige ambigüedades.','Manual probado'),
      focus('knowledge','Base de conocimiento','Artículos conectados para consulta repetida.',
        'Define categorías, dueños y vigencia de cada artículo.',
        'Comprueba navegación, búsquedas y enlaces entre respuestas.','Base de conocimiento navegable'),
      focus('book','Libro, artículos o boletín','Texto editorial con estructura y fuentes.',
        'Acuerda tono, extensión y calendario antes de ampliar.',
        'Revisa argumento, citas y edición para la audiencia.','Texto editorial revisado'),
      focus('creative','Contenido creativo','Imagen, audio o video con procedencia.',
        'No descargues modelos ni pesos sin licencia y autorización; define formato y duración.',
        'Haz una muestra con semilla y parámetros, inspecciónala antes del lote.','Asset creativo inspeccionado'),
    ]),
  business: profile('Trabajo y negocio', 'Propuestas, planes, cotizaciones y la operación de tu trabajo.', false,
    ['Trabaja con los datos de la carpeta; no inventes precios, obligaciones ni resultados.'],
    ['Aclara destinatario y decisión.', 'Separa datos confirmados, estimaciones y pendientes.'],
    {title:'Preparar una decisión de trabajo',inputs:['Destinatario','Datos','Restricciones'],
      steps:['Comprueba las cifras.','Expone alternativas y pendientes.'],outputs:['Documento de decisión'],
      validation:['Las cifras citan fuente o se marcan como estimación.']},
    [
      focus('plan','Propuesta o plan','Objetivo, alcance y opciones para decidir.',
        'Aclara responsables, presupuesto y restricciones conocidas.',
        'Compara opciones, riesgos y siguiente paso.','Propuesta revisable'),
      focus('analysis','Análisis o estudio','Evaluación sustentada en datos y fuentes.',
        'Distingue datos observados de supuestos de negocio.',
        'Contrasta escenarios y sensibilidad antes de recomendar.','Análisis con supuestos visibles'),
      focus('operations','Operación y plantillas','Procedimientos y documentos repetibles.',
        'Identifica quién usa la plantilla y qué dato la alimenta.',
        'Prueba una ejecución real y documenta excepciones.','Plantilla operable'),
      focus('report','Presentación o informe','Resumen para una audiencia de trabajo.',
        'Define la decisión que la audiencia debe tomar.',
        'Comprueba cifras, contexto y claridad de la recomendación.','Informe claro'),
      focus('open','Otro trabajo','Necesidad laboral aún sin formato fijo.',
        'Averigua el resultado y destinatario antes de proponer formato.',
        'Haz un primer borrador pequeño y pide verificación.','Siguiente decisión de trabajo'),
    ]),
  personal: profile('Personal y laboratorio', 'Notas, finanzas, ideas y experimentos sin formato fijo.', false,
    ['Conserva tus materiales y privacidad; no instales dependencias globales por suposición.'],
    ['Define un resultado pequeño.', 'Registra qué funcionó y qué queda pendiente.'],
    {title:'Resolver una tarea personal',inputs:['Objetivo','Materiales','Límites'],
      steps:['Revisa lo necesario.','Haz una prueba pequeña.'],outputs:['Resultado utilizable'],
      validation:['Separa hechos, sugerencias y datos faltantes.']},
    [
      focus('notes','Notas y aprendizaje','Material para consultar y aprender después.',
        'Agrupa notas por pregunta y fecha sin borrar el original.',
        'Comprueba resúmenes con la nota de origen.','Notas recuperables'),
      focus('organization','Organización y finanzas','Seguimiento personal de tareas o cifras.',
        'Comprueba origen y fecha de cada cifra antes de calcular.',
        'Separa gastos observados de planes o estimaciones.','Resumen personal comprobado'),
      focus('ideas','Ideas y experimentos','Pruebas libres con resultado registrable.',
        'Define qué probarás y cómo sabrás si sirvió.',
        'Registra la prueba, resultado y próximo experimento.','Experimento registrado'),
      focus('open','Otro proyecto personal','Necesidad cotidiana aún sin formato.',
        'Aclara la tarea y sus límites sin imponer una plantilla.',
        'Prepara un primer resultado pequeño y fácil de revisar.','Resultado personal revisable'),
    ]),
});

export const PROFILE_IDS = Object.freeze(Object.keys(PROFILES));
export const LEGACY_PROFILE_MAP = deepFreeze({
  science: {profile:'research',focus:'open'}, docs: {profile:'content',focus:'technical'},
  mvp: {profile:'software',focus:'prototype'}, automation: {profile:'software',focus:'automation'},
  unity: {profile:'software',focus:'game'}, media: {profile:'content',focus:'creative'},
  general: {profile:'personal',focus:'open'},
});
export const READABLE_PROFILE_IDS = Object.freeze([...PROFILE_IDS, ...Object.keys(LEGACY_PROFILE_MAP)]);

function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child);
  return Object.freeze(value);
}
export function resolveProfile(value) {
  const selection = typeof value === 'string' ? {profile:value} : value ?? {};
  const legacy = LEGACY_PROFILE_MAP[selection.profile];
  const profileId = legacy?.profile ?? selection.profile;
  const definition = PROFILES[profileId];
  if (!definition) throw new RangeError(`Perfil desconocido: ${selection.profile}`);
  const named = selection.focus ?? selection.subtype;
  const owned = definition.focuses.find(item => item.id === named || item.label === named);
  const focusId = owned?.id ?? legacy?.focus ?? (definition.focuses.find(item=>item.id==='open')??definition.focuses[0]).id;
  const chosen = definition.focuses.find(item => item.id === focusId);
  if (selection.focus && !owned) throw new RangeError(`Enfoque ajeno al perfil: ${selection.focus}`);
  return {profile:profileId,focus:chosen.id,definition,chosen,legacy:!!legacy};
}
export const profileLabel = value => resolveProfile(value).definition.label;
export const focusLabel = value => resolveProfile(value).chosen.label;
export const isEngineering = value => resolveProfile(value).definition.engineering;
export const requiredStages = value => [...resolveProfile(value).definition.stages];
export const offeredStacks = value => {
  const {definition,chosen}=resolveProfile(value);
  return [...(chosen.stacks ?? definition.stacks)];
};

// Words used only to check that an optional model answer still names the person's kind of work.
// Keeping them with the taxonomy prevents a new profile from silently bypassing that floor.
const PROFILE_IDENTITY = deepFreeze({
  software:['software','código','codigo','aplicación','aplicacion'],
  research:['investigación','investigacion','documento'],
  studies:['estudios','universidad','asignatura','curso'],
  content:['contenido','documentación','documentacion','manual'],
  business:['negocio','propuesta','trabajo'],
  personal:['personal','notas','ideas'],
});
const FOCUS_IDENTITY = deepFreeze({
  'software/game':['videojuego','unity','juego','escena'],
  'content/creative':['contenido creativo','imagen','video','audio'],
});
export const identityWords = value => {
  const {profile,focus}=resolveProfile(value);
  return [...(FOCUS_IDENTITY[`${profile}/${focus}`]??PROFILE_IDENTITY[profile])];
};
