# Milestone 03 checklist (complete with authentic evidence)

## Assignment-specific items
- [ ] Obtain Milestone 01 requirements, each of the four members' workloads, and complete Milestone 02 high-fidelity prototype.
- [ ] Review original and added screens against prototype, record every deviation and its reason.
- [ ] Review CRUD coverage **per assigned interface**; this requirement cannot be certified from screenshots alone.
- [ ] Confirm backend and MySQL Workbench import; test register/login, diagnosis creation/list/update/delete, case creation/list, expert review/update.
- [ ] Configure a supported vision-capable API model or implement an offline validated ML classifier. Record failure/uncertainty behavior.
- [ ] Complete representative farmer/officer navigation and appropriate authorization checks.
- [ ] Capture real screenshots of implemented features, server logs and actual test results.
- [ ] Execute at least 5 consented real/proxy user usability sessions; record participant tasks, timings and observations without fabricating data.
- [ ] Create and run functional test cases + requirements → prototype → implementation → test traceability matrix.
- [ ] Fix recorded usability defects and document before/after screenshots.
- [ ] Write combined maximum 35-page report (excluding references and appendix) across Milestones 01–03.
- [ ] Provide GitHub repository, README and installable APK; have all four members individually demonstrate their assigned work in viva.

## Suggested functional test scenarios (NOT executed)
| ID | Requirement / feature | Action | Expected outcome | Actual result |
|---|---|---|---|---|
| FT01 | Farmer register | Enter valid name/email/password | New farmer saved to MySQL | Not tested |
| FT02 | Duplicate email | Register email twice | HTTP 409 | Not tested |
| FT03 | Login | Correct vs incorrect password | Auth vs 401 | Not tested |
| FT04 | Photo selection | Grant then deny permission | Image/permission message | Not tested |
| FT05 | Vision analysis | Submit supported leaf image | Persist model result | Not tested |
| FT06 | Missing API key | Analyze with no key | Explicit unavailable result | Not tested |
| FT07 | Read records | Open saved records | Own records only | Not tested |
| FT08 | Update diagnosis | Toggle resolved/pending | Persist change | Not tested |
| FT09 | Delete diagnosis | Confirm deletion | Record removed | Not tested |
| FT10 | Create expert case | Enter notes/location | Case submitted | Not tested |
| FT11 | Officer review | Log in officer, submit feedback | Case marked reviewed | Not tested |
| FT12 | Access control | Farmer tries officer review | HTTP 403 | Not tested |
| FT13 | Case privacy | Farmer lists cases | Only own cases | Not tested |
| FT14 | Backend unavailable | Stop API | Visible connection error | Not tested |

## Usability testing form
Participant pseudonym: __; role: Farmer / Officer / Proxy; consent: __;
Tasks: sign in, take/upload leaf photo, understand result, save/update record, submit/review expert case.
Capture task success, time, errors, 1–5 ease-of-use rating, spoken feedback and resulting fixes.

## Report sections
Executive summary; Milestone 01 problem/stakeholders/research/requirements; Milestone 02 sketches/wireframes/prototypes; stack rationale; system architecture; implementation/screenshots; traceability matrix; functional results; usability plan/results; defects/fixes; Gantt chart; conclusion; references and appendices.
