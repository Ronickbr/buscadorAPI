# Administração de integrações

Mode: Operate. Extensão do sistema existente; sem alteração da identidade visual.

## Direction contract

THESIS: Configurar fontes gratuitas, chaves e limites em uma área única, legível e protegida pelo login existente. O usuário único configurado no servidor administra o sistema.

OWN-WORLD: Preservar fundo #111216, superfícies #1a1c22, texto #f2f3f5, secundário #b1b5c1 e ações #b7354d. Segoe UI/system-ui, bordas discretas e controles nativos.

STORY: Entender quais fontes dispensam chave, abrir o painel do fornecedor quando necessário, salvar uma chave sem exibi-la novamente e acompanhar tentativas locais sem confundi-las com saldo remoto.

FIRST VIEWPORT: Cabeçalho compacto com retorno às consultas; título e instruções de ativação; lista vertical de provedores, cada um com documentação, uso local, ativação, limite e botão de salvar. Mobile empilha os campos e mantém o acesso à administração.

FORM: Extensão funcional precisamente delimitada pelo pedido de integrações e campos de chave. Implementação em código, sem imagens ou conceito visual novo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verificação da extensão · 2026-10-17

Comparação documental e de código com PRODUCT.md, DESIGN.md, admin.html, src/style.css e src/admin.css:

- Cores: a administração carrega o estilo compartilhado e reutiliza fundo #111216, superfície #1a1c22, texto #f2f3f5, secundário #b1b5c1 e ação #b7354d. Os estados e links usam os acentos já existentes. Não foram criados ou alterados tokens nesta documentação.
- Fonte: herda Segoe UI/system-ui/sans-serif e corpo de 14px com entrelinha 1,55. A hierarquia local usa título de 32px (27px no mobile), títulos de provedores de 19px e rótulos de 13px, coerente com a família existente.
- Espaçamento e forma: contêiner de até 1100px, margens internas de 32px, cartões com 24px de preenchimento e cantos de 12px, além de intervalos recorrentes de 8px, 20px e 24px. Os campos mantêm fundo, borda e cantos do formulário compartilhado. As ações da administração removem localmente o gradiente, a sombra e o deslocamento herdados do botão principal.
- Responsividade: em até 700px, as margens passam a 16px, cartões a 18px e os campos de duas colunas passam a uma; cabeçalho, títulos dos provedores e ações se empilham. Entradas de texto usam 16px nesse tamanho. A central mantém o acesso à administração visível e reorganiza busca e ações nesse mesmo breakpoint.
- Acessibilidade observável no código: link de salto, navegação nomeada, status com anúncio educado, foco visível compartilhado e preferência por movimento reduzido herdada do sistema.

Parecer do finish reviewer informado no fechamento: **SHIP**. A administração e a central foram inspecionadas em desktop e mobile, sem necessidade de correções materiais. As capturas de revisão estão em `.impeccable/review/desktop.png`, `mobile.png`, `queries-desktop.png` e `queries-mobile.png`. Esta etapa de documentação comparou os arquivos; não repetiu a inspeção de navegador ou testes.

Drift preexistente registrado, sem reparo: DESIGN.md descreve a direção escura e sua paleta, mas não cataloga os gradientes, sombras e movimentos atualmente presentes nos cartões, botões e navegação da central em src/style.css. Não existe `.impeccable/design.json` neste projeto. DESIGN.md e os demais artefatos existentes foram preservados; este registro documenta somente a extensão funcional.
