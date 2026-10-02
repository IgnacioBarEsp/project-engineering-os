import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

test('doctor diferencia upstream explícito de consumidor sin ocultar obligaciones', async (t) => {
  const root=await createHealthyFixture(t);
  await rm(path.join(root,'.project-constructor/state.json'));
  await rm(path.join(root,'.github/workflows/project-constructor.yml'));
  const options={target:root,runner:healthyRunner(),parityChecker:healthyParity,env:{}};
  const consumer=await collectDoctorReport(options);
  assert.equal(consumer.results.find(r=>r.id==='release.identity').status,'FAIL');
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  pkg.name='create-project-engineering-os';await json(root,'package.json',pkg);
  await json(root,'.project-os/repository-governance.json',{repositoryKind:'upstream'});
  await rm(path.join(root,'.project-os/github/product-os.json'));
  const upstream=await collectDoctorReport(options);
  for(const id of ['release.identity','harness.parity','mcp.configuration','ci.configuration']) {
    const r=upstream.results.find(r=>r.id===id);assert.equal(r.status,'SKIP');assert.equal(r.evidence.category,'consumer-shape');
  }
  assert.equal(upstream.results.find(r=>r.id==='github.project').status,'FAIL');
  assert.ok(upstream.results.every(r=>r.evidence.category && r.evidence.applicability));
  await rm(path.join(root,'.project-os/debt/config.json'));
  assert.equal((await collectDoctorReport(options)).results.find(r=>r.id==='debt.health').status,'SKIP');
});

test('doctor exige contrato fijo y fechado para el recibo de GitHub Project sin ejecutar renovaciones', async t => {
  const root=await createHealthyFixture(t);
  const config=JSON.parse(await readFile(path.join(root,'.project-os/github/product-os.json'),'utf8'));
  const legacyReceipt={
    schemaVersion:'1.0.0',status:'PASS',optIn:true,
    configHash:doctorInternals.sha256(`${doctorInternals.stableStringify(config)}\n`),
    issuedAt:new Date(Date.now()-1000).toISOString(),
    expiresAt:new Date(Date.now()+30*24*60*60*1000).toISOString(),
  };
  await json(root,'.project-os/evidence/github-project.json',legacyReceipt);
  const calls=[];
  const options={target:root,runner:healthyRunner(calls),parityChecker:healthyParity,env:{}};
  const status=async()=> (await collectDoctorReport(options)).results.find(r=>r.id==='github.project');
  assert.equal((await status()).status,'PASS');
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  pkg.name='create-project-engineering-os';
  await json(root,'package.json',pkg);
  const lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
  lock.name=pkg.name;lock.packages[''].name=pkg.name;
  await json(root,'package-lock.json',lock);
  await json(root,'.project-os/repository-governance.json',{repositoryKind:'upstream'});
  assert.equal((await status()).status,'FAIL');
  const receipt={
    ...legacyReceipt,
    source:'https://github.com/users/Owner/projects/3',
    verification:'Read-only project view matched the configured owner and title.',
    renewalCommand:'gh project view 3 --owner Owner --format json',
    };
    await json(root,'.project-os/evidence/github-project.json',receipt);
    assert.equal((await status()).status,'PASS');
    await mkdir(path.join(root,'.project-constructor/evidence'),{recursive:true});
    await json(root,'.project-constructor/evidence/github-project.json',receipt);
    await rm(path.join(root,'.project-os/evidence/github-project.json'));
    const legacyUpstream=await status();
    assert.equal(legacyUpstream.status,'WARN');
    assert.equal(legacyUpstream.evidence.expectedReceipt,'.project-os/evidence/github-project.json');
    await json(root,'.project-os/evidence/github-project.json',receipt);
    assert.equal((await status()).status,'PASS');
    await json(root,'.project-os/evidence/github-project.json',{
      ...receipt,
      verification:'x'.repeat(17*1024),
    });
    const oversized=await status();
    assert.equal(oversized.status,'FAIL');
    assert.match(oversized.cause,/límite de lectura/);
    for(const change of [
      {renewalCommand:'gh project delete 3 --owner Owner'},
    {verification:''},
    {expiresAt:new Date(Date.now()+181*24*60*60*1000).toISOString()},
    {issuedAt:new Date(Date.now()+60*60*1000).toISOString()},
  ]) {
    await json(root,'.project-os/evidence/github-project.json',{...receipt,...change});
    assert.equal((await status()).status,'FAIL');
  }
    assert.equal(calls.filter(call=>call==='ghVersion').length,10);
  assert.ok(calls.every(call=>['nodeVersion','npmVersion','gitRoot','gitStatus','ghVersion'].includes(call)));
});

