import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validateLegacyQuery} from '../shared/query-validation.js';
import {createLegacyProxy} from './legacy-proxy.js';
import {createApp} from './start.js';

test('rejects the invalid documents that produced false positives during live tests',()=>{
  for(const script of ['api_full.php','consulta_serasa.php','basic220m.php','situacao.php','dados01.php']){
    for(const cpf of ['00000000000','11111111111','DOCUMENTO_INVALIDO','123'])assert.throws(()=>validateLegacyQuery(script,{cpf,...(script==='dados01.php'?{action:'consultar_cpf'}:{})}),/CPF/);
  }
});
test('rejects blank queries, invalid secondary fields, duplicate parameters and unknown scripts',()=>{
  for(const parameters of [{},{nome:'  '},{cpf:'00000000191',telefone:'bad-phone'},{nome:'%'}])assert.throws(()=>validateLegacyQuery('consulta_serasa.php',parameters));
  assert.throws(()=>validateLegacyQuery('consulta_serasa.php',new URLSearchParams('cpf=00000000191&cpf=00000000191')));
  assert.throws(()=>validateLegacyQuery('https://evil.test',{}));assert.throws(()=>validateLegacyQuery('../secret.php',{}));
  assert.throws(()=>validateLegacyQuery('spc2.php',{sql:'query'}));
});
test('normalizes valid documents and enforces selectors and action-specific fields',()=>{
  assert.equal(validateLegacyQuery('spc2.php',{cnpj:'00.000.000/0001-91'}).get('cnpj'),'00000000000191');
  assert.equal(validateLegacyQuery('consulta_serasa.php',{cpf:'000.000.001-91'}).get('cpf'),'00000000191');
  assert.equal(validateLegacyQuery('api_full.php',{cep:'01311-000'}).get('cep'),'01311000');
  assert.equal(validateLegacyQuery('api_full.php',{placa:'ABC-1D23'}).get('placa'),'ABC1D23');
  assert.throws(()=>validateLegacyQuery('dados01.php',{action:'buscar_nome',cpf:'00000000191'}));
  assert.throws(()=>validateLegacyQuery('credauto_bin.php',{valor:'ABC1234'}));
  assert.throws(()=>validateLegacyQuery('credauto_bin.php',{campo:'OTHER',valor:'ABC1234'}));
  assert.equal(validateLegacyQuery('credauto_bin.php',{campo:'PLACA',valor:'ABC1234'}).get('valor'),'ABC1234');
});
test('production proxy blocks invalid requests before any external call and preserves provider failures',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'legacy-proxy-test-'));let calls=0,lastTarget;
  const legacy=createLegacyProxy({fetcher:async target=>{calls++;lastTarget=target.toString();return new Response(JSON.stringify({sucesso:false,total:0,resultados:[]}),{status:200,headers:{'Content-Type':'application/json'}});}});
  const server=createApp({root:directory,auth:(req,res,next)=>next(),api:(req,res,next)=>next(),legacy});
  server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
  t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});});
  for(const path of ['/api-proxy/api_full.php?cpf=00000000000','/api-proxy/api_full.php?cpf=DOCUMENTO_INVALIDO','/api-proxy/spc2.php','/api-proxy/not-in-catalog.php?cpf=00000000191'])assert.equal((await fetch(base+path)).status,400);
  assert.equal(calls,0);
  const response=await fetch(base+'/api-proxy/spc2.php?cnpj=00.000.000%2F0001-91');assert.equal(response.status,200);assert.equal((await response.json()).sucesso,false);assert.equal(calls,1);
  assert.equal(lastTarget,'http://apisbrasilpro.site/spc2.php?cnpj=00000000000191');
});
