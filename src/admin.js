const list=document.getElementById('providers'),status=document.getElementById('adminStatus');
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function field(label,input){const container=el('label',undefined,'admin-field');container.append(el('span',label),input);return container;}
function input(type,value){const n=el('input');n.type=type;if(value!==undefined)n.value=value;return n;}
function draw(p){
  const form=el('form',undefined,'provider-settings');form.dataset.provider=p.id;
  const heading=el('div',undefined,'provider-heading'),title=el('div');title.append(el('h2',p.name),el('p',p.description));
  const badge=el('span',!p.configured?'Chave pendente':p.enabled?'Ativada':'Desativada','provider-state');heading.append(title,badge);form.append(heading);
  const links=el('div',undefined,'provider-links');
  for(const [text,url]of [['Documentação',p.docs],['Criar conta / abrir painel',p.signup]])if(url){const a=el('a',text+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}form.append(links);
  const usage=el('div',undefined,'provider-usage');usage.append(el('strong',String(p.used)),el('span',`tentativas locais em ${p.month} · ${p.remaining===null?'sem cota mensal numérica publicada':`${p.remaining} restantes de ${p.monthlyLimit}`} · intervalo mínimo ${p.intervalSeconds} s`));form.append(usage);
  if(p.freeLimit){const meter=el('progress');meter.max=p.monthlyLimit||1;meter.value=p.used;meter.setAttribute('aria-label',`Consumo local de ${p.name}`);form.append(meter);}
  const fields=el('div',undefined,'provider-fields');
  const enabled=input('checkbox');enabled.checked=p.enabled;enabled.name='enabled';fields.append(field('Disponibilizar nas consultas',enabled));
  const limit=input('number',p.monthlyLimit??'');limit.min='0';limit.max=String(p.freeLimit??1000000);limit.step='1';limit.name='monthlyLimit';limit.placeholder='Sem limite mensal local';if(p.freeLimit)limit.required=true;
  fields.append(field(p.freeLimit?`Limite mensal local (máximo ${p.freeLimit})`:'Limite mensal local (opcional)',limit));
  let key,remove;
  if(p.requiresKey){
    key=input('password');key.name='apiKey';key.autocomplete='new-password';key.maxLength=2048;key.placeholder=p.configured?'Chave salva. Deixe vazio para manter.':'Cole a chave do plano gratuito';key.spellcheck=false;
    fields.append(field('Chave de API',key));
    remove=input('checkbox');remove.name='removeKey';fields.append(field('Remover a chave salva (desativa a integração)',remove));
  }
  form.append(fields);
  const actions=el('div',undefined,'provider-actions'),message=el('p',undefined,'provider-message');message.setAttribute('role','status');const save=el('button','Salvar integração','btn-submit');save.type='submit';actions.append(message,save);form.append(actions);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    save.disabled=true;message.textContent='Salvando…';
    try{
      const response=await fetch(`/api/admin/providers/${p.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:remove?.checked?false:enabled.checked,monthlyLimit:limit.value===''?null:Number(limit.value),...(key?{apiKey:key.value,removeKey:remove.checked}:{})})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível salvar.');
      // Clear the input immediately; saved keys are never sent back by the server.
      if(key)key.value='';
      const replacement=draw(data.provider);form.replaceWith(replacement);replacement.querySelector('.provider-message').textContent='Configuração salva.';replacement.querySelector('button[type=submit]').focus();
    }catch(error){message.textContent=error.message;}finally{save.disabled=false;}
  });return form;
}
async function load(){
  list.setAttribute('aria-busy','true');status.textContent='Atualizando integrações…';
  try{
    const response=await fetch('/api/admin/providers');if(response.status===401){location.assign('/login');return;}
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível carregar.');
    list.replaceChildren(...data.providers.map(draw));document.getElementById('usageNote').textContent=data.usageNote;status.textContent=`${data.providers.length} integrações disponíveis. Configuração não confirma disponibilidade do fornecedor.`;
  }catch(error){status.textContent=error.message;}finally{list.setAttribute('aria-busy','false');}
}
document.getElementById('reloadProviders').addEventListener('click',load);load();
