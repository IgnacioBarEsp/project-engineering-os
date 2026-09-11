import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { installGitBoundary } from './git-boundary.mjs';
import { projectCoreArguments } from './core-arguments.mjs';
import { verifyProjectBoundary } from './project-boundary.mjs';

const request = JSON.parse(await readFile(process.argv[2], 'utf8'));
await verifyProjectBoundary(request.target);
installGitBoundary({ target: request.target, git: request.git, cwd: path.dirname(process.argv[2]) });
const cli = await import(pathToFileURL(path.join(request.toolchain, 'node_modules/create-project-engineering-os/src/cli.mjs')).href);
process.exitCode = await cli.runCli([...projectCoreArguments(request.args), '--target', request.target]);
