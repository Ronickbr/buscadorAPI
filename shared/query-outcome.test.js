import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseProviderResponse,classifyQueryResponse} from './query-outcome.js';
import {resultMarkup} from '../src/results-view.js';
const kind=(data,httpStatus=200)=>classifyQueryResponse(data,{httpStatus}).kind;
test('observed HTTP 200 failures are never classified as records',()=>{
  for(const data of [
    {sucesso:false,total:0,resultados:[]},
    {success:false,mensagem:'Nenhum registro encontrado'},
    {encontrado:false,dados:[]},
    {status:404,mensagem:'CPF não encontrado',cpf_buscado:'00000000000'},
    {status:'404'}, {success:'false'}, {success:' FALSE '}, {sucesso:'0'}, {status:false},
    {sucesso:true,total:0,resultados:[]},{sucesso:true,resultados:[]},
  ]){assert.equal(kind(data),'empty');assert.equal(classifyQueryResponse(data).successful,false);}
});
test('transport success is separate from evidence of a record',()=>{
  for(const data of [{success:true},{status:200,message:'ok'},{cpf:'00000000191'},{total:3},[{},{}]])assert.equal(kind(data),'received');
  for(const data of ['The page could not be found','<html>{"nome":"should not be parsed"}</html>'])assert.equal(kind(parseProviderResponse(data)),'invalid');
  assert.equal(kind(null),'empty');
});
test('handles known repeated banners without extracting JSON from arbitrary HTML',()=>{
  const payload={sucesso:false,total:0,resultados:[]};
  const text='api desenvolvida por @astrahvhdev telegramapi desenvolvida por @astrahvhdev telegram'+JSON.stringify(payload);
  assert.deepEqual(parseProviderResponse(text),payload);
  assert.equal(kind(parseProviderResponse(text)),'empty');
  const html='<html>{"success":true,"nome":"test"}</html>';
  assert.equal(parseProviderResponse(html),html);assert.equal(parseProviderResponse(''),null);
});
test('conflicting error indicators override plausible fields',()=>{
  assert.equal(kind({sucesso:false,resultados:[{nome:'DADO SINTÉTICO'}]}),'error');
  assert.equal(kind({error:'fail',nome:'DADO SINTÉTICO'}),'error');
  assert.equal(kind({status:500}),'error');
  assert.equal(kind({total:0,resultados:[{nome:'DADO SINTÉTICO'}]}),'error');
});
test('actual record shapes preserve zero, false and null without inferring verification',()=>{
  for(const data of [
    {sucesso:true,total:1,resultados:[{nome:'EMPRESA SINTÉTICA',cnpj:'00000000000191'}]},
    {fonte:'ViaCEP',resultado:{logradouro:'LOGRADOURO SINTÉTICO',localidade:'Cidade de teste'}},
    {fonte:'BrasilAPI',resultado:{razao_social:'EMPRESA SINTÉTICA',capital_social:0,opcao_pelo_mei:false,email:null}},
    {erro:false,nome:'DADO SINTÉTICO'},
  ]){assert.equal(kind(data),'found');assert.equal(classifyQueryResponse(data).successful,true);}
});
test('HTTP errors are classified even when the payload claims success',()=>{
  const data={sucesso:true,nome:'DADO SINTÉTICO'};
  for(const status of [400,401,403,429,500,502,503])assert.equal(kind(data,status),'error');
  assert.equal(kind(data,404),'empty');
});
test('API Full ignores its headline counts and analyzes each source',()=>{
  const full=sources=>({encontrado:true,total_fontes_com_dados:99,dados:sources.map(conteudo=>({tipo:'texto',conteudo:JSON.stringify(conteudo)}))});
  assert.equal(kind(full([{status:404},{sucesso:false,total:0,resultados:[]}])),'empty');
  assert.equal(kind(full([{status:404},{erro:'falha'}])),'error');
  const mixed=classifyQueryResponse(full([{sucesso:true,total:1,resultados:[{nome:'DADO SINTÉTICO'}]},{status:404},{erro:'falha'}]));
  assert.equal(mixed.kind,'partial');assert.equal(mixed.successful,false);assert.match(mixed.message,/1 fonte/);
  assert.equal(kind(full([{sucesso:true}])), 'received');
  assert.equal(kind({encontrado:true,total_fontes_com_dados:10,dados:[]}), 'received');
});
test('limits nested aggregate analysis',()=>{
  let data={nome:'DADO SINTÉTICO'};for(let i=0;i<20;i++)data={encontrado:true,total_fontes_com_dados:1,dados:[{conteudo:data}]};
  assert.equal(classifyQueryResponse(data).successful,false);
});
test('API Full renders source replies as replies rather than personal records',()=>{
  const html=resultMarkup({encontrado:true,total_fontes_com_dados:10,dados:[{conteudo:'{"sucesso":false,"total":0,"resultados":[]}'},{conteudo:'{"status":404}'}]});
  assert.ok(html.includes('Respostas das fontes'));assert.ok(html.includes('2 respostas recebidas'));assert.ok(html.includes('Fonte 1 · Nenhum registro encontrado'));
  assert.ok(!html.includes('2 registros retornados'));assert.ok(!html.includes('Dados pessoais'));assert.ok(html.includes('Indicador anunciado pelo agregador (sem confirmação)'));
});
