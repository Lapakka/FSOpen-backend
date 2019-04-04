const postsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

postsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', { _id: 1, username: 1, name: 1 });
    response.json(blogs);
  } catch (exception) {
    response.status(500).json({ error: 'getting the items failed' });
  }
});

postsRouter.get('/:id', async (request, response) => {
  try {
    const blogItem = await Blog.findById(request.params.id);
    if (blogItem) {
      response.json(blogItem);
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    response.status(400).json({ error: 'invalid id' });
  }
});

postsRouter.post('/', async (request, response) => {
  try {
    const body = request.body;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'Missing or invalid token' });
    }
    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'No title or URL' });
    }
    if (body.likes === undefined) {
      body.likes = 0;
    }

    const user = await User.findById(decodedToken.id);

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    });

    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();                              // Save the blog ID to the user's blogs

    response.json(savedBlog);

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message });
    } else {
      response.status(500).json({ error: 'bad request' });
    }
  }
});

postsRouter.delete('/:id', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'Missing or invalid token' });
    }

    const blog = await Blog.findById(request.params.id);

    if ( blog.user._id.toString() !== decodedToken.id) {
      return response.status(401).json({ error: 'Post removal is allowed only to the original poster' });
    }

    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message });
    } else {
      response.status(400).json({ error: 'invalid id' });
    }
  }
});

postsRouter.put('/:id', async (request, response) => {
  try {
    const blog = {
      likes: request.body.likes
    };
    const updatedBlog = await Blog.findOneAndUpdate({ _id: request.params.id }, blog, { new: true });
    response.json(updatedBlog);
  } catch (exception) {
    response.status(400).json({ error: 'invalid id' });
  }
});

module.exports = postsRouter;