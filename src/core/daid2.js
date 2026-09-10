const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, Number(n) || 0));

export const DAID_VERSION = '2.0';
export const DAID_TERMS = Object.freeze({
  BRIDGEWORD:'Bridgeword', FAILURE_SIGNATURE:'Failure Signature', REPAIR_MODE:'Repair Mode', INTENT_ENVELOPE:'Intent Envelope',
  UNCERTAINTY_ETIQUETTE:'Uncertainty Etiquette', ARTIFICIAL_RESPONSE_DRIFT:'Artificial Response Drift', ASSURANCE_FEEDBACK:'Assurance Feedback',
  COGNITIVE_SYNCING:'Cognitive Syncing', DATA_GRAVITY:'Data Gravity', GENERALIZATION_MIRAGE:'Generalization Mirage', SIGNAL_DEBT:'Signal Debt',
  PATTERN_OVERSHOOT:'Pattern Overshoot', TRIAGE_INTELLIGENCE:'Triage Intelligence', BOT_FRUSTRATION:'Bot Frustration', RULE_SKELETON:'Rule Skeleton', THE_SEVENTH_ZERO:'The Seventh Zero'
});
function unique(values){return [...new Set(values.filter(Boolean))];}
function languageOf(e){return e?.originalLanguage||e?.language||'';}
export function buildDAID2(state={},matrix=null){
 const m=matrix||{},counts=m.counts||{},gaps=Array.isArray(m.gaps)?m.gaps:[],evidence=Array.isArray(state.evidence)?state.evidence:[],hypotheses=Array.isArray(state.hypotheses)?state.hypotheses:[],contradictions=Array.isArray(state.contradictions)?state.contradictions:[],decisions=Array.isArray(state.decisions)?state.decisions:[];
 const unresolved=gaps.length+contradictions.filter(x=>String(x.status||'').toUpperCase()!=='RESOLVED').length;
 const verifiedRatio=evidence.length?evidence.filter(x=>x.humanVerified===true).length/evidence.length:0;
 const falsifierRatio=hypotheses.length?hypotheses.filter(x=>x.falsifierTested===true).length/hypotheses.length:0;
 const contradictionPressure=clamp(contradictions.length/Math.max(1,evidence.length));
 const signalDebt=clamp((gaps.length+Math.max(0,hypotheses.length-evidence.length))/Math.max(1,evidence.length+hypotheses.length+1));
 const integrity=clamp((Number(m.integrity)||0)/100);
 const translatedEvidence=evidence.filter(x=>Array.isArray(x.translations)&&x.translations.length);
 const unverifiedTranslations=translatedEvidence.filter(x=>x.translationStatus!=='HUMAN_VERIFIED');
 const languageSet=unique(evidence.map(languageOf));
 const failureSignatures=[];
 if(!evidence.length)failureSignatures.push('NO_EVIDENCE');
 if(gaps.some(g=>g.code==='SOURCE_DEPENDENCY'))failureSignatures.push('SOURCE_DEPENDENCY');
 if(gaps.some(g=>g.code==='UNTESTED_FALSIFIER'))failureSignatures.push('UNTESTED_FALSIFIER');
 if(gaps.some(g=>g.code==='OPEN_CONTRADICTION')||contradictions.some(x=>String(x.status).toUpperCase()!=='RESOLVED'))failureSignatures.push('OPEN_CONTRADICTION');
 if(gaps.some(g=>g.code==='DECISION_GAP'))failureSignatures.push('DECISION_GAP');
 if(hypotheses.length&&falsifierRatio===0)failureSignatures.push('PATTERN_OVERSHOOT_RISK');
 if(evidence.length>=3&&verifiedRatio===0)failureSignatures.push('VERIFICATION_DEBT');
 if(unverifiedTranslations.length)failureSignatures.push('TRANSLATION_DEBT');
 const repairModes=[];
 if(!evidence.length)repairModes.push({action:'CAPTURE_EVIDENCE',reason:'No evidence exists to support an analytical claim.'});
 if(evidence.length&&verifiedRatio<.5)repairModes.push({action:'VERIFY_EVIDENCE',reason:'Unverified evidence is limiting confidence propagation.'});
 if(gaps.some(g=>g.code==='SOURCE_DEPENDENCY'))repairModes.push({action:'SEEK_INDEPENDENT_ORIGIN',reason:'Repeated sources may share one origin.'});
 if(gaps.some(g=>g.code==='UNTESTED_FALSIFIER'))repairModes.push({action:'TEST_FALSIFIER',reason:'A live hypothesis lacks an adversarial test.'});
 if(contradictionPressure>0)repairModes.push({action:'TRIAGE_CONTRADICTION',reason:'Conflicting signals require explicit resolution.'});
 if(unverifiedTranslations.length)repairModes.push({action:'VERIFY_TRANSLATION',reason:'Translated evidence must remain distinguishable from the original and human verification.'});
 if(!decisions.length&&evidence.length)repairModes.push({action:'DEFER_DECISION',reason:'Evidence exists, but the decision layer is not yet populated.'});
 let mode='OBSERVE';
 if(failureSignatures.includes('NO_EVIDENCE'))mode='REPAIR';else if(failureSignatures.includes('OPEN_CONTRADICTION')||failureSignatures.includes('SOURCE_DEPENDENCY'))mode='CHALLENGE';else if(failureSignatures.includes('UNTESTED_FALSIFIER')||signalDebt>.35||failureSignatures.includes('TRANSLATION_DEBT'))mode='TEST';else if(integrity>=.75&&falsifierRatio>=.5)mode='DECIDE';
 const next=repairModes[0]||{action:'RUN_TRIAGE',reason:'No blocking repair signal; challenge the current interpretation before advancing.'};
 const uncertainty=integrity<.45?'HIGH':integrity<.75?'MEDIUM':'LOW';
 return {version:DAID_VERSION,terms:DAID_TERMS,mode,uncertainty,intentEnvelope:{objective:state.cases?.at(-1)?.objective||'No explicit investigation objective.',bounded:Boolean(state.cases?.at(-1)?.objective)},bridgeword:next.action,failureSignatures:unique(failureSignatures),repairModes,signalDebt:Math.round(signalDebt*100),patternOvershootRisk:Math.round(clamp((1-falsifierRatio)*.7+contradictionPressure*.3)*100),artificialResponseDrift:Math.round(clamp((1-verifiedRatio)*.6+signalDebt*.4)*100),cognitiveSync:Math.round(clamp(integrity*.55+verifiedRatio*.25+falsifierRatio*.2)*100),assuranceFeedback:{verifiedRatio:Math.round(verifiedRatio*100),falsifierRatio:Math.round(falsifierRatio*100),unresolvedSignals:unresolved,translationDebt:unverifiedTranslations.length},languageLayer:{sourceLanguages:languageSet,translatedEvidence:translatedEvidence.length,unverifiedTranslations:unverifiedTranslations.length,chain:'ORIGINAL → TRANSLATION → INTERPRETATION → INFERENCE'},nextBestAction:next,principle:'AI may accelerate reasoning; it may not silently upgrade uncertainty into evidence.',counts};
}
export function daid2PromptEnvelope(analysis){return {intent:analysis?.intentEnvelope||{},mode:analysis?.mode||'OBSERVE',uncertainty:analysis?.uncertainty||'HIGH',constraints:['Do not invent evidence','Separate observation from inference','Expose unresolved contradictions','State what would falsify the hypothesis','Preserve original-language evidence','Never mark machine translation human-verified automatically'],requiredOutput:['KNOWN','INFERRED','UNKNOWN','NEXT BEST ACTION']};}
