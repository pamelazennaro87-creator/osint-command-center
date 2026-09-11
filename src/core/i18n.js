/**
 * Professional i18n — key-based, re-render friendly.
 * Primary locales: Italian + English (full UI coverage).
 * Extensible structure for additional languages.
 */

export const I18N_VERSION = '2.0';

export const SUPPORTED_LOCALES = Object.freeze({
  it: { label: 'Italiano', native: 'Italiano', dir: 'ltr' },
  en: { label: 'English', native: 'English', dir: 'ltr' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr' },
  fr: { label: 'French', native: 'Français', dir: 'ltr' },
  es: { label: 'Spanish', native: 'Español', dir: 'ltr' }
});

const STORAGE_KEY = 'occ.locale.v2';

/** Full dictionary — keys are stable identifiers used in code */
const DICT = {
  // Navigation & shell
  'nav.command': { it: 'Centro di Comando', en: 'Command Center', de: 'Kommandozentrale', fr: 'Centre de commandement', es: 'Centro de mando' },
  'nav.cases': { it: 'Casi', en: 'Cases', de: 'Fälle', fr: 'Dossiers', es: 'Casos' },
  'nav.evidence': { it: 'Prove', en: 'Evidence', de: 'Beweise', fr: 'Preuves', es: 'Evidencias' },
  'nav.entities': { it: 'Entità e Grafo', en: 'Entities & Graph', de: 'Entitäten & Graph', fr: 'Entités & Graphe', es: 'Entidades y grafo' },
  'nav.hypotheses': { it: 'Ipotesi', en: 'Hypotheses', de: 'Hypothesen', fr: 'Hypothèses', es: 'Hipótesis' },
  'nav.contradictions': { it: 'Contraddizioni', en: 'Contradictions', de: 'Widersprüche', fr: 'Contradictions', es: 'Contradicciones' },
  'nav.reports': { it: 'Report', en: 'Reports', de: 'Berichte', fr: 'Rapports', es: 'Informes' },
  'nav.governance': { it: 'Governance', en: 'Governance', de: 'Governance', fr: 'Gouvernance', es: 'Gobernanza' },

  'brand.subtitle': { it: 'COCKPIT ANALISTA · PROVA PRIMA', en: 'ANALYST COCKPIT · EVIDENCE FIRST', de: 'ANALYSTEN-COCKPIT · EVIDENZ ZUERST', fr: 'COCKPIT ANALYSTE · PREUVE D\'ABORD', es: 'COCKPIT ANALISTA · EVIDENCIA PRIMERO' },
  'brand.living': { it: 'COCKPIT ANALISTA VIVO', en: 'LIVING ANALYST COCKPIT', de: 'LEBENDIGES ANALYSTEN-COCKPIT', fr: 'COCKPIT ANALYSTE VIVANT', es: 'COCKPIT ANALISTA VIVO' },

  'header.ops': { it: 'Operazioni / Intelligence', en: 'Operations / Intelligence', de: 'Operationen / Intelligence', fr: 'Opérations / Renseignement', es: 'Operaciones / Inteligencia' },
  'status.local': { it: 'Workspace locale · nessun API privilegiata', en: 'Local intelligence workspace · no privileged API', de: 'Lokaler Workspace · keine privilegierten APIs', fr: 'Espace de travail local · aucune API privilégiée', es: 'Espacio de trabajo local · sin API privilegiada' },
  'status.redteam': { it: '● RED TEAM ATTIVO · Bias', en: '● RED TEAM ACTIVE · Bias', de: '● RED TEAM AKTIV · Bias', fr: '● RED TEAM ACTIF · Bias', es: '● RED TEAM ACTIVO · Bias' },
  'status.bias': { it: 'Workspace locale · Indice Bias', en: 'Local workspace · Bias Index', de: 'Lokaler Workspace · Bias-Index', fr: 'Espace local · Indice de biais', es: 'Espacio local · Índice de sesgo' },

  'search.placeholder': { it: 'Cerca nel workspace…', en: 'Search the workspace…', de: 'Workspace durchsuchen…', fr: 'Rechercher dans l\'espace…', es: 'Buscar en el espacio…' },

  // Focus
  'focus.none': { it: 'Nessun caso attivo', en: 'No active case', de: 'Kein aktiver Fall', fr: 'Aucun dossier actif', es: 'Ningún caso activo' },
  'focus.none.hint': { it: 'Crea o seleziona un\'indagine per focalizzare il workspace.', en: 'Create or select an investigation to focus the workspace.', de: 'Erstellen oder wählen Sie einen Fall.', fr: 'Créez ou sélectionnez une enquête.', es: 'Crea o selecciona una investigación.' },
  'focus.label': { it: 'FOCUS ·', en: 'FOCUS ·', de: 'FOKUS ·', fr: 'FOCUS ·', es: 'ENFOQUE ·' },
  'focus.clear': { it: 'Rimuovi focus', en: 'Clear focus', de: 'Fokus aufheben', fr: 'Effacer le focus', es: 'Quitar enfoque' },
  'focus.new': { it: '+ Nuovo caso', en: '+ New case', de: '+ Neuer Fall', fr: '+ Nouveau dossier', es: '+ Nuevo caso' },
  'focus.create': { it: '+ Nuova indagine', en: '+ New investigation', de: '+ Neue Untersuchung', fr: '+ Nouvelle enquête', es: '+ Nueva investigación' },

  // Bias Radar
  'bias.title': { it: 'RADAR BIAS E INDIPENDENZA', en: 'BIAS & INDEPENDENCE RADAR', de: 'BIAS- & UNABHÄNGIGKEITS-RADAR', fr: 'RADAR BIAIS ET INDÉPENDANCE', es: 'RADAR DE SESGO E INDEPENDENCIA' },
  'bias.index': { it: 'Indice di Bias Strutturale', en: 'Structural Bias Index', de: 'Struktureller Bias-Index', fr: 'Indice de biais structurel', es: 'Índice de sesgo estructural' },
  'bias.activate': { it: '○ Attiva Red Team Mode', en: '○ Activate Red Team Mode', de: '○ Red Team Mode aktivieren', fr: '○ Activer le mode Red Team', es: '○ Activar modo Red Team' },
  'bias.active': { it: '● Red Team Mode ON', en: '● Red Team Mode ON', de: '● Red Team Mode AN', fr: '● Mode Red Team ACTIVÉ', es: '● Modo Red Team ACTIVADO' },
  'bias.mono': { it: 'Monocoltura fonti', en: 'Source mono-culture', de: 'Quellen-Monokultur', fr: 'Monoculture des sources', es: 'Monocultivo de fuentes' },
  'bias.inflation': { it: 'Inflazione di confidenza', en: 'Confidence inflation', de: 'Konfidenz-Inflation', fr: 'Inflation de confiance', es: 'Inflación de confianza' },
  'bias.untested': { it: 'Falsificatori non testati', en: 'Untested falsifiers', de: 'Ungetestete Falsifikatoren', fr: 'Falsificateurs non testés', es: 'Falsificadores no probados' },
  'bias.ai': { it: 'Prove AI non verificate', en: 'Unverified AI evidence', de: 'Unverifizierte KI-Beweise', fr: 'Preuves IA non vérifiées', es: 'Evidencia IA no verificada' },
  'bias.links': { it: 'Relazioni non supportate', en: 'Unsupported relationships', de: 'Nicht belegte Beziehungen', fr: 'Relations non étayées', es: 'Relaciones sin soporte' },
  'bias.shadow': { it: 'Rischio shadow investigation', en: 'Shadow investigation risk', de: 'Shadow-Investigation-Risiko', fr: 'Risque d\'enquête parallèle', es: 'Riesgo de investigación sombra' },

  // Red Team
  'redteam.title': { it: 'Red Team Pressure Board', en: 'Red Team Pressure Board', de: 'Red-Team-Druckbrett', fr: 'Tableau de pression Red Team', es: 'Tablero de presión Red Team' },
  'redteam.off': { it: 'Red Team Mode spento. Attivalo dal Bias Radar per forzare l\'attrito cognitivo su gap e affermazioni non supportate.', en: 'Red Team Mode is off. Activate it from the Bias Radar to force cognitive friction on gaps and unsupported claims.', de: 'Red Team Mode ist aus. Aktivieren Sie ihn im Bias-Radar.', fr: 'Mode Red Team désactivé. Activez-le depuis le Radar de biais.', es: 'Modo Red Team desactivado. Actívelo desde el Radar de sesgo.' },
  'redteam.principle': { it: 'L\'attrito cognitivo è intenzionale. Risolvi o accetta esplicitamente ogni elemento prima di decidere.', en: 'Cognitive friction is intentional. Resolve or explicitly accept each item before deciding.', de: 'Kognitive Reibung ist beabsichtigt. Lösen oder akzeptieren Sie jedes Element vor der Entscheidung.', fr: 'La friction cognitive est intentionnelle. Résolvez ou acceptez explicitement chaque point avant de décider.', es: 'La fricción cognitiva es intencional. Resuelva o acepte explícitamente cada punto antes de decidir.' },

  // Signals
  'signal.know': { it: 'COSA SAPPIAMO?', en: 'WHAT DO WE KNOW?', de: 'WAS WISSEN WIR?', fr: 'QUE SAVONS-NOUS ?', es: '¿QUÉ SABEMOS?' },
  'signal.think': { it: 'COSA PENSIAMO?', en: 'WHAT DO WE THINK?', de: 'WAS DENKEN WIR?', fr: 'QUE PENSONS-NOUS ?', es: '¿QUÉ PENSAMOS?' },
  'signal.wrong': { it: 'COSA POTREBBE DIMOSTRARCI CHE SBAGLIAMO?', en: 'WHAT COULD PROVE US WRONG?', de: 'WAS KÖNNTE UNS WIDERLEGEN?', fr: 'QU\'EST-CE QUI POURRAIT NOUS CONTREDIRE ?', es: '¿QUÉ PODRÍA DEMOSTRAR QUE NOS EQUIVOCAMOS?' },
  'signal.next': { it: 'COSA DOVREMMO FARE ADESSO?', en: 'WHAT SHOULD WE DO NEXT?', de: 'WAS SOLLTEN WIR ALS NÄCHSTES TUN?', fr: 'QUE DEVONS-NOUS FAIRE ENSUITE ?', es: '¿QUÉ DEBERÍAMOS HACER AHORA?' },
  'signal.missing': { it: 'COSA CI MANCA?', en: 'WHAT ARE WE MISSING?', de: 'WAS FEHLT UNS?', fr: 'QUE NOUS MANQUE-T-IL ?', es: '¿QUÉ NOS FALTA?' },

  // Metrics
  'metric.cases': { it: 'CASI ATTIVI', en: 'ACTIVE CASES', de: 'AKTIVE FÄLLE', fr: 'DOSSIERS ACTIFS', es: 'CASOS ACTIVOS' },
  'metric.evidence': { it: 'ELEMENTI DI PROVA', en: 'EVIDENCE ITEMS', de: 'BEWEISELEMENTE', fr: 'ÉLÉMENTS DE PREUVE', es: 'ELEMENTOS DE EVIDENCIA' },
  'metric.hypotheses': { it: 'IPOTESI', en: 'HYPOTHESES', de: 'HYPOTHESEN', fr: 'HYPOTHÈSES', es: 'HIPÓTESIS' },
  'metric.contradictions': { it: 'CONTRADDIZIONI APERTE', en: 'OPEN CONTRADICTIONS', de: 'OFFENE WIDERSPRÜCHE', fr: 'CONTRADICTIONS OUVERTES', es: 'CONTRADICCIONES ABIERTAS' },

  // Actions
  'action.new.investigation': { it: '+ Nuova indagine', en: '+ New investigation', de: '+ Neue Untersuchung', fr: '+ Nouvelle enquête', es: '+ Nueva investigación' },
  'action.new.evidence': { it: '+ Aggiungi prova', en: '+ Add evidence', de: '+ Beweis hinzufügen', fr: '+ Ajouter une preuve', es: '+ Añadir evidencia' },
  'action.new.entity': { it: '+ Entità', en: '+ Entity', de: '+ Entität', fr: '+ Entité', es: '+ Entidad' },
  'action.new.hypothesis': { it: '+ Aggiungi ipotesi', en: '+ Add hypothesis', de: '+ Hypothese hinzufügen', fr: '+ Ajouter une hypothèse', es: '+ Añadir hipótesis' },
  'action.new.relationship': { it: '+ Relazione', en: '+ Relationship', de: '+ Beziehung', fr: '+ Relation', es: '+ Relación' },
  'action.triage': { it: 'Esegui triage contraddizioni', en: 'Run contradiction triage', de: 'Widerspruchs-Triage ausführen', fr: 'Lancer le triage des contradictions', es: 'Ejecutar triage de contradicciones' },
  'action.shadow': { it: 'Esegui shadow investigation', en: 'Run shadow investigation', de: 'Shadow-Investigation starten', fr: 'Lancer l\'enquête parallèle', es: 'Ejecutar investigación sombra' },
  'action.report': { it: 'Crea report professionale', en: 'Create professional report', de: 'Professionellen Bericht erstellen', fr: 'Créer un rapport professionnel', es: 'Crear informe profesional' },
  'action.export': { it: 'Esporta stato caso', en: 'Export case state', de: 'Fallstatus exportieren', fr: 'Exporter l\'état du dossier', es: 'Exportar estado del caso' },
  'action.focus': { it: 'Focalizza caso', en: 'Focus case', de: 'Fall fokussieren', fr: 'Focaliser le dossier', es: 'Enfocar caso' },
  'action.focused': { it: '● Focalizzato', en: '● Focused', de: '● Fokussiert', fr: '● Focalisé', es: '● Enfocado' },
  'action.do': { it: 'Esegui', en: 'Do it', de: 'Ausführen', fr: 'Exécuter', es: 'Hacerlo' },
  'action.restart.sim': { it: 'Riavvia simulazione', en: 'Restart simulation', de: 'Simulation neu starten', fr: 'Redémarrer la simulation', es: 'Reiniciar simulación' },

  // Sections
  'section.queue': { it: 'Coda indagini', en: 'Investigation queue', de: 'Untersuchungs-Warteschlange', fr: 'File d\'enquêtes', es: 'Cola de investigaciones' },
  'section.integrity': { it: 'Integrità delle prove', en: 'Evidence integrity', de: 'Beweisintegrität', fr: 'Intégrité des preuves', es: 'Integridad de la evidencia' },
  'section.challenge': { it: 'Livello di Sfida Analista', en: 'Analyst Challenge Layer', de: 'Analysten-Herausforderungsebene', fr: 'Couche de défi analyste', es: 'Capa de desafío del analista' },
  'section.challenge.sub': { it: 'Shadow investigation per drift di ragionamento, dipendenza dalle fonti e confidenza non supportata.', en: 'Shadow investigation for reasoning drift, source dependency and unsupported confidence.', de: 'Shadow-Investigation für Reasoning-Drift, Quellenabhängigkeit und ungestützte Konfidenz.', fr: 'Enquête parallèle pour dérive de raisonnement, dépendance aux sources et confiance non étayée.', es: 'Investigación sombra para deriva de razonamiento, dependencia de fuentes y confianza no respaldada.' },
  'section.challenge.principle': { it: 'La shadow investigation esiste per contestare la narrativa primaria, non per confermarla.', en: 'The shadow investigation exists to challenge the primary narrative, not to confirm it.', de: 'Die Shadow-Investigation existiert, um die primäre Erzählung anzufechten, nicht sie zu bestätigen.', fr: 'L\'enquête parallèle existe pour contester le récit principal, non pour le confirmer.', es: 'La investigación sombra existe para desafiar la narrativa principal, no para confirmarla.' },
  'section.matrix': { it: 'Matrice di Intelligence delle Prove', en: 'Evidence Intelligence Matrix', de: 'Beweis-Intelligence-Matrix', fr: 'Matrice d\'intelligence des preuves', es: 'Matriz de inteligencia de evidencia' },
  'section.memory': { it: 'Memoria Istituzionale', en: 'Institutional Memory', de: 'Institutionelles Gedächtnis', fr: 'Mémoire institutionnelle', es: 'Memoria institucional' },
  'section.temporal': { it: 'Integrità Temporale', en: 'Temporal Integrity', de: 'Zeitliche Integrität', fr: 'Intégrité temporelle', es: 'Integridad temporal' },
  'section.next': { it: 'Prossime Migliori Azioni Investigative', en: 'Next Best Investigative Actions', de: 'Nächste beste investigative Aktionen', fr: 'Prochaines meilleures actions d\'enquête', es: 'Próximas mejores acciones investigativas' },
  'section.next.sub': { it: 'Il cockpit prioritizza la prossima mossa dallo stato attuale delle prove.', en: 'The cockpit prioritizes the next move from the current evidence state.', de: 'Das Cockpit priorisiert den nächsten Schritt aus dem aktuellen Beweiszustand.', fr: 'Le cockpit priorise le prochain mouvement à partir de l\'état actuel des preuves.', es: 'El cockpit prioriza el siguiente movimiento a partir del estado actual de la evidencia.' },

  // Graph
  'graph.living': { it: 'Grafo relazionale vivo', en: 'Living relationship graph', de: 'Lebendiger Beziehungsgraph', fr: 'Graphe relationnel vivant', es: 'Grafo de relaciones vivo' },
  'graph.empty': { it: 'Nessuna entità. Aggiungine una per attivare il grafo vivo.', en: 'No entities yet. Add people, organisations or assets to activate the living graph.', de: 'Noch keine Entitäten. Fügen Sie welche hinzu, um den lebendigen Graphen zu aktivieren.', fr: 'Aucune entité. Ajoutez-en pour activer le graphe vivant.', es: 'Sin entidades. Añade para activar el grafo vivo.' },
  'graph.legend.entity': { it: 'Entità (dimensione = grado)', en: 'Entity (size = degree)', de: 'Entität (Größe = Grad)', fr: 'Entité (taille = degré)', es: 'Entidad (tamaño = grado)' },
  'graph.legend.supported': { it: 'Link supportato da prove', en: 'Evidence-backed', de: 'Beweisgestützt', fr: 'Étayé par des preuves', es: 'Respaldado por evidencia' },
  'graph.legend.unsupported': { it: 'Affermazione non supportata', en: 'Unsupported claim', de: 'Ungestützte Behauptung', fr: 'Affirmation non étayée', es: 'Afirmación sin soporte' },
  'graph.legend.drag': { it: 'Trascina i nodi · clicca per ispezionare', en: 'Drag nodes · click to inspect', de: 'Knoten ziehen · klicken zum Prüfen', fr: 'Faites glisser les nœuds · cliquez pour inspecter', es: 'Arrastra nodos · clic para inspeccionar' },

  // Empty states
  'empty.cases': { it: 'Nessuna indagine ancora.', en: 'No investigations yet.', de: 'Noch keine Untersuchungen.', fr: 'Aucune enquête pour le moment.', es: 'Aún no hay investigaciones.' },
  'empty.cases.hint': { it: 'Inizia con un obiettivo, non con una conclusione.', en: 'Start with an objective, not a conclusion.', de: 'Beginnen Sie mit einem Ziel, nicht mit einer Schlussfolgerung.', fr: 'Commencez par un objectif, pas par une conclusion.', es: 'Empieza con un objetivo, no con una conclusión.' },
  'empty.evidence': { it: 'Nessuna prova catturata.', en: 'No evidence captured.', de: 'Keine Beweise erfasst.', fr: 'Aucune preuve capturée.', es: 'No se ha capturado evidencia.' },
  'empty.evidence.hint': { it: 'Ogni affermazione deve avere una fonte e uno stato di incertezza.', en: 'Every claim should carry a source and an uncertainty status.', de: 'Jede Behauptung braucht eine Quelle und einen Unsicherheitsstatus.', fr: 'Chaque affirmation doit avoir une source et un statut d\'incertitude.', es: 'Toda afirmación debe tener una fuente y un estado de incertidumbre.' },
  'empty.hypotheses': { it: 'Nessuna ipotesi.', en: 'No hypotheses.', de: 'Keine Hypothesen.', fr: 'Aucune hypothèse.', es: 'Sin hipótesis.' },
  'empty.hypotheses.hint': { it: 'Mantieni almeno una spiegazione alternativa viva quando le prove sono incomplete.', en: 'Keep at least one alternative explanation alive when evidence is incomplete.', de: 'Halten Sie mindestens eine alternative Erklärung lebendig, wenn Beweise unvollständig sind.', fr: 'Gardez au moins une explication alternative vivante lorsque les preuves sont incomplètes.', es: 'Mantén al menos una explicación alternativa viva cuando la evidencia es incompleta.' },
  'empty.contradictions': { it: 'Nessuna contraddizione registrata.', en: 'No contradictions recorded.', de: 'Keine Widersprüche erfasst.', fr: 'Aucune contradiction enregistrée.', es: 'No se registraron contradicciones.' },
  'empty.contradictions.hint': { it: 'Esegui il triage per cercare attivamente i conflitti invece di aspettarli.', en: 'Run triage to actively search for conflicts instead of waiting for them.', de: 'Führen Sie die Triage aus, um aktiv nach Konflikten zu suchen.', fr: 'Lancez le triage pour rechercher activement les conflits.', es: 'Ejecuta el triage para buscar activamente conflictos.' },
  'empty.relationships': { it: 'Nessuna relazione ancora.', en: 'No relationships yet.', de: 'Noch keine Beziehungen.', fr: 'Aucune relation pour le moment.', es: 'Aún no hay relaciones.' },
  'empty.relationships.hint': { it: 'Le connessioni devono essere supportate da prove, non dalla prossimità.', en: 'Connections should be supported by evidence, not proximity.', de: 'Verbindungen sollten durch Beweise gestützt sein, nicht durch Nähe.', fr: 'Les connexions doivent être étayées par des preuves, pas par la proximité.', es: 'Las conexiones deben estar respaldadas por evidencia, no por proximidad.' },

  // Modal
  'modal.case': { it: 'Nuova indagine', en: 'New investigation', de: 'Neue Untersuchung', fr: 'Nouvelle enquête', es: 'Nueva investigación' },
  'modal.evidence': { it: 'Aggiungi prova', en: 'Add evidence', de: 'Beweis hinzufügen', fr: 'Ajouter une preuve', es: 'Añadir evidencia' },
  'modal.entity': { it: 'Aggiungi entità', en: 'Add entity', de: 'Entität hinzufügen', fr: 'Ajouter une entité', es: 'Añadir entidad' },
  'modal.hypothesis': { it: 'Aggiungi ipotesi', en: 'Add hypothesis', de: 'Hypothese hinzufügen', fr: 'Ajouter une hypothèse', es: 'Añadir hipótesis' },
  'modal.relationship': { it: 'Aggiungi relazione', en: 'Add relationship', de: 'Beziehung hinzufügen', fr: 'Ajouter une relation', es: 'Añadir relación' },
  'modal.cancel': { it: 'Annulla', en: 'Cancel', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar' },
  'modal.create': { it: 'Crea', en: 'Create', de: 'Erstellen', fr: 'Créer', es: 'Crear' },
  'modal.title': { it: 'Titolo del caso', en: 'Case title', de: 'Falltitel', fr: 'Titre du dossier', es: 'Título del caso' },
  'modal.objective': { it: 'Obiettivo', en: 'Objective', de: 'Ziel', fr: 'Objectif', es: 'Objetivo' },
  'modal.priority': { it: 'Priorità', en: 'Priority', de: 'Priorität', fr: 'Priorité', es: 'Prioridad' },
  'modal.claim': { it: 'Affermazione / Osservazione', en: 'Claim / Observation', de: 'Behauptung / Beobachtung', fr: 'Affirmation / Observation', es: 'Afirmación / Observación' },
  'modal.locator': { it: 'URL / localizzatore fonte', en: 'Source URL / locator', de: 'Quellen-URL / Locator', fr: 'URL / localisateur de source', es: 'URL / localizador de fuente' },
  'modal.confidence': { it: 'Confidenza (0-1)', en: 'Confidence (0-1)', de: 'Konfidenz (0-1)', fr: 'Confiance (0-1)', es: 'Confianza (0-1)' },
  'modal.status': { it: 'Stato', en: 'Status', de: 'Status', fr: 'Statut', es: 'Estado' },
  'modal.name': { it: 'Nome', en: 'Name', de: 'Name', fr: 'Nom', es: 'Nombre' },
  'modal.type': { it: 'Tipo', en: 'Type', de: 'Typ', fr: 'Type', es: 'Tipo' },
  'modal.statement': { it: 'Enunciato', en: 'Statement', de: 'Aussage', fr: 'Énoncé', es: 'Enunciado' },
  'modal.falsifier': { it: 'Falsificatore (cosa dimostrerebbe che è sbagliato?)', en: 'Falsifier (what would prove this wrong?)', de: 'Falsifikator (was würde dies widerlegen?)', fr: 'Falsificateur (qu\'est-ce qui prouverait que c\'est faux ?)', es: 'Falsificador (¿qué demostraría que esto es incorrecto?)' },
  'modal.from': { it: 'Da entità', en: 'From entity', de: 'Von Entität', fr: 'De l\'entité', es: 'Desde entidad' },
  'modal.to': { it: 'A entità', en: 'To entity', de: 'Zu Entität', fr: 'Vers l\'entité', es: 'Hacia entidad' },

  // Alerts
  'alert.case.first': { it: 'Crea o focalizza prima un caso.', en: 'Create or focus a case first.', de: 'Erstellen oder fokussieren Sie zuerst einen Fall.', fr: 'Créez ou focalisez d\'abord un dossier.', es: 'Crea o enfoca un caso primero.' },
  'alert.title.required': { it: 'Il titolo è obbligatorio', en: 'Title is required', de: 'Titel ist erforderlich', fr: 'Le titre est obligatoire', es: 'El título es obligatorio' },
  'alert.name.required': { it: 'Il nome è obbligatorio', en: 'Name is required', de: 'Name ist erforderlich', fr: 'Le nom est obligatoire', es: 'El nombre es obligatorio' },
  'alert.claim.required': { it: 'Titolo e affermazione sono obbligatori', en: 'Title and claim are required', de: 'Titel und Behauptung sind erforderlich', fr: 'Titre et affirmation sont obligatoires', es: 'Título y afirmación son obligatorios' },
  'alert.statement.required': { it: 'L\'enunciato è obbligatorio', en: 'Statement is required', de: 'Aussage ist erforderlich', fr: 'L\'énoncé est obligatoire', es: 'El enunciado es obligatorio' },
  'alert.entities.different': { it: 'Seleziona due entità diverse', en: 'Select two different entities', de: 'Wählen Sie zwei unterschiedliche Entitäten', fr: 'Sélectionnez deux entités différentes', es: 'Selecciona dos entidades diferentes' },

  // Footer
  'footer': { it: 'OSINT Command Center · workspace locale vivo · Bias Radar + Red Team Mode · l\'AI resta epistemicmente limitata.', en: 'OSINT Command Center · living local workspace · Bias Radar + Red Team Mode · AI remains epistemically bounded.', de: 'OSINT Command Center · lebendiger lokaler Workspace · Bias-Radar + Red-Team-Mode · KI bleibt epistemisch begrenzt.', fr: 'OSINT Command Center · espace de travail local vivant · Radar de biais + Mode Red Team · l\'IA reste épistémiquement bornée.', es: 'OSINT Command Center · espacio de trabajo local vivo · Radar de sesgo + Modo Red Team · la IA permanece epistémicamente limitada.' },

  // Principle
  'principle': { it: 'Trova il segnale. Traccia la prova. Contesta la conclusione.', en: 'Find the signal. Trace the evidence. Challenge the conclusion.', de: 'Finde das Signal. Verfolge den Beweis. Hinterfrage die Schlussfolgerung.', fr: 'Trouvez le signal. Tracez la preuve. Contestez la conclusion.', es: 'Encuentra la señal. Rastrea la evidencia. Desafía la conclusión.' },

  // Priority
  'priority.high': { it: 'Alta', en: 'High', de: 'Hoch', fr: 'Élevée', es: 'Alta' },
  'priority.medium': { it: 'Media', en: 'Medium', de: 'Mittel', fr: 'Moyenne', es: 'Media' },
  'priority.low': { it: 'Bassa', en: 'Low', de: 'Niedrig', fr: 'Faible', es: 'Baja' },

  // Generic
  'verified': { it: 'Verificato', en: 'Verified', de: 'Verifiziert', fr: 'Vérifié', es: 'Verificado' },
  'corroborated': { it: 'Corroborato', en: 'Corroborated', de: 'Bestätigt', fr: 'Corroboré', es: 'Corroborado' },
  'ai.assisted': { it: 'Assistito da AI', en: 'AI-assisted', de: 'KI-unterstützt', fr: 'Assisté par IA', es: 'Asistido por IA' },
  'objective.pending': { it: 'Obiettivo in attesa', en: 'Objective pending', de: 'Ziel ausstehend', fr: 'Objectif en attente', es: 'Objetivo pendiente' },
  'no.investigations': { it: 'Nessuna indagine ancora.', en: 'No investigations yet.', de: 'Noch keine Untersuchungen.', fr: 'Aucune enquête pour le moment.', es: 'Aún no hay investigaciones.' }
};

/* ─── API ─────────────────────────────────────────────────────────────── */

export function supportedLocales() {
  return Object.keys(SUPPORTED_LOCALES);
}

export function getLocale(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES[saved]) return saved;
  } catch {}
  // Prefer Italian for this product's primary audience, then browser, then English
  const browser = (typeof navigator !== 'undefined' ? (navigator.language || '') : '').toLowerCase().split('-')[0];
  if (SUPPORTED_LOCALES[browser]) return browser;
  return 'it'; // default product language
}

