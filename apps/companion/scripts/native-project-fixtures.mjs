import {pdf,docx} from './fixtures.mjs';

// Seven named scenarios cover exactly six canonical profiles. The additional
// software/game scenario retains the old Unity corpus without writing a legacy id.
export const NATIVE_PROJECT_FIXTURES = Object.freeze({
  research: {name:'Revisión de evidencia',role:'researcher',profile:'research',focus:'paper',
    goal:'Comparar cómo se midió el resultado en cada fuente',query:'instrumento',
    files:{'notas.txt':'El protocolo exige registrar el instrumento antes de comparar resultados.\n',
      'metodo.md':'# Método\n\nLa medición usa un instrumento calibrado cada semana.\n'},
    binaryFiles:{'articulo.pdf':()=>pdf(['El grupo de control incluye treinta participantes.',
      'La medición se repitió con el mismo instrumento calibrado cada semana.'])}},
  software: {name:'Servicio de presupuesto',role:'developer',profile:'software',focus:'service',
    goal:'Entender cómo se calcula el presupuesto antes de cambiarlo',query:'presupuesto',
    symbol:'calculateProjectBudget',
    files:{'README.md':'# Servicio\n\nEl cálculo de presupuesto multiplica horas por tarifa.\n',
      'src/budget.js':'export function calculateProjectBudget(hours, rate) {\n  return hours * rate;\n}\n'}},
  'software-game': {name:'Prototipo de juego',role:'developer',profile:'software',focus:'game',
    goal:'Localizar cómo se calcula el puntaje antes de ajustarlo',query:'puntaje',symbol:'ComputeScore',
    files:{'ProjectSettings/ProjectVersion.txt':'m_EditorVersion: 6000.0.0f1\n',
      'notas.txt':'El puntaje se calcula duplicando la evidencia recogida en la escena.\n',
      'Assets/Score.cs':'public static class Score { public static int ComputeScore(int evidence) { return evidence * 2; } }\n'}},
  studies: {name:'Entrega de la asignatura',role:'student',profile:'studies',focus:'course',
    goal:'Organizar una entrega conforme a su rúbrica',query:'rúbrica',
    files:{'rubrica.md':'# Entrega\n\nLa rúbrica exige justificar cada resultado con una fuente.\n',
      'notas.txt':'La revisión contrasta cada apartado con la rúbrica de la asignatura.\n'}},
  content: {name:'Serie de imágenes',role:'creator',profile:'content',focus:'creative',
    goal:'Conservar la receta que produjo cada pieza',query:'semilla',
    files:{'notas.txt':'La receta conserva la semilla 42 para poder repetir la pieza.\n',
      'workflow.json':'{"prompt":"Una ilustración original de un taller","seed":42}\n'},
    binaryFiles:{'ficha.docx':()=>docx(['La ficha de la serie fija la semilla 42 para repetir la pieza.',
      'Cada entrega conserva su receta junto al archivo final.'])}},
  business: {name:'Propuesta de trabajo',role:'freelancer',profile:'business',focus:'plan',
    goal:'Comparar opciones de trabajo con sus restricciones',query:'cotización',
    files:{'propuesta.md':'# Propuesta\n\nLa cotización distingue las horas estimadas de los gastos confirmados.\n',
      'notas.txt':'Cada cotización registra los supuestos que faltan por confirmar.\n'}},
  personal: {name:'Trabajo de la semana',role:'general',profile:'personal',focus:'open',
    goal:'Encontrar los acuerdos tomados sin releer todo',query:'acuerdo',
    files:{'acuerdos.md':'# Acuerdos\n\nSe acordó publicar el resumen antes del viernes.\n',
      'notas.txt':'Pendiente: confirmar el responsable de cada acuerdo.\n'}},
});

export const LEGACY_NATIVE_SELECTIONS = Object.freeze({
  unity:{profile:'software',focus:'game'},
  media:{profile:'content',focus:'creative'},
  general:{profile:'personal',focus:'open'},
});

export const nativeSelection = definition => ({
  name:definition.name,role:definition.role,goal:definition.goal,
  profile:definition.profile,focus:definition.focus,experience:'guided',agents:['web'],
});

// Pure contract check; the caller supplies the actual product validator, never
// a fixture-specific alias map or a fallback that could mask a missing profile.
export function validateNativeFixtures(fixtures,profileIds,normalizeSelection) {
  const covered=new Set();
  for(const [id,definition] of Object.entries(fixtures)) {
    if(!profileIds.includes(definition.profile))throw new Error(`Fixture ${id}: perfil no canónico ${definition.profile}`);
    normalizeSelection(nativeSelection(definition));
    if(!Object.keys(definition.files??{}).length)throw new Error(`Fixture ${id}: corpus vacío`);
    covered.add(definition.profile);
  }
  const missing=profileIds.filter(id=>!covered.has(id));
  if(missing.length)throw new Error(`Faltan perfiles nativos: ${missing.join(', ')}`);
  return {profiles:[...covered],scenarios:Object.keys(fixtures).length};
}
