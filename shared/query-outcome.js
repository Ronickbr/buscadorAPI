const LABELS={found:'Registros retornados',empty:'Nenhum registro encontrado',error:'Falha na consulta',invalid:'Resposta inválida',received:'Resposta recebida',partial:'Resultado parcial'};
export function outcome(kind,message){return {kind,label:LABELS[kind],message,successful:kind==='found'};}
export function parseProviderResponse(raw){
  if(typeof raw!=='string')return null;
  const text=raw.trim();if(!text)return null;
  try{return JSON.parse(text);}catch{}
  const clean=text.replace(/^(?:api desenvolvida por @astrahvhdev telegram\s*)+/i,'');
  if(clean!==text){try{return JSON.parse(clean);}catch{}}
  return raw;
}
const falseFlag=v=>v===false||v===0||typeof v==='string'&&['false','0'].includes(v.trim().toLowerCase());
const emptyValues=value=>value==null||value===''||Array.isArray(value)&&value.length===0||typeof value==='object'&&!Object.keys(value).length;
const payloadKeys=['resultados','results','registros','records','dados','resultado','data'];
const countKeys=['total','total_encontrados','total_registros','count'];
const hasRecordFields=obj=>Object.entries(obj).some(([key,value])=>/^(?:nome|name|nome_completo|razao_social|nome_fantasia|logradouro|localidade|municipio|enderecos?|telefones?|email|nasc|nascimento|data_nascimento|birthDate|placa|qsa|renda|data_adm|profissao_cbo|cargo|qualificacao)$/i.test(key)&&!emptyValues(value));
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)&&hasRecordFields(value);
export const isAggregateResponse=data=>!!data&&typeof data==='object'&&Array.isArray(data.dados)&&('total_fontes_com_dados' in data||data.dados.some(item=>item&&typeof item==='object'&&'conteudo' in item));

export function classifyQueryResponse(data,{httpStatus=200,depth=0}={}){
  if(httpStatus===404)return outcome('empty','A fonte não encontrou registros para a consulta.');
  if(httpStatus<200||httpStatus>=300)return outcome('error',`A fonte respondeu com erro HTTP ${httpStatus}.`);
  if(depth>8)return outcome('invalid','A resposta contém níveis demais para confirmar o resultado.');
  if(data==null)return outcome('empty','A fonte não retornou dados.');
  if(typeof data!=='object')return outcome('invalid','A fonte devolveu texto ou um formato inesperado. Nenhum registro foi confirmado.');
  if(Array.isArray(data)){
    if(!data.length)return outcome('empty','A fonte retornou uma lista vazia.');
    const items=data.map(item=>classifyQueryResponse(item,{depth:depth+1}));
    const found=items.some(item=>item.kind==='found'||item.kind==='partial'),failed=items.some(item=>item.kind==='error'||item.kind==='invalid');
    if(found)return outcome(failed||items.some(item=>item.kind==='partial')?'partial':'found','A fonte retornou registros. A atualização e a exatidão não foram verificadas.');
    if(failed)return outcome('error','A lista retornada contém falhas e nenhum registro foi identificado.');
    return outcome('received','A resposta foi recebida, mas não foi possível identificar registros.');
  }
  const status=typeof data.status==='string'?data.status.trim().toLowerCase():data.status;
  if(status===404||status==='404'||['not_found','not found','nao_encontrado'].includes(status))return outcome('empty','A fonte informou que não encontrou registros.');
  if(typeof status==='number'&&status>=400||typeof status==='string'&&/^\d{3}$/.test(status)&&Number(status)>=400||['error','erro','failed','failure'].includes(status)||data.error&&!emptyValues(data.error)||data.erro&&!emptyValues(data.erro))return outcome('error','A fonte informou falha no conteúdo da resposta.');
  if(falseFlag(status))return outcome('empty','A fonte informou que a consulta não retornou registros.');
  const payload=payloadKeys.filter(key=>key in data).map(key=>data[key]);
  const counts=countKeys.filter(key=>key in data&&/^\d+$/.test(String(data[key]))).map(key=>Number(data[key]));
  if(['sucesso','success','encontrado'].some(key=>key in data&&falseFlag(data[key])))return outcome(payload.some(v=>!emptyValues(v))?'error':'empty','A fonte informou que a consulta não encontrou registros ou não foi concluída.');

  // API Full wraps other providers' JSON in conteudo. Its own counters are not evidence of records.
  if(isAggregateResponse(data)){
    const sources=data.dados.map(item=>classifyQueryResponse(typeof item?.conteudo==='string'?parseProviderResponse(item.conteudo):item?.conteudo,{depth:depth+1}));
    const found=sources.filter(s=>s.kind==='found'||s.kind==='partial').length;
    const empty=sources.filter(s=>s.kind==='empty').length;
    const failed=sources.filter(s=>s.kind==='error'||s.kind==='invalid').length;
    if(found)return outcome(found===sources.length&&sources.every(s=>s.kind==='found')?'found':'partial',`${found} fonte(s) retornaram registros; ${empty} sem registros; ${failed} com falha. O total anunciado pelo agregador não confirma os dados.`);
    if(failed)return outcome('error','Nenhuma fonte confirmou registros e há falhas entre as respostas agregadas.');
    if(sources.length&&empty===sources.length)return outcome('empty','As fontes agregadas não retornaram registros.');
    return outcome('received','O agregador respondeu, mas seus indicadores não permitem confirmar registros.');
  }
  if(counts.some(count=>count===0))return outcome(payload.some(v=>Array.isArray(v)&&v.length>0)?'error':'empty','A fonte informou zero registros.');
  if(payload.length){
    const children=payload.map(value=>classifyQueryResponse(value,{depth:depth+1}));
    if(children.some(child=>child.kind==='partial'))return outcome('partial','Parte das respostas contém registros; há fontes sem confirmação ou com falha.');
    if(children.some(child=>child.kind==='error'||child.kind==='invalid'))return outcome('error','O conteúdo retornado inclui uma falha ou resposta inválida.');
    if(children.some(child=>child.kind==='found'))return outcome('found','A fonte retornou registros. A atualização e a exatidão não foram verificadas.');
    if(children.every(child=>child.kind==='empty'))return outcome('empty','A fonte não retornou registros.');
  }
  if(record(data))return outcome('found','A fonte retornou dados cadastrais. A atualização e a exatidão não foram verificadas.');
  return outcome('received','A resposta foi recebida, mas não há evidência suficiente de um registro encontrado.');
}