export function t(key, locale = getLocale()) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[locale] || entry.en || entry.it || key;
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

/** Install the language selector in the header status area */
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
  wrap.setAttribute('aria-label', 'Interface language');
  wrap.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-left:10px;padding:4px 8px;border:1px solid #69d7d0;border-radius:999px;background:#071318;font:11px/1 system-ui,sans-serif;z-index:50;box-shadow:0 0 14px #69d7d018';

  const icon = document.createElement('span');
  icon.textContent = '🌐';
  icon.setAttribute('aria-hidden', 'true');

  const select = document.createElement('select');
  select.id = 'localeSelect';
  select.setAttribute('aria-label', 'Choose interface language');
  select.style.cssText = 'appearance:auto;background:#071318;color:#e9f4f4;border:0;outline:0;border-radius:5px;padding:3px 18px 3px 2px;font-size:11px;font-weight:700;min-width:92px;cursor:pointer';

  for (const code of supportedLocales()) {
    const o = document.createElement('option');
    o.value = code;
    o.textContent = `${SUPPORTED_LOCALES[code].native}`;
    select.appendChild(o);
  }
  select.value = getLocale();
  select.addEventListener('change', () => {
    setLocale(select.value);
    // Force full UI re-render via custom event consumed by app.js
    window.dispatchEvent(new CustomEvent('occ:re-render'));
  });

  wrap.append(icon, select);
  host.appendChild(wrap);
}

/** Boot helper — call once from app */
export function bootI18n() {
  const locale = getLocale();
  document.documentElement.lang = locale;
  installLanguageSelector();
  document.addEventListener('occ:locale', () => {
    installLanguageSelector();
  });
}
