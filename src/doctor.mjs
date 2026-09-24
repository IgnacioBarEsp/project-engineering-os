import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import {
  createReport,
  formatHuman,
  formatJson,
  reportExitCode,
  result,
} from "./report.mjs";
import { CONSTRUCTOR_VERSION, PACKAGE_NAME, PACKAGE_ROOT } from "./constants.mjs";
import {
  assertNoSymlinkEscape,
  normalizeRelativePath,
  resolveInside,
} from "./paths.mjs";
import {
  isSupportedNode,
  SUPPORTED_NODE_RANGE,
  supportedNodeRemediation,
  unsupportedNodeCause,
} from "./runtime-support.mjs";
import { checkState as checkDebtState } from "./debt/gates.mjs";
import { isConfigured as debtConfigured } from "./debt/store.mjs";
import {
  classifyGithubProjectReceipt,
  FRESHNESS_RECEIPT_MAX_BYTES,
} from "./freshness.mjs";
import {
  inspectLocalPackage,
  inspectLocalToolchain,
  PINNED_OPENSPEC_VERSION as OPEN_SPEC_VERSION,
  readProjectManifest,
  resolveLocalToolchain,
} from "../blueprint/core/project-constructor/toolchain.mjs";

const EVIDENCE_SCHEMA_VERSION = "1.0.0";
const TECHNICAL_PROFILES = [
  "ui",
  "backend-api",
  "auth-security",
  "data-migration-sync",
  "ai",
  "infra-deploy",
  "library-cli",
];
const TECHNICAL_PROFILE_EVIDENCE_SCHEMA_VERSION = "1.0.0";
const MAX_TECHNICAL_PROFILE_RECEIPT_BYTES = 256 * 1024;
const MAX_TECHNICAL_PROFILE_ARTIFACT_BYTES = 10 * 1024 * 1024;
const MAX_TECHNICAL_PROFILE_TOTAL_ARTIFACT_BYTES = 50 * 1024 * 1024;
const MAX_TECHNICAL_PROFILE_EVIDENCE_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const SAFE_COMMANDS = Object.freeze({
  nodeVersion: { command: process.execPath, args: ["--version"], timeoutMs: 5_000 },
  npmVersion: {
    command:
      process.platform === "win32"
        ? process.env.ComSpec ?? "C:\\Windows\\System32\\cmd.exe"
        : "npm",
    args:
      process.platform === "win32"
        ? ["/d", "/s", "/c", "npm --version"]
        : ["--version"],
    timeoutMs: 5_000,
  },
  gitVersion: { command: "git", args: ["--version"], timeoutMs: 5_000 },
  gitRoot: {
    command: "git",
    args: ["rev-parse", "--is-inside-work-tree"],
    timeoutMs: 5_000,
  },
  gitStatus: {
    command: "git",
    args: ["status", "--porcelain=v1", "--untracked-files=normal"],
    timeoutMs: 8_000,
  },
  ghVersion: { command: "gh", args: ["--version"], timeoutMs: 5_000 },
});

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizedRelative(target, absolutePath) {
  return path.relative(target, absolutePath).split(path.sep).join("/");
}

function spawnReadOnly(spec, { cwd, env = process.env } = {}) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timer;
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };
    let child;
    try {
      child = spawn(spec.command, spec.args, {
        cwd,
        env,
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
        signal: controller.signal,
      });
    } catch (error) {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr,
        error: error.code ?? error.name,
        timedOut: false,
      });
      return;
    }
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finish({
        ok: false,
        exitCode: null,
        stdout,
        stderr,
        error: error.code ?? error.name,
        timedOut: error.name === "AbortError",
      });
    });
    child.on("close", (exitCode) => {
      finish({ ok: exitCode === 0, exitCode, stdout, stderr, timedOut: false });
    });
    timer = setTimeout(() => {
      controller.abort();
    }, spec.timeoutMs);
  });
}

async function command(runner, id, cwd) {
  const spec = SAFE_COMMANDS[id];
  if (!spec) {
    throw new Error(`Probe fuera de allowlist: ${id}`);
  }
  return runner(spec, { cwd, id });
}

function installedStateEntries(state) {
  if (Array.isArray(state?.files)) return state.files;
  if (Array.isArray(state?.entries)) return state.entries;
  if (state?.files && typeof state.files === "object") {
    return Object.entries(state.files).map(([target, metadata]) => ({ target, ...metadata }));
  }
  return [];
}

async function checkInstalledHashes(target, state) {
  const mismatches = [];
  const checked = [];
  for (const entry of installedStateEntries(state)) {
    const relative = entry.target ?? entry.path;
    const expected = entry.hash ?? entry.sha256 ?? entry.renderedHash;
    if (!relative || !expected || entry.owner !== "constructor") {
      continue;
    }
    const absolute = path.resolve(target, relative);
    try {
      const content = await readFile(absolute);
      checked.push(relative.split("\\").join("/"));
      if (sha256(content) !== expected) {
        mismatches.push(relative.split("\\").join("/"));
      }
    } catch {
      mismatches.push(relative.split("\\").join("/"));
    }
  }
  return { checked: checked.sort(), mismatches: mismatches.sort() };
}

async function checkHarnessPlan(target) {
  const { runBootstrapOrSync } = await import("./commands.mjs");
  return runBootstrapOrSync({
    targetRoot: target,
    command: "sync",
    check: true,
  });
}

function mcpServers(config) {
  if (Array.isArray(config?.servers)) return config.servers;
  if (config?.servers && typeof config.servers === "object") {
    return Object.entries(config.servers).map(([id, server]) => ({ id, ...server }));
  }
  return [];
}

