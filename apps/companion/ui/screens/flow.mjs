import {api, profiles, profileInfo, state, el, p, btn, doBtn, heading, own, term, actions, wizardBar, field, input, steps, notice, error, call, render} from '../lib/core.mjs';
import {showFolder} from '../lib/bridge.mjs';

const INSPIRATION_CHIPS = [
  { title: 'Público Objetivo', text: '\n\n### Público Objetivo\nDirigido a personas que necesitan resolver esta necesidad de manera clara y eficiente.' },
  { title: 'Problema Principal', text: '\n\n### Problema Principal a Resolver\nActualmente el proceso es manual o disperso, lo que genera fricción y demoras.' },
  { title: 'Alcance Inicial', text: '\n\n### Alcance del Primer Incremento\n1. Interfaz principal funcional.\n2. Registro y procesamiento básico.\n3. Verificación exhaustiva de calidad.' },
];

function masterActivationPrompt({ path: projectPath, profile, subtype, vision, installMode = 'ai' } = {}) {
  const target = projectPath || 'este proyecto';
  if (installMode === 'quick') {
    // What this prompt tells an AI about the folder has to be what happened. 0.3.1 said the base dependencies were
    // already provisioned; neither installation choice installs any, and #147 is where they will differ.
    return `Hola. He preparado este proyecto en ${target} con Project Engineering OS usando Instalación Rápida.

Por favor lee PROJECT_VISION.md y la estructura de la carpeta.
Esta aplicación preparó la carpeta y escribió PROJECT_VISION.md, pero no instaló ninguna dependencia ni herramienta: propón las que hagan falta antes de instalarlas.
1. Revisa la visión del proyecto y el stack configurado.
2. Si encuentras documentos de investigación, notas o fuentes externas, conviértelos a formato .md sin borrar ni alterar los archivos originales para optimizar el contexto.
3. Continúa con la implementación siguiendo las directrices de ingeniería y desarrollo guiado por especificaciones de la carpeta.
4. Al concluir cualquier cambio, ejecuta las pruebas y comprobaciones para verificar que todo funcione correctamente.`;
  }

  return `Hola. He preparado este proyecto en ${target} con Project Engineering OS. Por favor lee PROJECT_VISION.md y la estructura de la carpeta.

Hazme 3 preguntas breves y sencillas sobre cómo quiero que funcione mi proyecto (sin tecnicismos complejos). Con base en mis respuestas, investiga las mejores herramientas y librerías actuales de la industria y prepáralas usando los comandos y convenciones de ingeniería de la carpeta.

Si encuentras archivos de investigación, notas o documentos, conviértelos a .md sin tocar ni eliminar los archivos originales para optimizar el contexto. Al terminar, realiza pruebas automatizadas para verificar que todo el entorno y código funcionen correctamente.`;
}

function showDelimitation() {
  state.page = 'delimitation';
  const s = state.selection;
  const items = profileInfo(s.profile).focuses;
  if (!items.some(item=>item.id===s.focus))s.focus=items[0].id;

  const cards = el('div', { class: 'delimitation-grid' }, items.map(item => {
    const isSelected = s.focus === item.id;
    return el('article', {
      class: `delimitation-card ${isSelected ? 'selected' : ''}`,
      role: 'radio',
      'aria-checked': String(isSelected),
      tabindex: '0',
      onClick: () => { s.focus = item.id; s.stack.requested=s.stack.requested.filter(id=>item.stacks.includes(id)); showDelimitation(); },
      onKeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.focus = item.id; s.stack.requested=s.stack.requested.filter(id=>item.stacks.includes(id)); showDelimitation(); } }
    },
      el('div', {},
        el('h3', { class: 'option-title', text: item.label }),
        p(item.description)
      ),
    );
  }));

  render([
    steps(1),
    ...heading('¿Cuál es el enfoque principal de tu proyecto?',
      `Elige el enfoque para ${profiles[s.profile]?.[0] ?? s.profile} para ajustar las recomendaciones.`),
    el('p',{class:'subtle'},'Si vas a trabajar con ',term('fuente','fuentes'),', puedes abrir aquí su definición.'),
    el('div', { class: 'folder-card' },
      own(s.name || state.project?.name || 'Mi proyecto', 'h2'),
      state.project ? own(state.project.root, 'p', { class: 'path' }) : null
    ),
    cards
  ], 'PREPARAR PROYECTO / DELIMITACIÓN', wizardBar(
    btn('Volver', () => showFolder()),
    btn('Paso 3: Visión y Descripción  →', () => showVision(), 'primary')
  ));
}

