export const missing = v => v == null || (typeof v === 'string' && (!v.trim() || v.trim().toUpperCase() === 'NULL'));
export const text = v => missing(v) ? 'Não informado' : typeof v === 'object' ? JSON.stringify(v) : String(v);
export function get(obj, ...names) { if (!obj || typeof obj !== 'object') return undefined; for (const name of names) { const key = Object.keys(obj).find(k => k.toLowerCase() === name.toLowerCase()); if (key !== undefined && !missing(obj[key])) return obj[key]; } }
export const list = v => Array.isArray(v) ? v : v && typeof v === 'object' ? [v] : [];
export function number(v) { if(missing(v)||typeof v==='boolean')return null; if(typeof v==='number')return Number.isFinite(v)?v:null; let s=String(v).trim().replace(/^R\$\s*/, '').replace(/\s/g,''); if(s.includes(','))s=s.replace(/\./g,'').replace(',','.'); if(!/^[+-]?\d+(\.\d+)?$/.test(s))return null; return Number(s); }
export const money = v => { const n=number(v);return n===null?text(v):n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); };
export function dateKey(v) { if(missing(v))return null; const s=String(v);let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/);if(!m){const b=s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s|$)/);if(b)m=[b[0],b[3],b[2],b[1]];}if(!m)return null;const y=+m[1],mo=+m[2],d=+m[3];if(mo<1||mo>12||d<1||d>new Date(Date.UTC(y,mo,0)).getUTCDate())return null;return `${m[1]}-${m[2]}-${m[3]}`; }
export const date = v => {const key=dateKey(v);return key?key.split('-').reverse().join('/'):text(v);};
export function document(v, type, reveal=false) { if(missing(v))return 'Não informado';const raw=String(v),digits=raw.replace(/\D/g,'');if(!reveal)return type==='cpf'&&digits.length===11?`***.${digits.slice(3,6)}.***-**`:'••••••';if(type==='cpf'&&digits.length===11)return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');if(type==='cep'&&digits.length===8)return digits.replace(/(\d{5})(\d{3})/,'$1-$2');if(type==='phone'&&/^\d{10,11}$/.test(digits))return digits.replace(/(\d{2})(\d{4,5})(\d{4})/,'($1) $2-$3');return raw; }
export const yesNo = v => missing(v)?'Não informado':['S',true].includes(v)?'Sim':['N',false].includes(v)?'Não':text(v);
export const code = v => missing(v)?'Não informado':`Código ${text(v)} — descrição não disponível`;
export function parseInput(input){const clean=input.trim().replace(/^api desenvolvida por @astrahvhdev telegram\s*/i,'');const value=JSON.parse(clean);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('O retorno deve ser um objeto JSON.');return value;}
export function prioritySort(items){return [...items].sort((a,b)=>(number(get(a,'PRIORIDADE'))??Infinity)-(number(get(b,'PRIORIDADE'))??Infinity));}
export const updated = v => get(v,'DT_ATUALIZACAO','DATA_ATUALIZACAO','ATUALIZACAO');
export function addressSort(items){return [...items].sort((a,b)=>(dateKey(updated(b))||'').localeCompare(dateKey(updated(a))||''));}
export function redact(value){if(Array.isArray(value))return value.map(redact);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,redact(v)]));return missing(value)?'Não informado':'[oculto]';}
