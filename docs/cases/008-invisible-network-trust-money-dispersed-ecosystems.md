# Case 008 — The invisible network: trust, money, and dispersed scam-centre ecosystems

**Status:** Open-source research synthesis; not an attribution to any named individual or group.  
**Reviewed:** 28 October 2026  
**Research question:** What important parts of cross-border scam and trafficking ecosystems remain invisible when analysts focus only on compounds, public adverts, domains, or individual scammers?

## Executive finding

The strongest underexplored lead is that these operations need not behave like one centralized organization. They may function as a **distributed ecosystem**: a recruiter, travel broker, rented room, language specialist, chat operator, payment intermediary, shell company, domain kit and coercive worksite can sit in different jurisdictions and have different owners. Some links may be durable; others may be bought, borrowed, copied or outsourced.

The Global Initiative Against Transnational Organized Crime's March 2026 report compares scam-centre models across Latin America, Europe/Eurasia, Southeast Asia and Africa. It explicitly cautions that the familiar image of a large compound does not capture every operation: smaller units can work from apartments, houses, hotels, offices or prisons, and can form part of larger, dispersed virtual networks. INTERPOL's March 2026 threat assessment likewise describes scam centres as a global, multi-crime threat involving trafficking, cybercrime, fraud and specialized money-laundering networks. [S1][S2]

**Core hypothesis:** a crackdown on a visible building may remove a node without removing the recruitment, financial, technical or social relationships that made the operation possible. This is a testable model, not proof that any specific network survived an enforcement action.

## Finding 1 — Trust may be more important than the job advert

The UN human-rights report *A Wicked Problem* (February 2026) reports that nearly three-quarters of victims in one quantitative study were recruited through a trusted source: 37% by someone they personally knew and trusted, and another 37% after first hearing about the job from a trusted person. A separate mixed-methods study of 62 survivors reported that 79% found the job through acquaintances. These are findings from particular studies cited by the report, not universal population estimates. [S3]

This challenges a common OSINT assumption: that the public post is the beginning of the recruitment chain.

**Investigative implication:** record the *trust path* as well as the advert path. Did a friend forward the post? Did a former colleague vouch for the recruiter? Was a relative or community intermediary involved? Was trust built through a gaming group, social account or earlier legitimate placement? A person who forwarded an advert may be an unwitting intermediary, a knowing recruiter, or something in between. Do not infer intent from the forwarding act alone.

**Safe collection fields:** relationship described by the source; whether the source personally knew the recruiter; what was promised; whether the intermediary had prior legitimate dealings; whether the intermediary knew the job was fraudulent; corroboration; and the survivor's consent/privacy limits.

## Finding 2 — The “compound” is not the only useful unit of analysis

The GI-TOC report and INTERPOL research describe diverse models, including smaller sites and dispersed operations. UNICRI's July 2026 initiative says evidence on scam-centre-style ecosystems in African countries remains fragmented across trafficking, cybercrime, law-enforcement and open-source records, and that these models may differ substantially from the large-compound model in Southeast Asia. [S1][S2][S4]

A network can therefore be missed if the analyst searches only for fenced compounds, large buildings, guards or one well-known location.

**Alternative units to test:** recruitment pipeline; service provider; payment route; script/template cluster; language-market team; employer façade; temporary worksite; or a recurring pattern of coercion. A small operation is not automatically part of a larger one, and a similar business model does not establish common ownership.

## Finding 3 — There are at least two victim populations, and the categories can overlap

INTERPOL describes a dual-victim model: people deceived and trafficked into forced online fraud, and people elsewhere defrauded by the operation. [S2]

Do not build a graph in which “scammer” automatically means willing offender. Equally, do not erase the harm suffered by fraud victims. Record separately:
- the observed act (message sent, account opened, payment moved);
- evidence of knowledge or intent;
- evidence of coercion, threats, debt or restricted movement;
- the person's control over devices, documents, money and ability to refuse;
- the source and limitations of each conclusion.

The same person can be exploited at one point in time and knowingly participate at another. The evidence must be time-specific.

## Finding 4 — Follow the financial service layer, not just the wallet

INTERPOL says scam operations increasingly cooperate with specialized money-laundering networks and intermediaries; its Operation Shadow Storm was announced as a cross-border effort to target scam-centre proceeds and related infrastructure. The OSCE's *Following the Money 2.0* examines how virtual assets can be misused in trafficking-related economies and calls for cooperation across financial and criminal-justice actors. [S2][S5]

