const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const mockUser = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'jeff@defense.gov',
  password: '12345',
};
const badUser = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'jeff@education.gov',
  password: '12345',
};
const mockUserSignIn = { email: 'jeff@defense.gov', password: '12345' };

describe('users routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST /api/v1/users creates a new user', async () => {
    const resp = await request(app).post('/api/v1/users').send(mockUser);
    expect(resp.status).toBe(200);
    const { firstName, lastName, email } = mockUser;
    expect(resp.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('POST /api/v1/users throws error if @defense.gov email is not used', async () => {
    const resp = await request(app).post('/api/v1/users').send(badUser);
    expect(resp.status).toBe(403);
  });

  it('POST /api/v1/users/sessions logs in an existing user and creates cookie', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const resp = await request(app)
      .post('/api/v1/users/sessions')
      .send(mockUserSignIn);
    expect(resp.status).toEqual(200);
  });

  it('DELETE /sessions deletes the user session', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send(mockUserSignIn);
    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
    const getResp = await agent.get('/api/v1/secrets');
    expect(getResp.status).toEqual(401);
  });

  afterAll(() => {
    pool.end();
  });
});
