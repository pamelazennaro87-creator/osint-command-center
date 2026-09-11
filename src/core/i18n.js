/**
 * Professional i18n — key-based, re-render friendly.
 * Default: English. Full coverage for EN + IT, structure for DE/FR/ES.
 */

export const I18N_VERSION = '2.1';

export const SUPPORTED_LOCALES = Object.freeze({
  en: { label: 'English', native: 'English', dir: 'ltr' },
  it: { label: 'Italiano', native: 'Italiano', dir: 'ltr' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr' },
  fr: { label: 'French', native: 'Français', dir: 'ltr' },
  es: { label: 'Spanish', native: 'Español', dir: 'ltr' }
});

const STORAGE_KEY = 'occ.locale.v2';

const DICT = {
  'nav.command': { en: 'Command Center', it: 'Centro di Comando', de: 'Kommandozentrale', fr: 'Centre de commandement', es: 'Centro de mando' },
  'nav.cases': { en: 'Cases', it: 'Casi', de: 'Fälle', fr: 'Dossiers', es: 'Casos' },
  'nav.evidence': { en: 'Evidence', it: 'Prove', de: 'Beweise', fr: 'Preuves', es: 'Evidencias' },
  'nav.entities': { en: 'Entities & Graph', it: 'Entità e Grafo', de: 'Entitäten & Graph', fr: 'Entités & Graphe', es: 'Entidades y grafo' },
  'nav.hypotheses': { en: 'Hypotheses', it: 'Ipotesi', de: 'Hypothesen', fr: 'Hypothèses', es: 'Hipótesis' },
  'nav.contradictions': { en: 'Contradictions', it: 'Contraddizioni', de: 'Widersprüche', fr: 'Contradictions', es: 'Contradicciones' },
  'nav.reports': { en: 'Reports', it: 'Report', de: 'Berichte', fr: 'Rapports', es: 'Informes' },
  'nav.governance': { en: 'Governance', it: 'Governance', de: 'Governance', fr: 'Gouvernance', es: 'Gobernanza' },
  'brand.living': { en: 'LIVING ANALYST COCKPIT', it: 'COCKPIT ANALISTA VIVO', de: 'LEBENDIGES ANALYSTEN-COCKPIT', fr: 'COCKPIT ANALYSTE VIVANT', es: 'COCKPIT ANALISTA VIVO' },
  'search.placeholder': { en: 'Search the workspace…', it: 'Cerca nel workspace…', de: 'Workspace durchsuchen…', fr: 'Rechercher…', es: 'Buscar…' },
  'focus.none': { en: 'No active case', it: 'Nessun caso attivo', de: 'Kein aktiver Fall', fr: 'Aucun dossier actif', es: 'Ningún caso activo' },
  'focus.none.hint': { en: 'Create or select an investigation to focus the workspace.', it: 'Crea o seleziona un\'indagine per focalizzare il workspace.', de: 'Fall erstellen oder wählen.', fr: 'Créez ou sélectionnez une enquête.', es: 'Crea o selecciona una investigación.' },
  'focus.label': { en: 'FOCUS ·', it: 'FOCUS ·', de: 'FOKUS ·', fr: 'FOCUS ·', es: 'ENFOQUE ·' },
  'focus.clear': { en: 'Clear focus', it: 'Rimuovi focus', de: 'Fokus aufheben', fr: 'Effacer le focus', es: 'Quitar enfoque' },
  'focus.new': { en: '+ New case', it: '+ Nuovo caso', de: '+ Neuer Fall', fr: '+ Nouveau dossier', es: '+ Nuevo caso' },
  'focus.create': { en: '+ New investigation', it: '+ Nuova indagine', de: '+ Neue Untersuchung', fr: '+ Nouvelle enquête', es: '+ Nueva investigación' },
  'bias.title': { en: 'BIAS & INDEPENDENCE RADAR', it: 'RADAR BIAS E INDIPENDENZA', de: 'BIAS- & UNABHÄNGIGKEITS-RADAR', fr: 'RADAR BIAIS ET INDÉPENDANCE', es: 'RADAR DE SESGO E INDEPENDENCIA' },
  'bias.index': { en: 'Structural Bias Index', it: 'Indice di Bias Strutturale', de: 'Struktureller Bias-Index', fr: 'Indice de biais structurel', es: 'Índice de sesgo estructural' },
  'bias.activate': { en: '○ Activate Red Team Mode', it: '○ Attiva Red Team Mode', de: '○ Red Team Mode aktivieren', fr: '○ Activer le mode Red Team', es: '○ Activar modo Red Team' },
  'bias.active': { en: '● Red Team Mode ON', it: '● Red Team Mode ON', de: '● Red Team Mode AN', fr: '● Mode Red Team ACTIVÉ', es: '● Modo Red Team ACTIVADO' },
  'bias.mono': { en: 'Source mono-culture', it: 'Monocoltura fonti', de: 'Quellen-Monokultur', fr: 'Monoculture des sources', es: 'Monocultivo de fuentes' },
  'bias.inflation': { en: 'Confidence inflation', it: 'Inflazione di confidenza', de: 'Konfidenz-Inflation', fr: 'Inflation de confiance', es: 'Inflación de confianza' },
  'bias.untested': { en: 'Untested falsifiers', it: 'Falsificatori non testati', de: 'Ungetestete Falsifikatoren', fr: 'Falsificateurs non testés', es: 'Falsificadores no probados' },
  'bias.ai': { en: 'Unverified AI evidence', it: 'Prove AI non verificate', de: 'Unverifizierte KI-Beweise', fr: 'Preuves IA non vérifiées', es: 'Evidencia IA no verificada' },
  'bias.links': { en: 'Unsupported relationships', it: 'Relazioni non supportate', de: 'Nicht belegte Beziehungen', fr: 'Relations non étayées', es: 'Relaciones sin soporte' },
  'bias.shadow': { en: 'Shadow investigation risk', it: 'Rischio shadow investigation', de: 'Shadow-Investigation-Risiko', fr: 'Risque d\'enquête parallèle', es: 'Riesgo de investigación sombra' },
  'redteam.title': { en: 'Red Team Pressure Board', it: 'Red Team Pressure Board', de: 'Red-Team-Druckbrett', fr: 'Tableau de pression Red Team', es: 'Tablero de presión Red Team' },
  'redteam.off': { en: 'Red Team Mode is off. Activate it from the Bias Radar to force cognitive friction on gaps and unsupported claims.', it: 'Red Team Mode spento. Attivalo dal Bias Radar per forzare l\'attrito cognitivo.', de: 'Red Team Mode ist aus.', fr: 'Mode Red Team désactivé.', es: 'Modo Red Team desactivado.' },
  'redteam.principle': { en: 'Cognitive friction is intentional. Resolve or explicitly accept each item before deciding.', it: 'L\'attrito cognitivo è intenzionale. Risolvi o accetta esplicitamente ogni elemento prima di decidere.', de: 'Kognitive Reibung ist beabsichtigt.', fr: 'La friction cognitive est intentionnelle.', es: 'La fricción cognitiva es intencional.' },
  'metric.cases': { en: 'ACTIVE CASES', it: 'CASI ATTIVI', de: 'AKTIVE FÄLLE', fr: 'DOSSIERS ACTIFS', es: 'CASOS ACTIVOS' },
  'metric.evidence': { en: 'EVIDENCE ITEMS', it: 'ELEMENTI DI PROVA', de: 'BEWEISELEMENTE', fr: 'ÉLÉMENTS DE PREUVE', es: 'ELEMENTOS DE EVIDENCIA' },
  'metric.hypotheses': { en: 'HYPOTHESES', it: 'IPOTESI', de: 'HYPOTHESEN', fr: 'HYPOTHÈSES', es: 'HIPÓTESIS' },
  'metric.contradictions': { en: 'OPEN CONTRADICTIONS', it: 'CONTRADDIZIONI APERTE', de: 'OFFENE WIDERSPRÜCHE', fr: 'CONTRADICTIONS OUVERTES', es: 'CONTRADICCIONES ABIERTAS' },
  'action.new.investigation': { en: '+ New investigation', it: '+ Nuova indagine', de: '+ Neue Untersuchung', fr: '+ Nouvelle enquête', es: '+ Nueva investigación' },
  'action.new.evidence': { en: '+ Add evidence', it: '+ Aggiungi prova', de: '+ Beweis hinzufügen', fr: '+ Ajouter une preuve', es: '+ Añadir evidencia' },
  'action.new.entity': { en: '+ Entity', it: '+ Entità', de: '+ Entität', fr: '+ Entité', es: '+ Entidad' },
  'action.new.hypothesis': { en: '+ Add hypothesis', it: '+ Aggiungi ipotesi', de: '+ Hypothese hinzufügen', fr: '+ Ajouter une hypothèse', es: '+ Añadir hipótesis' },
  'action.new.relationship': { en: '+ Relationship', it: '+ Relazione', de: '+ Beziehung', fr: '+ Relation', es: '+ Relación' },
  'action.triage': { en: 'Run contradiction triage', it: 'Esegui triage contraddizioni', de: 'Widerspruchs-Triage', fr: 'Triage des contradictions', es: 'Triage de contradicciones' },
  'action.report': { en: 'Create professional report', it: 'Crea report professionale', de: 'Professionellen Bericht erstellen', fr: 'Créer un rapport professionnel', es: 'Crear informe profesional' },
  'action.focus': { en: 'Focus case', it: 'Focalizza caso', de: 'Fall fokussieren', fr: 'Focaliser', es: 'Enfocar caso' },
  'action.focused': { en: '● Focused', it: '● Focalizzato', de: '● Fokussiert', fr: '● Focalisé', es: '● Enfocado' },
  'action.restart.sim': { en: 'Restart simulation', it: 'Riavvia simulazione', de: 'Simulation neu starten', fr: 'Redémarrer', es: 'Reiniciar' },
  'section.challenge.sub': { en: 'Shadow investigation for reasoning drift, source dependency and unsupported confidence.', it: 'Shadow investigation per drift di ragionamento, dipendenza dalle fonti e confidenza non supportata.', de: 'Shadow-Investigation für Reasoning-Drift.', fr: 'Enquête parallèle pour dérive de raisonnement.', es: 'Investigación sombra para deriva de razonamiento.' },
  'section.matrix': { en: 'Evidence Intelligence Matrix', it: 'Matrice di Intelligence delle Prove', de: 'Beweis-Intelligence-Matrix', fr: 'Matrice d\'intelligence des preuves', es: 'Matriz de inteligencia de evidencia' },
  'section.integrity': { en: 'Evidence integrity', it: 'Integrità delle prove', de: 'Beweisintegrität', fr: 'Intégrité des preuves', es: 'Integridad de la evidencia' },
  'graph.living': { en: 'Living relationship graph', it: 'Grafo relazionale vivo', de: 'Lebendiger Beziehungsgraph', fr: 'Graphe relationnel vivant', es: 'Grafo de relaciones vivo' },
  'empty.cases': { en: 'No investigations yet.', it: 'Nessuna indagine ancora.', de: 'Noch keine Untersuchungen.', fr: 'Aucune enquête.', es: 'Aún no hay investigaciones.' },
  'empty.cases.hint': { en: 'Start with an objective, not a conclusion.', it: 'Inizia con un obiettivo, non con una conclusione.', de: 'Mit einem Ziel beginnen.', fr: 'Commencez par un objectif.', es: 'Empieza con un objetivo.' },
  'empty.evidence': { en: 'No evidence captured.', it: 'Nessuna prova catturata.', de: 'Keine Beweise erfasst.', fr: 'Aucune preuve.', es: 'Sin evidencia.' },
  'empty.evidence.hint': { en: 'Every claim should carry a source and an uncertainty status.', it: 'Ogni affermazione deve avere una fonte e uno stato di incertezza.', de: 'Jede Behauptung braucht Quelle und Status.', fr: 'Chaque affirmation doit avoir une source.', es: 'Toda afirmación debe tener fuente.' },
  'empty.hypotheses': { en: 'No hypotheses.', it: 'Nessuna ipotesi.', de: 'Keine Hypothesen.', fr: 'Aucune hypothèse.', es: 'Sin hipótesis.' },
  'empty.hypotheses.hint': { en: 'Keep at least one alternative explanation alive when evidence is incomplete.', it: 'Mantieni almeno una spiegazione alternativa viva.', de: 'Mindestens eine Alternative offen halten.', fr: 'Gardez une alternative vivante.', es: 'Mantén una alternativa viva.' },
  'empty.contradictions': { en: 'No contradictions recorded.', it: 'Nessuna contraddizione registrata.', de: 'Keine Widersprüche.', fr: 'Aucune contradiction.', es: 'Sin contradicciones.' },
  'empty.contradictions.hint': { en: 'Run triage to actively search for conflicts.', it: 'Esegui il triage per cercare attivamente i conflitti.', de: 'Triage ausführen.', fr: 'Lancez le triage.', es: 'Ejecuta el triage.' },
  'empty.relationships': { en: 'No relationships yet.', it: 'Nessuna relazione ancora.', de: 'Noch keine Beziehungen.', fr: 'Aucune relation.', es: 'Sin relaciones.' },
  'empty.relationships.hint': { en: 'Connections should be supported by evidence, not proximity.', it: 'Le connessioni devono essere supportate da prove.', de: 'Verbindungen brauchen Beweise.', fr: 'Les connexions doivent être étayées.', es: 'Las conexiones necesitan evidencia.' },
  'modal.case': { en: 'New investigation', it: 'Nuova indagine', de: 'Neue Untersuchung', fr: 'Nouvelle enquête', es: 'Nueva investigación' },
  'modal.evidence': { en: 'Add evidence', it: 'Aggiungi prova', de: 'Beweis hinzufügen', fr: 'Ajouter une preuve', es: 'Añadir evidencia' },
  'modal.entity': { en: 'Add entity', it: 'Aggiungi entità', de: 'Entität hinzufügen', fr: 'Ajouter une entité', es: 'Añadir entidad' },
  'modal.hypothesis': { en: 'Add hypothesis', it: 'Aggiungi ipotesi', de: 'Hypothese hinzufügen', fr: 'Ajouter une hypothèse', es: 'Añadir hipótesis' },
  'modal.relationship': { en: 'Add relationship', it: 'Aggiungi relazione', de: 'Beziehung hinzufügen', fr: 'Ajouter une relation', es: 'Añadir relación' },
  'modal.cancel': { en: 'Cancel', it: 'Annulla', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar' },
  'modal.create': { en: 'Create', it: 'Crea', de: 'Erstellen', fr: 'Créer', es: 'Crear' },
  'modal.title': { en: 'Case title', it: 'Titolo del caso', de: 'Falltitel', fr: 'Titre', es: 'Título' },
  'modal.objective': { en: 'Objective', it: 'Obiettivo', de: 'Ziel', fr: 'Objectif', es: 'Objetivo' },
  'modal.priority': { en: 'Priority', it: 'Priorità', de: 'Priorität', fr: 'Priorité', es: 'Prioridad' },
  'modal.claim': { en: 'Claim / Observation', it: 'Affermazione / Osservazione', de: 'Behauptung', fr: 'Affirmation', es: 'Afirmación' },
  'modal.locator': { en: 'Source URL / locator', it: 'URL / localizzatore fonte', de: 'Quellen-URL', fr: 'URL source', es: 'URL fuente' },
  'modal.confidence': { en: 'Confidence (0-1)', it: 'Confidenza (0-1)', de: 'Konfidenz (0-1)', fr: 'Confiance (0-1)', es: 'Confianza (0-1)' },
  'modal.status': { en: 'Status', it: 'Stato', de: 'Status', fr: 'Statut', es: 'Estado' },
  'modal.name': { en: 'Name', it: 'Nome', de: 'Name', fr: 'Nom', es: 'Nombre' },
  'modal.type': { en: 'Type', it: 'Tipo', de: 'Typ', fr: 'Type', es: 'Tipo' },
  'modal.statement': { en: 'Statement', it: 'Enunciato', de: 'Aussage', fr: 'Énoncé', es: 'Enunciado' },
  'modal.falsifier': { en: 'Falsifier (what would prove this wrong?)', it: 'Falsificatore (cosa dimostrerebbe che è sbagliato?)', de: 'Falsifikator', fr: 'Falsificateur', es: 'Falsificador' },
  'modal.from': { en: 'From entity', it: 'Da entità', de: 'Von Entität', fr: 'De l\'entité', es: 'Desde entidad' },
  'modal.to': { en: 'To entity', it: 'A entità', de: 'Zu Entität', fr: 'Vers l\'entité', es: 'Hacia entidad' },
  'alert.case.first': { en: 'Create or focus a case first.', it: 'Crea o focalizza prima un caso.', de: 'Zuerst Fall erstellen.', fr: 'Créez d\'abord un dossier.', es: 'Crea un caso primero.' },
  'alert.title.required': { en: 'Title is required', it: 'Il titolo è obbligatorio', de: 'Titel erforderlich', fr: 'Titre obligatoire', es: 'Título obligatorio' },
  'alert.name.required': { en: 'Name is required', it: 'Il nome è obbligatorio', de: 'Name erforderlich', fr: 'Nom obligatoire', es: 'Nombre obligatorio' },
  'alert.claim.required': { en: 'Title and claim are required', it: 'Titolo e affermazione sono obbligatori', de: 'Titel und Behauptung erforderlich', fr: 'Titre et affirmation obligatoires', es: 'Título y afirmación obligatorios' },
  'alert.statement.required': { en: 'Statement is required', it: 'L\'enunciato è obbligatorio', de: 'Aussage erforderlich', fr: 'Énoncé obligatoire', es: 'Enunciado obligatorio' },
  'alert.entities.different': { en: 'Select two different entities', it: 'Seleziona due entità diverse', de: 'Zwei unterschiedliche Entitäten', fr: 'Deux entités différentes', es: 'Dos entidades diferentes' },
  'priority.high': { en: 'High', it: 'Alta', de: 'Hoch', fr: 'Élevée', es: 'Alta' },
  'priority.medium': { en: 'Medium', it: 'Media', de: 'Mittel', fr: 'Moyenne', es: 'Media' },
  'priority.low': { en: 'Low', it: 'Bassa', de: 'Niedrig', fr: 'Faible', es: 'Baja' },
  'verified': { en: 'Verified', it: 'Verificato', de: 'Verifiziert', fr: 'Vérifié', es: 'Verificado' },
  'objective.pending': { en: 'Objective pending', it: 'Obiettivo in attesa', de: 'Ziel ausstehend', fr: 'Objectif en attente', es: 'Objetivo pendiente' },
  'no.investigations': { en: 'No investigations yet.', it: 'Nessuna indagine ancora.', de: 'Noch keine Untersuchungen.', fr: 'Aucune enquête.', es: 'Sin investigaciones.' },
  'principle': { en: 'Find the signal. Trace the evidence. Challenge the conclusion.', it: 'Trova il segnale. Traccia la prova. Contesta la conclusione.', de: 'Finde das Signal. Verfolge den Beweis. Hinterfrage die Schlussfolgerung.', fr: 'Trouvez le signal. Tracez la preuve. Contestez la conclusion.', es: 'Encuentra la señal. Rastrea la evidencia. Desafía la conclusión.' },
  'footer': { en: 'OSINT Command Center · living local workspace · Bias Radar + Red Team Mode · AI remains epistemically bounded.', it: 'OSINT Command Center · workspace locale vivo · Bias Radar + Red Team Mode · l\'AI resta epistemicmente limitata.', de: 'OSINT Command Center · lebendiger Workspace · Bias-Radar + Red-Team.', fr: 'OSINT Command Center · espace local vivant · Radar de biais + Red Team.', es: 'OSINT Command Center · espacio local vivo · Radar de sesgo + Red Team.' },
  'live.title': { en: 'Live public-source feeds', it: 'Feed pubblici in tempo reale', de: 'Live öffentliche Quellen', fr: 'Flux publics en direct', es: 'Feeds públicos en vivo' },
  'live.principle': { en: 'ONLINE DATA ≠ VERIFIED EVIDENCE · Results stay RAW until human review.', it: 'DATI ONLINE ≠ PROVA VERIFICATA · I risultati restano RAW fino a revisione umana.', de: 'ONLINE-DATEN ≠ VERIFIZIERTER BEWEIS.', fr: 'DONNÉES EN LIGNE ≠ PREUVE VÉRIFIÉE.', es: 'DATOS EN LÍNEA ≠ EVIDENCIA VERIFICADA.' },
  'live.search': { en: 'Search public sources…', it: 'Cerca fonti pubbliche…', de: 'Öffentliche Quellen suchen…', fr: 'Rechercher des sources publiques…', es: 'Buscar fuentes públicas…' },
  'live.run': { en: 'Fetch live', it: 'Recupera live', de: 'Live abrufen', fr: 'Récupérer', es: 'Obtener en vivo' },
  'live.promote': { en: 'Review → Evidence', it: 'Rivedi → Prova', de: 'Prüfen → Beweis', fr: 'Réviser → Preuve', es: 'Revisar → Evidencia' }
};

export function supportedLocales() { return Object.keys(SUPPORTED_LOCALES); }

export function getLocale(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES[saved]) return saved;
  } catch {}
  const browser = (typeof navigator !== 'undefined' ? (navigator.language || '') : '').toLowerCase().split('-')[0];
  if (SUPPORTED_LOCALES[browser]) return browser;
  return 'en'; // product default: English
}