**Analytical implication:** a crypto address is one possible lead, not the whole financial network. A sound public-source assessment should distinguish:
1. the address or account observed;
2. the transaction or payment record;
3. the service or exchange that may have processed it;
4. the real-world identity attributed to that service user;
5. the alleged role in the operation;
6. the legal record or corroboration supporting the attribution.

Each step needs its own source. Transaction proximity does not prove shared control, and an address label from an unverified database is not an identity.

**Boundary:** this dossier does not publish private wallet-owner details or provide instructions to evade financial controls. Preserve public transaction references and refer suspected criminal proceeds to the appropriate authorities or qualified investigators.

## Finding 5 — Geographic expansion can be real while individual links remain unproven

INTERPOL's 2026 assessment says victims from nearly 80 nationalities had been trafficked into online scam centres by late 2025, and describes reports of scam-centre activity in regions beyond Southeast Asia. The GI-TOC's 2026 report similarly examines models in four regions. These sources support a global risk picture; they do **not** show that every site or recruiter belongs to one centrally directed network. [S1][S2]

The Cambodia advert dataset described in September 2026 reporting showed a sharp increase in the share of location-stated advertisements referring to work outside Cambodia during the latest observation window. The report's author cautioned that collection became more thorough after mid-2025, limiting direct comparisons across the full period. [S6][S7]

**Correct interpretation:** possible geographic displacement and diversification deserve longitudinal testing. They are not proof of a single organization moving country to country.

## Finding 6 — The most dangerous blind spot is the difference between “not seen” and “not present”

Public-source research has unavoidable observation bias:
- platforms remove posts, restrict APIs or change search results;
- researchers' channel lists and language skills change over time;
- closed groups are not represented by public-post samples;
- survivors who can safely speak are not a random sample;
- official cases are selected by enforcement priorities and available evidence;
- a domain can be replaced while the same script or service is reused elsewhere;
- an operation may move to small, temporary sites that are harder to observe.

Therefore:
- absence of posts is not proof of shutdown;
- a drop in reports is not necessarily a drop in activity;
- an increase in discovered cases may reflect improved detection;
- a dataset of public adverts cannot measure the total number of victims or operators.

Every trend chart should show collection coverage, source changes, missing periods and a confidence note.

## A model that can be falsified

Treat the ecosystem as a set of layers, not one assumed hierarchy:

| Layer | Possible observable evidence | What the evidence does *not* prove alone |
|---|---|---|
| Trust/recruitment | Public adverts, referrals described in survivor testimony, recruiter communications | That the forwarder knew of the fraud |
| Travel/placement | Public travel offers, company filings, case records, corroborated testimony | That a travel provider knew the purpose |
| Worksite/control | Verified location records, testimony, official inspections or court exhibits | That every person at the site was coerced or culpable |
| Digital operations | Reused scripts, public domains, certificates, app handles, archived pages | Shared operator based on similarity alone |
| Payment/facilitation | Public court exhibits, sanctions, official financial notices, transaction records | Real-world identity from an address label alone |
| Management/ownership | Authenticated corporate records, communications, judicial findings | Ultimate beneficial control from a registered name alone |
| Protection/corruption | Specific official findings, authenticated payments or communications, corroborated reporting | Guilt based on political ties, geography or rumour |

### Three competing hypotheses

- **H1 — Common control:** multiple visible entities are coordinated by the same controller or group.
- **H2 — Shared ecosystem:** independent groups reuse recruiters, templates, service providers or laundering services without one common command structure.
- **H3 — Superficial similarity:** apparent links result from generic scripts, common platforms, copied content or researcher selection bias.

Do not default to H1 because it produces the most dramatic graph. Start with H2 and H3 as live alternatives and seek evidence that discriminates between them.

## Practical collection protocol

For each item, preserve:
- stable record ID;
- original URL or public post ID;
- publication and collection timestamps in UTC where possible;
- language and translation method;
- source class and independence;
- exact claim supported;
- archived copy or screenshot where lawful and safe;
- hash of a locally preserved file when integrity matters;
- missingness, collection failures and platform changes;
- alternative explanation;
- whether a human victim could be identified from publication.

