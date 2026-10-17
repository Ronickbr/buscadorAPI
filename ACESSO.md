# Acesso ao painel

O usuário autorizado é configurado em server/.credentials.json. A senha é armazenada como hash scrypt com salt. Esse arquivo é privado, bloqueado pelo servidor e ignorado pelo Git. Não está incluído no build.

## Executar
- Desenvolvimento: npm run dev
- Uso com a versão compilada: npm run build e depois npm start
- Acesso local: http://127.0.0.1:3000/login

A autenticação requer o servidor Node. Não publique apenas a pasta dist em hospedagem estática: ela não executa a proteção de acesso. As sessões ficam em memória, expiram após 8 horas e são encerradas ao reiniciar o servidor ou clicar em Sair.

## Alterar usuário e senha
Defina ACCESS_PASSWORD no ambiente do processo e execute node server/set-password.js Cris. A senha deve ter pelo menos 12 caracteres. Remova a variável depois e reinicie o servidor para invalidar as sessões anteriores. Não inclua a senha em arquivos versionados.

## Publicação externa
Use HTTPS. Quando houver um proxy HTTPS na frente do Node, configure COOKIE_SECURE=true. Configure HOST e PORT conforme a hospedagem; o padrão escuta somente em 127.0.0.1:3000. Mantenha o arquivo privado de credenciais disponível no servidor. Este modelo utiliza um único usuário compartilhado, sem cadastro público e sem banco de dados.

## Verificação
Testados: páginas e API sem sessão, credenciais inválidas, login válido, acesso autenticado, cookie HttpOnly/SameSite, rejeição de origem externa, logout e invalidação da sessão. Build aprovado.

## Administração das integrações

O usuário único configurado administra o sistema em `/admin.html`. Não é necessário criar outro login. As rotas `/api/admin/*` exigem sessão de administrador; gravações e novas consultas exigem origem igual à do aplicativo. As chaves dos fornecedores não são devolvidas pela API de configuração.

Configurações e contadores ficam em `server/.private/`, criptografados, fora do build e do Git. Preserve a pasta inteira ao atualizar o código. O contador representa tentativas locais, sem sincronizar créditos do fornecedor. Veja limites, criação de contas e implantação em [INTEGRACOES.md](INTEGRACOES.md).
