const tabs=[['overview','Overview'],['creators','Creators'],['outreach','Outreach'],['workflow','Workflow']];
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createSeedingCampaignTabs(){
 const selected=new Map();
 function select(id,tab){if(tabs.some(([key])=>key===tab))selected.set(id,tab);}
 function render(c,panels){const active=selected.get(c.id)||'overview';return `<div class="seeding-campaign-tabs" data-seeding-campaign="${esc(c.id)}"><nav class="seeding-tab-list" role="tablist" aria-label="Campaign sections">${tabs.map(([key,label])=>`<button type="button" role="tab" id="campaign-${esc(c.id)}-${key}-tab" aria-controls="campaign-${esc(c.id)}-${key}-panel" aria-selected="${active===key}" tabindex="${active===key?0:-1}" data-seeding-tab="${key}">${label}</button>`).join('')}</nav>${tabs.map(([key])=>`<section role="tabpanel" id="campaign-${esc(c.id)}-${key}-panel" aria-labelledby="campaign-${esc(c.id)}-${key}-tab" data-seeding-panel="${key}" ${active===key?'':'hidden'}>${panels[key]||''}</section>`).join('')}</div>`;}
 function install({root,onChange=()=>{}}){
  const activate=(slot,key,focus=false)=>{select(slot.dataset.seedingCampaign,key);for(const b of slot.querySelectorAll('[role="tab"][data-seeding-tab]')){const active=b.dataset.seedingTab===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();}for(const panel of slot.querySelectorAll('[data-seeding-panel]'))panel.hidden=panel.dataset.seedingPanel!==key;onChange(slot.dataset.seedingCampaign,key);};
  root.addEventListener('click',event=>{const button=event.target.closest('[data-seeding-tab],[data-seeding-next]'),slot=button?.closest('[data-seeding-campaign]');if(slot)activate(slot,button.dataset.seedingTab||button.dataset.seedingNext,!!button.dataset.seedingNext);});
  root.addEventListener('keydown',event=>{const button=event.target.closest('[role="tab"][data-seeding-tab]'),slot=button?.closest('[data-seeding-campaign]');if(!slot||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const i=tabs.findIndex(([key])=>key===button.dataset.seedingTab);const n=event.key==='Home'?0:event.key==='End'?3:(i+(event.key==='ArrowRight'?1:3))%4;activate(slot,tabs[n][0],true);});
 }
 return {render,select,install,clear:()=>selected.clear()};
}
export function seedingNextStep({creatorCount,outreachStarted=false}){
 return creatorCount?{tab:'outreach',label:outreachStarted?'View outreach':'Start outreach',description:'Prepare and review individual campaign invitations.'}:{tab:'creators',label:'Add creators',description:'Build this campaign’s creator roster to begin outreach.'};
}
export function renderSeedingNextStep(options){const step=seedingNextStep(options);return `<section class="panel seeding-next-step"><div><p class="eyebrow">Next step</p><h2>${step.label}</h2><p>${step.description}</p></div><button type="button" class="button button--primary" data-seeding-next="${step.tab}">${step.label}</button></section>`;}
