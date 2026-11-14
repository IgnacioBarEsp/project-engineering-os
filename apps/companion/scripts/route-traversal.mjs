// Declaration is the denominator; only routes observed in the rendered DOM are the numerator.
// Never infer a visit from the journey's intended destination or from the route table itself.
export function routeTraversal(declared, rendered) {
  const routes = [...new Set(declared)];
  const visited = [...new Set(rendered)];
  const missing = routes.filter(id => !visited.includes(id));
  const unexpected = visited.filter(id => !routes.includes(id));
  const problems = [];
  if (!routes.length) problems.push('No hay rutas declaradas: denominador vacío.');
  if (!visited.length) problems.push('No se observó ninguna ruta renderizada.');
  if (routes.length !== declared.length) problems.push('Hay rutas declaradas repetidas.');
  if (missing.length) problems.push(`Rutas declaradas no renderizadas: ${missing.join(', ')}`);
  if (unexpected.length) problems.push(`Rutas renderizadas sin declarar: ${unexpected.join(', ')}`);
  return {declared: routes, rendered: visited, missing, unexpected, problems};
}
