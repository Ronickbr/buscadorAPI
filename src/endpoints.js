export const CATEGORIES = [
  { id: 'all', name: 'Todas as APIs', icon: '⚡' },
  { id: 'pessoas', name: 'Pessoas & Documentos', icon: '👤' },
  { id: 'telefones', name: 'Telefones & Cadastro', icon: '📞' },
  { id: 'veiculos', name: 'Veículos & Detran', icon: '🚗' },
  { id: 'credito', name: 'Crédito & Finanças', icon: '💰' },
  { id: 'fotos', name: 'Fotos & Imagens', icon: '📸' },
  { id: 'trabalho', name: 'Trabalho & RAIS', icon: '💼' },
  { id: 'completa', name: 'Consultas Multi-busca', icon: '🔍' }
];

export const ENDPOINTS = [
  {
    id: 'consulta_serasa',
    name: 'Consulta Serasa',
    category: 'pessoas',
    endpoint: 'consulta_serasa.php',
    badge: 'FULL DADOS',
    description: 'Retorna CPF, Nome, Sexo, Nascimento, Mãe, Pai, Estado Civil, RG, Renda, Telefone, Endereço, PIS e Parentes.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '60235209872', type: 'text' },
      { name: 'telefone', label: 'Telefone', placeholder: '42984138233', type: 'text' },
      { name: 'email', label: 'E-mail', placeholder: 'exemplo@hotmail.com', type: 'email' },
      { name: 'rg', label: 'RG', placeholder: '132629306', type: 'text' },
      { name: 'cpf_parente', label: 'CPF do Parente', placeholder: '5111264680', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'MARIA HELENA DE OLIVEIRA LEMOS', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por CPF', params: { cpf: '60235209872' } },
      { label: 'Exemplo por Telefone', params: { telefone: '42984138233' } },
      { label: 'Exemplo por RG', params: { rg: '132629306' } },
      { label: 'Exemplo por Nome', params: { nome: 'MARIA HELENA DE OLIVEIRA LEMOS' } }
    ]
  },
  {
    id: 'spc1',
    name: 'SPC 1 - Restritivo',
    category: 'pessoas',
    endpoint: 'spc1.php',
    badge: 'RESTRITIVO',
    description: 'Consulta restritiva financeira por documento (CPF/CNPJ), nome ou telefone.',
    params: [
      { name: 'doc', label: 'Documento (CPF/CNPJ)', placeholder: '00021775176215', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'FRANCISCO DE SOUZA', type: 'text' },
      { name: 'telefone', label: 'Telefone', placeholder: '6899712632', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por Documento', params: { doc: '00021775176215' } },
      { label: 'Exemplo por Nome', params: { nome: 'FRANCISCO DE SOUZA' } },
      { label: 'Exemplo por Telefone', params: { telefone: '6899712632' } }
    ]
  },
  {
    id: 'spc2',
    name: 'SPC 2 - Multi Parâmetros',
    category: 'pessoas',
    endpoint: 'spc2.php',
    badge: 'ADVANCED',
    description: 'Consulta detalhada por múltiplos critérios (CPF, Nome, E-mail, CEP, Placa, CNPJ, Mãe ou Renavam).',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '00000008435120', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'DERCIO MUNHOZ', type: 'text' },
      { name: 'email', label: 'E-mail', placeholder: 'bibliografia@terra.com.br', type: 'email' },
      { name: 'cep', label: 'CEP', placeholder: '70380765', type: 'text' },
      { name: 'placa', label: 'Placa Veicular', placeholder: 'ELX4481', type: 'text' },
      { name: 'cnpj', label: 'CNPJ', placeholder: '12703748000130', type: 'text' },
      { name: 'nome_mae', label: 'Nome da Mãe', placeholder: 'MARIA SOCORRO', type: 'text' },
      { name: 'renavan', label: 'Renavam', placeholder: '281346089', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por CPF', params: { cpf: '00000008435120' } },
      { label: 'Exemplo por Placa', params: { placa: 'ELX4481' } },
      { label: 'Exemplo por CNPJ', params: { cnpj: '12703748000130' } }
    ]
  },
  {
    id: 'situacao',
    name: 'Situação Cadastral Receita',
    category: 'pessoas',
    endpoint: 'situacao.php',
    badge: 'RFB',
    description: 'Verificação rápida de situação cadastral do CPF perante a Receita Federal.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '84038225291', type: 'text', required: true }
    ],
    examples: [
      { label: 'Exemplo por CPF', params: { cpf: '84038225291' } }
    ]
  },
  {
    id: 'dados01',
    name: 'Dados 01 - Ação Específica',
    category: 'pessoas',
    endpoint: 'dados01.php',
    badge: 'ACTION QUERY',
    description: 'Realiza consultas direcionadas por tipo de ação (consultar_cpf, buscar_nome, buscar_mae, buscar_pai, buscar_rg).',
    params: [
      {
        name: 'action',
        label: 'Tipo de Ação',
        type: 'select',
        options: [
          { value: 'consultar_cpf', label: 'Consultar CPF (action=consultar_cpf)' },
          { value: 'buscar_nome', label: 'Buscar Nome (action=buscar_nome)' },
          { value: 'buscar_mae', label: 'Buscar Mãe (action=buscar_mae)' },
          { value: 'buscar_pai', label: 'Buscar Pai (action=buscar_pai)' },
          { value: 'buscar_rg', label: 'Buscar RG (action=buscar_rg)' }
        ]
      },
      { name: 'cpf', label: 'CPF (se action=consultar_cpf)', placeholder: '00000008338', type: 'text' },
      { name: 'nome', label: 'Nome (se action=buscar_nome)', placeholder: 'MARCIA FERREIRA DA SILVA', type: 'text' },
      { name: 'mae', label: 'Mãe (se action=buscar_mae)', placeholder: 'MARIA DO SOCORRO CARLOS', type: 'text' },
      { name: 'pai', label: 'Pai (se action=buscar_pai)', placeholder: 'JOSÉ CABRAL DE SOUZA', type: 'text' },
      { name: 'rg', label: 'RG (se action=buscar_rg)', placeholder: '95029054229', type: 'text' }
    ],
    examples: [
      { label: 'Consultar CPF', params: { action: 'consultar_cpf', cpf: '00000008338' } },
      { label: 'Buscar por Nome', params: { action: 'buscar_nome', nome: 'MARCIA FERREIRA DA SILVA' } },
      { label: 'Buscar por Mãe', params: { action: 'buscar_mae', mae: 'MARIA DO SOCORRO CARLOS' } }
    ]
  },
  {
    id: 'basic220m',
    name: 'Basic 220M',
    category: 'pessoas',
    endpoint: 'basic220m.php',
    badge: '220M BASE',
    description: 'Base simplificada de dados cadastrais para mais de 220 milhões de registros.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '00000000272', type: 'text', required: true }
    ],
    examples: [
      { label: 'Exemplo CPF', params: { cpf: '00000000272' } }
    ]
  },
  {
    id: 'br21m',
    name: 'BR 21M',
    category: 'pessoas',
    endpoint: 'br21m.php',
    badge: '21M BASE',
    description: 'Consulta rápida por documento ou número de telefone na base BR 21M.',
    params: [
      { name: 'doc', label: 'Documento', placeholder: '00010636761770', type: 'text' },
      { name: 'telefone', label: 'Telefone com DDD', placeholder: '21981184274', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por Documento', params: { doc: '00010636761770' } },
      { label: 'Exemplo por Telefone', params: { telefone: '21981184274' } }
    ]
  },
  {
    id: 'brazilianpeople',
    name: 'Brazilian People',
    category: 'pessoas',
    endpoint: 'brazilianpeople.php',
    badge: 'POPULAÇÃO',
    description: 'Dados populacionais detalhados por CPF.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '01254607242', type: 'text', required: true }
    ],
    examples: [
      { label: 'Exemplo CPF', params: { cpf: '01254607242' } }
    ]
  },
  {
    id: 'telefone0',
    name: 'Telefone 0',
    category: 'telefones',
    endpoint: 'telefone0.php',
    badge: 'TEL BASE',
    description: 'Localiza contatos telefônicos por CPF, CEP de localização ou número de telefone.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '07388292853', type: 'text' },
      { name: 'cep', label: 'CEP', placeholder: '13405188', type: 'text' },
      { name: 'telefone', label: 'Telefone com DDD', placeholder: '19996101067', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por CPF', params: { cpf: '07388292853' } },
      { label: 'Exemplo por CEP', params: { cep: '13405188' } },
      { label: 'Exemplo por Telefone', params: { telefone: '19996101067' } }
    ]
  },
  {
    id: 'telefone1',
    name: 'Telefone 1 - Busca Avançada',
    category: 'telefones',
    endpoint: 'telefone1.php',
    badge: 'TEL PRO',
    description: 'Consulta avançada de dados telefônicos cruzados com nome, CPF e CEP.',
    params: [
      { name: 'telefone', label: 'Telefone com DDD', placeholder: '81998662800', type: 'text' },
      { name: 'cpf', label: 'CPF', placeholder: '91733000130', type: 'text' },
      { name: 'cep', label: 'CEP', placeholder: '58150000', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'JANIO MARINHO DE CARVALHO', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por Telefone', params: { telefone: '81998662800' } },
      { label: 'Exemplo por CPF', params: { cpf: '91733000130' } }
    ]
  },
  {
    id: 'api_cad_claro_nex',
    name: 'Claro / NEX / CADsus / Nextel',
    category: 'telefones',
    endpoint: 'api_cad_claro_nex.php',
    badge: 'CADASTROS',
    description: 'Consultas às bases de operadoras (Claro, Nextel) e SUS (CADsus) por CPF, nome, celular ou email.',
    params: [
      {
        name: 'tabela',
        label: 'Tabela / Base',
        type: 'select',
        options: [
          { value: 'CLARO_CPF', label: 'Claro (CLARO_CPF)' },
          { value: 'cadsus', label: 'CADsus (cadsus)' },
          { value: 'nextel', label: 'Nextel (nextel)' }
        ]
      },
      { name: 'cpf', label: 'CPF', placeholder: '81720017034', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'JANIRA PORTO RODRIGUES', type: 'text' },
      { name: 'telefone', label: 'Telefone', placeholder: '53991313318', type: 'text' },
      { name: 'celular', label: 'Celular', placeholder: '5564999864829', type: 'text' },
      { name: 'email', label: 'E-mail', placeholder: 'exemplo@gmail.com', type: 'email' }
    ],
    examples: [
      { label: 'Claro por CPF', params: { tabela: 'CLARO_CPF', cpf: '81720017034' } },
      { label: 'CADsus por CPF', params: { tabela: 'cadsus', cpf: '01065963149' } },
      { label: 'Nextel por Telefone', params: { tabela: 'nextel', telefone: '11947694236' } }
    ]
  },
  {
    id: 'credauto_bin',
    name: 'Credauto BIN Veicular',
    category: 'veiculos',
    endpoint: 'credauto_bin.php',
    badge: 'BIN COMPLETA',
    description: 'Consulta oficial BIN por Placa, Chassi, Renavam, Motor, Câmbio ou Eixos.',
    params: [
      {
        name: 'campo',
        label: 'Campo de Pesquisa',
        type: 'select',
        options: [
          { value: 'PLACA', label: 'Placa' },
          { value: 'CHASSI', label: 'Chassi' },
          { value: 'RENAVAM', label: 'Renavam' },
          { value: 'NUM_MOTOR', label: 'Número do Motor' },
          { value: 'NUM_CAIXA_CAMBIO', label: 'Caixa de Câmbio' },
          { value: 'NUM_EIXO_TRAS', label: 'Eixo Traseiro' },
          { value: 'NUM_TERC_EIXO', label: 'Terceiro Eixo' },
          { value: 'NUM_IDENT_IMP', label: 'Identificador Importador' }
        ]
      },
      { name: 'valor', label: 'Valor da Busca', placeholder: 'MNL9299', type: 'text', required: true }
    ],
    examples: [
      { label: 'Busca por Placa', params: { campo: 'PLACA', valor: 'MNL9299' } },
      { label: 'Busca por Chassi', params: { campo: 'CHASSI', valor: '9C2MC35004R007317' } },
      { label: 'Busca por Renavam', params: { campo: 'RENAVAM', valor: '00831853026' } }
    ]
  },
  {
    id: 'credauto_emplacamento',
    name: 'Credauto Emplacamento',
    category: 'veiculos',
    endpoint: 'credauto_emplacamento.php',
    badge: 'EMPLACAMENTO',
    description: 'Histórico e dados cadastrais de emplacamento do veículo por Chassi ou Placa.',
    params: [
      {
        name: 'campo',
        label: 'Campo de Pesquisa',
        type: 'select',
        options: [
          { value: 'PLACA', label: 'Placa' },
          { value: 'CHASSI', label: 'Chassi' }
        ]
      },
      { name: 'valor', label: 'Valor', placeholder: 'IBW6445', type: 'text', required: true }
    ],
    examples: [
      { label: 'Busca por Placa', params: { campo: 'PLACA', valor: 'IBW6445' } },
      { label: 'Busca por Chassi', params: { campo: 'CHASSI', valor: 'C653ABR26671T' } }
    ]
  },
  {
    id: 'consulta_bv_detran',
    name: 'Consulta BV Detran',
    category: 'veiculos',
    endpoint: 'consulta_bv_detran.php',
    badge: 'DETRAN',
    description: 'Consulta de débitos, multas e restrições no Detran via Placa.',
    params: [
      { name: 'placa', label: 'Placa Veicular', placeholder: 'GNB6074', type: 'text', required: true }
    ],
    examples: [
      { label: 'Exemplo por Placa', params: { placa: 'GNB6074' } }
    ]
  },
  {
    id: 'credilink',
    name: 'Credilink Financeiro',
    category: 'credito',
    endpoint: 'credilink.php',
    badge: 'CREDILINK',
    description: 'Retorna informações de cadastro financeiro, renda estimada, CEP e familiares.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '07060114068', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'ROMEU ALTMANN', type: 'text' },
      { name: 'email', label: 'E-mail', placeholder: 'exemplo@yahoo.com.br', type: 'email' },
      { name: 'nome_mae', label: 'Nome da Mãe', placeholder: 'LIDIA MATHILDE ELY ALTMANN', type: 'text' },
      { name: 'cep', label: 'CEP', placeholder: '90690230', type: 'text' }
    ],
    examples: [
      { label: 'Exemplo por CPF', params: { cpf: '07060114068' } },
      { label: 'Exemplo por Nome', params: { nome: 'ROMEU ALTMANN' } }
    ]
  },
  {
    id: 'compras_paycom',
    name: 'Compras Paycom 1 & 2',
    category: 'credito',
    endpoint: 'compras_paycom.php',
    badge: 'E-COMMERCE',
    description: 'Histórico de compras e transações online por documento ou número de telefone.',
    params: [
      { name: 'identity', label: 'Identity / Documento (CPF)', placeholder: '12442233797', type: 'text' },
      { name: 'telephone', label: 'Telephone (Paycom 1)', placeholder: '1143211234', type: 'text' }
    ],
    examples: [
      { label: 'Paycom 1 por Identity', params: { identity: '12442233797' } },
      { label: 'Paycom 1 por Telephone', params: { telephone: '1143211234' } }
    ]
  },
  {
    id: 'fotoma_fotoro',
    name: 'Foto MA & Foto RO',
    category: 'fotos',
    endpoint: 'fotoma.php',
    badge: 'FOTO ESTADUAL',
    description: 'Retorna imagem da foto de documento de identificação oficial por CPF ou Nome.',
    params: [
      {
        name: 'script',
        label: 'Estado / Origem',
        type: 'select',
        options: [
          { value: 'fotoma.php', label: 'Maranhão (fotoma.php)' },
          { value: 'fotoro.php', label: 'Rondônia (fotoro.php)' }
        ]
      },
      { name: 'cpf', label: 'CPF', placeholder: '23915528315', type: 'text' },
      { name: 'nome', label: 'Nome Completo', placeholder: 'NILTON MARIO CHAGAS', type: 'text' }
    ],
    examples: [
      { label: 'Foto MA por CPF', params: { script: 'fotoma.php', cpf: '23915528315' } },
      { label: 'Foto RO por CPF', params: { script: 'fotoro.php', cpf: '16034740215' } }
    ]
  },
  {
    id: 'fotos_id',
    name: 'Fotos por ID (03/04/06/07/08)',
    category: 'fotos',
    endpoint: 'foto03.php',
    badge: 'FOTO BATCH',
    description: 'Busca fotos armazenadas em lotes através de identificador numérico/CPF.',
    params: [
      {
        name: 'script',
        label: 'Lote de Fotos',
        type: 'select',
        options: [
          { value: 'foto03.php', label: 'Lote 03 (foto03.php)' },
          { value: 'foto04.php', label: 'Lote 04 (foto04.php)' },
          { value: 'foto06.php', label: 'Lote 06 (foto06.php)' },
          { value: 'foto07.php', label: 'Lote 07 (foto07.php)' },
          { value: 'foto08.php', label: 'Lote 08 (foto08.php)' }
        ]
      },
      { name: 'id', label: 'ID / Código', placeholder: '05347979704', type: 'text', required: true }
    ],
    examples: [
      { label: 'Foto 03 Exemplo', params: { script: 'foto03.php', id: '05347979704' } },
      { label: 'Foto 04 Exemplo', params: { script: 'foto04.php', id: '10579434796' } },
      { label: 'Foto 07 Exemplo', params: { script: 'foto07.php', id: '00000052744' } }
    ]
  },
  {
    id: 'rais2019',
    name: 'RAIS Trabalhista 2019',
    category: 'trabalho',
    endpoint: 'rais2019.php',
    badge: 'MTE / RAIS',
    description: 'Histórico de vínculos empregatícios e salários da base RAIS 2019 por CPF.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '03492845126', type: 'text', required: true }
    ],
    examples: [
      { label: 'Exemplo CPF', params: { cpf: '03492845126' } }
    ]
  },
  {
    id: 'api_full',
    name: 'API Full Multi-Busca',
    category: 'completa',
    endpoint: 'api_full.php',
    badge: 'ULTIMATE',
    description: 'Pesquisa em múltiplos bancos simultaneamente por CPF, Telefone, Placa, Email ou CEP.',
    params: [
      { name: 'cpf', label: 'CPF', placeholder: '11790064961', type: 'text' },
      { name: 'telefone', label: 'Telefone', placeholder: '42984138233', type: 'text' },
      { name: 'placa', label: 'Placa Veicular', placeholder: 'GNB6074', type: 'text' },
      { name: 'email', label: 'E-mail', placeholder: 'valdambroski@hotmail.com', type: 'email' },
      { name: 'cep', label: 'CEP', placeholder: '13405188', type: 'text' }
    ],
    examples: [
      { label: 'Busca por CPF', params: { cpf: '11790064961' } },
      { label: 'Busca por Telefone', params: { telefone: '42984138233' } },
      { label: 'Busca por Placa', params: { placa: 'GNB6074' } },
      { label: 'Busca por E-mail', params: { email: 'valdambroski@hotmail.com' } }
    ]
  }
];
