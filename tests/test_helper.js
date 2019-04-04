const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'Testing blog',
    author: 'Tenno Clock',
    url: 'https://testing.test',
    likes: 3
  },
  {
    title: 'Dummy Item',
    author: 'John Dough',
    url: 'http://www.dum.exe',
    likes: 0
  },
  {
    title: 'Filler',
    author: 'Slap Hood',
    url: 'https://www.yahoo.com',
    likes: 1
  }
];

const format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    id: blog._id
  };
};

const noIdFormat = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  };
};

const blogsInDb = async () => {         // get all blog items from database
  const blogs = await Blog.find({});
  return blogs.map(format);
};

const nonExistingId = async () => {     // generate a valid id to test nonexisting blog item
  const blog = new Blog();
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users;
};

const createTestUser = async () => {
  const testuser = {
    username: 'testuser',
    password: 'test'
  };
  await User.remove();
  const user = new User({
    username: testuser.username,
    password: testuser.password
  });
  await user.save();
  return testuser;
};

module.exports = {
  initialBlogs, noIdFormat, blogsInDb, nonExistingId, usersInDb, createTestUser
};