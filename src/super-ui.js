const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = v => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100);

function addStyle(){
  if($('superUiStyle')) return;
  const s=document.createElement('style'); s.id='superUiStyle';
  s.textContent=`
  .super-toolbar{display:flex;gap:10px;align-items:center;margin:18px 0 2px;flex-wrap:wrap}
  .command-search{flex:1;min-width:220px;background:#071318;border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:8px;outline:none}
  .command-search:focus{border-color:var(--a);box-shadow:0 0 0 3px #69d7d014}
  .super-kbd{font-size:9px;color:var(--muted);border:1px solid var(--line);padding:3px 6px;border-radius:5px}
  .signal-board{grid-column:span 12;display:grid;grid-template-columns:repeat(5,1fr);gap:9px}
  .signal-cell{background:linear-gradient(145deg,#0d1b20f5,#071115f5);border:1px solid var(--line);border-radius:11px;padding:14px;min-height:112px}
  .signal-cell .ey{display:block;margin-bottom:7px}.signal-cell strong{display:block;font-size:13px;margin-bottom:6px}.signal-cell small{display:block;font-size:10px;line-height:1.45}
  .signal-cell.next{border-color:#2b5e63;box-shadow:0 0 25px #69d7d00c}
  .next-actions{grid-column:span 12}.next-action{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:12px 0;border-top:1px solid #14282f}.next-action:first-child{border-top:0}.next-action div{min-width:0}.next-action strong{display:block;font-size:12px}.next-action small{display:block;margin-top:3px}
  .action-rank{font-size:9px;color:var(--a);border:1px solid #28555b;padding:4px 7px;border-radius:999px;white-space:nowrap}
  .report-preview{margin-top:13px}.report-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.report-grid>div{border:1px solid var(--line);border-radius:9px;padding:12px;background:#08161b}.report-grid strong{display:block;font-size:18px;margin:5px 0}.report-grid small{display:block;font-size:10px}
  .focus-strip{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:11px 13px;border:1px solid #28555b;background:#07171c;border-radius:9px;margin-bottom:12px}.focus-strip strong{font-size:12px}.focus-strip small{display:block}
  .entity-node{cursor:pointer}.entity-node:hover circle{stroke-width:3}.graph-canvas svg{width:100%;height:auto;min-height:230px}.graph-canvas text{fill:var(--text);font:10px system-ui,sans-serif;pointer-events:none}.graph-canvas .edge{stroke:#31535a;stroke-width:1.4}.graph-canvas .node{fill:#0d2a31;stroke:#69d7d0;stroke-width:1.5}
  @media(max-width:900px){.signal-board{grid-template-columns:1fr 1fr}.signal-cell{grid-column:span 1}.report-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:600px){.signal-board,.report-grid{grid-template-columns:1fr}.signal-cell{min-height:auto}}
  `;
  document.head.appendChild(s);
}

function ensureSearch(){
  if($('commandSearch')) return;
  const top=document.querySelector('.top'); if(!top) return;
  const wrap=document.createElement('div'); wrap.className='super-toolbar'; wrap.innerHTML=`<input id="commandSearch" class="command-search" type="search" placeholder="Search the workspace…" aria-label="Search workspace"><span class="super-kbd">Ctrl / ⌘ K</span>`;
  top.parentElement.insertBefore(wrap, document.querySelector('#view-command'));
  $('commandSearch').addEventListener('input',()=>filterCards($('commandSearch').value));
}
function filterCards(query){
  const q=String(query||'').trim().toLowerCase();
  document.querySelectorAll('.data-card').forEach(c=>c.style.display=!q||c.textContent.toLowerCase().includes(q)?'':'none');
}

function ensureSignalBoard(){
  if($('signalBoard')) return;
  const commandGrid=document.querySelector('#view-command .grid'); if(!commandGrid) return;
  const board=document.createElement('article'); board.id='signalBoard'; board.className='signal-board';
  board.innerHTML=['KNOW','THINK','WRONG','NEXT','MISSING'].map((x,i)=>`<div class="signal-cell ${i===3?'next':''}"><span class="ey">${x==='KNOW'?'WHAT DO WE KNOW?':x==='THINK'?'WHAT DO WE THINK?':x==='WRONG'?'WHAT COULD PROVE US WRONG?':x==='NEXT'?'WHAT SHOULD WE DO NEXT?':'WHAT ARE WE MISSING?'}</span><strong id="signal-${x.toLowerCase()}-title">—</strong><small id="signal-${x.toLowerCase()}-body">Waiting for workspace state.</small></div>`).join('');
  commandGrid.prepend(board);
}

function ensureNextActions(){
  if($('nextActions')) return;
  const grid=document.querySelector('#view-command .grid'); if(!grid) return;
  const card=document.createElement('article');card.id='nextActions';card.className='card next-actions';card.innerHTML='<h2>Next Best Investigative Actions</h2><p class="sub">The cockpit prioritizes the next move from the current evidence state — not from a fixed checklist.</p><div id="nextActionsList"></div>';
  grid.insertBefore(card,grid.children[1]||null);
}

