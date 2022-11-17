const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
// const UserService = require('../lib/services/UserService.js');

const mockUser = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'jeff@defense.gov',
  password: '12345',
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
    await agent.post('/api/v1/users').send({
      email: 'jeff@defense.gov',
      password: '1234',
      firstName: 'Jeff',
      lastName: 'Acciaioli',
    });
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'jeff@defense.gov', password: '1234' });

    await agent.post('/api/v1/secrets').send({
      title: 'who ate my cookies?',
      description:
        '$1 MIL to expose the cookie thief. They were literally there this morning.',
    });
    const getResp = await agent.get('/api/v1/secrets');
    expect(getResp.status).toEqual(200);
  });
  it('POST /api/v1/secrets should create a new secret if authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/users').send({
      email: 'jeff@defense.gov',
      password: '1234',
      firstName: 'Jeff',
      lastName: 'Acciaioli',
    });
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'jeff@defense.gov', password: '1234' });
    const res = await agent.post('/api/v1/secrets').send({
      title: 'who ate my cookies?',
      description:
        '$1 MIL to expose the cookie thief. They were literally there this morning.',
    });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('title');
  });
  afterAll(() => {
    pool.end();
  });
});
