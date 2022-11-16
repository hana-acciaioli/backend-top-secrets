const bcrypt = require('bcrypt');
const { User } = require('../models/User');

module.exports = class UserService {
  static async create({ firstName, lastName, email, password }) {
    console.log('userservice at your service', password);
    console.log('salt_rounds', process.env.SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    console.log('anything');
    const user = await User.insert({
      firstName,
      lastName,
      email,
      passwordHash,
    });
    console.log('user down at the bottom', user);
    return user;
  }
};
