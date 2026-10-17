# Integrações gratuitas

Após entrar, selecione **APIs gratuitas** para consultar ou **Administração** para configurar. A administração também está em `/admin.html`; `/admin` funciona no servidor de produção. O usuário único definido em `server/.credentials.json` é o administrador. Nenhuma credencial padrão é incluída no repositório.

## Fontes disponíveis

| Provedor | Consulta | Chave | Condição anunciada em 17/10/2026 |
| --- | --- | --- | --- |
| [BrasilAPI](https://brasilapi.com.br/docs) | CNPJ numérico | Não | Pública; cota mensal numérica não confirmada |
| [Minha Receita](https://docs.minhareceita.org/como-usar/) | CNPJ numérico | Não | Pública; atualização depende da base |
| [CNPJ.ws](https://docs.cnpj.ws/referencia-de-api/api-publica/consultando-cnpj) | CNPJ numérico | Não | Até 3 requisições por minuto/IP |
| [ReceitaWS](https://developers.receitaws.com.br/) | CNPJ numérico | Não | Até 3 consultas por minuto; apenas cache |
| [ViaCEP](https://viacep.com.br/) | Endereço por CEP | Não | Não identifica moradores |
| [CPFHub](https://www.cpfhub.io/documentacao/inicio) | Nome, gênero e nascimento por CPF | Sim | 50 créditos gratuitos/mês; consulta simples custa 1 crédito |
| [API CPF Nacional](https://www.cpf-brasil.org/documentacao/) | Nome, sexo, nascimento e mãe por CPF | Sim | 10 consultas gratuitas/mês |

As fontes anteriores continuam no catálogo e têm disponibilidade independente. Condições e campos dos provedores podem mudar. As integrações não criam contas nem contratam planos automaticamente.

## Cadastrar uma chave

1. Abra **Administração**.
2. No provedor de CPF, use **Criar conta / abrir painel** e escolha o plano gratuito no fornecedor.
3. Cole a chave no campo protegido, configure o limite local e marque **Disponibilizar nas consultas**.
4. Clique em **Salvar integração** e volte às consultas.

Campo de chave vazio mantém a chave salva. Para substituí-la, cole uma nova. Marcar **Remover a chave salva** remove a chave e desativa a integração. A chave nunca é devolvida pela API de configuração. As fontes de CPF começam desativadas; as fontes públicas começam ativadas.

## Consumo e cotas

O contador registra **tentativas locais**, inclusive falhas, timeouts e consultas sem resultado. Não é o saldo de créditos do fornecedor. O limite é reservado e gravado antes da chamada; chamadas simultâneas dentro do mesmo processo não ultrapassam a cota. Editar uma chave, ativar/desativar ou alterar o limite não zera o consumo.

Os limites máximos locais de CPF são 50 para CPFHub e 10 para API CPF Nacional; podem ser reduzidos até zero. O período local renova no dia 1 às 00h UTC. Confira se o ciclo do fornecedor coincide e reduza/desative a cota se houver consumo em outros sistemas. Não há garantia de ausência de cobrança numa conta paga ou numa chave compartilhada. O contador não recupera o saldo remoto e não deve ser usado como extrato financeiro.

As fontes públicas permitem limite mensal local opcional. Intervalos locais evitam chamadas em sequência (21 segundos para CNPJ.ws e ReceitaWS); o fornecedor pode impor limites adicionais por conta/IP. Não há testes automáticos que gastem créditos, fallback pago ou envio de um mesmo CPF a vários provedores.

Carregar páginas, atualizar configurações e ler os contadores não chama os provedores. O novo fluxo usa POST entre navegador e servidor, valida os documentos e permite somente destinos HTTPS predefinidos, sem seguir redirecionamentos. As chaves vão no cabeçalho da chamada feita pelo servidor. Novos registros do histórico não armazenam os documentos consultados nem as respostas. O comportamento do histórico anterior foi preservado.

## Armazenamento e implantação

Use Node.js 22.12 ou superior. Execute `npm ci`, `npm run build` e `npm start`; para desenvolvimento, use `npm run dev`. Configure o acesso conforme [ACESSO.md](ACESSO.md). A compilação inclui as páginas principal, cadastral e administrativa.

Configurações, chaves e contadores ficam em `server/.private/integrations.enc`, criptografados com AES-256-GCM. A chave local está em `server/.private/encryption.key`. Esses arquivos estão fora de `dist` e são ignorados pelo Git. Restrinja o acesso à pasta privada ao usuário do serviço, usando permissões/ACL do sistema operacional.

**Preserve e faça backup da pasta privada inteira em volume persistente.** Perder a chave impede ler os dados criptografados; perder as configurações também perde os contadores. Não exclua arquivos para renovar cotas. A criptografia não protege contra alguém que obtenha o arquivo e a chave local do servidor.

Execute **um único processo Node** com esse armazenamento. Múltiplas réplicas precisam de banco compartilhado com transações para coordenar as cotas. Não execute desenvolvimento e produção simultaneamente com a mesma pasta privada. Use HTTPS e `COOKIE_SECURE=true` quando apropriado ao proxy.

## Verificação

`npm test` testa documentos, autenticação e logout, autorização, origem, criptografia, remoção e substituição de chave, limites concorrentes, renovação mensal, destinos permitidos e falhas do fornecedor. Os testes usam respostas simuladas, sem chaves reais ou consumo de créditos.

Também foi verificado no navegador o fluxo compilado de login, administração, persistência de configuração, consulta simulada, histórico sem documento no novo fluxo, ausência de erros JavaScript, layout em 1440 px e 390 px e logout. Consultas CPF reais dependem das chaves cadastradas pelo proprietário.

Em uma verificação pontual dos endpoints públicos em 17/10/2026, ViaCEP, Minha Receita, CNPJ.ws e ReceitaWS responderam HTTP 200 com JSON. BrasilAPI respondeu HTTP 403 neste ambiente. Isso pode variar conforme rede e disponibilidade; a interface não classifica uma fonte como online apenas por estar configurada. Nenhuma chave ou consulta CPF real foi utilizada nessa verificação.