test('doctor conserva la ruta heredada del recibo de GitHub Project para consumidores', async t => {
  const root=await createHealthyFixture(t);
  const config=JSON.parse(await readFile(path.join(root,'.project-os/github/product-os.json'),'utf8'));
  const legacyReceipt={
    schemaVersion:'1.0.0',
    status:'PASS',
    configHash:doctorInternals.sha256(`${doctorInternals.stableStringify(config)}\n`),
    expiresAt:new Date(Date.now()+30*24*60*60*1000).toISOString(),
  };
  await mkdir(path.join(root,'.project-constructor/evidence'),{recursive:true});
  await json(root,'.project-constructor/evidence/github-project.json',legacyReceipt);
  await rm(path.join(root,'.project-os/evidence/github-project.json'),{force:true});
  const report=await collectDoctorReport({
    target:root,
    runner:healthyRunner(),
    parityChecker:healthyParity,
    env:{},
  });
  const project=report.results.find(entry=>entry.id==='github.project');
  assert.equal(project.status,'PASS');
  assert.equal(project.evidence.receipt,'.project-constructor/evidence/github-project.json');
});

test('indexación opt-in valida recibos independientes, recientes y ligados al config', async (t) => {
  const root=await createHealthyFixture(t);
  const config={codeIndexable:true,activeProfiles:['documentation','harness-tooling']};
  await json(root,'.project-constructor/config.json',config);
  const receipt={schemaVersion:'1.0.0',optIn:true,status:'PASS',
    configHash:doctorInternals.sha256(doctorInternals.stableStringify(config)),
    issuedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()};
  const target='.project-os/evidence/code-intelligence-gitnexus.json';
  const options={target:root,runner:healthyRunner(),parityChecker:healthyParity,env:{}};
  const status=async()=> (await collectDoctorReport(options)).results.find(r=>r.id==='code-intelligence.gitnexus').status;
  assert.equal(await status(),'FAIL');await json(root,target,receipt);
  const before=await snapshot(root);assert.equal(await status(),'PASS');assert.deepEqual(await snapshot(root),before);
  assert.equal((await collectDoctorReport(options)).results.find(r=>r.id==='code-intelligence.codegraph').status,'FAIL');
  for(const change of [{optIn:false},{configHash:'wrong'},{expiresAt:'2020-01-01'},
    {issuedAt:'2020-01-01'},{expiresAt:null},{issuedAt:new Date(Date.now()+86400000).toISOString()}]) {
    await json(root,target,{...receipt,...change});assert.equal(await status(),'FAIL');
  }
  await write(root,target,'{broken');assert.equal(await status(),'FAIL');
  await json(root,'.project-constructor/config.json',{...config,codeIndexable:false});
  assert.equal(await status(),'SKIP');
});
import { CONSTRUCTOR_VERSION, PACKAGE_ROOT } from "../src/constants.mjs";
import { collectDoctorReport, doctorInternals, runDoctor } from "../src/doctor.mjs";
import { createReport, formatHuman, formatJson, result } from "../src/report.mjs";
import { configureTechnicalProfiles } from "./helpers/technical-profile-evidence.mjs";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function write(root, relative, content) {
  const absolute = path.join(root, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
}

async function json(root, relative, value) {
  await write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}

async function snapshot(root, relative = "") {
  const current = path.join(root, relative);
  const entries = await readdir(current, { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      Object.assign(output, await snapshot(root, child));
    } else {
      output[child.split(path.sep).join("/")] = hash(await readFile(path.join(root, child)));
    }
  }
  return output;
}

function healthyRunner(calls = [], overrides = {}) {
  return async (_spec, { id }) => {
    calls.push(id);
    const outputs = {
      nodeVersion: "v22.22.0\n",
      npmVersion: "10.9.2\n",
      gitRoot: "true\n",
      gitStatus: "",
      ghVersion: "gh version 2.75.0\n",
      gitVersion: "git version 2.50.0\n",
      ...overrides,
    };
    return { ok: true, exitCode: 0, stdout: outputs[id] ?? "", stderr: "", timedOut: false };
  };
}

async function healthyParity() {
  return {
    exitCode: 0,
    plan: {
      hasDrift: false,
      summary: {
        conflicts: 0,
        creates: 0,
        deletes: 0,
        preserves: 1,
        stateUpdate: false,
        updates: 0,
      },
    },
  };
}

async function createHealthyFixture(t, { graphify = false, literalSecret = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "project-constructor-doctor-"));
  t.after(async () => {
    await rm(root, { force: true, recursive: true });
  });
  await mkdir(path.join(root, ".git"), { recursive: true });
  await json(root, "package.json", {
    name: "fixture-project",
    private: true,
    devDependencies: {
      "@fission-ai/openspec": "1.6.0",
      "create-project-engineering-os": CONSTRUCTOR_VERSION,
    },
  });
  await json(root, "package-lock.json", {
    name: "fixture-project",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "fixture-project",
        devDependencies: {
          "@fission-ai/openspec": "1.6.0",
          "create-project-engineering-os": CONSTRUCTOR_VERSION,
        },
      },
      "node_modules/@fission-ai/openspec": { version: "1.6.0" },
      "node_modules/create-project-engineering-os": {
        name: "create-project-engineering-os",
        version: CONSTRUCTOR_VERSION,
      },
    },
  });
  await json(root, "node_modules/@fission-ai/openspec/package.json", {
    name: "@fission-ai/openspec",
    version: "1.6.0",
  });
  await json(root, "node_modules/create-project-engineering-os/package.json", {
    name: "create-project-engineering-os",
    version: CONSTRUCTOR_VERSION,
  });
  await write(root, "node_modules/@fission-ai/openspec/bin/openspec.js", "throw new Error('doctor must not execute this');\n");
  await write(root, "node_modules/create-project-engineering-os/bin/project-os.mjs", "throw new Error('doctor must not execute this');\n");
  const agents = "# Universal agent guide\n";
  await write(root, "AGENTS.md", agents);
  await json(root, ".project-constructor/state.json", {
    packageName: "create-project-engineering-os",
    packageVersion: CONSTRUCTOR_VERSION,
    schemaVersion: "1.0.0",
    files: [{ target: "AGENTS.md", owner: "constructor", hash: hash(agents) }],
  });
  await json(root, ".project-constructor/config.json", {
    activeProfiles: ["documentation", "harness-tooling"],
    codeIndexable: false,
    requiredEnvironmentVariables: [],
  });
  await json(root, ".project-os/profiles.json", {
    active: ["documentation", "harness-tooling"],
    profiles: [],
  });
  await json(root, ".project-os/mcp.json", {
    servers: [
      {
        id: graphify ? "graphify" : "context-docs",
        active: true,
        command: "connector",
        token: literalSecret
          ? ["ghp", "_", "1234567890abcdefghijklmnop"].join("")
          : "${CONTEXT_DOCS_TOKEN}",
      },
    ],
  });
  await json(root, ".project-os/debt/config.json", {
    schemaVersion: 1,
    budget: { threshold: 5, minorUnits: 1, escalatedMinorUnits: 2 },
    triggers: { flowsWithResidualDebt: 5, recurrenceFlows: 3 },
    github: { mode: "off" },
    plans: [{ id: "product-roadmap", title: "Product roadmap" }],
    planRouting: { labelMap: {}, default: "product-roadmap" },
    allowlistLabels: ["debt-remediation", "security", "incident", "rollback"],
  });
  await json(root, ".project-os/debt/registry.json", {
    schemaVersion: 1,
    items: [],
  });
  await json(root, ".project-os/github/product-os.json", {
    labels: [],
    fields: [],
    statuses: [],
  });
  await write(root, ".github/workflows/project-constructor.yml", "name: Project Constructor\n");
  return root;
}

