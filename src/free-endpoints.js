export const FREE_ENDPOINTS = [
  ['brasilapi','BrasilAPI · CNPJ','cnpj','Cadastro, atividades, endereço e sócios. Consulta pública sem chave.'],
  ['minhareceita','Minha Receita · CNPJ','cnpj','Dados públicos de empresas. Sem chave; atualização depende da base.'],
  ['cnpjws','CNPJ.ws · CNPJ','cnpj','Consulta pública sem chave. Até 3 requisições por minuto por IP.'],
  ['receitaws','ReceitaWS · CNPJ','cnpj','Consulta pública de empresas em cache. Até 3 consultas por minuto.'],
  ['viacep','ViaCEP · Endereço','cep','Encontre logradouro, bairro, município e UF pelo CEP. Não identifica moradores.'],
  ['cpfhub','CPFHub · CPF simples','cpf','Nome, gênero e nascimento. Até 50 créditos gratuitos/mês, conforme o fornecedor. Cadastre a chave na administração.'],
  ['cpfnacional','API CPF Nacional','cpf','Nome, sexo, nascimento e nome da mãe. Até 10 consultas gratuitas/mês, conforme o fornecedor. Cadastre a chave na administração.'],
].map(([provider,name,kind,description])=>({
  id:`free_${provider}`,provider,name,category:'gratuitas',endpoint:provider,
  badge:kind==='cpf'?'COTA GRATUITA':'PÚBLICA',description,
  params:[{name:kind,label:kind.toUpperCase(),placeholder:kind==='cep'?'00000-000':kind==='cnpj'?'00.000.000/0000-00':'000.000.000-00',type:'text',required:true}],
}));
