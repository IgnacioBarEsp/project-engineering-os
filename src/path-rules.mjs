import path from 'node:path';
import { ConstructorError } from './errors.mjs';
import { sha256 } from './hash.mjs';

export const PATH_RULE_SURFACES = Object.freeze([
  { id: 'claude-code', anchor: '.claude/rules/project-os.md', directory: '.claude/rules', extension: '.md', field: 'paths', root: 'CLAUDE.md' },
  { id: 'cursor', anchor: '.cursor/rules/project-os.mdc', directory: '.cursor/rules', extension: '.mdc', field: 'globs' },
  { id: 'github-copilot', anchor: '.github/instructions/project-os.instructions.md', directory: '.github/instructions', extension: '.instructions.md', field: 'applyTo', root: '.github/copilot-instructions.md' },
]);

export function validatePathRule(rule) {
  const validId = typeof rule.id === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(rule.id);
  const validGlobs = rule.globs.length > 0 && rule.globs.every((glob) => (
    /^[a-zA-Z0-9_.*?/-]+$/.test(glob)
    && !glob.startsWith('/')
    && !glob.split('/').some((segment) => segment === '..' || segment === '.' || segment === '')
  ));
  if (!validId || !validGlobs || rule.instructions.length === 0) {
    throw new ConstructorError('PROJECT_OS_PATH_RULE_INVALID', 'La regla requiere id portable, globs relativos compatibles e instrucciones.', {
      remediation: 'Use id en minúsculas, letras/números/guiones; patrones separados con /, *, ** o ?. No use rutas absolutas, .., comas, llaves ni controles.',
    });
  }
}

export function pathRuleTarget(surface, rule) {
  return `${surface.directory}/project-os-${rule.id}${surface.extension}`;
}

export function pathRuleIndex(target, rules, availableTargets) {
  const surface = PATH_RULE_SURFACES.find((item) => item.anchor === target || item.root === target);
  if (!surface || !availableTargets.has(surface.anchor)) return null;
  return ['Reglas por ruta: se aplican cuando coinciden sus patrones; el índice no activa sus cuerpos.', '',
    ...rules.map((rule) => `- [${rule.id}](${path.posix.relative(path.posix.dirname(target), pathRuleTarget(surface, rule))}): ${rule.globs.map((glob) => `\`${glob}\``).join(', ')}`),
  ].join('\n');
}

export function pathRuleEntries(entries, rules) {
  return PATH_RULE_SURFACES.flatMap((surface) => {
    const anchor = entries.find((entry) => entry.target === surface.anchor && entry.owner === 'constructor');
    if (!anchor) return [];
    return rules.map((rule) => {
      const selector = surface.field === 'paths' ? JSON.stringify(rule.globs) : JSON.stringify(rule.globs.join(','));
      const text = ['---', `${surface.field}: ${selector}`,
        ...(surface.id === 'cursor' ? [`description: ${JSON.stringify(`Project OS: ${rule.id}`)}`, 'alwaysApply: false'] : []),
        '---', '', `# Project OS: ${rule.id}`, '',
        'Generated from `.project-os/path-rules.json`; edit the canonical source.', '',
        ...rule.instructions.map((instruction) => `- ${instruction}`), '',
      ].join('\n');
      const content = Buffer.from(text);
      return { ...anchor, id: `path-rule-${surface.id}-${rule.id}`, target: pathRuleTarget(surface, rule),
        source: '.project-os/path-rules.json', content, sourceHash: sha256(content) };
    });
  });
}