test("doctor sano no produce FAIL y conserva señales no demostradas como SKIP/WARN", async (t) => {
  const root = await createHealthyFixture(t);
  const calls = [];
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(calls),
    parityChecker: healthyParity,
    env: {},
  });

  assert.equal(report.verdict, "PASS");
  assert.equal(report.counts.FAIL, 0);
  assert.equal(report.results.find((entry) => entry.id === "mcp.configuration").status, "PASS");
  assert.equal(report.results.find((entry) => entry.id === "mcp.startup").status, "SKIP");
  assert.equal(report.results.find((entry) => entry.id === "github.project").status, "WARN");
  assert.equal(report.results.find((entry) => entry.id === "code-intelligence.graphify").status, "SKIP");
  assert.deepEqual(calls, ["nodeVersion", "npmVersion", "gitRoot", "gitStatus", "ghVersion"]);
});

test('doctor verifies isolated engineering packages and preserves product metadata and all file hashes', async t => {
  const root = await createHealthyFixture(t);
  const relative = '.project-os/toolchain';
  const location = path.join(root, relative);
  await mkdir(location, { recursive: true });
  for (const file of ['package.json', 'package-lock.json', 'node_modules']) {
    await cp(path.join(root, file), path.join(location, file), { recursive: true });
  }
  await json(root, 'package.json', { name: 'consumer-product', scripts: { prepare: 'this must not run' } });
  await json(root, 'package-lock.json', { name: 'consumer-product', lockfileVersion: 3 });
  const config = JSON.parse(await readFile(path.join(root, '.project-constructor/config.json'), 'utf8'));
  await json(root, '.project-constructor/config.json', { ...config, toolchainRoot: relative });
  const options = { target: root, runner: healthyRunner(), parityChecker: healthyParity, env: {} };
  const before = await snapshot(root);
  const report = await collectDoctorReport(options);
  for (const id of ['dependencies.lockfile', 'sdd.openspec-local', 'release.identity']) {
    const entry = report.results.find(r => r.id === id);
    assert.equal(entry.status, 'PASS', entry.cause);
    assert.equal(entry.evidence.location, relative);
  }
  assert.deepEqual(await snapshot(root), before);
  // A package called upstream inside the toolchain cannot hide consumer obligations.
  await json(location, 'package.json', { name: 'create-project-engineering-os' });
  await json(root, '.project-os/repository-governance.json', { repositoryKind: 'upstream' });
  assert.equal((await collectDoctorReport(options)).results.find(r => r.id === 'release.identity').status, 'FAIL');
  await json(root, '.project-constructor/config.json', { ...config, toolchainRoot: '../outside' });
  const invalid = await collectDoctorReport(options);
  for (const id of ['dependencies.lockfile', 'sdd.openspec-local', 'release.identity']) {
    assert.equal(invalid.results.find(r => r.id === id).status, 'FAIL');
  }
  assert.equal(invalid.results.find(r => r.id === 'git.repository').status, 'PASS');
  assert.equal(invalid.results.find(r => r.id === 'runtime.node').status, 'PASS');
  await json(root, '.project-constructor/config.json', { activeProfiles: ['ui'], padding: 'x'.repeat(65536) });
  const oversized = await collectDoctorReport(options);
  assert.equal(oversized.results.find(r => r.id === 'sdd.openspec-local').status, 'FAIL');
  assert.equal(oversized.results.find(r => r.id === 'profile.ui').evidence.active, false);
});