function containsLiteralSecret(value, key = "") {
  if (Array.isArray(value)) return value.some((entry) => containsLiteralSecret(entry, key));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([childKey, child]) => containsLiteralSecret(child, childKey));
  }
  if (typeof value !== "string") return false;
  if (/\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|gh[pousr]_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{12,})\b/i.test(value)) {
    return true;
  }
  const assignment = value.match(
    /\b(?:api[_-]?key|password|secret|token|credential)\s*[=:]\s*([^\s,;]+)/i,
  );
  if (
    assignment
    && !/^(\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(assignment[1])
  ) {
    return true;
  }
  if (!/(?:token|password|secret|api.?key)/i.test(key)) return false;
  if (/envRefs?$/i.test(key) && /^[A-Z][A-Z0-9_]*$/.test(value)) return false;
  if (key === "secrets" && value === "environment-references-only") return false;
  return !/^(\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/.test(value);
}

async function readFirstJson(target, candidates) {
  for (const relative of candidates) {
    const value = await readJson(path.join(target, relative));
    if (value) return { value, relative };
  }
  return { value: null, relative: candidates[0] };
}

function activeProfiles(config, profileCatalog) {
  const active =
    config?.activeProfiles ??
    profileCatalog?.active ??
    profileCatalog?.profiles?.filter((profile) => profile.active).map((profile) => profile.id) ??
    [];
  return new Set(active);
}

function jsonObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, keys) {
  return jsonObject(value)
    && Object.keys(value).length === keys.length
    && keys.every((key) => Object.hasOwn(value, key));
}

function requiredProfileItems(definition, key) {
  const items = definition?.[key];
  if (
    !Array.isArray(items)
    || items.length === 0
    || items.some((item) => typeof item !== "string" || item.trim() === "")
    || new Set(items).size !== items.length
  ) {
    return null;
  }
  return items;
}

function technicalProfileConfigProjection(profileId, config, profileCatalog, catalogPath, active) {
  const catalogEntries = Array.isArray(profileCatalog?.profiles)
    ? profileCatalog.profiles
    : [];
  const catalogEntry = catalogEntries.find((entry) => entry?.id === profileId);
  const catalogActive = Array.isArray(profileCatalog?.active)
    ? [...profileCatalog.active].sort()
    : profileCatalog?.profiles
      ? catalogEntries.filter((entry) => entry?.active === true).map((entry) => entry.id).sort()
      : null;
  return {
    profileId,
    activeProfiles: [...active].sort(),
    configuredActiveProfiles: Array.isArray(config?.activeProfiles)
      ? [...config.activeProfiles].sort()
      : config?.activeProfiles ?? null,
    catalogPath,
    catalogActiveProfiles: catalogActive,
    profileDecision: catalogEntry
      ? {
        id: catalogEntry.id,
        active: catalogEntry.active ?? null,
        activationDecision: catalogEntry.activationDecision ?? null,
      }
      : null,
  };
}

function canonicalTimestamp(value) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString() === value ? timestamp : null;
}

function technicalEvidenceReadCause(error) {
  if (error?.code === "PATH_TRAVERSAL") return "La ruta intenta salir de la raíz del repositorio.";
  if (error?.code === "PATH_INVALID") return "La ruta no es relativa o no usa una forma admitida.";
  if (error?.code === "SYMLINK_ESCAPE") return "La ruta apunta fuera del repositorio mediante un enlace.";
  if (error?.code === "EVIDENCE_SIZE_LIMIT") return "El registro o un artefacto excede el límite de lectura.";
  if (error?.code === "EVIDENCE_NOT_REGULAR") return "La referencia no es un archivo regular.";
  return "El registro o uno de sus artefactos no se pudo leer de forma segura.";
}

