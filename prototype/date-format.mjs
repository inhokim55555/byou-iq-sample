// Presentation only. Stored values and form submissions remain ISO dates.
export function displayDate(value,timeZone='America/Los_Angeles',missing='Not recorded') {
 if(value===null||value===undefined||value==='')return missing;
 const text=String(value),day=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
 if(day){const date=new Date(text+'T12:00:00Z');return Number.isFinite(+date)&&date.toISOString().slice(0,10)===text?`${day[2]}-${day[3]}-${day[1]}`:missing;}
 if(!(value instanceof Date)&&typeof value!=='number'&&(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!displayDate(value.slice(0,10),'UTC','')))return missing;
 const date=new Date(value);if(!Number.isFinite(+date))return missing;
 try{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone,day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(date).map(p=>[p.type,p.value]));return `${parts.month}-${parts.day}-${parts.year}`;}catch{return missing;}
}
export function displayDateTime(value,timeZone='America/Los_Angeles',missing='Date unavailable',includeZone=false) {
 const date=displayDate(value,timeZone,missing);if(date===missing||/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return date;
 try{return date+', '+new Intl.DateTimeFormat('en-US',{timeZone,hour:'numeric',minute:'2-digit',...(includeZone?{timeZoneName:'short'}:{})}).format(new Date(value));}catch{return missing;}
}
export function parseDisplayDate(value) {
 const match=/^(\d{2})-(\d{2})-(\d{4})$/.exec(String(value).trim());
 if(!match)return null;
 const iso=`${match[3]}-${match[1]}-${match[2]}`;
 return displayDate(iso,'UTC','')===match[0]?iso:null;
}
