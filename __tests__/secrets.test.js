const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const mockUser = {
  email: 'jeff@defense.gov',
  password: '1234',
  firstName: 'Jeff',
  lastName: 'Acciaioli',
};

const mockSecret = {
  title: 'who ate my cookies?',
  description:
    '$1 MIL to expose the cookie thief. They were literally there this morning.',
};

const mockUserSignIn = {
  email: 'jeff@defense.gov',
  password: '1234',
};

describe('secrets routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it(' /api/v1/secrets should return a 401 if not authenticated', async () => {
    const resp = await request(app).get('/api/v1/secrets');
    expect(resp.status).toEqual(401);
  });

  it('GET /api/v1/secrets should return the a list of secrets if authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/users').send(mockUser);
    await agent.post('/api/v1/users/sessions').send(mockUserSignIn);
    // await agent.post('/api/v1/secrets').send(mockSecret);
    const getResp = await agent.get('/api/v1/secrets');
    expect(getResp.status).toEqual(200);
    expect(getResp.body[0]).toHaveProperty('id', '1');
    expect(getResp.body[0]).toHaveProperty('title', 'cat food thief');
    expect(getResp.body[0]).toHaveProperty(
      'description',
      'Someone keeps steeling the cat food!'
    );
    expect(getResp.body[0]).toHaveProperty('createdAt');
  });

  it('POST /api/v1/secrets should create a new secret if authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/users').send(mockUser);
    await agent.post('/api/v1/users/sessions').send(mockUserSignIn);
    const res = await agent.post('/api/v1/secrets').send(mockSecret);
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('title');
  });

  afterAll(() => {
    pool.end();
  });
});