test("salida humana y JSON derivan del mismo reporte", async (t) => {
  const root = await createHealthyFixture(t);
  const runner = healthyRunner();
  const human = await runDoctor({
    target: root,
    runner,
    parityChecker: healthyParity,
    json: false,
    env: {},
  });
  const machine = await runDoctor({
    target: root,
    runner,
    parityChecker: healthyParity,
    json: true,
    env: {},
  });
  const parsed = JSON.parse(machine.output);

  assert.equal(human.exitCode, machine.exitCode);
  assert.deepEqual(
    human.report.results.map(({ id, status, cause, remediation }) => ({ id, status, cause, remediation })),
    parsed.results.map(({ id, status, cause, remediation }) => ({ id, status, cause, remediation })),
  );
  assert.match(human.output, /Veredicto: PASS/);
});

test("doctor es read-only sobre la fixture", async (t) => {
  const root = await createHealthyFixture(t);
  const before = await snapshot(root);
  await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const after = await snapshot(root);
  assert.deepEqual(after, before);
});

test("doctor acepta evidencia técnica completa sin mutarla y conserva SKIP inactivo", async (t) => {
  const root = await createHealthyFixture(t);
  const baseline = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const setup = await configureTechnicalProfiles(root, ["ui", "infra-deploy"]);
  const ui = setup.records.get("ui");
  const before = await snapshot(root);
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });

  for (const profile of ["ui", "infra-deploy"]) {
    const entry = report.results.find((candidate) => candidate.id === `profile.${profile}`);
    assert.equal(entry.status, "PASS", entry.cause);
    assert.equal(entry.evidence.verification, "integrity-and-completeness-only");
    assert.equal(entry.evidence.receipt, `.project-os/evidence/technical-profile-${profile}.json`);
    assert.equal(entry.evidence.artifacts.length, 13);
    assert.match(entry.cause, /no ejecutó ni autenticó/);
  }
  assert.equal(report.results.find((entry) => entry.id === "profile.backend-api").status, "SKIP");
  assert.deepEqual(
    report.results.filter((entry) => !entry.id.startsWith("profile.")).map(({ id, status }) => ({ id, status })),
    baseline.results.filter((entry) => !entry.id.startsWith("profile.")).map(({ id, status }) => ({ id, status })),
  );
  assert.deepEqual(await snapshot(root), before);

  const incomplete = structuredClone(ui);
  incomplete.manualEvidence = [];
  await json(root, ".project-os/evidence/technical-profile-ui.json", incomplete);
  const catalog = JSON.parse(await readFile(path.join(root, ".project-os/profiles.json"), "utf8"));
  catalog.profiles.find((profile) => profile.id === "ui").manualEvidence = [];
  await json(root, ".project-os/profiles.json", catalog);
  const tamperedCatalog = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const uiResult = tamperedCatalog.results.find((entry) => entry.id === "profile.ui");
  assert.equal(uiResult.status, "FAIL");
  assert.match(uiResult.cause, /Falta evidencia requerida en manualEvidence/);
});

