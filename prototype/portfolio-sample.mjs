import {createOperationsDemoStore} from './campaign-operations-model.mjs';
const key='portfolio_iq_creators',intakeKey='portfolio_iq_intake';
const read=(k,fallback=[])=>{try{return JSON.parse(localStorage.getItem(k))||fallback;}catch{return fallback;}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function profiles(){
  let rows=read(key);if(rows.length)return rows;
  rows=createOperationsDemoStore().creators.map((c,i)=>({...c,canEdit:true,brands:['Lumen Grove'],history:[],historyCount:0,coverage:{verifiedPosts:0},portfolioPosts:[],sourcePackages:[],paymentObligations:[],agency:null,bio:'Fictional skincare and lifestyle creator.',email:c.email,accounts:c.accounts.map(a=>({...a,avgViews:5400+i*900,engagementRate:3.1+i*.2}))}));
  const names=['Owen Brook','Lena Reed','Emery Shore','Iris Maple','Finn Alder','Sage Bell','Milo Frost','Zoe Clover','Remy Lane','Eden Moss','Luca Fern','Ada Birch'];
  rows.push(...names.map((displayName,i)=>({id:crypto.randomUUID(),displayName,code:'SAMPLE-'+(i+7),categories:['Beauty','Lifestyle'],email:displayName.toLowerCase().replace(' ','.')+'@example.invalid',hasEmail:true,canEdit:true,accounts:[{platform:i%2?'tiktok':'instagram',handle:'@portfolio_sample_'+(i+7),followers:14000+i*3700,url:null}],brands:[],history:[],historyCount:0,posts:[],portfolioPosts:[],sourcePackages:[],paymentObligations:[],coverage:{verifiedPosts:0}})));
  write(key,rows);return rows;
}
export async function portfolioRequest(raw,{method,body}={}){
  const url=new URL(raw,location.href),path=url.pathname;
  if(path==='/api/runtime')return {mode:'demo',persistence:'local',creatorProfilePreview:false};
  if(path==='/api/auth/session')return {mode:'demo',authenticated:false};
  if(path==='/api/creator-library'){
    let rows=profiles();const p=url.searchParams;
    if(p.get('creatorId'))rows=rows.filter(c=>c.id===p.get('creatorId'));
    if(p.get('q'))rows=rows.filter(c=>JSON.stringify([c.displayName,c.categories,c.accounts]).toLowerCase().includes(p.get('q').toLowerCase()));
    if(p.get('platform')&&!['all',''].includes(p.get('platform')))rows=rows.filter(c=>c.accounts.some(a=>a.platform===p.get('platform')));
    if(p.get('emailAvailability'))rows=rows.filter(c=>c.hasEmail===(p.get('emailAvailability')==='has_email'));
    if(p.get('agency'))rows=rows.filter(c=>c.agency===p.get('agency'));
    if(p.get('collaboration'))rows=rows.filter(c=>(c.collaborationTypes||[]).includes(p.get('collaboration')));
    if(p.get('brands'))rows=rows.filter(c=>(c.brands||[]).some(b=>p.get('brands').split(',').includes(b)));
    if(p.get('costcoOnly')==='true')rows=rows.filter(c=>c.costcoCreator);
    if(p.get('campaign')||p.get('stage'))rows=rows.filter(c=>(c.relationships||[]).some(r=>(!p.get('campaign')||r.campaignId===p.get('campaign'))&&(!p.get('stage')||r.stage===p.get('stage'))));
    const total=rows.length,offset=Number(p.get('offset')||0),limit=Number(p.get('limit')||24);
    return {data:{items:rows.slice(offset,offset+limit),total,source:'portfolio_local',filters:{brands:['Lumen Grove','Tidewell','Fieldnote'],campaigns:[]},capturedAt:new Date().toISOString()}};
  }
  if(path==='/api/creator-library/fee-reviews')return {data:[]};
  if(path==='/api/creator-intake'){
    let items=read(intakeKey);
    if(method==='POST'&&body?.action==='upload'){
      const result=await fetch('/api/sample-parse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const parsed=await result.json();if(!result.ok)throw Error(parsed.error||'Could not read creator file.');
      const rows=profiles();const added=parsed.rows.map((data,i)=>{const id=crypto.randomUUID(),creatorId=crypto.randomUUID();const intake={id,creatorId,state:'attention',data,missing:[],createdAt:new Date().toISOString()};rows.push({id:creatorId,displayName:data.displayName||data.name||'Imported sample '+(i+1),code:'IMPORTED-'+(rows.length+1),categories:data.categories||[],accounts:data.accounts||[],email:data.email||'',hasEmail:!!data.email,canEdit:true,posts:[],history:[],historyCount:0,brands:[],coverage:{verifiedPosts:0},intake});return intake;});items.push(...added);write(key,rows);write(intakeKey,items);return {data:{items:added,total:items.length},enrichmentAvailable:false};
    }
    if(method==='POST'&&body?.action==='evidence'){
      const result=await fetch('/api/sample-parse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const parsed=await result.json();if(!result.ok)throw Error(parsed.error);
      const item=items.find(x=>x.id===body.id);if(!item)throw Error('Imported profile unavailable.');item.data={...item.data,...parsed.data};write(intakeKey,items);const rows=profiles();const c=rows.find(x=>x.id===item.creatorId);Object.assign(c,item.data,{intake:item,hasEmail:!!item.data.email});write(key,rows);return {data:item};
    }
    const offset=Number(url.searchParams.get('offset')||0);return {data:{items:items.slice(offset,offset+100),total:items.length},enrichmentAvailable:false};
  }
  throw new Error('This connected workflow is unavailable in the public sample.');
}


