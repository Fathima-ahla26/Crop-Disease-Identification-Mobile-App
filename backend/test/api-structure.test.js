import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { app } from '../src/app.js';
import { db } from '../src/config/database.js';

test('API routes preserve authentication and input validation after modularization', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const protectedRoutes = [
      ['GET','/api/me'], ['PATCH','/api/me/language'],
      ['POST','/api/diagnoses/analyze'], ['POST','/api/diagnoses/1/translate'],
      ['GET','/api/diagnoses'], ['GET','/api/diagnoses/1'],
      ['PATCH','/api/diagnoses/1'], ['DELETE','/api/diagnoses/1'],
      ['POST','/api/cases'], ['GET','/api/cases'], ['GET','/api/cases/1'],
      ['POST','/api/cases/1/reanalyze'], ['PATCH','/api/cases/1/review'],
      ['DELETE','/api/cases/1/review'], ['PATCH','/api/cases/1'],
      ['DELETE','/api/cases/1'], ['PATCH','/api/cases/1/archive'],
      ['GET','/api/analytics'], ['GET','/api/analytics/records'],
    ];
    for (const [method,route] of protectedRoutes) {
      const response = await fetch(base+route,{method});
      assert.equal(response.status,401,`${method} ${route}`);
      assert.deepEqual(await response.json(),{error:'Login required'});
    }
    for (const route of ['/api/auth/login','/api/auth/register']) {
      const response = await fetch(base+route,{
        method:'POST', headers:{'Content-Type':'application/json'}, body:'{}',
      });
      assert.equal(response.status,400,route);
      assert.equal((await response.json()).error,'Invalid input');
    }
  } finally {
    await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    await db.end();
  }
});
