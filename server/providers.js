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

export function validateDocument(kind, input, {allowAlphanumeric=false}={}) {
  if(kind==='cnpj'&&allowAlphanumeric){
    if(typeof input!=='string'||input.length>40)return null;
    const normalized=input.trim().toUpperCase();
    if(!/^(?:[0-9A-Z]{12}[0-9]{2}|[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-[0-9]{2})$/.test(normalized))return null;
    const value=normalized.replace(/[.\/-]/g,'');
    if(/^(\d)\1+$/.test(value))return null;
    // Receita Federal: module 11, character value = ASCII code minus 48.
    for(let size=12;size<14;size++){
      const sum=[...value.slice(0,size)].reduce((total,char,i)=>total+(char.charCodeAt(0)-48)*((size-1-i)%8+2),0);
      const remainder=sum%11;
      if(Number(value[size])!==(remainder<2?0:11-remainder))return null;
    }
    return value;
  }
  if(typeof input!=='string'||input.length>40||!/^[\d.\-/\s]+$/.test(input)) return null;
  const value=input.replace(/\D/g,'');
  if(kind==='cep') return value.length===8?value:null;
  const length=kind==='cpf'?11:14;
  if(value.length!==length||/^(\d)\1+$/.test(value)) return null;
  const base=kind==='cpf'?9:12;
  for(let size=base;size<base+2;size++) {
    const weights=kind==='cpf'?Array.from({length:size},(_,i)=>size+1-i):Array.from({length:size},(_,i)=>(size-1-i)%8+2);
    const remainder=value.slice(0,size).split('').reduce((sum,d,i)=>sum+Number(d)*weights[i],0)%11;
    if(Number(value[size])!==(remainder<2?0:11-remainder)) return null;
  }
  return value;
}