export function t(key, locale = getLocale()) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[locale] || entry.en || key;
}

export function setLocale(locale, storage = globalThis.localStorage) {
  if (!SUPPORTED_LOCALES[locale]) throw new Error(`Unsupported locale: ${locale}`);
  try { storage?.setItem(STORAGE_KEY, locale); } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = SUPPORTED_LOCALES[locale].dir || 'ltr';
    document.dispatchEvent(new CustomEvent('occ:locale', { detail: { locale } }));
  }
  return locale;
}

export function installLanguageSelector() {
  if (typeof document === 'undefined') return;
  let wrap = document.getElementById('languageControl');
  if (wrap) {
    const select = document.getElementById('localeSelect');
    if (select) select.value = getLocale();
    return;
  }
  const host = document.querySelector('.status') || document.querySelector('.top');
  if (!host) return;
  wrap = document.createElement('div');
  wrap.id = 'languageControl';
  wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-left:10px;padding:4px 8px;border:1px solid #69d7d0;border-radius:999px;background:#071318;font:11px/1 system-ui,sans-serif;z-index:50';
  const icon = document.createElement('span');
  icon.textContent = '🌐';
  const select = document.createElement('select');
  select.id = 'localeSelect';
  select.style.cssText = 'appearance:auto;background:#071318;color:#e9f4f4;border:0;outline:0;border-radius:5px;padding:3px 18px 3px 2px;font-size:11px;font-weight:700;min-width:92px;cursor:pointer';
  for (const code of supportedLocales()) {
    const o = document.createElement('option');
    o.value = code;
    o.textContent = SUPPORTED_LOCALES[code].native;
    select.appendChild(o);
  }
  select.value = getLocale();
  select.addEventListener('change', () => {
    setLocale(select.value);
    window.dispatchEvent(new CustomEvent('occ:re-render'));
  });
  wrap.append(icon, select);
  host.appendChild(wrap);
}

export function bootI18n() {
  document.documentElement.lang = getLocale();
  installLanguageSelector();
  document.addEventListener('occ:locale', () => installLanguageSelector());
}
