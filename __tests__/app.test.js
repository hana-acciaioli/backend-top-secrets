const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
// const UserService = require('../lib/services/UserService.js'); removed because 'user' was undefined

const mockUser = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'test@test.com',
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
      .send({ email: 'test@test.com', password: '12345' });
    expect(resp.status).toEqual(200);
  });
  it('DELETE /sessions deletes the user session', async () => {
    const agent = request.agent(app);
    // create a User directly in the database (saves an API call)
    // const user = await UserService.create({ ...mockUser });
    // sign in that user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });

    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
  });
  afterAll(() => {
    pool.end();
  });
});
