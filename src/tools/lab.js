const BLOCKED_SCHEMES = /^(?:javascript|data|file|ftp):/i;
const IPV4_PARTS = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export function normalizeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('URL is empty.');
  if (BLOCKED_SCHEMES.test(raw)) throw new Error('Unsupported or unsafe URL scheme.');
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const u = new URL(candidate);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only HTTP(S) URLs are supported.');
  u.hash = '';
  return u;
}

export function parseUrl(value) {
  const u = normalizeUrl(value);
  const host = u.hostname.toLowerCase();
  const labels = host.split('.').filter(Boolean);
  const registrableDomain = labels.length >= 2 ? labels.slice(-2).join('.') : host;
  return { normalized:u.href, protocol:u.protocol.slice(0,-1), hostname:host, registrableDomain,
    port:u.port || (u.protocol==='https:'?'443':'80'), path:u.pathname||'/', query:u.search?u.search.slice(1):'',
    parameters:[...u.searchParams.keys()], username:u.username||'', passwordPresent:Boolean(u.password), suspiciousScheme:false };
}

export async function sha256(input) {
  const bytes = typeof input==='string' ? new TextEncoder().encode(input) : new Uint8Array(await input.arrayBuffer());
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto is unavailable in this environment.');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function extractSignals(text) {
  const value=String(text??'');
  const emails=[...new Set(value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[])];
  const urls=[...new Set(value.match(/https?:\/\/[^\s<>()]+/gi)||[])];
  const ipv4=[...new Set(value.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)||[])].filter(ip=>IPV4_PARTS.test(ip)&&ip.split('.').every(n=>Number(n)<=255));
  const hashes=[...new Set(value.match(/\b(?:[a-f\d]{32}|[a-f\d]{40}|[a-f\d]{64})\b/gi)||[])];
  const dates=[...new Set(value.match(/\b(?:19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/g)||[])];
  const mentions=[...new Set(value.match(/@[a-z0-9_][a-z0-9_.-]{2,30}/gi)||[])];
  const domains=[...new Set(value.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi)||[])];
  return {emails,urls,ipv4,hashes,dates,mentions,domains};
}

export function usernamePermutations(value) {
  const base=String(value??'').trim().toLowerCase().replace(/[^a-z0-9._ -]/g,'').replace(/\s+/g,' ');
  if(!base)return[]; const compact=base.replace(/[._ -]+/g,''); const tokens=base.split(/[._ -]+/).filter(Boolean);
  const first=tokens[0]||compact,last=tokens.at(-1)||'',initials=tokens.map(x=>x[0]).join('');
  return [...new Set([base,compact,first,last,`${first}${last}`,`${first}.${last}`,`${first}_${last}`,`${initials}${last}`,`${first}${initials}`,`${compact}1`,`${compact}01`,`${compact}123`].filter(Boolean))].slice(0,20);
}

export function compareIdentities(a,b){
  const left=String(a??'').trim().toLowerCase(),right=String(b??'').trim().toLowerCase();
  if(!left||!right)return {score:0,signals:[]};
  const compact=x=>x.replace(/[^a-z0-9]/g,''); const signals=[];
  if(left===right)signals.push('EXACT_MATCH');
  if(compact(left)===compact(right))signals.push('NORMALIZED_MATCH');
  const l=left.replace(/[._ -]+/g,' '),r=right.replace(/[._ -]+/g,' ');
  if(l.split(' ').at(-1)===r.split(' ').at(-1))signals.push('LAST_TOKEN_MATCH');
  return {score:Math.min(100,signals.length===3?100:signals.length===2?80:signals.length===1?55:0),signals};
}

export function dmsToDecimal(degrees,minutes,seconds,hemisphere='N') {
  const d=Number(degrees),m=Number(minutes),s=Number(seconds); if(![d,m,s].every(Number.isFinite)||m<0||m>=60||s<0||s>=60)throw new Error('Invalid DMS coordinate.');
  return (/^[SW]$/i.test(hemisphere)?-1:1)*(Math.abs(d)+m/60+s/3600);
}
export function decimalToDms(value,axis='lat') { const n=Number(value); if(!Number.isFinite(n))throw new Error('Invalid decimal coordinate.'); const abs=Math.abs(n),degrees=Math.floor(abs),mf=(abs-degrees)*60,minutes=Math.floor(mf),seconds=(mf-minutes)*60; return {degrees,minutes,seconds:Number(seconds.toFixed(4)),hemisphere:axis==='lon'?(n<0?'W':'E'):(n<0?'S':'N')}; }
export function geoDistanceBearing(lat1,lon1,lat2,lon2) { const a=[lat1,lon1,lat2,lon2].map(Number); if(!a.every(Number.isFinite))throw new Error('Invalid coordinates.'); if(Math.abs(a[0])>90||Math.abs(a[2])>90||Math.abs(a[1])>180||Math.abs(a[3])>180)throw new Error('Coordinates out of range.'); const r=Math.PI/180,R=6371,p1=a[0]*r,p2=a[2]*r,dp=(a[2]-a[0])*r,dl=(a[3]-a[1])*r,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2,d=R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)),y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl); return {distanceKm:Number(d.toFixed(3)),bearing:Number(((Math.atan2(y,x)/r+360)%360).toFixed(2))}; }
export function normalizeTimestamp(value){const d=new Date(value);if(Number.isNaN(d.getTime()))throw new Error('Unrecognised timestamp.');return {iso:d.toISOString(),epochMs:d.getTime(),epochSeconds:Math.floor(d.getTime()/1000)};}
export function textDiff(a,b){const left=String(a??'').split(/\r?\n/),right=String(b??'').split(/\r?\n/),max=Math.max(left.length,right.length),rows=[];for(let i=0;i<max;i++)if(left[i]!==right[i])rows.push({line:i+1,before:left[i]??'',after:right[i]??''});return rows;}
export function evidenceStrength({sourceReliability=0,corroboration=0,provenance=0,humanVerified=false,contradictionPenalty=0}={}){const nums=[sourceReliability,corroboration,provenance].map(Number);if(!nums.every(Number.isFinite))throw new Error('Evidence inputs must be numeric.');const score=Math.max(0,Math.min(100,Math.round(nums.reduce((a,b)=>a+b,0)/3*100+(humanVerified?10:0)-Number(contradictionPenalty||0))));return {score,band:score>=80?'STRONG':score>=55?'REVIEW':'WEAK'};}
export async function fingerprintText(value){const text=String(value??'');return {algorithm:'SHA-256',fingerprint:await sha256(text),length:text.length};}
