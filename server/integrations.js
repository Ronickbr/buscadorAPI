import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {PROVIDERS,validateDocument} from './providers.js';

function fault(status,message){return Object.assign(new Error(message),{status});}
function upstreamFailure(provider,status){
  if(provider.id==='brasilapi'){
    const messages={
      400:'CNPJ inválido ou mal formatado, conforme a BrasilAPI. Confira o documento informado.',
      403:'A BrasilAPI recusou o acesso (HTTP 403). Este provedor não utiliza chave de API. Tente mais tarde ou selecione outro provedor de CNPJ.',
      404:'CNPJ não encontrado na base consultada pela BrasilAPI.',
      429:'Limite de requisições da BrasilAPI atingido. Aguarde antes de tentar novamente.',
      503:'Consulta de CNPJ temporariamente indisponível na BrasilAPI/Minha Receita. Tente novamente mais tarde.',
    };
    return fault(messages[status]?status:502,messages[status]||'A BrasilAPI não conseguiu concluir a consulta. Tente novamente mais tarde.');
  }
  const messages={401:'Chave recusada pelo provedor. Revise a administração.',403:provider.freeLimit?'Acesso ou créditos recusados pelo provedor.':'O provedor público recusou o acesso. Tente novamente mais tarde.',404:'Nenhum registro encontrado na base do provedor.',429:'Limite do provedor atingido. Aguarde e confira o saldo.'};
  return fault([401,403].includes(status)?502:status===404?404:status===429?429:502,messages[status]||'O provedor recusou a consulta.');
}
export function sameOrigin(req){
  const secure=req.socket.encrypted||process.env.COOKIE_SECURE==='true';
  return req.headers.origin===`${secure?'https':'http'}://${req.headers.host}`;
}
async function jsonBody(req){
  if(!req.headers['content-type']?.startsWith('application/json')) throw fault(415,'Envie dados no formato JSON.');
  let data='';
  for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>8192) throw fault(413,'Requisição muito grande.');}
  try{return JSON.parse(data);}catch{throw fault(400,'JSON inválido.');}
}
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
const period=now=>new Date(now).toISOString().slice(0,7);

