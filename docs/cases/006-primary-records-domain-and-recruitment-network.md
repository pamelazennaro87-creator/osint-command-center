# Primary-Record Dossier: Consulting-Domain Cluster, Recruitment Escalation and Cross-Border Coercion

**Last reviewed:** 28 October 2026  
**Method:** primary-source-first OSINT; public allegations remain allegations unless adjudicated.  
**Scope:** three separate evidence tracks. No claim is made that they share an operator or infrastructure.

## Executive findings

This dossier moves from broad warning signs to traceable public records:

- **Track 1 — 13 seized consulting domains (United States, 10 June 2026):** DOJ published the domain names and a redacted affidavit describing the indicators used to connect them. This is the most technically specific source in this casebook.
- **Track 2 — alleged Russian Intelligence Services Network (United States / Europe, indictment unsealed 15 September 2026):** the DOJ press release and indictment identify five defendants, a case number, alleged recruiter roles, and a documented escalation from paid surveillance to proposed murder or sabotage.
- **Track 3 — recruitment of foreign nationals into Russian armed forces (UN Commission of Inquiry, 26 October 2026):** an international finding about alleged trafficking through deceptive civilian-job offers, cross-border agents, travel arrangements and pressured Russian-language contracts.

These tracks concern different alleged conduct and evidence types. They must not be joined into a single “network” because they share online recruitment, payments or cross-border movement.

---

## Track 1 — 13 seized consulting domains

### Primary record

On 10 June 2026, the U.S. Department of Justice announced the seizure of 13 domains described in the supporting affidavit as fake consulting-company websites used to solicit current or former U.S. government and military personnel, including people with security clearances. DOJ said the alleged scheme began around November 2023. The affidavit is available as a redacted PDF linked from the release.

- DOJ announcement: https://www.justice.gov/usao-dc/pr/doj-fbi-disable-13-websites-backed-suspected-chinese-agents-sought-sensitive-us
- Redacted affidavit / domain package: https://www.justice.gov/usao-dc/media/1445291/dl

### Publicly named domains

| ID | Brand / label in DOJ release | Domain |
|---|---|---|
| D01 | Centrik Global Consulting | `centrikglobalconsulting.com` |
| D02 | Rightinfo Consulting | `rightinfoconsult.com` |
| D03 | Finnacle-Vesper Consulting | `finnaclevesperconsulting.com` |
| D04 | CYDF Consulting | `cydfconsulting.com` |
| D05 | Pulse Wave Global | `pulsewaveglobal.com` |
| D06 | Catalyst Global Solutions (CGS) | `catalystglobalsolutions.com` |
| D07 | Horizzen | `thehorizzen.com` |
| D08 | GeoIndopacific | `geoindopacific.com` |
| D09 | Global Peace Foundation – Indonesia | `gpf-ina.org` |
| D10 | SafeSec Group | `safesec-group.com` |
| D11 | The TruthInfo | `thetruthinfo.com` |
| D12 | Vandercons | `vandercons.com` |
| D13 | Gulf Peace Foundation | `gulfpeace.org` |

**Important:** these domains are named in a law-enforcement seizure announcement. The fact of seizure and the allegations in the affidavit are source-backed; this table does not establish who personally registered or controlled each domain.

### What the affidavit reportedly used to link domains

The affidavit's summary table compares thirteen target domains using multiple indicators. Its public text reports:

- D01 and D02 were registered using the name of the same identity-theft victim.
- D02, D03 and D04 shared a domain-hosting IP address.
- Vague consulting job posts appeared across all thirteen.
- Job posts used identical or substantially similar idiosyncratic wording for D01, D02, D03, D04, D06, D07, D09 and D11.
- Stock or AI-generated photographs were reported for D01–D05 and D07–D13; the table did not mark D06 for this indicator.
- The purported location of the entity did not match job posts or records for D01, D05, D06, D08, D10 and D12.
- Other table entries link a redacted persona to several domains, and note associations involving D05 and D08.

This is more useful than saying “the sites looked fake”: it provides a reproducible, multi-indicator linkage hypothesis. It also demonstrates why **one shared hosting IP alone is weak attribution**. In this matter, the affidavit described several kinds of overlap, but any independent analyst should cite the exact table row and keep the source’s redactions visible.

### Recognition pattern

1. The vacancy uses broad job titles such as “Senior Analyst” or “International Affairs Consultant” without a verifiable client or defined deliverable.
2. The website, job listing, claimed location, company records and recruiter identity do not independently corroborate one another.
3. The recruiter offers unusually generous payment for reports and shifts from public-source research to “exclusive” or “insider” information.
4. The recruiter moves the conversation to Telegram or another encrypted app and offers payments through accounts or channels that obscure the actual payer.
5. The company uses contracts or NDAs to make the approach appear professional while the task requests information the candidate is not authorised to disclose.

### Technical investigation worksheet

