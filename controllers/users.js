const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  try {
    const users = await User
      .find({})
      .populate('blogs', { _id: 1, likes: 1, author: 1, title: 1, url: 1 });
    response.json(users.map(User.format));
  } catch (exception) {
    response.status(500).json({ error: 'Getting the users failed' });
  }
});

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body;

    const existingUser = await User.find({ username: body.username });
    if (existingUser.length > 0) {
      return response.status(400).json({ error: 'Username must be unique' });
    }
    if (body.password.length < 3) {
      return response.status(400).json({ error: 'Password has to be over 3 characters long' });
    }
    if (!body.adult) {
      body.adult = true;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      adult: body.adult,
      passwordHash
    });

    const savedUser = await user.save();

    response.json(savedUser);
  } catch (exception) {
    response.status(500).json({ error: 'Request failed' });
  }
});

module.exports = usersRouter;