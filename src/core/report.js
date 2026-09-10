import { calculateMetrics, contradictionTriage } from './engine.js';
import { buildShadowInvestigation } from './drift.js';
import { evaluateDecision } from './decision.js';
import { extractInstitutionalMemory } from './memory.js';

function esc(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function normalize(value='') { return String(value).trim().toLowerCase().replace(/\s+/g, ' '); }

function tokens(value='') {
  return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter(x => x.length >= 4))];
}

export function recommendPreInvestigationChecks(caseInput={}, state={}) {
  const memory = extractInstitutionalMemory(state);
  const haystack = tokens(`${caseInput.title||''} ${caseInput.objective||''} ${caseInput.type||''} ${caseInput.tags||''}`);
  const matched = memory.filter(item => {
    const patternTokens = tokens(`${item.pattern} ${item.examples.join(' ')}`);
    if (!haystack.length) return item.caseCount > 1;
    return patternTokens.some(token => haystack.includes(token)) || item.caseCount > 1 && item.type !== 'FALSIFIER_PATTERN';
  });
  const selected = matched.slice(0, 8);
  const checks = [];
  const add = (id, title, reason, basis) => { if (!checks.some(x => x.id === id)) checks.push({id,title,reason,basis}); };
  for (const item of selected) {
    if (item.type === 'FAILURE_SIGNATURE') add('source-diversity', 'Verify source independence', 'Recurring failure signatures indicate that corroboration may collapse onto the same source family.', item);
    if (item.type === 'REPAIR_MODE') add('repair-mode', 'Apply the historical repair mode', `Previous cases repeatedly required ${item.pattern.replaceAll('_',' ').toLowerCase()}.`, item);
    if (item.type === 'CONTRADICTION_PATTERN') add('contradiction-scan', 'Run contradiction triage early', 'Prior cases contain recurring contradiction patterns; scan before the narrative hardens.', item);
    if (item.type === 'FALSIFIER_PATTERN') add('falsifier-test', 'Define and test a falsifier', 'A reusable falsifier pattern exists in institutional memory and should be tested before confidence rises.', item);
  }
  if (!checks.length) {
    add('independence', 'Establish independent source coverage', 'No strong memory match was found; independence is a baseline control.', {type:'BASELINE',pattern:'source independence'});
    add('falsifier', 'Define the first falsifier', 'Prevent premature narrative lock-in by specifying what would disprove the leading hypothesis.', {type:'BASELINE',pattern:'falsification'});
    add('contradictions', 'Scan for contradictions', 'Run an early contradiction pass before treating relationships as established.', {type:'BASELINE',pattern:'contradiction scan'});
  }
  return {
    generatedAt: new Date().toISOString(),
    case: { title: caseInput.title || 'Untitled investigation', objective: caseInput.objective || '' },
    matchedPatterns: selected,
    recommendedChecks: checks,
    memoryDerived: selected.length > 0,
    principle: 'Institutional memory changes the starting checklist; it does not constitute evidence for the new case.'
  };
}