async function readBoundedRootFile(target, relativePath, maxBytes, label) {
  const normalized = normalizeRelativePath(relativePath, label);
  if (normalized !== relativePath) {
    const error = new Error("La ruta debe usar una forma relativa canónica.");
    error.code = "PATH_TRAVERSAL";
    throw error;
  }
  await assertNoSymlinkEscape(target, normalized);
  const absolutePath = resolveInside(target, normalized, label);
  let metadata;
  try {
    metadata = await stat(absolutePath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  if (!metadata.isFile()) {
    const error = new Error("La referencia no es un archivo regular.");
    error.code = "EVIDENCE_NOT_REGULAR";
    throw error;
  }
  if (metadata.size > maxBytes) {
    const error = new Error("El archivo excede el límite de lectura.");
    error.code = "EVIDENCE_SIZE_LIMIT";
    throw error;
  }
  const content = await readFile(absolutePath);
  if (content.byteLength > maxBytes) {
    const error = new Error("El archivo excede el límite de lectura.");
    error.code = "EVIDENCE_SIZE_LIMIT";
    throw error;
  }
  return content;
}

async function verifyTechnicalProfileEvidence({
  target,
  profileId,
  config,
  profileCatalog,
  catalogPath,
  active,
  canonicalDefinition,
}) {
  const relative = `.project-os/evidence/technical-profile-${profileId}.json`;
  const invalid = (cause, extra = {}) => ({ state: "invalid", relative, cause, ...extra });
  if (!canonicalDefinition) {
    return invalid("Falta la definición canónica empaquetada del perfil.");
  }
  const automatic = requiredProfileItems(canonicalDefinition, "automaticValidations");
  const manual = requiredProfileItems(canonicalDefinition, "manualEvidence");
  const negative = requiredProfileItems(canonicalDefinition, "negativeCases");
  if (
    !automatic
    || !manual
    || !negative
    || typeof canonicalDefinition.rollback !== "string"
    || canonicalDefinition.rollback.trim() === ""
    || typeof canonicalDefinition.closureGate !== "string"
    || canonicalDefinition.closureGate.trim() === ""
  ) {
    return invalid("La definición canónica no contiene requisitos de perfil válidos.");
  }

  let bytes;
  try {
    bytes = await readBoundedRootFile(
      target,
      relative,
      MAX_TECHNICAL_PROFILE_RECEIPT_BYTES,
      "recibo de perfil técnico",
    );
  } catch (error) {
    return invalid(technicalEvidenceReadCause(error));
  }
  if (bytes === null) return { state: "missing", relative };

  let receipt;
  try {
    receipt = JSON.parse(bytes.toString("utf8"));
  } catch {
    return invalid("El registro no contiene JSON válido.");
  }
  const receiptKeys = [
    "schemaVersion",
    "profileId",
    "configHash",
    "profileHash",
    "issuedAt",
    "expiresAt",
    "automaticValidations",
    "manualEvidence",
    "negativeCases",
    "rollback",
    "closureGate",
  ];
  if (!hasExactKeys(receipt, receiptKeys)) {
    return invalid("El registro no coincide con el contrato fijo de evidencia.");
  }
  if (receipt.schemaVersion !== TECHNICAL_PROFILE_EVIDENCE_SCHEMA_VERSION) {
    return invalid(`schemaVersion debe ser ${TECHNICAL_PROFILE_EVIDENCE_SCHEMA_VERSION}.`);
  }
  if (receipt.profileId !== profileId) {
    return invalid("El registro pertenece a otro perfil técnico.");
  }

  let configHash;
  try {
    configHash = sha256(`${stableJson(technicalProfileConfigProjection(
      profileId,
      config,
      profileCatalog,
      catalogPath,
      active,
    ))}\n`);
  } catch {
    return invalid("No se pudo calcular un hash seguro para la selección actual del perfil.");
  }
  const profileHash = sha256(`${stableJson(canonicalDefinition)}\n`);
  if (!/^[a-f0-9]{64}$/.test(receipt.configHash) || receipt.configHash !== configHash) {
    return invalid("El hash de configuración de perfil no coincide con la selección actual.");
  }
  if (!/^[a-f0-9]{64}$/.test(receipt.profileHash) || receipt.profileHash !== profileHash) {
    return invalid("El hash de definición no coincide con el catálogo empaquetado.");
  }

  const issuedAt = canonicalTimestamp(receipt.issuedAt);
  const expiresAt = canonicalTimestamp(receipt.expiresAt);
  const now = Date.now();
  if (
    issuedAt === null
    || expiresAt === null
    || issuedAt > now
    || expiresAt <= now
    || expiresAt <= issuedAt
    || expiresAt - issuedAt > MAX_TECHNICAL_PROFILE_EVIDENCE_AGE_MS
  ) {
    return invalid("La ventana de vigencia debe ser UTC canónica, no futura y durar como máximo 30 días.");
  }

  const artifactCache = new Map();
  let totalArtifactBytes = 0;
  const references = [];
  const verifyArtifact = async (artifact) => {
    if (!hasExactKeys(artifact, ["path", "sha256"])) {
      return { error: "La referencia del artefacto no coincide con el contrato fijo." };
    }
    if (typeof artifact.path !== "string" || artifact.path.trim() === "") {
      return { error: "La ruta de un artefacto está vacía o no es válida." };
    }
    if (artifact.path.length > 2048) {
      return { error: "La ruta de un artefacto excede el máximo de 2048 caracteres." };
    }
    if (typeof artifact.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(artifact.sha256)) {
      return { error: "Un artefacto no declara SHA-256 válido." };
    }
    let normalized;
    try {
      normalized = normalizeRelativePath(artifact.path, "artefacto de perfil");
    } catch (error) {
      return { error: technicalEvidenceReadCause(error) };
    }
    if (normalized !== artifact.path) {
      return { error: "La ruta del artefacto no usa una forma relativa canónica." };
    }
    let artifactBytes = artifactCache.get(normalized);
    if (!artifactBytes) {
      try {
        const remaining = MAX_TECHNICAL_PROFILE_TOTAL_ARTIFACT_BYTES - totalArtifactBytes;
        if (remaining <= 0) return { error: "El total de artefactos supera el límite de lectura." };
        artifactBytes = await readBoundedRootFile(
          target,
          normalized,
          Math.min(MAX_TECHNICAL_PROFILE_ARTIFACT_BYTES, remaining),
          "artefacto de perfil",
        );
      } catch (error) {
        return { error: technicalEvidenceReadCause(error) };
      }
      if (artifactBytes === null) return { error: "Falta un artefacto referenciado." };
      totalArtifactBytes += artifactBytes.byteLength;
      artifactCache.set(normalized, artifactBytes);
    }
    if (sha256(artifactBytes) !== artifact.sha256) {
      return { error: "El SHA-256 de un artefacto no coincide con sus bytes actuales." };
    }
    references.push(normalized);
    return { path: normalized };
  };

  const verifyList = async (key, expected) => {
    const entries = receipt[key];
    if (!Array.isArray(entries) || entries.length > expected.length) {
      return { error: `La lista ${key} falta o contiene elementos fuera del catálogo.` };
    }
    const expectedIds = new Set(expected);
    const seen = new Set();
    for (const entry of entries) {
      if (
        !hasExactKeys(entry, ["id", "status", "artifact"])
        || typeof entry.id !== "string"
        || entry.id.length > 512
      ) {
        return { error: `Un elemento de ${key} no coincide con el contrato fijo.` };
      }
      if (!expectedIds.has(entry.id)) return { error: `La lista ${key} contiene un elemento desconocido.` };
      if (seen.has(entry.id)) return { error: `La lista ${key} contiene evidencia duplicada.` };
      seen.add(entry.id);
      if (entry.status !== "PASS") return { error: `El elemento ${key} no declara PASS.` };
      const artifact = await verifyArtifact(entry.artifact);
      if (artifact.error) return { error: `${key}: ${artifact.error}` };
    }
    const missing = expected.filter((id) => !seen.has(id));
    if (missing.length > 0) {
      return { error: `Falta evidencia requerida en ${key}: ${missing.join(", ")}.`, missing };
    }
    return {};
  };

  for (const [key, expected] of [
    ["automaticValidations", automatic],
    ["manualEvidence", manual],
    ["negativeCases", negative],
  ]) {
    const checked = await verifyList(key, expected);
    if (checked.error) return invalid(checked.error, checked.missing ? { missing: checked.missing } : {});
  }
  for (const key of ["rollback", "closureGate"]) {
    const entry = receipt[key];
    if (!hasExactKeys(entry, ["status", "artifact"]) || entry.status !== "PASS") {
      return invalid(`La evidencia de ${key} debe declarar PASS con una referencia válida.`);
    }
    const artifact = await verifyArtifact(entry.artifact);
    if (artifact.error) return invalid(`${key}: ${artifact.error}`);
  }
  return {
    state: "valid",
    relative,
    configHash,
    profileHash,
    artifacts: [...new Set(references)],
    evidenceCounts: {
      automaticValidations: automatic.length,
      manualEvidence: manual.length,
      negativeCases: negative.length,
      rollback: 1,
      closureGate: 1,
    },
  };
}

async function evidenceReceipt(target, name, expectedConfigHash, { maxBytes, canonicalOnly = false } = {}) {
  const candidates = [`.project-os/evidence/${name}.json`];
  if (!canonicalOnly) candidates.push(`.project-constructor/evidence/${name}.json`);
  let relative = candidates[0];
  for (const candidate of candidates) {
    if (await exists(path.join(target, candidate))) { relative = candidate; break; }
  }
  let receipt;
  if (maxBytes !== undefined) {
    try {
      const bytes = await readBoundedRootFile(target, relative, maxBytes, `recibo ${name}`);
      if (bytes === null) return { state: "missing", relative };
      receipt = JSON.parse(bytes.toString("utf8"));
    } catch (error) {
      return {
        state: "invalid",
        relative,
        cause: technicalEvidenceReadCause(error) ?? "El recibo no contiene JSON legible.",
      };
    }
  } else {
    receipt = await readJson(path.join(target, relative));
  }
  if (!receipt) {
    if (await exists(path.join(target, relative))) return { state: 'invalid', relative, cause: 'El recibo no contiene JSON legible.' };
    return { state: "missing", relative };
  }
  if (receipt.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    return {
      state: "invalid",
      relative,
      cause: `schemaVersion debe ser ${EVIDENCE_SCHEMA_VERSION}.`,
    };
  }
  if (receipt.configHash !== expectedConfigHash) {
    return { state: "invalid", relative, cause: "El hash de configuración no coincide." };
  }
  if (receipt.expiresAt) {
    const expiresAt = Date.parse(receipt.expiresAt);
    if (!Number.isFinite(expiresAt)) {
      return { state: "invalid", relative, cause: "expiresAt no contiene una fecha válida." };
    }
    if (expiresAt <= Date.now()) {
      return { state: "invalid", relative, cause: "La evidencia está vencida." };
    }
  }
  if (receipt.status !== "PASS") {
    return { state: "invalid", relative, cause: "La evidencia no contiene un PASS explícito." };
  }
  return { state: "valid", relative, ...(maxBytes === undefined ? {} : { document: receipt }) };
}

function receiptResult({
  id,
  profile,
  label,
  receipt,
  missingStatus = "SKIP",
}) {
  if (receipt.state === "valid") {
    return result({
      id,
      profile,
      status: "PASS",
      summary: `${label} demostrado por evidencia vigente`,
      cause: "El recibo coincide con la configuración actual y declara PASS.",
      remediation: "Renueva el smoke opt-in cuando cambie la configuración o venza la evidencia.",
      evidence: { receipt: receipt.relative },
    });
  }
  if (receipt.state === "invalid") {
    return result({
      id,
      profile,
      status: "FAIL",
      summary: `${label} tiene evidencia inválida`,
      cause: receipt.cause,
      remediation: "Ejecuta manualmente el smoke read-only separado y aporta un recibo vigente y redactado.",
      evidence: { receipt: receipt.relative },
    });
  }
  return result({
    id,
    profile,
    status: missingStatus,
    summary: `${label} no ejecutado por el doctor`,
    cause: "No existe evidencia opt-in vigente; la configuración por sí sola no prueba operación.",
    remediation: "Usa el runbook para ejecutar el smoke read-only separado y guardar su recibo redactado.",
    evidence: { expectedReceipt: receipt.relative },
  });
}

async function inspectTransactionJournals(target) {
  const relativeRoot = ".project-constructor/transactions";
  const absoluteRoot = path.join(target, relativeRoot);
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { corrupt: [], incomplete: [], journalCount: 0 };
    }
    return {
      corrupt: [`${relativeRoot}: unreadable`],
      incomplete: [],
      journalCount: 0,
    };
  }

  const corrupt = [];
  const incomplete = [];
  let journalCount = 0;
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory()) continue;
    const relative = `${relativeRoot}/${entry.name}/journal.json`;
    const journal = await readJson(path.join(target, relative));
    journalCount += 1;
    if (
      !journal
      || journal.id !== entry.name
      || typeof journal.status !== "string"
    ) {
      corrupt.push(relative);
      continue;
    }
    if (["applying", "failed", "rolling-back"].includes(journal.status)) {
      incomplete.push(journal.id);
      continue;
    }
    if (!["completed", "rolled-back"].includes(journal.status)) {
      corrupt.push(relative);
    }
  }
  return {
    corrupt: corrupt.sort(),
    incomplete: incomplete.sort(),
    journalCount,
  };
}