test("schema empaquetado del recibo acepta la forma válida y rechaza propiedades ajenas", async (t) => {
  const root = await createHealthyFixture(t);
  const { records } = await configureTechnicalProfiles(root, ["ui"]);
  const schema = JSON.parse(await readFile(
    path.join(PACKAGE_ROOT, "blueprint/schema/technical-profile-evidence.schema.json"),
    "utf8",
  ));
  const validate = new Ajv2020({ strict: true, allErrors: true }).compile(schema);
  const record = records.get("ui");
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...record, command: "must not execute" }), false);
  assert.equal(validate({
    ...record,
    automaticValidations: record.automaticValidations.map((item, index) => ({
      ...item,
      status: index === 0 ? "N/A" : item.status,
    })),
  }), false);
});

test("evidencia técnica activa falla cerrado ante recibos inválidos o desactualizados", async (t) => {
  const root = await createHealthyFixture(t);
  const { records, config } = await configureTechnicalProfiles(root, ["ui"]);
  const receiptPath = ".project-os/evidence/technical-profile-ui.json";
  const original = records.get("ui");
  const status = async () => (await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  })).results.find((entry) => entry.id === "profile.ui");

  assert.equal((await status()).status, "PASS");
  await rm(path.join(root, receiptPath));
  assert.equal((await status()).status, "FAIL");
  await json(root, receiptPath, original);

  const invalidCases = [
    ["schemaVersion", (record) => { record.schemaVersion = "2.0.0"; }],
    ["profileId", (record) => { record.profileId = "infra-deploy"; }],
    ["profileHash", (record) => { record.profileHash = "0".repeat(64); }],
    ["unknown field", (record) => { record.command = "must not execute"; }],
    ["impossible timestamp", (record) => { record.issuedAt = "2026-02-30T12:00:00.000Z"; }],
    ["future issue time", (record) => { record.issuedAt = new Date(Date.now() + 60_000).toISOString(); }],
    ["stale time window", (record) => {
      record.issuedAt = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString();
      record.expiresAt = new Date(Date.now() - 60_000).toISOString();
    }],
    ["missing canonical entry", (record) => { record.automaticValidations.pop(); }],
    ["duplicate canonical entry", (record) => {
      record.automaticValidations[1] = structuredClone(record.automaticValidations[0]);
    }],
    ["unknown canonical entry", (record) => { record.automaticValidations[0].id = "injected-command"; }],
    ["non-PASS outcome", (record) => { record.automaticValidations[0].status = "N/A"; }],
    ["artifact hash", (record) => { record.automaticValidations[0].artifact.sha256 = "0".repeat(64); }],
    ["traversal", (record) => { record.automaticValidations[0].artifact.path = "../outside.txt"; }],
  ];
  for (const [label, mutate] of invalidCases) {
    const changed = structuredClone(original);
    mutate(changed);
    await json(root, receiptPath, changed);
    assert.equal((await status()).status, "FAIL", label);
  }

  await write(root, receiptPath, "{ malformed json");
  assert.equal((await status()).status, "FAIL", "malformed JSON");

  const changedConfig = JSON.parse(await readFile(path.join(root, ".project-constructor/config.json"), "utf8"));
  changedConfig.activeProfiles.push("backend-api");
  await json(root, ".project-constructor/config.json", changedConfig);
  await json(root, receiptPath, original);
  assert.equal((await status()).status, "FAIL", "changed effective profile configuration");
  await json(root, ".project-constructor/config.json", config);

  const oversized = Buffer.from(" ".repeat(256 * 1024 + 1));
  await write(root, receiptPath, oversized);
  const oversizedResult = await status();
  assert.equal(oversizedResult.status, "FAIL");
  assert.match(oversizedResult.cause, /límite de lectura/);

  const oversizedArtifactRecord = structuredClone(original);
  const oversizedArtifact = Buffer.alloc(10 * 1024 * 1024 + 1, 0x61);
  const artifact = oversizedArtifactRecord.automaticValidations[0].artifact;
  await write(root, artifact.path, oversizedArtifact);
  artifact.sha256 = hash(oversizedArtifact);
  await json(root, receiptPath, oversizedArtifactRecord);
  const oversizedArtifactResult = await status();
  assert.equal(oversizedArtifactResult.status, "FAIL");
  assert.match(oversizedArtifactResult.cause, /límite de lectura/);

  const aggregateRoot = await createHealthyFixture(t);
  const { records: aggregateRecords } = await configureTechnicalProfiles(aggregateRoot, ["ui"]);
  const aggregateReceipt = structuredClone(aggregateRecords.get("ui"));
  const aggregateItems = [
    ...aggregateReceipt.automaticValidations,
    ...aggregateReceipt.manualEvidence,
    ...aggregateReceipt.negativeCases,
  ].slice(0, 6);
  const largeArtifact = Buffer.alloc(9 * 1024 * 1024, 0x61);
  for (const [index, entry] of aggregateItems.entries()) {
    const artifactPath = `.project-os/evidence/artifacts/ui/aggregate-${index}.bin`;
    await write(aggregateRoot, artifactPath, largeArtifact);
    entry.artifact = { path: artifactPath, sha256: hash(largeArtifact) };
  }
  await json(aggregateRoot, receiptPath, aggregateReceipt);
  const aggregateReport = await collectDoctorReport({
    target: aggregateRoot,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const aggregateResult = aggregateReport.results.find((entry) => entry.id === "profile.ui");
  assert.equal(aggregateResult.status, "FAIL");
  assert.match(aggregateResult.cause, /límite de lectura/);
});