For each domain, collect only lawfully accessible, public evidence:

- domain name and exact source where it was listed;
- dated RDAP/WHOIS result, preserving privacy-redaction status;
- dated DNS and certificate observations;
- hosting provider / ASN and whether the address belongs to a CDN, shared host or origin;
- archived versions of the site and dated job postings;
- exact text overlap, with a short quoted fragment and source URL;
- corporate-register result, search jurisdiction and search date;
- claimed office versus independently verified business address;
- whether the domain is seized, parked, expired or active **at the time checked**;
- alternative explanations (shared hosting provider, template reuse, copied job ads, common web designer).

Do not state an IP address as “the operator’s IP.” A DNS observation may identify an edge server, shared host, CDN or proxy—not the person behind the site. The affidavit is the primary record for the specific cross-domain links described in this case.

### What is often missed

**The most informative signal is the conjunction of independent mismatches.** A stock photo is weak; a stock photo plus stolen identity, copied idiosyncratic job wording, inconsistent geography, suspicious payment and a task that escalates to restricted information is a much stronger investigative lead.

**A seizure is not a complete attribution map.** The public announcement does not reveal every actor, every server, every victim or every downstream recipient. Record the unknowns explicitly.

---

## Track 2 — Alleged Russian Intelligence Services Network, U.S. case 26 CRIM 426

### Primary records

- DOJ announcement, 15 September 2026: https://www.justice.gov/opa/pr/members-russian-intelligence-services-network-charged-conspiring-finance-terrorism-and
- Unsealed indictment, Southern District of New York, case number **26 CRIM 426**: https://www.justice.gov/usao-sdny/media/1461336/dl

The indictment is an accusation, not a conviction. DOJ states the defendants remain at large in its release. Confirm current procedural status from the court docket before any later publication.

### Named defendants in the indictment

| Name as published | Alias / described role in DOJ release | Evidentiary status in this dossier |
|---|---|---|
| Yuri Khrameev | “Colonel Yuri”; alleged former Russian intelligence colonel and recruiter | Indicted; allegations not proven by the indictment alone |
| Kirill Khrameev | Alleged FSB officer; Yuri Khrameev’s son | Indicted; allegations not proven by the indictment alone |
| Oemis Romagoza Durruthy | Alleged coordinator of attacks, travel and logistics | Indicted; allegations not proven by the indictment alone |
| Yaidel Delgado Suarez | “Viking”; alleged recruiter | Indicted; allegations not proven by the indictment alone |
| Angel Eduardo Castro | Alleged participant in recruitment of U.S.-based individuals | Indicted; allegations not proven by the indictment alone |

### Alleged recruitment sequence described by DOJ

The September 2026 release alleges two illustrative sequences:

**Sequence A — U.S. resident / target in the United States**
1. An alleged recruiter provided two locations associated with a Russian dissident and requested surveillance.
2. The recruiter allegedly offered **$1,000–$1,500** for pre-operational surveillance.
3. The recruited individual allegedly sent back photographs and videos of locations associated with the target.
4. The recruiters allegedly offered **$40,000** for the target to be killed or made to disappear.
5. When the recruited individual said they did not want to carry out the killing personally, the recruiters allegedly asked whether they knew someone who would.

**Sequence B — U.S. citizen / target in Lithuania**
1. The individual was allegedly paid **$200** to travel to a purported address and take pictures.
2. The recruiter allegedly introduced a more senior contact, described as a “colonel”.
3. A larger payment—approximately **$25,000**—was allegedly offered for a killing.
4. After refusal, the alleged recruiter proposed alternative sabotage tasks, including setting fire to a warehouse or attacking an electrical substation.

These are details from the prosecution’s account, not independent findings by this OSINT project. They illustrate a dangerous escalation pattern: **low-cost surveillance → proof-of-completion photos → higher payment → violence → fallback sabotage task**.

### Recognition and safety indicators

- A contact asks for apparently low-risk location photographs, then requests repeat surveillance or target-specific details.
- The contact supplies exact locations and instructions, then asks for timestamped proof of completion.
- Small payments establish compliance before a much larger violent task is proposed.
- After refusal, the recruiter offers a “simpler” task that still involves arson, infrastructure damage or other violence.
- The recruiter asks the person to recruit a substitute, making the first recruit a potential bridge to another actor.

**Do not replicate the task to test the claim.** Do not travel to target locations, photograph people or infrastructure, contact named defendants, or attempt to infiltrate the alleged network. Preserve communications already lawfully received and report credible threats to the relevant authorities.

### What is often missed

A recruiter’s use of a political explanation (“traitor”, “enemy”, “bad guy”) does not make the requested act legitimate. Equally, ideological language alone does not prove a state connection. The attribution in this case comes from the allegations and evidence described in the indictment, not from the political framing by itself.

---

## Track 3 — Deceptive recruitment into Russian armed forces: UN Commission of Inquiry, 26 October 2026