For translated or transliterated names, keep the original script and transliteration variants; do not merge records on approximate phonetic similarity alone. For images, reverse-image matches are leads; inspect date, context, licensing and the earliest accessible source. For public corporate records, distinguish the legal entity, director, shareholder, registered agent and ultimate beneficial owner.

### Minimum edge standard

An edge in the network graph must have:
1. source;
2. exact relation claimed;
3. time interval;
4. confidence;
5. alternative explanation;
6. falsifier or missing evidence.

A shared press release, nationality, language, hosting provider, generic job title or common cryptocurrency exchange is not by itself a relationship edge.

## Prioritized next investigations

1. **Reproduce the OHCHR trust-path finding** from the report's cited studies and document each study's sample, country, dates and limitations before comparing percentages.
2. **Compare large compounds with dispersed models** using GI-TOC, INTERPOL and UNICRI material; build a taxonomy without assuming a single command structure.
3. **Create a financial-evidence matrix** for public cases: transaction claim, source, chain/account, service intermediary, attributed owner, legal status and gaps. Do not publish private victim identifiers.
4. **Audit temporal coverage** of the 4,991-ad recruitment dataset: collection intensity by month, language, channels, deduplication and changes in classification.
5. **Add a false-link test to every case:** what would make the apparent connection disappear? Examples include recycled content, shared hosting, copied templates, name collision or independent use of the same recruiter platform.
6. **Use official court and agency records for named-person claims**; label press reports and research datasets according to their source and status.
7. **Keep a victim-protection review** before publishing any location, handle, phone number, image, route or testimony that could expose a survivor or an uninvolved person.

## Sources

**[S1]** Global Initiative Against Transnational Organized Crime (GI-TOC), *A World of Deceit: Mapping the landscape of the global scam-centre phenomenon*, March 2026.  
https://globalinitiative.net/wp-content/uploads/2026/03/Kristina-Amerhauser-Alex-Goodwin-A-world-of-deceit-Mapping-the-landscape-of-the-global-scam-centre-phenomenom-GI-TOC-March-2026.pdf

**[S2]** INTERPOL, *Global Financial Fraud Threat Assessment 2026*, 16 March 2026.  
https://www.interpol.int/News-and-Events/News/2026/INTERPOL-report-warns-of-increasingly-sophisticated-global-financial-fraud-threat

**[S3]** Office of the UN High Commissioner for Human Rights (OHCHR), *A Wicked Problem: Seeking Human Rights-Based Solutions to Trafficking into Cyber Scam Operations in South-East Asia*, February 2026.  
https://bangkok.ohchr.org/reports/wicked-problem-seeking-human-rights-based-solutions-trafficking-cyber-scam-operations

**[S4]** United Nations Interregional Crime and Justice Research Institute (UNICRI), “World Day against Trafficking in Persons: UNICRI Launches Research on Emerging Scam-Centre-Style Ecosystems in Africa,” 30 July 2026.  
https://www.unicri.org/index.php/news/world-day-against-trafficking-persons-unicri-launches-research-scam-centre-style-ecosystems-africa

**[S5]** Organization for Security and Co-operation in Europe (OSCE), *Following the Money 2.0 — A collaborative approach to human trafficking investigations involving virtual assets*, 16 March 2026.  
https://cthb.osce.org/cthb/662782

**[S6]** ABC News, “Job listings show Cambodia's scam industry persists despite crackdown,” 25 September 2026. Reporting on a researcher's public Telegram-ad dataset and its limitations.  
https://www.abc.net.au/news/2026-09-25/cambodia-scam-industry-job-advertisements/107185964

**[S7]** CamboJA News, “Cambodia Scam Recruitment Continued Despite Closure Claim, Researcher Says,” 18 September 2026.  
https://cambojanews.com/cambodia-scam-recruitment-continued-despite-closure-claim-researcher-says/

## Final assessment

The overlooked object is not necessarily a secret mastermind. It may be the **shared service layer and trust infrastructure** connecting otherwise separate actors: a trusted introducer, a travel broker, a script kit, a rented site, a payment intermediary and a coercive manager. That model is analytically more useful than forcing all cases into one conspiracy theory because it can identify genuine connections while allowing independent actors and false links to remain separate.

**Publication rule:** a network diagram is a hypothesis made visible—not proof. Every edge must be sourced, time-bounded, challengeable and safe to publish.