export async function collectDoctorReport({
  target,
  env = process.env,
  runner = spawnReadOnly,
  parityChecker = checkHarnessPlan,
} = {}) {
  if (!target) throw new TypeError("doctor requiere target");
  const root = path.resolve(target);
  const results = [];

  const nodeResponse = await command(runner, "nodeVersion", root);
  const nodeVersion = nodeResponse.stdout.trim();
  results.push(
    result({
      id: "runtime.node",
      status: nodeResponse.ok && isSupportedNode(nodeVersion) ? "PASS" : "FAIL",
      summary: "Runtime Node compatible con el núcleo",
      cause:
        nodeResponse.ok && isSupportedNode(nodeVersion)
          ? `Node ${nodeVersion} satisface ${SUPPORTED_NODE_RANGE}.`
          : nodeResponse.ok
            ? unsupportedNodeCause(nodeVersion)
            : `Node no está disponible. ${unsupportedNodeCause('desconocido')}`,
      remediation: supportedNodeRemediation(),
      evidence: { version: nodeVersion || "no disponible" },
    }),
  );

  const npmResponse = await command(runner, "npmVersion", root);
  results.push(
    result({
      id: "runtime.package-manager",
      status: npmResponse.ok ? "PASS" : "FAIL",
      summary: "Package manager npm disponible",
      cause: npmResponse.ok ? "npm respondió al probe de versión." : "npm no respondió al probe read-only.",
      remediation: "Restaura npm desde la misma distribución de Node; no uses el doctor para instalarlo.",
      evidence: { version: npmResponse.stdout.trim() || "no disponible" },
    }),
  );

  let rootPackage;
  try { rootPackage = readProjectManifest(root); }
  catch { rootPackage = null; }
  const governance = await readJson(path.join(root, '.project-os/repository-governance.json'));
  const upstream = governance?.repositoryKind === 'upstream' && rootPackage?.name === PACKAGE_NAME;
  let location, packageJson, packageLock, toolchainError;
  try {
    location = resolveLocalToolchain(root);
    ({ manifest: packageJson, lockfile: packageLock } = inspectLocalToolchain(location));
  } catch (error) { toolchainError = error.message; }
  const inspectEngineeringPackage = (name, version) => {
    if (toolchainError) return { ok: false, reasons: [toolchainError] };
    try { return inspectLocalPackage(location, name, version); }
    catch (error) { return { ok: false, reasons: [error.message] }; }
  };
  const lockMatchesPackage =
    packageJson &&
    packageLock &&
    packageJson.name === packageLock.name &&
    Number.isInteger(packageLock.lockfileVersion);
  results.push(
    result({
      id: "dependencies.lockfile",
      status: lockMatchesPackage ? "PASS" : "FAIL",
      summary: "Lockfile reproducible presente",
      cause: lockMatchesPackage
        ? `package-lock.json lockfileVersion ${packageLock.lockfileVersion} corresponde al paquete.`
        : toolchainError ?? "Falta package.json/package-lock.json coherente en la ubicación seleccionada.",
      remediation: "Revisa toolchainRoot; restaura el lockfile y ejecuta npm ci en esa ubicación fuera del doctor.",
      evidence: { lockfileVersion: packageLock?.lockfileVersion ?? "ausente", location: location?.relative ?? "inválida" },
    }),
  );

  const gitRoot = await command(runner, "gitRoot", root);
  results.push(
    result({
      id: "git.repository",
      status: gitRoot.ok && gitRoot.stdout.trim() === "true" ? "PASS" : "FAIL",
      summary: "Destino bajo control de Git",
      cause:
        gitRoot.ok && gitRoot.stdout.trim() === "true"
          ? "git rev-parse confirmó el repositorio."
          : "El destino no es un repositorio Git válido.",
      remediation: "Inicializa o restaura Git manualmente antes del bootstrap.",
      evidence: { isWorkTree: gitRoot.stdout.trim() === "true" },
    }),
  );
  const gitStatus = await command(runner, "gitStatus", root);
  const changedPaths = gitStatus.ok
    ? gitStatus.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => line.slice(3).split("\\").join("/"))
        .sort()
    : [];
  results.push(
    result({
      id: "git.working-tree",
      status: !gitStatus.ok ? "FAIL" : changedPaths.length === 0 ? "PASS" : "WARN",
      summary: changedPaths.length === 0 ? "Working tree clasificado y limpio" : "Working tree contiene cambios",
      cause: !gitStatus.ok
        ? "Git no pudo clasificar el working tree."
        : changedPaths.length === 0
          ? "No hay cambios reportados por Git."
          : "Los cambios deben clasificarse antes de iniciar un change que se superponga.",
      remediation: "Conserva, aísla o registra los cambios manualmente; el doctor no limpia ni revierte archivos.",
      evidence: { paths: changedPaths },
    }),
  );

  const openSpec = inspectEngineeringPackage("@fission-ai/openspec", OPEN_SPEC_VERSION);
  const openSpecHealthy = openSpec.ok;
  results.push(
    result({
      id: "sdd.openspec-local",
      status: openSpecHealthy ? "PASS" : "FAIL",
      summary: "OpenSpec local fijado y resuelto",
      cause: openSpecHealthy
        ? `Manifiesto, lockfile, instalación y entrada local resuelven OpenSpec ${OPEN_SPEC_VERSION} en ${location.relative}.`
        : `OpenSpec local exacto no está demostrado: ${openSpec.reasons.join('; ')}.`,
      remediation: `Revisa toolchainRoot; restaura @fission-ai/openspec ${OPEN_SPEC_VERSION} y ejecuta npm ci en esa ubicación, nunca un fallback global o @latest.`,
      evidence: {
        manifest: openSpec.declared ?? "ausente",
        lockfile: openSpec.locked ?? "ausente",
        installed: openSpec.installed?.version ?? "ausente",
        entryPresent: openSpec.entryPresent ?? false,
        location: location?.relative ?? "inválida",
      },
    }),
  );

  const state = await readJson(path.join(root, ".project-constructor", "state.json"));
  const core = inspectEngineeringPackage(PACKAGE_NAME, CONSTRUCTOR_VERSION);
  const duplicateSources = [];
  for (const relative of [
    ".project-constructor/runtime",
    "tools/project-constructor",
    "tools/debt-control",
  ]) {
    if (await exists(path.join(root, relative))) duplicateSources.push(relative);
  }
  const releaseHealthy =
    state?.packageName === PACKAGE_NAME
    && state?.packageVersion === CONSTRUCTOR_VERSION
    && core.ok
    && duplicateSources.length === 0;
  results.push(
    result({
      id: "release.identity",
      profile: "harness-tooling",
      status: releaseHealthy ? "PASS" : "FAIL",
      summary: releaseHealthy
        ? "Release exacta instalada sin source duplicado"
        : "La identidad del paquete no coincide o existe un runtime duplicado",
      cause: releaseHealthy
        ? `${PACKAGE_NAME}@${CONSTRUCTOR_VERSION} coincide en state, manifest, lockfile, instalación y entrada local en ${location.relative}.`
        : `State, manifest, lockfile, instalación y entrada local deben fijar la misma release. ${core.reasons.join('; ')}`,
      remediation:
        `Revisa toolchainRoot; fija ${PACKAGE_NAME}@${CONSTRUCTOR_VERSION}, ejecuta npm ci en esa ubicación fuera del doctor y retira copias solo mediante un upgrade/PR reversible.`,
      evidence: {
        declared: core.declared ?? "ausente",
        installed: core.installed?.version ?? "ausente",
        locked: core.locked ?? "ausente",
        entryPresent: core.entryPresent ?? false,
        location: location?.relative ?? "inválida",
        stateName: state?.packageName ?? "ausente",
        stateVersion: state?.packageVersion ?? "ausente",
        duplicateSources,
      },
    }),
  );

  let debtState;
  try {
    debtState = checkDebtState({ root });
  } catch (error) {
    debtState = { internalError: error instanceof Error ? error.message : String(error) };
  }
  const debtFailures = debtState?.checks?.filter(
    (entry) => entry.status === "FAIL" && !entry.id.startsWith("plan-"),
  ) ?? [];
  const pausedPlans = debtState?.evaluation?.pausedPlans ?? [];
  const debtHealthy = !debtState?.internalError && debtFailures.length === 0;
  results.push(
    result({
      id: "debt.health",
      profile: "harness-tooling",
      status: !debtHealthy ? "FAIL" : !debtConfigured(root) ? "SKIP" : pausedPlans.length > 0 ? "WARN" : "PASS",
      summary: !debtHealthy
        ? "El estado local de deuda es inválido o incompleto"
        : !debtConfigured(root) ? "El motor de deuda no está configurado"
        : pausedPlans.length > 0
          ? "El registro es válido y contiene planes pausados"
          : "El registro de deuda es válido",
      cause: !debtConfigured(root) ? "El motor de deuda no está configurado; no se ha verificado salud de deuda." : debtState?.internalError
        ?? (debtFailures.length > 0
          ? debtFailures.map((entry) => entry.summary).join("; ")
          : pausedPlans.length > 0
            ? `Pausas gobernadas: ${pausedPlans.join(", ")}.`
            : "Policy, registry y assessments son coherentes; el check fue read-only."),
      remediation: !debtHealthy
        ? "Ejecuta project-os debt check --json y corrige o restaura el estado; el doctor no captura ni repara."
        : pausedPlans.length > 0
          ? "Usa project-os debt handoff para ejecutar el saneamiento trazable."
          : "Ninguna.",
      evidence: {
        failedChecks: debtFailures.map((entry) => entry.id),
        pausedPlans,
      },
    }),
  );
  const debtGithubMode = debtState?.config?.github?.mode ?? "unconfigured";
  results.push(
    result({
      id: "debt.github",
      profile: "harness-tooling",
      status: debtGithubMode === "off" ? "SKIP" : debtHealthy ? "WARN" : "FAIL",
      summary: debtGithubMode === "off"
        ? "Sincronización GitHub de deuda desactivada"
        : "El doctor no ejecuta sincronización GitHub",
      cause: debtGithubMode === "off"
        ? "La política local declara github.mode=off."
        : `Modo configurado: ${debtGithubMode}; configuración no demuestra autenticación ni sync.`,
      remediation: debtGithubMode === "off"
        ? "Ninguna; cambia la política mediante una decisión del consumidor si necesita integración."
        : "Ejecuta project-os debt sync de forma explícita y aporta evidencia; el doctor no autentica ni crea issues.",
      evidence: { mode: debtGithubMode },
    }),
  );
  const stateHashes = state ? await checkInstalledHashes(root, state) : { checked: [], mismatches: ["state.json"] };
  let parity;
  let parityError = null;
  try {
    parity = await parityChecker(root);
  } catch (error) {
    parityError = error instanceof Error ? error.message : String(error);
  }
  const parityHealthy =
    parityError === null &&
    parity?.exitCode === 0 &&
    parity?.plan?.hasDrift === false &&
    stateHashes.checked.length > 0 &&
    stateHashes.mismatches.length === 0;
  results.push(
    result({
      id: "harness.parity",
      profile: "harness-tooling",
      status: parityHealthy ? "PASS" : "FAIL",
      summary: "Fuente canónica y espejos administrados están en paridad",
      cause: parityHealthy
        ? "El plan read-only produjo cero drift y los hashes constructor-owned coinciden."
        : parityError ?? "Falta estado comprobable, el plan detectó drift o un hash administrado no coincide.",
      remediation: "Ejecuta project-constructor sync --check para obtener el diff; resuelve fuentes o colisiones y después ejecuta sync explícitamente.",
      evidence: {
        checked: stateHashes.checked,
        mismatches: stateHashes.mismatches,
        planSummary: parity?.plan?.summary ?? "no disponible",
      },
    }),
  );

  const profileData = await readFirstJson(root, [
    ".project-os/profiles.json",
    ".project-os/profiles/catalog.json",
  ]);
  const config = location?.configuration ?? null;
  const active = activeProfiles(config, profileData.value);
  const canonicalProfileCatalog = await readJson(
    path.join(PACKAGE_ROOT, "blueprint/core/project-os/profiles.json"),
  );
  const canonicalProfiles = new Map(
    (Array.isArray(canonicalProfileCatalog?.profiles) ? canonicalProfileCatalog.profiles : [])
      .map((profile) => [profile?.id, profile]),
  );
  for (const profile of TECHNICAL_PROFILES) {
    if (!active.has(profile)) {
      results.push(result({
        id: `profile.${profile}`,
        profile,
        status: "SKIP",
        summary: `Perfil ${profile} inactivo antes del discovery`,
        cause: "El perfil requiere una decisión posterior al discovery.",
        remediation: "No actives el perfil hasta aprobar discovery, ADR, validaciones, casos negativos y rollback.",
        evidence: { active: false, catalog: profileData.relative },
      }));
      continue;
    }

    const evidence = await verifyTechnicalProfileEvidence({
      target: root,
      profileId: profile,
      config,
      profileCatalog: profileData.value,
      catalogPath: profileData.relative,
      active,
      canonicalDefinition: canonicalProfiles.get(profile),
    });
    const valid = evidence.state === "valid";
    results.push(result({
      id: `profile.${profile}`,
      profile,
      status: valid ? "PASS" : "FAIL",
      summary: valid
        ? `Perfil ${profile} activo con expediente de evidencia íntegro`
        : evidence.state === "missing"
          ? `Perfil ${profile} activo sin expediente de evidencia`
          : `Perfil ${profile} activo con evidencia inválida`,
      cause: valid
        ? "El doctor verificó catálogo, selección, vigencia y hashes; no ejecutó ni autenticó las pruebas o revisiones del consumidor."
        : evidence.state === "missing"
          ? `No existe el recibo esperado ${evidence.relative}.`
          : evidence.cause,
      remediation: valid
        ? "Ninguna. Renueva el expediente cuando cambien los requisitos o expire; conserva evidencia independiente de las pruebas."
        : "Completa el recibo del perfil según el schema empaquetado, vuelve a producir sus artefactos y calcula hashes actuales; no desactives el perfil para ocultar el bloqueo.",
      evidence: valid
        ? {
          active: true,
          catalog: profileData.relative,
          receipt: evidence.relative,
          configHash: evidence.configHash,
          profileHash: evidence.profileHash,
          evidenceCounts: evidence.evidenceCounts,
          artifacts: evidence.artifacts,
          verification: "integrity-and-completeness-only",
        }
        : {
          active: true,
          catalog: profileData.relative,
          expectedReceipt: evidence.relative,
          ...(evidence.missing ? { missing: evidence.missing } : {}),
        },
    }));
  }

  const mcpData = await readFirstJson(root, [".project-os/mcp.json", ".project-os/mcp/servers.json"]);
  const servers = mcpServers(mcpData.value);
  const activeMcp = servers.filter(
    (server) => server.enabled !== false && server.active !== false,
  );
  const graphifyConfigured = activeMcp.some((server) => /graphify/i.test(server.id ?? server.name ?? ""));
  const literalSecret = containsLiteralSecret(mcpData.value);
  const mcpConfigHash = mcpData.value ? sha256(`${stableJson(mcpData.value)}\n`) : "missing";
  results.push(
    result({
      id: "mcp.configuration",
      profile: "harness-tooling",
      status: !mcpData.value || graphifyConfigured || literalSecret ? "FAIL" : "PASS",
      summary: "Configuración MCP estructurada",
      cause: !mcpData.value
        ? "No existe configuración MCP canónica."
        : graphifyConfigured
          ? "Graphify aparece como MCP activo aunque está retirado del runtime."
          : literalSecret
            ? "La configuración contiene una credencial literal."
            : "Los servidores se obtuvieron del schema canónico sin secretos literales.",
      remediation: "Corrige .project-os/mcp.json; usa referencias de entorno y mantén Graphify fuera del MCP activo.",
      evidence: { source: mcpData.relative, servers: activeMcp.map((server) => server.id ?? server.name).sort() },
    }),
  );
  for (const signal of [
    ["mcp.startup", "mcp-startup", "Startup/handshake MCP"],
    ["mcp.tools-list", "mcp-tools", "Listado de herramientas MCP"],
    ["mcp.auth-smoke", "mcp-smoke", "Smoke autenticado MCP"],
  ]) {
    results.push(
      receiptResult({
        id: signal[0],
        profile: "harness-tooling",
        label: signal[2],
        receipt: await evidenceReceipt(root, signal[1], mcpConfigHash),
      }),
    );
  }

  const codeIndexable = config?.codeIndexable === true;
  for (const tool of ["gitnexus", "codegraph"]) {
    if (codeIndexable) {
      const name = `code-intelligence-${tool}`;
      const receipt = await evidenceReceipt(root, name, sha256(stableJson(config)));
      const source = await readJson(path.join(root, receipt.relative));
      const issued = Date.parse(source?.issuedAt);
      const expires = Date.parse(source?.expiresAt);
      const now = Date.now();
      if (receipt.state === "valid" && (source?.optIn !== true || !Number.isFinite(issued)
        || !Number.isFinite(expires) || issued > now || now - issued > 30 * 86400000
        || expires <= issued || expires - issued > 30 * 86400000)) {
        receipt.state = "invalid";
        receipt.cause = "El recibo estructural exige optIn=true y una ventana issuedAt/expiresAt vigente de hasta 30 días.";
      }
      results.push(receiptResult({ id: `code-intelligence.${tool}`, profile: "harness-tooling",
        label: tool, receipt, missingStatus: "FAIL" }));
      continue;
    }
    results.push(
      result({
        id: `code-intelligence.${tool}`,
        profile: "harness-tooling",
        status: codeIndexable ? "FAIL" : "SKIP",
        summary: codeIndexable
          ? `${tool} requerido pero no demostrado por Ola 0`
          : `${tool} no está habilitado por la política de indexación`,
        cause: codeIndexable
          ? "El perfil declara código indexable y no existe evidencia estructural vigente."
          : "codeIndexable no está activado; esto no afirma que falte código fuente.",
        remediation: codeIndexable
          ? `Ejecuta el smoke read-only separado de ${tool}; no reindexes ni repares desde el doctor.`
          : "Activa el check solo cuando exista código y una política de indexación aprobada.",
        evidence: { codeIndexable },
      }),
    );
  }
  results.push(
    result({
      id: "code-intelligence.graphify",
      profile: "harness-tooling",
      status: "SKIP",
      summary: "Graphify retirado del runtime activo",
      cause: "retirado/manual",
      remediation: "Ninguna; auditoría opcional fuera del bootstrap con instalación y rebuild explícitos.",
      evidence: { active: false },
    }),
  );

  const ghVersion = await command(runner, "ghVersion", root);
  results.push(
    result({
      id: "github.cli",
      status: ghVersion.ok ? "PASS" : "WARN",
      summary: ghVersion.ok ? "GitHub CLI disponible" : "GitHub CLI no disponible",
      cause: ghVersion.ok
        ? "gh respondió al probe local de versión."
        : "El bootstrap local funciona, pero la preparación remota requerirá instalación manual.",
      remediation: "Instala y autentica GitHub CLI manualmente antes de aplicar el plan Product OS.",
      evidence: { version: ghVersion.stdout.split(/\r?\n/)[0] || "no disponible" },
    }),
  );
  const productOs = await readJson(path.join(root, ".project-os", "github", "product-os.json"));
  const productOsHash = productOs
    ? sha256(`${stableJson(productOs)}\n`)
    : "missing";
  const {
    document: projectReceiptDocument,
    ...checkedProjectReceipt
  } = await evidenceReceipt(root, "github-project", productOsHash, upstream
    ? { maxBytes: FRESHNESS_RECEIPT_MAX_BYTES, canonicalOnly: true }
    : undefined);
  let projectReceipt = checkedProjectReceipt;
  if (upstream && projectReceipt.state === "valid") {
    const lifecycle = classifyGithubProjectReceipt(projectReceiptDocument);
    if (lifecycle.state === "invalid") {
      projectReceipt = {
        state: "invalid",
        relative: projectReceipt.relative,
        cause: lifecycle.reason,
      };
    }
  }
  results.push(productOs
    ? receiptResult({
      id: "github.project",
      label: "GitHub Project",
      missingStatus: "WARN",
      receipt: projectReceipt,
    })
    : result({
      id: "github.project",
      status: "FAIL",
      summary: "Falta el manifiesto Product OS",
      cause: "No existe .project-os/github/product-os.json.",
      remediation: "Restaura el manifiesto canónico antes de preparar o verificar GitHub Project.",
      evidence: { manifest: "ausente" },
    }));

  const ciCandidates = [
    ".github/workflows/project-constructor.yml",
    ".github/workflows/project-constructor.yaml",
  ];
  const ciPath = (
    await Promise.all(ciCandidates.map(async (relative) => ((await exists(path.join(root, relative))) ? relative : null)))
  ).find(Boolean);
  const ciContent = ciPath
    ? await readFile(path.join(root, ciPath), "utf8")
    : null;
  const ciHash = ciContent === null
    ? "missing"
    : sha256(ciContent.replace(/\r\n?/g, "\n"));
  const ciReceipt = await evidenceReceipt(root, "ci-local", ciHash);
  results.push(
    result({
      id: "ci.configuration",
      profile: "harness-tooling",
      status: ciPath ? "PASS" : "FAIL",
      summary: ciPath ? "CI advisory declarada" : "Falta CI del constructor",
      cause: ciPath ? "Existe un workflow versionado del núcleo." : "No se encontró el workflow esperado.",
      remediation: "Restaura el workflow advisory; no lo conviertas en blocking sin baseline y política explícita.",
      evidence: { workflow: ciPath ?? "ausente" },
    }),
  );
  results.push(receiptResult({
    id: "ci.execution",
    profile: "harness-tooling",
    label: "Ejecución CI local",
    missingStatus: "WARN",
    receipt: ciReceipt,
  }));

  const requiredVariables = Array.isArray(config?.requiredEnvironmentVariables)
    ? config.requiredEnvironmentVariables
    : [];
  for (const variable of requiredVariables.sort()) {
    const name = typeof variable === "string" ? variable : variable.name;
    const required = typeof variable === "string" ? true : variable.required !== false;
    const present = Boolean(env[name]);
    results.push(
      result({
        id: `environment.${name}`,
        status: present ? "PASS" : required ? "FAIL" : "WARN",
        summary: present ? `${name} está presente` : `${name} está ausente`,
        cause: present
          ? "La variable requerida existe; su valor no fue leído ni mostrado."
          : required
            ? "El perfil activo declara esta variable como obligatoria."
            : "La variable es opcional para el perfil activo.",
        remediation: `Configura ${name} manualmente en el entorno correspondiente; no publiques su valor.`,
        evidence: { name, present },
      }),
    );
  }

  const transactions = await inspectTransactionJournals(root);
  const transactionFailure = transactions.incomplete.length > 0
    || transactions.corrupt.length > 0;
  results.push(
    result({
      id: "constructor.transactions",
      profile: "harness-tooling",
      status: transactionFailure ? "FAIL" : "PASS",
      summary: transactionFailure
        ? "Hay journals incompletos o corruptos"
        : "Los journals de transacción están en estado terminal",
      cause: transactions.corrupt.length > 0
        ? "Uno o más journals faltan, son ilegibles o declaran un estado desconocido."
        : transactions.incomplete.length > 1
          ? "Hay múltiples transacciones incompletas; no es seguro elegir una automáticamente."
          : transactions.incomplete.length === 1
            ? "Existe una ejecución parcial que requiere una decisión explícita."
            : "No se encontraron transacciones incompletas.",
      remediation: "Ejecuta rollback o reanuda el comando mutante de forma explícita; el doctor no repara.",
      evidence: {
        corruptJournals: transactions.corrupt,
        incompleteTransactionIds: transactions.incomplete,
        journalCount: transactions.journalCount,
      },
    }),
  );

  const consumerShape = new Set(['release.identity', 'harness.parity', 'mcp.configuration', 'ci.configuration']);
  return createReport(results.map((entry) => {
    const category = consumerShape.has(entry.id) ? 'consumer-shape' : 'published-obligation';
    const notApplicable = upstream && category === 'consumer-shape';
    return {
      ...entry,
      ...(notApplicable ? { status: 'SKIP', cause: 'El upstream no consume el layout que genera.',
        remediation: 'Valida esta superficie en el fixture de consumidor; no bootstrapees el upstream.' } : {}),
      evidence: { ...entry.evidence, category, applicability: notApplicable ? 'not-applicable' : 'applicable',
        ...(notApplicable ? { originalStatus: entry.status } : {}) },
    };
  }));
}

export async function runDoctor({
  target,
  targetRoot,
  json = false,
  env,
  runner,
  parityChecker,
} = {}) {
  const report = await collectDoctorReport({
    target: target ?? targetRoot,
    env,
    runner,
    parityChecker,
  });
  return {
    report,
    output: json ? formatJson(report) : formatHuman(report),
    exitCode: reportExitCode(report),
  };
}

export const doctorInternals = Object.freeze({
  SAFE_COMMANDS,
  isSupportedNode,
  containsLiteralSecret,
  mcpServers,
  sha256,
  stableStringify: stableJson,
  technicalProfileConfigProjection,
  spawnReadOnly,
  normalizedRelative,
});
