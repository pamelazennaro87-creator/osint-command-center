# Digital Trafficking — Comparative Case Matrix

**Research cutoff:** 2026-10-28  
**Purpose:** Compare publicly documented digital-recruitment and exploitation cases without collapsing separate investigations into one alleged network.  
**Method:** Source-led OSINT. This is not a law-enforcement database and does not establish guilt beyond what a cited official record states.

## 1. Comparative matrix

| Case / source | Recruitment surface | Reported route / geography | Exploitation or downstream crime | Publicly named people / entities | Evidence status and limits |
|---|---|---|---|---|---|
| **Case 003-A — false job advertisements linked to scam compounds**; FBI IC3, 22 May 2023 | Social media and online employment sites; offers for tech support, call-centre/customer service and beauty roles; high pay, travel and accommodation promises | Southeast Asia is the regional context; this source is a typology alert, not a single victim itinerary | Reported forced online investment/cryptocurrency fraud; coercion, threats and restriction of movement described in the alert | No specific recruiter or victim identified by this alert | Strong evidence that the pattern is officially documented; not evidence against any specific advert, account, employer or person. Source: [FBI IC3 alert](https://www.ic3.gov/PSA/2023/PSA230522) |
| **Case 004 — Telegram channel / Cambodia scam compound**; U.S. DOJ, 23 Apr 2026 | Telegram job channel; advertised high-paying jobs, “American” accents and night shifts aligned to U.S. daytime; some posts sought attractive female candidates | Recruitment channel → Cambodia; compound described as rural and near the Thai border. The release does not provide a complete route for each recruit | Workers reportedly held against their will and forced to conduct law-enforcement impersonation fraud; WhatsApp and Microsoft Teams used in downstream pressure on fraud targets | Telegram channel (not named in the release); compound described geographically, not independently identified here | Confirmed as an official DOJ announcement/seizure; underlying channel data is not independently reproduced. Do not merge this channel with the separately mentioned 503 seized domains without a specific evidentiary link. Source: [DOJ, 23 Apr 2026](https://www.justice.gov/usao-dc/pr/scam-center-strike-force-takes-major-actions-against-southeast-asian-scam-centers-targeting) |
| **Case 004-B — Shunda compound prosecution context**; same DOJ release | Recruitment and management inside a scam-compound operation; exact recruitment channels are not fully detailed in the cited passage | Burma/Myanmar → Cambodia → Thailand is reported for the two named defendants' movements after the compound was seized; this is not a victim-trafficking route map | Forced workers allegedly used in cryptocurrency investment fraud; one American target reportedly lost over USD 3 million | DOJ names **Huang** and **Jiang** in its public release. Use full identities, charges, case numbers and status only after checking linked charging documents/court records. The DOJ states they were arrested on immigration charges in Thailand in early 2026; do not describe them as convicted on the basis of this release alone. | Officially reported law-enforcement account. Keep this case analytically separate from the Telegram-channel seizure unless primary evidence establishes a link. Source: [DOJ release](https://www.justice.gov/opa/pr/scam-center-strike-force-takes-major-actions-against-southeast-asian-scam-centers-targeting) |
| **Case 003-B — subscription-content exploitation / “e-pimping”**; INTERPOL, 19 Jun 2026 | Social media, encrypted messaging, purported modelling/talent agencies and subscription platforms | INTERPOL reports an international pattern across seven participating European countries; its public release does not provide a complete individual travel itinerary | Deceptive recruitment, account control, retention of earnings and coercion to produce increasingly explicit content are described as the modus operandi | The public release reports 18 suspect profiles and 27 potential-victim leads, but does not publicly name those people in the article | Officially reported operational leads, not proof against any specific profile. Do not attempt to deanonymize potential victims. Source: [INTERPOL CyberProtect III](https://www.interpol.int/News-and-Events/News/2026/Police-hackathon-identifies-sexual-exploitation-networks-on-content-subscription-sites) |
| **Case 005 — Operation Global Chain 2026**; INTERPOL, 6 Jul 2026 | Multiple recruitment mechanisms; official summary includes deceptive overseas job offers | INTERPOL reports a Brazil-linked network trafficking people to Cambodia for forced online scamming; the public summary reports 406 victims identified in the Brazil operation, including 83 Brazilians and 323 foreign nationals | Forced online scam work; related investigations and international notices | Public summary does not name the suspects in this example | Use as a route lead for source expansion, not as proof that all Brazil–Cambodia movement follows the same path. Distinguish rescued/identified victims, suspects, persons of interest and wanted persons. Source: [INTERPOL Operation Global Chain](https://www.interpol.int/News-and-Events/News/2026/Over-1-000-arrested-in-global-crackdown-on-human-trafficking-networks) |

## 2. Initial route hypotheses to investigate

These are **research leads**, not asserted routes for every victim or a single unified network.

1. **Online advert → private messaging → travel to Cambodia → scam compound**  
   Anchor: DOJ's Telegram-channel seizure. Missing for a route-level reconstruction: original channel identifier/URL, preserved advert samples, travel origin(s), dates, intermediary identities, transport records and independently corroborated destination evidence.

2. **Burma/Myanmar scam compound → Cambodia → Thailand**  
   Anchor: DOJ's account of Huang and Jiang's movements following seizure of the Shunda compound. This is a reported movement of named defendants, not automatically the route used by trafficked workers.

3. **Brazil → Cambodia (reported trafficking-for-forced-scamming lead)**  
   Anchor: INTERPOL's Operation Global Chain public summary. Need country-specific police/prosecutor records, dates, origin/destination evidence and case identifiers before drawing detailed edges.

4. **Online recruiter → purported modelling agency → subscription platform → account/earnings control**  
   Anchor: INTERPOL CyberProtect III. This is an operational pathway, not necessarily a physical cross-border travel route.

## 3. Entity register: what we will record next

Create one record per entity and one record per relationship. Never merge people because names, aliases, profile photos or handles look similar.

| Field | Recording rule |
|---|---|
| Entity ID | Stable internal ID, e.g. `P-001`, `ORG-001`, `ACC-001`, `IP-001`, `ROUTE-001` |
| Entity type | Person, organisation, platform account, domain, IP address, phone, wallet, location, transport segment, case or legal notice |
| Canonical name / alias | Record spelling variants separately; state who published the alias and when |
| Affiliation | Only when a primary record or independent corroboration supports the relationship; distinguish alleged, reported, confirmed and disputed |
| Route edge | Origin → transit point → destination, with event date/range, source and confidence; do not infer a route from nationality alone |
| IP / domain / account | Include observation timestamp, source, technical context and whether the indicator is shared, dynamic, VPN/proxy, hosting or otherwise ambiguous |
| Wanted / suspect status | Record issuing authority, notice type, date, jurisdiction and exact status. “Wanted”, “suspect”, “charged”, “arrested” and “convicted” are not interchangeable |
| Evidence | Source URL, archived copy where lawful, capture date, relevant excerpt, hash where appropriate, corroboration and contradiction |
| Confidence | High / medium / low with explicit rationale; confidence applies to a particular claim, not to a person globally |
| Privacy / safety | Do not publish victim identities, private contact details, home addresses, credentials, or unverified allegations. Keep sensitive leads out of the public repository |

## 4. IP-address handling — strict attribution rules

An IP address is an infrastructure indicator, not a person. A public IP may belong to a VPN, proxy, cloud host, carrier-grade NAT, shared hosting provider, compromised router or innocent subscriber. For each IP, preserve:

- the exact public source and timestamp (including timezone);
- the relationship being claimed (e.g. domain resolved to IP at time T, or an official filing associated the IP with an event);
- historical DNS / certificate / hosting evidence and its time range, if available;
- ASN / provider and geolocation as contextual metadata only;
- alternative explanations and a confidence rating.

Do not publish an IP as “the trafficker's IP” without a reliable, case-specific attribution source. Do not scan or access systems without authorization.

## 5. Wanted-person and alias verification

Priority sources: official police or prosecutor releases, court filings, official national wanted-person pages and INTERPOL public notices. An absence from public notices is not proof that a person is not wanted; many notices are not public. Capture the notice date and status as-of date. If a public notice is withdrawn or a charge is dismissed, update the record and preserve the historical state.

Do not scrape or republish leaked personal data. Do not create a public accusation from an unverified alias, username, photograph or name collision.

## 6. Working rules and stop conditions

- **Separate cases until a link is evidenced.** Similar tactics, shared countries or a common app do not prove common command or affiliation.
- **No nationality-based inference.** Nationality, migration status, language or ethnicity does not imply participation in crime.
- **No victim exposure.** Victim identities and identifying details are excluded from the public report.
- **No unsupported gang attribution.** A group label is included only when attributed to an official record or multiple independent sources; do not assign a gang name from rumor or an operation codename.
- **No false precision.** If the source reports only a region, map the region—not an invented airport, border crossing or intermediate stop.
- **Legal status must be dated.** Allegation, investigation, arrest, charge, conviction and wanted notice must remain distinct.
- **Contradictions are first-class evidence.** Record sources that disagree instead of silently choosing the most dramatic version.

## 7. Source register

1. **U.S. DOJ**, “Scam Center Strike Force Takes Major Actions Against Southeast Asian Scam Centers Targeting Americans,” 23 Apr 2026 (updated 24 Apr 2026).  
   https://www.justice.gov/opa/pr/scam-center-strike-force-takes-major-actions-against-southeast-asian-scam-centers-targeting
2. **FBI IC3**, “The FBI Warns of False Job Advertisements Linked to Labor Trafficking at Scam Compounds,” 22 May 2023.  
   https://www.ic3.gov/PSA/2023/PSA230522
3. **INTERPOL**, “Police ‘hackathon’ identifies sexual exploitation networks on content subscription sites,” 19 Jun 2026.  
   https://www.interpol.int/News-and-Events/News/2026/Police-hackathon-identifies-sexual-exploitation-networks-on-content-subscription-sites
4. **INTERPOL**, “Over 1,000 arrested in global crackdown on human trafficking networks,” 6 Jul 2026.  
   https://www.interpol.int/News-and-Events/News/2026/Over-1-000-arrested-in-global-crackdown-on-human-trafficking-networks
5. **OSCE**, “Cyber Scam Centres: Trafficking in Human Beings for Forced Criminality” (2026 assessment).  
   https://cthb.osce.org/sites/default/files/documents/publications/2026/04/Cyber%20Scam_Screen_260429.pdf

## 8. Next deliverables

1. **Route dossiers:** one file per route/case, with a dated event table and a map only where the source supports the geography.
2. **Entity register:** people, organisations, aliases, domains, IPs and public case identifiers, each with provenance and confidence.
3. **Legal-status register:** named suspects/defendants and wanted persons from official public records only, with jurisdiction and as-of date.
4. **Relationship graph:** every edge must point to one or more source-backed claims; unsupported links stay visibly marked as hypotheses.