function showVision() {
  state.page = 'vision';
  const s = state.selection;
  if (!s.vision) s.vision = s.goal || '';

  const textarea = el('textarea', {
    id: 'vision-input',
    class: 'vision-textarea',
    // A placeholder disappears as soon as someone types, so it cannot be the field's only name.
    'aria-label': 'Tu visión del proyecto',
    placeholder: 'Describe en tus palabras qué quieres lograr, a quién va dirigido y la meta de este proyecto...',
    onInput: e => {
      s.vision = e.target.value;
      updateStats();
    }
  });
  textarea.value = s.vision;

  const countSpan = el('span', { id: 'char-word-count', text: '0 palabras' });
  const statusSpan = el('span', { class: 'density-badge', text: 'Densidad óptima' });

  function updateStats() {
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    countSpan.textContent = `${words} palabras`;
  }
  updateStats();

  const chips = el('div', { class: 'chips-grid' }, INSPIRATION_CHIPS.map(chip =>
    el('button', {
      type: 'button',
      class: 'prompt-chip',
      onClick: () => {
        textarea.value = textarea.value.trim() + chip.text;
        s.vision = textarea.value;
        updateStats();
        textarea.focus();
      }
    },
      el('strong', { text: chip.title }),
      el('small', { text: 'Clic para agregar al borrador' })
    )
  ));

  const editorContainer = el('div', { class: 'vision-container' },
    el('div', { class: 'vision-header' },
      el('div', { class: 'vision-modes' },
        el('span', { class: 'vision-mode-btn active', text: 'Modo libre' }),
        el('span', { class: 'vision-mode-btn', text: 'Markdown soportado' })
      ),
      el('span', { class: 'density-badge', text: 'Asistencia activa' })
    ),
    textarea,
    el('div', { class: 'vision-footer' },
      el('span', { class: 'subtle', text: 'Guardaremos esto en PROJECT_VISION.md en la raíz de tu proyecto.' }),
      el('div', { class: 'vision-footer-status' }, countSpan, statusSpan)
    ),
    el('div', { class: 'chips-container' },
      el('p', { class: 'chips-title', text: 'Sugerencias para enriquecer la descripción:' }),
      chips
    )
  );

  render([
    steps(2),
    ...heading('Cuéntanos en tus palabras: ¿qué quieres lograr?',
      'Esta descripción se guardará en PROJECT_VISION.md para que cualquier IA entienda la intención sin perder el rumbo.'),
    editorContainer
  ], 'PREPARAR PROYECTO / VISIÓN', wizardBar(
    btn('Volver', () => showDelimitation()),
    btn('Paso 4: Instalación  →', () => showInstall(), 'primary')
  ));
}

function showInstall() {
  state.page = 'install';
  const s = state.selection;

  const cardQuick = el('article', { class: 'bifurcation-card' },
    el('div', {},
      el('span', { class: 'bifurcation-badge fast', text: 'Velocidad inmediata' }),
      el('h2', { text: 'Instalación rápida' }),
      p('Prepara la estructura básica e instala las dependencias base en tu equipo para arrancar en segundos.', 'desc'),
      el('ul', { class: 'bifurcation-features' },
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Estructura ordenada y archivo PROJECT_VISION.md en disco.' })),
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Herramientas base preparadas directamente en tu equipo.' })),
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Prompt adaptado que reconoce lo configurado localmente.' }))
      )
    ),
    actions(btn('Instalar stack base y obtener prompt  →', async () => {
      s.installMode = 'quick';
      await executeInstallation();
    }, 'primary'))
  );

  const cardAi = el('article', { class: 'bifurcation-card recommended' },
    el('div', {},
      el('span', { class: 'bifurcation-badge ai', text: 'Recomendado · Máxima personalización' }),
      el('h2', { text: 'Que mi IA se encargue' }),
      p('Prepara tu carpeta con PROJECT_VISION.md y delega la arquitectura a tu IA predilecta (Cursor, Claude, ChatGPT, etc.).', 'desc'),
      el('ul', { class: 'bifurcation-features' },
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Tu IA te hace 3 preguntas sencillas para afinar tus necesidades.' })),
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Explora opciones de la industria adaptadas a tu proyecto.' })),
        el('li', {}, el('span', { class: 'check-icon', text: '✓' }), el('span', { text: 'Convierte documentos a Markdown sin tocar originales y comprueba su estado.' }))
      )
    ),
    actions(btn('Preparar carpeta y generar prompt maestro  →', async () => {
      s.installMode = 'ai';
      await executeInstallation();
    }, 'primary'))
  );

  render([
    steps(3),
    ...heading('Tu espacio está listo. ¿Cómo prefieres equiparlo?',
      'Elige entre instalación rápida determinista o delegar la exploración y selección a tu IA.'),
    el('div', { class: 'bifurcation-grid' }, cardQuick, cardAi)
  ], 'PREPARAR PROYECTO / INSTALACIÓN', wizardBar(btn('Volver', () => showVision())));
}

