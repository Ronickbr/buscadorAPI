# Design

## Direção aprovada pelo usuário
Restaurar o tema escuro anterior. Resultados em uma seção abaixo do formulário, ocupando toda a largura disponível. Download em texto legível (.txt), sem estrutura JSON.

## Cores
Fundo #111216; superfície #1a1c22; texto #f2f3f5; secundário #b1b5c1; destaque #ee667a; ação #b7354d.

## Resultados e exportação
Seção inferior sem posição fixa ou limite de altura. Exportação UTF-8 com BOM e quebras de linha Windows para preservar acentos. Campos traduzidos com o mesmo dicionário da visualização, estruturas aninhadas indentadas e listas identificadas por registro. Visualização JSON continua disponível no painel.

## Verificação
Build de ambas as páginas e sintaxe JavaScript aprovados. Formatação TXT verificada com acentos, listas, objetos aninhados, valores nulos, booleanos, zero e texto simples.

## Visualizador cadastral (/consulta.html)
Implementação separada com fundo cinza-claro, cards brancos e títulos azul-escuro, conforme o briefing anexado. Cabeçalho cadastral, quatro resumos, cinco abas, tabelas com rolagem contida, endereços ordenados e seções técnicas expansíveis. O painel principal permanece escuro e com resultados inferiores.

A referência enviada foi usada para verificar nomes e estruturas dos campos. Dados pessoais não foram incluídos nos arquivos do projeto, no armazenamento do navegador ou nos logs. A entrada aceita JSON puro e o prefixo conhecido. Após carregar, o campo de entrada é limpo; os dados ficam somente em memória durante a sessão da página.

Validação: compilação, sintaxe e testes de parser, moeda, datas sem conversão de fuso, zeros, booleanos, máscaras, ordenação e estrutura da referência passaram. A página responde HTTP 200. Inspeção visual automatizada continua pendente devido à indisponibilidade da ferramenta de navegador nesta sessão.
