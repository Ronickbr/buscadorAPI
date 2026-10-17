import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {authentication} from './auth.js';
import {integrations} from './integrations.js';
import {pathToFileURL} from 'node:url';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};

export function createApp({auth=authentication,api=integrations,root=resolve('dist')}={}){
  return http.createServer((req,res)=>{
    try{auth(req,res,()=>api(req,res,async()=>{
      try{
        const url=new URL(req.url,'http://localhost');
        if(url.pathname.startsWith('/api-proxy/')){
          if(req.method!=='GET'){res.writeHead(405);res.end();return;}
          const target=new URL('http://apisbrasilpro.site');target.pathname=url.pathname.slice('/api-proxy'.length);target.search=url.search;
          const response=await fetch(target,{headers:{Accept:'application/json, text/plain, */*'},signal:AbortSignal.timeout(30000),redirect:'error'});
          res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'text/plain'});res.end(Buffer.from(await response.arrayBuffer()));return;
        }
        if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
        const pathname=url.pathname==='/admin'?'/admin.html':url.pathname==='/'?'/index.html':url.pathname;
        const file=resolve(root,'.'+decodeURIComponent(pathname));
        if(!file.startsWith(root+sep)){res.writeHead(403);res.end('Acesso bloqueado.');return;}
        try{if(!(await stat(file)).isFile())throw new Error();}catch{res.writeHead(404);res.end('Não encontrado.');return;}
        res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:await readFile(file));
      }catch{res.writeHead(502);res.end('Não foi possível carregar este recurso.');}
    }));}catch{res.writeHead(400);res.end('Requisição inválida.');}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  createApp().listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Servidor autenticado iniciado.'));
}
