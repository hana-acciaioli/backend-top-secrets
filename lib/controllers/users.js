const { Router } = require('express');
const UserService = require('../services/UserService');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    console.log('what is up', req.body);
    const user = await UserService.create(req.body);
    console.log('user in controller', user);
    res.json(user);
  } catch (e) {
    next(e);
  }
});
