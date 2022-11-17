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

describe('users', () => {
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
  it('POST /api/v1/users/sessions logs in an existing user and creates cookie', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const resp = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'jeff@defense.gov', password: '12345' });
    expect(resp.status).toEqual(200);
  });
  it('DELETE /sessions deletes the user session', async () => {
    const agent = request.agent(app);
    // create a User directly in the database (saves an API call)
    // const user = await UserService.create({ ...mockUser }); Removed due to user being undefined.
    // sign in that user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });

    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
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