### Primary source and finding

The UN Independent International Commission of Inquiry on Ukraine reported that it found compelling evidence that Russian authorities trafficked people from **29 countries** for recruitment into the Russian armed forces through deception and coercion, coordinated with agents or agencies operating in different countries or regions.

Source: https://ukraine.un.org/en/325200-russian-authorities-committed-crimes-against-humanity-through-attacks-ukraine%E2%80%99s-energy

The Commission describes a recurring alleged pattern:
- intermediaries presented themselves as legitimate or government-endorsed businesses;
- they arranged visas and travel for groups of recruits, and in some cases accompanied them;
- agents in Russia met the recruits and brought them to sign contracts with the Ministry of Defence;
- recruits were pressured to sign contracts in Russian soon after arrival;
- recruits were sent to the front, assigned dangerous tasks, and some were killed or went missing.

This is a UN Commission finding about a pattern, not a licence to label any particular agency or individual a trafficker without case-specific evidence.

### Recognition checklist

- The advertisement promises civilian employment, security work, migration assistance or unusually high pay but avoids naming the actual employer and duties.
- A broker controls visas, tickets and the route but will not provide a verifiable contract in a language the recruit understands.
- The actual role is disclosed only after arrival; a military contract is presented under pressure.
- The recruit is told to sign immediately, is denied independent translation or legal advice, or has a passport retained.
- The family cannot establish where the person is, who controls the contract or what legal status applies.

### What is often missed

**Consent to travel is not necessarily informed consent to military service.** Record what the person was promised before travel, when the actual role was revealed, what language the contract used, whether they could refuse, and what consequences were threatened. These details help distinguish a deceptive recruitment lead from a voluntary, informed enlistment.

Do not publish names of missing recruits or relatives unless there is a clear public-interest basis and the information is already authoritatively public. Do not contact families merely to confirm a speculative lead.

---

## Cross-case comparison: same tactic vs same network

| Observable feature | Consulting-domain case | Russian intelligence indictment | Military-recruitment trafficking finding |
|---|---|---|---|
| Initial hook | Paid remote consulting / analyst job | Paid “small” surveillance task | Civilian job, travel or migration opportunity |
| Escalation | Public analysis → restricted/insider information | Surveillance → murder / sabotage | Civilian promise → pressured military contract |
| Cross-border element | Overseas payment flows alleged | Recruiters, targets and alleged operations across countries | Agents arrange visas and travel across regions |
| Primary evidence class | Seizure warrant affidavit and DOJ release | Criminal indictment and DOJ release | UN Commission of Inquiry finding |
| Main risk | Loss of protected information / bribery / identity abuse | Violence, surveillance, murder-for-hire or sabotage | Trafficking, coercion and forced military service |
| What does **not** prove a link | Shared hosting IP alone | Shared political language or app alone | Nationality, language or travel route alone |

## Entity graph: allowed edges and prohibited shortcuts

Create only the following source-backed edges in the project graph:

- `DOJ — seized — D01…D13` (source: DOJ release, 10 June 2026).
- `affidavit — reports shared hosting IP — D02/D03/D04` (source: redacted affidavit; do not infer a person from the IP).
- `affidavit — reports same identity-theft victim name — D01/D02` (source: redacted affidavit).
- `indictment — charges — each of the five named defendants` (source: SDNY case 26 CRIM 426).
- `UN Commission — finds pattern of trafficking — recruits from 29 countries` (source: Commission report/release).

Do **not** create edges between these three tracks without new primary evidence. Do not connect any of these tracks to the Southeast Asian scam-compound cases simply because they involve recruitment, payments or encrypted messaging.

## Reproducibility log template

For every new finding, record:

```text
Observation ID:
Claim (one sentence):
Entity IDs:
Source URL:
Source publisher:
Document type:
Publication date:
Date observed:
Exact passage / exhibit / page:
What it directly establishes:
What it does not establish:
Independent corroboration:
Alternative explanation:
Falsifier / disconfirming evidence:
Confidence and rationale:
Next lawful verification step:
```

## Prioritised next actions

1. Extract the affidavit’s full per-domain indicator table into a structured register, preserving redactions and not guessing missing values.
2. Verify the current status of each seized domain via the DOJ seizure page and date-stamped DNS/RDAP observations; do not treat historical DNS as current infrastructure.
3. Retrieve later court docket updates for **26 CRIM 426** and the Shunda complaints before describing any procedural change.
4. Build a source-by-source timeline for each case separately, then compare mechanisms at the pattern level.
5. Search for further public court records from Ukraine, Russia and relevant transit/origin jurisdictions, while keeping official warnings distinct from adjudicated cases.
6. Publish no unverified private identifiers, victim identities, guessed IP attribution, or unsupported network links.

**Publication rule:** cite the document that supports the exact claim. “A government agency says X” is a different claim from “X has been proven in court.”
