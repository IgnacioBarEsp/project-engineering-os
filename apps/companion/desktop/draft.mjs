import path from 'node:path';
import {AGENT_IDS} from '../engine/preparation.mjs';
import {PROFILE_IDS, resolveProfile, offeredStacks} from '../engine/profiles.mjs';
import {DECISIONS, STACK_IDS} from '../runtime/stack-catalog.mjs';
import {fail} from '../engine/files.mjs';

export const DRAFT_MAX_BYTES = 16 * 1024;
const ANSWER_KEYS = ['name','goal','profile','focus','vision','agents','stack','installMode','visionMode','audience','existing','outside','experience'];
const RECORD_KEYS = ['version','step','selection','folder'];
const bounded = (value,max) => typeof value==='string' && value.length<=max && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value);
const exact = (value,keys) => value && typeof value==='object' && !Array.isArray(value)
  && Object.keys(value).every(key=>keys.includes(key));
const bad = () => fail('DRAFT_INVALID','El borrador no tiene un formato reconocido.',
  'Conserva el archivo del borrador y vuelve a iniciar la preparación; tu carpeta de proyecto no cambió.');

export function validateDraft(value,{stored=false}={}) {
  if (!exact(value,stored?RECORD_KEYS:['step','selection','projectId'])
      || !Number.isInteger(value.step) || value.step<0 || value.step>3
      || !exact(value.selection,ANSWER_KEYS)) bad();
  const s=value.selection;
  if (!bounded(s.name,100) || !bounded(s.goal,500) || /[\r\n\t]/.test(s.name+s.goal) || !bounded(s.vision,4000)
      || !bounded(s.audience??'',1000) || !bounded(s.existing??'',1000)
      || !bounded(s.outside??'',1000) || !PROFILE_IDS.includes(s.profile) || typeof s.focus!=='string'
      || !Array.isArray(s.agents) || !s.agents.length || s.agents.length>AGENT_IDS.length
      || s.agents.some(id=>!AGENT_IDS.includes(id)) || new Set(s.agents).size!==s.agents.length
      || !exact(s.stack,['decision','requested']) || !DECISIONS.includes(s.stack.decision)
      || !Array.isArray(s.stack.requested) || s.stack.requested.length>STACK_IDS.length
      || s.stack.requested.some(id=>!STACK_IDS.includes(id))
      || new Set(s.stack.requested).size!==s.stack.requested.length
      || (s.stack.decision!=='chosen'&&s.stack.requested.length)
      || !['quick','ai',undefined].includes(s.installMode)
      || !['free','structured',undefined].includes(s.visionMode)
      || !['guided','familiar',undefined].includes(s.experience)) bad();
  try { resolveProfile(s); if(s.stack.requested.some(id=>!offeredStacks(s).includes(id)))bad(); } catch { bad(); }
  if(value.step>0&&(!s.name.trim()||(stored?value.folder===null:value.projectId===null)))bad();
  if(value.step===3&&(!s.goal.trim()||!s.agents.length))bad();
  if (stored) {
    if (value.version!==1 || (value.folder!==null && (!exact(value.folder,['root'])
        || !bounded(value.folder.root,4096) || !path.isAbsolute(value.folder.root)))) bad();
  } else if (value.projectId!==null && (typeof value.projectId!=='string'
      || !/^[a-f0-9-]{36}$/.test(value.projectId))) bad();
  if (Buffer.byteLength(JSON.stringify(value))>DRAFT_MAX_BYTES) bad();
  return value;
}
