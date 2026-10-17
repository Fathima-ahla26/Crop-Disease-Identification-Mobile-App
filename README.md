# CropCare — Plant Disease Identification Mobile App

IT3060 Milestone 03 implementation extension of the uploaded group's Expo/React Native prototype. Existing original screens/designs are retained where possible; new server-backed screens provide functioning photo capture, records and expert case management. **This is an integration candidate, not a validated submission.**

## 1. Required software
- Node.js 20+ and npm
- MySQL Server 8+ and MySQL Workbench
- Expo Go on your phone (or Android emulator)
- Internet + a compatible image-vision API key **only if you want actual AI analysis**

## 2. Create the database using MySQL Workbench
Alternatively, after configuring `backend/.env` and installing backend dependencies, run `cd backend` then `npm run db:init`. This creates the configured database and missing tables without deleting existing data. MySQL must be running and the configured user must have permission to create the database/tables.

1. Open Workbench and connect to your MySQL server.
2. Open `backend/sql/schema.sql` and execute the complete file using the lightning button.
3. Confirm the `cropcare` schema and `users`, `diagnoses`, `expert_cases`, `expert_reviews` tables exist.

## 3. Start API
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set DB_PASSWORD, JWT_SECRET (min 32 random characters), and GROQ_API_KEY.
npm run dev
```
On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Verify from the development computer: `http://localhost:4000/api/health` should return `{ "ok": true, "database": "connected" }`.

IMPORTANT: The example model ID may not be supported by your account in 2026. Select an **actually available vision-compatible Groq vision model** and set `GROQ_MODEL` in `.env`. The API request will fail if the selected model is unavailable. Never put a secret API key in the mobile source code or commit `.env`.

### Add an agricultural officer account
```bash
cd backend
node src/create-officer.js "Demo Officer" officer@example.com "A-strong-password-123"
```
Replace demo credentials before any non-demo deployment. The app's normal registration is farmer-only; officer access cannot be granted by self-registering.

