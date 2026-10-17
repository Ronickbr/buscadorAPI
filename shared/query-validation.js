import {ENDPOINTS} from '../src/endpoints.js';
import {validateDocument} from './documents.js';

const controls=new Set(['action','tabela','campo']);
export const LEGACY_ENDPOINTS=new Map();
for(const endpoint of ENDPOINTS.filter(e=>!e.provider)){
  LEGACY_ENDPOINTS.set(endpoint.endpoint,endpoint);
  for(const option of endpoint.params.find(p=>p.name==='script')?.options??[])LEGACY_ENDPOINTS.set(option.value,endpoint);
}
function normalizePhone(value){
  if(!/^\+?[\d ()-]+$/.test(value))return null;
  const number=value.replace(/\D/g,'');
  return /^(?:55)?\d{10,11}$/.test(number)&&! /^(\d)\1+$/.test(number)?number:null;
}
function validateValue(name,value){
  if(['cpf','cpf_parente'].includes(name))return validateDocument('cpf',value);
  if(name==='cnpj')return validateDocument('cnpj',value);
  if(['doc','identity'].includes(name))return validateDocument('cpf',value)||validateDocument('cnpj',value);
  if(name==='cep')return validateDocument('cep',value);
  if(['telefone','celular','telephone'].includes(name))return normalizePhone(value);
  if(name==='placa'){
    const plate=value.toUpperCase().replace('-','');
    return /^[A-Z]{3}(?:\d{4}|\d[A-Z]\d{2})$/.test(plate)?plate:null;
  }
  if(name==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?value:null;
  if(['nome','nome_mae','mae','pai'].includes(name))return /^[\p{L}\p{M} .'’-]+$/u.test(value)&&value.replace(/[^\p{L}]/gu,'').length>=3?value:null;
  if(['renavam','renavan'].includes(name))return /^\d{9,11}$/.test(value)&&! /^(\d)\1+$/.test(value)?value:null;
  if(name==='rg')return /^[\dA-Za-z. -]{3,20}$/.test(value)?value:null;
  if(name==='id')return value.length===11?validateDocument('cpf',value):/^[1-9]\d{0,19}$/.test(value)?value:null;
  return value;
}

// Shared by browser, development server and production proxy. No request is sent on failure.
export function validateLegacyQuery(script,parameters){
  const endpoint=LEGACY_ENDPOINTS.get(script);
  if(!endpoint)throw new Error('API não disponível no catálogo.');
  const source=parameters instanceof URLSearchParams?parameters:new URLSearchParams(parameters);
  const normalized=new URLSearchParams();
  for(const [name,raw]of source){
    const field=endpoint.params.find(p=>p.name===name&&p.name!=='script');
    if(!field||source.getAll(name).length!==1)throw new Error('Parâmetro de consulta não permitido.');
    const value=raw.trim();if(!value)continue;
    if(value.length>256)throw new Error(`${field.label}: valor muito longo.`);
    if(field.options&&!field.options.some(option=>option.value===value))throw new Error(`${field.label}: selecione uma opção válida.`);
    let result=controls.has(name)?value:validateValue(name,value);
    if(name==='valor'){
      const selected=source.get('campo');
      result=selected==='PLACA'?validateValue('placa',value):selected==='RENAVAM'?validateValue('renavam',value):/^[A-Z0-9]{3,25}$/i.test(value)?value.toUpperCase():null;
    }
    if(result===null)throw new Error(`${field.label}: informe um valor válido.`);
    normalized.set(name,result);
  }
  for(const field of endpoint.params)if(field.required&&!normalized.has(field.name))throw new Error(`Preencha ${field.label}.`);
  for(const field of endpoint.params)if(controls.has(field.name)&&field.options&&!normalized.has(field.name))throw new Error(`Selecione ${field.label}.`);
  if(![...normalized.keys()].some(name=>!controls.has(name)))throw new Error('Informe ao menos um critério de pesquisa válido.');
  if(script==='dados01.php'){
    const required={consultar_cpf:'cpf',buscar_nome:'nome',buscar_mae:'mae',buscar_pai:'pai',buscar_rg:'rg'}[normalized.get('action')];
    if(!required||!normalized.has(required))throw new Error('Preencha o campo correspondente ao tipo de busca selecionado.');
  }
  return normalized;
}
