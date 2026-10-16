# Functional + usability test execution sheet (NOT YET EXECUTED)

Run these steps on a real Android handset and record actual outcomes. Do not submit imagined pass results.

| ID | Requirement | Steps | Expected outcome | Actual outcome | Result |
|---|---|---|---|---|---|
| TC01 | UR01, UR02 | Farmer logs in and captures photo | Camera permission and image preview | ______ | Not run |
| TC02 | UR03 | Upload existing crop photo | Photo preview is displayed | ______ | Not run |
| TC03 | UR04–UR06 | Analyze image with valid configured vision API | Model result and appropriately labelled uncertainty displayed | ______ | Not run |
| TC04 | UR07–UR08 | Open resulting record | Suggestions, symptoms and expert option shown | ______ | Not run |
| TC05 | UR09 | Save via analyze, view record list | New record appears in MySQL-backed list | ______ | Not run |
| TC06 | UR09 | Mark record resolved and reopen | Updated status retained | ______ | Not run |
| TC07 | UR09 | Delete a selected record | Record removed; other users' records unaffected | ______ | Not run |
| TC08 | UR10 | Farmer submits a case | Case appears in officer board | ______ | Not run |
| TC09 | UR10 | Officer enters diagnosis/treatment/instructions | Farmer sees submitted feedback | ______ | Not run |
| TC10 | UR11 | Switch home screen English ↔ Sinhala | Home copy changes; other screens remain partial | ______ | Not run |
| TC11 | UR13 | Disable network and try analysis | Explicit network/error feedback; no fake success | ______ | Not run |
| TC12 | Security | Access officer analytics with farmer credentials | API denies request with HTTP 403 | ______ | Not run |
| TC13 | Analytics | Review officer dashboard after submitting cases | Metrics reflect MySQL data | ______ | Not run |
| TC14 | Security | Attempt duplicate registration | Clear conflict message | ______ | Not run |

## Usability: minimum five real/proxy participants
Recruit 5 participants representing farmers, gardeners and an officer/proxy. Each does: scan/upload, interpret result, find expert support, retrieve saved record, (officer) review case. Record time/task completion, mistakes, self-reported satisfaction, observations, consent, and prioritized fixes. Include unedited evidence in the appendix. Never fabricate participant data.

## System validation checklist
- [ ] MySQL server started; Workbench SQL applied
- [ ] API `/api/health` connects to real DB
- [ ] expo packages installed, TypeScript check passes
- [ ] Android build starts without crash
- [ ] Physical camera/gallery permissions pass
- [ ] Vision API accepts configured model and image
- [ ] Farmer/officer role split checked
- [ ] 5-person usability study completed and findings incorporated
- [ ] Final report and GitHub commit history reviewed by group
