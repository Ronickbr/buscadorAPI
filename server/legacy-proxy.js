import {validateLegacyQuery} from '../shared/query-validation.js';
export function createLegacyProxy({fetcher=fetch}={}){
  return async(req,res,next)=>{
    const url=new URL(req.url,'http://localhost');
    if(!url.pathname.startsWith('/api-proxy/'))return next();
    const reply=(status,message)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({sucesso:false,error:message}));};
    if(req.method!=='GET'){reply(405,'Método não permitido.');return;}
    let params;
    try{params=validateLegacyQuery(url.pathname.slice('/api-proxy/'.length),url.searchParams);}catch(error){reply(400,error.message);return;}
    try{
      const target=new URL(url.pathname.slice('/api-proxy'.length),'http://apisbrasilpro.site');target.search=params.toString();
      const response=await fetcher(target,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000),redirect:'error'});
      res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));
    }catch{reply(502,'O provedor não respondeu corretamente. Tente novamente mais tarde.');}
  };
}
export const legacyProxy=createLegacyProxy();