function ensureReports(){
  const view=$('view-reports'); if(!view) return;
  if(!$('reportPreview')){const p=document.createElement('div');p.id='reportPreview';p.className='card report-preview';p.setAttribute('aria-live','polite');view.appendChild(p);}
}

function updateFocus(s){
  const old=$('focusStrip'); if(old)old.remove();
  const c=s.cases?.at(-1); if(!c)return;
  const view=$('view-cases'); if(!view)return;
  const strip=document.createElement('div');strip.id='focusStrip';strip.className='focus-strip';strip.innerHTML=`<div><strong>ACTIVE FOCUS · ${esc(c.title)}</strong><small>${esc(c.objective||'Objective pending')} · ${esc(c.status||'open')}</small></div><span class="tag">${esc(String(c.priority||'medium').toUpperCase())}</span>`;
  const list=$('casesList');if(list)view.insertBefore(strip,list);
}

function updateSignals(){
  const api=window.osintEnterprise;if(!api)return;
  const s=api.getState(); const ev=s.evidence||[], hs=s.hypotheses||[], cs=s.cases||[], rel=s.relationships||[];
  const verified=ev.filter(e=>e.humanVerified||e.status==='FACT');
  const top=hs.slice().sort((a,b)=>(Number(b.confidence)||0)-(Number(a.confidence)||0))[0];
  const missing=[];
  if(!cs.length)missing.push('Create an investigation objective');
  if(!ev.length)missing.push('Capture a source-backed evidence item');
  if(ev.length&&!verified.length)missing.push('Human-verify the strongest claim');
  if(!hs.length)missing.push('Add a falsifiable hypothesis');
  if(hs.length&&hs.every(h=>!h.falsifier))missing.push('Define a falsifier');
  if(!rel.length)missing.push('Map at least one evidence-backed relationship');
  const know=verified.length?`${verified.length} verified evidence item(s)`:'No evidence is yet verified';
  const think=top?`${top.statement} · ${pct(top.confidence)}% confidence`:'No leading hypothesis yet';
  const wrong=top?.falsifier||'Define a credible observation that would falsify the leading hypothesis';
  const next=missing[0]||'Run contradiction triage and review the decision gate';
  const miss=missing.length?missing.slice(0,3).join(' · '):'No baseline gap detected; test independence and temporal consistency';
  const set=(k,t,b)=>{if($(`signal-${k}-title`))$(`signal-${k}-title`).textContent=t;if($(`signal-${k}-body`))$(`signal-${k}-body`).textContent=b;};
  set('know',know,`Evidence integrity: ${pct(ev.filter(e=>e.status==='FACT').length/(ev.length||1))}% marked FACT.`);
  set('think',top?'LEADING HYPOTHESIS':'OPEN FIELD',think);
  set('wrong',top?'FALSIFIER':'ANTI-BIAS CONTROL',wrong);
  set('next',next,'Priority action generated from current workspace state.');
  set('missing',missing.length?`${missing.length} gap(s)`:'BASELINE CLEAN',miss);
  const list=$('nextActionsList');if(list){const actions=[];if(!cs.length)actions.push(['Create investigation','Start with an objective and scope.']);if(ev.length&&!verified.length)actions.push(['Verify strongest evidence','Do not let confidence outrun verification.']);if(!hs.length)actions.push(['Add hypothesis','Keep the explanation explicitly falsifiable.']);if(hs.length&&hs.every(h=>!h.falsifier))actions.push(['Add falsifier','Specify what would change your mind.']);if(!rel.length)actions.push(['Map relationship','Connect entities only when evidence supports the link.']);actions.push(['Run contradiction triage','Actively search for incompatible claims.']);actions.push(['Review governance','Validate state before exporting or reporting.']);list.innerHTML=actions.slice(0,5).map((a,i)=>`<div class="next-action"><div><strong>${esc(a[0])}</strong><small>${esc(a[1])}</small></div><span class="action-rank">NEXT ${i+1}</span></div>`).join('');}
  updateFocus(s);
}

function bindSuperActions(){
  document.addEventListener('click',e=>{
    const focus=e.target.closest('[data-focus-case]');
    if(focus){e.preventDefault();const id=focus.dataset.focusCase;const s=window.osintEnterprise?.getState?.();const c=s?.cases?.find(x=>x.id===id);if(c){window.osintEnterprise.showView('cases');setTimeout(()=>{const strip=$('focusStrip');if(strip)strip.querySelector('strong').textContent=`ACTIVE FOCUS · ${c.title}`;strip?.scrollIntoView({behavior:'smooth',block:'start'});},0);}}
  });
}

function boot(){
  addStyle();ensureSearch();ensureSignalBoard();ensureNextActions();ensureReports();bindSuperActions();
  let tries=0;const wait=setInterval(()=>{if(window.osintEnterprise){clearInterval(wait);updateSignals();setInterval(updateSignals,1000);}if(++tries>30)clearInterval(wait);},100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