test("doctor informa FAIL para selección profundamente anidada sin perder el reporte", async (t) => {
  const root = await createHealthyFixture(t);
  await configureTechnicalProfiles(root, ["ui"]);
  const configPath = path.join(root, ".project-constructor", "config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const encoded = JSON.stringify({ ...config, activeProfiles: ["ui"] });
  const nested = '{"child":'.repeat(6_000) + "0" + "}".repeat(6_000);
  await write(root, ".project-constructor/config.json", encoded.replace(
    '"activeProfiles":["ui"]',
    `"activeProfiles":["ui",${nested}]`,
  ));

  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const profile = report.results.find((entry) => entry.id === "profile.ui");
  assert.equal(profile.status, "FAIL");
  assert.match(profile.cause, /hash seguro/);
  assert.equal(report.results.find((entry) => entry.id === "runtime.node").status, "PASS");
});

test("doctor bloquea recibos y artefactos que escapan por symlink", async (t) => {
  const root = await createHealthyFixture(t);
  const { records } = await configureTechnicalProfiles(root, ["ui"]);
  const outside = await mkdtemp(path.join(tmpdir(), "project-os-profile-evidence-outside-"));
  t.after(async () => rm(outside, { force: true, recursive: true }));
  const evidenceRoot = path.join(root, ".project-os", "evidence");
  const outsideEvidence = path.join(outside, "evidence");
  await cp(evidenceRoot, outsideEvidence, { recursive: true });
  await rm(evidenceRoot, { force: true, recursive: true });
  try {
    await symlink(outsideEvidence, evidenceRoot, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
      t.skip("La plataforma no permite crear el enlace temporal de la prueba.");
      return;
    }
    throw error;
  }

  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const entry = report.results.find((candidate) => candidate.id === "profile.ui");
  assert.equal(entry.status, "FAIL");
  assert.match(entry.cause, /fuera del repositorio/);
  assert.ok(records.has("ui"));

  const artifactRoot = await createHealthyFixture(t);
  await configureTechnicalProfiles(artifactRoot, ["ui"]);
  const internalArtifacts = path.join(artifactRoot, ".project-os", "evidence", "artifacts", "ui");
  const outsideArtifacts = path.join(outside, "artifacts");
  await cp(internalArtifacts, outsideArtifacts, { recursive: true });
  await rm(internalArtifacts, { force: true, recursive: true });
  try {
    await symlink(outsideArtifacts, internalArtifacts, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
      t.skip("La plataforma no permite crear el enlace temporal de la prueba.");
      return;
    }
    throw error;
  }
  const artifactReport = await collectDoctorReport({
    target: artifactRoot,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const artifactEntry = artifactReport.results.find((candidate) => candidate.id === "profile.ui");
  assert.equal(artifactEntry.status, "FAIL");
  assert.match(artifactEntry.cause, /fuera del repositorio/);
});

test("configuración con forma 0.5.0 sigue siendo legible y fail-closed", async (t) => {
  const root = await createHealthyFixture(t);
  const setup = await configureTechnicalProfiles(root, ["ui"], { writeReceipts: false });
  const legacyConfig = {
    schemaVersion: "1.0.0",
    stage: "environment-bootstrap",
    codeIndexable: false,
    activeProfiles: setup.activeProfiles,
    harnesses: ["codex", "claude-code", "cursor", "opencode", "github-copilot"],
    githubMode: "dry-run",
    branchStrategy: {
      status: "manual-pending",
      defaultBranch: null,
      protectedBranches: [],
      changeBranchPrefix: null,
    },
  };
  await json(root, ".project-constructor/config.json", legacyConfig);
  const legacyCatalog = {
    schemaVersion: "1.0.0",
    active: setup.activeProfiles,
    profiles: setup.canonicalCatalog.profiles.map((profile) => ({
      id: profile.id,
      active: setup.activeProfiles.includes(profile.id),
      activationRequires: profile.activationRequires,
      automaticValidations: profile.automaticValidations,
      manualEvidence: profile.manualEvidence,
      negativeCases: profile.negativeCases,
      rollback: profile.rollback,
      naConditions: profile.naConditions,
      closureGate: profile.closureGate,
      ...(profile.conditionalSignals ? { conditionalSignals: profile.conditionalSignals } : {}),
    })),
    activationPolicy: {
      implicitActivation: false,
      toolPresenceDoesNotActivateProfile: true,
      decisionArtifactRequiredForConditionalProfiles: true,
      naRequiresDeclaredConditionAndJustification: true,
    },
  };
  await json(root, ".project-os/profiles.json", legacyCatalog);

  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  assert.equal(report.results.find((entry) => entry.id === "profile.ui").status, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "profile.backend-api").status, "SKIP");
  assert.ok(!report.results.some((entry) => entry.id.startsWith("doctor.internal.")));
});

test("doctor falla ante runtime duplicado y estado de deuda corrupto sin repararlos", async (t) => {
  const root = await createHealthyFixture(t);
  await write(root, ".project-constructor/runtime/copied.mjs", "export default true;\n");
  await write(root, ".project-os/debt/registry.json", "{invalid-json\n");
  const before = await snapshot(root);

  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });

  assert.equal(
    report.results.find((entry) => entry.id === "release.identity").status,
    "FAIL",
  );
  assert.deepEqual(
    report.results.find((entry) => entry.id === "release.identity")
      .evidence.duplicateSources,
    [".project-constructor/runtime"],
  );
  assert.equal(
    report.results.find((entry) => entry.id === "debt.health").status,
    "FAIL",
  );
  assert.deepEqual(await snapshot(root), before);
});

