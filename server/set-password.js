import {randomBytes,scryptSync} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const username=process.argv[2];const password=process.env.ACCESS_PASSWORD;
if(!username||!password||password.length<12){console.error('Informe o usuário como argumento e uma senha de pelo menos 12 caracteres em ACCESS_PASSWORD.');process.exit(1);}
const salt=randomBytes(16).toString('hex');writeFileSync(new URL('./.credentials.json',import.meta.url),JSON.stringify({username,salt,hash:scryptSync(password,salt,64).toString('hex')},null,2));console.log('Credenciais atualizadas. Reinicie o servidor para encerrar as sessões existentes.');
