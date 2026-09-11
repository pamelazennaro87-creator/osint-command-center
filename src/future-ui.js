/* OSINT Command Center — futuristic interaction layer. Visual enhancement only; core state remains local. */
const ROOT=document.querySelector('.shell');
if(ROOT&&!window.__futureUiBooted){
  window.__futureUiBooted=true;
  const style=document.createElement('style');
  style.id='futureUiStyle';
  style.textContent=`
  .future-ready .card,.future-ready .signal-cell,.future-ready .tool-card{--mx:50%;--my:50%;position:relative;overflow:hidden}
  .future-ready .card:after,.future-ready .signal-cell:after,.future-ready .tool-card:after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(260px 160px at var(--mx) var(--my),rgba(98,230,220,.075),transparent 70%);opacity:0;transition:opacity .2s ease}
  .future-ready .card:hover:after,.future-ready .signal-cell:hover:after,.future-ready .tool-card:hover:after{opacity:1}
  .future-ready .nav button{position:relative;isolation:isolate}
  .future-ready .nav button:after{content:'';position:absolute;right:10px;top:50%;width:3px;height:3px;border-radius:50%;background:var(--ui-accent);opacity:0;box-shadow:0 0 12px var(--ui-accent);transform:translateY(-50%);transition:.18s}
  .future-ready .nav button.active:after{opacity:1}
  .future-ready .view.active{animation:futureViewIn .22s ease-out}
  @keyframes futureViewIn{from{opacity:.65;transform:translateY(5px)}to{opacity:1;transform:none}}
  .future-command-palette{position:fixed;inset:0;z-index:900;display:grid;place-items:start center;padding:12vh 18px 18px;background:rgba(2,6,8,.72);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:.16s ease}
  .future-command-palette.open{opacity:1;pointer-events:auto}
  .future-command-box{width:min(680px,100%);border:1px solid #315d64;border-radius:18px;background:linear-gradient(145deg,#0d171d,#071014);box-shadow:0 28px 90px rgba(0,0,0,.58),0 0 0 1px rgba(98,230,220,.04);overflow:hidden}
  .future-command-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--ui-border)}
  .future-command-head b{font-size:9px;letter-spacing:.18em;color:var(--ui-accent);white-space:nowrap}
  .future-command-input{width:100%;border:0;background:transparent;color:var(--ui-text);font:inherit;font-size:15px;outline:0;padding:4px}
  .future-command-list{padding:8px;max-height:min(55vh,430px);overflow:auto}
  .future-command-item{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:46px;padding:9px 11px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--ui-text);text-align:left;cursor:pointer}
  .future-command-item:hover,.future-command-item:focus{background:#102027;border-color:#28515a;outline:0}
  .future-command-item small{color:var(--ui-muted)}
  .future-command-empty{padding:18px;color:var(--ui-muted);font-size:11px}
  .future-hint{padding:9px 14px;border-top:1px solid var(--ui-border);font-size:9px;color:var(--ui-muted);display:flex;justify-content:space-between;gap:10px}
  .future-key{border:1px solid #29424a;border-radius:5px;padding:2px 5px;color:#b7c7ca}
  @media(prefers-reduced-motion:reduce){.future-command-palette,.future-ready .view.active{transition:none;animation:none}}
  `;
  document.head.appendChild(style);
  ROOT.classList.add('future-ready');

  const palette=document.createElement('div');
  palette.className='future-command-palette';
  palette.setAttribute('aria-hidden','true');
  palette.innerHTML=`<div class="future-command-box" role="dialog" aria-modal="true" aria-label="Command palette"><div class="future-command-head"><b>COMMAND</b><input class="future-command-input" id="futureCommandInput" autocomplete="off" placeholder="Jump to a workspace action…" aria-label="Command search"></div><div class="future-command-list" id="futureCommandList"></div><div class="future-hint"><span>Navigate the cockpit without leaving the keyboard.</span><span><span class="future-key">Esc</span> close · <span class="future-key">↵</span> run</span></div></div>`;
  document.body.appendChild(palette);
  const input=palette.querySelector('#futureCommandInput');
  const list=palette.querySelector('#futureCommandList');
  const commands=[
    ['Command Center','Open the primary intelligence cockpit',()=>goView('command')],
    ['Cases','Review and create investigations',()=>goView('cases')],
    ['Evidence','Trace sources and evidence chains',()=>goView('evidence')],
    ['Living Graph','Inspect entities and relationships',()=>goView('entities')],
    ['Hypotheses','Compare competing explanations',()=>goView('hypotheses')],
    ['Contradictions','Open the contradiction triage layer',()=>goView('contradictions')],
    ['Reports','Open report generation',()=>goView('reports')],
    ['Governance','Inspect validation and integrity',()=>goView('governance')],
    ['New investigation','Create a new local case',()=>clickAction('[data-action="new-case"],#newCase')],
    ['Add evidence','Add an evidence record',()=>clickAction('[data-action="new-evidence"]')],
    ['Run triage','Run contradiction triage',()=>clickAction('[data-action="triage"],#audit')],
    ['Generate report','Create a professional report',()=>clickAction('[data-action="create-report"],#report')]
  ];
  let filtered=[];
  let selected=0;
  function goView(view){const b=document.querySelector(`.nav button[data-view="${view}"]`);b?.click();closePalette()}
  function clickAction(selector){const b=document.querySelector(selector);if(b){b.click();closePalette()}else{closePalette()}}
  function render(){
    const q=input.value.trim().toLowerCase();
    filtered=commands.filter(c=>!q||c[0].toLowerCase().includes(q)||c[1].toLowerCase().includes(q));
    selected=Math.min(selected,Math.max(0,filtered.length-1));
    list.innerHTML=filtered.length?filtered.map((c,i)=>`<button type="button" class="future-command-item" data-command-index="${i}" aria-selected="${i===selected}"><span><strong>${esc(c[0])}</strong><br><small>${esc(c[1])}</small></span><small>${i===selected?'↵':''}</small></button>`).join(''):'<div class="future-command-empty">No matching command.</div>';
    list.querySelectorAll('[data-command-index]').forEach(b=>b.addEventListener('click',()=>filtered[Number(b.dataset.commandIndex)]?.[2]()));
  }
  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function openPalette(){palette.classList.add('open');palette.setAttribute('aria-hidden','false');input.value='';selected=0;render();requestAnimationFrame(()=>input.focus())}
  function closePalette(){palette.classList.remove('open');palette.setAttribute('aria-hidden','true')}
  input.addEventListener('input',()=>{selected=0;render()});
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(selected+1,Math.max(0,filtered.length-1));render()}
    else if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(0,selected-1);render()}
    else if(e.key==='Enter'){e.preventDefault();filtered[selected]?.[2]()}
    else if(e.key==='Escape'){e.preventDefault();closePalette()}
  });
  palette.addEventListener('click',e=>{if(e.target===palette)closePalette()});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}else if(e.key==='Escape'&&palette.classList.contains('open'))closePalette()});

  const search=document.querySelector('#commandSearch');
  if(search){search.title='Tip: Ctrl/Cmd+K opens the command palette';search.addEventListener('keydown',e=>{if(e.key==='Enter'&&search.value.trim()){document.dispatchEvent(new CustomEvent('occ:command-search',{detail:{query:search.value.trim()}}))}})}

  document.querySelectorAll('.card,.signal-cell,.tool-card').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${((e.clientX-r.left)/r.width)*100}%`);el.style.setProperty('--my',`${((e.clientY-r.top)/r.height)*100}%`)},{passive:true});
  });

  const status=document.querySelector('.status');
  if(status){status.setAttribute('title','Local workspace status');status.addEventListener('click',()=>{const s=document.querySelector('#runtimeStatus');if(s)s.textContent='Local-only interaction layer active';})}
}
