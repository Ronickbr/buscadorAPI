// Only documented public/free endpoints belong in this allowlist.
export const PROVIDERS = [
  {id:'brasilapi', name:'BrasilAPI · CNPJ', kind:'cnpj', alphanumeric:true, docs:'https://brasilapi.com.br/docs#tag/CNPJ', freeLimit:null, interval:1000, description:'CNPJ numérico ou alfanumérico: cadastro, atividades, endereço e sócios. API pública sem chave; fonte Minha Receita.', url:value=>`https://brasilapi.com.br/api/cnpj/v1/${value}`},
  {id:'minhareceita', name:'Minha Receita · CNPJ', kind:'cnpj', docs:'https://docs.minhareceita.org/como-usar/', freeLimit:null, interval:1000, description:'Cadastro de empresas da base pública. Sem garantia de atualização em tempo real.', url:value=>`https://minhareceita.org/${value}`},
  {id:'cnpjws', name:'CNPJ.ws · CNPJ', kind:'cnpj', docs:'https://docs.cnpj.ws/referencia-de-api/api-publica/consultando-cnpj', freeLimit:null, interval:21000, description:'API pública: até 3 consultas por minuto por IP, somente na base do fornecedor.', url:value=>`https://publica.cnpj.ws/cnpj/${value}`},
  {id:'receitaws', name:'ReceitaWS · CNPJ', kind:'cnpj', docs:'https://developers.receitaws.com.br/', freeLimit:null, interval:21000, description:'API pública: até 3 consultas por minuto. Retorna somente empresas em cache.', url:value=>`https://receitaws.com.br/v1/cnpj/${value}`},
  {id:'viacep', name:'ViaCEP · Endereço', kind:'cep', docs:'https://viacep.com.br/', freeLimit:null, interval:1000, description:'Endereço por CEP, sem chave. Não identifica moradores.', url:value=>`https://viacep.com.br/ws/${value}/json/`},
  {id:'cpfhub', name:'CPFHub · CPF simples', kind:'cpf', docs:'https://www.cpfhub.io/documentacao/inicio', signup:'https://app.cpfhub.io', freeLimit:50, interval:2100, description:'Nome, gênero e nascimento. O fornecedor anuncia 50 créditos gratuitos por mês.', url:value=>`https://api.cpfhub.io/cpf/${value}`},
  {id:'cpfnacional', name:'API CPF Nacional', kind:'cpf', docs:'https://www.cpf-brasil.org/documentacao/', signup:'https://www.cpf-brasil.org/', freeLimit:10, interval:1000, description:'Nome, sexo, nascimento e nome da mãe. O fornecedor anuncia 10 consultas gratuitas por mês.', url:value=>`https://api.cpf-brasil.org/cpf/${value}`},
];

export {validateDocument} from '../shared/documents.js';
