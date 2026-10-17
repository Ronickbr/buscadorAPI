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