test("Graphify activo falla MCP pero su check retirado permanece SKIP", async (t) => {
  const root = await createHealthyFixture(t, { graphify: true });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  assert.equal(report.verdict, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "mcp.configuration").status, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "code-intelligence.graphify").status, "SKIP");
});

test("un MCP opcional con enabled=false no se cuenta como activo", async (t) => {
  const root = await createHealthyFixture(t);
  await json(root, ".project-os/mcp.json", {
    servers: [
      {
        id: "graphify",
        enabled: false,
        command: "graphify",
      },
    ],
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const mcp = report.results.find((entry) => entry.id === "mcp.configuration");
  assert.equal(mcp.status, "PASS");
  assert.deepEqual(mcp.evidence.servers, []);
});

test("credenciales literales fallan sin aparecer en salidas", async (t) => {
  const root = await createHealthyFixture(t, { literalSecret: true });
  const machine = await runDoctor({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    json: true,
    env: {},
  });
  const human = await runDoctor({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    json: false,
    env: {},
  });
  assert.equal(machine.report.results.find((entry) => entry.id === "mcp.configuration").status, "FAIL");
  const literalToken = ["ghp", "_", "1234567890abcdefghijklmnop"].join("");
  assert.equal(machine.output.includes(literalToken), false);
  assert.equal(human.output.includes(literalToken), false);
});

test("doctor detecta journals incompletos leyendo el journal, no state.activeTransaction", async (t) => {
  const root = await createHealthyFixture(t);
  await json(root, ".project-constructor/transactions/tx-incomplete/journal.json", {
    id: "tx-incomplete",
    status: "applying",
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  const transactions = report.results.find((entry) => entry.id === "constructor.transactions");
  assert.equal(transactions.status, "FAIL");
  assert.deepEqual(transactions.evidence.incompleteTransactionIds, ["tx-incomplete"]);
});

test("recibos GitHub/CI con hash distinto o expirados no producen falsos PASS", async (t) => {
  const root = await createHealthyFixture(t);
  const workflow = await readFile(
    path.join(root, ".github/workflows/project-constructor.yml"),
    "utf8",
  );
  await json(root, ".project-constructor/evidence/github-project.json", {
    schemaVersion: "1.0.0",
    status: "PASS",
    configHash: "0".repeat(64),
  });
  await json(root, ".project-constructor/evidence/ci-local.json", {
    schemaVersion: "1.0.0",
    status: "PASS",
    configHash: hash(workflow.replace(/\r\n?/g, "\n")),
    expiresAt: "2000-01-01T00:00:00.000Z",
  });
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner(),
    parityChecker: healthyParity,
    env: {},
  });
  assert.equal(report.results.find((entry) => entry.id === "github.project").status, "FAIL");
  assert.equal(report.results.find((entry) => entry.id === "ci.execution").status, "FAIL");
});

test("nombres de variables en secretEnvRefs no se clasifican como secretos literales", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({ secretEnvRefs: ["GITHUB_TOKEN", "OPTIONAL_API_KEY"] }),
    false,
  );
});