## 4. Start mobile app
Open a separate terminal in the project root:
```bash
npm install
npx expo install expo-image-picker
```
Create a root `.env` containing:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000
```
Replace `192.168.1.50` with your computer's LAN IPv4 address (`ipconfig` on Windows). Phone and PC must be on the same Wi-Fi, and Windows Firewall must allow port 4000. Android emulator commonly uses `10.0.2.2:4000` instead; **localhost does not work from a real phone**.
```bash
npx expo start -c
```
Login via `Get Started → Sign in` or `/secure-auth`. Register a farmer, scan a real image at `Smart Scan`, see the saved result, submit a case; login using the officer account on a different session to review it.

## What is connected
- `POST /api/auth/register` and `/login`: hashed password, JWT, role-aware account
- `POST /api/diagnoses/analyze`: vision-model request, saves the response and photo into MySQL
- `GET/PATCH/DELETE /api/diagnoses`: read, update status, delete
- `POST/GET /api/cases`: farmer submits case and views their own cases
- `PATCH /api/cases/:id/review`: officer confirms diagnosis and sends instructions
- `GET /api/analytics`: real server-side totals, accessible to officers
- Photo capture/upload, responsive record list, case management, officer feedback and photo guidance screens.

**AI safety:** If no GROQ_API_KEY is configured, the system explicitly stores `Assessment unavailable`, not a fake diagnosis. Generic vision models are not validated agronomy classifiers and any model-provided confidence is *not calibrated*. Confirm uncertain diagnoses with agricultural officers. Do not rely on this for chemical/pesticide dosing.

## Prototype vs implementation
The original code contained hard-coded demo results, sample disease entries, in-memory registration and several mock screens. Those original prototype screens are kept to preserve workload/history; the new production-flow screens are `secure-auth`, `smart-scan`, `live-result`, `submit-case`, `records`, `case-board`, `case-detail`, `photo-guides`. Existing `home` now links to the real flow; old routes are retained for comparison. `login` delegates to secure authentication. Document these changes as deviations in your Milestone 03 report.

## Validation and submission readiness
**Not yet validated:** npm dependency installation/typecheck, build on an actual Android device, physical phone camera, MySQL connectivity in your environment, Groq account/model availability, group members' complete workload requirements, 5-participant usability tests, final APK and viva. These require your team and development machine. Do not label the app, reports or test logs as verified until your team actually tests them.

Keep this work in your group's GitHub repository with meaningful individual commits. The assignment explicitly requires the submitted work to be the group's own; everyone should understand, review, integrate and test their assigned code.

## October 2026 WE_178 UI integration notes
- Farmer Home updated with a stronger scan-first hero, card-based shortcuts, real recent scan data and local EN/SI copy.
- Added `outbreak-analytics` officer route with database-backed summary cards and disease frequency bars.
- Live result renders the actual saved leaf photo (stored in MySQL `image_data`).
- Reviewed group Milestone 01/02 material; see `docs/GROUP-WORKLOAD-TRACEABILITY.md` and `docs/FUNCTIONAL-TEST-PLAN.md`.
- Important: UI copy outside home is not fully Sinhala/Tamil; no report export, district maps or confirmed disease classifier are claimed.
- npm install was unavailable in the offline build environment; this ZIP was **not** verified by `tsc` or a physical device.

## October patch — role separation and scan UI
- The Scan screen now has photo capture/gallery/preview/analyze without a manually selected crop. DB crop is `Unspecified` until a model identifies a crop; do not treat it as classified.
- A missing Groq key now returns HTTP 503 instead of saving a fake assessment. Check `backend/.env` for `GROQ_API_KEY`, supported vision-capable `GROQ_MODEL`, and backend logs. API availability and the model must be verified in your own environment.
- `researcher` is a separate role. Create researcher accounts **manually** in MySQL via a secure admin process (never expose a public role picker). Researcher sees aggregate analytics, not individual farmer cases.
- Run `backend/sql/migrate-existing.sql` **once** if your MySQL database was created before this patch. For a fresh database, only run `schema.sql`. Back up the database before migration.
- Language preference now persists server-side (`PATCH /api/me/language`). The farmer home has English/Sinhala translations, but complete UI translation into three languages is NOT implemented.
- `PATCH /api/cases/:id/archive` is officer-only. It archives a case, preserving it in SQL. An archive button has not yet been added to the officer UI.
- `EXPO_PUBLIC_API_URL` should be explicitly set to the correct backend address (web localhost; real phone PC LAN IP).
- Remaining work: integration tests, officer archive UI, personalized disease management, validated model confidence, researcher-specific research workflows, and a full real-device test.

### Provisioning authorized roles
```bash
cd backend
node src/create-role.js officer "Demo Officer" officer@example.com "ChangeThisPassword123"
node src/create-role.js researcher "Demo Researcher" researcher@example.com "ChangeThisPassword123"
```
Do not use these literal example passwords for real accounts. Role creation requires database credentials and is not offered to farmer self-registration.


## GroqCloud AI integration (October 2026)
The photo analysis endpoint now uses `https://api.groq.com/openai/v1/chat/completions` with a vision-capable Groq model. No frontend/database migration is required for this change.

1. In `backend`, copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`). Do not overwrite an existing configured `.env`; edit it instead.
2. Put `GROQ_API_KEY=your-real-groqcloud-key` in `backend/.env`, and `GROQ_MODEL=qwen/qwen3.6-27b`. The model must actually be available to your Groq account; consult https://console.groq.com/docs/vision and your Groq model list.
3. Keep `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, etc. correct. Restart backend: `npm run dev`.
4. Check `http://localhost:4000/api/health`, then login in the app, upload a leaf image, and press Analyze. Backend logs report Groq upstream HTTP errors without exposing API keys.
5. Do NOT put `GROQ_API_KEY` in the Expo root `.env` or any `EXPO_PUBLIC_*` variable; API secrets stay in `backend/.env` only.

This is generic visual screening, not a validated disease classifier. The model's self-reported confidence is uncalibrated. Use expert confirmation for consequential disease treatment decisions. No real Groq key was available to test authenticated requests in this environment.
