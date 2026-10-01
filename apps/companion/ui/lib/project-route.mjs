export const PROJECT_TABS=Object.freeze({overview:'Preparación',search:'Archivos',recipes:'Recetas',handoff:'Tu IA'});
export function projectHash(id,tab){if(!Object.hasOwn(PROJECT_TABS,tab))throw Error('Unknown project tab');return `#/project/${encodeURIComponent(id)}/${tab}`;}
export function parseProjectHash(hash){const hit=/^#\/project\/([^/]+)\/(overview|search|recipes|handoff)$/.exec(hash);if(!hit)return null;try{return {id:decodeURIComponent(hit[1]),tab:hit[2]};}catch{return null;}}
