import { Buffer } from 'node:buffer';
import { description, fail, hash, MAX_BYTES, PROVIDERS, string } from './model.mjs';

function required(value, message) { if (!value) fail('REMOTE_CONTRACT', message); return value; }
const segment = (value) => encodeURIComponent(String(value));

// Only this transport sees credentials. Never include response bodies, URLs or tokens in errors/journals.
export function createTransport(provider, connection, { env = process.env, fetchImpl = fetch } = {}) {
  const token = env[PROVIDERS[provider].credential];
  if (typeof token !== 'string' || !token.trim()) fail('AUTH', `Falta ${PROVIDERS[provider].credential}.`);
  let authorization = `Bearer ${token}`;
  if (provider === 'jira') {
    if (!env.PROJECT_OS_JIRA_EMAIL) fail('AUTH', 'Falta PROJECT_OS_JIRA_EMAIL.');
    authorization = `Basic ${Buffer.from(`${env.PROJECT_OS_JIRA_EMAIL}:${token}`).toString('base64')}`;
  }
  const origin = provider === 'github-projects' ? 'https://api.github.com'
    : provider === 'azure-boards' ? 'https://dev.azure.com' : connection.site;
  return async (method, route, body, { missing = false } = {}) => {
    if (!route.startsWith('/') || route.startsWith('//') || route.includes('\\')) fail('REMOTE_ROUTE', 'Ruta remota inválida.');
    const url = new URL(route, origin);
    if (url.origin !== origin) fail('REMOTE_ROUTE', 'El destino no coincide con el proveedor.');
    let response;
    try {
      response = await fetchImpl(url, { method, redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { authorization, accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'project-engineering-os' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    } catch { fail('REMOTE_UNCERTAIN', 'La solicitud remota no terminó de forma verificable.'); }
    if (missing && response.status === 404) { await response.body?.cancel(); return null; }
    if (!response.ok) { await response.body?.cancel(); fail('REMOTE_HTTP', `El proveedor rechazó la solicitud (HTTP ${response.status}).`); }
    if (response.status === 204) { await response.body?.cancel(); return null; }
    const chunks = []; let size = 0;
    try {
      for await (const chunk of response.body ?? []) {
        size += chunk.byteLength;
        if (size > MAX_BYTES) fail('REMOTE_LIMIT', 'La respuesta remota excede el límite.');
        chunks.push(Buffer.from(chunk));
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
      if (error.code === 'TRACKER_REMOTE_LIMIT') throw error;
      fail('REMOTE_CONTRACT', 'La respuesta remota no contiene JSON válido.');
    }
  };
}

const GITHUB_FIELDS = `id title shortDescription readme updatedAt public closed owner { ... on User { login } ... on Organization { login } }
  items(first:1) { totalCount } fields(first:100) { totalCount nodes { ... on ProjectV2FieldCommon { id name dataType updatedAt }
    ... on ProjectV2SingleSelectField { options { id name color description } }
    ... on ProjectV2MultiSelectField { multiSelectOptions { id name color description } }
    ... on ProjectV2IterationField { configuration { duration startDay iterations { id title startDate duration } completedIterations { id title startDate duration } } }
  } }
  views(first:100) { totalCount nodes { id name filter layout updatedAt } }`;

export function createProvider(request, dependencies = {}) {
  const { provider, connection } = request;
  const send = createTransport(provider, connection, dependencies);
  if (provider === 'github-projects') {
    const graphql = async (query, variables, missing = false) => {
      const result = await send('POST', '/graphql', { query, variables });
      if (missing && result?.errors?.length && result.errors.every((error) => error.type === 'NOT_FOUND')) return { node: null };
      if (result?.errors?.length || !result?.data) fail('REMOTE_GRAPHQL', 'GitHub no verificó la operación GraphQL.');
      return result.data;
    };
    const normalize = (item) => {
      if (!item) return null;
      if (item.owner?.login?.toLowerCase() !== connection.owner.toLowerCase()) fail('REMOTE_OWNER', 'El proyecto no pertenece al propietario aprobado.');
      string(item.id); string(item.title); description(item.shortDescription ?? ''); string(item.updatedAt);
      if (!Number.isSafeInteger(item.items?.totalCount) || item.items.totalCount < 0
        || !Array.isArray(item.fields?.nodes) || !Array.isArray(item.views?.nodes)
        || item.fields.totalCount !== item.fields.nodes.length || item.views.totalCount !== item.views.nodes.length
        || typeof item.public !== 'boolean' || typeof item.closed !== 'boolean') fail('REMOTE_CONTRACT', 'No se pudo comprobar la estructura completa del proyecto.');
      return { id: item.id, name: item.title, description: item.shortDescription ?? '', revision: item.updatedAt,
        visibility: item.public ? 'public' : 'private',
        items: item.items.totalCount, structure: hash({ readme: item.readme ?? '', fields: item.fields.nodes, views: item.views.nodes,
          public: item.public, closed: item.closed }) };
    };
    const read = async (id) => {
      const result = normalize((await graphql(`query($id:ID!) { node(id:$id) { ... on ProjectV2 { ${GITHUB_FIELDS} } } }`, { id }, true)).node);
      if (result && result.id !== id) fail('REMOTE_CONTRACT', 'GitHub devolvió una identidad distinta de la solicitada.');
      return result;
    };
    const ownerQuery = connection.ownerType === 'user' ? 'user' : 'organization';
    return {
      read,
      async discover() {
        let cursor = null, ownerId;
        for (let page = 0; page < 20; page += 1) {
          const data = await graphql(`query($login:String!,$after:String) { owner:${ownerQuery}(login:$login) {
            id projectsV2(first:100,after:$after) { nodes { id title } pageInfo { hasNextPage endCursor } } } }`,
          { login: connection.owner, after: cursor });
          const owner = required(data.owner, 'Propietario GitHub no encontrado.'); ownerId = string(owner.id);
          if (!Array.isArray(owner.projectsV2?.nodes) || typeof owner.projectsV2.pageInfo?.hasNextPage !== 'boolean') fail('REMOTE_CONTRACT', 'No se pudo inspeccionar el catálogo de proyectos.');
          if (owner.projectsV2.nodes.some((item) => item.title?.toLowerCase() === request.name.toLowerCase())) {
            fail('RECONCILE', 'Ya existe un proyecto con ese nombre; seleccione su ID y verifíquelo sin recrearlo.');
          }
          if (!owner.projectsV2.pageInfo.hasNextPage) return ownerId;
          cursor = string(owner.projectsV2.pageInfo.endCursor);
        }
        fail('REMOTE_LIMIT', 'El catálogo excede el límite; seleccione un proyecto existente.');
      },
      async create(ownerId) {
        const data = await graphql('mutation($input:CreateProjectV2Input!) { createProjectV2(input:$input) { projectV2 { id } } }',
          { input: { ownerId, title: request.name } });
        return string(data.createProjectV2?.projectV2?.id);
      },
      async configure(id, value, created = false) {
        await graphql('mutation($input:UpdateProjectV2Input!) { updateProjectV2(input:$input) { projectV2 { id } } }',
          { input: { projectId: id, shortDescription: value, ...(created ? { public: false } : {}) } });
      },
      async smoke(id) { required(await read(id), 'Proyecto no encontrado durante smoke.'); return 'project-items-read'; },
      async remove(id) {
        await graphql('mutation($input:DeleteProjectV2Input!) { deleteProjectV2(input:$input) { clientMutationId } }', { input: { projectId: id } });
      },
    };
  }
  if (provider === 'azure-boards') {
    const base = `/${segment(connection.organization)}/_apis`;
    const projectRoute = (id) => `${base}/projects/${segment(id)}?api-version=7.1`;
    return {
      async read(id) {
        const data = await send('GET', projectRoute(id), undefined, { missing: true });
        if (!data) return null;
        if (data.id !== id || data.state !== 'wellFormed') fail('REMOTE_CONTRACT', 'El proyecto Azure no coincide o todavía no está disponible. Use su UUID.');
        string(data.name); description(data.description ?? '');
        return { id: data.id, name: data.name, description: data.description ?? '',
          visibility: data.visibility ?? null,
          revision: data.lastUpdateTime ?? null, items: null, structure: hash({ visibility: data.visibility ?? null }) };
      },
      async configure(id, value) {
        const result = await send('PATCH', projectRoute(id), { description: value });
        if (!result?.id) fail('REMOTE_CONTRACT', 'Azure no devolvió identidad para la actualización.');
        // Core updates can return an asynchronous OperationReference. Never trust its supplied URL.
        if (result.status) {
          for (let attempt = 0; attempt < 5; attempt += 1) {
            const operation = await send('GET', `${base}/operations/${segment(result.id)}?api-version=7.1`);
            if (operation?.status === 'succeeded') return;
            if (!['queued', 'inProgress'].includes(operation?.status)) fail('REMOTE_UNCERTAIN', 'Azure no confirmó la actualización.');
          }
          fail('REMOTE_UNCERTAIN', 'Azure sigue procesando la actualización; verifique el journal antes de reconciliar.');
        }
      },
      async smoke(id) {
        const result = await send('GET', `${base}/projects/${segment(id)}/teams?$top=1&api-version=7.1`);
        if (!Array.isArray(result?.value)) fail('REMOTE_CONTRACT', 'Azure no verificó la lectura de equipos.');
        return 'project-teams-read';
      },
    };
  }
  const projectRoute = (id) => `/rest/api/3/project/${segment(id)}`;
  return {
    async read(id) {
      const data = await send('GET', projectRoute(id), undefined, { missing: true });
      if (!data) return null;
      if (String(data.id) !== id && data.key !== id) fail('REMOTE_CONTRACT', 'El proyecto Jira no coincide con el aprobado.');
      string(String(data.id)); string(data.name); description(data.description ?? '');
      return { id: String(data.id), name: data.name, description: data.description ?? '', revision: null,
        visibility: null,
        items: null, structure: hash({ key: data.key, projectTypeKey: data.projectTypeKey, style: data.style }) };
    },
    async configure(id, value) { await send('PUT', projectRoute(id), { description: value }); },
    async smoke(id) {
      const result = await send('GET', `${projectRoute(id)}/statuses`);
      if (!Array.isArray(result)) fail('REMOTE_CONTRACT', 'Jira no verificó la lectura de estados.');
      return 'project-statuses-read';
    },
  };
}