export function buildProfessionalReport(state={}, options={}) {
  const cases = Array.isArray(state.cases) ? state.cases : [];
  const evidence = Array.isArray(state.evidence) ? state.evidence : [];
  const hypotheses = Array.isArray(state.hypotheses) ? state.hypotheses : [];
  const decisions = Array.isArray(state.decisions) ? state.decisions : [];
  const contradictions = Array.isArray(state.contradictions) ? state.contradictions : [];
  const metrics = calculateMetrics(state);
  const shadow = buildShadowInvestigation(state);
  const memory = extractInstitutionalMemory(state);
  const latestCase = cases[cases.length - 1] || null;
  const latestDecision = decisions[decisions.length - 1] || null;
  const decisionResult = latestDecision ? evaluateDecision(latestDecision, state) : null;
  const triage = contradictionTriage(state);
  const preBrief = recommendPreInvestigationChecks(latestCase || {}, state);
  const title = options.title || (latestCase ? `Investigation Report — ${latestCase.title}` : 'OSINT Enterprise — Intelligence Report');
  const generated = new Date().toISOString();
  const status = decisionResult?.status || shadow.integrityStatus || 'REVIEW';
  const statusClass = status === 'PASS' || status === 'CLEAR' ? 'ok' : status === 'BLOCKED' || status === 'HIGH_RISK' ? 'bad' : 'warn';
  const decisionSummary = latestDecision
    ? `${latestDecision.title}: ${decisionResult.status} (${decisionResult.score}/100)`
    : 'No decision has been submitted.';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
:root{--bg:#071014;--panel:#0d1a20;--panel2:#102229;--line:#1b3038;--text:#e7f1f2;--muted:#91a7ac;--accent:#69d7d0;--ok:#7bd69a;--warn:#e6bd6a;--bad:#e77979}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 Inter,system-ui,sans-serif}.page{max-width:1100px;margin:auto;padding:42px}.cover{border-bottom:1px solid var(--line);padding-bottom:30px}.eyebrow{color:var(--accent);font-size:11px;letter-spacing:.16em;text-transform:uppercase}.title{font-size:34px;line-height:1.15;margin:9px 0}.muted{color:var(--muted)}.badge{display:inline-block;margin-top:12px;padding:5px 9px;border:1px solid var(--line);border-radius:5px;font-size:11px}.badge.ok{color:var(--ok);border-color:#24563a}.badge.warn{color:var(--warn);border-color:#5c4b26}.badge.bad{color:var(--bad);border-color:#603333}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.metric{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:9px;padding:14px}.metric b{display:block;font-size:25px}.metric span{color:var(--muted);font-size:11px}.section{margin-top:30px}.section h2{font-size:16px;margin:0 0 10px}.card{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:16px;margin:10px 0}.row{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--line);padding:10px 0}.row:first-child{border-top:0}.tag{font-size:10px;color:var(--muted);white-space:nowrap}.finding{margin:9px 0;padding:11px;border-left:2px solid var(--accent);background:#0a171c}.finding strong{display:block}.finding small{color:var(--muted)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:9px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}.callout{border:1px solid var(--line);border-radius:9px;padding:16px;background:#081318}.footer{margin-top:35px;padding-top:15px;border-top:1px solid var(--line);font-size:10px;color:var(--muted)}@media(max-width:700px){.page{padding:24px 16px}.grid{grid-template-columns:repeat(2,1fr)}.row{display:block}.tag{display:block;margin-top:5px}}@media print{body{background:#fff;color:#111}.page{max-width:none;padding:20px}.metric,.card,.callout{background:#fff;border-color:#bbb}.muted,.metric span,.tag,.footer{color:#555}}
</style></head><body><main class="page">
<section class="cover"><div class="eyebrow">OSINT Enterprise / Professional Intelligence Report</div><h1 class="title">${esc(title)}</h1><p class="muted">Evidence-first assessment with provenance, competing explanations, adversarial challenge, decision integrity and institutional memory.</p><span class="badge ${statusClass}">ASSESSMENT STATUS: ${esc(status)}</span><p class="muted">Generated ${esc(generated)}</p></section>
<section class="grid"><div class="metric"><b>${cases.length}</b><span>CASES</span></div><div class="metric"><b>${evidence.length}</b><span>EVIDENCE ITEMS</span></div><div class="metric"><b>${hypotheses.length}</b><span>HYPOTHESES</span></div><div class="metric"><b>${contradictions.length + triage.length}</b><span>CONTRADICTION SIGNALS</span></div></section>
<section class="section"><h2>1. Executive Assessment</h2><div class="callout"><strong>${esc(decisionSummary)}</strong><p class="muted">Shadow investigation: ${esc(shadow.integrityStatus)} with ${shadow.highRiskCount} high-risk and ${shadow.mediumRiskCount} medium-risk signals. ${shadow.falsificationGaps.length} falsification gap(s) remain.</p></div></section>
<section class="section"><h2>2. Evidence Integrity</h2><div class="card"><div class="row"><span>Verified evidence</span><strong>${metrics.verifiedPct}%</strong></div><div class="row"><span>Corroborated evidence</span><strong>${metrics.corroboratedPct}%</strong></div><div class="row"><span>AI-assisted evidence</span><strong>${metrics.aiPct}%</strong></div><div class="row"><span>Evidence records</span><strong>${evidence.length}</strong></div></div></section>
<section class="section"><h2>3. Competing Explanations &amp; Contradictions</h2><div class="card">${hypotheses.length ? hypotheses.slice(-8).reverse().map(h=>`<div class="row"><div><strong>${esc(h.statement)}</strong><div class="muted">Confidence ${Math.round(Number(h.confidence||0)*100)}% · Falsifier: ${esc(h.falsifier||'Not defined')}</div></div><span class="tag">${esc(h.status||'untested')}</span></div>`).join('') : '<p class="muted">No hypotheses recorded.</p>'}</div></section>
<section class="section"><h2>4. Adversarial Challenge</h2>${shadow.findings.slice(0,10).map(f=>`<div class="finding"><strong>${esc(f.type)} · ${esc(f.severity||'review')}</strong><small>${esc(f.message)} · Repair mode: ${esc(f.repairMode||'ANALYST_REVIEW')}</small></div>`).join('') || '<div class="card">No current reasoning-drift signals detected. This is not proof of correctness.</div>'}</section>
<section class="section"><h2>5. Decision Integrity</h2><div class="card">${latestDecision ? `<div class="row"><span>Decision</span><strong>${esc(latestDecision.title)}</strong></div><div class="row"><span>Integrity score</span><strong>${decisionResult.score}/100</strong></div><div class="row"><span>Gate status</span><strong>${esc(decisionResult.status)}</strong></div><div class="row"><span>Approval eligible</span><strong>${decisionResult.approvalEligible ? 'YES' : 'NO'}</strong></div><div class="row"><span>Blockers</span><span class="tag">${decisionResult.blockingReasons.length ? esc(decisionResult.blockingReasons.join(' | ')) : 'None'}</span></div>` : '<p class="muted">No decision recorded.</p>'}</div></section>
<section class="section"><h2>6. Institutional Memory &amp; Next-Investigation Guidance</h2><p class="muted">Memory is used to change the starting checklist, not to manufacture evidence.</p>${preBrief.recommendedChecks.map(c=>`<div class="finding"><strong>${esc(c.title)}</strong><small>${esc(c.reason)}</small></div>`).join('')}<table><thead><tr><th>Pattern</th><th>Type</th><th>Cases</th><th>Occurrences</th></tr></thead><tbody>${memory.slice(0,10).map(x=>`<tr><td>${esc(x.pattern)}</td><td>${esc(x.type)}</td><td>${x.caseCount}</td><td>${x.occurrences}</td></tr>`).join('') || '<tr><td colspan="4">No institutional memory recorded.</td></tr>'}</tbody></table></section>
<section class="section"><h2>7. Method &amp; Caveats</h2><div class="card"><p>This report is generated from the browser-local OSINT Enterprise state. Metrics and guardrails are deterministic. Candidate contradiction signals are not semantic proof; they require analyst review. Institutional memory is derived from recorded patterns and does not substitute for case-specific evidence.</p></div></section>
<div class="footer">OSINT Enterprise · Find the signal. Trace the evidence. Challenge the conclusion.</div></main></body></html>`;
}

export function reportFilename(state={}) {
  const c = state.cases?.[state.cases.length-1];
  const base = normalize(c?.title || 'osint-enterprise-report').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'osint-enterprise-report';
  return `${base}-report.html`;
}
