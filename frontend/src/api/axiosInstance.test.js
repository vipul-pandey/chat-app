import api, { acceptLogin, logout } from './axiosInstance';
import { readUser } from './session';
let mockAdapter;
jest.mock('axios', () => {
  const actual = jest.requireActual('axios').default;
  return { __esModule: true, default: { create: (options) => actual.create({ ...options, adapter: (config) => mockAdapter(config) }) } };
});
const fail = (config, status, code) => Promise.reject({ config, response: { status, data: { code } } });
const ok = (config, data = {}) => Promise.resolve({ config, status: 200, data });
beforeEach(() => { localStorage.clear(); acceptLogin({ _id: 'user', token: 'old' }); });

test('concurrent expired requests refresh once and retry with latest token', async () => {
  let refreshes = 0;
  mockAdapter = (config) => {
    if (config.url.endsWith('/refresh')) {
      refreshes++;
      return new Promise((resolve) => setTimeout(() => resolve({ config, status: 200, data: { token: 'new' } }), 10));
    }
    if (config.headers.Authorization === 'Bearer old') return fail(config, 401, 'TOKEN_EXPIRED');
    expect(config.headers.Authorization).toBe('Bearer new');
    return ok(config);
  };
  await Promise.all([api.get('/api/chat'), api.put('/api/chat/mark-as-seen', {})]);
  expect(refreshes).toBe(1);
  expect(readUser().token).toBe('new');
});
test('expired refresh clears login', async () => {
  mockAdapter = (c) => fail(c, 401, c.url.endsWith('/refresh') ? 'SESSION_EXPIRED' : 'TOKEN_EXPIRED');
  await expect(api.get('/api/chat')).rejects.toBeDefined();
  expect(readUser()).toBeNull();
});
test('refresh service outage preserves login', async () => {
  mockAdapter = (c) => c.url.endsWith('/refresh') ? fail(c, 503) : fail(c, 401, 'TOKEN_EXPIRED');
  await expect(api.get('/api/chat')).rejects.toBeDefined();
  expect(readUser().token).toBe('old');
});
test('invalid credentials do not trigger refresh', async () => {
  let calls = 0;
  mockAdapter = (c) => { calls++; return fail(c, 401); };
  await expect(api.post('/api/user/login', {})).rejects.toBeDefined();
  expect(calls).toBe(1);
});
test('second 401 stops retrying', async () => {
  let calls = 0;
  mockAdapter = (c) => { calls++; return c.url.endsWith('/refresh') ? ok(c, { token: 'new' }) : fail(c, 401, 'TOKEN_EXPIRED'); };
  await expect(api.get('/api/chat')).rejects.toBeDefined();
  expect(calls).toBe(3);
  expect(readUser()).toBeNull();
});
test('logout revokes session before clearing local login', async () => {
  mockAdapter = (c) => { expect(c.url).toBe('/api/user/logout'); expect(c.withCredentials).toBe(true); expect(readUser()).not.toBeNull(); return ok(c); };
  await logout();
  expect(readUser()).toBeNull();
});
test('late refresh cannot restore login after logout', async () => {
  let finish, started;
  const ready = new Promise((resolve) => { started = resolve; });
  mockAdapter = (c) => {
    if (c.url.endsWith('/logout')) return ok(c);
    if (c.url.endsWith('/refresh')) { started(); return new Promise((resolve) => { finish = () => resolve({ config: c, status: 200, data: { token: 'new' } }); }); }
    return fail(c, 401, 'TOKEN_EXPIRED');
  };
  const pending = api.get('/api/chat');
  await ready;
  await logout();
  finish();
  await expect(pending).rejects.toBeDefined();
  expect(readUser()).toBeNull();
});
test('late 401 from a previous login cannot clear the new login', async () => {
  let rejectRequest, started;
  const ready = new Promise((resolve) => { started = resolve; });
  mockAdapter = (c) => { started(); return new Promise((resolve, reject) => { rejectRequest = () => reject({ config: c, response: { status: 401, data: { code: 'TOKEN_INVALID' } } }); }); };
  const pending = api.get('/api/chat');
  await ready;
  acceptLogin({ _id: 'different-user', token: 'different-token' });
  rejectRequest();
  await expect(pending).rejects.toBeDefined();
  expect(readUser().token).toBe('different-token');
});