test("la política canónica de secretos no se confunde con una credencial", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({
      policy: { secrets: "environment-references-only" },
    }),
    false,
  );
});

test("una asignación sensible se detecta aunque aparezca en un campo descriptivo", () => {
  assert.equal(
    doctorInternals.containsLiteralSecret({
      notes: "diagnóstico accidental token=super-secreto",
    }),
    true,
  );
  assert.equal(
    doctorInternals.containsLiteralSecret({
      notes: "referencia permitida token=${SERVICE_TOKEN}",
    }),
    false,
  );
});

test("engine efectivo acepta las líneas LTS 22/24 y rechaza EOL, no-LTS y versiones bajo el piso", () => {
  assert.equal(doctorInternals.isSupportedNode("v20.20.0"), false);
  assert.equal(doctorInternals.isSupportedNode("20.19.9"), false);
  assert.equal(doctorInternals.isSupportedNode("21.9.0"), false);
  assert.equal(doctorInternals.isSupportedNode("22.21.0"), false);
  assert.equal(doctorInternals.isSupportedNode("22.22.0"), true);
  assert.equal(doctorInternals.isSupportedNode("22.23.0"), true);
  assert.equal(doctorInternals.isSupportedNode("23.0.0"), false);
  assert.equal(doctorInternals.isSupportedNode("24.17.99"), false);
  assert.equal(doctorInternals.isSupportedNode("24.18.0"), true);
  assert.equal(doctorInternals.isSupportedNode("24.19.0"), true);
  assert.equal(doctorInternals.isSupportedNode("25.0.0"), false);
  assert.equal(doctorInternals.isSupportedNode("26.4.0"), false);
  assert.equal(doctorInternals.isSupportedNode("24.18.0-rc.1"), false);
});

test("doctor explica el EOL de Node 20 y recomienda la línea 24 al rechazarla", async (t) => {
  const root = await createHealthyFixture(t);
  const report = await collectDoctorReport({
    target: root,
    runner: healthyRunner([], { nodeVersion: "v20.20.0\n" }),
    parityChecker: healthyParity,
    env: {},
  });
  const runtime = report.results.find((entry) => entry.id === "runtime.node");
  assert.equal(runtime.status, "FAIL");
  assert.match(runtime.cause, /2026-04-30/);
  assert.match(runtime.cause, /Node 24\.18\.0\+ \(recomendado\)/);
  assert.match(runtime.remediation, /Node 22\.22\.0/);
  assert.match(runtime.remediation, /Node 24\.18\.0/);
});

test("estado desconocido se convierte en fallo interno, no WARN", () => {
  const report = createReport([
    {
      id: "probe.invalid",
      profile: "universal",
      status: "MAYBE",
      summary: "Resultado inválido",
      cause: "Probe defectuoso",
      remediation: "Corregir probe",
      evidence: {},
    },
  ]);
  assert.equal(report.verdict, "FAIL");
  assert.equal(report.results[0].status, "FAIL");
  assert.match(report.results[0].id, /^doctor\.internal\./);
});

test("reportes redactan secretos en evidencia humana y JSON", () => {
  const report = createReport([
    result({
      id: "probe.secret",
      status: "FAIL",
      summary: "Probe imprimió una credencial",
      cause: "Salida sensible",
      remediation: "Rota la credencial fuera del doctor.",
      evidence: { stdout: "Authorization: Bearer abc.def.ghi token=super-secreto" },
    }),
  ]);
  assert.doesNotMatch(formatHuman(report), /abc\.def\.ghi|super-secreto/);
  assert.doesNotMatch(formatJson(report), /abc\.def\.ghi|super-secreto/);
  assert.match(formatJson(report), /\[REDACTED\]/);
});

test("runner read-only aborta un proceso que excede timeout", { timeout: 3_000 }, async () => {
  const response = await doctorInternals.spawnReadOnly(
    {
      command: process.execPath,
      args: ["-e", "setTimeout(() => {}, 5000)"],
      timeoutMs: 30,
    },
    { cwd: process.cwd(), env: process.env },
  );
  assert.equal(response.ok, false);
  assert.equal(response.timedOut, true);
});
