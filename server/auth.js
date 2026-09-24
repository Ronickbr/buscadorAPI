import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sessions=new Map(),attempts=new Map();
const lifetime=8*60*60*1000;
const loginPage=readFileSync(new URL('./login.html',import.meta.url),'utf8');
function reply(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}
export function authentication(req,res,next){
 const path=new URL(req.url,'http://localhost').pathname;
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 if(/(?:^|\/)(?:server|\.env[^/]*|\.credentials[^/]*|\.git)(?:\/|$)/i.test(decodeURIComponent(path))){res.statusCode=404;res.end();return;}
 const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(c=>c.trim().split('=')));
 const token=cookies.session;const session=sessions.get(token);const authenticated=session&&session.expires>Date.now();
 const secure=req.socket.encrypted||process.env.COOKIE_SECURE==='true';
 const cookie=(value,age)=>`session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure?'; Secure':''}`;
 if(path==='/login'&&req.method==='GET'){if(authenticated){res.writeHead(302,{Location:'/'});res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(loginPage);return;}
 if((path==='/auth/login'||path==='/auth/logout')&&req.method==='POST'){
  if(!req.headers.origin||req.headers.origin!==`${secure?'https':'http'}://${req.headers.host}`){reply(res,403,{error:'Origem não permitida.'});return;}
  if(path==='/auth/logout'){sessions.delete(token);res.setHeader('Set-Cookie',cookie('',0));reply(res,200,{ok:true});return;}
  const ip=req.socket.remoteAddress||'local';const now=Date.now();let attempt=attempts.get(ip);if(attempt&&attempt.until<=now){attempts.delete(ip);attempt=null;}if(attempt&&attempt.count>=8){reply(res,429,{error:'Muitas tentativas. Aguarde 15 minutos e tente novamente.'});return;}
  let body='';req.on('data',chunk=>{body+=chunk;if(body.length>4096)req.destroy();});req.on('end',()=>{try{
   const {username,password}=JSON.parse(body);if(typeof username!=='string'||typeof password!=='string'||password.length>256){reply(res,400,{error:'Informe usuário e senha.'});return;}
   const config=JSON.parse(readFileSync(new URL('./.credentials.json',import.meta.url),'utf8'));
   const candidate=scryptSync(password,config.salt,64);const expected=Buffer.from(config.hash,'hex');const valid=timingSafeEqual(candidate,expected)&&username===config.username;
   if(!valid){attempts.set(ip,{count:(attempt?.count||0)+1,until:attempt?.until||now+15*60*1000});reply(res,401,{error:'Usuário ou senha incorretos.'});return;}
   attempts.delete(ip);for(const [id,s]of sessions)if(s.expires<=now)sessions.delete(id);if(token)sessions.delete(token);const id=randomBytes(32).toString('hex');sessions.set(id,{expires:now+lifetime});res.setHeader('Set-Cookie',cookie(id,lifetime/1000));reply(res,200,{ok:true});
  }catch{reply(res,400,{error:'Não foi possível entrar. Verifique a configuração de acesso.'});}});return;
 }
 if(path.startsWith('/auth/')){reply(res,404,{error:'Não encontrado.'});return;}
 if(!authenticated){if(token)sessions.delete(token);if(path.startsWith('/api-proxy/')){reply(res,401,{error:'Entre na sua conta para consultar.'});return;}res.writeHead(302,{Location:'/login'});res.end();return;}
 next();
}
export const authPlugin={name:'access-control',configureServer(server){server.middlewares.use(authentication);},configurePreviewServer(server){server.middlewares.use(authentication);}};