// One process owns the store. Reservations are persisted before a provider call.
// Failed/ambiguous attempts also consume the LOCAL budget, conservatively.
export function createIntegrations({directory=resolve('server/.private'),fetcher=fetch,clock=Date.now}={}){
  let queue=Promise.resolve();
  const locked=fn=>{const run=queue.then(fn);queue=run.catch(()=>{});return run;};
  let key;
  async function encryptionKey(){
    if(key)return key;
    await mkdir(directory,{recursive:true,mode:0o700});
    try{key=await readFile(join(directory,'encryption.key'));}
    catch(e){if(e.code!=='ENOENT')throw e;const next=randomBytes(32);await writeFile(join(directory,'encryption.key'),next,{flag:'wx',mode:0o600});key=next;}
    if(key.length!==32)throw new Error('Invalid encryption key');
    return key;
  }
  async function load(){
    const secret=await encryptionKey();
    try{
      const envelope=JSON.parse(await readFile(join(directory,'integrations.enc'),'utf8'));
      const decipher=createDecipheriv('aes-256-gcm',secret,Buffer.from(envelope.iv,'base64'));
      decipher.setAuthTag(Buffer.from(envelope.tag,'base64'));
      return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data,'base64')),decipher.final()]).toString('utf8'));
    }catch(e){if(e.code==='ENOENT')return {providers:{}};throw e;}
  }
  async function save(state){
    const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',await encryptionKey(),iv);
    const data=Buffer.concat([cipher.update(JSON.stringify(state),'utf8'),cipher.final()]);
    const payload=JSON.stringify({iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')});
    const temporary=join(directory,'integrations.tmp');
    await writeFile(temporary,payload,{mode:0o600});await rename(temporary,join(directory,'integrations.enc'));
  }
  function config(state,p){return state.providers[p.id]??{enabled:!p.freeLimit,apiKey:'',monthlyLimit:p.freeLimit,usage:{month:period(clock()),attempts:0},nextAllowedAt:0};}
  function view(state,p){
    const c=config(state,p),used=c.usage?.month===period(clock())?c.usage.attempts:0;
    return {id:p.id,name:p.name,kind:p.kind,description:p.description,docs:p.docs,signup:p.signup,requiresKey:!!p.freeLimit,freeLimit:p.freeLimit,enabled:c.enabled,configured:!p.freeLimit||!!c.apiKey,monthlyLimit:c.monthlyLimit,used,remaining:c.monthlyLimit===null?null:Math.max(0,c.monthlyLimit-used),month:period(clock()),intervalSeconds:p.interval/1000};
  }
  return async function integrations(req,res,next){
    const path=new URL(req.url,'http://localhost').pathname;
    if(!path.startsWith('/api/integrations')&&!path.startsWith('/api/admin/'))return next();
    try{
      if(!req.user)throw fault(401,'Entre na sua conta para continuar.');
      if(path.startsWith('/api/admin/')&&req.user.role!=='admin')throw fault(403,'Acesso exclusivo do administrador.');
      if(req.method!=='GET'&&!sameOrigin(req))throw fault(403,'Origem da requisição não autorizada.');
      if((path==='/api/integrations'||path==='/api/admin/providers')&&req.method==='GET'){
        const providers=await locked(async()=>{const state=await load();return PROVIDERS.map(p=>view(state,p));});
        send(res,200,{providers,month:period(clock()),usageNote:'Tentativas locais neste servidor, com renovação no dia 1 às 00h UTC. Não representa o saldo global do fornecedor. Confirme a renovação e o saldo no painel do fornecedor.'});return;
      }
      const edit=path.match(/^\/api\/admin\/providers\/([a-z]+)$/);
      if(edit&&req.method==='PUT'){
        const p=PROVIDERS.find(p=>p.id===edit[1]);if(!p)throw fault(404,'Provedor não encontrado.');
        const body=await jsonBody(req);
        if(!body||typeof body.enabled!=='boolean'||(body.apiKey!==undefined&&(typeof body.apiKey!=='string'||body.apiKey.length>2048||/[\r\n]/.test(body.apiKey))))throw fault(400,'Configuração inválida.');
        const limit=body.monthlyLimit;
        if(limit!==null&&(!Number.isInteger(limit)||limit<0||limit>1000000))throw fault(400,'Informe um limite inteiro válido.');
        if(p.freeLimit&&(limit===null||limit>p.freeLimit))throw fault(400,`O limite deve ficar entre 0 e ${p.freeLimit} para esta integração gratuita.`);
        const result=await locked(async()=>{
          const state=await load(),c=config(state,p);
          const apiKey=body.removeKey===true?'':(body.apiKey?.trim()||c.apiKey);
          if(p.freeLimit&&body.enabled&&!apiKey)throw fault(400,'Cadastre uma chave antes de ativar.');
          state.providers[p.id]={...c,enabled:body.enabled,monthlyLimit:limit,apiKey:p.freeLimit?apiKey:''};
          await save(state);return view(state,p);
        });send(res,200,{provider:result});return;
      }
      if(path==='/api/integrations/query'&&req.method==='POST'){
        const body=await jsonBody(req),p=PROVIDERS.find(p=>p.id===body?.provider);
        if(!p)throw fault(400,'Selecione um provedor disponível.');
        const value=validateDocument(p.kind,body.value,{allowAlphanumeric:p.alphanumeric});if(!value)throw fault(400,`Informe um ${p.kind.toUpperCase()} válido.`);
        const apiKey=await locked(async()=>{
          const state=await load(),c=config(state,p),now=clock();
          if(!c.enabled)throw fault(403,'Integração desativada. Acesse a administração.');
          if(p.freeLimit&&!c.apiKey)throw fault(409,'Cadastre a chave na administração.');
          if(c.usage?.month!==period(now))c.usage={month:period(now),attempts:0};
          if(c.monthlyLimit!==null&&c.usage.attempts>=c.monthlyLimit)throw fault(429,'Limite mensal local atingido. Consulte o painel do fornecedor.');
          if(c.nextAllowedAt>now)throw fault(429,`Aguarde ${Math.ceil((c.nextAllowedAt-now)/1000)} segundos para consultar este provedor novamente.`);
          c.usage.attempts++;c.nextAllowedAt=now+p.interval;state.providers[p.id]=c;await save(state);return c.apiKey;
        });
        let upstream,data;
        try{
          upstream=await fetcher(p.url(value),{headers:{Accept:'application/json',...(p.freeLimit?{'X-API-Key':apiKey}:{})},signal:AbortSignal.timeout(20000),redirect:'error'});
        }catch{
          if(p.id==='brasilapi')throw upstreamFailure(p,503);
          throw fault(502,'O provedor não respondeu corretamente. A tentativa foi contada no limite local; evite repetir antes de conferir seu saldo.');
        }
        // Classify HTTP errors before parsing: gateways may return HTML or plain text.
        if(!upstream.ok){
          await upstream.body?.cancel().catch(()=>{});
          throw upstreamFailure(p,upstream.status);
        }
        try{
          const responseText=await upstream.text();
          if(responseText.length>2_000_000)throw new Error('Response too large');
          data=JSON.parse(responseText);
        }catch{throw fault(502,'O provedor não respondeu corretamente. A tentativa foi contada no limite local; evite repetir antes de conferir seu saldo.');}
        if(!data||data.erro||data.success===false||data.status==='ERROR')throw fault(404,'Nenhum resultado disponível para esta consulta.');
        send(res,200,{fonte:p.name,observacao:p.description,resultado:data.data??data});return;
      }
      throw fault(404,'Recurso não encontrado.');
    }catch(error){send(res,error.status||500,{error:error.status?error.message:'Não foi possível acessar a configuração das integrações. Verifique os arquivos privados do servidor.'});}
  };
}
export const integrations=createIntegrations();
