import assert from 'node:assert/strict';
import { cp, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectTree } from '../../runtime/tree.mjs';
import { RUNTIME_CATALOG } from '../../runtime/catalog.mjs';

export const installedNpmSource=fileURLToPath(new URL('../../node_modules/npm',import.meta.url));
const posixShims=new Set(['arborist','cssesc','installed-package-contents','node-gyp','node-which','nopt','pacote','qrcode-terminal','semver']
  .map(name=>`node_modules/.bin/${name}`));

// POSIX installer-created links are NOT approved product inputs. QA constructs a separate official
// fixture from the installed vendor bytes; only these nine fixture links can be omitted. The full
// official pin must still match. Product rejection of the original linked input is tested separately.
export async function npmSourceForQA(root) {
  if(process.platform==='win32')return installedNpmSource;
  const entries=await Promise.all([...posixShims].map(relative=>lstat(path.join(installedNpmSource,relative)).catch(error=>{if(error.code!=='ENOENT')throw error;return null;})));
  if(!entries.some(entry=>entry?.isSymbolicLink()))return installedNpmSource;
  const target=path.join(root,'official-fixture');
  await cp(installedNpmSource,target,{recursive:true,force:false,errorOnExist:true,verbatimSymlinks:true,
    filter:async from=>!(posixShims.has(path.relative(installedNpmSource,from).split(path.sep).join('/'))&&(await lstat(from)).isSymbolicLink())});
  const tree=await inspectTree(target,{maxFiles:1944,maxBytes:12296462});
  assert.equal(tree.sha256,RUNTIME_CATALOG.npm.treeHash);assert.equal(tree.files.length,1944);assert.equal(tree.bytes,12296462);
  return target;
}
