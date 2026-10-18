# Backend structure

```text
src/
  server.js                 Starts the HTTP server; exports app for compatibility
  app.js                    Express setup, security middleware and route mounting
  config/database.js        MySQL connection pool
  middleware/
    auth.js                 JWT generation and authentication guard
    async-handler.js        Forwards async route errors to Express
    error-handler.js        Consistent validation, database and AI error responses
  routes/
    health.js               Database health check
    auth.js                 Registration, login, profile and language preference
    diagnoses.js            Photo analysis, translation and saved diagnoses
    cases.js                Farmer cases, officer feedback and re-analysis
    analytics.js            Aggregate statistics and drill-down records
  services/plant-analysis.js Groq vision request and response validation
  validation/image.js       Shared photo request schema
  create-officer.js          Officer account command
  create-role.js             Officer/researcher account command
  init-db.js                 Database initialization command
  check-groq.js              Groq configuration diagnostic command
test/
  api-structure.test.js      HTTP authentication and validation smoke checks
```

Run commands from `backend` so the existing `.env` is loaded:

```sh
npm run dev
npm test
```

If the environment blocks test-worker processes (`spawn EPERM`), run the smoke
test in the current process with `node test/api-structure.test.js`.

API paths, request bodies and responses are preserved. Add endpoints to the
relevant route module. Share reusable AI logic through services, request schemas
through validation, and cross-cutting request behavior through middleware.

The smoke test does not connect to MySQL or call Groq. Database operations, AI
requests and mobile workflows still require integration testing with configured
services.
