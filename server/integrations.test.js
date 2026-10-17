import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {scryptSync} from 'node:crypto';
import {createIntegrations} from './integrations.js';
import {createAuthentication} from './auth.js';
import {createApp} from './start.js';
import {validateDocument,PROVIDERS} from './providers.js';

async function fixture(t,{fetcher,authenticated=true,role='admin',auth}={}){
  const directory=await mkdtemp(join(tmpdir(),'buscador-api-test-'));
  let now=Date.UTC(2026,9,17,12),calls=[];
  const handler=createIntegrations({directory,clock:()=>now,fetcher:fetcher||(async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({data:{name:'Exemplo de teste'}}),{status:200});})});
  const server=createApp({api:handler,root:directory,auth:auth||((req,res,next)=>{if(authenticated)req.user={role};next();})});server.listen(0,'127.0.0.1');await once(server,'listening');
  const origin=`http://127.0.0.1:${server.address().port}`;
  t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});});
  const request=(path,method='GET',body,extra={})=>fetch(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
  return {request,directory,calls,advance:ms=>now+=ms};
}
const configure=(f,id,body)=>f.request('/api/admin/providers/'+id,'PUT',body);
const lookup=(f,provider='cpfhub',value='00000000191')=>f.request('/api/integrations/query','POST',{provider,value});

