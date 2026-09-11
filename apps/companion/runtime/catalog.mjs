const githubOrigins = ['https://github.com', 'https://release-assets.githubusercontent.com', 'https://objects.githubusercontent.com'];
const tools = {
  node: {
    id: 'node', name: 'Motor de herramientas', version: '24.20.0', license: 'MIT + avisos incluidos',
    purpose: 'Ejecuta las herramientas del proyecto sin instalar Node en el sistema.',
    source: 'https://nodejs.org/dist/v24.20.0/', entry: 'node.exe',
    url: 'https://nodejs.org/dist/v24.20.0/node-v24.20.0-win-x64.zip', origins: ['https://nodejs.org'],
    bytes: 37539751, sha256: '6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba',
    treeHash: 'baef5c1022e24a090ff6a700439882da64ed0d5a0c26fd5336846bbbf0a4dae1', installedBytes: 93542003,
  },
  npm: {
    id: 'npm', name: 'Preparador de dependencias', version: '11.19.1', license: 'Artistic-2.0 + avisos incluidos',
    purpose: 'Prepara dependencias aisladas sin ejecutar los scripts del producto.',
    source: 'https://github.com/npm/cli/tree/v11.19.1', entry: 'bin/npm-cli.js', bundled: true,
    bytes: 0, treeHash: 'ee294c531ba0fb603d93040b014c8096975ba687978d09f317d93612bc96eb7d', installedBytes: 12237898,
    packagePath: 'package.json', packageName: 'npm',
  },
  git: {
    id: 'git', name: 'Historial local del proyecto', version: '2.55.0.windows.5', license: 'GPL-2.0-only + avisos incluidos',
    purpose: 'Permite preparar y comprobar ingeniería conservando el historial existente.',
    source: 'https://github.com/git-for-windows/git/tree/v2.55.0.windows.5', entry: 'cmd/git.exe',
    url: 'https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/MinGit-2.55.0.5-64-bit.zip', origins: githubOrigins,
    bytes: 38989688, sha256: '56d7b226b7693196cfc71fef26568f536c4a021ab6c37ff2db4287bed908e96e',
    treeHash: 'da1ea3793eddef44d2aa3acc111efbb4dceac9390be74594c8a3ad6a35a06003', installedBytes: 94375970,
  },
  codegraph: {
    id: 'codegraph', name: 'Mapa de relaciones del código', version: '1.6.0', license: 'MIT + avisos incluidos',
    purpose: 'Busca funciones y relaciones de código en las fuentes que revises.',
    source: 'https://github.com/colbymchenry/codegraph/tree/v1.6.0', entry: 'lib/dist/index.js',
    url: 'https://github.com/colbymchenry/codegraph/releases/download/v1.6.0/codegraph-win32-x64.zip', origins: githubOrigins,
    bytes: 52593717, sha256: 'cd76c3c3391f2d40abef12b142151950b6d77abc2d8429e648f89eaa90f5b68a',
    treeHash: '2b15eee295158b017ea1ce0ca890ad1536ecc85cb5394c4f89b540797a35ece9', installedBytes: 169191720,
    packagePath: 'lib/package.json', packageName: '@colbymchenry/codegraph',
  },
};
function freeze(value) { for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child); return Object.freeze(value); }
export const RUNTIME_CATALOG = freeze(tools);
export const RUNTIME_PLATFORM = 'win32-x64';
