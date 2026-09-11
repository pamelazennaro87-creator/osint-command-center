const WORDS = s => String(s ?? '').toLowerCase().match(/[\p{L}\p{N}@._'-]+/gu) || [];
const URL_RE = /https?:\/\/[^\s<>()]+/gi;
const ISO_RE = /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/g;
const SPEAKER_RE = /^\s*([^:]{1,80}):\s*(.*)$/;

export function parseChat(text='') {
  const lines=String(text).split(/\r?\n/); const messages=[]; let current=null;
  for(const line of lines){
    const m=line.match(SPEAKER_RE);
    const iso=line.match(ISO_RE)?.[0];
    if(m){ if(current) messages.push(current); current={speaker:m[1].trim(),text:m[2].trim(),timestamp:iso||null,line:messages.length+1}; }
    else if(current && line.trim()) current.text += `\n${line.trim()}`;
  }
  if(current) messages.push(current);
  const speakers=[...new Set(messages.map(x=>x.speaker))];
  const urls=[...new Set((String(text).match(URL_RE)||[]))];
  const responseIntervals=[];
  for(let i=1;i<messages.length;i++){
    const a=messages[i-1],b=messages[i]; if(a.timestamp&&b.timestamp){const ta=Date.parse(a.timestamp),tb=Date.parse(b.timestamp);if(Number.isFinite(ta)&&Number.isFinite(tb)&&tb>=ta)responseIntervals.push({from:a.speaker,to:b.speaker,minutes:Number(((tb-ta)/60000).toFixed(2))});}
  }
  return {messages,speakers,messageCount:messages.length,urls,responseIntervals,warning:'Parsing is format-dependent; an absent timestamp or speaker label is not evidence of deletion.'};
}

export function behavioralProfile(messages=[]) {
  const rows=Array.isArray(messages)?messages:[]; const bySpeaker={};
  for(const m of rows){const s=String(m.speaker||'Unknown');const words=WORDS(m.text);const bucket=bySpeaker[s] ||= {speaker:s,messages:0,words:0,questions:0,urls:0,uppercaseTokens:0};bucket.messages++;bucket.words+=words.length;bucket.questions+=(String(m.text).match(/\?/g)||[]).length;bucket.urls+=(String(m.text).match(URL_RE)||[]).length;bucket.uppercaseTokens+=words.filter(w=>/[A-ZÀ-ÖØ-Þ]{3,}/.test(w)).length;}
  const patterns=Object.values(bySpeaker).map(x=>({...x,avgWordsPerMessage:x.messages?Number((x.words/x.messages).toFixed(1)):0,signals:[...(x.questions?['QUESTIONING_PATTERN']:[]),...(x.urls?['LINK_SHARING_PATTERN']:[]),...(x.uppercaseTokens?['EMPHASIS_PATTERN']:[])]}));
  return {observed:patterns,method:'Observable communication features only; no personality, criminality or psychological diagnosis is inferred.',alternatives:['Context and platform formatting can explain the same pattern.','Short samples can be unrepresentative.'],falsifier:'A larger, independently sourced sample showing the pattern is absent or materially different.'};
}

export function conversationDNA(a=[],b=[]) {
  const sig=rows=>{const words=WORDS(rows.map(x=>x.text||x).join(' '));const counts=new Map();for(const w of words)counts.set(w,(counts.get(w)||0)+1);return {total:words.length,counts};};
  const A=sig(a),B=sig(b); if(!A.total||!B.total)return {similarity:0,signals:[],warning:'Insufficient text for a meaningful comparison.'};
  const common=[...A.counts.keys()].filter(w=>B.counts.has(w)); const union=new Set([...A.counts.keys(),...B.counts.keys()]);
  const jaccard=common.length/union.size; const signals=[]; if(jaccard>.35)signals.push('LEXICAL_OVERLAP_SIGNAL');
  return {similarity:Number((jaccard*100).toFixed(1)),commonTerms:common.slice(0,50),signals,warning:'Similarity is not authorship attribution or proof that two samples came from the same person.'};
}

export function coordinationDetector(groups=[]) {
  const events=groups.flatMap(g=>(g.events||[]).map(e=>({...e,group:String(g.name||g.id||'group')}))).filter(e=>Number.isFinite(Date.parse(e.time)));
  events.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)); const clusters=[];
  for(let i=0;i<events.length;i++){const base=Date.parse(events[i].time);const members=events.slice(i+1).filter(e=>Math.abs(Date.parse(e.time)-base)<=60000);const groupsSeen=new Set([events[i].group,...members.map(e=>e.group)]);if(groupsSeen.size>=2)clusters.push({anchor:events[i],participants:[events[i],...members].slice(0,20),groupCount:groupsSeen.size,windowSeconds:60});}
  return {clusters:clusters.slice(0,50),warning:'Temporal proximity is a coordination signal only; shared schedules, automation or reposting can produce the same pattern.'};
}

export function narrativeDrift(statements=[]) {
  const token=WORDS; const rows=statements.map((s,i)=>({index:i,source:s.source||`statement-${i+1}`,tokens:new Set(token(s.text))})); const deltas=[];
  for(let i=1;i<rows.length;i++){const prev=rows[i-1].tokens,next=rows[i].tokens;deltas.push({from:rows[i-1].source,to:rows[i].source,added:[...next].filter(x=>!prev.has(x)).slice(0,100),removed:[...prev].filter(x=>!next.has(x)).slice(0,100)});}
  return {deltas,warning:'Narrative change can result from clarification, editing, translation or context; it is not itself evidence of deception.'};
}

export function claimTrap(claim='',evidence=[]) {
  const terms=WORDS(claim); const text=evidence.map(e=>String(e.claim||e.text||'')).join(' '); const have=new Set(WORDS(text)); const unsupported=terms.filter(x=>x.length>3&&!have.has(x));
  return {claim:String(claim),unsupportedTerms:[...new Set(unsupported)],supportCoverage:terms.length?Number(((terms.length-unsupported.length)/terms.length*100).toFixed(1)):0,warning:'Lexical coverage is a triage signal, not semantic verification.'};
}

export function ghostEntitySignals(entities=[],evidence=[]) {
  const linked=new Set(evidence.flatMap(e=>e.entityIds||[])); const ghosts=entities.filter(e=>!linked.has(e.id)).map(e=>({id:e.id,name:e.name,type:e.type}));
  return {ghostCandidates:ghosts,warning:'Unlinked entities may simply be intake records or pending research; absence of linkage is not evidence of fabrication.'};
}