test('validates CPF, CNPJ and CEP before using any provider',()=>{
  assert.equal(validateDocument('cpf','000.000.001-91'),'00000000191');
  assert.equal(validateDocument('cpf','11111111111'),null);
  assert.equal(validateDocument('cpf','00000000192'),null);
  assert.equal(validateDocument('cnpj','00.000.000/0001-91'),'00000000000191');
  assert.equal(validateDocument('cnpj','00.000.000/0001-92'),null);
  assert.equal(validateDocument('cep','01001-000'),'01001000');
  assert.equal(validateDocument('cep','https://evil.test'),null);
});
test('blocks anonymous users, non-admin settings and cross-origin writes',async t=>{
  const anon=await fixture(t,{authenticated:false});assert.equal((await anon.request('/api/admin/providers')).status,401);
  const user=await fixture(t,{role:'user'});assert.equal((await user.request('/api/admin/providers')).status,403);
  const f=await fixture(t);assert.equal((await f.request('/api/admin/providers/cpfhub','PUT',{}, {Origin:'https://evil.test'})).status,403);
  assert.equal((await f.request('/api/integrations/query','POST',{provider:'viacep',value:'01001000'},{Origin:'https://evil.test'})).status,403);
  assert.equal(f.calls.length,0);
});
test('saved secrets are encrypted and never returned; blank keeps and removal disables',async t=>{
  const f=await fixture(t),secret='test-secret-not-a-real-key';
  assert.equal((await configure(f,'cpfhub',{enabled:true,monthlyLimit:50,apiKey:secret})).status,200);
  const saved=await readFile(join(f.directory,'integrations.enc'),'utf8');assert.ok(!saved.includes(secret));
  const list=await (await f.request('/api/admin/providers')).text();assert.ok(!list.includes(secret));assert.ok(!list.includes('apiKey'));
  await configure(f,'cpfhub',{enabled:true,monthlyLimit:50,apiKey:''});
  assert.equal((await lookup(f)).status,200);assert.equal(f.calls[0].options.headers['X-API-Key'],secret);
  const failure=await configure(f,'cpfhub',{enabled:false,monthlyLimit:50,removeKey:true});assert.equal(failure.status,200);
  assert.equal((await lookup(f)).status,403);
});
test('prevents overspending under concurrent calls and persists counters after key changes',async t=>{
  const f=await fixture(t);await configure(f,'cpfhub',{enabled:true,monthlyLimit:1,apiKey:'test-key'});
  const responses=await Promise.all([lookup(f),lookup(f)]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,429]);assert.equal(f.calls.length,1);
  await configure(f,'cpfhub',{enabled:true,monthlyLimit:1,apiKey:'replacement-key'});f.advance(10000);
  assert.equal((await lookup(f)).status,429);
  f.advance(32*24*60*60*1000);assert.equal((await lookup(f)).status,200);
  assert.equal((await configure(f,'cpfhub',{enabled:true,monthlyLimit:51})).status,400);
  assert.equal((await configure(f,'cpfnacional',{enabled:true,monthlyLimit:null,apiKey:'key'})).status,400);
});
test('public services need no key; enforce rate limits and never follow arbitrary hosts',async t=>{
  const f=await fixture(t);
  assert.equal((await lookup(f,'viacep','01001000')).status,200);
  assert.equal(f.calls[0].url,'https://viacep.com.br/ws/01001000/json/');
  assert.equal(f.calls[0].options.redirect,'error');assert.equal(f.calls[0].options.headers['X-API-Key'],undefined);
  assert.equal((await lookup(f,'viacep','01001000')).status,429);
  assert.equal((await lookup(f,'https://evil.test','01001000')).status,400);
  assert.equal((await lookup(f,'brasilapi','not-cnpj')).status,400);
  assert.equal(f.calls.length,1);
});
test('upstream failures are sanitized and count as local attempts',async t=>{
  const f=await fixture(t,{fetcher:async()=>new Response(JSON.stringify({error:'sensitive secret upstream message'}),{status:401})});
  await configure(f,'cpfhub',{enabled:true,monthlyLimit:1,apiKey:'fake-key'});
  const result=await lookup(f);assert.equal(result.status,502);assert.ok(!(await result.text()).includes('sensitive secret'));
  assert.equal((await lookup(f)).status,429);
});
test('provider payload errors and timeouts never appear as successful lookups',async t=>{
  for(const data of [{erro:true},{status:'ERROR'}, {success:false}]){
    const f=await fixture(t,{fetcher:async()=>Response.json(data)});assert.equal((await lookup(f,'viacep','01001000')).status,404);
  }
  const f=await fixture(t,{fetcher:async()=>{throw new Error('private-network-detail');}});
  const result=await lookup(f,'viacep','01001000');assert.equal(result.status,502);assert.ok(!(await result.text()).includes('private-network-detail'));
});
test('all provider adapters point to documented HTTPS endpoints and return generic payloads',async t=>{
  const f=await fixture(t);
  for(const p of PROVIDERS){
    if(p.freeLimit)await configure(f,p.id,{enabled:true,monthlyLimit:p.freeLimit,apiKey:'test-key'});
    const value={cpf:'00000000191',cnpj:'00000000000191',cep:'01001000'}[p.kind];
    const response=await lookup(f,p.id,value);assert.equal(response.status,200);
    assert.equal(new URL(f.calls.at(-1).url).protocol,'https:');
    assert.equal((await response.json()).fonte,p.name);
  }
});
test('login grants admin access; logout invalidates the API session',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'buscador-auth-test-'));t.after(()=>rm(directory,{recursive:true,force:true}));
  const credentialsPath=join(directory,'credentials.json'),password='local-test-password-123',salt='local-test-salt';
  await writeFile(credentialsPath,JSON.stringify({username:'admin-test',salt,hash:scryptSync(password,salt,64).toString('hex')}));
  const f=await fixture(t,{auth:createAuthentication({credentialsPath})});
  await writeFile(join(f.directory,'admin.html'),'<h1>Administração de teste</h1>');
  const page=await fetch(`http://127.0.0.1:${new URL((await f.request('/api/admin/providers')).url).port}/admin.html`,{redirect:'manual'});
  assert.equal(page.status,302);assert.equal(page.headers.get('location'),'/login');
  assert.equal((await f.request('/api/admin/providers')).status,401);
  const login=await f.request('/auth/login','POST',{username:'admin-test',password});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
  assert.equal((await f.request('/api/admin/providers','GET',undefined,{Cookie:cookie})).status,200);
  assert.equal((await f.request('/admin.html','GET',undefined,{Cookie:cookie})).status,200);
  assert.equal((await f.request('/admin','GET',undefined,{Cookie:cookie})).status,200);
  await f.request('/auth/logout','POST',{}, {Cookie:cookie});
  assert.equal((await f.request('/api/admin/providers','GET',undefined,{Cookie:cookie})).status,401);
});
