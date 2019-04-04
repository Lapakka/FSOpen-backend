const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const postsRouter = require('./controllers/posts');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const config = require('./utils/config');

mongoose
  .connect(config.mongoUrl, { useNewUrlParser: true })
  .then( () => {
    console.log('connected to database', config.mongoUrl);
  })
  .catch( err => {
    console.log(err);
  });

app.use(cors());
app.use(bodyParser.json());
app.use(middleware.tokenExtractor);

app.use('/api/blogs', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

server.on('close', () => {
  mongoose.connection.close();
});

module.exports = {
  app, server
};