// The objective the preparation records is the vision's text on one line: the preparation refuses a line break in
// it, and 0.3.1 sent the vision as it was, so a suggestion or an Enter stopped the installation with GOAL_INVALID.
const visionObjective = vision => (vision ?? '').replace(/^\s*#+\s*/gm, '').replace(/\s+/g, ' ').trim().slice(0, 500);

async function executeInstallation() {
  const s = state.selection, objective = visionObjective(s.vision);
  // A vision that leaves no text, an empty editor or a lone heading mark, is not sent: the objective chosen in the
  // first step stays, and PROJECT_VISION.md states it instead of an empty section. The answers themselves are left
  // as they are, so going back shows what the person wrote.
  const { vision, ...answers } = s;
  const selection = objective ? { ...answers, goal: objective, vision } : answers;
  state.plan = await call('previewBase', { id: state.project.id, selection });
  const r = await call('applyBase', { plan: state.plan.id });
  state.status = r.status;
  state.project = { ...state.project, ...r.status.project };
  showFinished();
}

function showFinished() {
  state.page = 'finished';
  const s = state.selection;
  const pRoot = state.project?.root ?? 'C:/Proyectos/mi-proyecto';
  const promptText = masterActivationPrompt({
    path: pRoot,
    profile: s.profile,
    focus: s.focus,
    vision: s.vision,
    installMode: s.installMode
  });

  const hero = el('div', { class: 'finished-hero' },
    el('div', { class: 'finished-pulse-icon' }, el('span', { text: '✓' })),
    el('div', { class: 'wizard-step-badge', text: 'Preparación completada' }),
    el('h1', { text: '¡Tu proyecto está listo para cobrar vida!' }),
    p('Hemos organizado tu espacio de trabajo y anclado tus objetivos en PROJECT_VISION.md.')
  );

  // Both copies go to the main process through the envelope every other operation uses, so a refusal reaches the
  // error surface instead of an empty catch. 0.3.1 asked the page's own clipboard, which this window is not allowed
  // to write, and said nothing when it was refused. The confirmation comes only once the clipboard holds the text:
  // announced in the status region, and shown on the button the person is looking at.
  const copyButton = (label, done, announce, text, cls) => {
    let revert = null;
    const node = btn(label, async () => {
      // Each attempt starts from the plain label: a confirmation left by the previous copy must not stand beside an
      // error, and a second success counts its two seconds from itself.
      clearTimeout(revert);
      node.textContent = label;
      await call('copyText', { text });
      notice(announce);
      node.textContent = done;
      revert = setTimeout(() => { node.textContent = label; }, 2000);
    }, cls);
    return node;
  };
  const copyPathBtn = copyButton('Copiar ruta', '¡Ruta copiada!', 'Ruta copiada. Pégala donde abras tu proyecto.', pRoot, 'secondary');

  const pathBar = el('div', { class: 'finished-path-bar' },
    el('div', { class: 'finished-path-content' },
      el('strong', { text: 'Carpeta:' }),
      el('code', { text: pRoot })
    ),
    copyPathBtn
  );

  const copyPromptBtn = copyButton('Copiar Prompt Maestro', '¡Prompt copiado!',
    'Prompt Maestro copiado. Pégalo en tu IA: todavía no se ha enviado a ninguna.', promptText, 'primary');

  const activationCard = el('div', { class: 'activation-card' },
    el('h2', { text: 'Paso 1: Abre la carpeta en tu IA de cabecera' }),
    p('Abre tu editor o aplicación predilecta (Cursor, Windsurf, Claude Code, VS Code o tu chat de IA) y abre esta carpeta.'),
    el('h2', { class: 'finished-next-title', text: 'Paso 2: Pega este Prompt Maestro en tu IA' }),
    p('Este prompt orienta a tu IA para leer tu visión, formular preguntas clave y construir con rigor técnico.'),
    el('div', { class: 'prompt-box' },
      el('pre', { text: promptText })
    ),
    actions(copyPromptBtn)
  );

  const pillars = el('div', { class: 'pillars-grid' },
    el('div', { class: 'pillar-card' },
      el('h3', { text: 'Método de trabajo' }),
      p('Tu IA creará planes, verificará con evidencia y respetará las especificaciones.')
    ),
    el('div', { class: 'pillar-card' },
      el('h3', { text: 'Visión anclada' }),
      p('PROJECT_VISION.md mantiene el propósito claro y evita desviaciones del objetivo.')
    ),
    el('div', { class: 'pillar-card' },
      el('h3', { text: 'Local y privado' }),
      p('Tus documentos originales se conservan intactos. Todo opera en tu equipo sin telemetría.')
    )
  );

  render([
    steps(),
    hero,
    pathBar,
    activationCard,
    pillars,
    actions(doBtn('open-workspace'), doBtn('open-project-list'))
  ], 'PROYECTO LISTO / ACTIVACIÓN DE IA');
}

export {INSPIRATION_CHIPS, masterActivationPrompt, showDelimitation, showVision, showInstall, visionObjective, executeInstallation, showFinished};
