const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Sessions = require('../models/refreshSessionModel');
const { hashToken } = require('../config/refreshSession');
const { protect } = require('../middleware/authMiddleware');
const routes = require('../routes/userRoutes');
const { errorHandler } = require('../middleware/errorMiddleware');

process.env.JWT_SECRET = 'test-only-secret-not-for-production';
process.env.NODE_ENV = 'production';

test('login, expiry, refresh, revocation and authorization lifecycle', async (t) => {
  const sessions = new Map();
  const user = { _id: '507f1f77bcf86cd799439011', name: 'Test', email: 'test@example.test',
    matchPassword: async (password) => password === 'correct' };
  let databaseFailure = false;
  User.findOne = async () => user;
  User.findById = () => ({ select: async () => {
    if (databaseFailure) throw new Error('Database unavailable');
    return user;
  } });
  Sessions.create = async (session) => { sessions.set(session.tokenHash, session); return session; };
  Sessions.deleteOne = async ({ tokenHash }) => sessions.delete(tokenHash);
  Sessions.findOne = async ({ tokenHash, expiresAt }) => {
    const session = sessions.get(tokenHash);
    return session && session.expiresAt > expiresAt.$gt ? session : null;
  };
  const app = express();
  app.use(express.json());
  app.use('/api/user', require('../middleware/sessionSecurity').authRequestGuard, routes);
  let writes = 0;
  app.post('/protected', protect, (req, res) => { writes++; res.json({ ok: true }); });
  app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (url, body = {}, headers = {}) => fetch(base + url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ChatApp', ...headers }, body: JSON.stringify(body),
  });
  assert.equal((await post('/api/user/refresh', {}, { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await post('/api/user/refresh', {}, { 'X-Requested-With': '' })).status, 403);
  let response = await post('/api/user/login', { email: user.email, password: 'wrong' });
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('set-cookie'), null);
  response = await post('/api/user/login', { email: user.email, password: 'correct' });
  assert.equal(response.status, 200);
  const login = await response.json();
  const claims = jwt.verify(login.token, process.env.JWT_SECRET);
  assert.equal(claims.exp - claims.iat, 900);
  const setCookie = response.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/api/user']) assert.ok(setCookie.includes(flag));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const cookie = setCookie.split(';')[0];
  const rawToken = cookie.split('=')[1];
  assert.ok(sessions.has(hashToken(rawToken)));
  assert.ok(!JSON.stringify([...sessions.values()]).includes(rawToken));
  assert.equal(login.refreshToken, undefined);

  const expired = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: -1 });
  response = await post('/protected', {}, { Authorization: `Bearer ${expired}` });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'TOKEN_EXPIRED');
  assert.equal(writes, 0);
  response = await post('/api/user/refresh', {}, { Cookie: cookie });
  assert.equal(response.status, 200);
  const renewed = await response.json();
  response = await post('/protected', {}, { Authorization: `Bearer ${renewed.token}` });
  assert.equal(response.status, 200);
  assert.equal(writes, 1);

  databaseFailure = true;
  response = await post('/protected', {}, { Authorization: `Bearer ${renewed.token}` });
  assert.equal(response.status, 500);
  response = await post('/api/user/refresh', {}, { Cookie: cookie });
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('set-cookie'), null);
  databaseFailure = false;

  response = await fetch(base + '/api/user/another-user', {
    method: 'PUT', headers: { Authorization: `Bearer ${renewed.token}`, 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(response.status, 403);
  response = await fetch(base + '/api/user/' + user._id, { method: 'PUT' });
  assert.equal(response.status, 401);

  sessions.get(hashToken(rawToken)).expiresAt = new Date(Date.now() - 1);
  response = await post('/api/user/refresh', {}, { Cookie: cookie });
  assert.equal(response.status, 401);
  assert.ok(response.headers.get('set-cookie').includes('Expires=Thu, 01 Jan 1970'));
  sessions.get(hashToken(rawToken)).expiresAt = new Date(Date.now() + 60000);
  response = await post('/api/user/logout', {}, { Cookie: cookie });
  assert.equal(response.status, 204);
  response = await post('/api/user/refresh', {}, { Cookie: cookie });
  assert.equal(response.status, 401);
  response = await post('/api/user/refresh', {}, { Cookie: 'chat_refresh=invalid' });
  assert.equal(response.status, 401);
  response = await post('/api/user/refresh');
  assert.equal(response.status, 401);
});
