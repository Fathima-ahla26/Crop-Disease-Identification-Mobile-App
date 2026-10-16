# WE_178 Milestone 03 — Workload and requirement mapping

Source: group Milestone 01 and 02 reports and Assignment 3 guidelines. Each member must personally review, implement, commit, explain and test their assigned interfaces.

| Member | Milestone 02 assigned interfaces | Connected implementation routes | Requirements |
|---|---|---|---|
| IT21377730 Ameen F.A. | Farmer Home, Navigation, Plant Identification | `home`, `smart-scan`, `photo-guides` | UR01–UR03, UR12–UR14 |
| IT22101174 Nirmani A.K.G.B. | Diagnosis Results, Language Preference, Treatment Guidance | `live-result`, `treatment-plan`, header language controls on prototype | UR04–UR08, UR11 |
| IT21179358 Silva G.S.T. | Saved Diagnoses, Expert Consultation, Case Status | `records`, `submit-case`, `case-board`, `case-detail` | UR09–UR10 |
| IT22606310 Lakshan A.W.A. | Officer Dashboard, Expert Diagnosis, Outbreak Analytics | `case-board`, `case-detail`, `outbreak-analytics` | expert support / extended Milestone 02 |

## Current deviations to discuss in report
- The production flow uses authenticated MySQL records, not prototype sample or temporary data.
- An officer must be provisioned on the backend, not chosen during self-registration.
- The dashboard analytics displays real totals by detected disease instead of fabricated geographic clusters. District-level risk classifications are **not implemented**.
- Live result presents uncalibrated model-reported confidence as *estimated*, not an authoritative disease probability.
- Farmer home has an English/Sinhala local toggle; app-wide translations and Tamil are **not implemented** yet.
- Some original prototype pages remain in `src/app` for comparison, but linked production screens are documented above.

## Important rubric observation
Assignment 3 requires **at least two working CRUD operations per assigned interface**. This project has real database CRUD spread across the feature flows (diagnoses CREATE/READ/UPDATE/DELETE; cases CREATE/READ; officer reviews CREATE/UPDATE). Some purely display/navigation interfaces do not individually perform two CRUD operations. Review this issue with the coordinator before claiming full rubric compliance.
